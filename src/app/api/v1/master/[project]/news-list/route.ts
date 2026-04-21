import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const revalidate = 0;

// ═══════════════════════════════════════
// BEYAZ LİSTE — sadece bu projeler erişilebilir
// ═══════════════════════════════════════
const ALLOWED_PROJECTS = ['trtex', 'hometex', 'perde'] as const;
type ProjectName = typeof ALLOWED_PROJECTS[number];

function isAllowedProject(p: string): p is ProjectName {
  return ALLOWED_PROJECTS.includes(p as ProjectName);
}

// ═══════════════════════════════════════
// SCHEMA BRIDGE — compose_article → Frontend
// ═══════════════════════════════════════
function normalizeContent(html: string): string {
  if (!html) return '';
  let text = html;
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n\n## $1\n\n');
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n\n### $1\n\n');
  text = text.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n');
  text = text.replace(/<p[^>]*>/gi, '');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  text = text.replace(/<\/?[uo]l[^>]*>/gi, '\n');
  text = text.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  text = text.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  text = text.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '\n> $1\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<(?!\/?table|\/?tr|\/?td|\/?th)[^>]+>/gi, '');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

function normalizeImages(
  mediaImages: any[] | undefined,
  heroUrl: string,
  midUrl?: string,
  detailUrl?: string
): Array<{url: string; type: string; alt: string}> {
  const images: Array<{url: string; type: string; alt: string}> = [];
  if (mediaImages && Array.isArray(mediaImages) && mediaImages.length > 0) {
    for (const img of mediaImages) {
      if (img.url) {
        images.push({ url: img.url, type: img.type || 'image', alt: img.alt_text || img.caption || img.alt || '' });
      }
    }
  }
  if (images.length === 0) {
    if (heroUrl) images.push({ url: heroUrl, type: 'hero', alt: 'Hero görsel' });
    if (midUrl) images.push({ url: midUrl, type: 'mid', alt: 'Detay görsel' });
    if (detailUrl) images.push({ url: detailUrl, type: 'detail', alt: 'Doku görsel' });
  }
  return images;
}

const INDUSTRIAL_PLACEHOLDER = 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80&auto=format';

/**
 * GET /api/v1/master/[project]/news-list
 * 
 * Dinamik multi-project news API.
 * trtex, hometex, perde projelerinin haberlerini servisle.
 * 
 * Parametre: project (URL path)
 * Query:     ?page=1&limit=12&category=&status=
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> }
) {
  const resolvedParams = await params;
  const project = resolvedParams.project?.toLowerCase();

  // Beyaz liste kontrolü
  if (!project || !isAllowedProject(project)) {
    return NextResponse.json(
      { success: false, error: `Geçersiz proje: "${project}". İzin verilenler: ${ALLOWED_PROJECTS.join(', ')}` },
      { status: 404 }
    );
  }

  // trtex → trtex/news-list endpoint'ine yönlendir (mevcut, daha zengin)
  // Ama aynı mantığı burada da çalıştır — tek kaynak
  const collectionName = `${project}_news`;

  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Firebase Admin yok' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const category = searchParams.get('category') || '';

    let query: FirebaseFirestore.Query = adminDb.collection(collectionName);
    query = query.where('status', '==', 'published');

    if (category) {
      query = query.where('category', '==', category);
    }

    // Total count
    const countSnap = await adminDb.collection(collectionName).where('status', '==', 'published').count().get();
    const totalItems = countSnap.data().count;

    // Pagination
    const startIndex = (page - 1) * limit;
    query = query.orderBy('published_at', 'desc');
    if (startIndex > 0) query = query.offset(startIndex);
    query = query.limit(limit);

    const snapshot = await query.get();
    const allNews: any[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const rawImageUrl = data.image_url || data.cover_image || data.media?.images?.[0]?.url || '';
      const imageUrl = (rawImageUrl && rawImageUrl.trim() !== '') ? rawImageUrl : INDUSTRIAL_PLACEHOLDER;

      const rawTitle =
        (data.translations?.TR?.title && data.translations.TR.title.trim()) ||
        (data.title && data.title.trim()) ||
        (data.title_tr && data.title_tr.trim()) ||
        '';

      if (!rawTitle) continue;

      const rawContent = data.translations?.TR?.content || data.content || data.body || '';
      const rawSummary = data.translations?.TR?.summary || data.summary || data.summary_tr || '';

      const rawSlug = data.slug ||
        rawTitle.toLowerCase()
          .replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g')
          .replace(/ü/g,'u').replace(/ö/g,'o').replace(/ı/g,'i')
          .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
          .substring(0, 60) ||
        `haber-${doc.id.substring(0, 12)}`;

      const rawDate = data.publishedAt || data.published_at || data.createdAt || data.created_at || new Date().toISOString();

      // image_status: frontend skeleton/placeholder kararı için
      const imageStatus = data.image_status || (rawImageUrl ? 'ready' : 'pending');

      allNews.push({
        id: doc.id,
        title: rawTitle,
        summary: rawSummary,
        content: normalizeContent(rawContent),
        category: data.category || 'İstihbarat',
        image_url: imageUrl,
        image_status: imageStatus,
        images: normalizeImages(data.media?.images, imageUrl, data.mid_image_url, data.detail_image_url),
        slug: rawSlug,
        published_at: rawDate,
        created_at: data.createdAt || data.created_at || rawDate,
        reading_time: data.reading_time || Math.ceil(((rawContent || '').split(/\s+/).length) / 200) || 3,
        urgency: data.urgency || 'normal',
        ai_insight: data.ai_insight || data.ai_commentary || '',
        tags: data.tags || [],
        translations: data.translations || {},
        business_opportunities: data.business_opportunities || [],
        target_audience: data.target_audience || null,
        commercial_note: data.commercial_note || '',
        project,
      });
    }

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      success: true,
      project,
      total: totalItems,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      data: allNews,
    });
  } catch (error: any) {
    console.error(`[${project}-news-list] ❌ Hata:`, error.message);
    return NextResponse.json({ success: false, data: [], error: error.message }, { status: 500 });
  }
}
