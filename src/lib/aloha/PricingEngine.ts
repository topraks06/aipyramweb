/**
 * SOVEREIGN PRICING ENGINE
 * 
 * Hammadde maliyetinden B2B toptan ve B2C perakende fiyatlarına
 * kadar tüm hesaplamaları otonom yapan fiyatlama motoru.
 * 
 * Google-Native: Tüm konfigürasyon Firestore'dan okunabilir,
 * şimdilik sabit çarpanlar kullanılır.
 */

export interface PricingInput {
  fabricCostPerMeter: number;  // Fabrika çıkış maliyeti (USD/metre)
  gsm: number;                // Gramaj
  widthCm: number;            // Kumaş eni (cm)
  composition: string;        // Örn: "%95 Polyester, %5 Viskon"
  isMotorized?: boolean;      // Motorlu sistem mi?
  curtainWidthM?: number;     // Müşterinin pencere genişliği (metre) — B2C için
  curtainHeightM?: number;    // Müşterinin pencere yüksekliği (metre) — B2C için
}

export interface PricingOutput {
  b2b: {
    wholesalePrice: number;       // Toptan fiyat (USD/metre)
    minOrderMeters: number;       // Minimum sipariş (metre)
    currency: string;
    certifications: string[];     // Otonom eklenen sertifikalar
  };
  b2c: {
    retailPricePerMeter: number;  // Perakende fiyat (EUR/metre, dikilmiş)
    totalFabricNeeded: number;    // Toplam kumaş ihtiyacı (metre)
    pleatingMultiplier: number;   // Pile çarpanı
    motorFireCm: number;         // Motor fire payı (cm)
    totalPrice: number;           // Toplam fiyat (EUR)
    currency: string;
    motorSurcharge: number;       // Motor ek fiyatı (EUR)
    sewingCost: number;           // Dikim işçiliği (EUR)
  };
}

// Sabit çarpanlar (gelecekte Firestore'dan okunacak)
const MARKUP = {
  B2B_WHOLESALE: 1.47,           // Fabrika maliyeti x 1.47 = toptan fiyat
  B2C_RETAIL: 3.2,               // Fabrika maliyeti x 3.2 = perakende ham fiyat
  PLEATING_MULTIPLIER: 2.5,      // 2.5x pile payı (standart)
  MOTOR_FIRE_CM: 15,             // Motorlu sistemler için +15cm yükseklik fire
  MOTOR_SURCHARGE_EUR: 85,       // Motorlu sistem ek fiyatı
  SEWING_COST_PER_METER: 8.50,   // Dikim işçiliği EUR/metre
  USD_TO_EUR: 0.92,              // Döviz kuru (güncel tutulmalı)
  MIN_ORDER_LIGHT: 30,           // Hafif kumaş minimum sipariş (metre)
  MIN_ORDER_HEAVY: 50,           // Ağır kumaş minimum sipariş (metre)
};

// GSM bazlı ağırlık sınıflandırması
function classifyWeight(gsm: number): 'light' | 'medium' | 'heavy' | 'extra-heavy' {
  if (gsm < 200) return 'light';
  if (gsm < 400) return 'medium';
  if (gsm < 600) return 'heavy';
  return 'extra-heavy';
}

// Otonom sertifika belirleme
function determineCertifications(gsm: number, composition: string): string[] {
  const certs: string[] = [];
  const comp = composition.toLowerCase();
  
  if (gsm >= 400) certs.push('Heavy Duty');
  if (gsm >= 500) certs.push('Contract Grade');
  if (comp.includes('fr') || comp.includes('trevira')) certs.push('DIN 4102-B1 (Yanmaz)');
  if (comp.includes('polyester') || comp.includes('pes')) certs.push('Oeko-Tex Standard 100');
  if (comp.includes('recycled') || comp.includes('geri')) certs.push('GRS (Global Recycled Standard)');
  if (comp.includes('organic') || comp.includes('organik')) certs.push('GOTS (Organik)');
  
  return certs;
}

// Motor gücü önerisi (kumaş ağırlığına göre)
function recommendMotorNm(gsm: number, widthM: number): string {
  const totalWeight = (gsm / 1000) * widthM * MARKUP.PLEATING_MULTIPLIER * 2.8; // kg tahmini
  if (totalWeight < 8) return '6Nm Standart Motor';
  if (totalWeight < 15) return '10Nm Güçlendirilmiş Motor';
  return '20Nm Endüstriyel Motor';
}

/**
 * Ana fiyatlama fonksiyonu.
 * Fabrika maliyetinden B2B ve B2C fiyatlarını otonom hesaplar.
 */
export function calculatePricing(input: PricingInput): PricingOutput {
  const weight = classifyWeight(input.gsm);
  const certs = determineCertifications(input.gsm, input.composition);
  
  // B2B Toptan Fiyat
  const wholesalePrice = Math.round(input.fabricCostPerMeter * MARKUP.B2B_WHOLESALE * 100) / 100;
  const minOrder = weight === 'heavy' || weight === 'extra-heavy' ? MARKUP.MIN_ORDER_HEAVY : MARKUP.MIN_ORDER_LIGHT;
  
  // B2C Perakende Fiyat
  const retailRaw = input.fabricCostPerMeter * MARKUP.B2C_RETAIL * MARKUP.USD_TO_EUR;
  const retailPricePerMeter = Math.round((retailRaw + MARKUP.SEWING_COST_PER_METER) * 100) / 100;
  
  // Toplam kumaş ihtiyacı (müşteri pencere ölçüsü verildiyse)
  const curtainWidth = input.curtainWidthM || 3; // Default 3 metre pencere
  const curtainHeight = input.curtainHeightM || 2.8; // Default 2.8 metre yükseklik
  const totalFabricWidth = curtainWidth * MARKUP.PLEATING_MULTIPLIER;
  const motorFire = input.isMotorized ? MARKUP.MOTOR_FIRE_CM : 0;
  const totalHeight = curtainHeight + (motorFire / 100);
  
  // Toplam kumaş = genişlik (pileli) * yükseklik / kumaş eni
  // Eğer kumaş eni pencereyi karşılıyorsa 1 boy yeterli, yoksa ek dikiş gerekir
  const fabricWidthM = input.widthCm / 100;
  let totalFabricNeeded: number;
  
  if (fabricWidthM >= totalHeight) {
    // Kumaş eni yüksekliği karşılıyor (seamless — ek dikiş yok)
    totalFabricNeeded = Math.ceil(totalFabricWidth * 10) / 10;
  } else {
    // Kumaş eni yetersiz, ek boy gerekli
    const panelCount = Math.ceil(totalFabricWidth / fabricWidthM);
    totalFabricNeeded = Math.ceil(panelCount * totalHeight * 10) / 10;
  }
  
  const sewingCost = Math.round(totalFabricNeeded * MARKUP.SEWING_COST_PER_METER * 100) / 100;
  const motorSurcharge = input.isMotorized ? MARKUP.MOTOR_SURCHARGE_EUR : 0;
  const totalPrice = Math.round((totalFabricNeeded * retailPricePerMeter + motorSurcharge) * 100) / 100;
  
  return {
    b2b: {
      wholesalePrice,
      minOrderMeters: minOrder,
      currency: 'USD',
      certifications: certs,
    },
    b2c: {
      retailPricePerMeter,
      totalFabricNeeded,
      pleatingMultiplier: MARKUP.PLEATING_MULTIPLIER,
      motorFireCm: motorFire,
      totalPrice,
      currency: 'EUR',
      motorSurcharge,
      sewingCost,
    },
  };
}
