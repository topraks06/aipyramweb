import crypto from 'crypto';

// -----------------------------------------------------------------------------
// 🔥 TRTEX / ALOHA “IMMUTABLE CORE PROTOCOL v1.1”
// 🔒 LOCKED BY SUPREME COMMAND (HAKAN) - KENDİNİ İYİLEŞTİREN AKILLI MİMARİ
// -----------------------------------------------------------------------------

export const SYSTEM_LAW = {
  IMAGE_POLICY: {
    min_images: 3,
    required_types: ["hero", "lifestyle", "detail"],
    variation_rule: "STRICT_DIFFERENT_SCENES",
    realism: "PHOTOREALISTIC_ONLY_VOGUE_AD_STYLE",
    forbid: ["same_scene", "same_color_palette", "color_variation_only", "cgi", "render", "illustration", "blur"],
  },

  FAILURE_POLICY: {
    max_retry: 3,
    fallback_mode: "REGENERATE_WITH_VARIATION",
    hard_fail_only_if: "REPEATED_VIOLATION"
  },

  CONTENT_POLICY: {
    min_market_score: 65,
    min_commercial_score: 50,
    reject_if_low_quality: true,
  },

  CAMPAIGN_POLICY: {
    mode: "AGENCY_CAMPAIGN",
    diversity_score_min: 0.7,
    require_story_variation: true,
    require_target_audience_focus: true,
    forbid_duplicate_visual_logic: true,
  },

  GLOBAL_RADAR_MATRIX: [
    'Salone del Mobile Milano luxury upholstery fabric trends', 'Proposte Como luxury furnishing fabrics and curtains', 'Maison&Objet Paris interior decor fabrics and curtain trends', 'Texworld Paris home textile sourcing European market', 'Italian high-end textile manufacturing and luxury linen', 'Milan Design Week luxury curtain and drapery collections',
    'High Point Market USA home furnishings upholstery trends', 'NY NOW home textiles luxury interior design USA', 'USA custom window treatments and mechanized blinds market', 'American interior design trends curtain fabrics AD',
    'Canton Fair home textiles export market China manufacturers', 'Intertextile Shanghai home fabric exhibitor innovations', 'Panipat India home textile export hub cotton rugs', 'Faisalabad Pakistan bed linen and hospitality textile exports', 'Vietnam textile manufacturing shift upholstery fabrics', 'Japan smart textiles minimalist interior home decor',
    'MosBuild Russia curtain and upholstery luxury market demand', 'Heimtextil Russia home textile imports and wholesale', 'CIS region interior design furniture fabrics and drapery',
    'Index Dubai luxury hospitality textiles and hotel contracts', 'Saudi Arabia Vision 2030 hotel contract linen tenders', 'Gulf region luxury blackout curtains and heat protection decor', 'UAE mega projects interior design custom fabrics',
    'South Africa interior design hotel projects and contract textiles', 'Morocco and Egypt home decor fabric manufacturing hubs', 'African luxury resort hospitality linen supply chain B2B', 'Sub-Saharan Africa home textile import data and tariffs',
    'Brazil home textile market analysis and upholstery trends', 'Colombia furnishing fabric export and B2B decor market', 'South America luxury real estate interior textiles demand', 'Argentina custom drapes and hotel project fabric tenders',
    'Australia smart blind and motorized curtain market CEDIA', 'New Zealand sustainable upholstery and luxury pure wool fabrics', 'Sydney luxury real estate interior textiles and architecture',
    'Monaco luxury yacht contract textiles and marine upholstery', 'Maldives luxury resort hotel linen and outdoor fabric supply chain', 'Switzerland premium blackout curtain requirements and acoustic fabrics', 'Singapore smart home curtain motorization and premium decor',
    'Heimtextil Frankfurt 2026 home textile trends exhibitor review', 'R+T Stuttgart motorized sun shading systems smart blinds', 'hotel contract linen tender global hospitality market', 'luxury hospitality curtain blackout and acoustic specifications',
    'window covering motorized systems CEDIA integration', 'smart home automated curtain blinds Somfy technology', 'curtain fabric sheer voile wholesale market price B2B', 'sustainable outdoor marine fabric upholstery market', 'WGSN home textile forecast colour and material 2026', 'Pantone color of the year interior decoration upholstery', 'ITMF global textile production statistics cotton polyester', 'Euratex EU textile imports tariffs regulations Turkey'
  ],

  // ═══ SECTOR CONSTITUTION (MÜHÜRLÜ — SİLİNEMEZ, SADECE ÜZERİNE EKLENEBİLİR) ═══
  SECTOR_CONSTITUTION: {
    ALLOWED_SECTORS: [
      "HOME_TEXTILE",   // Perde, Döşemelik, Nevresim, Havlu, Kırlent, Masa Örtüsü
      "CONTRACT",       // Otel/Hotel, Hospitality, AVM, Ofis, FR Kumaş, Akustik Panel
      "MEDICAL",        // Hastane Perdesi, Antibakteriyel, Cleanroom, Disposable
      "MARINE",         // Yat/Yacht, Tekne, Cruise, UV Dayanımlı, Havacılık Koltuk
      "OUTDOOR",        // Tente, Branda, Zip Screen, Gölgelendirme, Mimari Membran
      "INDUSTRIAL"      // İplik/Yarn, Elyaf/Fiber, Nonwoven, Jacquard, Üretim Hattı
    ],
    FORBIDDEN_KEYWORDS_TR: [
      "konfeksiyon", "hazır giyim", "giyim ihracatı", "moda haftası",
      "tişört", "hoodie", "ayakkabı", "çanta", "elbise", "podyum",
      "fast fashion", "influencer", "sneaker"
    ],
    FORBIDDEN_KEYWORDS_EN: [
      "apparel", "clothing", "garment", "fashion week", "runway",
      "t-shirt", "hoodie", "sneaker", "fast fashion", "influencer"
    ],
    FORBIDDEN_BRANDS: [
      "Zara Home", "IKEA", "H&M Home", "English Home",
      "Karaca", "Madame Coco"
    ],
    MIN_COMMERCIAL_SCORE: 65,
    RULE: "score < 65 → reject | FORBIDDEN → instant reject | visual_intent = sector-bound"
  }
};

export const MASTER_RULE = `
This system must behave like a global luxury campaign studio.
Repetition, similarity, or template outputs are strictly forbidden.
Each output must feel like a new high-budget campaign.
Each image must intentionally contrast the others in:
- geography (Europe vs Asia vs Middle East vs Tropics)
- lighting (day vs night vs studio vs cinematic twilight)
- color temperature (warm vs neutral vs cold)
`;

export function generateSystemHash(): string {
  return crypto.createHash('sha256').update(JSON.stringify(SYSTEM_LAW)).digest('hex');
}

export const ORIGINAL_SYSTEM_HASH = generateSystemHash();


// --- MIGRATED FROM SWARM/SYSTEM_LAW.TS ---

/**
 * -----------------------------------------------------
 * TRTEX CORE ENGINE SPEC v1.1
 * "B2B INTELLIGENCE TERMINAL OPERATING CONTRACT"
 * -----------------------------------------------------
 * 
 * CORE_IDENTITY: "TRTEX_B2B_INTELLIGENCE_TERMINAL"
 * 
 * CORE PRINCIPLE:
 * All system outputs must represent economic meaning, not content aesthetic.
 * 
 * FORBIDDEN:
 * - decorative language
 * - emotional marketing tone
 * - redundant repetition
 * - "trend oldu, dikkat çekti" gibi boş ifadeler
 * 
 * REQUIRED:
 * - impact (etki)
 * - trend direction (yön)
 * - cause (sebep)
 * - consequence (sonuç)
 * - action (aksiyon)
 * 
 * 4+1 KATMANLI ZİHİN MİMARİSİ (v1.1):
 * 1. INTELLIGENCE (RAW SIGNAL): "Ne oldu?"
 *    - Fiyatlar, haberler, lojistik, şirket açıklamaları.
 * 
 * 2. INSIGHT (INTERPRETATION): "Piyasa neye hazırlanıyor?"
 *    - market_impact_score, direction (risk | opportunity | neutral)
 * 
 * 3. ACTION (PARA MOTORU): "Ne yapılmalı?"
 *    - manufacturer, retailer, architect, investor aksiyonları.
 * 
 * 4. VISUAL INTENT: "Ekonomik Davranış"
 *    - type: industrial_signal | contract_demand | logistics_pressure | retail_shift
 *    - mood: tight | volatile | expansion | compression
 *    - region: EU | ASIA | US | MENA
 * 
 * 5. WATCH LAYER (OTONOM ERKEN UYARI v1.1):
 *    - reason: "low_score_but_strategic_signal" vs
 *    - review_cycle: "6h | 24h"
 */

export const CORE_IDENTITY = "TRTEX_B2B_INTELLIGENCE_TERMINAL";

export type SignalDomain = "publish" | "watch" | "quarantine";

/**
 * DECISION_RULE v1.1 (Risk-Aware Engine)
 * - market_impact_score < 50 → quarantine
 * - 50-65 → watchlist (erken sinyal kaybı önlenir)
 * - > 65 → publish
 */
export function evaluateSignalDomain(score: number): SignalDomain {
  if (score > 65) return "publish";
  if (score >= 50 && score <= 65) return "watch";
  return "quarantine";
}

export type VisualIntentType = "industrial_signal" | "contract_demand" | "logistics_pressure" | "retail_shift" | "macro_finance" | "neutral_signal_graph";
export type VisualIntentMood = "tight" | "volatile" | "expansion" | "compression" | "stagnant" | "stable";
export type VisualIntentRegion = "EU" | "ASIA" | "US" | "MENA" | "GLOBAL";

export interface VisualIntentNode {
  type: VisualIntentType;
  mood: VisualIntentMood;
  region: VisualIntentRegion;
}

// v1.1 Fallback Zorunluluğu: Sistem asla boş kalmaz.
export const visual_intent_fallback: VisualIntentNode = {
  type: "neutral_signal_graph",
  mood: "stable",
  region: "GLOBAL"
};

export interface WatchLayerNode {
  reason: string;
  review_cycle: "6h" | "12h" | "24h";
  escalation: boolean;
}

export interface InsightNode {
  market_impact_score: number;
  direction: "risk" | "opportunity" | "neutral";
  explanation: string; // Bloomberg Aklı
}

export interface ActionNode {
  manufacturer: string;
  retailer: string;
  architect: string;
  investor: string;
}

export interface SEOMatrix {
  core_keys: string[]; // Sabit: perde, ev tekstili, döşemelik vb.
  adaptive_keys: string[];
  dynamic_keys: string[];
}

/**
 * TRIPLE OUTPUT SCHEMA MODEL (v1.1 Risk-Aware)
 */
export interface TripleOutputFormat {
  intelligence: any; // Çeviriler ve ham haber ("Ne oldu?")
  insight: InsightNode; // Yorum ("Ne anlama geliyor?")
  action_layer: ActionNode; // "Ne yapmalıyım?"
  visual_intent: VisualIntentNode; // Görsel Niyet
  visual_intent_fallback: VisualIntentNode; // Sistem Çökme Garantisi
  watch_layer: WatchLayerNode; // Otonom Erken Uyarı V1.1
  seo_matrix: SEOMatrix; // SEO + Global arama
  commercial_note?: string; // Ek bilgi
}
