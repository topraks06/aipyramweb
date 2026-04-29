import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 Dakika maksimum süre, görsel üretimleri uzun sürebilir.

/**
 * GET /api/cron/scan-images
 * Bu endpoint Google Cloud Scheduler veya Vercel Cron tarafından periyodik olarak tetiklenebilir.
 * Günde 1 veya 2 kez çalışarak TRTEX arşivinde "image_generated: false" olan veya 
 * görseli eksik olan haberleri bulup otomatik üretir.
 */
export async function GET(request: Request) {
  try {
    console.log('[CRON] 📸 Otonom Görsel Tarama başlatılıyor...');
    
    // Auth header check (Basit güvenlik - Cron'dan geldiğini doğrulamak için)
    const authHeader = request.headers.get('authorization');
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}` || process.env.NODE_ENV === 'development';
    
    if (!isCron && process.env.NODE_ENV !== 'development') {
        console.warn('[CRON] Yetkisiz görsel tarama isteği.');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scanAndGenerateImages } = await import('@/core/aloha/missing-image-scanner');
    
    // Bir çalışmada maksimum 10 görsel üretelim (Maliyet/Timeout koruması)
    const result = await scanAndGenerateImages('trtex_news', 10);

    return NextResponse.json({
      success: true,
      scanned: result.scanned || 0,
      generated: result.generated || 0,
      skipped: result.skipped || 0,
      errors: result.failed || 0,
      message: `[CRON] 📸 ${result.generated || 0} eksik görsel otomatik tamamlandı.`,
    });
  } catch (err: any) {
    console.error('[CRON ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
