import { NextResponse } from 'next/server';
import { runSelfImprovement } from '@/core/aloha/selfImprovement';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/self-improve
 * 
 * ALOHA Öz-Evrim Cron Job
 * Google Cloud Scheduler veya Vercel Cron tarafından günde 1 kez tetiklenir.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await runSelfImprovement();

    return NextResponse.json({
      success: result.success,
      message: 'Self-improvement cycle completed',
      data: result
    });

  } catch (error: any) {
    console.error('[CRON] Self-improve hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
