/**
 * TRTEX Lead Yakalama API
 * POST /api/leads/capture — B2B lead yakalama
 * GET /api/leads/capture — Lead istatistikleri
 */
import { NextRequest, NextResponse } from 'next/server';
import { createLead, getLeadStats } from '@/core/aloha/leadEngine';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // CORS header
    const origin = request.headers.get('origin') || '';
    const allowedOrigins = ['https://trtex.com', 'https://www.trtex.com', 'http://localhost:3000', 'http://localhost:3001'];

    const result = await createLead({
      name: body.name || '',
      company: body.company || '',
      email: body.email || '',
      whatsapp: body.whatsapp || body.phone || '',
      country: body.country || 'Unknown',
      role: body.role || 'buyer',
      products: body.products || [],
      product_details: body.message || body.product_details || '',
      source_article_id: body.articleId || '',
      source_article_title: body.articleTitle || '',
      source_url: body.source || request.headers.get('referer') || '',
      utm_source: body.utm_source || 'website',
      is_premium: false,
    });
    
    let instant_offer = null;
    if (result.success) {
      // Gerçek AI teklif motoruna (MatchmakerWorkflow) bırakıldı.
      // Otonom ajan arka planda lead'i isleyecegi icin burada senkron mock teklif dondurmuyoruz.
      instant_offer = {
        status: "PROCESSING_BY_ALOHA_AGENT"
      };
      (result as any).instant_offer = instant_offer;
    }

    const response = NextResponse.json(result, { status: result.success ? 200 : 400 });

    if (allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const stats = await getLeadStats();
    return NextResponse.json({ success: true, report: stats });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
