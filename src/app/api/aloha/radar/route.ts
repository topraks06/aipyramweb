import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * TRTEX Opportunity Radar API
 * 
 * GET /api/aloha/radar
 * 
 * Firestore'dan canlı veri çeker:
 * - Son haberlerden fırsat radarı
 * - Perde haberleri (curtain intelligence)
 * - Global sentiment (intelligence dashboard'dan)
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase not available' }, { status: 500 });
    }

    // 1. Son haberlerden fırsatları çek
    const newsSnap = await adminDb.collection('trtex_news')
      .orderBy('publishedAt', 'desc')
      .limit(30)
      .get();

    const opportunities: any[] = [];
    const curtainNews: any[] = [];

    const countryFlags: Record<string, string> = {
      'turkey': '🇹🇷', 'germany': '🇩🇪', 'poland': '🇵🇱', 'saudi arabia': '🇸🇦',
      'uae': '🇦🇪', 'united states': '🇺🇸', 'egypt': '🇪🇬', 'united kingdom': '🇬🇧',
      'france': '🇫🇷', 'italy': '🇮🇹', 'china': '🇨🇳', 'india': '🇮🇳',
      'uzbekistan': '🇺🇿', 'romania': '🇷🇴', 'russia': '🇷🇺', 'japan': '🇯🇵',
    };

    for (const doc of newsSnap.docs) {
      const d = doc.data();
      const title = d.translations?.TR?.title || d.title || '';
      const score = d.ai_impact_score || 5;

      // Fırsat radarı: yüksek impact scorelu haberler
      const confValue = score ? score * 10 : 75;
      if (score >= 6 && d.opportunity_radar?.length > 0 && confValue >= 60) {
        const country = d.country_intelligence?.country ||
          d.lead_data?.target_country || '';
        const countryKey = country.toLowerCase();

        opportunities.push({
          id: doc.id,
          title: title.substring(0, 80),
          country,
          flag: countryFlags[countryKey] || '🌍',
          category: d.category || '',
          ai_impact_score: score,
          confidence: confValue,
          demand_indicator: score >= 8 ? 'rising' : score >= 5 ? 'stable' : 'declining',
          summary: (d.opportunity_radar || []).slice(0, 2).join(' | '),
          opportunity: d.commercial_note || (d.business_opportunities && d.business_opportunities[0]) || title.substring(0, 100),
          risk: (d.risks && d.risks[0]) || (d.ai_ceo_block && d.ai_ceo_block.risk) || 'Piyasa dalgalanmaları ve artan rekabet koşulları.',
          action: (d.actionItems && d.actionItems[0]) || (d.ai_ceo_block && d.ai_ceo_block.action) || 'Gelişmeleri yakından izleyin ve stratejik ortaklıkları değerlendirin.',
        });
      }

      // Perde haberleri
      const isPerde = d.perde_relevance ||
        title.toLowerCase().match(/perde|curtain|blackout|tül|drapery|stor|window/);
      if (isPerde) {
        curtainNews.push({
          title: title.substring(0, 70),
          category: d.category || '',
          slug: d.slug || doc.id,
        });
      }
    }

    // 2. Global sentiment (intelligence dashboard'dan)
    let sentiment = null;
    try {
      const dashDoc = await adminDb.collection('trtex_intelligence').doc('live_dashboard').get();
      if (dashDoc.exists) {
        const dashData = dashDoc.data();
        sentiment = dashData?.daily_sentiment || null;
      }
    } catch { /* dashboard yoksa sessiz devam */ }

    // KURAL: Fallback/mock YASAK — gerçek sentiment yoksa null kalır

    return NextResponse.json({
      opportunities: opportunities.slice(0, 6),
      curtain_news: curtainNews.slice(0, 5),
      sentiment,
      updated_at: new Date().toISOString(),
    });

  } catch (err: any) {
    console.error('[RADAR API]', err.message);
    return NextResponse.json({ error: 'Radar unavailable' }, { status: 500 });
  }
}
