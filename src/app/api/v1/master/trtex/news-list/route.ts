import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const revalidate = 0; // Force dynamic

// ═══════════════════════════════════════
// SCHEMA BRIDGE — compose_article → Frontend
// ═══════════════════════════════════════

/**
 * HTML content → Frontend markdown paragraph format
 * Frontend splits by \n\n and uses ## for headings
 * compose_article writes <h2>, <h3>, <table>, <ul> HTML
 */
function normalizeContent(html: string): string {
  if (!html) return '';
  
  let text = html;
  
  // HTML headings → markdown
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n\n## $1\n\n');
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n\n### $1\n\n');
  
  // HTML paragraphs → double newline
  text = text.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n');
  text = text.replace(/<p[^>]*>/gi, '');
  text = text.replace(/<\/p>/gi, '\n\n');
  
  // Lists → markdown
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  text = text.replace(/<\/?[uo]l[^>]*>/gi, '\n');
  
  // Bold
  text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  
  // Blockquote
  text = text.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '\n> $1\n');
  
  // Tables → preserve as HTML (frontend can render)
  // Leave tables as-is since they need HTML rendering
  
  // Line breaks
  text = text.replace(/<br\s*\/?>/gi, '\n');
  
  // Strip remaining HTML tags (except tables)
  text = text.replace(/<(?!\/?table|\/?tr|\/?td|\/?th)[^>]+>/gi, '');
  
  // Clean up excessive newlines
  text = text.replace(/\n{3,}/g, '\n\n');
  
  return text.trim();
}

/**
 * compose_article media.images → Frontend images[] eşlemesi
 * compose_article writes: media.images = [{url, caption, alt_text, order}]
 * Frontend expects: images = [{url, type, alt}] or string[]
 */
function normalizeImages(
  mediaImages: any[] | undefined,
  heroUrl: string,
  midUrl?: string,
  detailUrl?: string
): Array<{url: string; type: string; alt: string}> {
  const images: Array<{url: string; type: string; alt: string}> = [];
  
  if (mediaImages && Array.isArray(mediaImages) && mediaImages.length > 0) {
    // compose_article media.images format
    for (const img of mediaImages) {
      if (img.url) {
        images.push({
          url: img.url,
          type: img.type || 'image',
          alt: img.alt_text || img.caption || img.alt || '',
        });
      }
    }
  }
  
  // Fallback: ayrı alanlardan birleştir
  if (images.length === 0) {
    if (heroUrl) images.push({ url: heroUrl, type: 'hero', alt: 'Hero görsel' });
    if (midUrl) images.push({ url: midUrl, type: 'mid', alt: 'Detay görsel' });
    if (detailUrl) images.push({ url: detailUrl, type: 'detail', alt: 'Doku görsel' });
  }
  
  return images;
}

/**
 * GET /api/v1/master/trtex/news-list
 * 
 * Firebase trtex_news koleksiyonundan haberleri çeker.
 * TRTEX "Dumb Client" bu endpoint'ten beslenir.
 * 
 * PAGINATION DESTEKLI:
 *   ?page=1&limit=12     → sayfa 1,  12 haber
 *   ?page=2&limit=12     → sayfa 2,  12 haber
 *   ?category=perde      → kategori filtresi
 *   ?status=published    → sadece yayınlanmış
 * 
 * KURALLAR:
 * 1. TEK SOURCE: Firebase Firestore trtex_news
 * 2. image_url boş → haber DÖNMEZ, log atılır
 * 3. Herhangi bir spread (...data) = YASAK — sadece bilinen alanlar dönülür
 * 4. SEO: totalPages, hasNext, hasPrev meta dönülür
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const category = searchParams.get('category') || '';
    const statusFilter = searchParams.get('status') || '';
    const slugQuery = searchParams.get('slug') || '';

    // ═══ TEK HABER SORGUSU (slug ile) ═══
    if (slugQuery) {
      const slugNormalized = slugQuery.toLowerCase().trim();
      // Önce birebir slug eşleşmesi dene
      const slugSnap = await adminDb.collection('trtex_news')
        .where('slug', '==', slugNormalized)
        .limit(1)
        .get();
      
      let matchDoc = slugSnap.docs[0];

      // Slug bulunamazsa tüm yayınlanmışları tara (slug format farkı olabilir)
      if (!matchDoc) {
        const allSnap = await adminDb.collection('trtex_news')
          .where('status', '==', 'published')
          .limit(500)
          .get();
        
        matchDoc = allSnap.docs.find(doc => {
          const d = doc.data();
          const docSlug = (d.slug || '').toLowerCase().trim();
          const titleSlug = (d.translations?.TR?.title || d.title || '')
            .toLowerCase()
            .replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g')
            .replace(/ü/g,'u').replace(/ö/g,'o').replace(/ı/g,'i')
            .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
          return docSlug === slugNormalized 
            || titleSlug === slugNormalized
            || slugNormalized.includes(docSlug.substring(0, 25))
            || docSlug.includes(slugNormalized.substring(0, 25));
        }) as any;
      }

      if (!matchDoc) {
        return NextResponse.json({ success: false, data: [], error: 'Haber bulunamadı' }, { status: 404 });
      }

      // Tek haberi formatla (aşağıdaki aynı normalizasyon mantığı)
      const data = matchDoc.data();
      const INDUSTRIAL_PLACEHOLDER = 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80&auto=format';
      const rawImageUrl = data.image_url || data.cover_image || data.media?.images?.[0]?.url || '';
      const imageUrl = (rawImageUrl && rawImageUrl.trim() !== '') ? rawImageUrl : INDUSTRIAL_PLACEHOLDER;
      const rawTitle = (data.translations?.TR?.title && data.translations.TR.title.trim()) || (data.title && data.title.trim()) || '';
      const rawContent = data.translations?.TR?.content || data.content || data.body || '';
      const rawSummary = data.translations?.TR?.summary || data.summary || data.summary_tr || '';
      const rawSlug = data.slug || rawTitle.toLowerCase()
        .replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g')
        .replace(/ü/g,'u').replace(/ö/g,'o').replace(/ı/g,'i')
        .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').substring(0, 60);
      const rawDate = data.publishedAt || data.published_at || data.createdAt || data.created_at || new Date().toISOString();

      const article = {
        id: matchDoc.id,
        title: rawTitle,
        summary: rawSummary,
        content: normalizeContent(rawContent),
        category: data.category || 'İstihbarat',
        image_url: imageUrl,
        image_status: data.image_status || (rawImageUrl ? 'ready' : 'pending'),
        images: normalizeImages(data.media?.images, imageUrl, data.mid_image_url, data.detail_image_url),
        slug: rawSlug,
        published_at: rawDate,
        created_at: data.createdAt || data.created_at || rawDate,
        reading_time: data.reading_time || Math.ceil(((rawContent || '').split(/\s+/).length) / 200) || 3,
        ai_insight: data.ai_insight || data.ai_commentary || data.terminal_comment || '',
        ai_action: data.ai_action || (Array.isArray(data.action_items) ? data.action_items.join(' • ') : '') || '',
        tags: data.tags || [],
        keywords: data.seo?.keywords || data.tags || [],
        related_company: data.related_company || '',
        translations: data.translations || {},
        business_opportunities: data.business_opportunities || [],
        target_audience: data.target_audience || null,
        sector_action: data.sector_action || '',
        urgency: data.urgency || 'normal',
        action_items: data.action_items || [],
        executive_summary: data.executive_summary || [],
      };

      return NextResponse.json({ success: true, total: 1, page: 1, limit: 1, totalPages: 1, hasNext: false, hasPrev: false, data: [article] });
    }

    // ─── HABER ÇEK (tümünü çek, JS'te filtrele/sırala) ───
    let query: FirebaseFirestore.Query = adminDb.collection('trtex_news');
    
    // Status: varsayılan published, query param ile override edilebilir
    const effectiveStatus = statusFilter || 'published';
    query = query.where('status', '==', effectiveStatus);

    if (category) {
      query = query.where('category', '==', category);
    }

    // ─── TOTAL COUNT ───
    const countSnap = await adminDb.collection('trtex_news').where('status', '==', 'published').count().get();
    const totalItems = countSnap.data().count;

    // ─── PAGINATION: Index varsa offset/limit, yoksa JS fallback ───
    const startIndex = (page - 1) * limit;
    let snapshot;

    try {
      // Composite index ile (hızlı yol)
      let paginatedQuery = query.orderBy('published_at', 'desc');
      if (startIndex > 0) paginatedQuery = paginatedQuery.offset(startIndex);
      paginatedQuery = paginatedQuery.limit(limit);
      snapshot = await paginatedQuery.get();
    } catch (indexErr: any) {
      // Index henüz building durumundaysa → JS fallback
      console.warn(`[news-list] ⚠️ Index fallback aktif: ${indexErr.message?.substring(0, 100)}`);
      const allSnap = await query.limit(500).get();
      // JS'te sırala
      const allDocs = allSnap.docs.sort((a, b) => {
        const dateA = a.data().published_at || a.data().publishedAt || '2000-01-01';
        const dateB = b.data().published_at || b.data().publishedAt || '2000-01-01';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      // JS'te paginate
      snapshot = { docs: allDocs.slice(startIndex, startIndex + limit) } as any;
    }

    const allNews: any[] = [];
    let skippedNoImage = 0;
    let skippedNoTitle = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      // 🔧 PLACEHOLDER FALLBACK: Görselsiz haberler artık atılmaz, endüstriyel placeholder alır
      // Image Worker arkaplanda gerçek görseli üretecek — o zamana kadar placeholder gösterilir
      const INDUSTRIAL_PLACEHOLDER = 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80&auto=format';
      const rawImageUrl = data.image_url || data.cover_image || data.media?.images?.[0]?.url || '';
      const imageUrl = (rawImageUrl && rawImageUrl.trim() !== '') ? rawImageUrl : INDUSTRIAL_PLACEHOLDER;
      if (!rawImageUrl || rawImageUrl.trim() === '') {
        skippedNoImage++;
        // continue KALDIRILDI — haber artık placeholder ile geçer
      }

      // ═══════════════════════════════════════
      // 🔥 NORMALIZATION KİLİDİ — Firestore format farkları burada çözülür
      // Firestore'da title: data.title, data.translations.TR.title, data.title_tr olabilir
      // ═══════════════════════════════════════
      const rawTitle = 
        (data.translations?.TR?.title && data.translations.TR.title.trim()) ||
        (data.title && data.title.trim()) ||
        (data.title_tr && data.title_tr.trim()) ||
        '';

      // Başlıksız haberleri DIŞLA — kullanıcıya gösterme
      if (!rawTitle) {
        skippedNoTitle++;
        continue;
      }

      const rawContent = 
        data.translations?.TR?.content || data.content || data.body || '';

      const rawSummary =
        data.translations?.TR?.summary || data.summary || data.summary_tr || '';

      // Slug: asla boş kalmamalı
      const rawSlug = data.slug || 
        rawTitle.toLowerCase()
          .replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g')
          .replace(/ü/g,'u').replace(/ö/g,'o').replace(/ı/g,'i')
          .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
          .substring(0, 60) ||
        `haber-${doc.id.substring(0, 12)}`;

      // Tarih: publishedAt, published_at, createdAt, created_at — hepsi olabilir
      const rawDate = data.publishedAt || data.published_at || data.createdAt || data.created_at || new Date().toISOString();

      allNews.push({
        id: doc.id,
        title: rawTitle,
        summary: rawSummary,
        content: normalizeContent(rawContent),
        category: data.category || 'İstihbarat',
        image_url: imageUrl,
        image_status: data.image_status || (rawImageUrl ? 'ready' : 'pending'),
        images: normalizeImages(data.media?.images, imageUrl, data.mid_image_url, data.detail_image_url),
        mid_image_url: data.mid_image_url || '',
        detail_image_url: data.detail_image_url || '',
        slug: rawSlug,
        published_at: rawDate,
        created_at: data.createdAt || data.created_at || rawDate,
        reading_time: data.reading_time || Math.ceil(((rawContent || '').split(/\s+/).length) / 200) || 3,
        action_score: data.qualityScore || data.quality_score || 0,
        urgency: data.urgency || ((data.qualityScore || data.quality_score || 0) > 80 ? 'critical' : 'normal'),
        ai_insight: data.ai_insight || data.ai_commentary || data.terminal_comment || '',
        ai_action: data.ai_action || (Array.isArray(data.action_items) ? data.action_items.join(' • ') : '') || '',
        tags: data.tags || [],
        keywords: data.seo?.keywords || data.tags || [],
        related_company: data.related_company || '',
        translations: data.translations || {},
        ai_ceo_block: data.ai_ceo_block || null,
        ai_impact_score: data.ai_impact_score || null,
        executive_summary: data.executive_summary || [],
        action_items: data.action_items || [],
        buyer_mindset: data.buyer_mindset || null,
        trend_prediction: data.trend_prediction || '',
        opportunity_radar: data.opportunity_radar || [],
        business_opportunities: data.business_opportunities || [],
        target_audience: data.target_audience || null,
        sector_action: data.sector_action || (Array.isArray(data.action_items) ? data.action_items[0] : '') || '',
        commercial_note: data.commercial_note || '',
      });
    }

    return NextResponse.json({
      success: true,
      total: totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      hasNext: page < Math.ceil(totalItems / limit),
      hasPrev: page > 1,
      data: allNews,
      // SEO meta
      pagination: {
        current: page,
        total: Math.ceil(totalItems / limit),
        perPage: limit,
        nextPage: page < Math.ceil(totalItems / limit) ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
        links: {
          self: `/haberler?page=${page}`,
          first: `/haberler?page=1`,
          last: `/haberler?page=${Math.ceil(totalItems / limit)}`,
          next: page < Math.ceil(totalItems / limit) ? `/haberler?page=${page + 1}` : null,
          prev: page > 1 ? `/haberler?page=${page - 1}` : null,
        },
      },
    });
  } catch (error: any) {
    console.error('[news-list] ❌ Firebase hatası:', error.message);
    return NextResponse.json({ success: false, data: [], error: error.message }, { status: 500 });
  }
}
