import { NextRequest, NextResponse } from 'next/server';
import { generateProforma } from '@/lib/agents/DocumentAgent';

export const dynamic = 'force-dynamic';

/**
 * POST /api/quote-pdf
 * Body: { tenantId, orderId, orderData }
 * Returns: { pdfUrl }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, orderId, orderData } = body;

    if (!tenantId || !orderId) {
      return NextResponse.json(
        { error: 'tenantId ve orderId gerekli.' },
        { status: 400 }
      );
    }

    console.log(`[API /quote-pdf] PDF üretimi başlatılıyor: ${tenantId} / ${orderId}`);

    const result = await generateProforma(tenantId, orderId, orderData || {});

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
