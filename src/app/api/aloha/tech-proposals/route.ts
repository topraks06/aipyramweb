import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/aloha/tech-proposals — Bekleyen Google altyapı tekliflerini getir
 */
export async function GET() {
  try {
    if (!adminDb) throw new Error('Firebase Admin bağlantısı yok');

    const snap = await adminDb
      .collection('aloha_tech_proposals')
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();

    const proposals = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const pending = proposals.filter((p: any) => p.status === 'pending_approval');
    const approved = proposals.filter((p: any) => p.status === 'approved');

    return NextResponse.json({ 
      success: true, 
      data: proposals,
      stats: { total: proposals.length, pending: pending.length, approved: approved.length }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/aloha/tech-proposals — Teklifi onayla veya reddet
 * Body: { id: string, action: 'approve' | 'reject' }
 * 
 * ⚠️ Onay sonrası Aloha uygulama planı çıkarır.
 * Direkt uygulama yapmaz — plan oluşturur ve bir sonraki adımda uygular.
 */
export async function POST(req: Request) {
  try {
    if (!adminDb) throw new Error('Firebase Admin bağlantısı yok');

    const body = await req.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'id ve action gerekli' }, { status: 400 });
    }

    const docRef = adminDb.collection('aloha_tech_proposals').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ success: false, error: 'Teklif bulunamadı' }, { status: 404 });
    }

    if (action === 'approve') {
      await docRef.update({
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: 'hakan',
      });
      return NextResponse.json({ 
        success: true, 
        message: `✅ Teklif onaylandı. Aloha bir sonraki taramada uygulama planı çıkaracak.` 
      });
    } else if (action === 'reject') {
      await docRef.update({
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: 'hakan',
      });
      return NextResponse.json({ success: true, message: '❌ Teklif reddedildi.' });
    }

    return NextResponse.json({ success: false, error: 'action: approve veya reject olmalı' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
