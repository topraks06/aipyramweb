import { NextResponse } from 'next/server';
import { maybeRunWeeklyTechScan } from '@/core/aloha/autoRunner';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/tech-scan
 * 
 * Haftalık Google altyapı taraması tetikleyici.
 * Cloud Scheduler veya Vercel Cron tarafından çağrılır.
 * Haftada 1'den fazla çalışmaz (Firestore lock kontrolü var).
 * 
 * Sonuçlar aloha_tech_proposals koleksiyonuna yazılır.
 * Otomatik uygulama YAPMAZ — Hakan'ın onayını bekler.
 */
export async function GET() {
  try {
    const didRun = await maybeRunWeeklyTechScan();
    
    return NextResponse.json({ 
      success: true, 
      executed: didRun,
      message: didRun 
        ? 'Haftalık Google altyapı taraması tamamlandı. Teklifler aloha_tech_proposals koleksiyonunda.'
        : 'Tarama atlandı — henüz 7 gün geçmemiş.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}
