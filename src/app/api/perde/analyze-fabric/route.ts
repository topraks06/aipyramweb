import { NextRequest, NextResponse } from "next/server";
import { alohaAI } from "@/core/aloha/aiClient";
import { admin } from "@/lib/firebase-admin";

/**
 * ═══════════════════════════════════════════════════════════════
 *  PERDE.AI — KUMAŞ ANALİZ API (Img2Tex)
 *  Kaynak: Orijinal perde.ai/src/services/gemini.ts → analyzeFabricInspiration()
 * 
 *  Kullanıcı herhangi bir fotoğraf yükler (doğa, mimari, sanat vb.)
 *  Sistem bu görselı analiz edip en uygun 3 farklı tekstil çözümü önerir.
 * ═══════════════════════════════════════════════════════════════
 */

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session");
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }
    await admin.auth().verifySessionCookie(sessionCookie.value, true);

    const body = await req.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Analiz için bir görsel gereklidir." },
        { status: 400 }
      );
    }

    const base64Data = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    const result = await alohaAI.generateJSON(
      [
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg",
          },
        },
        {
          text: `Sen uzman bir tekstil mühendisi ve iç mimarsın. Ekteki ilham görselini analiz et ve bu görsele en uygun, mekanda kullanılabilecek 3 farklı perde/tekstil çözümü (Fon, Tül, Stor, vb.) öner.

Lütfen cevabı aşağıdaki JSON formatında döndür:
[
  {
    "category": "Kategori (örn: Fon Perde, Tül, Döşemelik, Stor Perde)",
    "fabricType": "Kumaş Türü (örn: Keten, Kadife, Şifon, Polyester)",
    "color": "Renk ve Ton (örn: Zümrüt Yeşili, Antrasit Gri)",
    "pattern": "Desen ve Doku (örn: Düz, Geometrik, Çiçekli, Damask)",
    "reason": "Neden bu görsel için uygun? (Teknik ve estetik açıklama)",
    "priceRange": "Tahmini metre fiyatı (örn: ₺850 - ₺2.400)",
    "martindale": "Martindale dayanıklılık (örn: 25.000 sürtünme, eğer döşemelik ise)",
    "washInstructions": "Yıkama talimatı (örn: 30°C Hassas Yıkama)"
  }
]`,
        },
      ],
      {
        complexity: "routine",
      },
      "perde.analyze-fabric"
    );

    return NextResponse.json({
      success: true,
      suggestions: result,
    });

  } catch (error: any) {
    console.error("[ANALYZE-FABRIC] API Error:", error);
    return NextResponse.json(
      { error: error.message || "Kumaş analiz hatası" },
      { status: 500 }
    );
  }
}
