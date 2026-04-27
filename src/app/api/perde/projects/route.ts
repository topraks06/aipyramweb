import { NextRequest, NextResponse } from "next/server";
import { admin, adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    const decoded = await admin.auth().verifySessionCookie(sessionCookie.value, true);
    const uid = decoded.uid;

    const body = await req.json();
    const { 
      customerName, phone, address, company, projectName, notes,
      identityNo, email, deliveryDate,
      width, height, pleatStyle, seamStyle, mechanism,
      totalPrice, downPayment, remainingBalance, paymentMethod, installments,
      originalImage, resultImage, fabrics, SovereignNodeId
    } = body;

    if (!customerName || !resultImage || !originalImage) {
      return NextResponse.json({ error: "Eksik veri: Müşteri adı, orijinal veya sonuç görseli zorunludur." }, { status: 400 });
    }

    const newProject = {
      uid, // Tie to the logged in user
      customerName, phone: phone || '', address: address || '', company: company || '', projectName: projectName || 'İsimsiz Proje', notes: notes || '',
      identityNo: identityNo || '', email: email || '', deliveryDate: deliveryDate || '',
      width: width || '', height: height || '', pleatStyle: pleatStyle || '', seamStyle: seamStyle || '', mechanism: mechanism || '',
      totalPrice: totalPrice || '', downPayment: downPayment || '', remainingBalance: remainingBalance || '', paymentMethod: paymentMethod || '', installments: installments || '',
      originalImage, resultImage, fabrics: fabrics || [],
      SovereignNodeId: SovereignNodeId || 'perde',
      createdAt: new Date().toISOString()
    };

    const docRef = await adminDb.collection('perde_projects').add(newProject);

    return NextResponse.json({
      success: true,
      message: "Proje müşteriye başarıyla kaydedildi.",
      projectId: docRef.id,
      project: { id: docRef.id, ...newProject }
    });

  } catch (error: any) {
    console.error("[Perde.ai Projects] Kayıt Hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    const decoded = await admin.auth().verifySessionCookie(sessionCookie.value, true);
    const uid = decoded.uid;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const doc = await adminDb.collection('perde_projects').doc(id).get();
      if (doc.exists && doc.data()?.uid === uid) {
        return NextResponse.json({ project: { id: doc.id, ...doc.data() } });
      }
      return NextResponse.json({ error: "Proje bulunamadı" }, { status: 404 });
    }

    // Tüm projeleri döndür
    const snapshot = await adminDb.collection('perde_projects')
      .where('uid', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();
      
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("[Perde.ai Projects] Getirme Hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
