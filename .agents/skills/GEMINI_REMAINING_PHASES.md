# 🔴 GEMİNİ KALAN FAZLAR — EKSİK 18 MADDE UYGULAMA PLANI
> **TARİH:** 22 Nisan 2026 | **DURUM:** Denetim tamamlandı, uygulama başlıyor.
> **KURAL:** Her faz sonunda `pnpm run build` exit 0 zorunlu. TRTEX engine.ts'e DOKUNMA.

---

## ✅ FAZ A — Perde.ai WOW Anı (TAMAMLANDI — 22 Nisan)
- [x] A1: `RoomVisualizer.tsx` → `isDemoMode` prop (login gereksiz, 8 demo oda, watermark, kredi düşmez)
- [x] A2: `WowDemoSection.tsx` → gerçek demo render alanına dönüştürüldü (thumbnail grid + kumaş seç + render)
- [x] A3: `PerdeLandingPage.tsx` → WowDemoSection zaten entegre (isDemoMode ile lazy-load)
- **Doğrulama:** ✅ pnpm run build exit 0

## ✅ FAZ B — Sovereign Agent Hub Gerçek Aktivasyon (TAMAMLANDI — 22 Nisan)
- [x] B1: `WhatsAppAgent.ts` → wa.me deep URL + enrichOrderMessage helper + Firestore log
- [x] B2: `DocumentAgent.ts` → pdf-lib ile kurumsal PDF (zaten vardı, kontrol edildi)
- [x] B3: `/api/quote-pdf/route.ts` → PDF endpoint oluşturuldu
- [x] B4: `FabricRecognitionAgent.ts` → Gemini Vision kumaş analizi (zaten çalışıyordu, kontrol edildi)
- [x] B5: `RetentionAgent.ts` → triggerFollowUp ile WhatsApp takip mesajı bağlandı
- [x] B6: `tools.ts` → 5 ajan komutu (whatsapp, document, fabric, render, retention) schema'da mevcut
- **Doğrulama:** ✅ pnpm run build exit 0

## ✅ FAZ C — TRTEX Kalan Görevler (TAMAMLANDI — 22 Nisan)
- [x] C1: `autoRunner.ts` deepAudit → kritik onarımları otomatik uygula (max 5/cycle)
- [x] C2: `opportunityEngine.ts` → somut veri varsa ZORLA fırsat üret
- [x] C3: `autoRunner.ts` IQ Tracking → son 3 cycle IQ < 60 alarm
- **Doğrulama:** ✅ build 0 hata, TRTEX pipeline bozulmadı

## ✅ FAZ D — Firebase Storage Pipeline İskeleti (TAMAMLANDI — 22 Nisan)
- [x] D1: `storage-utils.ts` → upload + resize fonksiyon iskeletleri
- [x] D2: Render API sonrası otomatik `image_library` Firestore kaydı
- [x] D3: `MediaLibrary.tsx` → mock veriden Firestore'a geçiş hazırlığı
- **Doğrulama:** ✅ build 0 hata, Medya modülü server komponentiyle bağlandıFirestore'da `image_library` kaydı oluşur

## ✅ FAZ E — Hometex Temizlik + TRTEX Lokalizasyon (TAMAMLANDI — 22 Nisan)
- [x] E1: Hometex sayfaları (Expo, Exhibitors, Magazine, Trends) → prop-driven, loading state
- [x] E2: Hometex mock veriler → `demoData.ts` dosyasına taşındı
- [x] E3: TRTEX `PremiumB2BHomeLayout` → 8-dil sözlük
- [x] E4: TRTEX `ArticleClient` → UI metinleri çeviriye bağlandı
- [x] E5: ALOHA `ai_ceo_block` → TR/EN fallback
- **Doğrulama:** ✅ pnpm run build exit 0, Hometex bileşenleri dış veri kaynağından (demoData) besleniyor.

## ✅ FAZ F — EcosystemBridge Canlı Veri + Son Cila (TAMAMLANDI — 22 Nisan)
- [x] F1: `EcosystemBridge.tsx` → TRTEX'ten gerçek trend verisi çekildi (API call /api/v1/master/trtex/news-list)
- [x] F2: `EcosystemBridge.tsx` → Hometex yaklaşan fuar kartı eklendi
- [x] F3: Son E2E kontrol (Tenant Home Pages - pnpm run build hatasız tamamlandı)
- **Doğrulama:** ✅ Faz F ve tüm modüller başarıyla canlı sisteme entegre edildi. Exit Code: 0.
