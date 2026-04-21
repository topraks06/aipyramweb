import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/trtex-feed
 * 
 * ⚠️ DEPRECATED → master-cycle'a yönlendirildi.
 */
export async function GET(req: Request) {
  const host = req.headers.get('host') || `localhost:${process.env.PORT || 3000}`;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const cronSecret = process.env.CRON_SECRET || '';

  console.log('[CRON] ⚠️ trtex-feed DEPRECATED → master-cycle redirect');

  try {
    const res = await fetch(`${protocol}://${host}/api/cron/master-cycle`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'x-cron-secret': cronSecret,
      },
    });
    const data = await res.json();
    return NextResponse.json({ source: 'trtex-feed→master-cycle', ...data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
