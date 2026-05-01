import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * icmimar.ai — İletişim Formu API
 */

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    await adminDb.collection('icmimar_leads').add({
      name: body.name || '',
      email: body.email || '',
      phone: body.phone || '',
      message: body.message || '',
      source: 'icmimar_contact_form',
      status: 'NEW',
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[ICMIMAR-CONTACT] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
