export const GlobalRoutingMap = {
  DACH_REGION: ["vorhang.ai", "heimtex.ai", "mobel.ai"], // Alman eko-sistemi (Titiz, ölçü/sertifika odaklı)
  RUSSIA_CIS: ["shtory.ai", "krowat.ai"], // Rusya ve Doğu Bloku (Lüks ve gösteriş odaklı)
  MENA_ASIA: ["parda.ai", "bezak.ai"], // Orta Doğu / Hindistan
  APAC: ["donoithat.ai", "perabot.ai", "kurtina.ai"], // Vietnam, Endonezya, Filipinler
  GLOBAL_EXHIBITION: ["hometex.ai", "heimtextil.ai"], // Koleksiyoncu ve Toptancı Sahnesi
  CORE_RADAR: ["trtex.com", "curtaindesign.ai"] // İhale Radarı, Hammadde ve AI Tasarım
};

export type GlobalRegion = keyof typeof GlobalRoutingMap;

export interface TechnicalSpecs {
  martindale_rub_test?: number; // Döşemelik kumaş sürtünme testleri (Örn: 45000)
  towel_gsm?: number; // Havlular için gramaj
  filling_type?: "goose_down" | "bamboo" | "microgel"; // Yastık/yorgan dolgusu
  composition?: string[];
  pilling_resistance?: number;
  light_fastness?: number;
}

export interface FactoryRawMaterial {
  actor: "FACTORY";
  yarn_type: "20_denier" | "polyester_blend" | "cotton_linen";
  technical_specs: TechnicalSpecs;
}

export interface MechanicalProducer {
  actor: "MECHANISM_PROVIDER";
  system_type: "rustik_wood" | "aluminum_cornice" | "motorized_smart";
  motor_integration: "somfy" | "tuya" | "manual";
  max_weight_capacity_kg: number;
}

export interface RetailerVirtualShop {
  actor: "RETAILER_B2C";
  domain_gate: "vorhang.ai" | "shtory.ai" | "perde.ai";
  ai_measurement_active: boolean; // Müşteri fotoğrafından cam ölçüsü hesaplama
  installation_service_included: boolean; // Montaj işçiliği
}

export type EcosystemActor = FactoryRawMaterial | MechanicalProducer | RetailerVirtualShop;

export interface TextileProduct {
  id: string;
  name: string;
  actorSource: EcosystemActor;
  isHeavyDuty?: boolean; 
  assignedDomains?: string[];
}

/**
 * AI Otonom Kural Yöneticisi (The Loop Rules v5.0)
 */
export const applyGlobalTextileRules = (product: TextileProduct, cutWidthCm?: number, cutHeightCm?: number): any => {
  const result: any = { ...product };

  // Rule 1: TRTex Radar ve Otonom Domain Atama
  if (product.actorSource.actor === "FACTORY") {
    const specs = product.actorSource.technical_specs;
    // Otonom sertifika ve kalite ataması
    if (specs.martindale_rub_test && specs.martindale_rub_test > 40000) {
      result.isHeavyDuty = true;
      result.heavyDutyLabel = "45.000 Martindale, Ahşap Rustik Uyumlu"; // CurtainDesign & Hometex vitrini için (Rule 2)
      // DACH bölgesi titizdir, sertifika ister
      result.autoCertificates = ["DIN 4102-B1", "Oeko-Tex"];
    }
    
    // Radara göre domain routing
    result.assignedDomains = ["trtex.com", "hometex.ai"];
  }

  // Rule 3: Perakende B2C Kesim (Almanya/Vorhang vs.)
  if (product.actorSource.actor === "RETAILER_B2C" && cutWidthCm && cutHeightCm) {
    // 2.5x pile payı
    result.finalWidthCm = cutWidthCm * 2.5; 
    
    // Motor gizleme payı
    // Senaryo: Ürün motorlu bir mekanizmaya (MECHANISM_PROVIDER) entegre ediliyorsa +15cm
    // Bu örnekte basitleştirilmiştir. Retailer satış yaparken motorlu seçilirse:
    const hasMotor = true; // Gerçekte kullanıcının sepetindeki mekanizmaya bakılır
    if (hasMotor) {
      result.adjustedCutHeightCm = cutHeightCm + 15; // 15 cm motor fire payı
      result.motorSurchargeApplied = true;
    }
  }

  return result;
};
