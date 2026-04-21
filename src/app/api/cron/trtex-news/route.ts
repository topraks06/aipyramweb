import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/trtex-news
 * 
 * ⚠️ DEPRECATED → master-cycle'a yönlendirildi.
 * Eski aloha-cycle'a değil, doğrudan master-cycle'a redirect eder.
 */
export async function GET(req: Request) {
  const host = req.headers.get('host') || `localhost:${process.env.PORT || 3000}`;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const cronSecret = process.env.CRON_SECRET || '';

  console.log('[CRON] ⚠️ trtex-news DEPRECATED → master-cycle redirect');

  try {
    const res = await fetch(`${protocol}://${host}/api/cron/master-cycle`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'x-cron-secret': cronSecret,
      },
    });
    const data = await res.json();
    return NextResponse.json({ source: 'trtex-news→master-cycle', ...data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
