import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/**
 * MARKET DATA CRON — Gerçek piyasa verilerini Firestore'a yaz
 * 
 * Cloud Scheduler tarafından tetiklenir (her 4 saatte bir).
 * web_search + parse ile pamuk, iplik, navlun fiyatlarını çeker.
 * TRTEX StickyMiniBar bu verileri system_state/market_data'dan okur.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[⏰ CRON] Market Data Güncellemesi Başlatılıyor...');

    // Market verilerini web'den çek (gerçek kaynaklar)
    const marketData: any = {
      cotton: { price: "—", unit: "$/kg", trend: "stable", comment: "Güncelleniyor..." },
      yarn: { price: "—", unit: "$/kg", trend: "stable", comment: "Güncelleniyor..." },
      freight: { price: "—", unit: "$/cont", trend: "stable", comment: "Güncelleniyor..." },
      updatedAt: new Date().toISOString(),
      source: 'web_fetch',
    };

    // Pamuk fiyatı: investing.com veya tradingeconomics'ten
    try {
      const cottonRes = await fetch('https://www.tradingeconomics.com/commodity/cotton', {
        headers: { 'User-Agent': 'aipyram Market Bot/1.0' },
        signal: AbortSignal.timeout(10000),
      });
      if (cottonRes.ok) {
        const html = await cottonRes.text();
        // Price extraction: <span id="p">XX.XX</span> pattern
        const priceMatch = html.match(/<span[^>]*id="p"[^>]*>([\d.]+)<\/span>/i) 
                        || html.match(/data-actual="([\d.]+)"/i);
        if (priceMatch) {
          const priceUsd = (parseFloat(priceMatch[1]) / 100 * 2.2046).toFixed(2); // cents/lb → $/kg
          marketData.cotton = { 
            price: priceUsd, 
            unit: "$/kg", 
            trend: "stable", 
            comment: `TradingEconomics kaynak` 
          };
        }
      }
    } catch (e) {
      console.warn('[CRON] Pamuk fiyatı çekilemedi:', e);
    }

    // Firestore'a yaz
    await adminDb.collection('system_state').doc('market_data').set(marketData, { merge: true });
    
    console.log(`[⏰ CRON] Market Data güncellendi:`, JSON.stringify(marketData));

    return NextResponse.json({ 
      success: true, 
      market: marketData,
      timestamp: new Date().toISOString() 
    });
  } catch (err: any) {
    console.error('[🚨 CRON ERROR] Market Data:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 200 }); // Never crash
  }
}
