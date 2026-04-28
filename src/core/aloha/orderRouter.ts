import { adminDb } from '@/lib/firebase-admin';

export interface RouteResult {
  vendorId: string;
  vendorName: string;
  shippingEstimatedDays: number;
  aipyramCommissionEur: number;
  vendorEarningsEur: number;
}

/**
 * aipyram Sovereign - Marketplace Order Router (Akıllı Dağıtıcı)
 * Vorhang (Avrupa) veya Hometex'ten gelen B2C siparişleri, 
 * ekosistemdeki (Perde.ai) "Dükkan Sahipleri"ne otonom dağıtır.
 */
export async function routeOrderToBestVendor(
  destinationCountry: string,
  totalOrderValueEur: number,
  items: any[]
): Promise<RouteResult> {
  // B2B Kuralı: Bütün para aipyram havuzuna düşer. Yemeksepeti modeli.
  // aipyram komisyonu: Örn. %15
  const COMMISSION_RATE = 0.15;
  const aipyramCommissionEur = parseFloat((totalOrderValueEur * COMMISSION_RATE).toFixed(2));
  const vendorEarningsEur = parseFloat((totalOrderValueEur - aipyramCommissionEur).toFixed(2));

  try {
    // --- PHASE 1: STOK DOĞRULAMA (Availability Check Layer) ---
    // Gelen ürünler için stok kontrolü yapılır. (Simülasyon)
    const requiredProduct = items[0]?.name || 'Unknown';
    let availableVendors = [
      { id: 'vendor_a', name: 'Sovereign Atölyesi (TR Merkez)', stock: 50, hasEuExpress: false },
      { id: 'vendor_b', name: 'Sovereign Atölyesi (EU Export Node)', stock: 0, hasEuExpress: true }, // Stok yok (Tükendi)
      { id: 'vendor_c', name: 'Almanya Yerel Bayi', stock: 10, hasEuExpress: true }
    ];

    console.log(`[ORDER_ROUTER] 📦 Stok Kontrolü Başladı: ${requiredProduct}`);
    availableVendors = availableVendors.filter(v => v.stock > 0);

    if (availableVendors.length === 0) {
      throw new Error("Hiçbir dükkanda yeterli stok bulunamadı.");
    }

    // --- PHASE 2: LOJİSTİK KONTROLÜ (Logistics Check) ---
    // Hedef ülkeye en hızlı gönderim yapabilecek dükkanı bul
    let selectedVendor = availableVendors[0];
    let shippingDays = 7;

    if (destinationCountry === 'DE' || destinationCountry === 'AT' || destinationCountry === 'CH') {
      const euVendor = availableVendors.find(v => v.hasEuExpress);
      if (euVendor) {
        selectedVendor = euVendor;
        shippingDays = 3;
        console.log(`[ORDER_ROUTER] 🚚 Avrupa Hızlı Kargo satıcısı bulundu: ${selectedVendor.name}`);
      } else {
        shippingDays = 5; // TR'den normal kargo
        console.log(`[ORDER_ROUTER] ⚠️ Avrupa bayisinde stok yok! Sipariş mecburen TR Merkez'e yönlendirildi.`);
      }
    } else {
      // Türkiye içi sipariş
      selectedVendor = availableVendors.find(v => !v.hasEuExpress) || availableVendors[0];
      shippingDays = 2;
    }

    // --- PHASE 3: YÜK DENGELEME (B2B Ataması) ---
    // Şimdilik UI'da görebilmemiz için vendorId'yi 'perde_default_vendor' yapıyoruz,
    // ancak gerçek hayatta 'selectedVendor.id' olacak.
    const finalVendorId = 'perde_default_vendor'; 
    const finalVendorName = selectedVendor.name;

    console.log(`[ORDER_ROUTER] 🚦 Vorhang siparişi (${destinationCountry}) KESİNLEŞTİ: ${finalVendorName}`);
    console.log(`[ORDER_ROUTER] 💰 aipyram Komisyonu: €${aipyramCommissionEur} | Dükkan Hak Edişi: €${vendorEarningsEur}`);

    return {
      vendorId: finalVendorId,
      vendorName: finalVendorName,
      shippingEstimatedDays: shippingDays,
      aipyramCommissionEur,
      vendorEarningsEur
    };

  } catch (error: any) {
    console.error(`[ORDER_ROUTER] ❌ Yönlendirme hatası:`, error);
    // Hata durumunda merkeze (fallback vendor) at
    return {
      vendorId: 'perde_default_vendor',
      vendorName: 'aipyram Merkez Dağıtım',
      shippingEstimatedDays: 7,
      aipyramCommissionEur,
      vendorEarningsEur
    };
  }
}
