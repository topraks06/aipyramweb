import { adminDb } from '@/lib/firebase-admin';

/**
 * PRODUCTION GUARD (Shadow Deploy & Traffic Test)
 * Sandbox testini başarıyla geçen otonom eylemlerin direkt %100 trafiğe çıkmasını engeller.
 */
export class DeployGuard {
  /**
   * Bir otonom özelliğin veya SEO güncellemesinin Shadow Deploy (Gölge) fazında olup olmadığını denetler.
   */
  static async requestDeployment(featureId: string, currentPhase: "soft" | "hard" | "live"): Promise<boolean> {
    if (currentPhase !== "live") {
      return true; // Sandbox ortamlarında her zaman izinli
    }

    try {
      const docRef = adminDb.collection('feature_flags').doc(featureId);
      const snap = await docRef.get();
      
      if (!snap.exists) {
        // Feature flag yoksa güvenli taraf (false) dön
        console.warn(`[🛡️ DEPLOY GUARD] ${featureId} özelliği feature_flags tablosunda bulunamadı. Erişim reddedildi.`);
        return false;
      }
      
      const data = snap.data();
      const status = data?.status || 'disabled'; // shadow, canary, live, disabled
      
      if (status === 'live') return true;
      if (status === 'disabled') return false;
      
      // Shadow veya Canary için traffic percentage kontrolü
      const trafficPercentage = data?.trafficPercentage || 0; // 0-100 arası
      const arr = new Uint32Array(1);
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(arr);
      } else {
        // Fallback for environments without crypto
        arr[0] = Math.floor(Math.random() * 100);
      }
      const simulationTrafficRoll = arr[0] % 100;
      
      if (simulationTrafficRoll <= trafficPercentage) {
         console.log(`[🛡️ DEPLOY GUARD] ${featureId} (${status}) özelliği trafik sınırından geçti! (Hedef: %${trafficPercentage})`);
         return true;
      } else {
         console.warn(`[🛡️ DEPLOY GUARD] ${featureId} (${status}) henüz Full Deploy değil. Trafik reddedildi.`);
         return false;
      }
    } catch (e: any) {
      console.error(`[🛡️ DEPLOY GUARD] Firestore hatası: ${e.message}`);
      return false; // Hata durumunda fail-safe: kapalı
    }
  }
}
