import { NextResponse } from 'next/server';
import { runNewsPipeline, runBatchPipeline } from '@/core/aloha/newsEngine';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 dakika timeout (görsel üretimi uzun sürer)

/**
 * POST /api/aloha/trigger-manual
 * 
 * Tek haber:
 *   { "customBrief": "Türkiye ev tekstili ihracatı rekor kırdı..." }
 * 
 * Çoklu haber:
 *   { "briefs": ["brief1", "brief2", "brief3"] }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customBrief, briefs, priority, intent } = body;

    // Çoklu haber modu
    if (Array.isArray(briefs) && briefs.length > 0) {
      console.log(`[TRIGGER] 📡 Batch modu: ${briefs.length} haber üretilecek`);
      const results = await runBatchPipeline(briefs);
      const successCount = results.filter(r => r.success).length;
      return NextResponse.json({
        success: true,
        mode: 'batch',
        total: briefs.length,
        succeeded: successCount,
        failed: briefs.length - successCount,
        results,
      });
    }

    // Tek haber modu
    if (!customBrief) {
      return NextResponse.json(
        { error: 'customBrief veya briefs[] zorunlu.' },
        { status: 400 }
      );
    }

    // Priority/intent bilgisini brief'e ekle
    let enrichedBrief = customBrief;
    if (priority === 'HIGH') enrichedBrief += '\n[ÖNCELİK: YÜKSEK — Acil yayın]';
    if (intent) enrichedBrief += `\n[NİYET: ${intent}]`;

    console.log(`[TRIGGER] 📡 Tek haber modu: "${customBrief.substring(0, 60)}..."`);
    const result = await runNewsPipeline(enrichedBrief);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Pipeline başarısız' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mode: 'single',
      articleId: result.articleId,
      title: result.title,
      imageCount: result.imageCount,
      qualityScore: result.qualityScore,
      durationMs: result.durationMs,
    });
  } catch (err: any) {
    console.error('[TRIGGER ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/aloha/trigger-manual
 * Basit durum kontrolü
 */
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    engine: 'ALOHA News Engine v2.0',
    capabilities: ['single', 'batch'],
    usage: 'POST { "customBrief": "..." } veya { "briefs": ["...", "..."] }',
  });
}
