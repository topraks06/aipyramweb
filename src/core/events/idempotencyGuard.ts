// ═══════════════════════════════════════════════════
// GOOGLE-NATIVE: Upstash Redis → Firestore
// Anayasa: Sadece Google altyapısı.
// ═══════════════════════════════════════════════════

/**
 * 🛡️ IDEMPOTENCY GUARD
 * Sistemin aynı Deal veya Payment sinyalini 2. kez işlemesini engelleyen kalkan.
 * Event ID'leri Firestore üzerinde bir TTL (7 gün) ile saklanır.
 */
export class IdempotencyGuard {
  
  /**
   * Bir event'in daha önce işlenip işlenmediğini kontrol eder.
   * Firestore transaction kullanılarak Race Condition engellenir.
   * @param eventId Benzersiz Sinyal ID'si
   * @returns `false` ise işleme devam et. `true` ise işlemi DURDUR (Zaten işlenmiş).
   */
  static async isDuplicateEvent(eventId: string): Promise<boolean> {
    try {
      const { adminDb } = await import("@/lib/firebase-admin");
      const docRef = adminDb.collection("idempotency_locks").doc(eventId);
      
      const result = await adminDb.runTransaction(async (tx) => {
        const doc = await tx.get(docRef);
        if (doc.exists) {
          console.warn(`[🛡️ IDEMPOTENCY GUARD] MÜKERRER İŞLEM BLOKE EDİLDİ: ${eventId}`);
          return true; // Already exists, blocked!
        }
        
        // İlk defa işleniyor — kaydet
        tx.set(docRef, {
          processedAt: Date.now(),
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 gün TTL
        });
        return false; // Safe to proceed!
      });

      return result;
    } catch (err: any) {
      console.error("[Idempotency] Firestore error, allowing pass as fallback:", err.message);
      return false; // Firestore hatası olursa geç — deadlock olmasın
    }
  }

  /**
   * Başarısız olan bir işlem için kilidi serbest bırakır.
   */
  static async clearLock(eventId: string) {
    try {
      const { adminDb } = await import("@/lib/firebase-admin");
      await adminDb.collection("idempotency_locks").doc(eventId).delete();
      console.log(`[🛡️ IDEMPOTENCY GUARD] İşlem başarısız olduğu için kilit kaldırıldı: ${eventId}`);
    } catch (err) {}
  }
}
