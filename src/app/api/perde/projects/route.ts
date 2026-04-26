import { NextRequest, NextResponse } from "next/server";

// Geçiçi In-Memory Arşiv Deposu (Faz 4 MVP için)
// Gerçek sistemde Firestore 'perde_projects' koleksiyonuna kaydedilecek.
const globalProjectsStore = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
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

    const projectId = `prj_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const newProject = {
      id: projectId,
      customerName, phone: phone || '', address: address || '', company: company || '', projectName: projectName || 'İsimsiz Proje', notes: notes || '',
      identityNo: identityNo || '', email: email || '', deliveryDate: deliveryDate || '',
      width: width || '', height: height || '', pleatStyle: pleatStyle || '', seamStyle: seamStyle || '', mechanism: mechanism || '',
      totalPrice: totalPrice || '', downPayment: downPayment || '', remainingBalance: remainingBalance || '', paymentMethod: paymentMethod || '', installments: installments || '',
      originalImage, resultImage, fabrics: fabrics || [],
      SovereignNodeId: SovereignNodeId || 'perde',
      createdAt: new Date().toISOString()
    };

    globalProjectsStore.set(projectId, newProject);

    return NextResponse.json({
      success: true,
      message: "Proje müşteriye başarıyla kaydedildi.",
      projectId,
      project: newProject
    });

  } catch (error: any) {
    console.error("[Perde.ai Projects] Kayıt Hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      if (globalProjectsStore.has(id)) {
        return NextResponse.json({ project: globalProjectsStore.get(id) });
      }
      return NextResponse.json({ error: "Proje bulunamadı" }, { status: 404 });
    }

    // Tüm projeleri döndür
    const projects = Array.from(globalProjectsStore.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("[Perde.ai Projects] Getirme Hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
