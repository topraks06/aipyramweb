import { NextRequest, NextResponse } from "next/server";
import { RFQData } from "@/core/agents/matchmakerAgent";
import { EventBus } from "@/core/events/eventBus";
import { initializePipeline } from "@/core/aloha/rfq-pipeline";

// ═══════════════════════════════════════════════════════════════
// POST /api/rfqs/match — RFQ → Tam Otonom Ajan Zinciri (A2A Pipeline)
// AIPYRAM Revenue Engine — Komisyon Motoru
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

initializePipeline(); // Pipeline dinleyicilerini (Matchmaker -> Polyglot -> Auditor) ayağa kaldırır

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rfq, node_id = "aipyram-core" } = body as { rfq: RFQData; node_id?: string };

    if (!rfq || !rfq.product) {
      return NextResponse.json(
        { success: false, error: "RFQ verisi eksik. 'product' alanı zorunludur." },
        { status: 400 }
      );
    }

    // A2A Pipeline'ı ateşleyen ilk dominant sinyal
    await EventBus.emit({
      type: "RFQ_SUBMITTED",
      source: "API_GATEWAY",
      node_id: node_id,
      payload: rfq
    });

    return NextResponse.json({
      success: true,
      message: "RFQ başarıyla Otonom Ajan Zincirine (A2A Pipeline) aktarıldı. Süreç başladı.",
      rfqId: rfq.id,
      meta: {
        processedAt: new Date().toISOString(),
        queuedInRedis: true
      },
    });
  } catch (error: any) {
    console.error("[API /rfqs/match] A2A Pipeline Tetikleme Hatası:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * RFQ'dan tahmini anlaşma değeri hesaplar (HITL kararı için)
 */
function parseEstimatedValue(rfq: RFQData): number {
  const quantity = rfq.quantity || "";
  const price = rfq.targetPrice || "";

  // Basit metin parsing — ileride daha gelişmiş olacak
  const qtyMatch = quantity.match(/(\d[\d,.]*)/);
  const priceMatch = price.match(/(\d[\d,.]*)/);

  if (qtyMatch && priceMatch) {
    const qty = parseFloat(qtyMatch[1].replace(/,/g, ""));
    const prc = parseFloat(priceMatch[1].replace(/,/g, ""));
    return qty * prc;
  }

  return 0; // Tahmin edilemezse 0 — otomatik onay
}
