import { adminDb } from '../../lib/firebase-admin';

/**
 * MALIYE BAKANI (Finance Minister) v1.0
 * Bütçe aşımını engelleyen Otonom Devre Kesici (Circuit Breaker).
 */
export class FinanceMinister {
  private static MAX_MONTHLY_BUDGET = 10.0; // 10 USD (tender-cycle ayda ~$4.20 harcıyor, $5 kilitlenme riski vardı)

  static getMonthId() {
    const d = new Date();
    return `${d.getFullYear()}_${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  /**
   * Bir göreve başlamadan önce Maliye Bakanından "Ödenek ve Bütçe Onayı" alır.
   * Kalan bütçe yetersizse veya kilitlenmişse hata fırlatarak çalışmayı durdurur.
   */
  static async requestBudget(estimatedCostUSD: number, taskName: string): Promise<boolean> {
    if (!adminDb) return true; // Local bypass if no adminDb

    const monthId = this.getMonthId();
    const docRef = adminDb.collection('aloha_finance').doc(`budget_${monthId}`);

    try {
      const doc = await docRef.get();
      let currentSpend = 0;
      
      if (doc.exists) {
        currentSpend = doc.data()?.total_spend_usd || 0;
        if (doc.data()?.locked) {
          throw new Error(`[MALIYE BAKANI] 🛑 SISTEM KILITLI: Bütçe aşımı tehlikesi nedeniyle yetkiler donduruldu.`);
        }
      }

      if (currentSpend + estimatedCostUSD > this.MAX_MONTHLY_BUDGET) {
        // Otomatik Kilitle
        await docRef.set({ locked: true, locked_at: new Date().toISOString() }, { merge: true });
        throw new Error(`[MALIYE BAKANI] 🛑 REDDEDILDI: Aylık bütçe limitine ($${this.MAX_MONTHLY_BUDGET}) ulaşıldı. Mevcut Harcama: $${currentSpend.toFixed(2)}. Görev (${taskName}) iptal edildi.`);
      }

      console.log(`[MALIYE BAKANI] 💵 ONAYLANDI: Görev '${taskName}' için $${estimatedCostUSD} bütçe ayrıldı.`);
      return true;
    } catch (error: any) {
      console.error(error.message);
      throw error;
    }
  }

  /**
   * Görev başarıyla bittikten sonra faturayı işler.
   */
  static async recordActualSpend(actualCostUSD: number, taskName: string) {
    if (!adminDb) return;

    const monthId = this.getMonthId();
    const docRef = adminDb.collection('aloha_finance').doc(`budget_${monthId}`);

    try {
      const doc = await docRef.get();
      const currentSpend = doc.exists ? (doc.data()?.total_spend_usd || 0) : 0;
      const history = doc.exists ? (doc.data()?.history || []) : [];

      await docRef.set({
        total_spend_usd: currentSpend + actualCostUSD,
        history: [...history, { task: taskName, cost: actualCostUSD, timestamp: new Date().toISOString() }],
        updated_at: new Date().toISOString(),
      }, { merge: true });

      console.log(`[MALIYE BAKANI] 🧾 FATURA İŞLENDİ: '${taskName}' harcaması: $${actualCostUSD}. Güncel Bütçe Sarfiyatı: $${(currentSpend + actualCostUSD).toFixed(2)}`);
    } catch (e: any) {
      console.error(`[MALIYE BAKANI] ❌ Fatura kayıt hatası:`, e.message);
    }
  }
}
