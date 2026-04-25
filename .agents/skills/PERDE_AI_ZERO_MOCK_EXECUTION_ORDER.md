# 🔴 PERDE.AI ANAHTAR TESLİM GEÇİŞ EMRİ — SIFIR MOCK, SIFIR PLACEHOLDER

> **YETKİ:** Hakan (Kurucu) | **HAZIRLAYAN:** Claude Opus (Baş Mimar)  
> **TARİH:** 25 Nisan 2026  
> **DURUM:** ⬜ YÜRÜTME BEKLİYOR

---

## ⛔ MUTLAK YASALAR (Bu dosyadaki tek bir kural bile ihlal edilirse görev BAŞARISIZ sayılır)

1. **SIFIR MOCK:** `setTimeout(() => ...)` ile sahte gecikme YASAK. `"/placeholder-render.jpg"` gibi sabit değerler YASAK. Unsplash URL'leri demo/referans thumbnail dışında YASAK.
2. **SIFIR TODO:** `// TODO: ...` yorumu bırakma YASAK. Her satır çalışır kod olacak.
3. **HER ADIM TEST:** Her adım tamamlandığında `pnpm run build` çalıştırılacak VE tarayıcıda ilgili sayfa açılıp ekran görüntüsü/DOM kontrol edilecek.
4. **KURAL:** Hiçbir adımı "tamamlandı" olarak işaretleme — testi geçmeden, build başarılı olmadan, tarayıcıda çalıştığını görmeden.
5. **GERİ DÖNÜŞ YOK:** Yapılan değişiklik bozarsa `git stash` ile geri al, düzelt, tekrar dene.
6. **BU DOSYA SİLİNEMEZ** — Sadece checkbox güncellenebilir (`⬜` → `✅`).

---

## 📋 MEVCUT DURUM ANALİZİ (Claude Opus Forensik Tarama Sonuçları)

### ✅ ÇALIŞAN (Dokunma, Bozma)
| Bileşen | Dosya | Durum |
|---------|-------|-------|
| Landing Page | `PerdeLandingPage.tsx` | ✅ Çalışıyor |
| Login/Register | `auth/Login.tsx`, `auth/Register.tsx` | ✅ Firebase Auth bağlı |
| Navbar/Footer | `PerdeNavbar.tsx`, `PerdeFooter.tsx` | ✅ Çalışıyor |
| B2B Dashboard | `B2B.tsx` | ✅ Firestore `onSnapshot` bağlı |
| Sipariş Formu | `OrderSlideOver.tsx` | ✅ Firestore CRUD bağlı |
| Muhasebe | `Accounting.tsx` | ✅ Çalışıyor |
| Envanter | `Inventory.tsx` | ✅ Çalışıyor |
| Katalog | `Catalog.tsx` | ✅ Firestore bağlı |
| Privacy/Terms | `PerdePrivacy.tsx`, `PerdeTerms.tsx` | ✅ Statik |
| RoomVisualizer | `RoomVisualizer.tsx` | ✅ `/api/render` API'sine bağlı, çalışıyor |
| AI Assistant | `PerdeAIAssistant.tsx` | ✅ `/api/chat` API'sine bağlı, çalışıyor |

### 🔴 MOCK / KIRIK (Bunlar düzeltilecek)
| Bileşen | Dosya | Sorun | Çözüm |
|---------|-------|-------|-------|
| **DesignEngine** | `DesignEngine.tsx` | `setTimeout(3000)` ile sahte gecikme + `"/placeholder-render.jpg"` | → `/api/perde/collection` API'sine bağla |
| **Img2ImgVisualizer** | `Img2ImgVisualizer.tsx` | Şablon PNG'ler yok → Canvas boş çiziyor | → `/api/perde/render-pro` API'sine bağla (Canvas compositing'i kaldır, AI render kullan) |
| **OrderSlide MockRefresh** | `OrderSlideOver.tsx:88` | `handleRefreshMock` → `alert()` | → Gerçek Gemini API ile fiyat güncelleme |
| **EcosystemBridge** | `EcosystemBridge.tsx:11` | `// mock veya API call` yorumu | → Gerçek cross-node API call |

### 🟡 YENİ API'LER (Claude Opus yazdı, Frontend bağlantısı YAPILMADI)
| API Route | Ne Yapar | Frontend Bağlantısı |
|-----------|----------|---------------------|
| `/api/perde/render-pro` | Mekan + Kumaş → Img2Img Render | ❌ Hiçbir bileşen kullanmıyor |
| `/api/perde/render-edit` | Mevcut render'ı düzenle | ❌ Hiçbir bileşen kullanmıyor |
| `/api/perde/analyze-fabric` | Fotoğraf → Kumaş önerisi (Img2Tex) | ❌ Hiçbir bileşen kullanmıyor |
| `/api/perde/collection` | Koleksiyon üretimi (Tex2Tex) | ❌ Hiçbir bileşen kullanmıyor |
| `/api/perde/b2b-calc` | Keşif föyü hesaplama | ❌ Hiçbir bileşen kullanmıyor |

---

## 🎯 GÖREV EMRİ (7 ADIM — Sırasıyla, Atlama YASAK)

### ADIM 1: DesignEngine.tsx → Gerçek API Bağlantısı
**Dosya:** `src/components/node-perde/DesignEngine.tsx`

**YAPILACAKLAR:**
- [x] Satır 46-50 arası `setTimeout + placeholder-render.jpg` kodunu SİL
- [x] `handleGenerate()` fonksiyonunu API'ye bağla
- [x] `draftImageUrl = "/placeholder-render.jpg"` satırını tamamen kaldır
- [x] Satır 6-7'deki mock yorumlarını kaldır

**DOĞRULAMA:**
```
1. pnpm run build → Exit code: 0
2. Tarayıcıda http://localhost:3000/sites/perde/studio açılacak
3. "Koleksiyon" modunda parametreler girilecek
4. "MOTORU ÇALIŞTIR" butonuna tıklanacak
5. Gerçek AI render'ın geldiği gözle doğrulanacak (placeholder DEĞİL)
```

---

### ADIM 2: Img2ImgVisualizer.tsx → render-pro API'sine Bağla
**Dosya:** `src/components/node-perde/Img2ImgVisualizer.tsx`

**MEVCUT SORUN:** Canvas compositing motoru var ama şablon PNG dosyaları (`/assets/templates/...`) yok. Sonuç: Motor çalışıyor ama boş/bozuk çizim yapıyor.

**YAPILACAKLAR:**
- [x] Canvas compositing motoru yerine `/api/perde/render-pro` API'sini kullan
- [x] `executeCompositing()` fonksiyonunu API'ye bağla
- [x] Unsplash thumbnail URL'lerini koru (bunlar sadece şablon seçici için referans görsel)
- [x] Stüdyo kontrol paneli ekle: Işık, Lens, Dekorasyon modu, Zaman slider'ları

**DOĞRULAMA:**
```
1. pnpm run build → Exit code: 0
2. Tarayıcıda Img2Img sekmesi açılacak
3. Kumaş fotoğrafı yüklenecek
4. Şablon seçilecek → "RENDER" butonuna basılacak
5. AI'dan gerçek render gelecek (Canvas fallback DEĞİL)
```

---

### ADIM 3: RoomVisualizer → render-pro Entegrasyonu (Kumaş Etiketleme)
**Dosya:** `src/components/node-perde/RoomVisualizer.tsx`

**MEVCUT DURUM:** Zaten `/api/render` API'sine bağlı ve çalışıyor. AMA kumaş etiketleme (Fon/Tül/Stor/Döşemelik) yok.

**YAPILACAKLAR:**
- [x] Mevcut `/api/render` çağrısı korunacak (çalışan sistemi bozma)
- [x] Ek olarak: Kullanıcı attachment yüklediğinde etiketleme dropdown'u ekle (Fon Kumaşı / Tül / Stor / Döşemelik)
- [x] Etiketlenmiş attachmentlar `products` parametresi olarak `/api/perde/render-pro` API'sine gönderilsin (opsiyonel, gelişmiş mod)
- [x] "Profesyonel Render" butonu ekle → `/api/perde/render-pro` kullanır

**DOĞRULAMA:**
```
1. pnpm run build → Exit code: 0
2. RoomVisualizer'da oda fotoğrafı yükle
3. Kumaş ekle + etiketle (Fon Kumaşı)
4. "Profesyonel Render" butonuna bas
5. render-pro API'sinden sonuç geldiğini doğrula
```

---

### ADIM 4: AI Assistant → Omni Engine + Render Tetikleme
**Dosya:** `src/components/node-perde/PerdeAIAssistant.tsx`

**MEVCUT DURUM:** Zaten `/api/chat` API'sine bağlı ve temel sohbet çalışıyor.

**YAPILACAKLAR:**
- [ ] Attachment yüklendiğinde + "tasarla", "render" gibi komutlar geldiğinde → `/api/perde/render-pro` API'sini tetikle
- [ ] "Kumaş analizi yap" komutu geldiğinde → `/api/perde/analyze-fabric` API'sini çağır
- [ ] "Koleksiyon oluştur" komutu geldiğinde → `/api/perde/collection` API'sini çağır
- [ ] "Teklif hazırla" / "Keşif föyü" komutu → `/api/perde/b2b-calc` API'sini çağır
- [ ] Sonuçları chat widget'ları olarak göster (mevcut widget sistemi kullanılacak)

**DOĞRULAMA:**
```
1. pnpm run build → Exit code: 0
2. AI Assistant açılacak
3. "Bu kumaşı analiz et" yazılacak + kumaş fotoğrafı yüklenecek
4. analyze-fabric API'sinden gelen önerilerin chat'te göründüğü doğrulanacak
5. "Koleksiyon oluştur: İskandinav keten" yazılacak → collection API sonucu görülecek
```

---

### ADIM 5: OrderSlideOver → Mock Temizliği
**Dosya:** `src/components/node-perde/OrderSlideOver.tsx`

**YAPILACAKLAR:**
- [ ] `handleRefreshMock()` fonksiyonundaki `alert()` → `/api/perde/b2b-calc` API çağrısı yap
- [ ] Dönen sonuçla mevcut sipariş verilerini güncelle

**DOĞRULAMA:**
```
1. pnpm run build → Exit code: 0
2. Sipariş formunu aç
3. "Fiyat Güncelle" butonuna bas
4. alert() DEĞİL, gerçek API sonucu geldiğini doğrula
```

---

### ADIM 6: EcosystemBridge → Gerçek Cross-Node Bağlantı
**Dosya:** `src/components/node-perde/EcosystemBridge.tsx`

**YAPILACAKLAR:**
- [ ] Satır 11'deki mock yorumunu kaldır
- [ ] TRTEX haberlerini `/api/trtex/feed` API'sinden çek (varsa)
- [ ] Hometex verilerini `/api/sovereign/stats` API'sinden çek (varsa)
- [ ] API yoksa bu bileşeni statik bilgi kartlarına dönüştür (mock data BİLÇEN İÇİNDE yazma)

**DOĞRULAMA:**
```
1. pnpm run build → Exit code: 0
2. Ecosystem sayfasını aç
3. Mock yorum satırlarının olmadığını doğrula
```

---

### ADIM 7: Tam Sistem E2E Testi + Git Commit
**YAPILACAKLAR:**
- [ ] `pnpm run build` → Exit code: 0
- [ ] Tarayıcıda Perde.ai'nin TÜM sayfalarını gez:
  - `/sites/perde` (Landing) → Açılıyor mu?
  - `/sites/perde/login` → Form var mı?
  - `/sites/perde/studio` → DesignEngine çalışıyor mu?
  - `/sites/perde/visualizer` → RoomVisualizer çalışıyor mu?
  - `/sites/perde/b2b` → Dashboard verisi gerçek mi?
  - `/sites/perde/pricing` → Fiyatlandırma sayfası var mı?
  - `/sites/perde/catalog` → Ürünler listeleniyor mu?
- [ ] `git add -A && git commit -m "feat(perde): Zero-Mock anahtar teslim — tüm motorlar ALOHA'ya bağlı"`

---

## 🔍 MOCK TESPİT KONTROL LİSTESİ

Bu regex'lerle proje taranacak. Sonuç 0 (sıfır) olmalı:
```bash
# Mock fonksiyonlar
grep -rn "handleRefreshMock\|mockProjects\|MOCK\|mock" src/components/node-perde/ --include="*.tsx" --include="*.ts" | grep -v "node_modules" | grep -v "placeholder:"

# Sahte gecikmeler (setTimeout ile AI taklit etme)
grep -rn "setTimeout.*resolve.*[0-9][0-9][0-9][0-9]" src/components/node-perde/ --include="*.tsx"

# Placeholder render
grep -rn "placeholder-render" src/components/node-perde/ --include="*.tsx"

# TODO yorumları
grep -rn "TODO:" src/components/node-perde/ --include="*.tsx"
```

---

## ⏱ TAHMİNİ SÜRE

| Adım | Tahmini Süre | Zorluk |
|------|-------------|--------|
| 1. DesignEngine | 45 dakika | 🟡 Orta |
| 2. Img2ImgVisualizer | 60 dakika | 🔴 Yüksek |
| 3. RoomVisualizer upgrade | 30 dakika | 🟡 Orta |
| 4. AI Assistant motorlar | 45 dakika | 🔴 Yüksek |
| 5. OrderSlide mock | 15 dakika | 🟢 Düşük |
| 6. EcosystemBridge | 15 dakika | 🟢 Düşük |
| 7. E2E Test + Commit | 30 dakika | 🟡 Orta |
| **TOPLAM** | **~4 saat** | |

---

## 📌 REFERANS DOSYALAR

### API Route'lar (Claude Opus yazdı, hazır)
- `src/app/api/perde/render-pro/route.ts` — Img2Img render
- `src/app/api/perde/render-edit/route.ts` — Render düzenleme
- `src/app/api/perde/analyze-fabric/route.ts` — Kumaş analizi (Img2Tex)
- `src/app/api/perde/collection/route.ts` — Koleksiyon motoru (Tex2Tex)
- `src/app/api/perde/b2b-calc/route.ts` — B2B keşif föyü

### Orijinal Perde.ai Referansı
- `C:\Users\MSI\Desktop\projeler zip\perde.ai\src\services\gemini.ts` — 625 satırlık motor kodu
- `C:\Users\MSI\Desktop\projeler zip\perde.ai\src\pages\DesignEngine.tsx` — Orijinal UI
- `C:\Users\MSI\Desktop\projeler zip\perde.ai\src\pages\RoomVisualizer.tsx` — Orijinal stüdyo

### Merkezi AI Client
- `src/core/aloha/aiClient.ts` — `alohaAI` singleton (tüm API'ler bunu kullanıyor)

---

> **SON SÖZ:** Bu plan bir istek değil, EMİRDİR. Her adım tamamlandığında checkbox işaretlenecek. Test atlanmayacak. Mock bırakılmayacak. Sonuç: Perde.ai'de bir kullanıcı kumaş fotoğrafı yüklediğinde GERÇEK AI render alacak, GERÇEK koleksiyon görecek, GERÇEK teklif alacak.
