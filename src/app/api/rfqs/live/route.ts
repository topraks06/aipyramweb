import { NextResponse } from "next/server";
import { generateLiveRFQs } from "@/core/agents/matchmakerAgent";
import { DEFAULT_BUDGET } from "@/core/agents/types";

// ═══════════════════════════════════════════════════════════════
// GET /api/rfqs/live — Canlı RFQ Akışı
// aipyram Revenue Engine — İlk Gelir Kapısı
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic"; // Zero-cache (Anayasa kuralı)

export async function GET() {
  try {
    const budget = {
      ...DEFAULT_BUDGET,
      maxTokens: 4096,
      maxCostUSD: 0.10,
    };

    const result = await generateLiveRFQs(budget);

    let rfqs = [];
    try {
      rfqs = JSON.parse(result.result);
    } catch {
      rfqs = [];
    }

    return NextResponse.json({
      success: true,
      rfqs,
      meta: {
        agent: result.agent,
        confidence: result.confidence,
        tokensUsed: result.tokensUsed,
        costUSD: result.costUSD,
        durationMs: result.durationMs,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[API /rfqs/live] Hata:", error.message);
    return NextResponse.json(
      { success: false, error: error.message, rfqs: [] },
      { status: 500 }
    );
  }
}
