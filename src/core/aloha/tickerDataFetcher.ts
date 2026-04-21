import { adminDb } from '@/lib/firebase-admin';

/**
 * TRTEX Ticker Data Fetcher — Otonom Canlı Veri
 * 
 * Ücretsiz API'lerden piyasa verisi çeker ve Firestore'a yazar.
 * Cloud Scheduler veya Aloha autoRunner tarafından düzenli çağrılır.
 * 
 * VERİ KAYNAKLARI:
 * - Döviz: frankfurter.app (ECB, ücretsiz, limitsiz)
 * - Petrol/Emtia: Aloha web_search + compose sırasında günceller
 * - Navlun/Hammadde: Aloha araştırma döngüsünde update_intelligence_dashboard ile yazar
 * - Haberler: trtex_news koleksiyonundan (kendi verimiz, API gerekmez)
 */

// ═══════════════════════════════════════
// ÜCRETSİZ API FETCHERLERİ
// ═══════════════════════════════════════

/**
 * Döviz kurları — frankfurter.app (ECB, ücretsiz, auth gerektirmez)
 */
async function fetchForexRates(): Promise<Record<string, any>> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=TRY,EUR', {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return {};
    const data = await res.json();

    const usdTry = data.rates?.TRY || 0;
    // EUR/TRY hesapla: 1 EUR = X TRY → USD/EUR * USD/TRY
    const eurUsd = data.rates?.EUR || 0;
    const eurTry = eurUsd > 0 ? usdTry / eurUsd : 0;

    return {
      usd_try: { value: parseFloat(usdTry.toFixed(2)), source: 'ECB/frankfurter' },
      eur_try: { value: parseFloat(eurTry.toFixed(2)), source: 'ECB/frankfurter' },
    };
  } catch (err: any) {
    console.warn('[TICKER FETCH] Forex hatası:', err.message);
    return {};
  }
}

/**
 * Petrol/Emtia/Navlun — ÜCRETSİZ API'lerden veri çekimi
 * 
 * ARTIK Gemini API KULLANMIYORUZ (Maliye Bakanı v2 Kuralı)
 * Kaynaklar:
 * - Petrol (Brent): Yahoo Finance public endpoint (ücretsiz, auth gerektirmez)
 * - Pamuk: Yahoo Finance public endpoint (CT=F futures)
 * - Diğer emtia: Son bilinen değer korunur (Firestore), ücretsiz API bulunamazsa güncellenmez
 */
async function fetchCommodityPrices(): Promise<Record<string, any>> {
  const results: Record<string, any> = {};

  // 1. Brent Petrol — Yahoo Finance (BZ=F)
  try {
    const brentRes = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/BZ=F?interval=1d&range=1d',
      { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'TRTEX-Ticker/1.0' } }
    );
    if (brentRes.ok) {
      const brentData = await brentRes.json();
      const price = brentData?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price && price > 20 && price < 200) {
        results.brent = { value: parseFloat(price.toFixed(2)), source: 'yahoo_finance', direction: 'stable' };
      }
    }
  } catch (e: any) {
    console.warn('[TICKER] Brent fetch hatası:', e.message?.substring(0, 60));
  }

  // 2. Pamuk — Yahoo Finance (CT=F)
  try {
    const cottonRes = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/CT=F?interval=1d&range=1d',
      { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'TRTEX-Ticker/1.0' } }
    );
    if (cottonRes.ok) {
      const cottonData = await cottonRes.json();
      const price = cottonData?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (price && price > 0 && price < 300) {
        results.cotton = { value: parseFloat(price.toFixed(2)), source: 'yahoo_finance', direction: 'stable' };
      }
    }
  } catch (e: any) {
    console.warn('[TICKER] Cotton fetch hatası:', e.message?.substring(0, 60));
  }

  // 3. Navlun (SCFI) — Ücretsiz API yok, statik güncelleme (haftalık ALOHA araştırma döngüsünde güncellenir)
  // PTA, POY, Boya — Bunlar da ücretsiz API olmadığı için Aloha haftalık araştırma döngüsünde güncellenir

  if (Object.keys(results).length > 0) {
    console.log(`[TICKER] ✅ Ücretsiz API ile ${Object.keys(results).length} emtia fiyatı çekildi (Gemini KULLANILMADI)`);
  }
  return results;
}

// ═══════════════════════════════════════
// ANA GÜNCELLEME FONKSİYONU
// ═══════════════════════════════════════

export interface TickerSnapshot {
  forex: {
    usd_try: { value: number; change_24h?: number; direction: string };
    eur_try: { value: number; change_24h?: number; direction: string };
  };
  commodities: {
    pta: { value: number; change_30d?: number; direction: string };
    meg: { value: number; change_30d?: number; direction: string };
    cotton: { value: number; change_30d?: number; direction: string };
    brent: { value: number; change_30d?: number; direction: string };
  };
  logistics: {
    shanghai_freight: { value: number; change_30d?: number; direction: string };
    cn_factory: { value: number; change_30d?: number; direction: string };
  };
  updated_at: string;
  updated_by: string;
}

/**
 * Tüm ticker verilerini topla ve Firestore'a yaz
 * Cloud Scheduler: Her 30 dakikada bir çağrılır
 */
export async function refreshTickerData(): Promise<string> {
  if (!adminDb) return '[HATA] Firebase yok';

  const results: string[] = [];

  // 1. Mevcut snapshot'ı oku
  const snapDoc = await adminDb.collection('trtex_intelligence').doc('ticker_live').get();
  const existing = (snapDoc.exists ? snapDoc.data() : {}) as Partial<TickerSnapshot>;

  // 2. Forex güncelle (ücretsiz API)
  const forex = await fetchForexRates();
  if (forex.usd_try) {
    const prevUsd = existing.forex?.usd_try?.value || forex.usd_try.value;
    const changeUsd = prevUsd > 0 ? ((forex.usd_try.value - prevUsd) / prevUsd * 100) : 0;

    const prevEur = existing.forex?.eur_try?.value || forex.eur_try.value;
    const changeEur = prevEur > 0 ? ((forex.eur_try.value - prevEur) / prevEur * 100) : 0;

    await adminDb.collection('trtex_intelligence').doc('ticker_live').set({
      forex: {
        usd_try: {
          value: forex.usd_try.value,
          change_24h: parseFloat(changeUsd.toFixed(2)),
          direction: changeUsd > 0.1 ? 'up' : changeUsd < -0.1 ? 'down' : 'stable',
          source: forex.usd_try.source,
        },
        eur_try: {
          value: forex.eur_try.value,
          change_24h: parseFloat(changeEur.toFixed(2)),
          direction: changeEur > 0.1 ? 'up' : changeEur < -0.1 ? 'down' : 'stable',
          source: forex.eur_try.source,
        },
      },
      updated_at: new Date().toISOString(),
      updated_by: 'ticker_fetcher',
    }, { merge: true });

    results.push(`USD/TRY: ${forex.usd_try.value} (${changeUsd > 0 ? '+' : ''}${changeUsd.toFixed(2)}%)`);
    results.push(`EUR/TRY: ${forex.eur_try.value} (${changeEur > 0 ? '+' : ''}${changeEur.toFixed(2)}%)`);
  }

  // 2b. Emtia ve Lojistik verileri güncelle
  const commodities = await fetchCommodityPrices();
  if (Object.keys(commodities).length > 0) {
    const commodityWrite: Record<string, any> = {};
    const logisticsWrite: Record<string, any> = {};

    for (const [key, val] of Object.entries(commodities)) {
      if (key === 'shanghai_freight') {
        const prev = existing.logistics?.shanghai_freight?.value || val.value;
        const change = prev > 0 ? ((val.value - prev) / prev * 100) : 0;
        logisticsWrite[key] = { ...val, change_30d: parseFloat(change.toFixed(2)), direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable' };
        results.push(`Shanghai Freight: ${val.value} (${change > 0 ? '+' : ''}${change.toFixed(1)}%)`);
      } else {
        const prevKey = key as keyof typeof existing.commodities;
        const prev = (existing.commodities as any)?.[prevKey]?.value || val.value;
        const change = prev > 0 ? ((val.value - prev) / prev * 100) : 0;
        commodityWrite[key] = { ...val, change_30d: parseFloat(change.toFixed(2)), direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable' };
        results.push(`${key}: ${val.value} (${change > 0 ? '+' : ''}${change.toFixed(1)}%)`);
      }
    }

    if (Object.keys(commodityWrite).length > 0) {
      await adminDb.collection('trtex_intelligence').doc('ticker_live').set({
        commodities: commodityWrite,
      }, { merge: true });
    }
    if (Object.keys(logisticsWrite).length > 0) {
      await adminDb.collection('trtex_intelligence').doc('ticker_live').set({
        logistics: logisticsWrite,
      }, { merge: true });
    }
  }

  // 3. Kendi haberlerimizden flash data (API gerekmez)
  try {
    const recentNews = await adminDb.collection('trtex_news')
      .orderBy('publishedAt', 'desc')
      .limit(10)
      .get();

    let flashCount = 0;
    const flashItems: any[] = [];

    for (const doc of recentNews.docs) {
      const d = doc.data();
      if ((d.ai_impact_score || 0) >= 7) {
        flashItems.push({
          id: doc.id,
          title: (d.translations?.TR?.title || d.title || '').substring(0, 80),
          score: d.ai_impact_score,
          category: d.category,
          publishedAt: d.publishedAt,
        });
        flashCount++;
      }
    }

    if (flashItems.length > 0) {
      await adminDb.collection('trtex_intelligence').doc('ticker_live').set({
        flash_news: flashItems.slice(0, 5),
      }, { merge: true });
      results.push(`Flash news: ${flashCount} yuksek etkili haber`);
    }
  } catch { /* haber taraması başarısız → sessiz */ }

  if (results.length === 0) {
    return 'Ticker guncelleme: yeni veri yok';
  }

  return `Ticker guncellendi:\n${results.join('\n')}`;
}

/**
 * Aloha'nın emtia/navlun verilerini manuel güncellemesi için
 * update_intelligence_dashboard tool'u kullanılır — o zaten ticker_live'a yazıyor
 * 
 * Bu fonksiyon sadece döviz + flash news için otonom çalışır
 */
export async function getTickerSnapshot(): Promise<TickerSnapshot | null> {
  if (!adminDb) return null;

  const doc = await adminDb.collection('trtex_intelligence').doc('ticker_live').get();
  return doc.exists ? (doc.data() as TickerSnapshot) : null;
}
