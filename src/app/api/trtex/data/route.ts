import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/trtex/data
 * 
 * TRTEX Dashboard veri endpoint'i — Firebase trtex_news koleksiyonundan beslenir.
 * 
 * KRİTİK: Firebase'de alan adı 'publishedAt' (camelCase) olarak saklanır.
 * universal-publisher.ts bu alan adını kullanır. 'published_at' HATALIDIR.
 */
export async function GET(req: Request) {
  try {
    let recentSignals: any[] = [];
    let recentNews: any[] = [];

    // 1. Son market sinyallerini al (izole — hata durumunda diğer sorgular çalışmaya devam eder)
    try {
      const signalsRef = adminDb.collection('trtex_news')
        .where('category', 'in', ['Pazar', 'market_signal', 'Trend'])
        .orderBy('publishedAt', 'desc')
        .limit(3);
      const signalSnaps = await signalsRef.get();
      recentSignals = signalSnaps.docs.map(d => d.data());
    } catch (signalErr: any) {
      // Composite index eksik olabilir — sessiz devam et
      console.warn('[TRTEX_DATA_API] Sinyal sorgusu başarısız (index eksik olabilir):', signalErr.message);
    }

    // 2. Son haberleri al
    try {
      const newsRef = adminDb.collection('trtex_news')
        .where('status', '==', 'published')
        .orderBy('publishedAt', 'desc')
        .limit(5);
      const newsSnaps = await newsRef.get();
      recentNews = newsSnaps.docs.map(d => ({
        id: d.id,
        title: d.data().translations?.TR?.title || d.data().title || '',
        category: d.data().category || '',
        published_at: d.data().publishedAt || d.data().createdAt || ''
      }));
    } catch (newsErr: any) {
      console.warn('[TRTEX_DATA_API] Haber sorgusu başarısız (index eksik olabilir):', newsErr.message);
      
      // Fallback: orderBy olmadan basit sorgu
      try {
        const fallbackSnap = await adminDb.collection('trtex_news').limit(5).get();
        recentNews = fallbackSnap.docs.map(d => ({
          id: d.id,
          title: d.data().translations?.TR?.title || d.data().title || '',
          category: d.data().category || '',
          published_at: d.data().publishedAt || d.data().createdAt || ''
        }));
      } catch { /* sessiz */ }
    }

    // Market verisini Firestore'dan çek (Aloha/Cron tarafından güncellenir)
    let marketData = {
      cotton: { price: "—", unit: "$/kg", trend: "stable", comment: "Güncelleniyor..." },
      yarn: { price: "—", unit: "$/kg", trend: "stable", comment: "Güncelleniyor..." },
      freight: { price: "—", unit: "$/cont", trend: "stable", comment: "Güncelleniyor..." },
    };
    try {
      const marketSnap = await adminDb.collection('system_state').doc('market_data').get();
      if (marketSnap.exists) {
        const md = marketSnap.data();
        if (md?.cotton) marketData.cotton = md.cotton;
        if (md?.yarn) marketData.yarn = md.yarn;
        if (md?.freight) marketData.freight = md.freight;
      }
    } catch { /* Firestore erişilemezse fallback kullan */ }

    // Borsa/Dashboard benzeri structure
    const liveData = {
      market: marketData,
      signals: recentSignals.length > 0 ? recentSignals.map((s: any) => ({
        type: s.ai_insight ? 'insight' : 'alert',
        message: s.translations?.TR?.title || s.title
      })) : [{ type: 'alert', message: "Canlı sinyal bekleniyor..." }],
      live_ticker: recentNews.map(n => ({ category: n.category, text: n.title })),
      daily_insight: {
        headline: recentSignals[0]?.translations?.TR?.title || recentSignals[0]?.title || "Market Analytics",
        summary: recentSignals[0]?.ai_insight || recentSignals[0]?.translations?.TR?.summary || recentSignals[0]?.summary || "aipyram analiz verisi bekleniyor."
      }
    };

    return NextResponse.json({
      success: true,
      data: liveData,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("[TRTEX_DATA_API] Error:", error);
    // KURAL: Fallback/mock YASAK — gerçek hata döndür
    return NextResponse.json({
      success: false,
      data: null,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
