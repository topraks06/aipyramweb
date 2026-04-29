import { NextRequest, NextResponse } from "next/server";
import { alohaAI } from "@/core/aloha/aiClient";
import { admin, adminDb } from "@/lib/firebase-admin";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const FREE_RENDER_QUOTA = 5;

/**
 * ═══════════════════════════════════════════════════════════════
 *  İCMİMAR.AI — SOVEREIGN RENDER ENGINE v5.0 (Image-to-Image)
 *  
 *  EN YENİ MODEL: gemini-3.1-pro-image-preview (Nano Banana 2 Pro)
 *  - Extended aspect ratio desteği (4:1, 1:4 dahil)
 *  - Google Search grounding
 *  - 14 referans görsel desteği
 *  - Yüksek çözünürlüklü Image-to-Image düzenleme
 *  
 *  KURAL: Sıfırdan görsel ÜRETİLMEZ. Mevcut mekan fotoğrafı
 *         DÜZENLENEREK kumaş/ürünler entegre edilir.
 * ═══════════════════════════════════════════════════════════════
 */

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const {
      spaceImage,        // { data: string, mimeType: string } | null
      spacePrompt,       // Mekan tasviri (mekan görseli yoksa — katalog çekimi modu)
      products,          // Record<string, { data: string, mimeType: string }> — etiketli ürünler
      referenceModel,    // { data: string, mimeType: string } | null — beyaz model
      studioSettings,    // { lighting, lens, composition, decorationMode, renderQuality, timeOfDay }
      variationCount = 1,
      aspectRatio: requestedAR,
      userPrompt,        // Chatbot'tan gelen özel tasarım komutu
      isUpscale = false,
      SovereignNodeId = 'icmimar'
    } = body;

    if (!spaceImage && !spacePrompt && (!products || Object.keys(products).length === 0)) {
      return NextResponse.json(
        { error: "En az bir mekan görseli/tasviri veya ürün görseli gereklidir." },
        { status: 400 }
      );
    }

    // ══════════════════════════════════════════════════════════
    //  AUTH — Dev bypass + Firebase session + 👑 SOVEREIGN BYPASS
    // ══════════════════════════════════════════════════════════
    const SOVEREIGN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'hakantoprak71@gmail.com').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    let uid: string | null = null;
    let isSovereign = false;
    const isDev = process.env.NODE_ENV === 'development';

    const sessionCookie = req.cookies.get("session");

    if (isDev) {
      uid = 'dev-bypass-user';
      isSovereign = true;
      console.log("[ICMIMAR-RENDER] Dev bypass aktif, auth atlanıyor.");
    } else if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: "Render kullanmak için giriş yapmanız gerekiyor." },
        { status: 401 }
      );
    } else {
      try {
        const decoded = await admin.auth().verifySessionCookie(sessionCookie.value, true);
        uid = decoded.uid;
        
        // 👑 SOVEREIGN BYPASS — Kurucu email kontrolü
        const userRecord = await admin.auth().getUser(uid);
        isSovereign = SOVEREIGN_EMAILS.includes(userRecord.email?.toLowerCase() || '');
        if (isSovereign) {
          console.log(`[ICMIMAR-RENDER] 👑 Sovereign erişim: ${userRecord.email} — tüm engeller atlandı`);
        }
      } catch (authErr) {
        console.error("[ICMIMAR-RENDER] Auth error:", authErr);
        return NextResponse.json(
          { error: "Oturum süresi dolmuş. Lütfen tekrar giriş yapın." },
          { status: 401 }
        );
      }
    }

    // Kredi kontrolü (sadece normal kullanıcılar, sadece prodüksiyon)
    if (!isDev && !isSovereign && uid && adminDb) {
      const quotaRef = adminDb.collection('icmimar_render_quota').doc(uid);
      const quotaDoc = await quotaRef.get();
      const usedRenders = quotaDoc.exists ? (quotaDoc.data()?.usedRenders || 0) : 0;
      if (usedRenders >= FREE_RENDER_QUOTA) {
        return NextResponse.json(
          { error: `Ücretsiz ${FREE_RENDER_QUOTA} tasarım hakkınız doldu. Devam etmek için kredi satın alın.` },
          { status: 402 }
        );
      }
    }

    // ── Yardımcı: base64 temizle ──
    const cleanBase64 = (data: string) => data.includes(",") ? data.split(",")[1] : data;

    // ══════════════════════════════════════════════════════════
    //  PRE-FLIGHT: OTONOM PENCERE & IŞIK TESPİTİ
    // ══════════════════════════════════════════════════════════
    let preFlightData = null;
    if (spaceImage && studioSettings?.semanticMasking) {
       try {
         const visionAi = alohaAI.getClient();
         const preFlightResponse = await visionAi.models.generateContent({
           model: 'gemini-3.1-flash',
           contents: [
             {
               role: 'user',
               parts: [
                 { text: `Sen profesyonel bir iç mimari zekasısın. Bu oda fotoğrafındaki PENCERE alanını tespit et ve mekanın genel ışık yönünü bul.
Mutlaka şu formatta geçerli bir JSON döndür:
{
  "window_bbox": [x1, y1, x2, y2],
  "confidence": 0.94,
  "light_direction": "left" | "right" | "front" | "top" | "unknown"
}
SADECE JSON DÖNÜP BAŞKA HİÇBİR ŞEY YAZMA.` },
                 { inlineData: { data: cleanBase64(spaceImage.data), mimeType: spaceImage.mimeType || "image/jpeg" } }
               ]
             }
           ],
           config: {
             responseMimeType: "application/json",
             temperature: 0.1
           }
         });
         
         const text = preFlightResponse.candidates?.[0]?.content?.parts?.[0]?.text;
         if (text) {
           preFlightData = JSON.parse(text);
           console.log("[PRE-FLIGHT VISION] Otonom Tespit:", preFlightData);
         }
       } catch (e) {
         console.warn("[PRE-FLIGHT VISION] Otonom tespit başarısız, normal akışla devam:", e);
       }
    }

    // ── Stüdyo Ayarları ──
    const settings = {
      lighting: studioSettings?.lighting || "Doğal Gün Işığı",
      lens: studioSettings?.lens || "35mm Prime",
      composition: studioSettings?.composition || "Genel salon",
      decorationMode: studioSettings?.decorationMode || "auto-decor",
      renderQuality: studioSettings?.renderQuality || "4K",
      timeOfDay: studioSettings?.timeOfDay || "Gün ışığı",
    };

    // ══════════════════════════════════════════════════════════
    //  DUAL-LABEL PIPELINE v5.0 (Image-to-Image, Anti-Halüsinasyon)
    // ══════════════════════════════════════════════════════════

    const parts: any[] = [];
    let imageCount = 0;

    const hasProducts = products && typeof products === "object" && Object.keys(products).length > 0;
    const productEntries = hasProducts ? Object.entries(products) as [string, any][] : [];
    const productNames = hasProducts ? productEntries.map(([r]) => r).join(", ") : "modern, zarif perde";

    // ADIM 0: ÖN TALİMAT
    parts.push({
      text: `SEN BİR FOTOĞRAF DÜZENLEME MOTORUSUN. SIFIRDAN GÖRSEL ÜRETMİYORSUN.
Sana vereceğim görselleri DÜZENLE ve BİRLEŞTİR.

KRİTİK GÖREV: Aşağıda sana ${spaceImage ? 'bir mekan fotoğrafı ve' : ''} kumaş/ürün fotoğraf(lar)ı vereceğim.
${hasProducts ? `Kumaş fotoğraflarındaki (${productNames}) GERÇEK dokuyu, GERÇEK rengi, GERÇEK deseni PİKSEL PİKSEL kopyalayarak mekan fotoğrafına perde olarak monte edeceksin.` : ''}

YASAK: Kendi kafandan yeni desen, yeni renk, yeni kumaş UYDURMA.
YASAK: Kumaş fotoğrafından "ilham alıp" benzerini çizme — GERÇEK FOTOĞRAFIN DOKUSUNU KULLAN.
ZORUNLU: Kumaş fotoğrafındaki her ip, her desen, her renk geçişi BİREBİR KORUNMALI.`
    });

    // ADIM 1: MEKAN GÖRSELİ
    if (spaceImage?.data) {
      parts.push({
        inlineData: {
          data: cleanBase64(spaceImage.data),
          mimeType: spaceImage.mimeType || "image/jpeg",
        },
      });
      parts.push({
        text: `[MEKAN REFERANSI — DOKUNULMAZ]: Bu fotoğraf hedef mekandır.
Duvarlar, pencereler, pencere çerçeveleri, zemin, tavan, radyatörler, prizler ve TÜM mimari detaylar BİREBİR KORUNACAK.
Kamera açısı, perspektif, aydınlatma DEĞİŞTİRİLMEYECEK.
Bu fotoğrafı DÜZENLE — yeni oda YARATMA, mevcut odayı KORU.`,
      });
      imageCount++;
    }

    // ADIM 2: ÜRÜN/KUMAŞ GÖRSELLERİ + 3 KATMANLI BAĞLAMA
    for (const [role, mat] of productEntries) {
      if (!mat?.data || imageCount >= 13) continue;
      
      parts.push({
        text: `[ÜRÜN FOTOĞRAFI BAŞLANGIÇ — "${role}"]: 
Aşağıdaki görsel bir GERÇEK kumaş fotoğrafıdır. Bu kumaşın dokusunu, rengini ve desenini AYNEN KOPYALA.
Bu kumaş fotoğrafından yeni bir şey UYDURMA — gördüğün kumaşın kendisini perde olarak kullan.`
      });

      parts.push({
        inlineData: {
          data: cleanBase64(mat.data),
          mimeType: mat.mimeType || "image/jpeg",
        },
      });
      imageCount++;
      
      let physicsContext = "";
      if (mat.physics && mat.physics !== 'auto') {
        physicsContext = `\n[aipyram BEYİN] FİZİKSEL ÖZELLİK: Bu kumaşın tipi "${mat.physics}" olarak doğrulanmıştır. `;
        if (mat.physics === 'sheer') physicsContext += "Yarı saydam, ince, uçuşan (tül) yapıda renderla. Arka planı hafifçe göstersin.";
        if (mat.physics === 'heavy') physicsContext += "Kalın, ağır, ışık geçirmeyen (fon) yapıda renderla. Pileleri tok dökülsün.";
        if (mat.physics === 'blackout') physicsContext += "Aşırı kalın, %100 ışık kesen blackout yapıda renderla. Arkasından hiçbir ışık sızmasın.";
      }

      parts.push({
        text: `[ÜRÜN FOTOĞRAFI BİTİŞ — "${role}"]:
Yukarıdaki kumaş fotoğrafının rolü: "${role}".${physicsContext}
${role.toLowerCase().includes('fon') ? '→ Bu kumaşı FON PERDE olarak kullan. Pencere önüne, tavan kornişinden yere kadar as.' : ''}
${role.toLowerCase().includes('tül') ? '→ Bu kumaşı TÜL PERDE olarak kullan. Pencere CAMI tarafına, fon perdenin ARKASINA as. Yarı şeffaf olmalı.' : ''}
${role.toLowerCase().includes('stor') ? '→ Bu kumaşı STOR PERDE olarak kullan. Pencere kasasına monte et.' : ''}
${role.toLowerCase().includes('döşemelik') || role.toLowerCase().includes('dosemelik') ? '→ Bu kumaşı DÖŞEME olarak kullan. Koltuk/kanepelere döşe.' : ''}
${!role.toLowerCase().includes('fon') && !role.toLowerCase().includes('tül') && !role.toLowerCase().includes('stor') && !role.toLowerCase().includes('döşemelik') ? '→ Bu kumaşı uygun şekilde mekana entegre et (perde veya tekstil olarak).' : ''}

TEKRAR: Bu kumaşın DESENİ, RENGİ ve DOKUSU BİREBİR kullanılacak. Kendi tasarımını KOYMA.`
      });
    }

    // ADIM 3: REFERANS FORM (beyaz model görseli)
    if (referenceModel?.data && imageCount < 14) {
      parts.push({
        inlineData: {
          data: cleanBase64(referenceModel.data),
          mimeType: referenceModel.mimeType || "image/jpeg",
        },
      });
      parts.push({
        text: `[FORM REFERANSI / BEYAZ MODEL - KESİN KURAL]: Bu görsel bir ŞABLONDUR (GEOMETRİ). 
Kendi kafandan şekil veya pile uydurma. Bu referans görseldeki perdenin şeklini, pilelerini, dökümünü ve modelini %100 BİREBİR KOPYALA.
Sadece referansın dokusunu silip, kullanıcının verdiği kumaş dokularını bu kalıbın üstüne giydireceksin.`,
      });
      imageCount++;
    }

    // ADIM 4: DEKORASYON MODU
    const decorInstruction = settings.decorationMode === "auto-decor"
      ? `DEKORASYON MODU: Mekan boş veya eksikse, iç mimari vizyonunu kullanarak 
mekanı uygun mobilya, halı ve dekoratif objelerle döşe, ardından 
istenen tekstil ürünlerini yerleştir.`
      : `DEKORASYON MODU: Mekanın mevcut dekorasyonunu ve mobilyalarını 
kesinlikle koru, sadece istenen tekstil ürünlerini/perdeleri mekana entegre et.`;

    // ADIM 5: FİNAL PROMPT
    let dynamicLighting = settings.lighting;
    if (preFlightData?.light_direction) {
      dynamicLighting = `${settings.lighting} + Orijinal Oda Işığı (YÖN: ${preFlightData.light_direction.toUpperCase()})`;
    }

    const finalPrompt = `GÖREV: Yukarıdaki mekan fotoğrafını DÜZENLE ve kumaş fotoğraflarındaki GERÇEK kumaşları mekana monte et.

Zaman/Atmosfer: ${settings.timeOfDay}
Işıklandırma: ${dynamicLighting}
Lens/Kamera: ${settings.lens}
Kurgu/Kompozisyon: ${settings.composition}

${decorInstruction}

${spaceImage ? `MUTLAK KURAL: Yukarıdaki [MEKAN REFERANSI] fotoğrafını DÜZENLE. 
Yeni oda YARATMA. Aynı duvarlar, aynı zemin, aynı pencereler, aynı kamera açısı.
YASAK: Fotoğrafı YATAY VEYA DİKEY OLARAK ASLA TERS ÇEVİRME (DO NOT MIRROR/FLIP).
Mekanın orijinal en-boy oranını koru.` : ""}

${spacePrompt && !spaceImage ? `Mekan Tasviri: ${spacePrompt}. Bu mekanı sıfırdan oluştur ve ürünleri yerleştir.` : ""}

${userPrompt ? `[KULLANICI ÖZEL TALİMATI - ÇOK ÖNEMLİ]: "${userPrompt}"
Bu talimatı kesinlikle dinle!` : ""}

KRİTİK KURALLAR (İHLAL EDİLEMEZ):
1. OTONOM MASKELEME: Fotoğraftaki pencereleri otomatik tespit et. ${preFlightData?.window_bbox ? `Ön-Tespit Koordinatları: [${preFlightData.window_bbox.join(', ')}]. ` : ''}SADECE pencere alanını değiştirip perdeyi oraya as. Geri kalanına DOKUNMA.
2. MEKAN: Her piksel korunmalı — FOTOĞRAFI ASLA TERS ÇEVİRME.
3. KUMAŞ: Yüklenen kumaş fotoğraflarının GERÇEK doku/desen/rengi BİREBİR kullanılmalı.
4. FİZİK: Perdeler doğal yerçekimi fiziğiyle asılmalı.
5. KATMANLAMA: Tül → pencere camına yakın (arka), fon → öne.
6. KORNIŞ: Perde rayı/korniş pencere üstüne eklenmeli.
7. KALİTE: Dergi kapağı kalitesinde, fotogerçekçi ve kusursuz.
8. SADECE görsel üret, metin yanıt VERME.`;

    parts.push({ text: finalPrompt });

    // ══════════════════════════════════════════════════════════
    //  MODEL SEÇİMİ — EN YENİ YÜKSEK ÇÖZÜNÜRLÜKLÜ
    //  gemini-3.1-pro-image-preview: Nano Banana 2 Pro
    //  - Extended AR, Google Search grounding, 14 ref image
    //  - En yeni ve en yüksek kaliteli Image-to-Image modeli
    // ══════════════════════════════════════════════════════════
    const modelName = "gemini-3-pro-image-preview";

    // AR Config
    const imageConfig: any = {};
    if (requestedAR && requestedAR !== 'auto') {
      imageConfig.aspectRatio = requestedAR;
    }

    // ── RENDER ──
    const ai = alohaAI.getClient();
    let renderUrl: string | null = null;

    console.log(`[ICMIMAR-RENDER v5.0] Model: ${modelName}, Images: ${imageCount}, Products: ${productNames}, AR: ${requestedAR || 'auto'}`);

    try {
      const genConfig: any = {
        responseModalities: ["IMAGE", "TEXT"],
      };
      
      if (Object.keys(imageConfig).length > 0) {
        genConfig.imageConfig = imageConfig;
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: genConfig,
      });

      const candidate = response.candidates?.[0];
      if (!candidate) throw new Error("Model yanıt döndürmedi.");

      if (candidate.finishReason === "SAFETY") {
        return NextResponse.json(
          { error: "Güvenlik filtresi: Görseliniz güvenlik politikalarına takıldı. Farklı bir görsel deneyin." },
          { status: 422 }
        );
      }

      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) {
          renderUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!renderUrl) {
        const textResponse = candidate.content?.parts?.find((p: any) => p.text)?.text || "";
        console.error("[ICMIMAR-RENDER v5.0] Model görsel üretmedi. Metin:", textResponse.substring(0, 500));
        throw new Error("Model görsel çıktısı üretmedi. Lütfen farklı bir mekan veya ürün görseli deneyin.");
      }
    } catch (e: any) {
      console.error("[ICMIMAR-RENDER v5.0] Gemini Error:", e);
      
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
    console.log(`[ICMIMAR-RENDER v5.0] ✅ Başarılı! Model: ${modelName}, ${imageCount} görsel, ${duration}ms`);

    // ── Kota Sayacı (👑 Sovereign atlanır) ──
    if (uid && uid !== 'dev-bypass-user' && !isSovereign && adminDb) {
      const quotaRef = adminDb.collection('icmimar_render_quota').doc(uid);
      const quotaDoc = await quotaRef.get();
      if (quotaDoc.exists) {
        await quotaRef.update({ usedRenders: (quotaDoc.data()?.usedRenders || 0) + 1 });
      } else {
        await quotaRef.set({ usedRenders: 1, createdAt: new Date() });
      }
    }

    return NextResponse.json({
      renderUrl,
      preFlightData,
      analysis: {
        roomType: "auto",
        imageCount,
        duration,
        model: modelName,
        quality: "4K",
        decorationMode: settings.decorationMode,
      },
      suggestions: [],
    });

  } catch (error: any) {
    console.error("[ICMIMAR-RENDER v5.0] API Error:", error);
    return NextResponse.json(
      { error: error.message || "Sunucu hatası" },
      { status: 500 }
    );
  }
}
