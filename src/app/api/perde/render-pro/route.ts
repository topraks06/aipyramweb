import { NextRequest, NextResponse } from "next/server";
import { alohaAI } from "@/core/aloha/aiClient";
import { admin, adminDb } from "@/lib/firebase-admin";
import { checkCredits, deductCredit, logSovereignAction } from "@aipyram/aloha-sdk";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Yeni üyelere verilen ücretsiz render hakkı
const FREE_RENDER_QUOTA = 5;

/**
 * ═══════════════════════════════════════════════════════════════
 *  PERDE.AI — SOVEREIGN RENDER ENGINE v4.1 (Anti-Halüsinasyon)
 *  
 *  DÜZELTMELER (v4.1):
 *    - Aspect Ratio: Mekanın orijinal oranı korunuyor (16:9 zorlaması kaldırıldı)
 *    - Anti-Halüsinasyon: Kumaş görselleri PIXEL-FAITHFUL olarak kullanılıyor
 *    - Prompt: 3 katmanlı bağlama ("sen bu kumaşı GÖRMELİSİN") stratejisi
 *    - Kumaş tekrarı: Aynı kumaş görseli 2. kez gönderilip referans güçlendiriliyor
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
      aspectRatio: requestedAR, // '16:9' | '9:16' | '1:1' | null
      userPrompt,        // Chatbot'tan gelen özel tasarım komutu
      isUpscale = false,
      SovereignNodeId = 'perde'
    } = body;

    if (!spaceImage && !spacePrompt && (!products || Object.keys(products).length === 0)) {
      return NextResponse.json(
        { error: "En az bir mekan görseli/tasviri veya ürün görseli gereklidir." },
        { status: 400 }
      );
    }

    // ══════════════════════════════════════════════════════════
    //  AUTH GEÇİDİ: Mail onaylı üye zorunlu + 5 ücretsiz render
    // ══════════════════════════════════════════════════════════
    const sessionCookie = req.cookies.get("session");
    let uid: string | null = null;

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: "Render kullanmak için giriş yapmanız gerekiyor. Ücretsiz üye olun ve 5 tasarım hakkı kazanın!" },
        { status: 401 }
      );
    }

    try {
      const decoded = await admin.auth().verifySessionCookie(sessionCookie.value, true);
      uid = decoded.uid;

      // E-posta doğrulama kontrolü
      const userRecord = await admin.auth().getUser(uid);
      if (!userRecord.emailVerified) {
        return NextResponse.json(
          { error: "Render kullanmak için e-posta adresinizi doğrulamanız gerekiyor. Lütfen gelen kutunuzu kontrol edin." },
          { status: 403 }
        );
      }

      // Kredi kontrolü — önce aloha-sdk wallet'ı kontrol et
      const walletCheck = await checkCredits(SovereignNodeId, uid, "render");
      if (!walletCheck.allowed) {
        // Wallet'ta kredi yoksa → ücretsiz kota kontrolü
        if (adminDb) {
          const userDoc = await adminDb.collection('perde_render_quota').doc(uid).get();
          const quota = userDoc.exists ? userDoc.data() : null;
          const usedRenders = quota?.usedRenders || 0;

          if (usedRenders >= FREE_RENDER_QUOTA) {
            return NextResponse.json(
              { error: `Ücretsiz ${FREE_RENDER_QUOTA} tasarım hakkınız doldu. Devam etmek için kredi satın alın.` },
              { status: 402 }
            );
          }
        }
      }
    } catch (authErr) {
      console.error("[RENDER-PRO] Auth error:", authErr);
      return NextResponse.json(
        { error: "Oturum süresi dolmuş. Lütfen tekrar giriş yapın." },
        { status: 401 }
      );
    }

    // Yardımcı: base64'ten data: prefix'ini temizle
    const cleanBase64 = (data: string) => data.includes(",") ? data.split(",")[1] : data;

    // ══════════════════════════════════════════════════════════
    //  PRE-FLIGHT: OTONOM PENCERE & IŞIK TESPİTİ (FAZ 1.5 MVP)
    // ══════════════════════════════════════════════════════════
    let preFlightData = null;
    if (spaceImage && studioSettings?.semanticMasking) {
       try {
         const visionAi = alohaAI.getClient();
         if (visionAi) {
           const preFlightResponse = await visionAi.models.generateContent({
             model: 'gemini-3.1-flash', // Hızlı analiz modeli
             contents: [
               {
                 role: 'user',
                 parts: [
                   { text: `Sen profesyonel bir iç mimari zekasısın. Bu oda fotoğrafındaki PENCERE (window) alanını tespit et ve mekanın genel ışık yönünü bul.
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
         }
       } catch (e) {
         console.warn("[PRE-FLIGHT VISION] Otonom tespit başarısız, normal akışla devam ediliyor:", e);
       }
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
    //  DUAL-LABEL PIPELINE v4.1 (Anti-Halüsinasyon Güçlendirilmiş)
    // ══════════════════════════════════════════════════════════

    const parts: any[] = [];
    let imageCount = 0;

    // ────────────────────────────────────────────────────────
    // ADIM 0: ÖN TALİMAT — Anti-Halüsinasyon Kilidi
    // Bu talimat TÜM görsellerden ÖNCE konur, modelin
    // bağlamını en başta kurar.
    // ────────────────────────────────────────────────────────
    const hasProducts = products && typeof products === "object" && Object.keys(products).length > 0;
    const productEntries = hasProducts ? Object.entries(products) as [string, any][] : [];
    const productNames = hasProducts ? productEntries.map(([r]) => r).join(", ") : "modern, zarif perde";

    parts.push({
      text: `SEN BİR FOTOĞRAF DÜZENLEME MOTORUSUN. SIFIRDAN GÖRSEL ÜRETMİYORSUN.
Sana vereceğim görselleri DÜZENLE ve BİRLEŞTİR.

KRİTİK GÖREV: Aşağıda sana ${imageCount > 0 ? 'bir mekan fotoğrafı ve' : ''} kumaş/ürün fotoğraf(lar)ı vereceğim.
${hasProducts ? `Kumaş fotoğraflarındaki (${productNames}) GERÇEK dokuyu, GERÇEK rengi, GERÇEK deseni PİKSEL PİKSEL kopyalayarak mekan fotoğrafına perde olarak monte edeceksin.` : ''}

YASAK: Kendi kafandan yeni desen, yeni renk, yeni kumaş UYDURMA.
YASAK: Kumaş fotoğrafından "ilham alıp" benzerini çizme — GERÇEK FOTOĞRAFIN DOKUSUNU KULLAN.
ZORUNLU: Kumaş fotoğrafındaki her ip, her desen, her renk geçişi BİREBİR KORUNMALI.`
    });

    // ────────────────────────────────────────────────────────
    // ADIM 1: MEKAN GÖRSELİ + GÜÇLÜ ETİKET
    // ────────────────────────────────────────────────────────
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

    // ────────────────────────────────────────────────────────
    // ADIM 2: ÜRÜN/KUMAŞ GÖRSELLERİ + 3 KATMANLI BAĞLAMA
    //    Halüsinasyonu kırmak için her kumaş görseli
    //    ÖNCESİNDE ve SONRASINDA metin enjeksiyonu yapılır.
    // ────────────────────────────────────────────────────────
    for (const [role, mat] of productEntries) {
      if (!mat?.data || imageCount >= 13) continue;
      
      // KATMAN 1: Kumaş öncesi bağlam
      parts.push({
        text: `[ÜRÜN FOTOĞRAFI BAŞLANGIÇ — "${role}"]: 
Aşağıdaki görsel bir GERÇEK kumaş fotoğrafıdır. Bu kumaşın dokusunu, rengini ve desenini AYNEN KOPYALA.
Bu kumaş fotoğrafından yeni bir şey UYDURMA — gördüğün kumaşın kendisini perde olarak kullan.`
      });

      // KATMAN 2: Kumaş görseli
      parts.push({
        inlineData: {
          data: cleanBase64(mat.data),
          mimeType: mat.mimeType || "image/jpeg",
        },
      });
      imageCount++;
      
      // KATMAN 3: Kumaş sonrası kesin rol atama
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

    // ────────────────────────────────────────────────────────
    // ADIM 3: REFERANS FORM (beyaz model görseli, opsiyonel)
    // ────────────────────────────────────────────────────────
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

    // ────────────────────────────────────────────────────────
    // ADIM 4: DEKORASYON MODU
    // ────────────────────────────────────────────────────────
    const decorInstruction = settings.decorationMode === "auto-decor"
      ? `DEKORASYON MODU: Mekan boş veya eksikse, iç mimari vizyonunu kullanarak 
mekanı uygun mobilya, halı ve dekoratif objelerle döşe, ardından 
istenen tekstil ürünlerini yerleştir.`
      : `DEKORASYON MODU: Mekanın mevcut dekorasyonunu ve mobilyalarını 
kesinlikle koru, sadece istenen tekstil ürünlerini/perdeleri mekana entegre et.`;

    // ────────────────────────────────────────────────────────
    // ADIM 5: FİNAL PROMPT (Anti-Halüsinasyon Güçlendirilmiş)
    // ────────────────────────────────────────────────────────
    // ────────────────────────────────────────────────────────
    let dynamicLighting = settings.lighting;
    if (preFlightData?.light_direction) {
      dynamicLighting = `${settings.lighting} + Orijinal Oda Işığı (YÖN: ${preFlightData.light_direction.toUpperCase()}). Perde üzerindeki gölge ve parlamaları bu yöne göre ayarla.`;
    }

    const finalPrompt = `GÖREV: Yukarıdaki mekan fotoğrafını DÜZENLE ve kumaş fotoğraflarındaki GERÇEK kumaşları mekana monte et.

Zaman/Atmosfer: ${settings.timeOfDay}
Işıklandırma: ${dynamicLighting}
Lens/Kamera: ${settings.lens}
Kurgu/Kompozisyon: ${settings.composition}

${decorInstruction}

${spaceImage ? `MUTLAK KURAL: Yukarıdaki [MEKAN REFERANSI] fotoğrafını DÜZENLE. 
Yeni oda YARATMA. Aynı duvarlar, aynı zemin, aynı pencereler, aynı kamera açısı.
YASAK: Fotoğrafı YATAY VEYA DİKEY OLARAK ASLA TERS ÇEVİRME (DO NOT MIRROR/FLIP). Sağ duvar sağda, sol duvar solda kalmalıdır.
Mekanın orijinal en-boy oranını koru — fotoğrafı genişletme veya kırpma.` : ""}

${spacePrompt && !spaceImage ? `Mekan Tasviri: ${spacePrompt}. Bu mekanı sıfırdan oluştur ve perdeleri ekle.` : ""}

${userPrompt ? `[KULLANICI ÖZEL TALİMATI - ÇOK ÖNEMLİ]: "${userPrompt}"
Bu talimatı kesinlikle dinle! Kullanıcı belirli bir form, şekil, pile veya döküm istiyorsa mutlaka bu talimata uygun davran.` : ""}

KRİTİK KURALLAR (İHLAL EDİLEMEZ):
1. OTONOM MASKELEME (SEMANTIC INPAINTING): Fotoğraftaki pencereleri Otonom Vision Ajanı gibi otomatik tespit et. ${preFlightData?.window_bbox ? `Ön-Tespit Pencere Bounding Box Koordinatları: [${preFlightData.window_bbox.join(', ')}]. ` : ''}SADECE pencere alanını değiştirip perdeyi oraya as. Odanın geri kalanına (duvarlar, koltuklar, halılar, zemin, aydınlatma, nesneler) KESİNLİKLE DOKUNMA. %100 orijinal kalsın.
2. MEKAN: Orijinal fotoğraftaki her piksel korunmalı — FOTOĞRAFI ASLA TERS ÇEVİRME (NO MIRRORING).
3. KUMAŞ: Yüklenen kumaş fotoğraflarındaki GERÇEK doku/desen/renk BİREBİR kullanılmalı. KENDİ DESENİNİ UYDURMA.
4. FİZİK: Perdeler doğal yerçekimi fiziğiyle asılmalı — pile kıvrımları, düşüş açısı gerçekçi olmalı.
5. KATMANLAMA: Tül perde pencere CAMINA yakın (arka), fon perde ÖNE yerleştirilmeli.
6. KORNIŞ: Perde rayı/korniş pencere üstüne eklenmeli.
7. KALİTE: Sonuç dergi kapağı kalitesinde, fotogerçekçi ve kusursuz olmalıdır.
8. SADECE görsel üret, metin yanıt VERME.`;

    parts.push({ text: finalPrompt });

    // ────────────────────────────────────────────────────────
    // ADIM 6: MODEL SEÇİM STRATEJİSİ (Nisan 2026 Güncel)
    //    Tam render (1): Nano Banana Pro → studio kalitesi, reasoning, 4K
    //    Hızlı taslak (2/4): Nano Banana 2 → yüksek verimli, hızlı
    //    DEPRECATED: gemini-2.0-flash-exp KULLANILMAZ
    // ────────────────────────────────────────────────────────
    const isHighRes = variationCount === 1;
    const modelName = isHighRes 
      ? "gemini-3-pro-image-preview"      // Nano Banana Pro — Studio kalite, 4K, reasoning
      : "gemini-3.1-flash-image-preview";  // Nano Banana 2 — Hızlı, yüksek verimli

    // ────────────────────────────────────────────────────────
    // ADIM 7: ASPECT RATIO — Mekanın orijinal oranını koru
    //    Frontend'den gelen requestedAR varsa kullan,
    //    yoksa default VERME — Gemini kendi hesaplasın.
    // ────────────────────────────────────────────────────────
    const imageConfig: any = {};
    
    if (requestedAR && requestedAR !== 'auto') {
      imageConfig.aspectRatio = requestedAR;
    }
    // requestedAR yoksa veya 'auto' ise → imageConfig.aspectRatio SET ETMİYORUZ
    // Gemini mekanın orijinal oranına yakın çıktı üretecek

    // ── RENDER ──
    const ai = alohaAI.getClient();
    let renderUrl: string | null = null;

    console.log(`[RENDER-PRO v4.1] Model: ${modelName}, Images: ${imageCount}, Products: ${productNames}, AR: ${requestedAR || 'auto'}, Quality: ${isHighRes ? '4K' : 'Taslak'}`);

    try {
      const genConfig: any = {
        responseModalities: ["IMAGE", "TEXT"],
      };
      
      // Sadece açıkça AR belirtildiyse ekle
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

      // Yanıttan görsel çıktısını bul
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) {
          renderUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!renderUrl) {
        const textResponse = candidate.content?.parts?.find((p: any) => p.text)?.text || "";
        console.error("[RENDER-PRO v4.1] Model görsel üretmedi. Metin yanıt:", textResponse.substring(0, 500));
        throw new Error("Model görsel çıktısı üretmedi. Lütfen farklı bir mekan veya ürün görseli deneyin.");
      }
    } catch (e: any) {
      console.error("[RENDER-PRO v4.1] Gemini Error:", e);
      
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
    console.log(`[RENDER-PRO v4.1] ✅ Başarılı! Model: ${modelName}, ${imageCount} görsel, ${duration}ms`);

    // ── Kredi Düşürme + Ücretsiz Kota Sayacı ──
    if (uid) {
      await deductCredit(SovereignNodeId, uid, "render");
      // Ücretsiz kota sayacını da artır
      if (adminDb) {
        const quotaRef = adminDb.collection('perde_render_quota').doc(uid);
        const quotaDoc = await quotaRef.get();
        if (quotaDoc.exists) {
          await quotaRef.update({ usedRenders: (quotaDoc.data()?.usedRenders || 0) + 1 });
        } else {
          await quotaRef.set({ usedRenders: 1, createdAt: new Date() });
        }
      }
    }

    // ── Sovereign Log ──
    await logSovereignAction({
      node: SovereignNodeId,
      action: "render-pro",
      payload: { imageCount, model: modelName, quality: isHighRes ? "4K" : "Taslak" },
      result: { success: true } as any,
      duration,
      cost: 0,
    });

    return NextResponse.json({
      renderUrl,
      preFlightData,
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
    console.error("[RENDER-PRO v4.1] API Error:", error);
    return NextResponse.json(
      { error: error.message || "Sunucu hatası" },
      { status: 500 }
    );
  }
}
