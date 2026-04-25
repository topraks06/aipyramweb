import { NextRequest, NextResponse } from "next/server";
import { alohaAI } from "@/core/aloha/aiClient";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * ═══════════════════════════════════════════════════════════════
 *  PERDE.AI — SOVEREIGN RENDER ENGINE v4.0
 *  
 *  İKİ SİSTEMİN BİRLEŞİMİ (Eski perde.ai + Yeni AIPyram)
 *  
 *  Eski Sistemden Alınan:
 *    - Dual-Label Tekniği (her görselin arasına etiket)
 *    - Dekorasyon Modu (auto-decor / preserve)
 *    - Model Seçim Stratejisi (hızlı taslak vs tam render)
 *    - Kanıtlanmış Türkçe domain-expert prompt
 *  
 *  Yeni Sistemden Korunan:
 *    - Next.js API route mimarisi
 *    - Frontend sıkıştırma pipeline'ı
 *    - Sovereign Node yapısı
 *  
 *  Kaynak: .agents/skills/PERDE_DESIGN_ENGINE_V4_MERGE_PLAN.md
 * ═══════════════════════════════════════════════════════════════
 */

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const {
      spaceImage,        // { data: string, mimeType: string } | null
      spacePrompt,       // Mekan tasviri (mekan görseli yoksa)
      products,          // Record<string, { data: string, mimeType: string }> — etiketli ürünler
      referenceModel,    // { data: string, mimeType: string } | null — beyaz model
      studioSettings,    // { lighting, lens, composition, decorationMode, renderQuality, timeOfDay }
      variationCount = 1,// 1 | 2 | 4 — model seçimini belirler
      aspectRatio: requestedAR, // '16:9' | '9:16' | '1:1'
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
      lens: studioSettings?.lens || "35mm Prime",
      composition: studioSettings?.composition || "Genel salon",
      decorationMode: studioSettings?.decorationMode || "auto-decor",
      renderQuality: studioSettings?.renderQuality || "2K",
      timeOfDay: studioSettings?.timeOfDay || "Gün ışığı",
    };

    // ══════════════════════════════════════════════════════════
    //  DUAL-LABEL PIPELINE (Eski Sistemin Kanıtlanmış Tekniği)
    //  Her görselin arasına metin etiketi konur → Model hangi
    //  görselin mekan, hangisinin kumaş olduğunu KESİN anlar.
    // ══════════════════════════════════════════════════════════

    const parts: any[] = [];
    let imageCount = 0;

    // Yardımcı: base64'ten data: prefix'ini temizle
    const cleanBase64 = (data: string) => data.includes(",") ? data.split(",")[1] : data;

    // ────────────────────────────────────────────────────────
    // 1. MEKAN GÖRSELİ + GÜÇLÜ ETİKET
    // ────────────────────────────────────────────────────────
    if (spaceImage?.data) {
      parts.push({
        inlineData: {
          data: cleanBase64(spaceImage.data),
          mimeType: spaceImage.mimeType || "image/jpeg",
        },
      });
      parts.push({
        text: `[MEKAN REFERANSI — KESİNLİKLE KORUNACAK]: Bu görsel hedef mekandır. 
Bu odanın duvarları, pencereleri, pencere çerçeveleri, zemini, tavanı, radyatörleri, 
prizleri ve TÜM mimari detayları BİREBİR KORUNACAKTIR. 
Kamera açısı, perspektif ve aydınlatma DEĞİŞTİRİLMEYECEKTİR.
Bu fotoğrafı DÜZENLE, yeni oda YARATMA.`,
      });
      imageCount++;
    }

    // ────────────────────────────────────────────────────────
    // 2. ÜRÜN/KUMAŞ GÖRSELLERİ + KULLANICI ETİKETLERİ
    //    Eski sistemin "[DİKKAT KESİN BİLGİ]" formatı
    // ────────────────────────────────────────────────────────
    const hasProducts = products && typeof products === "object" && Object.keys(products).length > 0;
    const productEntries = hasProducts ? Object.entries(products) as [string, any][] : [];
    
    for (const [role, mat] of productEntries) {
      if (!mat?.data || imageCount >= 13) continue; // 14 görsel limitine dikkat
      
      parts.push({
        inlineData: {
          data: cleanBase64(mat.data),
          mimeType: mat.mimeType || "image/jpeg",
        },
      });
      
      // Eski sistemin etiket enjeksiyonu — modele kesin rol atıyor
      parts.push({
        text: `[DİKKAT KESİN BİLGİ - KULLANICI ETİKETİ]: Kullanıcı bu dosya için sisteme 
özel bir etiket düştü: "${role}". 
EĞER kullanıcı "Fon", "Fon Kumaşı" veya "Fon Perde" demişse → Bu kumaşı FON PERDE olarak kullan.
EĞER "Tül", "Tül Kumaşı" veya "Tül Perde" demişse → Bu kumaşı TÜL PERDE olarak kullan (ana perdenin ARKASINA, pencere camına yakın).
EĞER "Stor" veya "Stor Perde" demişse → Bu kumaşı STOR PERDE olarak kullan.
EĞER "Döşemelik" demişse → Bu kumaşı koltuk/kanepe DÖŞEME olarak kullan.
Bu kumaşın GERÇEK dokusunu, rengini, desenini ve yapısını BİREBİR kullan. 
Kendi hayal ettiğin desen YASAKTIR — yüklenen kumaş fotoğrafı NE İSE O kullanılacak.`,
      });
      imageCount++;
    }

    // ────────────────────────────────────────────────────────
    // 3. REFERANS FORM (beyaz model görseli, opsiyonel)
    // ────────────────────────────────────────────────────────
    if (referenceModel?.data && imageCount < 14) {
      parts.push({
        inlineData: {
          data: cleanBase64(referenceModel.data),
          mimeType: referenceModel.mimeType || "image/jpeg",
        },
      });
      parts.push({
        text: `[FORM REFERANSI / BEYAZ MODEL]: Bu görsel perdenin fiziksel formunu, 
kesimini ve siluetini gösteriyor. Ürünün şeklini buna benzet.`,
      });
      imageCount++;
    }

    // ────────────────────────────────────────────────────────
    // 4. DEKORASYON MODU (Eski Sistemden — auto-decor / preserve)
    // ────────────────────────────────────────────────────────
    const decorInstruction = settings.decorationMode === "auto-decor"
      ? `DEKORASYON MODU: Mekan boş veya eksikse, iç mimari vizyonunu kullanarak 
mekanı uygun mobilya, halı ve dekoratif objelerle döşe, ardından 
istenen tekstil ürünlerini yerleştir.`
      : `DEKORASYON MODU: Mekanın mevcut dekorasyonunu ve mobilyalarını 
kesinlikle koru, sadece istenen tekstil ürünlerini/perdeleri mekana entegre et.`;

    // ────────────────────────────────────────────────────────
    // 5. FİNAL PROMPT (Eski Sistemin Kanıtlanmış Türkçe Promtu)
    // ────────────────────────────────────────────────────────
    const productNames = hasProducts ? productEntries.map(([r]) => r).join(", ") : "modern, zarif perde";
    
    const finalPrompt = `Sen profesyonel bir iç mimari ve ürün fotoğrafçısısın.
Zaman/Atmosfer: ${settings.timeOfDay}
Işıklandırma: ${settings.lighting}
Lens/Kamera: ${settings.lens}
Kurgu/Kompozisyon: ${settings.composition}

${decorInstruction}

Görev: Verilen mekan referansındaki ODAYI KORUYARAK, yüklenen kategorize edilmiş ürünleri 
(${productNames}) kusursuz bir şekilde mekana entegre et.

${spaceImage ? `MUTLAK KURAL: Yukarıdaki [MEKAN REFERANSI] fotoğrafını DÜZENLE. 
Yeni oda YARATMA. Aynı duvarlar, aynı zemin, aynı pencereler, aynı kamera açısı.` : ""}

${spacePrompt && !spaceImage ? `Mekan Tasviri: ${spacePrompt}. Bu mekanı sıfırdan oluştur ve perdeleri ekle.` : ""}

KRİTİK KURALLAR:
1. Mekan fotoğrafı verildiyse: ODAYI BİREBİR KORU. Pencere pozisyonları, duvar rengi, zemin, hepsi AYNI kalmalı.
2. Kumaş deseni verildiyse: Yüklenen kumaşın GERÇEK dokusunu, rengini, desenini BİREBİR kullan. Kendi hayal ettiğin desen YASAK.
3. Perdeler doğal yerçekimi fiziğiyle asılmalı — pile kıvrımları, düşüş açısı gerçekçi olmalı.
4. Tül perde verildiyse ARKAYA (pencere camına yakın), fon perde ÖNE yerleştirilmeli.
5. Perde rayı/korniş pencere üstüne eklenmeli.
6. Sonuç dergi kapağı kalitesinde, fotogerçekçi ve kusursuz olmalıdır.
7. Sadece render görselini üret, metin yanıt VERME.`;

    parts.push({ text: finalPrompt });

    // ────────────────────────────────────────────────────────
    // 6. MODEL SEÇİM STRATEJİSİ (Eski Sistemden)
    //    Hızlı taslak (2/4): gemini-2.5-flash-image → 5-8 sn
    //    Tam render (1):     gemini-3.1-flash-image-preview → 15-25 sn
    // ────────────────────────────────────────────────────────
    const vCount = variationCount || 1;
    const isHighRes = vCount === 1;
    const modelName = isHighRes ? "gemini-3.1-flash-image-preview" : "gemini-2.5-flash-image";

    // Aspect Ratio
    let aspectRatio = requestedAR || "16:9";
    if (spacePrompt?.includes("[AR:9:16]")) aspectRatio = "9:16";
    else if (spacePrompt?.includes("[AR:1:1]")) aspectRatio = "1:1";

    // ── RENDER ──
    const ai = alohaAI.getClient();
    let renderUrl: string | null = null;

    console.log(`[RENDER-PRO v4] Model: ${modelName}, Images: ${imageCount}, AR: ${aspectRatio}, Quality: ${isHighRes ? '4K' : 'Taslak'}`);

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          responseModalities: ["IMAGE", "TEXT"],
          imageConfig: {
            aspectRatio: aspectRatio as any,
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
        const textResponse = candidate.content?.parts?.find((p: any) => p.text)?.text || "";
        console.error("[RENDER-PRO v4] Model görsel üretmedi. Metin yanıt:", textResponse.substring(0, 300));
        throw new Error("Model görsel çıktısı üretmedi. Lütfen farklı bir mekan veya ürün görseli deneyin.");
      }
    } catch (e: any) {
      console.error("[RENDER-PRO v4] Gemini Error:", e);
      
      const msg = e.message || "Bilinmeyen hata";
      if (msg.includes("SAFETY")) {
        return NextResponse.json({ error: "Güvenlik filtresi aktif. Farklı görsel deneyin." }, { status: 422 });
      }
      if (msg.includes("too large") || msg.includes("exceeds")) {
        return NextResponse.json({ error: "Görseller çok büyük. Lütfen daha küçük dosyalar kullanın." }, { status: 413 });
      }
      return NextResponse.json({ error: `Render hatası: ${msg.substring(0, 300)}` }, { status: 500 });
    }

    const duration = Date.now() - startTime;
    console.log(`[RENDER-PRO v4] ✅ Başarılı! Model: ${modelName}, ${imageCount} görsel, ${duration}ms`);

    return NextResponse.json({
      renderUrl,
      analysis: {
        roomType: "auto",
        imageCount,
        duration,
        model: modelName,
        quality: isHighRes ? "4K" : "Taslak",
        decorationMode: settings.decorationMode,
      },
      suggestions: [],
    });

  } catch (error: any) {
    console.error("[RENDER-PRO v4] API Error:", error);
    return NextResponse.json(
      { error: error.message || "Sunucu hatası" },
      { status: 500 }
    );
  }
}
