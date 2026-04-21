/**
 * ALOHA VISUAL DNA — Görsel Anayasa (COO v2.1 MasterPhotographer 2.1)
 * 
 * TEMEL KURAL: "Manifatüracı" estetiği (karanlık, dağınık, düşük kalite) MUTLAK YASAK.
 * Tüm görseller high-end B2B otorite yansıtmalı.
 * 
 * Dağılım Matrisi (ZORUNLU):
 *   40% Perde/Tül — Lüks showroom, penthouse, yerden tavana perde
 *   20% Ev Tekstili — 5 yıldızlı otel/SPA ortamı
 *   10% Döşemelik — Minimalist mobilya üzerinde kumaş dokusu
 *   10% Endüstriyel/Teknoloji — Parlak robotik fabrika, Jacquard tezgahı
 *   10% Hammadde — Artistik iplik bobinleri, ham ipek
 *   10% B2B Fuar — Profesyonel stant, alıcı müzakeresi
 * 
 * İnsan Elemanı: 7 kıtadan profesyoneller (mimar, mühendis, alıcı).
 * MODA MODELİ YASAK. Odak: B2B etkileşimi.
 * 
 * Görsel Kal(24mm wide-angle, 2K çözünürlük, doğal güneş ışığı, canlı renk doygunluğu)
 */

import { MasterPhotographer, Category } from '@/core/aloha/master-photographer';

// ═══════════════════════════════════════
// HABER KATEGORİSİ → GÖRSEL KATEGORİ HARİTASI
// "Kategori değişir ama estetik DEĞİŞMEZ"
// ═══════════════════════════════════════

const NEWS_TO_VISUAL_MAP: Record<string, Category> = {
  // ─── HAMMADDE ─── (iplik tek başına YASAK — ürün bağlamında göster)
  'hammadde': 'raw_cotton',
  'raw_materials': 'raw_cotton',
  'iplik': 'raw_cotton',
  'pamuk': 'raw_cotton',
  'polyester': 'curtain_sheer',
  'keten': 'raw_linen',
  'vadeli': 'raw_cotton',
  'futures': 'raw_cotton',
  
  // ─── FABRİKA / ÜRETİM ─── (karanlık fabrika YASAK → parlak modern üretim)
  'fabrika': 'factory_modern',
  'üretim': 'factory_modern',
  'factory': 'factory_modern',
  'production': 'factory_modern',
  'manufacturing': 'factory_modern',
  'tedarik': 'factory_modern',
  'supply chain': 'factory_modern',
  
  // ─── EKONOMİ / TİCARET / İHRACAT ─── (showroom + ürün → satış hissi)
  'ekonomi': 'factory_modern',
  'economy': 'factory_modern',
  'ihracat': 'fair_booth',
  'export': 'fair_booth',
  'ithalat': 'fair_booth',
  'import': 'fair_booth',
  'piyasa': 'trend_color',
  'market': 'trend_color',
  'ticaret': 'fair_booth',
  'trade': 'fair_booth',
  'gümrük': 'factory_modern',
  'tariff': 'factory_modern',
  'dolar': 'trend_color',
  'euro': 'trend_color',
  'fiyat': 'trend_color',
  'price': 'trend_color',
  'maliyet': 'factory_modern',
  'cost': 'factory_modern',
  
  // ─── OTEL / KONTRAT ─── (lüks otel odası + tekstil)
  'otel': 'bedding_luxury',
  'hotel': 'bedding_luxury',
  'hospitality': 'bedding_luxury',
  'kontrat': 'bedding_luxury',
  'contract': 'bedding_luxury',
  'proje': 'bedding_luxury',
  
  // ─── ANALİZ / REGÜLASYON / RAPOR ─── (showroom + trend)
  'analiz': 'trend_color',
  'analysis': 'trend_color',
  'rapor': 'trend_pattern',
  'report': 'trend_pattern',
  'regülasyon': 'sustainability',
  'regulation': 'sustainability',
  'yasa': 'sustainability',
  'law': 'sustainability',
  'epr': 'sustainability',
  'yeşil': 'sustainability',
  'green': 'sustainability',
  
  // ─── FUAR ───
  'fuar': 'fair_booth',
  'fair': 'fair_booth',
  'heimtextil': 'fair_booth',
  'exhibition': 'fair_booth',
  'hometex': 'fair_booth',
  
  // ─── PERDE / TÜL ─── (ALTIN ALAN)
  'perde': 'curtain_modern',
  'tül': 'curtain_sheer',
  'blackout': 'curtain_blackout',
  'stor': 'curtain_store',
  'curtain': 'curtain_modern',
  'sheer': 'curtain_sheer',
  
  // ─── EV TEKSTİLİ ───
  'nevresim': 'bedding_luxury',
  'yatak': 'bedding_set',
  'havlu': 'towel_set',
  'banyo': 'towel_bath',
  'masa': 'table_linen',
  'döşemelik': 'upholstery',
  'halı': 'carpet_modern',
  'kilim': 'kilim',
  'dekorasyon': 'decorative_pillow',
  'yastık': 'decorative_pillow',
  'battaniye': 'throw_blanket',
  'bornoz': 'bathrobe',
  
  // ─── TREND / İNOVASYON ───
  'trend': 'trend_color',
  'renk': 'trend_color',
  'desen': 'trend_pattern',
  'inovasyon': 'smart_textile',
  'sürdürülebilir': 'sustainability',
  'sustainability': 'sustainability',
  'akıllı': 'smart_textile',
  'smart': 'smart_textile',
  'technology': 'smart_textile',
  'teknoloji': 'smart_textile',
  'dijital': 'smart_textile',
  'yapay zeka': 'smart_textile',
  'ai': 'smart_textile',
  'otomasyon': 'factory_modern',
  
  // ─── FİRMA / MARKA ─── (showroom + premium)
  'firma': 'fair_booth',
  'şirket': 'fair_booth',
  'company': 'fair_booth',
  'yatırım': 'factory_modern',
  'investment': 'factory_modern',

  // ─── VARSAYILAN ───
  'genel': 'general',
  'general': 'general',
};

// ═══════════════════════════════════════
// ZORUNLU KEYWORDLER (HER HABERDE)
// ═══════════════════════════════════════

export const MANDATORY_KEYWORDS = [
  'perde',
  'perde tasarım',
  'ev tekstili',
  'dekorasyon',
  'interior design',
  'curtain design',
  'textile industry',
  'home decor',
];

// ═══════════════════════════════════════
// 1. KATEGORİDEN GÖRSEL KATEGORİ BUL
// ═══════════════════════════════════════

export function resolveVisualCategory(newsCategory: string, title: string = '', tags: string[] = []): Category {
  const searchText = `${newsCategory} ${title} ${tags.join(' ')}`.toLowerCase();
  
  // Önce tam eşleşme
  const directMatch = NEWS_TO_VISUAL_MAP[newsCategory.toLowerCase()];
  if (directMatch) return directMatch;
  
  // Sonra keyword arama
  for (const [keyword, category] of Object.entries(NEWS_TO_VISUAL_MAP)) {
    if (searchText.includes(keyword)) return category;
  }
  
  // Varsayılan: general (karışık B2B ev tekstili sahnesi — curtain-biased değil)
  return 'general';
}

// ═══════════════════════════════════════
// 2. 3 GÖRSEL PROMPT ÜRET (HERO + ORTA + DETAY)
// ═══════════════════════════════════════

export interface TripleImagePrompts {
  hero: { prompt: string; negativePrompt: string; placement: 'after_title' };
  mid: { prompt: string; negativePrompt: string; placement: 'after_paragraph_2' };
  detail: { prompt: string; negativePrompt: string; placement: 'after_paragraph_4' };
}

// ═══════════════════════════════════════
// CONTENT-AWARE SCENE DIRECTOR
// "Döşemelik haber = döşemelik sahne. Perde haberi = perde sahne."
// ═══════════════════════════════════════

const CATEGORY_SCENE_MAP: Record<string, { product: string; scene: string; detail: string }> = {
  // ─── PERDE / TÜL ───
  curtain_modern: {
    product: 'floor-to-ceiling modern curtains in rich neutral tones, elegant draping fabric',
    scene: 'ultra-modern penthouse living room with floor-to-ceiling windows, dramatic golden hour light filtering through the curtain fabric',
    detail: 'extreme close-up of curtain fabric texture showing the weave pattern and light transparency',
  },
  curtain_sheer: {
    product: 'ethereal white sheer curtains gently billowing in breeze, semi-transparent voile fabric',
    scene: 'bright airy minimalist modern room with white marble floors and sheer curtains softly diffusing sunlight',
    detail: 'macro close-up of sheer voile texture with backlight showing luminous translucency',
  },
  curtain_blackout: {
    product: 'premium blackout curtains in dark charcoal/navy, heavy luxurious fabric with clean edges',
    scene: 'high-end boutique hotel room with blackout curtains creating dramatic contrast between dark interior and bright window edge',
    detail: 'close-up fabric swatch of blackout material showing its thickness and matte surface quality',
  },
  curtain_store: {
    product: 'sleek modern roller blinds or Roman shades in neutral tones',
    scene: 'contemporary executive office with floor-to-ceiling roller blinds controlling light, minimalist workspace',
    detail: 'detail shot of roller blind mechanism and fabric junction, showing premium engineering',
  },

  // ─── DÖŞEMELİK ───
  upholstery: {
    product: 'premium upholstery fabric draped over minimalist designer furniture, rich textured chenille or jacquard',
    scene: 'high-end Italian-style furniture showroom with modern sofas and armchairs covered in luxurious upholstery fabric, natural daylight',
    detail: 'extreme macro close-up of upholstery fabric weave showing fiber structure, texture depth, and color richness',
  },

  // ─── YATAK / OTEL TEKSTİLİ ───
  bedding_luxury: {
    product: 'premium white hotel-grade bed linen set with crisp sheets, duvet cover, and decorative pillows',
    scene: 'five-star luxury hotel suite bedroom with perfectly made bed, warm ambient lighting, floor-to-ceiling windows',
    detail: 'close-up of premium cotton percale or sateen bed sheet texture showing thread quality',
  },
  bedding_set: {
    product: 'complete duvet cover set in sophisticated neutral or earth tones on a modern platform bed',
    scene: 'bright contemporary master bedroom with natural wood accents, soft morning light illuminating the bedding',
    detail: 'extreme close-up of duvet fabric showing stitch quality and textile pattern',
  },

  // ─── HAVLU / BANYO ───
  towel_set: {
    product: 'neatly stacked premium white Turkish cotton towels, thick and plush',
    scene: 'luxury spa or five-star hotel bathroom with marble surfaces, rolled towels artistically arranged',
    detail: 'extreme macro of terry cloth towel loops showing cotton fiber density and softness',
  },
  towel_bath: {
    product: 'large premium bath towels and bathrobes hanging in a modern bathroom',
    scene: 'high-end resort bathroom with rain shower, warm lighting, and premium towels displayed elegantly',
    detail: 'close-up of bath towel edge stitching and dobby border detail',
  },
  bathrobe: {
    product: 'plush premium white bathrobe hanging on a modern hook',
    scene: 'luxury spa changing room with sleek lockers, warm lighting, and premium bathrobes',
    detail: 'close-up of bathrobe collar and cuff showing velour texture',
  },

  // ─── MASA ÖRTÜSÜ / DEKORATİF ───
  table_linen: {
    product: 'elegant linen tablecloth and napkin set on a modern dining table',
    scene: 'high-end restaurant or modern dining room with beautiful table setting, natural light',
    detail: 'close-up of linen tablecloth texture and hemstitch detail',
  },
  decorative_pillow: {
    product: 'designer decorative throw pillows with sophisticated geometric or textured patterns',
    scene: 'minimalist modern living room with designer sofa and decorative pillows as accents',
    detail: 'close-up of pillow fabric texture showing embroidery or jacquard pattern',
  },
  throw_blanket: {
    product: 'premium cashmere or wool throw blanket draped over a modern armchair',
    scene: 'sleek reading corner in a luxury penthouse with natural materials and warm lighting',
    detail: 'macro of throw blanket fiber showing cashmere-like softness and weave',
  },

  // ─── HALI / KİLİM ───
  carpet_modern: {
    product: 'high-end contemporary wool carpet with subtle geometric pattern',
    scene: 'modern minimalist living space with a premium carpet as the focal point, warm light',
    detail: 'extreme close-up of carpet pile showing fiber density and pattern detail',
  },
  kilim: {
    product: 'traditional Turkish kilim with authentic geometric patterns in rich natural dyes',
    scene: 'modern bohemian-chic interior with vintage kilim as accent on hardwood floor',
    detail: 'macro shot of kilim flatweave showing the warp and weft color intersections',
  },

  // ─── HAMMADDE ───
  raw_cotton: {
    product: 'raw cotton bolls and premium cotton fiber bundles, artistically arranged',
    scene: 'modern product photography studio with raw cotton displayed on dark slate, dramatic side lighting',
    detail: 'extreme macro of raw cotton fiber showing individual staple length and whiteness',
  },
  raw_linen: {
    product: 'natural flax fiber bundles and raw linen fabric in unbleached tones',
    scene: 'artisan workshop with natural linen at various stages, beautiful warm light',
    detail: 'macro of raw linen fiber showing natural color variation and texture',
  },

  // ─── FABRİKA / ÜRETİM (MODERN) ───
  factory_modern: {
    product: 'state-of-the-art textile production machinery, Jacquard loom, or digital printing head',
    scene: 'bright ultra-modern textile factory floor with clean lines, LED lighting, robotic arms, pristine environment',
    detail: 'close-up of precision machinery component or digital textile printing in action',
  },

  // ─── FUAR ───
  fair_booth: {
    product: 'professionally designed exhibition booth showcasing premium textile products',
    scene: 'modern trade fair hall with sleek booth designs, ambient professional lighting, empty elegand stands',
    detail: 'close-up of beautifully arranged fabric samples on a modern display stand',
  },

  // ─── TREND / RENK / DESEN ───
  trend_color: {
    product: 'cascading array of fabric swatches in the seasons trending color palette',
    scene: 'high-end design studio with color-coordinated fabric samples arranged on a modern work surface, natural daylight',
    detail: 'close-up of rich fabric color gradations showing dye quality and color depth',
  },
  trend_pattern: {
    product: 'contemporary textile patterns — geometric, botanical, or abstract jacquard designs',
    scene: 'modern interior design showroom with patterned textiles displayed as wall art and furnishing',
    detail: 'macro of intricate pattern weave showing jacquard loom precision',
  },

  // ─── SÜRDÜRÜLEBİLİRLİK ───
  sustainability: {
    product: 'organic certified textiles, recycled fiber products with eco-certification tags visible',
    scene: 'modern eco-conscious showroom with natural materials, living plants, and sustainable textiles in warm tones',
    detail: 'close-up of organic certification label and recycled fiber texture',
  },

  // ─── AKILLI TEKSTİL ───
  smart_textile: {
    product: 'motorized smart curtain system or tech-embedded textile product',
    scene: 'futuristic smart home interior with automated blinds, ambient IoT lighting, sleek technology integration',
    detail: 'close-up of smart textile embedded sensor or motorized rail mechanism',
  },

  // ─── GENEL (FALLBACK) ───
  general: {
    product: 'curated arrangement of premium home textiles — curtains, cushions, and throws in coordinated palette',
    scene: 'high-end modern living room styled for an architectural magazine, with beautiful natural light and premium textile accents',
    detail: 'close-up of premium fabric texture showing quality weave and sophisticated color',
  },
};

export function generateTripleImagePrompts(
  newsTitle: string,
  newsCategory: string,
  tags: string[] = []
): TripleImagePrompts {
  const category = resolveVisualCategory(newsCategory, newsTitle, tags);
  const scene = CATEGORY_SCENE_MAP[category] || CATEGORY_SCENE_MAP['general'];
  
  // Hero — ana sahne, geniş açı
  const heroIntent = (category === 'factory_modern' || category === 'raw_cotton') ? 'contract_demand' : 'B2B_INTELLIGENCE';
  const hero = MasterPhotographer.buildMasterPhotographerPrompt({
    visual_intent: { type: heroIntent, mood: 'stable', region: 'GLOBAL' },
    context: `HERO IMAGE for article: "${newsTitle}".
SUBJECT: ${scene.product}.
SCENE: ${scene.scene}.
Ultra-realistic architectural photography, as if shot on medium format film with a 35mm lens.
Hyper-realistic, 2K resolution. Absolutely NO CGI look, NO 3D renders.
The product must be the EXACT subject described above — do NOT substitute with a different product category.`,
  });
  
  // Mid — detay, bağlamsal
  const midCategory = getMidCategory(category);
  const midScene = CATEGORY_SCENE_MAP[midCategory] || CATEGORY_SCENE_MAP['general'];
  const midIntent = (midCategory === 'factory_modern' || midCategory === 'raw_cotton') ? 'contract_demand' : 'B2B_INTELLIGENCE';
  const mid = MasterPhotographer.buildMasterPhotographerPrompt({
    visual_intent: { type: midIntent, mood: 'stable', region: 'GLOBAL' },
    context: `MID-ARTICLE IMAGE for: "${newsTitle}".
SUBJECT: ${midScene.product}.
SCENE: ${midScene.scene}.
Close-up detail shot (85mm lens). Dramatic chiaroscuro lighting or crisp clean daylight.
Sophisticated, minimal, highly expensive catalog look.
The product must match the article topic — do NOT show unrelated textile types.`,
    aspectRatio: '1:1',
  });
  
  // Detail — doku, yakın plan  
  const detailCat = getDetailCategory(category);
  const detailScene = CATEGORY_SCENE_MAP[detailCat] || CATEGORY_SCENE_MAP['general'];
  const detailIntent = (detailCat === 'factory_modern') ? 'contract_demand' : 'B2B_INTELLIGENCE';
  const detail = MasterPhotographer.buildMasterPhotographerPrompt({
    visual_intent: { type: detailIntent, mood: 'stable', region: 'GLOBAL' },
    context: `DETAIL/CLOSING IMAGE for: "${newsTitle}".
SUBJECT: ${detailScene.detail}.
Extreme macro or tight close-up photography showing textile texture at fiber level.
Shot with 100mm macro lens, shallow depth of field, perfect studio or natural lighting.
The textile shown MUST match the article topic exactly — ${newsTitle}.`,
    aspectRatio: '1:1',
  });
  
  return {
    hero: { ...hero, placement: 'after_title' },
    mid: { ...mid, placement: 'after_paragraph_2' },
    detail: { ...detail, placement: 'after_paragraph_4' },
  };
}

// Orta görsel için uygun alt kategori
function getMidCategory(mainCategory: Category): Category {
  const midMap: Partial<Record<Category, Category>> = {
    curtain_modern: 'curtain_sheer',
    curtain_sheer: 'decorative_pillow',
    curtain_blackout: 'bedding_luxury',
    bedding_set: 'decorative_pillow',
    towel_set: 'towel_bath',
    fair_booth: 'trend_color',
    factory_modern: 'curtain_modern',
    raw_cotton: 'sustainability',
  };
  return midMap[mainCategory] || 'decorative_pillow';
}

// Detay görsel için uygun alt kategori
function getDetailCategory(mainCategory: Category): Category {
  const detailMap: Partial<Record<Category, Category>> = {
    curtain_modern: 'trend_pattern',
    curtain_sheer: 'trend_color',
    curtain_blackout: 'curtain_modern',
    bedding_set: 'throw_blanket',
    towel_set: 'bathrobe',
    fair_booth: 'curtain_modern',
    factory_modern: 'smart_textile',
    raw_cotton: 'raw_linen',
  };
  return detailMap[mainCategory] || 'trend_color';
}

// ═══════════════════════════════════════
// 3. KEYWORD ENFORCER
// ═══════════════════════════════════════

export function enforceKeywords(existingTags: string[], newsTitle: string, category: string): string[] {
  const allTags = new Set<string>(existingTags.map(t => t.toLowerCase()));
  
  // 4 zorunlu sabit keyword ekle
  for (const mandatory of MANDATORY_KEYWORDS) {
    allTags.add(mandatory);
  }
  
  // Kategori bazlı dinamik keywordler
  const dynamicKeywords = extractDynamicKeywords(newsTitle, category);
  for (const kw of dynamicKeywords) {
    allTags.add(kw.toLowerCase());
  }
  
  return Array.from(allTags);
}

function extractDynamicKeywords(title: string, category: string): string[] {
  const keywords: string[] = [];
  const text = `${title} ${category}`.toLowerCase();
  
  const potentialKeywords = [
    'ihracat', 'ithalat', 'fuar', 'kumaş', 'polyester', 'pamuk', 'ipek',
    'sürdürülebilir', 'yatırım', 'almanya', 'polonya', 'suudi arabistan',
    'türk tekstil', 'b2b', 'toptan', 'tedarik', 'üretim', 'kalite',
    'moda', 'tasarım', 'inovasyon', 'dijital', 'akıllı tekstil',
    'otel tekstili', 'kontrat', 'proje', 'mimari', 'iç mimarlık',
  ];
  
  for (const kw of potentialKeywords) {
    if (text.includes(kw.split(' ')[0])) {
      keywords.push(kw);
    }
  }
  
  // Minimum 4 dinamik keyword garanti
  if (keywords.length < 4) {
    const defaults = ['türk tekstil', 'b2b', 'toptan', 'tedarik'];
    for (const d of defaults) {
      if (!keywords.includes(d)) keywords.push(d);
      if (keywords.length >= 4) break;
    }
  }
  
  return keywords;
}

// ═══════════════════════════════════════
// 4. AI CEO BLOĞU ŞABLONU
// ═══════════════════════════════════════

export interface AICEOBlock {
  impactScore: number;
  executiveSummary: string[];
  riskVsOpportunity: string;
  threeMonthPrediction: string;
  ceoCommentary: string;
}

export function generateAICEOPrompt(newsTitle: string, newsContent: string): string {
  return `Bu haber hakkında B2B tekstil CEO perspektifinden analiz yap.

HABER: "${newsTitle}"
İÇERİK: ${newsContent.substring(0, 500)}

JSON döndür:
{
  "impactScore": 8,
  "executiveSummary": [
    "Madde 1: ...",
    "Madde 2: ...",
    "Madde 3: ..."
  ],
  "riskVsOpportunity": "Bu gelişme Türk üreticiler için NET FIRSAT / NET RİSK çünkü...",
  "threeMonthPrediction": "Önümüzdeki 3 ayda şunlar bekleniyor...",
  "ceoCommentary": "Bir Türk tekstil CEO'su olarak değerlendirmem: ... | Avrupalı alıcı perspektifi: ..."
}
SADECE JSON döndür.`;
}

// ═══════════════════════════════════════
// 5. İÇERİK YAPI STANDARDI
// ═══════════════════════════════════════

export const CONTENT_STRUCTURE = {
  title: { maxWords: 12, mustIncludeKeyword: true },
  intro: { lines: '2-3', purpose: 'hook — okuyucuyu çek' },
  body: { 
    totalLines: '20-40',
    paragraphSpacing: '4-5 satırda bir böl',
  },
  images: {
    max: 3,
    hero: { position: 'after_title', style: 'full-width', lightbox: true },
    mid: { position: 'after_paragraph_2', style: 'inline', lightbox: true },
    detail: { position: 'after_paragraph_4', style: 'inline', lightbox: true },
  },
  aiCeoBlock: { position: 'end', mandatory: true },
  keywords: { min: 8, mandatoryCount: 4, dynamicCount: 4 },
};

// ═══════════════════════════════════════
// 6. GÖRSEL KALİTE DOĞRULAMA
// ═══════════════════════════════════════

export function validateVisualStandard(imagePrompt: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const lower = imagePrompt.toLowerCase();
  
  // YASAK kontrolleri (COO v2.1: Manifatüracı estetiği MUTLAK YASAK)
  const forbidden = [
    'stock photo', 'generic', 'clipart', 'icon', 'diagram', 'chart only',
    'dark factory', 'cluttered', 'messy', 'low quality', 'grey background',
    'fashion model', 'runway', 'catwalk', 'mannequin', 'plastic texture',
  ];
  for (const f of forbidden) {
    if (lower.includes(f)) issues.push(`YASAK içerik: "${f}"`);
  }
  
  // ZORUNLU kontroller (COO v2.1)
  const required = ['luxury', 'editorial', 'interior', 'textile', 'professional', 'natural light', 'bright'];
  const hasRequired = required.some(r => lower.includes(r));
  if (!hasRequired) issues.push('Lüks/editorial/interior keyword eksik');
  
  return { valid: issues.length === 0, issues };
}

// ═══════════════════════════════════════
// 7. VISUAL DISTRIBUTION MATRIX (COO v2.1 ZORUNLU)
// ═══════════════════════════════════════

export const VISUAL_DISTRIBUTION_MATRIX = {
  'curtain': { target: 40, categories: ['curtain_modern', 'curtain_sheer', 'curtain_blackout', 'curtain_store'] },
  'home_textile': { target: 20, categories: ['bedding_luxury', 'bedding_set', 'towel_set', 'towel_bath', 'bathrobe'] },
  'upholstery': { target: 10, categories: ['upholstery', 'decorative_pillow', 'throw_blanket'] },
  'industrial': { target: 10, categories: ['factory_modern', 'smart_textile'] },
  'raw_materials': { target: 10, categories: ['raw_cotton', 'raw_linen'] },
  'fair': { target: 10, categories: ['fair_booth', 'trend_color', 'trend_pattern'] },
};

// ═══════════════════════════════════════
// 8. SEO IMAGE NAMING (COO v2.1)
// [country]-[product]-[color]-[year].jpg
// ═══════════════════════════════════════

export function generateSEOImageName(
  country: string,
  product: string,
  color: string = 'natural',
  role: 'hero' | 'mid' | 'detail' = 'hero'
): string {
  const year = new Date().getFullYear();
  const slug = (s: string) => s.toLowerCase()
    .replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g')
    .replace(/ü/g,'u').replace(/ö/g,'o').replace(/ı/g,'i')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  
  return `${slug(country)}-${slug(product)}-${slug(color)}-${year}-${role}.jpg`;
}

// ═══════════════════════════════════════
// 9. MANIFATÜRACI BAN — GÖRSEL NEGATİF PROMPT ENFORCER
// ═══════════════════════════════════════

export const MANIFATURACI_BAN_NEGATIVE = [
  'dark factory', 'cluttered workshop', 'messy workspace', 'dim lighting',
  'grey concrete walls', 'rusty machinery', 'dirty floor', 'low-end showroom',
  'cheap plastic', 'fluorescent lighting', 'cramped space', 'wire hangers',
  'fashion model', 'runway', 'catwalk', 'mannequin', 'posed fashion',
  'stock photo', 'generic office', 'bland corporate', 'empty room',
].join(', ');
