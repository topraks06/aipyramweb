import { NextResponse } from "next/server";
import { DomainMasterAgent } from "@/core/agents/domainMasterAgent";

export const dynamic = 'force-dynamic';

// Geçici güvenlik duvarı mock. Gerçekte auth katmanından alınır.
const checkMasterSignature = async (req: Request) => {
   const authHead = req.headers.get("authorization");
   return authHead === `Bearer ${process.env.ALOHA_MASTER_KEY}`;
};

/**
 * FAZ 5: İMPARATORLUK AĞ GEÇİDİ (DOMAIN ACTIVATION GATEWAY)
 * Dışarıdan domain=heimtex.ai gibi bir post geldiğinde DomainMaster'ı ateşler.
 * UYARI: Bu uçbirim Sovereign State koruması altındadır. "Aloha" onayı olmadan
 * sisteme otonom domain eklenemez.
 */
export async function POST(req: Request) {
  try {
    // 1. KİMLİK KONTROLÜ (Güvenlik Duvarı)
    const isAuthenticated = await checkMasterSignature(req);
    // Güvenlik duvarı simülasyonu / test aşamasındayız (Geliştirme için şimdilik bypass'ı açıyoruz, prod'da kapanmalı)
    if (!isAuthenticated && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Sovereign Node Erişim Reddi." }, { status: 401 });
    }

    const body = await req.json();
    const { domain } = body;

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "Geçersiz domain parametresi." }, { status: 400 });
    }

    // 2. KULUÇKA MOTORUNUN (DOMAIN MASTER) ATEŞLENMESİ
    console.log(`[🚀 GATEWAY] Otonom İmparatorluk Genişlemesi Tetiklendi Hedef: ${domain}`);
    
    const status = await DomainMasterAgent.spawnDomainIdentity(domain.trim().toLowerCase());

    if (status === "EXISTING") {
      return NextResponse.json({ message: "Domain zaten bir İmparatorluk Eyaleti.", status: "EXISTING" });
    }

    if (status === "ERROR") {
      return NextResponse.json({ error: "Mimar Ajan DNA sentezi sırasında çöktü." }, { status: 500 });
    }

    // 3. ZERO-EXTERNAL DEPENDENCY ÇIKTISI (Başarı)
    return NextResponse.json({ 
       message: "AIPyram Mühürlendi.",
       domain,
       note: "Bu domainin kimliği Firestore'a 'node_configs' altına gömülmüştür. Dumb Client ilk ziyarette kimliğini giyecektir." 
    }, { status: 201 });

  } catch (error: any) {
     return NextResponse.json({ error: error.message || "Bilinmeyen API Hatası" }, { status: 500 });
  }
}
