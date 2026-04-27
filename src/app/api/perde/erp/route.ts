import { NextRequest, NextResponse } from "next/server";
import { admin, adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const decoded = await admin.auth().verifySessionCookie(sessionCookie.value, true);
    if (!decoded.uid) {
      return NextResponse.json({ error: "Geçersiz oturum" }, { status: 401 });
    }

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
