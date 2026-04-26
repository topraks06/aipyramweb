# PERDE.AI TASARIM STÜDYOSU — EKSİK ÖZELLİK ANALİZİ & UYGULAMA PLANI

**Hazırlayan:** Derin araştırma + mevcut kod analizi  
**Hedef:** Gemini veya başka bir AI ajanın doğrudan kod yazabileceği detaylı plan  
**Tarih:** 26 Nisan 2026

---

## 🎯 KULLANICI PROFİLLERİ (Kim Kullanacak?)

| Meslek | Ne Yapar | Stüdyodan Beklentisi |
|--------|----------|---------------------|
| **Perdeci** | Kumaş seçer, müşteriye perde simülasyonu gösterir | Kumaş → mekana giydirme, pile/drapaj ayarı, before/after |
| **İç Mimar** | Mekanı bütünsel tasarlar (mobilya, renk, ışık, tekstil) | Tüm mekanı yeniden tasarlama, stil değiştirme, mobilya swap |
| **Mobilyacı** | Koltuk, masa, yatak gibi ürünleri mekana yerleştirir | Ürün → mekan simülasyonu, kumaş değişimi, renk seçenekleri |
| **Aydınlatmacı** | Avize, aplik, spot gibi ürünleri mekana yerleştirir | Aydınlatma yerleştirme, ışık sıcaklığı simülasyonu |
| **Aksesuarcı** | Yastık, paspas, vazo, dekoratif obje | Ürün → mekan yerleştirme, stil uyumu kontrolü |

---

## 📊 MEVCUT DURUM (Ne Var?)

### ✅ Çalışan Özellikler
1. Mekan fotoğrafı yükleme + sıkıştırma
2. Kumaş/ürün ekleme (ataş ile)
3. Etiketleme (ürün adı yazma)
4. Otonom render (render-pro API)
5. Before/After slider
6. Cila modu (render-edit API) — az önce bağladık
7. Projeyi kaydetme (Firestore)
8. Arşivden yükleme
9. Zoom & Pan (4K)
10. Undo/Redo (render history)
11. Sesli komut (Web Speech API)
12. Çok dilli chat (TR/EN/DE/ES/FR/RU/ZH/AR)

### ❌ Eksik Olan Kritik Özellikler

---

## 🚀 FAZ 1: Chat Zekası (Akıllı Tasarım Asistanı)

### 1.1 — Stil Değiştirme Komutu
**Eksik:** Kullanıcı "Bu odayı Japandi tarzına çevir" veya "Modern minimalist yap" diyemiyor.

**Uygulama:**
- **Dosya:** `PerdeAIAssistant.tsx` satır ~450
- **Yeni intent:** `isStyleIntent`
- **Anahtar kelimeler:** `['japandi', 'minimalist', 'modern', 'klasik', 'rustik', 'bohem', 'endüstriyel', 'skandinav', 'art deco', 'country', 'loft', 'zen', 'tropikal', 'eklektik', 'retro', 'vintage', 'barok', 'osmanlı', 'oriental']`
- **Davranış:** `request_render_edit` event'ını stil prompt'u ile gönder
- **Örnek prompt:** `"Bu mekanı Japandi stili ile yeniden tasarla. Doğal ahşap, bej-beyaz tonlar, minimalist mobilya, difüz doğal ışık kullan."`

```typescript
const STYLE_MAP: Record<string, string> = {
  'japandi': 'Japandi style: natural wood, beige-white tones, minimal furniture, diffused natural light',
  'minimalist': 'Minimalist: clean lines, monochrome palette, less is more, hidden storage',
  'modern': 'Modern contemporary: sleek surfaces, neutral palette with bold accents, statement lighting',
  'klasik': 'Classic Turkish: ornate details, rich fabrics, warm wood, chandelier, carpet',
  'rustik': 'Rustic: exposed wood beams, stone walls, vintage furniture, warm lighting',
  'bohem': 'Bohemian: layered textiles, macramé, plants, eclectic mix, warm earth tones',
  // ... devamı
};
```

### 1.2 — Mobilya/Obje Swap Komutu
**Eksik:** "Koltuğu yeşil kadife yap" veya "Masayı ceviz ahşap yap" diyemiyor.

**Uygulama:**
- **Dosya:** `PerdeAIAssistant.tsx`
- **Yeni intent:** `isSwapIntent`
- **Anahtar kelimeler:** `['değiştir', 'swap', 'yerine', 'koltuk', 'masa', 'sandalye', 'yatak', 'dolap', 'raf', 'avize', 'lamba', 'halı', 'paspas', 'yastık', 'vazo', 'ayna', 'tablo', 'sehpa', 'konsol', 'tv ünitesi', 'kitaplık']`
- **Davranış:** Swap komutu da `request_render_edit` kullanır — fark: prompt'a spesifik obje + yeni materyal eklenir

### 1.3 — Renk Paleti Önerme
**Eksik:** "Bu oda için uyumlu renkler öner" veya "60-30-10 kuralına göre palet ver" diyemiyor.

**Uygulama:**
- **Dosya:** `PerdeAIAssistant.tsx`
- **Yeni intent:** `isColorAdviceIntent`
- **Anahtar kelimeler:** `['renk öner', 'palet', 'uyumlu renk', 'renk kombinasyonu', 'hangi renk', 'ne renk', 'renk uyumu']`
- **Davranış:** `/api/chat` üzerinden Gemini'ye sor, cevap olarak renk paleti kartı göster
- **Widget:** Renkli dairelerle palet kartı (opsiyonel, chat mesajı olarak da olabilir)

### 1.4 — Moodboard / İlham
**Eksik:** "Bu tarz salon için ilham göster" diyemiyor.

**Uygulama:**
- **Dosya:** `PerdeAIAssistant.tsx`
- **Yeni intent:** `isInspirationIntent`
- **Anahtar kelimeler:** `['ilham', 'fikir', 'öneri', 'moodboard', 'nasıl olur', 'nasıl güzel olur', 'ne yapabilirim']`
- **Davranış:** `/api/chat` üzerinden Gemini'ye stil bazlı öneriler sorulur, metin cevabı döner

---

## 🚀 FAZ 2: Stüdyo UX İyileştirmeleri

### 2.1 — Hızlı İndirme Butonu (Download)
**Eksik:** Render sonucu indirme butonu var ama belirgin değil / çalışmıyor.

**Uygulama:**
- **Dosya:** `RoomVisualizer.tsx` — result görünümü altına
- **Satır:** ~900 civarı (save butonunun yanına)
- **Kod:**
```tsx
<button onClick={() => {
  const a = document.createElement('a');
  a.href = resultImage!;
  a.download = `perde-ai-${crmData.projectName || 'tasarim'}-${Date.now()}.jpg`;
  a.click();
}} className="bg-zinc-950/80 hover:bg-black border border-zinc-700/50 ...">
  <Download className="w-4 h-4" /> İNDİR
</button>
```

### 2.2 — Paylaşım (WhatsApp/E-posta)
**Eksik:** Müşteriye göndermek için paylaş butonu yok.

**Uygulama:**
- **Dosya:** `RoomVisualizer.tsx` — indirme butonunun yanına
- **Davranış:** 
  - WhatsApp: `window.open('https://wa.me/?text=...')` — görseli base64 → blob → URL olarak paylaş
  - E-posta: `mailto:` link ile veya gelecekte API entegrasyonu
  - Link kopyala: clipboard'a kaydet

### 2.3 — Render Geçmişi Galeri Görünümü
**Eksik:** Undo/redo var ama kullanıcı tüm render geçmişini göremez.

**Uygulama:**
- **Dosya:** `RoomVisualizer.tsx`
- **Konum:** Before/after bölümünün altına veya sağ kenara mini galeri
- **UI:** Yatay scroll'lu küçük thumbnail'ler (60x40px)
- **Tıklama:** İstenen render'a geri dönme

### 2.4 — Karşılaştırma Modu (Side-by-Side)
**Eksik:** Sadece slider var, iki tasarımı yan yana koyma yok.

**Uygulama:**
- **Dosya:** `RoomVisualizer.tsx`
- **UI:** Toggle butonu: "Slider | Yan Yana"
- **Yan Yana mod:** `grid grid-cols-2` ile iki görseli sıralı göster

---

## 🚀 FAZ 3: Stüdyo İş Akışı

### 3.1 — Çoklu Oda / Proje Sekmesi
**Eksik:** Tek seferde sadece 1 mekan tasarlanıyor. Perdeci 5 pencere tasarlayıp hepsini kaydetmek ister.

**Uygulama:**
- **Dosya:** `RoomVisualizer.tsx` — üst bara sekme sistemi ekle
- **State:** `const [rooms, setRooms] = useState([{ id: 1, name: 'Salon', ... }])`
- **UI:** Tab bar: `[ Salon ] [ Yatak Odası ] [ + Oda Ekle ]`
- **Her sekme:** Kendi `stagedImage`, `resultImage`, `canvasAttachments` state'i

### 3.2 — Tasarım Notu / Açıklama Overlay
**Eksik:** Tasarımcı görselin üzerine not ekleyemiyor.

**Uygulama:**
- **Dosya:** `RoomVisualizer.tsx`
- **UI:** Görselin üzerine tıklayınca pin bırakma + metin notu
- **State:** `annotations: { x: number, y: number, text: string }[]`
- **Kayıt:** Firestore'a proje ile birlikte kaydedilir

### 3.3 — Müşteri Sunum Modu (Tam Ekran)
**Eksik:** Müşteriye gösterirken UI elemanları (chat, butonlar) görünüyor.

**Uygulama:**
- **Dosya:** `RoomVisualizer.tsx`
- **UI:** "Sunum Modu" butonu → tüm UI gizlenir, sadece before/after slider + logo kalır
- **Tetikleme:** F11 veya özel buton
- **Çıkış:** ESC tuşu

---

## 🚀 FAZ 4: Chatbot Akıllı Davranışlar

### 4.1 — Tasarım Tavsiyesi Motoru
**Eksik:** AI proaktif olarak "Bu mekanda tül perde daha iyi olur" veya "Duvar rengine göre pastel ton öneriyorum" demiyor.

**Uygulama:**
- **Dosya:** `PerdeAIAssistant.tsx` — RENDER_COMPLETE handler'ına ekle
- **Davranış:** Render tamamlandığında, Gemini API'sine render sonucunu analiz ettir ve kısa tasarım önerisi döndür
- **Endpoint:** Mevcut `/api/chat` — "Bu render sonucunu analiz et ve 3 cümlelik tasarım önerisi ver" prompt'u

### 4.2 — Sohbet'ten Tasarıma Dönüşüm
**Eksik:** Kullanıcı serbest metin yazar ama AI sadece chat cevabı verir, tasarıma çevirmez.

**Uygulama:**
- **Dosya:** `PerdeAIAssistant.tsx`
- **Davranış:** `hasCompletedRender=true` iken HER mesaj zaten render-edit'e gidiyor (bunu az önce yaptık ✅)
- **Ek:** Gemini'nin chat cevabı `"TASARIM_KOMUTU:"` prefix'i ile dönerse → otomatik render-edit tetikle
- **Bu sayede:** "Biraz daha sıcak olsa" → Gemini: "TASARIM_KOMUTU: Make the room warmer with golden warm lighting and beige textiles" → render-edit tetiklenir

---

## 📋 ÖNCELİK SIRASI (Gemini İçin Execution Order)

| Sıra | Özellik | Zorluk | Dosya | Süre |
|------|---------|--------|-------|------|
| 1 | 1.1 Stil Değiştirme | Kolay | `PerdeAIAssistant.tsx` | 15 dk |
| 2 | 1.2 Mobilya Swap | Kolay | `PerdeAIAssistant.tsx` | 10 dk |
| 3 | 2.1 İndirme Butonu | Kolay | `RoomVisualizer.tsx` | 5 dk |
| 4 | 2.2 WhatsApp Paylaşım | Kolay | `RoomVisualizer.tsx` | 10 dk |
| 5 | 1.3 Renk Önerme | Orta | `PerdeAIAssistant.tsx` | 15 dk |
| 6 | 2.3 Render Galeri | Orta | `RoomVisualizer.tsx` | 20 dk |
| 7 | 2.4 Side-by-Side | Orta | `RoomVisualizer.tsx` | 15 dk |
| 8 | 3.3 Sunum Modu | Orta | `RoomVisualizer.tsx` | 15 dk |
| 9 | 1.4 İlham/Moodboard | Kolay | `PerdeAIAssistant.tsx` | 10 dk |
| 10 | 4.1 Proaktif Tavsiye | Orta | `PerdeAIAssistant.tsx` | 20 dk |
| 11 | 3.1 Çoklu Oda | Zor | `RoomVisualizer.tsx` | 45 dk |
| 12 | 3.2 Not/Annotation | Zor | `RoomVisualizer.tsx` | 30 dk |

---

## ⚠️ User Review Required

> [!IMPORTANT]
> **Faz seçimi:** 12 özellik var. Hepsini mi yapalım, yoksa önce Faz 1 + Faz 2'yi (ilk 9 özellik) bitirelim mi?

> [!IMPORTANT]
> **Çoklu Oda (3.1):** Bu özellik büyük bir state refactoring gerektirir. Şimdilik atlanıp, diğerleri bittikten sonra ayrı bir sprint'te yapılabilir. Onay?

> [!IMPORTANT]
> **Sunum Modu (3.3):** Perdeciler/iç mimarlar bu özelliği çok ister — müşteriye gösterirken temiz ekran. Önceliği yükseltmeli miyiz?

## Open Questions

1. **WhatsApp paylaşımında** görseli link olarak mı yoksa dosya olarak mı paylaşmalıyız? (Link: Firebase Storage gerekir / Dosya: blob olarak indirmeli)
2. **Stil listesi** sadece bu 15 stil mi olsun yoksa kullanıcı kendi stilini yazabilsin mi?
3. **Proaktif tavsiye** her render sonrası mı gelsin, yoksa kullanıcı "analiz et" dediğinde mi?
