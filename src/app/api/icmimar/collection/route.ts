import { NextRequest, NextResponse } from "next/server";

/**
 * icmimar.ai — Koleksiyon Motoru API (Proxy to Perde collection)
 */

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const origin = req.nextUrl.origin;

    const response = await fetch(`${origin}/api/perde/collection`, {
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
    console.error("[ICMIMAR-COLLECTION] Proxy error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
