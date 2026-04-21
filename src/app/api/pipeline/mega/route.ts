/**
 * MEGA PIPELINE API — Tek Tuşla Balık Tut
 * 
 * GET  /api/pipeline/mega → durum raporu
 * POST /api/pipeline/mega → pipeline'ı çalıştır
 * 
 * Body: { project: "trtex" }   (opsiyonel, varsayılan trtex)
 */
import { NextRequest, NextResponse } from 'next/server';
import { runMegaPipeline } from '@/core/aloha/megaPipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 dakika timeout

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    let project = 'trtex';
    try {
      const body = await request.json();
      project = body.project || 'trtex';
    } catch {
      // body yoksa varsayılan trtex
    }

    console.log(`[MEGA API] 🚀 Pipeline başlatılıyor: ${project}`);

    const result = await runMegaPipeline(project);

    return NextResponse.json({
      success: true,
      ...result,
      apiDuration: Math.round((Date.now() - startTime) / 1000),
    });
  } catch (err: any) {
    console.error(`[MEGA API] ❌ Pipeline hatası:`, err.message);
    return NextResponse.json({
      success: false,
      error: err.message,
      duration: Math.round((Date.now() - startTime) / 1000),
    }, { status: 500 });
  }
}

export async function GET() {
  // Basit durum raporu
  try {
    const { adminDb } = await import('@/lib/firebase-admin');

    const [opps, pages, leads, runs] = await Promise.all([
      adminDb.collection('trtex_opportunities').limit(1).get().then(s => s.size).catch(() => 0),
      adminDb.collection('trtex_landing_pages').limit(1).get().then(s => s.size).catch(() => 0),
      adminDb.collection('trtex_leads').limit(1).get().then(s => s.size).catch(() => 0),
      adminDb.collection('aloha_pipeline_runs').orderBy('createdAt', 'desc').limit(1).get().catch(() => null),
    ]);

    const lastRun = runs && !runs.empty ? runs.docs[0].data() : null;

    return NextResponse.json({
      status: 'ready',
      collections: {
        trtex_opportunities: opps > 0 ? 'has_data' : 'empty',
        trtex_landing_pages: pages > 0 ? 'has_data' : 'empty',
        trtex_leads: leads > 0 ? 'has_data' : 'empty',
      },
      lastRun: lastRun ? {
        summary: lastRun.summary,
        duration: lastRun.totalDuration,
        date: lastRun.createdAt,
      } : null,
      usage: 'POST /api/pipeline/mega with {"project":"trtex"} to run',
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', error: err.message }, { status: 500 });
  }
}
