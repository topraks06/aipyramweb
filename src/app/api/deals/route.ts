import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * GET /api/deals
 * Aktif deal'leri getir.
 */
export async function GET() {
  try {
    const dealsSnap = await adminDb.collection("deals").orderBy("createdAt", "desc").get();
    const deals = dealsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ success: true, data: deals });
  } catch (error: any) {
    console.error("[DEALS_GET] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/deals
 * Bir Match sonucunda deal oluşturur. (Supplier unlock yaptıktan sonra)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { node_id = "aipyram-core", rfqId, matchId, buyerId, supplierId, negotiatedPrice, commissionRate = 0.03 } = body;

    if (!rfqId || !supplierId) {
      return NextResponse.json({ success: false, error: "rfqId and supplierId required" }, { status: 400 });
    }

    const docRef = await adminDb.collection("deals").add({
        node_id,
        rfqId,
        matchId: matchId || "MANUAL_UNLOCK",
        buyerId: buyerId || "UNKNOWN",
        supplierId,
        status: "negotiation",
        negotiatedPrice: negotiatedPrice || 0,
        commissionRate,
        createdAt: Date.now()
    });

    return NextResponse.json({ success: true, dealId: docRef.id });
  } catch (err: any) {
      console.error("[DEALS_POST] Error:", err.message);
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
