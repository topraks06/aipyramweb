import { NextResponse } from 'next/server';
import { refreshTickerData } from '@/core/aloha/tickerDataFetcher';
import { executeTask } from '@/core/aloha/aiClient';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * POST /api/cron/ticker-refresh
 * 
 * Ticker verilerini günceller:
 * - Döviz: frankfurter.app (ücretsiz ECB API)
 * - Emtia: Gemini Search Grounding (Cotton, Brent, PTA, SCFI)
 * - Flash News: Firestore'dan yüksek etkili haberler
 * 
 * Cloud Scheduler: Her 30 dakikada bir çağrılır
 * Manuel: Admin panelinden tetiklenebilir
 * 
 * KURAL: Minimum 6 veri (USD/TRY, EUR/TRY, Cotton, Brent, PTA, SCFI)
 * Eksik varsa tekrar deneyecek.
 */
export async function POST(req: Request) {
  try {
    // Basit auth kontrolü
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // AUTHORITY CHECK
    const auth = await executeTask({
      nodeId: 'trtex',
      action: 'data_write',
      payload: { task: 'ticker-refresh' },
      caller: 'cron_ticker_refresh',
    });

    if (!auth.success) {
      console.warn(`[TICKER REFRESH] 🚫 Otonom pipeline engellendi: ${auth.error}`);
      return NextResponse.json({ blocked: true, reason: auth.error }, { status: 403 });
    }

    const result = await refreshTickerData();

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // AUTHORITY CHECK
    const auth = await executeTask({
      nodeId: 'trtex',
      action: 'data_write',
      payload: { task: 'ticker-refresh' },
      caller: 'cron_ticker_refresh',
    });

    if (!auth.success) {
      console.warn(`[TICKER REFRESH] 🚫 Otonom pipeline engellendi: ${auth.error}`);
      return NextResponse.json({ blocked: true, reason: auth.error }, { status: 403 });
    }

    const result = await refreshTickerData();
    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}
