/**
 * TRTEX SINGLE INTELLIGENCE PERSONALITY KİLİDİ
 * 
 * Amaç: Sistemin şizofreniye düşmesini ("Ön yüz Wall Street, Arka yüz IKEA Dekorasyon") engellemek.
 * Yasa: NO AESTHETIC FREEDOM. ONLY INTENT COMPLIANCE.
 * AI sadece "güzellik" üretmez, "Aynı Dünya Dili (Semantic Visual Discipline)" içinde render yapar.
 */

export type VISUAL_INTENT =
  | "B2B_INTELLIGENCE"
  | "INDUSTRIAL_PRODUCTION"
  | "LOGISTICS"
  | "MARKET_DATA"
  | "COMMODITY_CORE";

export const VISUAL_STYLE: Record<VISUAL_INTENT, string> = {
  B2B_INTELLIGENCE: "cold_editorial_terminal, sharp contrast, highly professional, bloomberg-aesthetic, data-driven",
  INDUSTRIAL_PRODUCTION: "steel_factory_aerial, extreme precision, high-tech manufacturing, pristine automation, massive scale",
  LOGISTICS: "port_container_dark, global supply chain, dramatic industrial lighting, steely blues",
  MARKET_DATA: "minimal_finance_ui, abstract high-density graphs, glowing led indicators, deep corporate blacks",
  COMMODITY_CORE: "macro photography of raw materials (cotton, yarns, polymers) in industrial scales, pristine grading, strict B2B standard"
};

export function getIntentCategory(categoryOrKeyword: string): VISUAL_INTENT {
  const cat = categoryOrKeyword.toLowerCase();
  
  if (cat.includes('navlun') || cat.includes('freight') || cat.includes('logistics') || cat.includes('export')) {
    return 'LOGISTICS';
  }
  
  if (cat.includes('factory') || cat.includes('üretim') || cat.includes('production') || cat.includes('machine') || cat.includes('loom')) {
    return 'INDUSTRIAL_PRODUCTION';
  }
  
  if (cat.includes('pamuk') || cat.includes('cotton') || cat.includes('yarn') || cat.includes('iplik') || cat.includes('raw_')) {
    return 'COMMODITY_CORE';
  }
  
  if (cat.includes('regime') || cat.includes('market') || cat.includes('finance') || cat.includes('data')) {
    return 'MARKET_DATA';
  }

  // Varsayılan / Fallback
  return 'B2B_INTELLIGENCE';
}
