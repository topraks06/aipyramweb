import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    await adminDb.collection("perde_orders").add({
      ...data,
      source: "erp_api",
      status: "s1",
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERP save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
