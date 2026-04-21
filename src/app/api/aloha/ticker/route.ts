import { NextResponse } from 'next/server';
import { executeUiLocalization } from '@/core/aloha/uiLocalizationAgent';
import { adminDb } from '@/lib/firebase-admin';

/**
 * TRTEX Intelligence Ticker API
 * 
 * GET /api/aloha/ticker
 * 
 * 4 feed stream'i birleştirir:
 * 1. Firestore trtex_intelligence/live_dashboard → market verileri
 * 2. trtex_news (breaking) → flash haberler
 * 3. trtex_intelligence/events → etkinlik geri sayımları
 * 4. Fallback statik veri
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items: any[] = [];
    let liveForexAvailable = false;

    // 0. A. PRIMARY OTONOM CANLI API (LIVE API FIRST)
    // CEO Terminal = "anlık veri". 
    try {
      const liveRes = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 300 } });
      if (liveRes.ok) {
        const liveData = await liveRes.json();
        if (liveData && liveData.rates && liveData.rates.TRY) {
          liveForexAvailable = true;
          const trVal = liveData.rates.TRY;
          const eurVal = liveData.rates.EUR;
          const eurTryVal = trVal / eurVal;
          
          items.push({
            id: 'usdtry', type: 'fx_energy', label: 'USD/TRY',
            value: trVal.toFixed(2), unit: '₺',
            change: 0.1, // Gerçek fiyatı aldık, değişimi cache'den veya tahmini tutabiliriz
            direction: 'up', severity: 'normal',
            timestamp: Date.now(), businessImpact: 0.95,
          });
          
          if (eurVal) {
            items.push({
              id: 'eurtry', type: 'fx_energy', label: 'EUR/TRY',
              value: eurTryVal.toFixed(2), unit: '₺',
              change: 0.1, direction: 'up',
              severity: 'normal', timestamp: Date.now(), businessImpact: 0.9,
            });
          }
          
          // Otonom Asenkron Cache Update - Gelecekte diğer ajanlar kullanabilsin
          if (adminDb) {
            adminDb.collection('trtex_intelligence').doc('ticker_live').set({
              forex: {
                usd_try: { value: trVal, updated_at: new Date().toISOString() },
                eur_try: { value: eurTryVal, updated_at: new Date().toISOString() }
              }
            }, { merge: true }).catch(() => {});
          }
        }
      }
    } catch { 
      console.warn('[ALOHA TICKER] Primary Live API failed! Falling back to cache.');
    }

    if (adminDb) {
      // 0. B. CACHE LAYER (Firestore Fallback)
      try {
        const tickerDoc = await adminDb.collection('trtex_intelligence').doc('ticker_live').get();
        if (tickerDoc.exists) {
          const t = tickerDoc.data()!;
          // Forex Cache'den sadece API çöktüyse çek (Live api yoksa)
          if (!liveForexAvailable && t.forex?.usd_try) {
            items.push({
              id: 'usdtry', type: 'fx_energy', label: 'USD/TRY',
              value: t.forex.usd_try.value, unit: '₺',
              change: t.forex.usd_try.change_24h || 0,
              direction: t.forex.usd_try.direction || 'stable',
              severity: Math.abs(t.forex.usd_try.change_24h || 0) > 2 ? 'attention' : 'normal',
              timestamp: Date.now(), businessImpact: 0.95,
            });
          }
          if (!liveForexAvailable && t.forex?.eur_try) {
            items.push({
              id: 'eurtry', type: 'fx_energy', label: 'EUR/TRY',
              value: t.forex.eur_try.value, unit: '₺',
              change: t.forex.eur_try.change_24h || 0,
              direction: t.forex.eur_try.direction || 'stable',
              severity: 'normal', timestamp: Date.now(), businessImpact: 0.9,
            });
          }
          // Commodities (Aloha otonom günceller)
          if (t.commodities) {
            for (const [key, val] of Object.entries(t.commodities) as [string, any][]) {
              if (val?.value) {
                const labelMap: Record<string, string> = { pta: 'PTA', meg: 'MEG', cotton: 'Cotton', brent: 'Brent' };
                const unitMap: Record<string, string> = { pta: '$/t', meg: '$/t', cotton: '\u00A2/lb', brent: '$' };
                items.push({
                  id: key, type: key === 'brent' ? 'fx_energy' : 'commodity',
                  label: labelMap[key] || key.toUpperCase(),
                  value: val.value, unit: unitMap[key] || '',
                  change: val.change_30d || 0,
                  direction: val.direction || 'stable',
                  severity: Math.abs(val.change_30d || 0) > 5 ? 'attention' : 'normal',
                  timestamp: Date.now(), businessImpact: 0.8,
                });
              }
            }
          }
          // Logistics (Aloha otonom günceller)
          if (t.logistics) {
            for (const [key, val] of Object.entries(t.logistics) as [string, any][]) {
              if (val?.value) {
                items.push({
                  id: key, type: 'logistics',
                  label: key === 'shanghai_freight' ? 'Shanghai Freight' : key === 'cn_factory' ? 'CN Factory' : key,
                  value: val.value, unit: key === 'shanghai_freight' ? '$' : 'idx',
                  change: val.change_30d || 0,
                  direction: val.direction || 'stable',
                  severity: Math.abs(val.change_30d || 0) > 5 ? 'attention' : 'normal',
                  timestamp: Date.now(), businessImpact: 0.85,
                });
              }
            }
          }
        }
      } catch { /* ticker_live yoksa → dashboard fallback */ }

      // 1. Market verileri (live_dashboard — eski format desteği)
      try {
        const dashDoc = await adminDb.collection('trtex_intelligence').doc('live_dashboard').get();
        if (dashDoc.exists) {
          const d = dashDoc.data()!;

          if (d.market?.shanghai_freight) {
            items.push({
              id: 'shf', type: 'logistics', label: 'Shanghai Freight',
              value: d.market.shanghai_freight.price || 0,
              unit: '$', change: parseFloat(d.market.shanghai_freight.change_30d) || 0,
              direction: d.market.shanghai_freight.trend || 'stable',
              severity: Math.abs(parseFloat(d.market.shanghai_freight.change_30d) || 0) > 5 ? 'attention' : 'normal',
              timestamp: Date.now(), businessImpact: 0.9,
            });
          }

          if (d.market?.cn_factory) {
            items.push({
              id: 'cnf', type: 'logistics', label: 'CN Factory',
              value: d.market.cn_factory.price || 0,
              unit: 'idx', change: parseFloat(d.market.cn_factory.change_30d) || 0,
              direction: d.market.cn_factory.trend || 'stable',
              severity: 'normal', timestamp: Date.now(), businessImpact: 0.6,
            });
          }

          if (d.market?.pta_meg) {
            items.push({
              id: 'pta', type: 'commodity', label: 'PTA/MEG',
              value: d.market.pta_meg.price || 0,
              unit: '$/t', change: parseFloat(d.market.pta_meg.change_30d) || 0,
              direction: d.market.pta_meg.trend || 'stable',
              severity: 'normal', timestamp: Date.now(), businessImpact: 0.85,
            });
          }
        }
      } catch { /* dashboard yoksa → fallback */ }

      // 2. Breaking news (son 24 saat, yüksek impact)
      try {
        const cutoff = new Date(Date.now() - 86400000).toISOString();
        const newsSnap = await adminDb.collection('trtex_news')
          .where('publishedAt', '>=', cutoff)
          .orderBy('publishedAt', 'desc')
          .limit(5)
          .get();

        for (const doc of newsSnap.docs) {
          const nd = doc.data();
          const score = nd.ai_impact_score || 0;
          if (score >= 7) {
            items.push({
              id: `news-${doc.id}`,
              type: 'news_event',
              label: 'FLASH',
              value: (nd.translations?.TR?.title || nd.title || '').substring(0, 60),
              direction: 'stable',
              severity: score >= 9 ? 'crisis' : 'attention',
              timestamp: new Date(nd.publishedAt).getTime(),
              isBreaking: true,
              newsHeadline: (nd.translations?.TR?.title || nd.title || '').substring(0, 80),
              businessImpact: score / 10,
            });
          }
        }
      } catch { /* flash habersiz devam */ }

      // 3. Etkinlikler
      try {
        const eventsDoc = await adminDb.collection('trtex_intelligence').doc('events').get();
        if (eventsDoc.exists) {
          const events = eventsDoc.data()?.upcoming || [];
          for (const ev of events.slice(0, 3)) {
            if (ev.date && new Date(ev.date) > new Date()) {
              items.push({
                id: `evt-${ev.slug || ev.name}`,
                type: 'news_event',
                label: ev.name || 'Event',
                value: ev.location || '',
                direction: 'stable',
                severity: 'normal',
                timestamp: Date.now(),
                isCountdown: true,
                countdownTarget: ev.date,
                newsHeadline: ev.headline || `${ev.name} yaklasiyor!`,
              });
            }
          }
        }
      } catch { /* etkinliksiz devam */ }
    }

    // KURAL: Fallback/mock YASAK — veri yoksa boş dön

    return NextResponse.json({ items, updated_at: new Date().toISOString() });
  } catch (err: any) {
    console.error('[TICKER API]', err.message);
    return NextResponse.json({ items: [], error: 'Ticker unavailable' }, { status: 500 });
  }
}
