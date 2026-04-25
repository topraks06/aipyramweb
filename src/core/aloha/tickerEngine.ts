import { adminDb } from '@/lib/firebase-admin';
import { alohaAI } from './aiClient';

/**
 * TRTEX OTONOM B2B TICKER ENGINE
 * 
 * Hakan's System: Institutional Terminal Architecture
 * - Tek Gerçek Kaynak: Source Ranking System
 * - Olasılıksal Red: Dynamic Sanity Bands
 * - Güvensiz Veri Sensörü: UNVERIFIED_MARKET_ESTIMATE
 */

// ═══════════════════════════════════════
// TİPLER VE SABİTLER
// ═══════════════════════════════════════

export type AssetClass = 'forex' | 'commodity' | 'logistics';

export type TickerResult = {
  value: number;
  change: number;
  direction: 'up' | 'down' | 'stable';
  source: string;
  confidence: number;
  status: string;
};

// DYNAMIC SANITY BANDS - Piyasa Şok Reddetme Eşikleri
const SANITY_LIMITS: Record<AssetClass, number> = {
  forex: 5,       // %5 üstü bir saatte değişiyorsa reddet veya review'e gönder
  commodity: 15,  // Emtia şokları nispeten daha sert olabilir
  logistics: 25   // Navlun krizi sıçramaları yüksektir
};

const YAHOO_HEADERS = { 'User-Agent': 'Mozilla/5.0' };

// ═══════════════════════════════════════
// 1. DATA INGESTION (FETCH ALL SOURCES)
// ═══════════════════════════════════════

async function fetchYahooScore(symbol: string): Promise<TickerResult | null> {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`, { headers: YAHOO_HEADERS, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result?.meta?.regularMarketPrice) return null;

    return {
      value: parseFloat(result.meta.regularMarketPrice.toFixed(4)),
      change: 0, direction: 'stable',
      source: 'yahoo_finance',
      confidence: 0.95, // High Auth
      status: 'VERIFIED_API'
    };
  } catch { return null; }
}

async function fetchFrankfurterScore(): Promise<{ usdTry?: TickerResult; eurTry?: TickerResult }> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=TRY,EUR', { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return {};
    const data = await res.json();
    const usdTry = data.rates?.TRY || 0;
    const eurUsd = data.rates?.EUR || 0;
    const eurTry = eurUsd > 0 ? usdTry / eurUsd : 0;

    return {
      ...(usdTry ? { usdTry: { value: parseFloat(usdTry.toFixed(4)), change: 0, direction: 'stable', source: 'ecb_frankfurter', confidence: 0.98, status: 'VERIFIED_CENTRAL_BANK' } } : {}),
      ...(eurTry ? { eurTry: { value: parseFloat(eurTry.toFixed(4)), change: 0, direction: 'stable', source: 'ecb_frankfurter', confidence: 0.98, status: 'VERIFIED_CENTRAL_BANK' } } : {})
    };
  } catch { return {}; }
}

async function fetchGeminiScores(): Promise<Record<string, TickerResult>> {
  try {
    const prompt = `Give me the LATEST real-time spot prices for these industrial commodities/indices. 
Search the live web. Return ONLY a JSON object with exact numbers, no markdown tags.
Format:
{
  "pta": <number>,
  "polyester_yarn": <number>,
  "scfi": <number>,
  "cotton": <number>
}`;

    const { text } = await alohaAI.generate(prompt, {
      complexity: 'routine',
      tools: [{ googleSearch: {} }],
      temperature: 0.1,
    }, 'ticker_engine');

    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanText);
    const results: Record<string, TickerResult> = {};

    for (const [key, val] of Object.entries(data)) {
      if (typeof val === 'number') {
        results[key] = {
          value: parseFloat(val.toFixed(4)),
          change: 0, direction: 'stable',
          source: 'gemini_grounding',
          confidence: 0.60, // Hakan's Law: Never pretend to be true market API
          status: 'UNVERIFIED_MARKET_ESTIMATE'
        };
      }
    }
    return results;
  } catch { return {}; }
}

// ═══════════════════════════════════════
// 2 & 3. NORMALIZE & VALIDATE (DYNAMIC BANDS)
// ═══════════════════════════════════════

function validateAndNormalize(sources: TickerResult[], previousValue: number | undefined, assetClass: AssetClass): TickerResult[] {
  const validSources: TickerResult[] = [];
  const limit = SANITY_LIMITS[assetClass];

  for (const src of sources) {
    let change = 0;
    if (previousValue && previousValue > 0) {
      change = ((src.value - previousValue) / previousValue) * 100;
    }
    
    // Dynamic Band Sanity Check
    if (Math.abs(change) > limit) {
      console.warn(`[TICKER GUARD] 🔴 ${src.source} verisi limitleri aştı! Değişim: %${change.toFixed(1)} (Limit: %${limit}). Kaynak reddedildi.`);
      continue; // Bu kaynağı listeye alma
    }

    src.change = parseFloat(change.toFixed(2));
    src.direction = change > 0.1 ? 'up' : change < -0.1 ? 'down' : 'stable';
    validSources.push(src);
  }

  // Geçmiş veriyi (decaying confidence) fallback olarak listeye ekle
  if (previousValue && previousValue > 0) {
    validSources.push({
      value: previousValue, change: 0, direction: 'stable',
      source: 'last_known', confidence: 0.85, status: 'CACHED_FALLBACK'
    });
  }

  return validSources;
}

// ═══════════════════════════════════════
// 4. SELECT BEST (SOURCE RANKING)
// ═══════════════════════════════════════

function selectBest(sources: TickerResult[]): TickerResult | null {
  if (!sources || sources.length === 0) return null;
  // En yüksek confidence'ı olanı seç
  sources.sort((a, b) => b.confidence - a.confidence);
  return sources[0];
}

// ═══════════════════════════════════════
// 5. MASTER EXECUTION LOOP
// ═══════════════════════════════════════

export async function executeLiveTickerCycle() {
  console.log('[ALOHA TICKER ENGINE] 🔁 Source Ranking Motoru Başlatıldı...');
  
  if (!adminDb) throw new Error("Firebase Admin DB not initialized");
  const tickerDocRef = adminDb.collection('trtex_intelligence').doc('ticker_live');
  const snap = await tickerDocRef.get();
  const prev = snap.exists ? snap.data() : { forex: {}, commodities: {}, logistics: {} };

  const finalPayload: any = { forex: {}, commodities: {}, logistics: {}, updated_at: new Date().toISOString() };

  // 1. INGESTION PARALLEL FETCH
  const [yahooUsd, yahooEur, yahooBrent, yahooCotton, frankfurter, gemini] = await Promise.all([
    fetchYahooScore('TRY=X'),
    fetchYahooScore('EURTRY=X'),
    fetchYahooScore('BZ=F'),
    fetchYahooScore('CT=F'),
    fetchFrankfurterScore(),
    fetchGeminiScores()
  ]);

  // 2. USD/TRY Değerlendirmesi
  const usdSources = validateAndNormalize(
    [yahooUsd, frankfurter.usdTry].filter(Boolean) as TickerResult[], 
    prev?.forex?.usd_try?.value, 'forex'
  );
  const bestUsd = selectBest(usdSources);
  if (bestUsd) finalPayload.forex.usd_try = bestUsd;

  // 3. EUR/TRY Değerlendirmesi
  const eurSources = validateAndNormalize(
    [yahooEur, frankfurter.eurTry].filter(Boolean) as TickerResult[], 
    prev?.forex?.eur_try?.value, 'forex'
  );
  const bestEur = selectBest(eurSources);
  if (bestEur) finalPayload.forex.eur_try = bestEur;

  // 4. BRENT Değerlendirmesi
  const brentSources = validateAndNormalize(
    [yahooBrent].filter(Boolean) as TickerResult[], 
    prev?.commodities?.brent?.value, 'commodity'
  );
  const bestBrent = selectBest(brentSources);
  if (bestBrent) finalPayload.commodities.brent = bestBrent;

  // 5. COTTON Değerlendirmesi (Yahoo vs Gemini Kapışması)
  const cottonSources = validateAndNormalize(
    [yahooCotton, gemini.cotton].filter(Boolean) as TickerResult[], 
    prev?.commodities?.cotton?.value, 'commodity'
  );
  const bestCotton = selectBest(cottonSources);
  if (bestCotton) finalPayload.commodities.cotton = bestCotton;

  // 6. NİŞ EMTİALAR (Sadece Gemini)
  // PTA
  const ptaSources = validateAndNormalize([gemini.pta].filter(Boolean) as TickerResult[], prev?.commodities?.pta?.value, 'commodity');
  const bestPta = selectBest(ptaSources);
  if (bestPta) finalPayload.commodities.pta = bestPta;

  // YARN
  const yarnSources = validateAndNormalize([gemini.polyester_yarn].filter(Boolean) as TickerResult[], prev?.commodities?.polyester_yarn?.value, 'commodity');
  const bestYarn = selectBest(yarnSources);
  if (bestYarn) finalPayload.commodities.polyester_yarn = bestYarn;

  // SCFI
  const scfiSources = validateAndNormalize([gemini.scfi].filter(Boolean) as TickerResult[], prev?.logistics?.scfi?.value, 'logistics');
  const bestScfi = selectBest(scfiSources);
  if (bestScfi) finalPayload.logistics.scfi = bestScfi;

  // ATOMİK YAZIM
  await tickerDocRef.set(finalPayload);
  
  console.log('[ALOHA TICKER ENGINE] ✅ Payload başarıyla Firestore\'a çakıldı. Seçilen kaynaklar:', 
    `USD: ${bestUsd?.source}(${bestUsd?.confidence})`, 
    `PTA: ${bestPta?.source}(${bestPta?.confidence})`
  );
  
  return finalPayload;
}
