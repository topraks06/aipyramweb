/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  AIPYRAM GLOBAL SLUG STANDARD                             ║
 * ║  Tüm projeler için URL-safe slug üretimi                  ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * KURAL: Slug ASLA Türkçe karakter içermez.
 * ğ→g, ü→u, ş→s, ı→i, ö→o, ç→c
 * Bu sayede URL encoding farkları 404'e neden olmaz.
 * 
 * Tüm publisher'lar, agent'lar ve Aloha bu fonksiyonu kullanır.
 */

const TR_CHAR_MAP: Record<string, string> = {
  'ğ': 'g', 'Ğ': 'g',
  'ü': 'u', 'Ü': 'u',
  'ş': 's', 'Ş': 's',
  'ı': 'i', 'İ': 'i',
  'ö': 'o', 'Ö': 'o',
  'ç': 'c', 'Ç': 'c',
  'â': 'a', 'Â': 'a',
  'î': 'i', 'Î': 'i',
  'û': 'u', 'Û': 'u',
};

/**
 * URL-safe slug üretir. Türkçe karakterleri ASCII'ye çevirir.
 * 
 * @example
 * slugify("Türk Tekstil Fabrikalarında Otomasyon")
 * // → "turk-tekstil-fabrikalarinda-otomasyon"
 * 
 * @param text - Slugify edilecek metin (genellikle haber başlığı)
 * @param maxLength - Maksimum slug uzunluğu (default: 80)
 * @returns URL-safe slug string
 */
export function slugify(text: string, maxLength: number = 80): string {
  if (!text || typeof text !== 'string') return '';
  
  let slug = text.toLowerCase();
  
  // Türkçe karakterleri ASCII'ye çevir
  for (const [tr, en] of Object.entries(TR_CHAR_MAP)) {
    slug = slug.split(tr).join(en);
  }
  
  // Sadece alfanümerik ve tire bırak
  slug = slug
    .replace(/[^a-z0-9\s-]/g, '')  // özel karakterleri kaldır
    .replace(/\s+/g, '-')           // boşlukları tire yap
    .replace(/-+/g, '-')            // çoklu tireleri tekleştir
    .replace(/^-|-$/g, '')          // baş/son tireleri kaldır
    .substring(0, maxLength);
  
  return slug || `article-${Date.now()}`;
}

/**
 * Verilen slug'ı normalize eder (karşılaştırma için).
 * URL-encoded veya Türkçe karakterli slug'ları standart forma çevirir.
 * 
 * @example
 * normalizeSlug("tekstil-fabrikalar%C4%B1nda")
 * // → "tekstil-fabrikalarinda"
 */
export function normalizeSlug(input: string): string {
  try {
    const decoded = decodeURIComponent(input);
    return slugify(decoded);
  } catch {
    return slugify(input);
  }
}

/**
 * İki slug'ın aynı habere ait olup olmadığını kontrol eder.
 * URL encoding, Türkçe karakter ve kısmi eşleşme toleransı vardır.
 */
export function slugsMatch(slug1: string, slug2: string): boolean {
  const n1 = normalizeSlug(slug1);
  const n2 = normalizeSlug(slug2);
  
  if (n1 === n2) return true;
  
  // Kısmi eşleşme (birinin diğerini içermesi, min 25 karakter)
  const minLen = Math.min(25, Math.min(n1.length, n2.length));
  return n1.includes(n2.substring(0, minLen)) || n2.includes(n1.substring(0, minLen));
}

/**
 * Başlık ile slug arasında eşleşme kontrolü.
 * Başlıktan slug üretip karşılaştırır.
 */
export function titleMatchesSlug(title: string, slug: string): boolean {
  if (!title || !slug) return false;
  const titleSlug = slugify(title);
  return slugsMatch(titleSlug, slug);
}
