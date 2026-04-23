/**
 * PERDE.AI PRICING ENGINE
 * 
 * Fiyatlandırma mantığını merkezileştiren servis.
 * Basit tutulmuştur: En × Boy / 10000 × Kumaş Fiyatı
 */

export interface PriceCalcInput {
  width_cm: number;
  height_cm: number;
  fabricType: 'blackout' | 'tul' | 'stor' | 'fon' | 'zebra';
  quantity?: number;
}

// Birim fiyatlar (₺/m²)
export const FABRIC_PRICES: Record<string, number> = {
  blackout: 450,
  tul: 280,
  stor: 520,
  fon: 380,
  zebra: 620
};

/**
 * Verilen ölçüler ve kumaş türüne göre fiyat hesaplar (USD cinsine çevirmez, TR pazarı varsayılarak TL kalabilir, 
 * ancak B2B ödemeler Stripe'da USD/EUR geçiyor. AIPyram ERP varsayılan olarak USD üzerinden çalışabilir. 
 * Şimdilik base para birimini dönüyoruz).
 */
export function calculateItemPrice(input: PriceCalcInput): number {
  const { width_cm, height_cm, fabricType, quantity = 1 } = input;
  
  const basePrice = FABRIC_PRICES[fabricType];
  if (!basePrice) {
    throw new Error(`Geçersiz kumaş türü: ${fabricType}`);
  }

  // m² hesaplama (Minimum 1 m² kuralı uygulanabilir ama şimdilik standart)
  const squareMeters = (width_cm * height_cm) / 10000;
  const effectiveSqm = Math.max(1, squareMeters); // Minimum 1m2 hesaplansın

  const totalPrice = effectiveSqm * basePrice * quantity;

  // 2 ondalığa yuvarla
  return Math.round(totalPrice * 100) / 100;
}
