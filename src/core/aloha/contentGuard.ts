/**
 * CONTENT GUARD -- Yasakli Kelime & Kural Denetimi
 * 
 * ONCEKI DURUM:
 *   fs.readFileSync ile .wiki/forbidden_terms.json okunuyordu.
 *   Cloud Run ortaminda dosya bulunamadigindan sistem KORUMASIZ calisiyordu.
 * 
 * YENI MIMARI:
 *   Kurallar dogrudan bellekte tanimli (Cloud-Native uyumlu).
 *   Firestore'dan dinamik kural cekme kapasitesi eklendi.
 *   FS bagimliligi TAMAMEN kaldirildi.
 * 
 * Kullanim:
 *   import { validateContent, sanitizeContent } from '@/core/aloha/contentGuard';
 *   const result = validateContent(text, 'article');
 *   if (!result.valid) console.warn('Ihlaller:', result.violations);
 *   const clean = sanitizeContent(text, 'article');
 */

// FS IMPORT KALDIRILDI -- Cloud Run uyumsuzlugu giderildi

interface ForbiddenRule {
  id: string;
  applies_to: string[];
  terms: string[];
  action: 'block' | 'replace' | 'note';
  reason: string;
  alternatives?: Record<string, string>;
  notes?: Record<string, string>;
}

interface ForbiddenTerms {
  version: string;
  updated_at: string;
  rules: ForbiddenRule[];
}

// =============================================
// IN-MEMORY KURAL SETI (Cloud-Native)
// .wiki/forbidden_terms.json icerigi buraya tasindi
// =============================================

const EMBEDDED_RULES: ForbiddenTerms = {
  version: '2.1',
  updated_at: '2026-04-11',
  rules: [
    {
      id: 'visual_forbidden',
      applies_to: ['image_prompt', 'visual_description'],
      terms: [
        'karanlık', 'kirli', 'depo', 'manifaturacı', 'ucuz',
        'warehouse', 'dark', 'dirty', 'messy', 'cheap', 'old', 'storage', 'budget', 'eski',
      ],
      action: 'block',
      reason: 'aipyram marka estetiği — negatif çağrışımlı görseller yasak',
      alternatives: {
        'karanlık': 'loş aydınlatma',
        'kirli': 'ham doku',
        'depo': 'showroom',
        'manifaturacı': 'kumaş atölyesi',
        'ucuz': 'uygun fiyatlı',
        'dark': 'moody lighting',
        'dirty': 'raw texture',
        'warehouse': 'showroom',
        'cheap': 'value-oriented',
        'old': 'classic',
      },
    },
    {
      id: 'content_forbidden',
      applies_to: ['article', 'seo_text', 'product_description'],
      terms: ['en ucuz', 'kalitesiz', 'Çin malı', 'depo satışı', 'manifaturacı'],
      action: 'replace',
      reason: 'B2B profesyonel ton — düşük kalite çağrışımı yasak',
      alternatives: {
        'en ucuz': 'en uygun fiyat-performans',
        'kalitesiz': 'standart altı',
        'Çin malı': 'uzak doğu üretimi',
        'depo satışı': 'toptan satış noktası',
        'manifaturacı': 'tekstil tedarikçisi',
      },
    },
    {
      id: 'brand_wall',
      applies_to: ['article', 'seo_text', 'product_description', 'image_prompt', 'visual_description'],
      terms: ['Gemini', 'GPT', 'Claude', 'OpenAI', 'Anthropic', 'Google AI', 'ChatGPT', 'GPT-4', 'GPT-3'],
      action: 'replace',
      reason: 'BRAND WALL — Dış platform isimleri sızdırılamaz. Her şey TRTEX Intelligence markası altında kalmalı.',
      alternatives: {
        'Gemini': 'TRTEX Intelligence',
        'GPT': 'TRTEX IQ',
        'Claude': 'TRTEX Intelligence',
        'OpenAI': 'aipyram',
        'Anthropic': 'aipyram',
        'Google AI': 'TRTEX Intelligence',
        'ChatGPT': 'TRTEX IQ',
        'GPT-4': 'TRTEX Intelligence',
        'GPT-3': 'TRTEX Intelligence',
      },
    },
    {
      id: 'textile_corrections',
      applies_to: ['article', 'product_description'],
      terms: [],
      action: 'note',
      reason: 'Sektörel doğruluk — keten kuralı ve pamuk blend bilgisi',
      notes: {
        'keten': 'Keten denildiğinde %100 polyester keten görünümlü kumaş kastedilir. Gerçek keten (flax) için açıkça doğal keten veya %100 linen belirt. MALİYET HESABI keten bazlı YAPILAMAZ — polyester-linen blend bazlı yapılmalı.',
        'pamuk': 'Türk ev tekstilinde pamuk oranı genellikle %20-40 (polycotton blend). %100 pamuk nadir ve premium segmenttedir.',
        'linen': 'Linen = polyester-linen blend (keten görünümlü). Gerçek linen değil. Maliyet farkı 3-5x.',
      },
    },
  ],
};

// Firestore'dan dinamik kural cekme (ileride aktif edilecek)
let _cachedRules: ForbiddenTerms | null = null;
let _rulesLoadedAt: number = 0;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 dakika

async function loadRulesAsync(): Promise<ForbiddenTerms> {
  // Cache hala gecerli mi?
  if (_cachedRules && (Date.now() - _rulesLoadedAt) < CACHE_TTL_MS) {
    return _cachedRules;
  }

  // Firestore'dan cekmeyi dene (ilerideki faz icin hazir)
  try {
    const { adminDb } = await import('@/lib/firebase-admin');
    if (adminDb) {
      const doc = await adminDb.collection('system_config').doc('content_guard_rules').get();
      if (doc.exists) {
        const data = doc.data() as ForbiddenTerms;
        if (data && data.rules && data.rules.length > 0) {
          _cachedRules = data;
          _rulesLoadedAt = Date.now();
          return _cachedRules;
        }
      }
    }
  } catch {
    // Firestore erisilemezse embedded kurallari kullan
  }

  // Embedded kurallari kullan (her zaman calisir)
  _cachedRules = EMBEDDED_RULES;
  _rulesLoadedAt = Date.now();
  return _cachedRules;
}

// Senkron versiyon (geriye uyumluluk)
function loadRules(): ForbiddenTerms {
  return _cachedRules || EMBEDDED_RULES;
}

/**
 * Icerigi yasakli terimler acisindan dogrula
 */
export function validateContent(
  content: string,
  type: 'article' | 'image_prompt' | 'seo_text' | 'product_description' | 'visual_description'
): {
  valid: boolean;
  violations: Array<{ term: string; rule: string; reason: string; suggestion?: string }>;
} {
  const rules = loadRules();
  const violations: Array<{ term: string; rule: string; reason: string; suggestion?: string }> = [];
  const lowerContent = content.toLowerCase();

  for (const rule of rules.rules) {
    if (!rule.applies_to.includes(type)) continue;
    
    for (const term of rule.terms) {
      if (lowerContent.includes(term.toLowerCase())) {
        violations.push({
          term,
          rule: rule.id,
          reason: rule.reason,
          suggestion: rule.alternatives?.[term] || undefined,
        });
      }
    }
  }

  return { valid: violations.length === 0, violations };
}

/**
 * Icerikteki yasakli terimleri alternatiflerle degistir
 */
export function sanitizeContent(
  content: string,
  type: 'article' | 'image_prompt' | 'seo_text' | 'product_description' | 'visual_description'
): { cleaned: string; replacements: number } {
  const rules = loadRules();
  let cleaned = content;
  let replacements = 0;

  for (const rule of rules.rules) {
    if (!rule.applies_to.includes(type)) continue;
    if (rule.action !== 'replace' && rule.action !== 'block') continue;
    
    for (const term of rule.terms) {
      const regex = new RegExp(term, 'gi');
      if (regex.test(cleaned)) {
        const replacement = rule.alternatives?.[term] || '';
        if (rule.action === 'replace' && replacement) {
          cleaned = cleaned.replace(regex, replacement);
        } else if (rule.action === 'block') {
          cleaned = cleaned.replace(regex, '');
        }
        replacements++;
      }
    }
  }

  return { cleaned: cleaned.replace(/\s{2,}/g, ' ').trim(), replacements };
}

/**
 * Sektorel bilgi notlarini getir (keten kurali vb.)
 */
export function getDomainNotes(term: string): string | null {
  const rules = loadRules();
  
  for (const rule of rules.rules) {
    if (rule.notes && term.toLowerCase() in rule.notes) {
      return rule.notes[term.toLowerCase()];
    }
  }
  
  return null;
}

/**
 * Kurallari yeniden yukle (Firestore'dan)
 */
export async function reloadRules(): Promise<void> {
  _cachedRules = null;
  _rulesLoadedAt = 0;
  await loadRulesAsync();
}

/**
 * Kurallari Firestore'a kaydet (tek seferlik migrasyon)
 */
export async function migrateRulesToFirestore(): Promise<boolean> {
  try {
    const { adminDb } = await import('@/lib/firebase-admin');
    if (!adminDb) return false;

    await adminDb.collection('system_config').doc('content_guard_rules').set(EMBEDDED_RULES);
    console.log('[CONTENT GUARD] Kurallar Firestore\'a yazildi (system_config/content_guard_rules)');
    return true;
  } catch {
    console.warn('[CONTENT GUARD] Firestore\'a yazma basarisiz');
    return false;
  }
}

// =============================================
// BRAND WALL SCAN -- Marka Sizinti Denetimi
// =============================================

const BRAND_WALL_TERMS = ['gemini', 'gpt', 'claude', 'openai', 'anthropic', 'google ai', 'chatgpt', 'gpt-4', 'gpt-3'];

/**
 * Icerikte yasakli platform isimlerini tara
 * Aloha her audit dongusunde bunu calistirir
 */
export function brandWallScan(content: string): {
  clean: boolean;
  breaches: Array<{ term: string; position: number; context: string }>;
} {
  const lower = content.toLowerCase();
  const breaches: Array<{ term: string; position: number; context: string }> = [];

  for (const term of BRAND_WALL_TERMS) {
    let idx = lower.indexOf(term);
    while (idx !== -1) {
      const start = Math.max(0, idx - 30);
      const end = Math.min(content.length, idx + term.length + 30);
      breaches.push({
        term,
        position: idx,
        context: content.substring(start, end),
      });
      idx = lower.indexOf(term, idx + 1);
    }
  }

  return { clean: breaches.length === 0, breaches };
}

// =============================================
// LINEN-LOOK AUDIT -- Keten Maliyet Dogrulama
// =============================================

/**
 * Icerikte "keten" gectiginde maliyetin polyester-linen blend
 * bazli olup olmadigini kontrol eder.
 */
export function linenCostAudit(content: string): {
  valid: boolean;
  warnings: string[];
} {
  const lower = content.toLowerCase();
  const warnings: string[] = [];

  // "keten" geciyor mu?
  if (!lower.includes('keten') && !lower.includes('linen')) {
    return { valid: true, warnings: [] };
  }

  // Keten geciyorsa, polyester/blend belirtilmis mi?
  const hasBlendMention = lower.includes('polyester') ||
    lower.includes('blend') ||
    lower.includes('gorunumlu') ||
    lower.includes('linen-look') ||
    lower.includes('keten gorunum');

  // Maliyet/fiyat baglaminda mi?
  const hasCostContext = lower.includes('maliyet') ||
    lower.includes('fiyat') ||
    lower.includes('cost') ||
    lower.includes('price') ||
    lower.includes('$/m') ||
    lower.includes('\u20ac/m');

  if (hasCostContext && !hasBlendMention) {
    warnings.push(
      'LINEN-LOOK KURALI: "Keten" gecen maliyet hesabi tespit edildi. ' +
      'Turk ev tekstilinde keten = polyester-linen blend. ' +
      'Gercek keten (flax) maliyeti 3-5x daha pahalidir. ' +
      'Maliyet hesabini polyester-linen blend bazina duzelt.'
    );
  }

  // "Dogal keten" veya "%100 linen" acikca belirtilmisse OK
  const isExplicitRealLinen = lower.includes('dogal keten') ||
    lower.includes('%100 linen') ||
    lower.includes('pure linen') ||
    lower.includes('flax');

  if (isExplicitRealLinen) {
    return { valid: true, warnings: [] };
  }

  return { valid: warnings.length === 0, warnings };
}
