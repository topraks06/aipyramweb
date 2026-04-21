/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  ALOHA BATCH JOB MANAGER                                      ║
 * ║  Cloud Run Jobs standardinda — Firestore-backed is kuyrugu    ║
 * ╚═══════════════════════════════════════════════════════════════╝
 * 
 * SORUN:
 *   131+ haberin toplu donusumu HTTP request icinde yapiliyordu.
 *   Cloud Run timeout (5dk) + bellek limiti = basarisiz islemler.
 * 
 * COZUM:
 *   Firestore-backed job queue. Her is birimi bagimsiz islenir.
 *   Paralel worker'lar batch halinde calisir. Durum takibi yapilir.
 *   Basarisiz isler otomatik retry alir (max 3).
 * 
 * KULLANIM:
 *   import { batchJobs } from './batchJobManager';
 *   const jobId = await batchJobs.createJob('trade_matrix_upgrade', articles);
 *   await batchJobs.processJob(jobId, async (item) => { ... });
 *   const status = await batchJobs.getJobStatus(jobId);
 */

import { adminDb } from '@/lib/firebase-admin';
import { dlq } from './dlq';

// ═══════════════════════════════════════
//  KONFIGÜRASYON
// ═══════════════════════════════════════

const BATCH_SIZE = 5;         // Paralel is sayisi
const MAX_RETRIES = 3;        // Basarisiz is icin max tekrar
const JOB_TIMEOUT_MS = 60000; // Tek is birimi icin max sure (60sn)
const COLLECTION_NAME = 'batch_jobs';
const ITEMS_SUBCOLLECTION = 'items';

// ═══════════════════════════════════════
//  TIPLER
// ═══════════════════════════════════════

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'partial';
export type ItemStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface BatchJob {
  id: string;
  type: string;               // 'trade_matrix_upgrade' | 'quality_fix' | 'embedding'
  status: JobStatus;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  skippedItems: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface BatchJobItem {
  id: string;
  status: ItemStatus;
  retryCount: number;
  data: Record<string, unknown>;  // Is verisi (articleId, title, vs.)
  result?: Record<string, unknown>;
  error?: string;
  lastAttemptAt?: string;
}

// ═══════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════

export const batchJobs = {
  /**
   * Yeni batch job olustur.
   * Items Firestore subcollection olarak yazilir.
   * 
   * @param type - Is tipi (ornek: 'trade_matrix_upgrade')
   * @param items - Is birimleri (her biri bir article/doc verisi)
   * @param metadata - Opsiyonel ek bilgi
   * @returns Job ID
   */
  async createJob(
    type: string,
    items: Record<string, unknown>[],
    metadata?: Record<string, unknown>
  ): Promise<string> {
    if (!adminDb) throw new Error('[BATCH] Firebase yok');
    if (items.length === 0) throw new Error('[BATCH] Bos is listesi');

    // Ana job dokumani
    const jobRef = adminDb.collection(COLLECTION_NAME).doc();
    const job: Omit<BatchJob, 'id'> = {
      type,
      status: 'pending',
      totalItems: items.length,
      completedItems: 0,
      failedItems: 0,
      skippedItems: 0,
      createdAt: new Date().toISOString(),
      metadata,
    };

    await jobRef.set(job);

    // Is birimlerini subcollection'a yaz (batch write ile)
    const batch = adminDb.batch();
    let batchCount = 0;

    for (let i = 0; i < items.length; i++) {
      const itemRef = jobRef.collection(ITEMS_SUBCOLLECTION).doc(`item_${i.toString().padStart(4, '0')}`);
      batch.set(itemRef, {
        status: 'pending' as ItemStatus,
        retryCount: 0,
        data: items[i],
      });
      batchCount++;

      // Firestore batch limit: 500
      if (batchCount >= 499) {
        await batch.commit();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    console.log(`[BATCH] Job olusturuldu: ${jobRef.id} (${items.length} is birimi, tip: ${type})`);
    return jobRef.id;
  },

  /**
   * Job'i isle — her is birimi icin worker fonksiyonunu cagir.
   * Promise.allSettled ile paralel (BATCH_SIZE kadar) calisir.
   * 
   * @param jobId - Islenecek job ID
   * @param worker - Her is birimi icin calistirilacak fonksiyon
   * @returns Job sonuc ozeti
   */
  async processJob(
    jobId: string,
    worker: (item: Record<string, unknown>, itemId: string) => Promise<Record<string, unknown> | void>
  ): Promise<{ completed: number; failed: number; skipped: number }> {
    if (!adminDb) throw new Error('[BATCH] Firebase yok');

    const jobRef = adminDb.collection(COLLECTION_NAME).doc(jobId);
    const jobSnap = await jobRef.get();
    if (!jobSnap.exists) throw new Error(`[BATCH] Job bulunamadi: ${jobId}`);

    // Status guncelle
    await jobRef.update({ status: 'running', startedAt: new Date().toISOString() });

    // Pending item'lari al (retry'a dusenler dahil)
    const itemsSnap = await jobRef.collection(ITEMS_SUBCOLLECTION)
      .where('status', 'in', ['pending', 'failed'])
      .limit(500)
      .get();

    const items = itemsSnap.docs.filter(d => {
      const data = d.data();
      return data.status === 'pending' || (data.status === 'failed' && data.retryCount < MAX_RETRIES);
    });

    console.log(`[BATCH] ${jobId}: ${items.length} is birimi isleniyor (batch=${BATCH_SIZE})`);

    let completed = 0;
    let failed = 0;
    let skipped = 0;

    // Batch halinde isle
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batchItems = items.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batchItems.map(async (doc) => {
          const itemData = doc.data();
          const itemRef = doc.ref;

          try {
            // Status: running
            await itemRef.update({ status: 'running', lastAttemptAt: new Date().toISOString() });

            // Worker calistir (timeout ile)
            const result = await Promise.race([
              worker(itemData.data, doc.id),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT')), JOB_TIMEOUT_MS)
              ),
            ]);

            // Basarili
            await itemRef.update({
              status: 'completed',
              result: result || {},
            });
            return 'completed';
          } catch (err: any) {
            const retryCount = (itemData.retryCount || 0) + 1;
            const newStatus: ItemStatus = retryCount >= MAX_RETRIES ? 'failed' : 'pending';

            await itemRef.update({
              status: newStatus,
              retryCount,
              error: err.message?.substring(0, 500) || 'Bilinmeyen hata',
            });

            if (newStatus === 'failed') {
              await dlq.recordSilent(err, 'batchJobManager', 'system');
            }

            return newStatus === 'failed' ? 'failed' : 'retry';
          }
        })
      );

      for (const r of results) {
        if (r.status === 'fulfilled') {
          if (r.value === 'completed') completed++;
          else if (r.value === 'failed') failed++;
        } else {
          failed++;
        }
      }

      // Progress log
      const progress = Math.round(((i + batchItems.length) / items.length) * 100);
      console.log(`[BATCH] ${jobId}: %${progress} (${completed} ok, ${failed} fail)`);
    }

    // Job sonucu guncelle
    const finalStatus: JobStatus = failed > 0 && completed > 0 ? 'partial'
      : failed > 0 ? 'failed'
      : 'completed';

    await jobRef.update({
      status: finalStatus,
      completedItems: completed,
      failedItems: failed,
      skippedItems: skipped,
      completedAt: new Date().toISOString(),
    });

    console.log(`[BATCH] ${jobId} TAMAMLANDI: ${completed} ok, ${failed} fail, ${skipped} skip`);
    return { completed, failed, skipped };
  },

  /**
   * Job durumunu sorgula
   */
  async getJobStatus(jobId: string): Promise<BatchJob | null> {
    if (!adminDb) return null;
    const snap = await adminDb.collection(COLLECTION_NAME).doc(jobId).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as BatchJob;
  },

  /**
   * Aktif/bekleyen job'lari listele
   */
  async listActiveJobs(): Promise<BatchJob[]> {
    if (!adminDb) return [];
    const snap = await adminDb.collection(COLLECTION_NAME)
      .where('status', 'in', ['pending', 'running', 'partial'])
      .limit(20)
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BatchJob));
  },
};
