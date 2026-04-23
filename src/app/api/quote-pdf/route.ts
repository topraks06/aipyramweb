import { NextRequest, NextResponse } from 'next/server';
import { generateProforma } from '@/lib/agents/DocumentAgent';

export const dynamic = 'force-dynamic';

/**
 * POST /api/quote-pdf
 * Body: { SovereignNodeId, orderId, orderData }
 * Returns: { pdfUrl }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { SovereignNodeId, orderId, orderData } = body;

    if (!SovereignNodeId || !orderId) {
      return NextResponse.json(
        { error: 'SovereignNodeId ve orderId gerekli.' },
        { status: 400 }
      );
    }

    console.log(`[API /quote-pdf] PDF üretimi başlatılıyor: ${SovereignNodeId} / ${orderId}`);

    const result = await generateProforma(SovereignNodeId, orderId, orderData || {});

    return NextResponse.json({
      success: true,
      pdfUrl: result.pdfUrl,
      message: 'PDF başarıyla oluşturuldu.'
    });

  } catch (error: any) {
    console.error('[API /quote-pdf] Hata:', error);
    return NextResponse.json(
      { error: error.message || 'PDF oluşturulamadı.' },
      { status: 500 }
    );
  }
}
