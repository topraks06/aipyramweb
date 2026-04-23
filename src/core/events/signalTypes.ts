// ═══════════════════════════════════════════════════════════════
// AIPYRAM Master Brain — Ecosystem Signal Types
// ═══════════════════════════════════════════════════════════════

export type EcosystemSignalType =
  | 'RAW_MATERIAL_UPDATE'    // TRTEX: hammadde haberi
  | 'TREND_ALERT'            // TRTEX: trend tespiti
  | 'PRODUCT_DESIGNED'       // Perde.ai: yeni ürün tasarlandı
  | 'RENDER_COMPLETED'       // Perde.ai: render bitti
  | 'MATCH_FOUND'            // Hometex: alıcı-üretici eşleşti
  | 'LEAD_CAPTURED'          // Herhangi: yeni lead yakalandı
  | 'ORDER_CREATED'          // Vorhang: sipariş oluştu
  | 'FABRIC_ANALYZED'        // Perde.ai: kumaş tanıma bitti
  | 'FAIR_OPPORTUNITY'       // Hometex: fuar fırsatı
  | 'PRICE_SHIFT'            // TRTEX: fiyat değişimi
  | 'VORHANG_PRODUCT_LISTED' // Vorhang: yeni ürün listelendi
  | 'TELEPORT_INITIATED';    // Sistem: cross-node geçiş yapıldı

export interface EcosystemSignal {
  id?: string;
  type: EcosystemSignalType;
  source_node: 'trtex' | 'perde' | 'hometex' | 'vorhang' | 'master';
  target_node: 'trtex' | 'perde' | 'hometex' | 'vorhang' | 'master' | 'all';
  payload: Record<string, any>;
  priority: 'critical' | 'high' | 'normal' | 'low';
  timestamp?: string;
  processed?: boolean;
}

export interface SignalSubscription {
  node: string;
  signalTypes: EcosystemSignalType[];
  handler: (signal: EcosystemSignal) => Promise<void>;
}
