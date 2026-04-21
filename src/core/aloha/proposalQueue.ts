import { adminDb } from '@/lib/firebase-admin';

/**
 * ALOHA PROPOSAL QUEUE v2.0 — Production-Ready Onay Sistemi
 * 
 * v2.0 Eklemeler:
 * - Confidence Score (0-1)
 * - Dry-Run Mode
 * - Dedup koruması (aynı sorunu tekrar teklif etme)
 * - Cooldown (60sn)
 */

export interface AlohaProposal {
  id?: string;
  project: string;
  issueType: 'stale_content' | 'broken_image' | 'build_error' | 'missing_file' | 'seo_issue' | 'general';
  severity: 'critical' | 'warning' | 'info';
  confidence: number; // 0-1 arası: 0.8+ → opsiyonel oto, 0.5-0.8 → onay, <0.5 → sadece log
  title: string;
  description: string;
  proposedAction: string;
  toolToCall?: string;
  toolArgs?: Record<string, any>;
  status: 'pending' | 'approved' | 'dry-run' | 'dry-run-done' | 'rejected' | 'executed' | 'failed';
  mode: 'dry-run' | 'execute'; // Varsayılan: dry-run
  detectedAt: number;
  executedAt?: number;
  executionResult?: string;
  dryRunResult?: string;
  dedupKey?: string; // Tekrar engelleme anahtarı
}

const COLLECTION = 'aloha_proposals';
const COOLDOWN_MS = 60000; // 60 saniye — aynı teklifi tekrar atmayı engelle
const DEDUP_WINDOW_MS = 6 * 60 * 60 * 1000; // 6 saat — aynı sorunu tekrar teklif etme

export class ProposalQueue {
  /**
   * Yeni teklif ekle (Dedup + Cooldown korumalı)
   */
  async addProposal(proposal: Omit<AlohaProposal, 'id' | 'status' | 'detectedAt' | 'mode'>): Promise<string> {
    try {
      // DEDUP: Aynı proje + aynı issueType için son 6 saatte teklif var mı?
      const dedupKey = `${proposal.project}_${proposal.issueType}_${proposal.title.substring(0, 30)}`;
      const cutoff = Date.now() - DEDUP_WINDOW_MS;
      
      const existing = await adminDb.collection(COLLECTION)
        .where('dedupKey', '==', dedupKey)
        .where('detectedAt', '>', cutoff)
        .limit(1)
        .get();

      if (!existing.empty) {
        console.log(`[PROPOSAL QUEUE] ⏭️ Dedup: "${proposal.title}" son 6 saatte zaten teklif edilmiş. Atlanıyor.`);
        return '';
      }

      // CONFIDENCE FILTER: < 0.5 → sadece logla, teklif oluşturma
      if (proposal.confidence < 0.5) {
        console.log(`[PROPOSAL QUEUE] 📊 Düşük güven (${proposal.confidence}): "${proposal.title}" — Sadece log.`);
        // Self-learning metrik olarak kaydet
        await this.logMetric('low_confidence_skip', proposal.project, proposal.title);
        return '';
      }

      const docRef = await adminDb.collection(COLLECTION).add({
        ...proposal,
        status: 'pending',
        mode: 'dry-run', // Varsayılan: önce dry-run
        detectedAt: Date.now(),
        dedupKey,
      });
      console.log(`[PROPOSAL QUEUE] ✅ Yeni teklif (güven: ${proposal.confidence}): ${docRef.id} — ${proposal.title}`);
      return docRef.id;
    } catch (e: any) {
      console.error(`[PROPOSAL QUEUE] ❌ Teklif eklenemedi:`, e.message);
      return '';
    }
  }

  async getPendingProposals(): Promise<AlohaProposal[]> {
    try {
      const snap = await adminDb.collection(COLLECTION)
        .where('status', 'in', ['pending', 'dry-run-done'])
        .orderBy('detectedAt', 'desc')
        .limit(20)
        .get();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AlohaProposal));
    } catch (e: any) {
      console.error(`[PROPOSAL QUEUE] ❌ Teklifler çekilemedi:`, e.message);
      return [];
    }
  }

  async approveProposal(proposalId: string, mode: 'dry-run' | 'execute' = 'dry-run'): Promise<boolean> {
    try {
      await adminDb.collection(COLLECTION).doc(proposalId).update({
        status: mode === 'dry-run' ? 'dry-run' : 'approved',
        mode,
      });
      console.log(`[PROPOSAL QUEUE] ✅ Teklif ${mode === 'dry-run' ? 'DRY-RUN' : 'EXECUTE'} onayı: ${proposalId}`);
      return true;
    } catch (e: any) {
      console.error(`[PROPOSAL QUEUE] ❌ Onay hatası:`, e.message);
      return false;
    }
  }

  async rejectProposal(proposalId: string): Promise<boolean> {
    try {
      await adminDb.collection(COLLECTION).doc(proposalId).update({ status: 'rejected' });
      return true;
    } catch (e: any) {
      return false;
    }
  }

  async markDryRunDone(proposalId: string, dryRunResult: string): Promise<void> {
    try {
      await adminDb.collection(COLLECTION).doc(proposalId).update({
        status: 'dry-run-done',
        dryRunResult: dryRunResult.substring(0, 3000),
      });
    } catch (e: any) {
      console.error(`[PROPOSAL QUEUE] ❌ Dry-run sonucu yazılamadı:`, e.message);
    }
  }

  async markExecuted(proposalId: string, result: string, success: boolean): Promise<void> {
    try {
      await adminDb.collection(COLLECTION).doc(proposalId).update({
        status: success ? 'executed' : 'failed',
        executedAt: Date.now(),
        executionResult: result.substring(0, 2000),
      });
    } catch (e: any) {
      console.error(`[PROPOSAL QUEUE] ❌ Sonuç işaretlenemedi:`, e.message);
    }
  }

  async getApprovedProposals(): Promise<AlohaProposal[]> {
    try {
      const snap = await adminDb.collection(COLLECTION)
        .where('status', 'in', ['approved', 'dry-run'])
        .orderBy('detectedAt', 'asc')
        .limit(5)
        .get();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AlohaProposal));
    } catch (e: any) {
      return [];
    }
  }

  // ─── SELF-LEARNING METRİK ─────────
  private async logMetric(action: string, project: string, detail: string): Promise<void> {
    try {
      await adminDb.collection('aloha_metrics').add({
        action,
        project,
        detail: detail.substring(0, 200),
        timestamp: Date.now(),
      });
    } catch { /* sessiz */ }
  }
}

export const proposalQueue = new ProposalQueue();
