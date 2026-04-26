# PERDE.AI TASARIM MOTORU — GÜNCEL DURUM RAPORU (26 Nisan 2026)

> **Bu dosya SİLİNEMEZ, ÜSTÜNE YAZILAMAZ.** Sadece checkbox güncellenebilir.
> **Hiçbir AI ajanı dosya SİLEMEZ. Sadece görevini yapıp kayıt altına almalıdır.**

---

## YAPILAN DEĞİŞİKLİKLER (Kayıt)

### render-pro/route.ts → v4.1
- [x] Anti-halüsinasyon 3 katmanlı prompt sandviçi eklendi
- [x] Aspect ratio 16:9 zorlaması kaldırıldı → auto moda geçildi
- [x] Deprecated `gemini-2.0-flash-exp` → Nano Banana Pro / Nano Banana 2 modelleri
- [x] Ön talimat bloğu: "SEN FOTOĞRAF DÜZENLEME MOTORUSUN" kilidi

### RoomVisualizer.tsx
- [x] DEMO_ROOMS array ve isDemoMode prop tamamen kaldırıldı
- [x] `aspectRatio: '16:9'` → `aspectRatio: 'auto'`
- [x] Ürün upload: event dispatch bağımlılığı → doğrudan state yönetimi
- [x] "TASARIMI BAŞLAT" butonu: mobil + masaüstü gösterim, doğrudan triggerAutonomousRender çağrısı

### Diğer
- [x] DesignEngine.tsx: Türkçe encoding fix + toast
- [x] Img2ImgVisualizer.tsx: API payload formatı + kumaş tipi + stüdyo ayarları
- [x] PerdeAIAssistant.tsx: Render/koleksiyon/teklif motor entegrasyonu
- [x] OrderSlideOver.tsx: handleRefreshMock → handleRefreshPricing
- [x] Register.tsx: 7 meslek grubu seçimi
- [x] WowDemoSection.tsx: isDemoMode prop temizliği

---

## TEST EDİLMESİ GEREKEN

- [ ] Mekan + Kumaş yükleme → Server logda `Images: 2+` kontrolü
- [ ] Render sonucunda kumaş deseninin BİREBİR korunması
- [ ] Farklı aspect ratio'lu fotoğraflarla oran korunma testi
- [ ] Text-to-Image modu (mekan fotoğrafı olmadan, chatbot ile otonom tasarım)
- [ ] `gemini-3-pro-image-preview` modelinin image generation desteği doğrulama

---

## MODEL HARİTASI (Nisan 2026)

| Model | Marka | Durum | Kullanım |
|-------|-------|-------|----------|
| `gemini-3-pro-image-preview` | Nano Banana Pro | ✅ | Tek render, 4K, studio kalite |
| `gemini-3.1-flash-image-preview` | Nano Banana 2 | ✅ | Multi-varyasyon, hızlı |
| `gemini-2.5-flash-image` | Nano Banana | ✅ | Düşük maliyet taslak |
| `gemini-2.0-flash-exp` | — | ❌ DEPRECATED | YASAK |
| `imagen-4.0-generate-001` | Imagen 4 | ✅ | Text-to-Image |

---

## MUTLAK KURALLAR (Tüm AI Ajanları İçin)

1. **DOSYA SİLME YASAK** — Gereksiz dosyalar `_archive/` altına taşınır
2. **Halüsinasyon yasak** — Yüklenen kumaş fotoğrafının deseni birebir kullanılmalı
3. **16:9 zorlaması yasak** — Mekanın orijinal aspect ratio'su korunmalı
4. **Deprecated model yasak** — `gemini-2.0-flash-exp` kullanılmamalı
5. **Her değişiklik sonrası `pnpm run build` + kayıt zorunlu**
