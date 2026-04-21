import { NextResponse } from 'next/server';
import { proposalQueue } from '@/core/aloha/proposalQueue';

export const dynamic = 'force-dynamic';

/**
 * GET /api/aloha/proposals — Bekleyen teklifleri getir
 */
export async function GET() {
  try {
    const proposals = await proposalQueue.getPendingProposals();
    return NextResponse.json({ success: true, data: proposals });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/aloha/proposals — Teklifi onayla veya reddet
 * Body: { id: string, action: 'approve' | 'reject', mode?: 'dry-run' | 'execute' }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, action, mode = 'dry-run' } = body;

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'id ve action gerekli' }, { status: 400 });
    }

    if (action === 'approve') {
      const ok = await proposalQueue.approveProposal(id, mode);
      return NextResponse.json({
        success: ok,
        message: ok
          ? (mode === 'dry-run' ? 'Dry-run başlatıldı. Sonuç kaydedilecek.' : 'Gerçek yürütme onaylandı.')
          : 'Onay hatası.',
      });
    } else if (action === 'reject') {
      const ok = await proposalQueue.rejectProposal(id);
      return NextResponse.json({ success: ok, message: ok ? 'Teklif reddedildi.' : 'Red hatası.' });
    }

    return NextResponse.json({ success: false, error: 'Geçersiz action: approve veya reject olmalı' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
