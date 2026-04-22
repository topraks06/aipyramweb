# 🔴 GEMİNİ KALAN FAZLAR — EKSİK 18 MADDE UYGULAMA PLANI
> **TARİH:** 22 Nisan 2026 | **DURUM:** Denetim tamamlandı, uygulama başlıyor.
> **KURAL:** Her faz sonunda `pnpm run build` exit 0 zorunlu. TRTEX engine.ts'e DOKUNMA.

---

## ✅ FAZ A — Perde.ai WOW Anı (TAMAMLANDI — 22 Nisan)
- [x] A1: `RoomVisualizer.tsx` → `isDemoMode` prop (login gereksiz, 8 demo oda, watermark, kredi düşmez)
- [x] A2: `WowDemoSection.tsx` → gerçek demo render alanına dönüştürüldü (thumbnail grid + kumaş seç + render)
- [x] A3: `PerdeLandingPage.tsx` → WowDemoSection zaten entegre (isDemoMode ile lazy-load)
- **Doğrulama:** ✅ pnpm run build exit 0

## 🟠 FAZ B — Sovereign Agent Hub Gerçek Aktivasyon (Gün 2-3)
- [ ] B1: `WhatsAppAgent.ts` → wa.me deep URL üretimi + OrderSlideOver bağlantısı
- [ ] B2: `DocumentAgent.ts` → `pdf-lib` ile gerçek kurumsal PDF teklif
- [ ] B3: `/api/quote-pdf/route.ts` → PDF endpoint oluştur
- [ ] B4: `FabricRecognitionAgent.ts` → Gemini Vision kumaş analizi aktifleştir
- [ ] B5: `RetentionAgent.ts` → Terk edilmiş teklif takip cron job iskeleti
- [ ] B6: `tools.ts` → 4 yeni ajan komutunu function-calling schema'ya bağla
- **Doğrulama:** Her ajan invokeAgent() ile çağrıldığında gerçek çıktı üretir

## 🟡 FAZ C — TRTEX Kalan Görevler (Gün 3-4)
- [ ] C1: `autoRunner.ts` deepAudit → kritik onarımları otomatik uygula (max 5/cycle)
- [ ] C2: `opportunityEngine.ts` → somut veri varsa ZORLA fırsat üret
- [ ] C3: `autoRunner.ts` IQ Tracking → son 3 cycle IQ < 60 alarm
- **Doğrulama:** build 0 hata, TRTEX pipeline bozulmadı

## 🟢 FAZ D — Firebase Storage Pipeline İskeleti (Gün 4-5)
- [ ] D1: `storage-utils.ts` → upload + resize fonksiyon iskeletleri
- [ ] D2: Render API sonrası otomatik `image_library` Firestore kaydı
- [ ] D3: MediaLibrary.tsx → mock veriden Firestore'a geçiş hazırlığı
- **Doğrulama:** Render sonrası Firestore'da `image_library` kaydı oluşur

## 🔵 FAZ E — Hometex Temizlik + TRTEX Lokalizasyon (Gün 5-6)
- [ ] E1: Hometex sayfaları (Expo, Exhibitors, Magazine, Trends) → prop-driven, loading state
- [ ] E2: Hometex mock veriler → `demoData.ts` dosyasına taşı
- [ ] E3: TRTEX `PremiumB2BHomeLayout` → hardcoded TR metinleri → 8-dil sözlük
- [ ] E4: TRTEX `ArticleClient` → UI metinleri çeviriye bağla
- [ ] E5: ALOHA `ai_ceo_block` → TR/EN fallback
- **Doğrulama:** trtex.localhost:3000 → EN'ye geçince tüm UI İngilizce

## 🟣 FAZ F — EcosystemBridge Canlı Veri + Son Cila (Gün 6-7)
- [ ] F1: `EcosystemBridge.tsx` → TRTEX'ten gerçek trend verisi çek (Firestore)
- [ ] F2: `EcosystemBridge.tsx` → Hometex'ten yaklaşan fuar bilgisi çek
- [ ] F3: Son E2E kontrol: Her tenant ana sayfası kusursuz render
- **Doğrulama:** Tam build + canlı test
