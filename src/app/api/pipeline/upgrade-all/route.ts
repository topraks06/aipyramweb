/**
 * UPGRADE-ALL API — Tek Tuşla 131 Haberi Dergi Kalitesine Çıkar
 * 
 * POST /api/pipeline/upgrade-all → haberleri upgrade et
 * GET  /api/pipeline/upgrade-all → son upgrade raporu
 */
import { NextRequest, NextResponse } from 'next/server';
import { upgradeAllArticles } from '@/core/aloha/articleUpgrader';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    let project = 'trtex';
    try {
      const body = await request.json();
      project = body.project || 'trtex';
    } catch {}

    console.log(`[UPGRADE API] 🎨 Article upgrade başlatılıyor: ${project}`);

    const result = await upgradeAllArticles(project);

    return NextResponse.json({
      success: true,
      ...result,
      apiDuration: Math.round((Date.now() - start) / 1000),
    });
  } catch (err: any) {
    console.error(`[UPGRADE API] ❌ Hata:`, err.message);
    return NextResponse.json({
      success: false,
      error: err.message,
      duration: Math.round((Date.now() - start) / 1000),
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { adminDb } = await import('@/lib/firebase-admin');

    const runs = await adminDb
      .collection('aloha_pipeline_runs')
      .where('type', '==', 'article_upgrade')
      .limit(1)
      .get()
      .catch(() => null);

    const lastRun = runs && !runs.empty ? runs.docs[0].data() : null;

    return NextResponse.json({
      status: 'ready',
      lastRun: lastRun ? {
        upgraded: lastRun.upgraded,
        failed: lastRun.failed,
        total: lastRun.totalArticles,
        duration: lastRun.duration,
        date: lastRun.createdAt,
      } : null,
      usage: 'POST /api/pipeline/upgrade-all with {"project":"trtex"} to run',
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', error: err.message }, { status: 500 });
  }
}
