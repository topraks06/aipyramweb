import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/master/hometex/exhibitors
 * Hometex.ai Sanal Fuar — Katılımcı Listesi
 * HometexDashboard.tsx bu endpoint'i kullanır.
 */
export async function GET() {
  try {
    const snap = await adminDb.collection('hometex_exhibitors').get();
    const exhibitors = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ 
      success: true, 
      exhibitors,
      total: exhibitors.length 
    });
  } catch (error: any) {
    console.error('[HOMETEX] Exhibitors fetch error:', error.message);
    return NextResponse.json({ 
      success: false, 
      exhibitors: [],
      total: 0,
      error: error.message 
    }, { status: 500 });
  }
}
