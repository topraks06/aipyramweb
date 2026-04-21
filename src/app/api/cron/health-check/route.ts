import { NextResponse } from 'next/server';
import { executeToolCall } from '@/core/aloha/engine';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[⏰ CRON] Sağlık Kontrolü Başlatılıyor...');

    // Engine'den auth-free bir infaz 
    const report = await executeToolCall({ name: 'audit_all_projects' });

    // Sonucu Firebase'e health_logs diye bir yere kaydet
    await adminDb.collection('system_health_logs').add({
      timestamp: Date.now(),
      report,
    });

    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    console.error('[🚨 CRON ERROR]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
