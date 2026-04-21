import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/master/trtex/news-diagnostics
 * 
 * Firestore'daki trtex_news koleksiyonunun gerçek durumunu analiz eder.
 * Toplam haber sayısı, status dağılımı, tarih aralığı, eksik alanlar.
 */
export async function GET() {
  try {
    // TÜM haberleri çek — status ve tarih filtresi YOK
    const allDocs = await adminDb.collection('trtex_news').get();

    const stats = {
      totalDocuments: allDocs.size,
      byStatus: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      missingFields: {
        no_published_at: 0,
        no_slug: 0,
        no_image_url: 0,
        no_summary: 0,
        no_title: 0,
        empty_content: 0,
        no_ai_insight: 0,
      },
      dateRange: { oldest: '', newest: '' },
      sampleTitles: [] as string[],
      recentArticles: [] as { id: string; title: string; status: string; published_at: string; has_image: boolean }[],
    };

    const dates: string[] = [];

    allDocs.forEach(doc => {
      const d = doc.data();
      
      // Status
      const status = d.status || 'no_status';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      
      // Category
      const cat = d.category || 'no_category';
      stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
      
      // Missing fields
      if (!d.published_at && !d.publishedAt) stats.missingFields.no_published_at++;
      if (!d.slug) stats.missingFields.no_slug++;
      if (!d.image_url && !d.imageUrl) stats.missingFields.no_image_url++;
      if (!d.summary && !d.summary_tr) stats.missingFields.no_summary++;
      if (!d.title && !d.title_tr) stats.missingFields.no_title++;
      if (!d.content || d.content.length < 50) stats.missingFields.empty_content++;
      if (!d.ai_insight && !d.aiInsight) stats.missingFields.no_ai_insight++;
      
      // Dates
      const pubDate = d.published_at || d.publishedAt || d.created_at || d.createdAt || '';
      if (pubDate) dates.push(pubDate);
      
      // Sample titles (ilk 5)
      if (stats.sampleTitles.length < 5) {
        stats.sampleTitles.push(`[${status}] ${d.title || d.title_tr || 'NO_TITLE'}`);
      }
    });

    // Sort dates
    dates.sort();
    stats.dateRange.oldest = dates[0] || 'N/A';
    stats.dateRange.newest = dates[dates.length - 1] || 'N/A';

    // Son 10 belge (ID sırası)
    const recentSnap = await adminDb.collection('trtex_news')
      .orderBy('created_at', 'desc')
      .limit(10)
      .get();
    
    recentSnap.forEach(doc => {
      const d = doc.data();
      stats.recentArticles.push({
        id: doc.id,
        title: (d.title || d.title_tr || '').substring(0, 80),
        status: d.status || 'no_status',
        published_at: d.published_at || d.publishedAt || 'MISSING',
        has_image: !!(d.image_url || d.imageUrl),
      });
    });

    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
