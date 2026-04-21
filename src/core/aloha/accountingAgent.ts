// ═══════════════════════════════════════════════════
// GOOGLE-NATIVE: Upstash Redis → Firestore
// Anayasa: Sadece Google altyapısı.
// ═══════════════════════════════════════════════════

/**
 * 🏛️ V9.5 THE FISCAL GUARDIAN (Muhasebe Ajanı)
 * Sistemin vicdanı değil, acımasız "Kâr Bekçisi".
 * İsviçre yasalarına (Swiss GAAP - %8.1 MWST) uygun olarak geliri hesaplar, kâr marjını (%50) kilite alır 
 * ve israf saptadığı an Aloha'nın limitlerini keserek Swarm şalterini indirir.
 */

async function getFirestoreDb() {
  const { adminDb } = await import("@/lib/firebase-admin");
  return adminDb;
}

export class AccountingAgent {
  private static ENV_MODE: "TEST" | "LIVE" = process.env.AIPYRAM_ENV === "LIVE" ? "LIVE" : "TEST";
  
  // Swiss Tax Parameters
  private static readonly MWST_RATE = 0.081; // %8.1 İsviçre KDV (VAT)
  private static readonly STRIPE_FEE_PERCENT = 0.029; // %2.9 Stripe Kesintisi
  private static readonly STRIPE_FEE_FIXED = 0.30; // 0.30$ Stripe Sabit Ücreti
  private static readonly PROFIT_LOCK_RATE = 0.50; // Kâr Marjı Alt Sınırı (%50)

  /**
   * Firestore'dan harcama verisi oku
   */
  private static async getSpent(projectKey: string): Promise<number> {
    try {
      const db = await getFirestoreDb();
      const doc = await db.collection("accounting").doc(projectKey).get();
      return doc.exists ? (doc.data()?.spent || 0) : 0;
    } catch { return 0; }
  }

  /**
   * Firestore'a harcama yaz (increment)
   */
  private static async incrementSpent(projectKey: string, amount: number) {
    try {
      const db = await getFirestoreDb();
      const { FieldValue } = await import("firebase-admin/firestore");
      await db.collection("accounting").doc(projectKey).set(
        { spent: FieldValue.increment(amount), updatedAt: Date.now() },
        { merge: true }
      );
    } catch (e) {
      console.warn('[AccountingAgent] Firestore yazılamadı:', e);
    }
  }

  /**
   * Aloha herhangi bir API isteğinde bulunduğunda "Bunu yapmaya bütçe var mı?" diye sorar.
   */
  public static async requestBudgetApproval(targetProject: string, estimatedCostUsd: number): Promise<{ approved: boolean; reason?: string }> {
    console.log(`[⚖️ FISCAL GUARDIAN] Bütçe talebi inceleniyor: ${targetProject} (Maliyet: $${estimatedCostUsd})`);

    let currentLimit = 100; // Varsayılan Tüm Projeler Test Limiti
    const totalSpent = await this.getSpent(`spent_${targetProject}`);

    if (this.ENV_MODE === "TEST") {
       // Perde.ai için özel "Premium" Test Kotası
       if (targetProject.toLowerCase().includes("perde")) {
           currentLimit = 200; 
       }

       const expectedTotal = totalSpent + estimatedCostUsd;
       const usageRatio = expectedTotal / currentLimit;

       if (usageRatio >= 1.0) {
           console.error(`[🛑 KIRMIZI ALARM / ŞALTER İNDİ] ${targetProject} Limiti ($${currentLimit}) aşıldı! Görev engellendi.`);
           return { approved: false, reason: "BUDGET_LIMIT_EXCEEDED" };
       } else if (usageRatio >= 0.8) {
           console.warn(`[🟠 TURUNCU ALARM] ${targetProject} Bütçesinin %80'i tükendi! (Kalan: %20)`);
       } else if (usageRatio >= 0.7) {
           console.log(`[🟡 SARI ALARM] HAKAN BEY BİLGİLENDİRİLDİ: ${targetProject} Bütçesinde SADECE %30 KALDI! (Kullanılan: $${expectedTotal.toFixed(2)} / $${currentLimit})`);
       }
    } else {
       // LIVE MOD - Dinamik Hesaplama
       let totalRevenue = 0;
       try {
         const db = await getFirestoreDb();
         const doc = await db.collection("accounting").doc("total_revenue").get();
         totalRevenue = doc.exists ? (doc.data()?.amount || 0) : 0;
       } catch {}
       
       const { netCapital } = this.calculateSwissNetCapital(totalRevenue);
       currentLimit = netCapital;
       
       const expectedTotal = totalSpent + estimatedCostUsd;
       const usageRatio = expectedTotal / currentLimit;

       if (usageRatio >= 1.0) {
           console.error(`[🛑 FATAL FISCAL ERROR] Kasada "${targetProject}" projesi için yakıt bitti!`);
           return { approved: false, reason: "PROFIT_LOCK_VIOLATION" };
       } else if (usageRatio >= 0.8) {
           console.warn(`[🟠 TURUNCU ALARM] "${targetProject}" Reel Net Sermayesinin %80'ini yaktı!`);
       }
    }

    // Harcamayı Firestore'a kaydet
    await this.incrementSpent(`spent_${targetProject}`, estimatedCostUsd);
    
    console.log(`[💸 FISCAL APPROVED] Bütçe onaylandı. ${targetProject} ajanı işlemi yapabilir.`);
    return { approved: true };
  }

  /**
   * Brüt gelir üzerinden İsviçre vergi kesintileri ve "Kâr Kilidi" uygulanır.
   */
  private static calculateSwissNetCapital(grossRevenue: number): { vatReserve: number; stripeLoss: number; lockedProfit: number; netCapital: number } {
    if (grossRevenue <= 0) return { vatReserve: 0, stripeLoss: 0, lockedProfit: 0, netCapital: 0 };

    const stripeLoss = (grossRevenue * this.STRIPE_FEE_PERCENT) + this.STRIPE_FEE_FIXED;
    const postStripe = grossRevenue - stripeLoss;
    const vatReserve = postStripe * this.MWST_RATE;
    const netRevenue = postStripe - vatReserve;
    const lockedProfit = netRevenue * this.PROFIT_LOCK_RATE;
    const netCapital = netRevenue - lockedProfit;

    return { vatReserve, stripeLoss, lockedProfit, netCapital };
  }
}
