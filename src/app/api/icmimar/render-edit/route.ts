import { NextRequest, NextResponse } from "next/server";
import { alohaAI } from "@/core/aloha/aiClient";
import { admin, adminDb } from "@/lib/firebase-admin";

/**
 * ═══════════════════════════════════════════════════════════════
 *  İCMİMAR.AI — CİLA MOTORU (Render Edit) v5.0
 *  
 *  Model: gemini-3.1-pro-image-preview (Yüksek kalite Img2Img)
 *  
 *  Kullanıcı mevcut bir tasarımı "Rengi kırmızı yap",
 *  "Tülü kaldır", "Işığı yumuşat" gibi komutlarla düzenler.
 * ═══════════════════════════════════════════════════════════════
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      originalImageBase64,
      editPrompt,
      renderQuality = "4K",
      SovereignNodeId = "icmimar",
    } = body;

    if (!originalImageBase64 || !editPrompt) {
      return NextResponse.json(
        { error: "Orijinal görsel ve düzenleme talimatı gereklidir." },
        { status: 400 }
      );
    }

    // ── Auth (Dev bypass destekli) ──
    const isDev = process.env.NODE_ENV === 'development';
    let uid: string | null = null;

    if (isDev) {
      uid = 'dev-bypass-user';
    } else {
      const sessionCookie = req.cookies.get("session");
      if (sessionCookie?.value) {
        try {
          const decoded = await admin.auth().verifySessionCookie(sessionCookie.value, true);
          uid = decoded.uid;
        } catch (authErr) {
          console.error("[ICMIMAR-EDIT] Auth error:", authErr);
        }
      }
    }

    // ── Base64 Temizle ──
    const base64Data = originalImageBase64.includes(",")
      ? originalImageBase64.split(",")[1]
      : originalImageBase64;

    // ── Gemini Image Edit — En Yeni Model ──
    const ai = alohaAI.getClient();
    const modelName = "gemini-3-pro-image-preview";

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg",
            },
          },
          {
            text: `Bu görseli şu talimata göre düzenle: ${editPrompt}. 
            
KRİTİK KURALLAR:
- Bu bir IMAGE-TO-IMAGE düzenleme işlemidir. Sıfırdan görsel YARATMA.
- Fotogerçekçi ve profesyonel stüdyo kalitesini koru
- Mekanın genel yapısını ve perspektifini BOZMADAN sadece istenen değişiklikleri uygula
- Kumaş dokularını gerçekçi tut — orijinal görseldeki dokuları BOZMA
- Fotoğrafı TERS ÇEVİRME (NO MIRROR/FLIP)
- Sonuç dergi kapağı kalitesinde, fotogerçekçi ve kusursuz olmalı
- SADECE görsel üret, metin yanıt VERME`,
          },
        ],
      },
      config: {
        responseModalities: ["IMAGE", "TEXT"],
      } as any,
    });

    const candidate = response.candidates?.[0];
    if (!candidate) {
      throw new Error("API yanıt döndürmedi.");
    }

    if (candidate.finishReason === "SAFETY") {
      return NextResponse.json(
        { error: "Güvenlik filtresi: İsteminiz güvenlik politikalarına takıldı." },
        { status: 422 }
      );
    }

    let renderUrl: string | null = null;
    let responseText = "";

    for (const part of candidate.content?.parts || []) {
      if (part.inlineData) {
        renderUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
      if (part.text) {
        responseText += part.text;
      }
    }

    if (!renderUrl) {
      return NextResponse.json(
        { error: "Cila motoru görsel oluşturamadı.", aiResponse: responseText },
        { status: 500 }
      );
    }

    console.log(`[ICMIMAR-EDIT v5.0] ✅ Cila tamamlandı. Model: ${modelName}`);

    return NextResponse.json({
      renderUrl,
      aiResponse: responseText,
    });

  } catch (error: any) {
    console.error("[ICMIMAR-EDIT v5.0] API Error:", error);
    return NextResponse.json(
      { error: error.message || "Düzenleme hatası" },
      { status: 500 }
    );
  }
}
