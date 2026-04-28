import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const section = searchParams.get('section');

        // ── SECTION ROUTING: daily_insight ──
        if (section === 'daily_insight') {
          try {
            const doc = await adminDb.collection('trtex_intelligence').doc('daily_insight').get();
            if (doc.exists) {
              const data = doc.data();
              return NextResponse.json({ 
                success: true, 
                data, 
                comment: data?.trtex_comment || '' 
              });
            }
          } catch {}
          // Fallback daily insight
          return NextResponse.json({ 
            success: true, 
            data: {
              date: new Date().toISOString(),
              headline: 'Küresel Tekstil Piyasasında Günün Değerlendirmesi',
              summary: 'TRTEX yapay zeka motoru günlük piyasa verilerini analiz ediyor. Güncel insight için lütfen bekleyin.',
              questions: [
                { q: 'Piyasa Durumu Nedir?', a: 'Analiz hazırlanıyor...' },
                { q: 'Hangi Fırsatlar Var?', a: 'Veri toplanıyor...' },
                { q: 'Risk Seviyesi?', a: 'Değerlendirme yapılıyor...' },
              ],
              firm_link: { label: 'Firma Radarı', href: '/companies' },
              trade_link: { label: 'Fırsat Ağı', href: '/is-birligi-firsatlari' },
              risk_level: 'ORTA',
              opportunity_level: 'YÜKSEK',
              affected_countries: ['Türkiye', 'Çin', 'AB'],
              updated_at: new Date().toISOString(),
            },
            comment: 'TRTEX AI sistemi günlük insight hazırlıyor.' 
          });
        }

        const signalsRef = adminDb.collection('trtex_signals').doc('live_feed');
        const doc = await signalsRef.get();
        let currentData = doc.data();

        const now = Date.now();
        const isStale = !currentData || !currentData.last_updated || (now - currentData.last_updated > SIX_HOURS_MS);

        if (isStale) {
            // ticker_live'dan GERÇEK veriyi çek — Math.random() ile sahte veri üretmek YASAK
            try {
                const tickerDoc = await adminDb.collection('trtex_intelligence').doc('ticker_live').get();
                if (tickerDoc.exists) {
                    const ticker = tickerDoc.data()!;
                    const newData: any = {
                        last_updated: now,
                        last_safe_fetch: now,
                    };
                    if (ticker.forex?.usd_try?.value) newData.USD_TRY = ticker.forex.usd_try.value.toFixed(2);
                    if (ticker.forex?.eur_try?.value) newData.EUR_TRY = ticker.forex.eur_try.value.toFixed(2);
                    if (ticker.commodities?.cotton?.value) newData.COTTON_INDEX = ticker.commodities.cotton.value.toFixed(2);
                    if (ticker.logistics?.shanghai_freight?.value) newData.FREIGHT_INDEX = ticker.logistics.shanghai_freight.value;
                    
                    if (Object.keys(newData).length > 2) {
                        await signalsRef.set(newData, { merge: true });
                        currentData = { ...currentData, ...newData };
                    }
                }
            } catch (tickerErr: any) {
                console.warn('[SITE-BRAIN] ticker_live okunamadı:', tickerErr.message);
            }
        }

        // TRTEX Intelligence verileri
        let heroOpportunity = null;
        let marketIntel = null;
        let tradeOpportunities: any[] = [];
        try {
          const intelDoc = await adminDb.collection('trtex_intelligence').doc('live_dashboard').get();
          if (intelDoc.exists) {
            const intel = intelDoc.data();
            heroOpportunity = intel?.hero_opportunity || null;
            marketIntel = intel?.market || null;
            tradeOpportunities = intel?.trade_opportunities || [];
          }
        } catch {}

        const market = marketIntel || {
          status: 'syncing',
          message: 'Piyasa verileri güncelleniyor...'
        };

        const heroOpp = heroOpportunity || {
          headline: 'KÜRESEL TEKSTİL TİCARETİNDE YENİ FIRSATLAR',
          opportunity: 'aipyram ticari istihbarat ağı aktif — güncel fırsatlar taranıyor.',
          action: 'DETAYLARI İNCELE',
          country: 'Global',
          flag: '🌍',
          link: '/opportunities/hero-deal'
        };

        // Fallback trade opportunities (Aloha güncellemediyse)
        const defaultOpps: any[] = [];

        const finalOpps = tradeOpportunities.length > 0 ? tradeOpportunities : defaultOpps;

        return NextResponse.json({
            success: true,
            message: "Intelligence signal loaded",
            source: isStale ? 'live_fetch' : 'firestore_cache',
            data: {
              ...currentData,
              hero_opportunity: heroOpp,
              market,
              trade_opportunities: {
                opportunities: finalOpps,
                featured: [
                  { title: heroOpp.headline, action: heroOpp.opportunity, flag: heroOpp.flag }
                ]
              },
              market_health: {
                note: `Son güncelleme: ${new Date(currentData?.last_updated || Date.now()).toLocaleString('tr-TR')}`
              }
            }
        });

    } catch (error: any) {
        console.error('[🚨 SITE-BRAIN HATA]', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

