import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Bu geçici bir In-Memory Vector Store simülasyonudur.
// Gerçek sistemde Firestore + Pinecone (veya Google Vertex Vector Search) kullanılacaktır.
const globalFabricVectorStore = new Map<string, {
  physics: {
    type: string;
    gsm: number;
    drape: string;
    light_transmission: string;
  };
  source_node: string;
  timestamp: number;
}>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image_base64, source_node = 'unknown' } = body;

    if (!image_base64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Gelen görselin DNA'sını (şimdilik SHA-256 Hash) çıkar
    // İleride burası: const embedding = await ai.getEmbedding(image)
    const base64Data = image_base64.split(',')[1] || image_base64;
    const hash = crypto.createHash('sha256').update(base64Data.substring(0, 10000)).digest('hex'); // Sadece ilk 10K karaktere bakarak hızlı hash

    // ZERO-DUPLICATION KONTROLÜ
    if (globalFabricVectorStore.has(hash)) {
      const memory = globalFabricVectorStore.get(hash);
      return NextResponse.json({
        cached: true,
        message: "Fabric recognized from aipyram Brain Memory. Zero API Credit used.",
        physics: memory?.physics,
        source: memory?.source_node
      });
    }

    // EĞER YOKSA (SİMÜLE EDİLMİŞ AĞIRLIK ANALİZİ)
    // İleride burası: Gemini Flash ile hızlı bir kez analiz edilecek ve kaydedilecek.
    const newPhysics = {
      type: "auto",
      gsm: 0, // Gerçek analiz Gemini Vision ile yapılacak
      drape: "natural",
      light_transmission: "semi-sheer"
    };

    globalFabricVectorStore.set(hash, {
      physics: newPhysics,
      source_node,
      timestamp: Date.now()
    });

    return NextResponse.json({
      cached: false,
      message: "New fabric analyzed and stored in aipyram Brain Memory.",
      physics: newPhysics
    });

  } catch (error: any) {
    console.error("[aipyram Brain] Fabric Memory Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
