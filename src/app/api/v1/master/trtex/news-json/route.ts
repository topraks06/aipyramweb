import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/master/trtex/news-json
 * 
 * TRTEX'in "Dumb Client" mimarisine göre:
 * Firestore'daki tüm yayınlanmış haberleri yapılandırılmış JSON döner.
 * TRTEX frontend bu endpoint'i kullanarak sayfasını doldurur.
 * 
 * Query params:
 *   limit  — max haber sayısı (default: 200)
 *   locale — dil filtresi (default: tr, overlay uygular)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get('limit') || '200', 10);

    // Firestore'dan haberleri çek — created_at'e göre sıralı
    // NOT: 118 haberin 112'sinde published_at alanı yok,
    // bu yüzden created_at kullanıyoruz (tüm doc'larda var).
    const snapshot = await adminDb
      .collection('trtex_news')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        total: 0,
        articles: [],
        _source: 'firestore',
        _timestamp: Date.now(),
      });
    }

    const articles = snapshot.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        title: d.title_tr || d.title || '',
        summary: d.summary_tr || d.summary || '',
        slug: d.slug || doc.id,
        category: d.category || 'Haber',
        image_url: d.image_url || d.imageUrl || '/images/curtain-fabric-display.png',
        published_at: d.published_at || d.publishedAt || d.created_at || '',
        created_at: d.created_at || d.createdAt || '',
        ai_insight: d.ai_insight || d.aiInsight || '',
        ai_action: d.ai_action || d.aiAction || '',
        tags: d.tags || [],
        related_company: d.related_company || d.relatedCompany || '',
        translations: d.translations || undefined,
      };
    });

    const response = NextResponse.json({
      total: articles.length,
      articles,
      _source: 'firestore',
      _timestamp: Date.now(),
    });

    // Edge cache — 60s fresh, 5dk stale-while-revalidate
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;

  } catch (err: any) {
    console.error('[news-json] Firestore hata:', err.message);
    return NextResponse.json(
      { total: 0, articles: [], error: err.message, _source: 'firestore-error' },
      { status: 500 }
    );
  }
}
