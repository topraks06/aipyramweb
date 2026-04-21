import { NextResponse } from 'next/server';
import { runGlobalTenderCycle } from '@/core/aloha/trtex-live-indexer';

export const maxDuration = 300; // 5 minutes max execution time for heavy agent scans
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // B2B Güvenlik Doğrulaması (Google Cloud Scheduler üzerinden gönderilir)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'AIPYRAM_CRON_2026'}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const totalIndexed = await runGlobalTenderCycle();
    return NextResponse.json({ 
      success: true, 
      message: 'TRTEX Global Tender Cycle Tamamlandı.',
      indexedCount: totalIndexed,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Tender Cycle Fail:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
