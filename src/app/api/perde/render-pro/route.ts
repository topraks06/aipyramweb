import { NextRequest, NextResponse } from "next/server";
import { alohaAI } from "@/core/aloha/aiClient";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * ═══════════════════════════════════════════════════════════════
 *  PERDE.AI — SOVEREIGN RENDER ENGINE v3.0
 *  
 *  TEK AŞAMALI ÇOKLU-GÖRSEL MİMARİ (Gemini 3.1 Flash Image Preview)
 *  
 *  Bu model TEK İSTEKTE 14 ADEDE KADAR GÖRSEL kabul eder.
 *  Eski 2-aşamalı pipeline (analiz→render) kaldırıldı.
 *  
 *  Desteklenen modlar:
 *    1. RESIM→RESIM: Mekan fotoğrafı + kumaş görselleri → render
 *    2. RESIM→TEX:   Mekan fotoğrafı + metin tasviri → render
 *    3. TEX→TEX:     Metin tasviri + kumaş isimleri → render (sıfırdan)
 *    4. TEX→RESIM:   Metin tasviri → render (sıfırdan)
 *  
 *  Inline Data Limiti: Toplam istek boyutu ≤ 20MB
 *  Görsel Limiti: ≤ 14 görsel / istek
 * ═══════════════════════════════════════════════════════════════
 */

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const {
      spaceImage,        // { data: string, mimeType: string } | null
      spacePrompt,       // Mekan tasviri (mekan görseli yoksa)
      products,          // Record<string, { data: string, mimeType: string }> — ürünler
      referenceModel,    // { data: string, mimeType: string } | null — beyaz model
      studioSettings,    // { lighting, lens, composition, decorationMode, timeOfDay }
      SovereignNodeId = 'perde'
    } = body;

    if (!spaceImage && !spacePrompt && (!products || Object.keys(products).length === 0)) {
      return NextResponse.json(
        { error: "En az bir mekan görseli/tasviri veya ürün görseli gereklidir." },
        { status: 400 }
      );
    }

    // ── Stüdyo Ayarları (Defaults) ──
    const settings = {
      lighting: studioSettings?.lighting || "Doğal Gün Işığı",
      lens: studioSettings?.lens || "Geniş Açı 16mm",
      composition: studioSettings?.composition || "Simetrik",
      decorationMode: studioSettings?.decorationMode || "auto-decor",
      timeOfDay: studioSettings?.timeOfDay || "Öğlen",
    };

    // ══════════════════════════════════════════════════════════
    //  TEK AŞAMALI ÇOKLU-GÖRSEL PIPELINE
    //  Gemini 3.1 Flash Image Preview — 14 görsele kadar destekler
    // ══════════════════════════════════════════════════════════

    const parts: any[] = [];
    let imageCount = 0;

    // Yardımcı: base64'ten data: prefix'ini temizle
    const cleanBase64 = (data: string) => data.includes(",") ? data.split(",")[1] : data;

    // 1. MEKAN GÖRSELİ (varsa)
    if (spaceImage?.data) {
      parts.push({
        inlineData: {
          data: cleanBase64(spaceImage.data),
          mimeType: spaceImage.mimeType || "image/jpeg",
        },
      });
      parts.push({
        text: "[MEKAN]: Bu görsel hedef mekandır. Bu mekanın pencerelerini, duvarlarını, zeminini ve genel atmosferini koru. Perdeler ve tekstil ürünleri bu mekana entegre edilecek.",
      });
      imageCount++;
    }

    // 2. ÜRÜN/KUMAŞ GÖRSELLERİ (her biri etiketli)
    if (products && typeof products === "object") {
      const productEntries = Object.entries(products) as [string, any][];
      for (const [role, mat] of productEntries) {
        if (!mat?.data || imageCount >= 13) continue; // 14 görsel limitine dikkat
        parts.push({
          inlineData: {
            data: cleanBase64(mat.data),
            mimeType: mat.mimeType || "image/jpeg",
          },
        });
        parts.push({
          text: `[ÜRÜN: ${role}]: Bu kumaşın/ürünün dokusunu, rengini, desenini ve yapısını analiz et. Bu malzeme mekandaki "${role}" olarak kullanılacak — pencereye veya uygun yüzeye bu kumaşı giydir.`,
        });
        imageCount++;
      }
    }

    // 3. REFERANS FORM (beyaz model görseli, varsa)
    if (referenceModel?.data && imageCount < 14) {
      parts.push({
        inlineData: {
          data: cleanBase64(referenceModel.data),
          mimeType: referenceModel.mimeType || "image/jpeg",
        },
      });
      parts.push({
        text: "[FORM REFERANSI]: Bu görsel perdenin/tekstilin fiziksel formunu gösteriyor. Bu kesim ve silueti kullan.",
      });
      imageCount++;
    }

    // 4. ANA RENDER TALİMATI
    const decorInstruction = settings.decorationMode === "auto-decor"
      ? "Mekan boş veya eksikse, uygun mobilya ve dekoratif objelerle döşe."
      : "Mekanın mevcut dekorasyonunu kesinlikle koru.";

    const spaceDescription = spacePrompt 
      ? `Hedef mekan tasviri: "${spacePrompt}".`
      : "Hedef mekan yukarıda gönderilen MEKAN görselindeki odadır.";

    const hasProducts = products && Object.keys(products).length > 0;
    const productNames = hasProducts ? Object.keys(products).join(", ") : "modern, zarif perde";

    const renderInstruction = `
TASK: EDIT the provided room photograph. Do NOT create a new room from scratch.

STRICT RULES — VIOLATION OF ANY RULE IS UNACCEPTABLE:

1. PRESERVE THE ROOM EXACTLY:
   - Keep the EXACT same walls, floor, ceiling, windows, radiators, and architectural details from the [MEKAN] photo
   - Keep the EXACT same camera angle and perspective
   - Keep the EXACT same lighting and shadows
   - Do NOT change the wall color, floor material, or window frames
   - Do NOT add or remove furniture unless [MEKAN] is completely empty

2. ADD CURTAINS TO THE WINDOWS:
   - Install curtains ONLY on the windows visible in the [MEKAN] photo
   - Use the EXACT fabric texture, color, and pattern from the [ÜRÜN] photos provided above
   - The curtain fabric must be a PIXEL-PERFECT match to the provided fabric photos
   - Curtains should hang naturally with proper draping physics (gravity, folds, pleats)
   - Add a curtain rod/rail above each window

3. IF TULLE FABRIC IS PROVIDED:
   - Layer it BEHIND the main curtain, closer to the window glass
   - Tulle should be semi-transparent, allowing light to pass through

4. COMPOSITION:
   - Camera: ${settings.lens}
   - Lighting: ${settings.lighting}, Time: ${settings.timeOfDay}
   
5. OUTPUT: Generate ONLY the edited photo. No text response.

${hasProducts 
  ? `FABRICS TO USE: ${productNames}. Match EXACTLY the textures from the uploaded fabric photos.` 
  : "Add elegant, modern curtains that complement the room's color palette."}
${spacePrompt ? `Additional instruction: ${spacePrompt}` : ""}
`.trim();

    parts.push({ text: renderInstruction });

    // Aspect Ratio
    let aspectRatio = "16:9";
    if (spacePrompt?.includes("[AR:9:16]")) aspectRatio = "9:16";
    else if (spacePrompt?.includes("[AR:1:1]")) aspectRatio = "1:1";

    // ── RENDER: Gemini 3.1 Flash Image Preview ──
    const ai = alohaAI.getClient();
    let renderUrl: string | null = null;

    console.log(`[RENDER-PRO] Sending ${imageCount} images + prompt to gemini-3.1-flash-image-preview`);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image-preview",
        contents: { parts },
        config: {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: {
            aspectRatio: aspectRatio
          }
        }
      });

      const candidate = response.candidates?.[0];
      if (!candidate) throw new Error("Model yanıt döndürmedi.");

      if (candidate.finishReason === "SAFETY") {
        return NextResponse.json(
          { error: "Güvenlik filtresi: Görseliniz güvenlik politikalarına takıldı. Farklı bir görsel deneyin." },
          { status: 422 }
        );
      }

      // Yanıttan görsel çıktısını bul
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) {
          renderUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!renderUrl) {
        // Model sadece metin döndürmüş olabilir
        const textResponse = candidate.content?.parts?.find((p: any) => p.text)?.text || "";
        console.error("[RENDER-PRO] Model görsel üretmedi. Metin yanıt:", textResponse.substring(0, 200));
        throw new Error("Model görsel çıktısı üretmedi. Lütfen farklı bir mekan veya ürün görseli deneyin.");
      }
    } catch (e: any) {
      console.error("[RENDER-PRO] Gemini 3.1 Flash Image Error:", e);
      
      // Hatayı kullanıcıya anlaşılır şekilde ilet
      const msg = e.message || "Bilinmeyen hata";
      if (msg.includes("SAFETY")) {
        return NextResponse.json({ error: "Güvenlik filtresi aktif. Farklı görsel deneyin." }, { status: 422 });
      }
      if (msg.includes("too large") || msg.includes("exceeds")) {
        return NextResponse.json({ error: "Görseller çok büyük. Lütfen daha küçük dosyalar kullanın." }, { status: 413 });
      }
      return NextResponse.json({ error: `Render hatası: ${msg.substring(0, 200)}` }, { status: 500 });
    }

    const duration = Date.now() - startTime;
    console.log(`[RENDER-PRO] ✅ Başarılı! ${imageCount} görsel, ${duration}ms, renderUrl: ${renderUrl.length} bytes`);

    return NextResponse.json({
      renderUrl,
      analysis: {
        roomType: "auto",
        imageCount,
        duration,
        model: "gemini-3.1-flash-image-preview",
      },
      suggestions: [],
    });

  } catch (error: any) {
    console.error("[RENDER-PRO] API Error:", error);
    return NextResponse.json(
      { error: error.message || "Sunucu hatası" },
      { status: 500 }
    );
  }
}
