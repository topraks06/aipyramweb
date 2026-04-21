import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * POST /api/deals/[id]/feedback
 * Kapanan veya iptal olan deal'ların geri beslemesini (Outcome) işler.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { tenant_id = "aipyram-core", outcome, reason, finalValue } = await req.json();

    if (!outcome) {
      return NextResponse.json({ success: false, error: "outcome is required (WON or LOST)" }, { status: 400 });
    }

    const dealRef = adminDb.collection("deals").doc(id);
    const dealSnap = await dealRef.get();
    
    if (!dealSnap.exists) {
      return NextResponse.json({ success: false, error: "Deal not found" }, { status: 404 });
    }

    const dealData = dealSnap.data();

    // 1. Update the deal
    await dealRef.update({
      status: outcome === "WON" ? "completed" : "expired",
      outcomeReason: reason || "",
      negotiatedPrice: finalValue || dealData?.negotiatedPrice || 0,
      updatedAt: Date.now()
    });

    // 2. Record this outcome into the Knowledge Flywheel
    const { recordMemory } = await import("@/core/memory/knowledgeFlywheel");
    const supplierId = dealData?.supplierId;
    const rfqId = dealData?.rfqId;
    
    await recordMemory({
      tenant_id,
      source: "Deal_Outcome",
      text: `Deal [${id}] for RFQ [${rfqId}] with Supplier [${supplierId}] was ${outcome}. Reason: ${reason || "N/A"}. Value: $${finalValue || 0}`,
      agentId: "MATCHMAKER",
      metadata: { dealId: id, supplierId, outcome, reason }
    });

    return NextResponse.json({ success: true, message: "Feedback recorded in knowledge flywheel." });
  } catch (error: any) {
    console.error(`[DEAL_FEEDBACK] Error:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
