import { adminDb } from '@/lib/firebase-admin';
import crypto from 'crypto';

/**
 * ═══════════════════════════════════════════════════════════════
 *  LONG-RUNNING AGENT INBOX (Asynchronous Worker Queue)
 * ═══════════════════════════════════════════════════════════════
 * Q2 2026 Güncellemesi:
 * 20 saniyelik timeout limitine takılan görevleri (İhale takibi,
 * pazar araştırması, 30 günlük trend izleme vb.) yönetir.
 * 
 * Mantık: "Görev ver, unut. Ajan günlerce çalışsın, bitince Inbox'a düşsün."
 */

export interface LongRunningJob {
  jobId: string;
  agentId: string;
  taskDescription: string;
  context: Record<string, any>;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: any;
  createdAt: string;
  updatedAt: string;
  expectedCompletionTime?: string;
  subscriberEmail?: string;
}

/**
 * Uzun soluklu görev başlatır.
 * Ajan 3 gün sonra bitirse bile sonuç Firestore Inbox'ta bekler.
 */
export async function dispatchLongRunningTask(
  agentId: string,
  taskDescription: string,
  context: Record<string, any> = {},
  options?: { subscriberEmail?: string; maxDurationDays?: number }
): Promise<string> {
  const jobId = `job_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  
  const job: LongRunningJob = {
    jobId,
    agentId,
    taskDescription,
    context,
    status: 'queued',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subscriberEmail: options?.subscriberEmail,
  };

  if (options?.maxDurationDays) {
    const expected = new Date();
    expected.setDate(expected.getDate() + options.maxDurationDays);
    job.expectedCompletionTime = expected.toISOString();
  }

  if (adminDb) {
    await adminDb.collection('aloha_long_running_jobs').doc(jobId).set(job);
    console.log(`[📦 AGENT INBOX] Uzun soluklu görev kuyruğa alındı: ${jobId} (${agentId})`);
  } else {
    console.warn(`[📦 AGENT INBOX] Firebase Admin yok, görev simüle edildi: ${jobId}`);
  }

  return jobId;
}

/**
 * Kullanıcının veya sistemin bekleyen/tamamlanan uzun görevlerini listeler.
 */
export async function getInboxTasks(agentId?: string): Promise<LongRunningJob[]> {
  if (!adminDb) return [];
  
  let query: FirebaseFirestore.Query = adminDb.collection('aloha_long_running_jobs');
  
  if (agentId) {
    query = query.where('agentId', '==', agentId);
  }
  
  const snapshot = await query.orderBy('createdAt', 'desc').limit(50).get();
  
  return snapshot.docs.map(doc => doc.data() as LongRunningJob);
}

/**
 * Ajan arka planda işi bitirdiğinde sonucu Inbox'a yazar.
 */
export async function completeLongRunningTask(jobId: string, result: any, success: boolean = true): Promise<void> {
  if (!adminDb) return;
  
  await adminDb.collection('aloha_long_running_jobs').doc(jobId).update({
    status: success ? 'completed' : 'failed',
    result,
    updatedAt: new Date().toISOString(),
  });
  
  console.log(`[📦 AGENT INBOX] Görev tamamlandı: ${jobId}`);
  // TODO: Flash TTS veya Email/SMS ile kullanıcıya haber ver.
}
