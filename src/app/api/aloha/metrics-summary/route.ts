import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * ALOHA METRİKS ÖZETİ — Hafif Monitoring Endpoint
 * 
 * Son 100 cycle'ı analiz eder:
 * - success_rate
 * - avg_actions  
 * - error_rate
 * - top_errors
 * - last_run
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && 
        authHeader !== `Bearer ${process.env.ALOHA_SECRET}`) {
      // Admin panel için basit kontrol — production'da güçlendir
      const url = new URL(req.url);
      const key = url.searchParams.get('key');
      if (key !== process.env.ALOHA_SECRET && key !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const metricsSnap = await adminDb
      .collection('aloha_metrics')
      .orderBy('created_at', 'desc')
      .limit(100)
      .get();

    if (metricsSnap.empty) {
      return NextResponse.json({
        success_rate: 0,
        total_cycles: 0,
        avg_actions: 0,
        error_rate: 0,
        avg_duration_ms: 0,
        last_run: null,
        top_errors: [],
        projects: {},
      });
    }

    const metrics = metricsSnap.docs.map(d => d.data());
    const total = metrics.length;
    const successes = metrics.filter(m => m.success === true).length;
    const totalActions = metrics.reduce((sum, m) => sum + (m.actions || 0), 0);
    const totalErrors = metrics.reduce((sum, m) => sum + (m.errors || 0), 0);
    const totalDuration = metrics.reduce((sum, m) => sum + (m.duration_ms || 0), 0);

    // Top errors (deduplicate)
    const errorMap: Record<string, number> = {};
    for (const m of metrics) {
      if (m.top_error) {
        const key = m.top_error.substring(0, 80);
        errorMap[key] = (errorMap[key] || 0) + 1;
      }
    }
    const topErrors = Object.entries(errorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }));

    // Per-project breakdown
    const projects: Record<string, { cycles: number; success: number; errors: number }> = {};
    for (const m of metrics) {
      const p = m.project || 'unknown';
      if (!projects[p]) projects[p] = { cycles: 0, success: 0, errors: 0 };
      projects[p].cycles++;
      if (m.success) projects[p].success++;
      projects[p].errors += m.errors || 0;
    }

    return NextResponse.json({
      success_rate: Math.round((successes / total) * 100) / 100,
      total_cycles: total,
      avg_actions: Math.round((totalActions / total) * 10) / 10,
      error_rate: Math.round((1 - successes / total) * 100) / 100,
      avg_duration_ms: Math.round(totalDuration / total),
      last_run: metrics[0]?.created_at || null,
      top_errors: topErrors,
      projects,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 200 }); // Never crash
  }
}
