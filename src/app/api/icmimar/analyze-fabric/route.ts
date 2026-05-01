import { NextRequest, NextResponse } from "next/server";

/**
 * icmimar.ai — Kumaş Analizi API (Proxy to Perde analyze-fabric)
 * IcmimarAIAssistant.tsx satır 609'dan çağrılır.
 */

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const origin = req.nextUrl.origin;

    const response = await fetch(`${origin}/api/perde/analyze-fabric`, {
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
    console.error("[ICMIMAR-ANALYZE] Proxy error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
