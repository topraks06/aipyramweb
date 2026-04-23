import { NextResponse } from 'next/server';
import { masterCron } from '@/core/cron/masterCron';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Cloud Run: 5 dakika timeout

/**
 * GET /api/v1/brain/cron-pulse — Cloud Scheduler Tetikleyici
 * 
 * Cloud Scheduler bu endpoint'i her 30 dakikada bir çağırır.
 * Hem sağlık kontrolü hem de otonom tarama + onay yürütme yapar.
 * 
 * Query params:
 * - mode=scan → Tam proje taraması + teklif oluşturma
 * - mode=execute → Onaylanmış teklifleri yürüt
 * - mode=full → İkisini birden yap (varsayılan)
 * - mode=pulse → Sadece sağlık kontrolü
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const API_SECRET = process.env.AIPYRAM_SECRET_KEY || 'hometex-neural-secure-token-2026';
  const url = new URL(request.url);
  const tokenParam = url.searchParams.get('token');
  const mode = url.searchParams.get('mode') || 'full';

  // Güvenlik: Localhost veya geçerli token
  const isLocalhost = request.headers.get('host')?.includes('localhost');
  const isAuthorized = isLocalhost || authHeader === `Bearer ${API_SECRET}` || tokenParam === API_SECRET;

  if (!isAuthorized) {
    console.warn('[⛔ CLOUD] Yetkisiz Cloud Pulse vuruşu!');
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log(`[🌩️ CLOUD SCHEDULER] Mode: ${mode} — ${new Date().toISOString()}`);
    const results: Record<string, any> = { mode, timestamp: Date.now() };

    // PULSE: Her zaman çalışır
    results.pulse = masterCron.triggerPulse();

    // SCAN: Tüm projeleri tara, sorunları tespit et
    if (mode === 'scan' || mode === 'full') {
      await masterCron.runFullScan();
      results.scan = 'completed';
    }

    // EXECUTE: Onaylanmış teklifleri yürüt
    if (mode === 'execute' || mode === 'full') {
      await masterCron.runApprovedExecutions();
      results.execute = 'completed';
    }

    // AUTO: Tam otonom operatör döngüsü (6 saatte 1 Cloud Scheduler ile)
    if (mode === 'auto') {
      const { invokeAgent } = await import('@aipyram/aloha-sdk');
      const PRIORITY_PROJECTS = ['trtex']; // Sadece TRTEX otonom
      const cycleResults = [];

      for (const tenant of PRIORITY_PROJECTS) {
        const res = await invokeAgent({
          tenant,
          action: 'autonomous_cycle',
          payload: { projectName: tenant }
        });
        if (res.success && res.data) {
          cycleResults.push(res.data);
        }
      }

      results.auto = {
        projectsProcessed: cycleResults.length,
        totalActions: cycleResults.reduce((sum, r) => sum + (r.actionsPerformed?.length || 0), 0),
        totalErrors: cycleResults.reduce((sum, r) => sum + (r.errors?.length || 0), 0),
        details: cycleResults.map(r => ({
          project: r.project,
          actions: r.actionsPerformed,
          duration: r.duration,
        })),
      };
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error('[🌩️ CLOUD SCHEDULER] ❌ Pulse çöktü:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
