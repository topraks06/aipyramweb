import { adminDb } from '../../lib/firebase-admin';

/**
 * MALIYE BAKANI (Finance Minister) v2.0
 * Bütçe aşımını engelleyen Otonom Devre Kesici (Circuit Breaker).
 */
export class FinanceMinister {
  private static MAX_MONTHLY_BUDGET = 20.0; // 20 USD Hard Limit
  private static ECONOMIC_THRESHOLD = 15.0; // 15 USD Soft Limit (Ekonomik Mod)

  static getMonthId() {
    const d = new Date();
    return `${d.getFullYear()}_${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  static getDayId() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Sisteme acil durum (kaçak) alarmı bırakır ve kilitler.
   */
  private static async triggerAnomalyAlert(agentName: string, reason: string, estimatedCost: number) {
    if (!adminDb) return;
    const alertMsg = `🚨 ALARM: ${agentName} anormal davranış sergiledi. Nedeni: ${reason}. Olası $${estimatedCost.toFixed(2)} maliyet KAÇAĞI engellendi. Sistem kilitlendi.`;
    console.error(`[MALIYE BAKANI - KAÇAK KALKANI] ${alertMsg}`);
    try {
      await adminDb.collection('aloha_system_alerts').add({
        agent: agentName,
        reason,
        prevented_cost: estimatedCost,
        message: alertMsg,
        timestamp: new Date().toISOString(),
        status: 'UNRESOLVED'
      });
      // Sistemi tamamen kilitliyoruz
      const monthId = this.getMonthId();
      await adminDb.collection('aloha_finance').doc(`budget_${monthId}`).set({ 
        locked: true, 
        locked_reason: alertMsg,
        locked_at: new Date().toISOString() 
      }, { merge: true });
    } catch (e) {
      console.error('Alarm kaydedilemedi:', e);
    }
  }

  /**
   * Sistem kilitliyken "Oto-İyileşme (Auto-Heal)" yapılıp yapılamayacağını kontrol eder.
   */
  private static async attemptAutoHeal(docData: any, docRef: any): Promise<boolean> {
    if (!docData.locked || !docData.locked_at) return false;

    const lockedAt = new Date(docData.locked_at);
    const now = new Date();
    const reason = docData.locked_reason || '';

    let shouldUnlock = false;
    let healMessage = '';

    // 1. Anti-Loop Kilitlenmesi: 60 Dakika Soğuma Süresi
    if (reason.includes('Anti-Loop')) {
      const minutesPassed = (now.getTime() - lockedAt.getTime()) / 60000;
      if (minutesPassed >= 60) {
        shouldUnlock = true;
        healMessage = `♻️ OTO-İYİLEŞME: Spam tehlikesi geçti (${Math.floor(minutesPassed)} dk). Sistem otonom olarak tekrar başlatıldı.`;
      }
    }
    // 2. Günlük Hard Cap Kilitlenmesi: Gece Yarısı Sıfırlaması
    else if (reason.includes('Hard Cap')) {
      if (now.getDate() !== lockedAt.getDate() || now.getMonth() !== lockedAt.getMonth()) {
        shouldUnlock = true;
        healMessage = `♻️ OTO-İYİLEŞME: Yeni güne girildi. Ajan kotaları sıfırlandı. Sistem başlatıldı.`;
      }
    }
    // 3. Genel Aylık Limit
    else if (reason.includes('Aylık bütçe limitine')) {
      if (now.getMonth() !== lockedAt.getMonth()) {
        shouldUnlock = true;
        healMessage = `♻️ OTO-İYİLEŞME: Yeni aya girildi. Bütçe sıfırlandı. Sistem başlatıldı.`;
      }
    }
    // NOT: Spike Guard gibi tehlikeli durumlar oto-iyileşmez (human intervention required).

    if (shouldUnlock) {
      console.log(`[MALIYE BAKANI] ${healMessage}`);
      await docRef.set({ locked: false, locked_reason: null, locked_at: null }, { merge: true });
      if (adminDb) {
        await adminDb.collection('aloha_system_alerts').add({
          agent: 'FinanceMinister',
          reason: 'Auto-Heal Protocol',
          message: healMessage,
          timestamp: now.toISOString(),
          status: 'RESOLVED'
        });
      }
      return true; // Başarıyla iyileşti
    }
    
    return false; // Hâlâ kilitli
  }

  /**
   * Bir göreve başlamadan önce Maliye Bakanından "Ödenek ve Bütçe Onayı" alır.
   * Kalan bütçe yetersizse veya kilitlenmişse hata fırlatarak çalışmayı durdurur.
   */
  static async requestBudget(estimatedCostUSD: number, taskName: string): Promise<boolean> {
    if (!adminDb) return true; // Local bypass if no adminDb

    // 1. SPIKE GUARD (Ani Tüketim Kalkanı)
    if (estimatedCostUSD >= 1.0) {
      await this.triggerAnomalyAlert(taskName, 'Spike Guard (Tek Seferde $1+ Talep)', estimatedCostUSD);
      throw new Error(`[MALIYE BAKANI] 🛑 REDDEDILDI: Anormal Tüketim Engellendi ($${estimatedCostUSD}).`);
    }

    const monthId = this.getMonthId();
    const docRef = adminDb.collection('aloha_finance').doc(`budget_${monthId}`);

    try {
      const doc = await docRef.get();
      let currentSpend = 0;
      let history: any[] = [];
      
      if (doc.exists) {
        currentSpend = doc.data()?.total_spend_usd || 0;
        history = doc.data()?.history || [];
        if (doc.data()?.locked) {
          // Oto-İyileşme şansımız var mı?
          const healed = await this.attemptAutoHeal(doc.data(), docRef);
          if (!healed) {
            throw new Error(`[MALIYE BAKANI] 🛑 SISTEM KILITLI: Bütçe aşımı tehlikesi veya Kaçak Kalkanı nedeniyle yetkiler donduruldu.`);
          }
        }
      }

      // 2. ANTI-LOOP GUARD (Hız ve Tekrar Kalkanı - Son 5 Dakikada 10+ İstek)
      const fiveMinsAgo = new Date(Date.now() - 5 * 60000).toISOString();
      const recentRequests = history.filter(h => h.task === taskName && h.timestamp > fiveMinsAgo);
      if (recentRequests.length >= 10) {
         await this.triggerAnomalyAlert(taskName, 'Anti-Loop Guard (5 Dakikada 10+ İstek)', estimatedCostUSD);
         throw new Error(`[MALIYE BAKANI] 🛑 REDDEDILDI: Sonsuz Döngü / Spam Tespiti.`);
      }

      // 3. AGENT HARD CAP (Ajan Bazlı Günlük Sınır)
      const todayIso = new Date().toISOString().split('T')[0];
      const todaySpendForTask = history
         .filter(h => h.task === taskName && h.timestamp.startsWith(todayIso))
         .reduce((sum, h) => sum + (h.cost || 0), 0);
         
      const agentDailyCap = taskName.includes('ImageAgent') ? 0.50 : 0.20; // ImageAgent $0.50, diğerleri max $0.20/gün
      
      if (todaySpendForTask + estimatedCostUSD > agentDailyCap) {
         await this.triggerAnomalyAlert(taskName, `Agent Hard Cap Aşıldı (Günlük $${agentDailyCap} Limiti)`, estimatedCostUSD);
         throw new Error(`[MALIYE BAKANI] 🛑 REDDEDILDI: Ajan kendi günlük limitini ($${agentDailyCap}) doldurdu.`);
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

  /**
   * Sistemin güncel bütçe modunu döndürür.
   * NORMAL: Bütçe %80'in altında.
   * ECONOMIC: Bütçe %80 ile %100 arasında (Acil tasarruf).
   * LOCKED: Bütçe %100'ü aştı (Tamamen durduruldu).
   */
  static async getSystemMode(): Promise<'NORMAL' | 'ECONOMIC' | 'LOCKED'> {
    if (!adminDb) return 'NORMAL';
    try {
      const doc = await adminDb.collection('aloha_finance').doc(`budget_${this.getMonthId()}`).get();
      if (!doc.exists) return 'NORMAL';
      
      const currentSpend = doc.data()?.total_spend_usd || 0;
      
      if (doc.data()?.locked) {
        // Mode sorulduğunda da auto-heal tetikleyelim ki UI da kilitli kalmasın
        const healed = await this.attemptAutoHeal(doc.data(), adminDb.collection('aloha_finance').doc(`budget_${this.getMonthId()}`));
        if (!healed) return 'LOCKED';
      }

      if (currentSpend >= this.MAX_MONTHLY_BUDGET) return 'LOCKED';
      if (currentSpend >= this.ECONOMIC_THRESHOLD) return 'ECONOMIC';
      return 'NORMAL';
    } catch {
      return 'NORMAL';
    }
  }

  /**
   * Günlük üretim kotalarını ve mevcut durumunu döndürür.
   * Ekonomik moda girildiğinde kotalar otomatik olarak düşer.
   */
  static async getDailyQuotas() {
    const mode = await this.getSystemMode();
    
    // Temel hedefler: Günde 4 Altın Haber, 12 Görsel, 4 İhale
    const quotas = {
      maxNews: mode === 'ECONOMIC' ? 2 : 4,
      maxImages: mode === 'ECONOMIC' ? 0 : 12,
      maxTenders: mode === 'ECONOMIC' ? 2 : 4,
      useProModel: mode === 'NORMAL', // Ekonomik modda Pro model kapatılır
      mode
    };

    // Güncel tüketimi kontrol et
    if (!adminDb) return { ...quotas, currentNews: 0, currentImages: 0, currentTenders: 0 };

    try {
      const today = this.getDayId();
      const statsDoc = await adminDb.collection('aloha_daily_stats').doc(today).get();
      const stats = statsDoc.exists ? statsDoc.data() : {};
      
      return {
        ...quotas,
        currentNews: stats?.articles_created || 0,
        currentImages: stats?.images_generated || 0,
        currentTenders: stats?.tenders_found || 0
      };
    } catch {
      return { ...quotas, currentNews: 0, currentImages: 0, currentTenders: 0 };
    }
  }
}
