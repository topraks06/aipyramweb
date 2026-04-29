import { NextRequest, NextResponse } from "next/server";
import { alohaAI } from "@/core/aloha/aiClient";
import { adminDb, admin } from "@/lib/firebase-admin";
import { checkCredits, deductCredit, logSovereignAction } from "@aipyram/aloha-sdk";

/**
 * ═══════════════════════════════════════════════════════════════
 *  PERDE.AI — RENDER DÜZENLEME API (Edit Render)
 *  Kaynak: Orijinal perde.ai/src/services/gemini.ts → editProfessionalRender()
 * 
 *  Kullanıcı mevcut bir render sonucunu "Rengi kırmızı yap",
 *  "Tülü kaldır", "Işığı yumuşat" gibi komutlarla düzenler.
 * ═══════════════════════════════════════════════════════════════
 */

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      originalImageBase64, // Düzenlenecek mevcut render (data:image/... veya saf base64)
      editPrompt,          // "Perdenin rengini bordo yap" gibi doğal dil komutu
      renderQuality = "2K",
      SovereignNodeId = "perde",
    } = body;

    if (!originalImageBase64 || !editPrompt) {
      return NextResponse.json(
        { error: "Orijinal görsel ve düzenleme talimatı gereklidir." },
        { status: 400 }
      );
    }

    // ── Auth & Kredi + 👑 SOVEREIGN BYPASS ──
    const SOVEREIGN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'hakantoprak71@gmail.com').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    const sessionCookie = req.cookies.get("session");
    let uid: string | null = null;
    let isSovereign = false;
    if (sessionCookie?.value) {
      try {
        const decoded = await admin.auth().verifySessionCookie(sessionCookie.value, true);
        uid = decoded.uid;
        
        // 👑 SOVEREIGN BYPASS — Kurucu email kontrolü
        const userRecord = await admin.auth().getUser(uid);
        isSovereign = SOVEREIGN_EMAILS.includes(userRecord.email?.toLowerCase() || '');
        
        if (isSovereign) {
          console.log(`[RENDER-EDIT] 👑 Sovereign erişim: ${userRecord.email} — kredi kontrolü atlandı`);
        } else {
          const walletCheck = await checkCredits(SovereignNodeId, uid, "render");
          if (!walletCheck.allowed) {
            return NextResponse.json(
              { error: "Yeterli render krediniz bulunmuyor." },
              { status: 402 }
            );
          }
        }
      } catch (authErr) {
        console.error("[RENDER-EDIT] Auth error:", authErr);
      }
    }

    // ── Base64 Temizle ──
    const base64Data = originalImageBase64.includes(",")
      ? originalImageBase64.split(",")[1]
      : originalImageBase64;

    // ── Gemini Image Edit ──
    const ai = alohaAI.getClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
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
- Fotogerçekçi ve profesyonel stüdyo kalitesini koru
- Mekanın genel yapısını ve perspektifini BOZMADAN sadece istenen değişiklikleri uygula
- Kumaş dokularını gerçekçi tut
- Sonuç dergi kapağı kalitesinde olmalı`,
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
        { error: "API görsel oluşturamadı.", aiResponse: responseText },
        { status: 500 }
      );
    }

    // ── Kredi Düşürme ──
    if (uid) {
      await deductCredit(SovereignNodeId, uid, "render");
    }

    // ── Log ──
    await logSovereignAction({
      node: SovereignNodeId,
      action: "render-edit",
      payload: { editPrompt, renderQuality },
      result: { success: true } as any,
      duration: 0,
      cost: 0,
    });

    return NextResponse.json({
      renderUrl,
      aiResponse: responseText,
    });

  } catch (error: any) {
    console.error("[RENDER-EDIT] API Error:", error);
    return NextResponse.json(
      { error: error.message || "Düzenleme hatası" },
      { status: 500 }
    );
  }
}
