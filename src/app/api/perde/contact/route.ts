import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { req_type, company, fullname, email, context } = body;

    if (!fullname || !email || !context) {
      return NextResponse.json({ error: "Lütfen zorunlu alanları (Ad Soyad, E-posta, Mesaj) doldurun." }, { status: 400 });
    }

    const newContact = {
      req_type: req_type || 'ERP Setup',
      company: company || '',
      fullname,
      email,
      context,
      status: 'new',
      createdAt: new Date().toISOString()
    };

    await adminDb.collection('perde_contacts').add(newContact);

    return NextResponse.json({
      success: true,
      message: "Talebiniz başarıyla alınmıştır. En kısa sürede sizinle iletişime geçeceğiz."
    });

  } catch (error: any) {
    console.error("[Perde.ai Contact] API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
