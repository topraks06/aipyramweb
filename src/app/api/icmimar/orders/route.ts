import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * icmimar.ai — Sipariş API
 */

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const snap = await adminDb.collection('icmimar_orders')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    
    const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("[ICMIMAR-ORDERS] Error:", error);
    return NextResponse.json({ error: error.message, orders: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const docRef = await adminDb.collection('icmimar_orders').add({
      ...body,
      createdAt: new Date(),
      status: body.status || 's1',
      source: body.source || 'api',
    });
    return NextResponse.json({ id: docRef.id, success: true });
  } catch (error: any) {
    console.error("[ICMIMAR-ORDERS] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
