# PERDE.AI TASARIM MOTORU v4 — İKİ SİSTEMİN BİRLEŞİM EMRİ
# Tarih: 25 Nisan 2026
# Onay: Hakan Bey tarafından araştırma onaylandı, uygulama bekliyor
# Durum: ⬜ UYGULAMA BEKLİYOR

## 0. GÖREV ÖZETİ

Eski Perde.ai projesindeki (`C:\Users\MSI\Desktop\projeler zip\perde.ai`) kanıtlanmış Gemini
prompt mühendisliği ve render pipeline'ı ile yeni AIPyram projesindeki (`c:\Users\MSI\Desktop\aipyramweb`)
modern UI/UX'i birleştirerek "v4 Dehşet Motoru" oluşturulacak.

**KRİTİK:** Yeni sistemin UI'ını BOZMA. Sadece API katmanını eski sistemin mantığına göre yeniden yaz.

---

## 1. KÖK SORUN ANALİZİ (Neden Render Çalışmıyor?)

### Problem 1: MEKAN KORUNMUYOR
- **Semptom:** Kullanıcı boş oda yüklüyor, AI tamamen yeni bir oda tasarlıyor
- **Kök Neden:** Görseller Gemini'ye gönderilirken etiketleri yok. Model hangi görselin
  "korunacak mekan", hangisinin "uygulanacak kumaş" olduğunu anlayamıyor.
- **Eski Sistemdeki Çözüm:** Her görselin önüne metin etiketi konuyor:
  ```
  [inlineData: mekan.jpg]
  [text: "Bu görselin rolü: MEKAN REFERANSI"]
  [inlineData: kumaş.jpg]
  [text: "[DİKKAT KESİN BİLGİ - KULLANICI ETİKETİ]: Fon Perde"]
  ```

### Problem 2: KUMAŞ DESENİ BİREBİR UYGULANMIYOR
- **Semptom:** AI kendi hayal ettiği deseni koyuyor, yüklenen kumaş dokusu birebir çıkmıyor
- **Kök Neden:** Prompt'ta "PIXEL-PERFECT match" gibi talimatlar var ama model bunu
  text-to-image olarak yorumluyor. Eski sistemdeki kolaj tekniği ile kumaş görselini
  modele "referans" olarak gösterme çok daha etkili.

### Problem 3: DEKORASYON MODU YOK
- **Semptom:** Boş mekana sadece perde ekleniyor, mobilya vs. yok / dolu mekandaki
  mobilyalar bazen siliniyor
- **Kök Neden:** `auto-decor` / `preserve` ayrımı yapılmıyor
- **Eski Sistemdeki Çözüm:**
  ```
  auto-decor → "Mekan boş veya eksikse, iç mimari vizyonunu kullanarak uygun 
                mobilya, halı ve dekoratif objelerle döşe, ardından perdeler ekle"
  preserve   → "Mekanın mevcut dekorasyonunu kesinlikle koru, sadece perdeler ekle"
  ```

### Problem 4: MODEL SEÇİM STRATEJİSİ YOK
- **Semptom:** Her render uzun sürüyor (20-25 saniye), varyasyonlar için gereksiz
- **Kök Neden:** Her zaman `gemini-3.1-flash-image-preview` kullanılıyor
- **Eski Sistemdeki Çözüm:**
  ```
  Hızlı taslak (2'li/4'lü varyasyon) → gemini-2.5-flash-image (5-8 sn)
  Tam 4K render (1'li seçim)          → gemini-3.1-flash-image-preview (15-25 sn)
  ```

---

## 2. ESKİ SİSTEMİN DOSYA HARİTASI (REFERANS)

| Dosya | İçerik | Kritik Fonksiyonlar |
|-------|--------|-------------------|
| `perde.ai/src/services/gemini.ts` | Ana Gemini servisi (625 satır) | `generateProfessionalRender()` (L417-524), `editProfessionalRender()` (L526-572), `combineImages()` (L362-415), `processOmniRequest()` (L57-174) |
| `perde.ai/src/services/geminiService.ts` | Basit edit servisi (79 satır) | `editRoomImage()` (L29-77) — per-part labeled image editing |
| `perde.ai/src/pages/RoomVisualizer.tsx` | Canvas sayfası (491 satır) | Staged image, 1-2-4 grid, before/after slider, undo/redo |
| `perde.ai/src/components/AIAssistant.tsx` | Chat paneli (836 satır) | Attachment etiketleme (L762-782), render tetikleme (L363-377) |

---

## 3. YENİ SİSTEMİN DOSYA HARİTASI (KORUNACAK)

| Dosya | İçerik | Durum |
|-------|--------|-------|
| `aipyramweb/src/components/node-perde/RoomVisualizer.tsx` | Ana canvas (776 satır) | ✅ UI KORUNACAK, sadece `triggerAutonomousRender()` fonksiyonunun payload formatı güncellenecek |
| `aipyramweb/src/components/node-perde/PerdeAIAssistant.tsx` | Chat paneli (1145 satır) | ✅ DOKUNULMAYACAK |
| `aipyramweb/src/app/api/perde/render-pro/route.ts` | API route (235 satır) | 🔴 TAMAMEN YENİDEN YAZILACAK |
| `aipyramweb/src/components/node-perde/Img2ImgVisualizer.tsx` | Katmanlı motor (304 satır) | ℹ️ Gelecekte kullanılacak, şimdilik dokunma |

---

## 4. UYGULAMA PLANI (Adım Adım)

### ADIM 1: `render-pro/route.ts` — Yeniden Yazım
**Dosya:** `c:\Users\MSI\Desktop\aipyramweb\src\app\api\perde\render-pro\route.ts`
**Temel:** Eski `generateProfessionalRender()` fonksiyonunun mantığı

```typescript
// PSEUDOCODE — Gerçek implementasyon bu yapıya sadık kalacak

export async function POST(request: Request) {
  const body = await request.json();
  const { 
    spaceImage,      // { data, mimeType } — Mekan fotoğrafı
    spacePrompt,     // string — Mekan tasviri (fotoğraf yoksa)
    products,        // Record<string, { data, mimeType }> — Etiketli ürünler
    referenceModel,  // { data, mimeType } — Beyaz form referansı (opsiyonel)
    studioSettings,  // { lighting, lens, composition, decorationMode, renderQuality, timeOfDay }
    variationCount,  // 1 | 2 | 4 — Model seçimini belirler
    aspectRatio,     // '16:9' | '9:16' | '1:1'
    SovereignNodeId
  } = body;

  // --- 1. Parts Dizisi Oluştur (Eski Sistemin Dual-Label Tekniği) ---
  const parts: any[] = [];

  // a) Mekan Görseli + Etiketi
  if (spaceImage) {
    parts.push({
      inlineData: { data: cleanBase64(spaceImage.data), mimeType: spaceImage.mimeType }
    });
    parts.push({ 
      text: `[MEKAN REFERANSI]: Bu görsel hedef mekandır. Bu odanın duvarları, pencereleri, 
      zemini, tavanı, radyatörleri ve TÜM mimari detayları BİREBİR KORUNACAKTIR. 
      Kamera açısı ve perspektif DEĞİŞTİRİLMEYECEKTİR.` 
    });
  } else if (spacePrompt) {
    parts.push({ text: `Mekan Tasviri: ${spacePrompt}. Bu mekanı sıfırdan oluştur.` });
  }

  // b) Ürün Görselleri + Etiketleri (Her biri ayrı part)
  for (const [role, material] of Object.entries(products)) {
    parts.push({
      inlineData: { data: cleanBase64(material.data), mimeType: material.mimeType }
    });
    parts.push({ 
      text: `[DİKKAT KESİN BİLGİ - KULLANICI ETİKETİ]: Kullanıcı bu kumaş/ürün için 
      "${role}" etiketi koydu. Bu kumaşın GERÇEK dokusunu, rengini ve desenini 
      BİREBİR kullanarak bu rolde mekana yerleştir. EĞER "Fon" diyorsa fon perde yap, 
      "Tül" diyorsa tül perde yap, "Stor" diyorsa stor perde yap, 
      "Döşemelik" diyorsa koltuk/kanepe kaplama yap.` 
    });
  }

  // c) Referans Model (Opsiyonel)
  if (referenceModel) {
    parts.push({
      inlineData: { data: cleanBase64(referenceModel.data), mimeType: referenceModel.mimeType }
    });
    parts.push({ text: `[FORM REFERANSI]: Bu beyaz model/şablon perdenin şeklini gösterir.` });
  }

  // --- 2. Dekorasyon Modu (Eski Sistemden) ---
  const decorMode = studioSettings?.decorationMode || 'auto-decor';
  const decorInstruction = decorMode === 'auto-decor'
    ? `DEKORASYON MODU: Mekan boş veya eksikse, iç mimari vizyonunu kullanarak 
       mekanı uygun mobilya, halı ve dekoratif objelerle döşe, ardından 
       istenen tekstil ürünlerini yerleştir.`
    : `DEKORASYON MODU: Mekanın mevcut dekorasyonunu ve mobilyalarını 
       kesinlikle koru, sadece istenen tekstil ürünlerini/perdeleri mekana entegre et.`;

  // --- 3. Final Prompt (Eski Sistemin Kanıtlanmış Türkçe Promtu) ---
  const settings = studioSettings || {};
  const finalPrompt = `Sen profesyonel bir iç mimari ve ürün fotoğrafçısısın.
Zaman/Atmosfer: ${settings.timeOfDay || 'Gün ışığı'}
Işıklandırma: ${settings.lighting || 'Doğal pencere ışığı'}
Lens/Kamera: ${settings.lens || '35mm Prime'}
Kurgu/Kompozisyon: ${settings.composition || 'Genel salon'}

${decorInstruction}

Görev: Verilen mekan referansına, yüklenen kategorize edilmiş ürünleri 
(Fon, Tül, Stor, Döşemelik vb.) kusursuz bir şekilde entegre et.
Eğer bir form referansı (beyaz model) verildiyse, ürünün şeklini ona benzet.
Sonuç, dergi kapağı kalitesinde, fotogerçekçi ve kusursuz bir render olmalıdır.

KRİTİK KURALLAR:
1. Mekan fotoğrafı verildiyse: ODAYI DEĞİŞTİRME. Aynı duvarlar, aynı zemin, aynı pencereler.
2. Kumaş deseni verildiyse: DOKUYU BİREBİR KULLAN. Kendi hayal ettiğin desen YASAK.
3. Perdeler doğal yerçekimi fiziğiyle asılmalı (pile kıvrımları, düşüş açısı).
4. Tül perdeler ARKAYA (pencere camına yakın), fon perdeler ÖNE yerleştirilmeli.
5. Sadece render görselini üret, metin yanıt VERME.`;

  parts.push({ text: finalPrompt });

  // --- 4. Model Seçimi (Eski Sistemin Stratejisi) ---
  const vCount = variationCount || 1;
  const isHighRes = vCount === 1; // 1'li = 4K tam render, 2/4 = hızlı taslak
  const modelName = isHighRes ? 'gemini-3.1-flash-image-preview' : 'gemini-2.5-flash-image';

  // --- 5. Config ---
  const config = {
    responseModalities: ["IMAGE", "TEXT"],
    ...(isHighRes && {
      imageConfig: {
        aspectRatio: aspectRatio || "16:9",
      }
    }),
    ...(!isHighRes && {
      imageConfig: {
        aspectRatio: aspectRatio || "1:1",
      }
    })
  };

  // --- 6. API Çağrısı ---
  const response = await ai.models.generateContent({
    model: modelName,
    contents: [{ role: "user", parts }],
    config
  });

  // --- 7. Sonuç İşleme ---
  // response.candidates[0].content.parts içinden inlineData'yı bul
  // base64 olarak döndür
}
```

### ADIM 2: `RoomVisualizer.tsx` — triggerAutonomousRender() Güncelleme
**Dosya:** `c:\Users\MSI\Desktop\aipyramweb\src\components\node-perde\RoomVisualizer.tsx`
**Değişiklik:** Sadece `triggerAutonomousRender()` fonksiyonu (L154-274)

Yapılacaklar:
- [ ] Payload'a `variationCount` ekle
- [ ] Payload'a `studioSettings.decorationMode` ekle (default: 'auto-decor')
- [ ] Payload'a `aspectRatio` ekle (default: '16:9')
- [ ] Varyasyon modunda: TEK API çağrısı yap, 2/4 kez paralel çağır (her seferinde farklı varyasyon üretilir)
- [ ] `canvasAttachments[].label` → `products[label]` dönüşümü zaten doğru (L172-177) ✅

### ADIM 3: Test ve Doğrulama
- [ ] `aboş pencereler (3).jpg` + `desen1.jpg` + `keten tül kırık beyaz.jpeg` ile test
- [ ] Çıktıda: İki pencere, beyaz duvarlar, ahşap zemin, radyatörler KORUNMUŞ OLMALI
- [ ] Çıktıda: Mavi-siyah çiçekli desen BİREBİR perde olarak uygulanmış olmalı
- [ ] Çıktıda: Kırık beyaz keten TÜL, perdenin arkasında görünmeli

---

## 5. TEKNİK NOTLAR

### Gemini Model Karşılaştırması
| Model | Hız | Kalite | Kullanım |
|-------|-----|--------|----------|
| `gemini-2.5-flash-image` | ~5-8 sn | Orta (taslak) | 2'li/4'lü varyasyon |
| `gemini-3.1-flash-image-preview` | ~15-25 sn | Yüksek (4K) | 1'li final render |

### @google/genai SDK Kullanımı
Yeni sistemde API route'unda `@google/generative-ai` kullanılıyor. Eski sistemde `@google/genai` 
kullanılıyor. İkisi de çalışır ama yeni SDK'yı korumak daha iyi (zaten import edilmiş).

### cleanBase64 Yardımcı Fonksiyon
```typescript
function cleanBase64(data: string): string {
  return data.includes(',') ? data.split(',')[1] : data;
}
```

### Sıkıştırma Pipeline'ı
Frontend zaten `compressImage(base64, 1200, 0.8)` ile sıkıştırıyor → API'ye gelen payload
zaten küçük. Server tarafında EK sıkıştırma gerekmez.

---

## 6. ÜRÜN ETİKETLEME AKIŞI (Mevcut UI — DOKUNMA)

```
1. Kullanıcı mekan fotoğrafı yükler → stagedImage state'e geçer
2. "DEVAM ET" butonuna tıklar → uploadPhase = true
3. Ürün görselleri sürükle-bırak veya tıkla-yükle
4. Her ürüne etiket yazar: "Fon Perde", "Tül", "Stor", "Döşemelik" vb.
5. "TASARIMI BAŞLAT" butonuna tıklar
6. triggerAutonomousRender() çağrılır:
   - canvasAttachments[].label → products[label] olarak API'ye gider
   - stagedImage → spaceImage olarak API'ye gider
7. Sonuç: resultImage state'e geçer, before/after slider gösterilir
```

---

## 7. DEVAM NOKTASI (Yarın İçin)

Eğer kredi bitmeden uygulama yapılamazsa, yarın şu adımdan devam edilecek:

1. Bu dosyayı oku: `.agents/skills/PERDE_DESIGN_ENGINE_V4_MERGE_PLAN.md`
2. ADIM 1'den başla: `render-pro/route.ts` dosyasını yeniden yaz
3. ADIM 2: `RoomVisualizer.tsx`'in `triggerAutonomousRender()` payload'ını güncelle
4. ADIM 3: Kartela klasöründeki gerçek fotoğraflarla test et
5. Ekran görüntüsü ile ispat et
6. Git commit at

**ESKİ SİSTEM KAYNAK DOSYALARI:** `C:\Users\MSI\Desktop\projeler zip\perde.ai/src/services/gemini.ts`
**KARTELA TEST GÖRSELLERİ:** `C:\Users\MSI\Desktop\kartela/`
