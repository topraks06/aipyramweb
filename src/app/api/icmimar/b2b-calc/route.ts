import { NextRequest, NextResponse } from "next/server";

/**
 * icmimar.ai — B2B Keşif Föyü Hesaplama API (Proxy to Perde b2b-calc)
 * IcmimarOrderSlideOver.tsx satır 95'ten çağrılır.
 */

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const origin = req.nextUrl.origin;

    const response = await fetch(`${origin}/api/perde/b2b-calc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[ICMIMAR-B2B-CALC] Proxy error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
