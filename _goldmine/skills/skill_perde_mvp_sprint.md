# PERDE.AI + TRTEX — Anahtar Teslim Uygulama Planı
**TARİH:** 20 Nisan 2026
**HEDEF:** Perde.ai MVP + TRTEX deploy — baştan sona, faz faz, dosya dosya
**KURAL:** ConciergeWidget.tsx'e (chat) ASLA DOKUNMA. Skill dosyasını (.agents/skills/skill_ecosystem_master_plan.md) HER FAZ SONUNDA oku.

---

## UYARI: TRTEX KORUMA

```
⛔ DOKUNULMAYACAK DOSYALAR:
src/core/aloha/*              → TRTEX otonom pipeline
src/components/trtex/*        → TRTEX UI bileşenleri
src/components/ConciergeWidget.tsx → Chat widget (TEK, DOKUNMA)
src/app/api/chat/route.ts     → Chat API (çalışıyor, DOKUNMA)
```

---

## FAZ 0: TRTEX DEPLOY (Tek Seferlik — 10 dk)

### Amaç
Bugüne kadar yapılan tüm TRTEX düzeltmelerini (görsel pipeline + TR-only + ödünç görsel) canlıya al.

### Adımlar
1. `pnpm run build` → Exit code 0 doğrula
2. Hakan'a deploy hazır olduğunu bildir
3. **Deploy Hakan yapar** — sen build doğrulaması yap

### Doğrulama
- [ ] Build başarılı (exit 0)
- [ ] Hakan'a "deploy hazır" mesajı verildi

---

## FAZ 1: PERDE.AI ANA SAYFA YENİDEN TASARIM (1+ gün)

### Amaç
PerdeLandingPage.tsx'i baştan yaz. Mevcut yapı iyi ama "WOW anı" eksik ve chat entegrasyonu yok.

### Dosya: `src/components/tenant-perde/PerdeLandingPage.tsx` [OVERWRITE]

### Ana Sayfa Yapısı (Yukarıdan Aşağı):
```
┌─────────────────────────────────────────────────────────────┐
│ [1] NAVBAR (mevcut PerdeNavbar — az değişiklik)             │
├─────────────────────────────────────────────────────────────┤
│ [2] HERO — Tam ekran, fotoğraflı, güçlü başlık              │
│     Sol: Başlık + Alt yazı + "Demoyu Başlat" butonu          │
│     Sağ: Mekan fotoğrafı (slider mevcut — koruyoruz)         │
│     ORTADAKİ FARK: Küçük upload alanı → foto yükle, login yok│
├─────────────────────────────────────────────────────────────┤
│ [3] WOW DEMO BLOĞU — "Giriş yapmadan dene"                  │
│     Upload alanı + 3 örnek prompt                            │
│     "Bu odaya perde öner"                                    │
│     "Yeni koleksiyonumu dijitale taşı"                        │
│     "Bu hafta piyasada ne oldu"                               │
│     → Upload → chat'e düşer                                   │
├─────────────────────────────────────────────────────────────┤
│ [4] NASIL ÇALIŞIR — 3 adım (mevcut iş akışı güncellenecek)  │
│     1. Yükle   →  2. AI Render  →  3. Sipariş Geç            │
├─────────────────────────────────────────────────────────────┤
│ [5] KULLANIM ALANLARI — 3 kart                               │
│     🏭 Firma Sahibi: "Dijital katalog, ERP, pazar istihbaratı"│
│     🎨 İç Mimar: "Oda vizüalizasyonu, 4'lü varyasyon"        │
│     🌍 Toptancı: "B2B fırsat radarı, 8 dil yazışma"          │
├─────────────────────────────────────────────────────────────┤
│ [6] CANLI ÖRNEK GÖRSELLER — Galeri (mevcut — koruyoruz)      │
├─────────────────────────────────────────────────────────────┤
│ [7] EKOSİSTEM BAĞLANTISI                                     │
│     TRTEX.com → "Pazar istihbaratı"                          │
│     Hometex.ai → "Fuar ve katalog"                           │
│     Her birine link + kısa açıklama                          │
├─────────────────────────────────────────────────────────────┤
│ [8] FİYATLANDIRMA → Mevcut Pricing.tsx'e link                │
│     (fiyatlar sabit, dokunma — skill dosyasında yazıyor)      │
├─────────────────────────────────────────────────────────────┤
│ [9] CTA — "Ücretsiz Deneyin" + "Kurumsal Temsilci"          │
├─────────────────────────────────────────────────────────────┤
│ [10] FOOTER — Mevcut + Hakkımızda, İletişim, Stüdyo linkleri │
└─────────────────────────────────────────────────────────────┘
│ [FLOATING] ConciergeWidget — Sağ alt chat (DOKUNMA)          │
└─────────────────────────────────────────────────────────────┘
```

### Detaylı Bileşen İçerikleri

#### [2] HERO Bölümü
- Mevcut HERO_SLIDES mekanizması **korunacak** (3 slide, 7 saniye geçiş)
- Sol panel: Daha güçlü mesaj
  - Başlık: "Tekstil İşletim Sistemi" vibes
  - Alt yazı: "Perde, ev tekstili ve dekorasyon sektörünün yapay zeka platformu"
- Sağ panel: Mekan fotoğrafları (mevcut — Unsplash)
- **YENİ:** Hero'nun altında küçük upload ikonu + "Oda fotoğrafı yükle, anında perde gör" yazısı
  - Bu buton tıklanınca: ConciergeWidget otomatik açılır (global event dispatch)
  - `window.dispatchEvent(new CustomEvent('open-concierge', { detail: { action: 'upload' } }))`

#### [3] WOW DEMO BLOĞU (YENİ — En kritik bölüm)
**Dosya:** `src/components/tenant-perde/WowDemoSection.tsx` [NEW]

```tsx
// YAPISI:
// - Ortada büyük drag&drop alan veya "Fotoğraf Yükle" butonu
// - Altında 3 sabit prompt butonu (tıklanınca chat'e düşer):
//   "🏠 Bu odaya perde öner"
//   "📦 Yeni koleksiyonumu dijitale taşı"
//   "📊 Bu hafta piyasada ne oldu"
// - Arka plan: Hafif gradient, premium hissi
// - Upload tıklanınca → window.dispatchEvent('open-concierge')
// - Login GEREKMİYOR — ilk deneyim ücretsiz
```

#### [5] KULLANIM ALANLARI (YENİ)
**Dosya:** `src/components/tenant-perde/UseCasesSection.tsx` [NEW]

3 kart, her biri:
- İkon + Başlık + 3-4 bullet point + CTA butonu
- Kart 1: 🏭 **Firma Sahibi** — "Dijital katalog oluştur, pazar istihbaratı al, ERP ajanıyla yönet"
- Kart 2: 🎨 **İç Mimar** — "Oda fotoğrafı çek, 4'lü varyasyon al, kumaş numunesi iste"
- Kart 3: 🌍 **Toptancı** — "Fırsat radarını tara, 8 dilde yazış, proforma fatura üret"

#### [7] EKOSİSTEM BAĞLANTISI (YENİ)
**Dosya:** `src/components/tenant-perde/EcosystemBridge.tsx` [NEW]

```
┌──────────────┐  ┌──────────────┐
│  📰 TRTEX.com │  │ 🏠 Hometex.ai│
│  Pazar İstih. │  │ Fuar+Katalog │
│  [Ziyaret Et] │  │ [Ziyaret Et] │
└──────────────┘  └──────────────┘
```

### ConciergeWidget Entegrasyonu (DOKUNMADAN)
ConciergeWidget.tsx'e DOKUNMA ama PerdeLandingPage'den `window.dispatchEvent` ile:
- `open-concierge` → Chat'i aç
- `open-concierge` + `detail.message` → Chat'e önceden mesaj yaz
- `open-concierge` + `detail.action='upload'` → Upload modunu aç

**ÖNEMLİ:** ConciergeWidget'ın bu event'leri dinlemesi için küçük bir `useEffect` eklenmesi gerekebilir.
Eğer gerekiyorsa, SADECE bir `addEventListener` satırı ekle — başka hiçbir şeye DOKUNMA.

### Doğrulama
- [ ] `pnpm run build` → exit 0
- [ ] perde.ai ana sayfa render → tüm bölümler görünür
- [ ] Upload butonu → chat açılır
- [ ] 3 prompt butonu → chat'e mesaj düşer
- [ ] Mobil responsive → küçük ekranlarda düzgün

---

## FAZ 2: WOW MOTORU — FOTO YÜKLEME + RENDER (1+ gün)

### Amaç
Kullanıcı foto yükler → Vision AI analiz eder → 1 hızlı render üretir → render altında kumaş adı + fiyat aralığı + "numune iste" butonu.

### Dosyalar
| Dosya | Eylem | Açıklama |
|-------|-------|----------|
| `src/app/api/chat/route.ts` | ⚠️ DİKKATLİ GÜNCELLE | Multipart/form-data desteği ekle (görsel yükleme) |
| `src/app/api/render/route.ts` | YENİ | Quick render endpoint — Imagen 3.0, 1K çözünürlük |
| `src/lib/vision-analyzer.ts` | YENİ | Gemini Vision API ile oda analizi |

### `src/app/api/render/route.ts` [NEW] — Quick Render API
```typescript
// POST /api/render
// Body: { imageBase64: string, prompt?: string }
// Response: { renderUrl: string, analysis: {...}, suggestions: [...] }
//
// İş akışı:
// 1. imageBase64 al (oda fotoğrafı)
// 2. Gemini 2.5 Flash Vision ile analiz et:
//    - Oda tipi (salon, yatak odası, ofis)
//    - Renk paleti
//    - Işık durumu
//    - Pencere boyutu/tipi
// 3. Uygun perde önerisi prompt'u oluştur
// 4. Imagen 3.0 ile 1K render üret (hız > kalite)
// 5. Cloud Storage'a yükle
// 6. Render URL + analiz + öneriler dön
//
// ÖNEMLİ:
// - Login GEREKMİYOR (ilk 1 render ücretsiz)
// - Rate limit: IP başına 3 render/gün (ücretsiz)
// - Çözünürlük: 1024x1024 (maliyet tasarrufu)
// - Config: { numberOfImages: 1, aspectRatio: '16:9' }
```

### `src/lib/vision-analyzer.ts` [NEW]
```typescript
// analyzeRoom(imageBase64: string): Promise<RoomAnalysis>
//
// RoomAnalysis {
//   roomType: 'salon' | 'yatak_odasi' | 'ofis' | 'cocuk' | 'diger'
//   lightLevel: 'parlak' | 'orta' | 'karanlik'
//   colorPalette: string[]       // ["bej", "krem", "beyaz"]
//   windowType: 'genis' | 'dar' | 'kemer' | 'standart'
//   suggestedStyles: string[]    // ["modern_minimal", "klasik_drapeli"]
//   suggestedFabrics: { name: string, priceRange: string }[]
// }
//
// Gemini 2.5 Flash kullan (hız + düşük maliyet)
// systemInstruction: "Sen bir iç mimar asistanısın. Odayı analiz et ve perde öner. SADECE Türkçe yanıt ver."
```

### Render Altı Bilgi Kartı
Her render görselin altında:
```
┌─────────────────────────────────────────┐
│ 🏠 Modern Salon — Geniş Pencere         │
│ 📐 Önerilen: Sade Blackout Perde        │
│ 💰 Fiyat Aralığı: ₺850 - ₺2.400/metre  │
│ 📦 [Numune İste]  [Detaylı Render]       │
└─────────────────────────────────────────┘
```
Bu olmadan sistem "oyuncak" kalır. Bu varsa → satış başlar.

### Chat API Güncelleme (DİKKATLİ)
`src/app/api/chat/route.ts` — SADECE şu ekleme:
- `content-type` kontrolü: multipart/form-data gelirse → dosya parse et
- Dosya gelirse → `/api/render` endpoint'ine yönlendir
- Dosya gelmezse → mevcut Gemini chat akışı (aynen devam)
- **MEVCUT KODUN HİÇBİR SATIRINI DEĞİŞTİRME — sadece if/else ekle**

### Doğrulama
- [ ] Foto yükleme → Vision analiz → render URL dönüyor
- [ ] Render altında kumaş adı + fiyat görünüyor
- [ ] Rate limit: 4. render'da "limit aşıldı" mesajı
- [ ] Build başarılı

---

## FAZ 3: FİRMA SAHİBİ MODU — TRTEX VERİ ENTEGRASYONU (0.5 gün)

### Amaç
Chat'te "bu hafta ne oldu" deyince → TRTEX'ten son 7 gün verisi çekilsin → kısa, net, aksiyonel özet dönülsün.

### Dosyalar
| Dosya | Eylem | Açıklama |
|-------|-------|----------|
| `src/app/api/chat/route.ts` | ⚠️ GÜNCELLE | TRTEX entegrasyon tetikleyici ekle |
| `src/lib/trtex-bridge.ts` | YENİ | TRTEX'ten veri çeken köprü modülü |

### `src/lib/trtex-bridge.ts` [NEW]
```typescript
// getWeeklyDigest(): Promise<string>
//
// Firestore'dan trtex_news'ten son 7 gün haberleri çek
// Her haberi 1 satıra özetle
// Sonuç formatı:
//
// 📊 HAFTALIK PAZAR ÖZETİ (14-20 Nisan):
// • Pamuk fiyatları %3.2 ↑ — iplik marjları daralıyor
// • Almanya'dan 50K metre blackout talebi geldi
// • Heimtextil 2026 kayıtları açıldı
// • OEKO-TEX yeni sertifika kuralları yürürlükte
//
// İşlemler:
// 1. adminDb.collection('trtex_news').where(createdAt > 7 gün önce).get()
// 2. Her haberin title + commercial_note al
// 3. Gemini ile 1 paragraf özet üret (opsiyonel — maliyeti düşük tut)
// 4. String formatında dön
```

### Chat API TRTEX Tetikleme
`src/app/api/chat/route.ts` — Gemini'ye SYSTEM_PROMPT'a ek kural:
```
Eğer kullanıcı "piyasa", "bu hafta", "trend", "talep" gibi kelimeler sorarsa:
→ Yanıtının başına [TRTEX_DIGEST] tag'i koy
→ Sunucu bu tag'i yakalayıp trtex-bridge'den veri çekecek
```

VEYA daha basit: Chat route'da mesaj analizi yap:
```typescript
if (/piyasa|bu hafta|trend|talep|fiyat|ihracat/i.test(cleaned)) {
  const digest = await getWeeklyDigest();
  // digest'i Gemini'ye context olarak ver
}
```

### Doğrulama
- [ ] "Bu hafta ne oldu" → TRTEX verili özet dönüyor
- [ ] "Pamuk fiyatı" → Güncel veri
- [ ] "Yeni talep var mı" → Fırsat radarı verisi
- [ ] Build başarılı

---

## FAZ 4: CHAT HAFIZA KATMANI (0.5 gün)

### Amaç
Kullanıcı tekrar geldiğinde chat geçmişi korunsun.

### Dosyalar
| Dosya | Eylem | Açıklama |
|-------|-------|----------|
| `src/app/api/chat/route.ts` | GÜNCELLE | Session ID kabul et, Firestore'a yaz |
| `src/lib/chat-memory.ts` | YENİ | Firestore chat_sessions CRUD |

### `src/lib/chat-memory.ts` [NEW]
```typescript
// Firestore koleksiyonu: chat_sessions
//
// Şema:
// {
//   sessionId: string,        // UUID veya IP hash
//   userId?: string,          // Giriş yapmışsa Firebase Auth UID
//   messages: ChatMessage[],  // Son 20 mesaj
//   lastContext: string,      // Son konuşma konusu özeti
//   projectName?: string,     // "salon_projesi" gibi
//   createdAt: string,
//   updatedAt: string,
// }
//
// Fonksiyonlar:
// - getSession(sessionId): Promise<ChatSession | null>
// - saveMessage(sessionId, message): Promise<void>
// - getRecentContext(sessionId): Promise<string> → son 5 mesajın özeti
```

### Doğrulama
- [ ] İlk mesaj → session oluşturuldu (Firestore'da kontrol)
- [ ] Sayfayı kapat → aç → geçmiş mesajlar görünüyor
- [ ] "Geçen konuştuğumuz konu" → context doğru

---

## FAZ 5: GEÇMİŞ PROJELERİM SAYFASI (0.5 gün)

### Amaç
Kullanıcı yaptığı renderleri görsün, geri dönsün. Retention artışı.

### Dosyalar
| Dosya | Eylem | Açıklama |
|-------|-------|----------|
| `src/components/tenant-perde/MyProjects.tsx` | YENİ | Geçmiş render galerisi |
| `src/app/sites/[domain]/projects/page.tsx` | YENİ | Route |

### `src/components/tenant-perde/MyProjects.tsx` [NEW]
```
// - Grid layout: 3 sütun (desktop), 1 sütun (mobil)
// - Her kart: render görseli + tarih + oda tipi + önerilen kumaş
// - Tıkla → büyük görüntü (lightbox)
// - "Bu render'ı tekrar düzenle" → chat'e düşer
// - Login ZORUNLU (geçmiş projeleri görmek için)
// - Veri kaynağı: Firestore chat_sessions + render_history
```

### Doğrulama
- [ ] Login → geçmiş projeler listeleniyor
- [ ] Render tıkla → lightbox açılıyor
- [ ] "Tekrar düzenle" → chat'e mesaj düşüyor

---

## FAZ 6: GÖRSEL KÜTÜPHANE SİSTEMİ (1 gün)

### Amaç
Etiketlenmiş, çok çözünürlüklü görsel arşivi. Ajanların hızla bulacağı format.

### Dosyalar
| Dosya | Eylem | Açıklama |
|-------|-------|----------|
| `src/lib/image-library.ts` | YENİ | Kütüphane CRUD + arama |
| `src/app/api/library/route.ts` | YENİ | API endpoint |

### `src/lib/image-library.ts` [NEW]
```typescript
// Firestore koleksiyonu: image_library
//
// Şema:
// {
//   key: string,           // "curtain_modern_cream_2026_hero"
//   url_1k: string,
//   url_2k: string,
//   url_4k?: string,
//   url_8k?: string,
//   category: string,      // "curtain_modern" | "bedding_luxury"
//   tags: string[],        // ["krem", "modern", "salon", "blackout"]
//   style: string,         // "modern" | "klasik" | "industrial"
//   roomType: string,      // "salon" | "yatak_odasi" | "ofis"
//   color: string,         // "bej" | "beyaz" | "gri"
//   productType: string,   // "tül" | "blackout" | "fon" | "stor"
//   source: string,        // "imagen" | "user_upload" | "trtex_article"
//   tenant: string,        // "perde" | "trtex" | "hometex"
//   usageCount: number,
//   createdAt: string,
// }
//
// Fonksiyonlar:
// - addImage(data): Promise<string> → key döner
// - findByTags(tags: string[], limit: number): Promise<LibraryImage[]>
// - findByCategory(category: string): Promise<LibraryImage[]>
// - incrementUsage(key: string): Promise<void>
// - generateMultiResolution(originalBuffer: Buffer): Promise<{url_1k, url_2k, url_4k}>
//   → Sharp ile resize: 1024px, 2048px, 4096px
//   → Her birini Cloud Storage'a yükle
```

### Render Pipeline Entegrasyonu
`src/app/api/render/route.ts`'de render üretildikten sonra otomatik olarak:
1. `generateMultiResolution()` çağır → 1K, 2K versiyonları oluştur
2. `addImage()` ile kütüphaneye ekle (otomatik etiketleme)
3. TRTEX'ten gelen görselleri de kütüphaneye aktar

### Doğrulama
- [ ] Render üretildi → kütüphaneye otomatik eklendi
- [ ] `findByTags(["modern", "salon"])` → sonuç dönüyor
- [ ] 1K/2K URL'leri doğru çalışıyor

---

## FAZ 7: EK SAYFALAR (0.5 gün)

### Amaç
Hakkımızda, İletişim, Stüdyo — MUTLAKA olacak.

### Dosyalar
| Dosya | Eylem | Açıklama |
|-------|-------|----------|
| `src/app/sites/[domain]/about/page.tsx` | KONTROL + GÜNCELLE | Hakkımızda (perde tenant'ı için) |
| `src/app/sites/[domain]/contact/page.tsx` | KONTROL + GÜNCELLE | İletişim formu |
| `src/app/sites/[domain]/studio/page.tsx` | YENİ | Stüdyo / Visualizer'a yönlendirme |

Bu sayfalar mevcut olabilir — kontrol et. Yoksa tenant-perde bileşenlerinden oluştur.
- `Contact.tsx` → zaten var (src/components/tenant-perde/Contact.tsx)
- About → yoksa yaz, kısa + premium

### Doğrulama
- [ ] /about → render ediliyor
- [ ] /contact → form çalışıyor
- [ ] /studio → visualizer'a yönlendiriyor

---

## FAZ 8: SAYFALAR ARASI SAYFA MENÜ YAPISI (0.5 gün)

### Amaç
PerdeNavbar'a sayfalar arası navigasyonu ekle.

### Dosya: `src/components/tenant-perde/PerdeNavbar.tsx` [GÜNCELLE]

### Menü Yapısı:
```
PERDE.AI  |  Nasıl Çalışır  |  Stüdyo  |  Fiyatlandırma  |  Hakkımızda  |  İletişim  |  [Giriş Yap]
```
- Logo → ana sayfaya link
- "Nasıl Çalışır" → anchor (#nasil-calisir)
- "Stüdyo" → /sites/perde.ai/visualizer
- "Fiyatlandırma" → /sites/perde.ai/pricing
- "Hakkımızda" → /sites/perde.ai/about
- "İletişim" → /sites/perde.ai/contact
- "Giriş Yap" → /sites/perde.ai/login

### Mobil
- Hamburger menü → slide-in panel
- Mevcut yapı varsa koru, yoksa ekle

### Doğrulama
- [ ] Tüm linkler çalışıyor
- [ ] Mobil hamburger açılıyor
- [ ] Aktif sayfa highlight

---

## FAZ 9: FİNAL POLİŞ + BUILD TEST (0.5 gün)

### Kontrol Listesi

#### TR Dil Kontrolü
- [ ] Ana sayfada İngilizce kelime YOK
- [ ] Footer'da İngilizce kelime YOK
- [ ] Chat hariç (chat 3 dil destekliyor — sorun yok)
- [ ] SEO meta tag'leri Türkçe

#### Mobil Responsive
- [ ] Hero → mobilde düzgün
- [ ] WOW demo bloğu → mobilde upload çalışıyor
- [ ] Kullanım alanları → tek sütun
- [ ] Footer → düzgün stack

#### Performance
- [ ] Build başarılı (exit 0)
- [ ] Görsel boyutları optimize (lazy loading)
- [ ] Lighthouse score > 80

#### Son Görseller
- [ ] Hero görselleri kaliteli (Unsplash veya Imagen üretilmiş)
- [ ] WOW demo alanı görsel olarak etkileyici
- [ ] Galeri bölümü dolgun

---

## ÖZET TAKVİM

```
FAZ 0: TRTEX Deploy prep        → 10 dk  → Hakan yapar
FAZ 1: Ana Sayfa yeniden tasarım → 1+ gün → Hero + WOW + kullanım alanları
FAZ 2: WOW Motoru (render)      → 1+ gün → Vision AI + Imagen + kumaş kartı
FAZ 3: Firma Sahibi modu        → 0.5 gün → TRTEX veri köprüsü
FAZ 4: Chat hafıza               → 0.5 gün → Firestore sessions
FAZ 5: Geçmiş Projelerim         → 0.5 gün → Render galerisi
FAZ 6: Görsel kütüphane          → 1 gün  → Etiketli arşiv sistemi
FAZ 7: Ek sayfalar               → 0.5 gün → About, Contact, Studio
FAZ 8: Navbar                    → 0.5 gün → Menü yapısı
FAZ 9: Final poliş               → 0.5 gün → TR kontrol + responsive + test
                                  ──────────
                          TOPLAM: ~6 gün
```

## HER FAZ SONUNDA ZORUNLU

1. `pnpm run build` → **Exit code 0** yoksa bir sonraki faza GEÇİLMEZ
2. TRTEX rotası render test → kırılmadığını doğrula
3. `.agents/skills/skill_ecosystem_master_plan.md` oku → kurallara uy
4. Bu dosyadaki kontrol listesini işaretle

## MUTLAK KURALLAR (UNUTMA)

1. **ConciergeWidget.tsx → DOKUNMA**
2. **src/core/aloha/* → DOKUNMA**
3. **Deploy → Hakan yapar**
4. **Fiyatlar → Skill dosyasında, DEĞİŞTİRME**
5. **Chat → TEK, asla 2. açılmaz**
6. **Mevcut sayfalar → üstüne kapat, silme**
7. **Google-native altyapı → 3. parti yasak**
8. **TR dil → İngilizce UI metni YASAK (kod yorumları hariç)**
