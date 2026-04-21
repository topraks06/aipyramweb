export type INTELLIGENCE_TYPE =
  | "MARKET_SIGNAL"
  | "NEWS_INTEL"
  | "TRADE_OPPORTUNITY"
  | "REGIONAL_RISK";

export interface TRTEX_INTELLIGENCE_PACKET {
  id: string;
  type: INTELLIGENCE_TYPE;
  raw_source: string;
  confidence: number;
  data_quality: number;
  extracted_entities: string[];
  normalized_meaning: string;
  economic_relevance_score: number;
}
