import { adminDb } from '@/lib/firebase-admin';

export type FeatureFlagStatus = 'disabled' | 'shadow' | 'canary' | 'live';

export interface FeatureFlag {
  id: string;
  name: string;
  status: FeatureFlagStatus;
  trafficPercentage: number;
}

/**
 * SOVEREIGN DEPLOY GUARD
 * Otonom motorun, deneylerin ve A/B testlerin belirli bir modüle 
 * veya kullanıcı kitlesine açılmasını denetleyen Feature Flag mekanizması.
 */
export const deployGuard = {
  /**
   * Belirtilen flag id'sinin çalışmasına izin verilip verilmediğini denetler.
   * `trafficPercentage` mantığını kullanarak A/B test / rollout dağıtımı yapar.
   * 
   * @param flagId Feature flag ID'si (Örn: 'aloha_vision_v2')
   * @param userId İsteğe bağlı olarak dağıtımın hash ile sabitlenmesi için (opsiyonel)
   */
  async isEnabled(flagId: string, userId?: string): Promise<boolean> {
    if (!adminDb) {
      console.warn(`[DeployGuard] adminDb yok. ${flagId} güvenlik amacıyla devre dışı (disabled) sayıldı.`);
      return false;
    }

    try {
      const doc = await adminDb.collection('feature_flags').doc(flagId).get();
      if (!doc.exists) {
        // Flag tanımlı değilse, fail-safe olarak kapalı kabul et
        return false;
      }

      const data = doc.data() as FeatureFlag;
      
      if (data.status === 'disabled') return false;
      if (data.status === 'live') return true;
      if (data.status === 'shadow') {
        // Shadow mode'da trafik sadece izlenir, asıl sistemde etki etmez.
        // Uygulama seviyesinde "isEnabled = false" dönülür ama shadow log atılabilir.
        console.log(`[DeployGuard] ${flagId} shadow modunda çalıştı.`);
        return false;
      }
      if (data.status === 'canary') {
        // Canary mode: Sadece belirli bir yüzdeye açılır
        // Eğer userId varsa hash bazlı deterministik karar verilebilir, 
        // şimdilik basit rastgele yüzde ile karar veriyoruz.
        const randomRoll = Math.random() * 100;
        const percentage = data.trafficPercentage || 0;
        return randomRoll <= percentage;
      }

      return false;
    } catch (e: any) {
      console.error(`[DeployGuard] Hata (${flagId}): ${e.message}`);
      return false; // Fail safe
    }
  },

  /**
   * Sadece aktif olup olmadığını değil, flagin tüm bilgilerini döner.
   */
  async getFlagStatus(flagId: string): Promise<FeatureFlag | null> {
    if (!adminDb) return null;
    try {
      const doc = await adminDb.collection('feature_flags').doc(flagId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() } as FeatureFlag;
    } catch {
      return null;
    }
  }
};
