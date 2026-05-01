import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/master/hometex/approve
 * Hometex.ai Sanal Fuar — Katılımcı Onaylama Endpoint'i
 * HometexDashboard.tsx bu endpoint'i kullanarak durumu günceller.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Exhibitor ID is required' }, { status: 400 });
    }

    // Firestore'da durumu 'approved' olarak güncelle
    await adminDb.collection('hometex_exhibitors').doc(id).update({
      status: 'approved',
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: 'Exhibitor approved successfully' });
  } catch (error: any) {
    console.error('[HOMETEX] Approve exhibitor error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
