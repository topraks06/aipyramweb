/**
 * Server-side news reader (v4.0 — Firebase-Only via AIPyram Brain)
 * 
 * KURALLAR:
 * 1. TEK SOURCE: AIPyram Brain API (Firebase trtex_news) — fs/lokal YASAK
 * 2. image_url boş = haber DÖNMEZ
 * 3. Fallback/sahte veri/last_valid_pool = YASAK
 * 4. Cloud Run uyumlu: Dosya sistemi yok
 */

// Memory Cache
let newsCache: NewsArticle[] | null = null;
let lastFetchTime: number = 0;
const CACHE_TTL_MS = 30_000; // 30 saniye

export interface NewsArticle {
  title: string;
  slug: string;
  content: string;
  summary: string;
  image_url: string;
  published_at: string;
  tags: string[];
  action: string;
  confidence: number;
  opportunity_score: number;
  source: string;
  valid_until?: string;
  urgency?: "high" | "medium" | "low";
  action_id?: string;
  fomo_message?: string;
  signal_status?: "pending" | "success" | "failed";
  category: string;
  reading_time: number;
  id: number | string;
  [key: string]: any;
}

function getBrainUrl(): string {
  // 🟢 TEK KAYNAK KURALI (SINGLE SOURCE TRUTH)
  return process.env.MASTER_API_URL 
    ? `${process.env.MASTER_API_URL}/api/v1/triple-output` 
    : 'http://localhost:3000/api/v1/triple-output';
}

// ═══════════════════════════════════════
// SAYFALANMIŞ HABER ÇEKİMİ (Server-Side Pagination)
// ═══════════════════════════════════════
export interface PaginatedNewsResult {
  articles: NewsArticle[];
  total: number;
  totalPages: number;
  page: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export async function getPaginatedNews(page: number = 1, limit: number = 12): Promise<PaginatedNewsResult> {
  try {
    const brainUrl = `${getBrainUrl()}?page=${page}&limit=${limit}`;
    console.log(`[news-reader v4] 🔄 Paginated: page=${page}, limit=${limit}`);
    
    const res = await fetch(brainUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      console.error(`[news-reader v4] ❌ Brain API ${res.status} döndü`);
      return { articles: [], total: 0, totalPages: 0, page, hasNext: false, hasPrev: false };
    }

    const data = await res.json();
    const rawNews = data?.data || [];
    const articles = mapRawToArticles(rawNews);

    return {
      articles,
      total: data.total || articles.length,
      totalPages: data.totalPages || 1,
      page: data.page || page,
      hasNext: data.hasNext || false,
      hasPrev: data.hasPrev || false,
    };
  } catch (err: any) {
    console.error(`[news-reader v4] ❌ Paginated fetch hatası:`, err.message);
    return { articles: [], total: 0, totalPages: 0, page, hasNext: false, hasPrev: false };
  }
}

// ═══════════════════════════════════════
// TEK HABER ÇEKİMİ (Detay sayfası için)
// ═══════════════════════════════════════
export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    const brainUrl = `${getBrainUrl()}?slug=${encodeURIComponent(slug)}&limit=1`;
    console.log(`[news-reader v4] 🔄 Otonom Brain'den Tek Haber Sorgusu: ${slug}`);
    
    const res = await fetch(brainUrl, {
      cache: 'no-store', // Veri sürekli canlı
      signal: AbortSignal.timeout(8000),
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      console.error(`[news-reader v4] ❌ Brain API ${res.status} döndü`);
      return null;
    }

    const data = await res.json();
    const rawNews = data?.data || [];
    
    if (rawNews.length === 0) {
       return null;
    }

    const articles = mapRawToArticles(rawNews);
    return articles[0] || null;
  } catch (err: any) {
    console.error(`[news-reader v4] ❌ Tek haber sorgu hatası:`, err.message);
    return null;
  }
}

// ═══════════════════════════════════════
// TÜM HABERLERİ ÇEK (slug lookup + detail page için)
// ═══════════════════════════════════════
export async function getPublishedNews(): Promise<NewsArticle[]> {
  const now = Date.now();
  if (newsCache && newsCache.length > 0 && (now - lastFetchTime < CACHE_TTL_MS)) {
    return newsCache;
  }

  try {
    const brainUrl = `${getBrainUrl()}?limit=500`;
    console.log(`[news-reader v4] 🔄 Brain'den haber çekiliyor: ${brainUrl}`);
    
    const res = await fetch(brainUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      console.error(`[news-reader v4] ❌ Brain API ${res.status} döndü — VERİ YOK`);
      return []; // FALLBACK YOK
    }

    const data = await res.json();
    const rawNews = data?.data || data?.articles || data || [];
    
    if (!Array.isArray(rawNews)) {
      console.error('[news-reader v4] ❌ Brain API beklenmeyen format döndü');
      return [];
    }

    const articles = mapRawToArticles(rawNews);

    if (articles.length > 0) {
      newsCache = articles;
      lastFetchTime = now;
      console.log(`[news-reader v4] ✅ ${articles.length} haber Firebase'den çekildi`);
    }

    return articles;
  } catch (err: any) {
    console.error(`[news-reader v4] ❌ Brain erişilemedi:`, err.message);
    return []; // FALLBACK YOK — boş dön
  }
}

// ═══════════════════════════════════════
// HAM VERİ → ARTICLE DÖNÜŞÜMÜ (tek yer, tekrar yok)
// ═══════════════════════════════════════
const INDUSTRIAL_PLACEHOLDER = 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80&auto=format';

function mapRawToArticles(rawNews: any[]): NewsArticle[] {
  const articles: NewsArticle[] = [];
  let skippedNoImage = 0;

  for (const item of rawNews) {
    const rawImageUrl = item.image_url || item.cover_image || '';
    const imageUrl = (rawImageUrl && rawImageUrl.trim() !== '') ? rawImageUrl : INDUSTRIAL_PLACEHOLDER;
    if (!rawImageUrl || rawImageUrl.trim() === '') {
      skippedNoImage++;
    }

    const intelligence = item.intelligence || {};
    const insight = item.insight || {};
    const actionLayer = item.action_layer || {};

    articles.push({
      title: intelligence.translations?.TR?.title || item.title || 'Bilinmeyen Sinyal',
      slug: item.slug || String(item.id || item._id || Math.random().toString(36).substring(7)),
      content: intelligence.translations?.TR?.content || item.content || '',
      summary: intelligence.translations?.TR?.summary || item.summary || '',
      image_url: imageUrl,
      image_status: item.image_status || (rawImageUrl ? 'ready' : 'pending'),
      images: item.images || [],
      videos: item.videos || [],
      published_at: item._timestamp || item.published_at || new Date().toISOString(),
      created_at: item._timestamp || item.created_at || new Date().toISOString(),
      tags: Array.isArray(item.tags) ? item.tags : [],
      action: actionLayer.action || item.action || '',
      confidence: typeof item.confidence === 'number' ? item.confidence : 0,
      opportunity_score: typeof item.opportunity_score === 'number' ? item.opportunity_score : 0,
      commercial_score: typeof item.commercial_score === 'number' ? item.commercial_score : 0,
      trust_score: typeof item.trust_score === 'number' ? item.trust_score : 0.85,
      source: item.source || 'AIPYRAM MASTER NODE',
      source_urls: item.source_urls || [],
      valid_until: item.valid_until || '',
      urgency: insight.market_impact_score > 80 ? 'high' : 'low',
      action_id: item.action_id || '',
      fomo_message: item.fomo_message || '',
      signal_status: 'pending',
      category: intelligence.translations?.TR?.category || item.category || 'İstihbarat',
      reading_time: 3,
      id: item._id || item.id || `brain-${Date.now()}`,
      ai_insight: insight.explanation || item.ai_insight || '',
      ai_action: actionLayer.manufacturer || item.ai_action || '',
      related_company: item.related_company || '',
      translations: intelligence.translations || item.translations || {},
      target_audience: item.target_audience || null,
      sector_action: item.sector_action || '',
      business_opportunities: item.business_opportunities || [],
      status: 'published',
      _source: 'triple-output-api',
    });
  }

  if (skippedNoImage > 0) {
    console.warn(`[news-reader v4] 🖼️ ${skippedNoImage} haber görselsiz — placeholder kullanıldı`);
  }

  // Tarihe göre sırala (en yeni önce)
  articles.sort((a, b) => 
    new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
  );

  return articles;
}

/**
 * Radar haberleri de Brain API'den çekilir.
 * Ayrı bir koleksiyon yoksa published news'tan döner.
 */
export async function getRadarNews(): Promise<NewsArticle[]> {
  const allNews = await getPublishedNews();
  return allNews.filter(n => n.category === 'Radar Alert');
}

