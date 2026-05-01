import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * icmimar.ai — Müşteri CRM API
 */

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const snap = await adminDb.collection('icmimar_customers')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    
    const customers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ customers });
  } catch (error: any) {
    console.error("[ICMIMAR-CUSTOMERS] Error:", error);
    return NextResponse.json({ error: error.message, customers: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const docRef = await adminDb.collection('icmimar_customers').add({
      ...body,
      createdAt: new Date(),
      source: body.source || 'manual',
    });
    return NextResponse.json({ id: docRef.id, success: true });
  } catch (error: any) {
    console.error("[ICMIMAR-CUSTOMERS] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
