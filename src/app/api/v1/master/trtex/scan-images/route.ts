import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * POST /api/v1/master/trtex/scan-images
 * Görselsiz haberleri tarar ve 3'lü görsel üretir
 */
export async function POST() {
  try {
    console.log('[TRTEX-SCAN] 📸 Görsel tarama başlatılıyor...');
    const { scanAndGenerateImages } = await import('@/core/aloha/missing-image-scanner');
    const result = await scanAndGenerateImages('trtex_news', 10);

    return NextResponse.json({
      success: true,
      scanned: result.scanned || 0,
      generated: result.generated || 0,
      skipped: result.skipped || 0,
      errors: result.failed || 0,
      message: `📸 ${result.generated || 0} görsel üretildi (${result.skipped || 0} atlandı)`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
