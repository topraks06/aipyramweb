import { NextResponse } from 'next/server';
import { executeLiveTickerCycle } from '@/core/aloha/tickerEngine';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 saniye Gemini araması vs. için zaman verebilir.

/**
 * GET /api/aloha/ticker/run
 * Otonom Canlı Ticker Motorunu (Multi-Fallback) Tetikler.
 * Bunu Vercel / Google Cloud Scheduler üzerinden saatlik CronJob bağlayacağız.
 */
export async function GET(req: Request) {
  try {
    const start = Date.now();
    
    // Ticker Motorunu ateşle
    const payload = await executeLiveTickerCycle();
    
    const duration = Date.now() - start;

    return NextResponse.json({
      success: true,
      message: 'TRTEX Otonom B2B Ticker Engine başarıyla çalıştı.',
      duration_ms: duration,
      payload
    }, { status: 200 });

  } catch (error: any) {
    console.error('[ALOHA OTONOM TICKER] Otonom döngü CRITICAL ERROR:', error);
    return NextResponse.json({
      success: false,
      message: 'Ticker motoru çöktü. Fallback sistemleri dahi yanıt vermedi veya Firebase bağlantı hatası oluştu.',
      error: error.message
    }, { status: 500 });
  }
}
