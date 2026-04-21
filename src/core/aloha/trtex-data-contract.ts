export type TRTEX_ZONE =
  | "LIVE_STREAM"
  | "BREAKING"
  | "TRADE"
  | "RADAR";

export type TRTEX_TYPE =
  | "MARKET"
  | "NEWS"
  | "OPPORTUNITY"
  | "REGION";

export interface TRTEX_CORE_PAYLOAD {
  id: string;
  type: TRTEX_TYPE;
  zone: TRTEX_ZONE;
  title: string;
  timestamp: number;
  score: {
    market_impact: number;
    commercial: number;
    confidence: number;
  };
  geo: {
    country: string;
    region: string;
    trade_zone: string;
  };
  content: {
    summary: string;
    data_points: number;
  };
  seo: {
    keywords: string[];
    slug: string;
  };
  triggers: {
    trigger_perde_ai: boolean;
    trigger_hometex: boolean;
    trigger_campaign: boolean;
  };
  original_article?: any; // Geriye dönük uyumluluk veya ekstra metadata için.
}
