import { adminDb } from '../../lib/firebase-admin';
import { SYSTEM_LAW } from './system_law';
import { v4 as uuidv4 } from 'uuid';

export interface UAPRequest {
  agent_id: string;
  project: string;
  task_type: string;
  data: any;
  metadata: {
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    cost_estimate: number;
  };
}

export interface UAPDecision {
  mode: 'normal' | 'economy' | 'critical';
  action: 'AUTO_SUCCESS' | 'PENDING_APPROVAL' | 'REJECT';
  reason?: string;
  transaction_id?: string;
}

export class AlohaRouter {
  // Varsayılan eşikler (Admin panelden Aloha'ya yazılarak Firebase üzerinden artırılabilir)
  private static readonly DEFAULT_THRESHOLDS = {
    normal: 20.0,  // 20$'a kadar normal
    economy: 50.0  // 50$'ı geçince critical
  };

  /**
   * Retrieves dynamic thresholds from Firestore
   */
  public static async getThresholds() {
    if (!adminDb) return this.DEFAULT_THRESHOLDS;
    try {
      const snap = await adminDb.collection('aloha_config').doc('thresholds').get();
      if (snap.exists) {
        return { ...this.DEFAULT_THRESHOLDS, ...snap.data() };
      }
    } catch(e) {}
    return this.DEFAULT_THRESHOLDS;
  }

  /**
   * Retrieves today's total accumulated AI costs from Firestore.
   */
  public static async getDailyCost(): Promise<number> {
    if (!adminDb) return 0;
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const costsSnap = await adminDb.collection('aloha_costs')
        .where('timestamp', '>=', startOfToday)
        .get();

      let totalCost = 0;
      costsSnap.forEach(doc => {
        totalCost += (doc.data().estimatedCost || 0);
      });

      return totalCost;
    } catch (e) {
      console.error('[AlohaRouter] Cost read error:', e);
      return 0;
    }
  }

  public static async getLearnedLesson(req: UAPRequest, mode: string) {
    if (!adminDb) return null;
    try {
      const patternId = `${req.task_type || 'unknown'}_${req.project || 'global'}_${mode}`.replace(/[^a-zA-Z0-9_]/g, '_');
      const snap = await adminDb.collection('aloha_lessons_learned').doc(patternId).get();
      if (snap.exists) return snap.data();
    } catch (e) {}
    return null;
  }

  /**
   * Brain processing logic for UAP Requests
   */
  public static async processRequest(req: UAPRequest): Promise<UAPDecision> {
    const dailyCost = await this.getDailyCost();
    const thresholds = await this.getThresholds();
    
    // Determine System Mode
    let mode: 'normal' | 'economy' | 'critical' = 'normal';
    if (dailyCost >= thresholds.economy) {
      mode = 'critical';
    } else if (dailyCost >= thresholds.normal) {
      mode = 'economy';
    }

    let { confidence, impact, cost_estimate } = req.metadata;

    // RLHF - Learning Layer Check (With Decay & Context)
    const lesson = await this.getLearnedLesson(req, mode);
    if (lesson) {
      const lastUpdated = lesson.updatedAt?.toDate ? lesson.updatedAt.toDate() : new Date(lesson.updatedAt || Date.now());
      const daysOld = (new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
      
      let weight = lesson.weight !== undefined ? lesson.weight : 1.0;
      if (daysOld > 7) {
        weight = weight * 0.5; // Zaman Aşınımı (Decay)
      }

      const approved = lesson.approved || 0;
      const rejected = lesson.rejected || 0;
      const ignored = lesson.ignored || 0;

      if (rejected >= 3 && weight > 0.6) {
        console.warn(`[AlohaRouter] 🛑 RLHF AUTO_REJECT (Pattern: ${lesson.pattern}, Rejected: ${rejected}, Weight: ${weight.toFixed(2)})`);
        return { mode, action: 'REJECT', reason: `Öğrenilmiş Kural (RLHF): Bu işlem paterni daha önce ${rejected} kez reddedildi. Oto-Reddedildi.` };
      }
      if (ignored >= 5 && weight > 0.6) {
        console.warn(`[AlohaRouter] 🗑️ RLHF AUTO_IGNORE (Pattern: ${lesson.pattern}, Ignored: ${ignored}, Weight: ${weight.toFixed(2)})`);
        return { mode, action: 'REJECT', reason: `Öğrenilmiş Kural (RLHF): Bu işlem paterni daha önce ${ignored} kez yoksayıldı. Sessizce düşürüldü.` };
      }
      if (approved >= 10 && weight > 0.7) {
        const oldConf = confidence;
        confidence = Math.min(1.0, confidence + 0.2);
        console.log(`[AlohaRouter] 📈 RLHF Boost (Pattern: ${lesson.pattern}, Approved: ${approved}, Weight: ${weight.toFixed(2)}). Güven artırıldı: ${oldConf} -> ${confidence}`);
      }
    }

    // Logic Tree
    let action: 'AUTO_SUCCESS' | 'PENDING_APPROVAL' | 'REJECT' = 'AUTO_SUCCESS';
    let reason = '';

    // 1. Critical Mode Blocking
    if (mode === 'critical' && impact !== 'high') {
      action = 'REJECT';
      reason = `Sistem CRITICAL modda (Cost: $${dailyCost.toFixed(3)}). Sadece 'high' impact işlere izin veriliyor.`;
    }
    // 2. Pending Approval Check
    else if (
      confidence < 0.75 ||
      impact === 'high' ||
      cost_estimate > 0.05 // Mikro maliyet patlamalarından koruma
    ) {
      action = 'PENDING_APPROVAL';
      reason = `Kritik Karar Filtresi: Güven (${(confidence * 100).toFixed(0)}%), Etki (${impact}), Maliyet ($${cost_estimate.toFixed(4)}).`;
    }

    const transaction_id = uuidv4();

    // If pending approval, push to aloha_inbox
    if (action === 'PENDING_APPROVAL') {
      if (adminDb) {
        await adminDb.collection('aloha_inbox').doc(transaction_id).set({
          ...req,
          transaction_id,
          status: 'PENDING_APPROVAL',
          mode,
          reason,
          created_at: new Date(),
        });
        console.warn(`[AlohaRouter] 🛡️ İşlem Inbox'a gönderildi. Neden: ${reason}`);
      }
    } else if (action === 'REJECT') {
      console.warn(`[AlohaRouter] 🛑 İşlem REJECT edildi. Neden: ${reason}`);
    } else {
      console.log(`[AlohaRouter] ✅ Otonom onay verildi. (Mod: ${mode}, Güven: ${confidence})`);
    }

    return {
      mode,
      action,
      reason,
      transaction_id,
    };
  }
}
