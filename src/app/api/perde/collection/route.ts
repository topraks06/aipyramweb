import { NextRequest, NextResponse } from "next/server";
import { alohaAI } from "@/core/aloha/aiClient";

/**
 * ═══════════════════════════════════════════════════════════════
 *  PERDE.AI — KOLEKSİYON MOTORU (Tex2Tex)
 *  Kaynak: Orijinal perde.ai/src/services/gemini.ts → generateProductIdeas()
 * 
 *  Kumaş türü + konsept + renk paleti gir →
 *  3 farklı koleksiyon ürünü (isim, teknik detay, fiyat, render prompt) üretir.
 * ═══════════════════════════════════════════════════════════════
 */

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fabric, style, colorPalette } = body;

    if (!fabric || !style) {
      return NextResponse.json(
        { error: "Kumaş türü ve tasarım konsepti gereklidir." },
        { status: 400 }
      );
    }

    const fullStyle = colorPalette ? `${style}. Renk Paleti: ${colorPalette}` : style;

    const result = await alohaAI.generateJSON(
      `Sen vizyoner bir İç Mimar ve Tekstil Tasarım Şefisin. Dünyanın en iyi kumaş şirketlerinden biri için koleksiyon hazırlıyorsun.

Girdiler:
Kumaş/İplik/Doku Özellikleri: ${fabric}
Konsept/Stil ve Renk Paleti: ${fullStyle}

Bu verilere dayanarak devasa projelere yakışacak 3 farklı Üst Düzey Perde / Tekstil Koleksiyon ürünü tasarla.

Return the response ONLY as a valid JSON array of objects, where each object has:
- name: Koleksiyon / Ürün Adı (örn: Oslo İskandinav Keten Serisi)
- type: Tül, Fon, Karartma Stor, Minimalist Döşemelik vs.
- description: Mimar gözüyle mekana etkisini anlatan büyüleyici açıklama.
- technicalDetails: Örn: 1:3 Sık Pile Kanun, 280cm En, Kurşunlu Etek, Somfy Motorlu ray montaj.
- priceEstimate: Metre fiyatı tahmini (TRL bazında tam sayı, örn: 1500)
- imagePrompt: A highly detailed, photorealistic interior design photography prompt for an AI image generator (MUST be in English). Ensure lighting, texture, and drapery details are specified clearly.
- fabricComposition: Kumaş karışım oranı (örn: %60 Keten, %40 Polyester)
- martindale: Martindale dayanıklılık (sayı, örn: 30000)
- fireRating: Yangın sınıfı (örn: M1, B1, DIN 4102-B1)`,
      {
        complexity: "routine",
      },
      "perde.collection-engine"
    );

    // Her ürün için render al (paralel)
    const ai = alohaAI.getClient();
    const ideasWithImages = await Promise.all(
      (result as any[]).map(async (idea: any) => {
        try {
          const imgResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-image-generation",
            contents: idea.imagePrompt,
            config: {
              responseModalities: ["IMAGE", "TEXT"],
            } as any,
          });

          let imageUrl: string | null = null;
          for (const part of imgResponse.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }
          return { ...idea, imageUrl };
        } catch {
          return { ...idea, imageUrl: null };
        }
      })
    );

    return NextResponse.json({
      success: true,
      collection: ideasWithImages,
    });

  } catch (error: any) {
    console.error("[COLLECTION] API Error:", error);
    return NextResponse.json(
      { error: error.message || "Koleksiyon üretim hatası" },
      { status: 500 }
    );
  }
}
