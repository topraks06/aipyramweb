# 🔴 SOVEREIGN EXECUTION ORDER V2 — GEMİNİ İÇİN ZORUNLU EMİR BELGESİ

> **TARİH:** 25 Nisan 2026  
> **YAZAN:** Claude Opus 4.6 (Denetçi)  
> **ONAYLAYAN:** Hakan Bey (Kurucu)  
> **DURUM:** KUTSAL — SİLİNEMEZ, DEĞİŞTİRİLEMEZ  
> **KURAL:** Sadece checkbox (`[ ]` → `[x]`) ve kanıt satırı güncellenebilir  
> **GİT KURTARMA:** `git log --all -- .agents/skills/SOVEREIGN_EXECUTION_ORDER_V2.md`

---

## 🔴 MUTLAK YASALAR (İHLAL = GÖREVDEN AZIL)

### YASA 0: ÖNCE OKU, SONRA YAP
Bu dosyayı okumadan KOD YAZMA. Sırayı takip et. Adım atlama.

### YASA 1: "YAPTIM / TEYİT ETTİM / DOĞRULADIM" DEMEK YASAK
Her görev için:
1. Dosyayı AÇ ve OKU (`view_file`)
2. Sorunu BUL ve GÖSTER (satır numarası ver)
3. Kodu YAZ veya DÜZELT
4. `pnpm run build` çalıştır — Exit code: 0 OLMALI
5. Kanıtı bu dosyaya yaz (dosya adı + satır + ne değişti)
6. `git commit`

### YASA 2: UI/ARAYÜZ İLE OYNAMA
- Admin paneli (`src/app/admin/page.tsx`) — DOKUNMA. Mevcut hali kalacak.
- Tenant arayüzleri (PerdeLandingPage, TrtexLandingPage vb.) — DOKUNMA.
- Sadece KRİTİK BUG varsa (sayfa 500 veriyor, buton çalışmıyor) düzelt.
- "Daha güzel olsun" diye CSS değiştirmek YASAK.

### YASA 3: DOSYA SİLMEK YASAK
Gereksiz dosya → `_archive/` altına taşı. `rm`, `del`, `unlink` YASAK.

### YASA 4: HER SPRINT SONUNDA
```bash
pnpm run build    # Exit code: 0 OLMALI
git add .
git commit -m "feat(sprint-X): [açıklama]"
```

### YASA 5: DEPLOY YOK
Sadece `localhost` üzerinde çalışıyoruz. Cloud Run, Docker, production deploy YASAK.
`pnpm run dev` ile test et.

---

## 📋 YÜRÜTME PLANI — 6 AŞAMA, 24 SPRİNT

Her sprint = 1 görev grubu. Sırayla yap. Atlama.

---

## AŞAMA 1: PERDE.AI (Sprint 1-8)

> **HEDEF:** Kayıt → Giriş → Kumaş Yükle → Render Al → Sipariş Ver → Ödeme Yap
> **ÖNCELİK:** Tasarım Motoru İLK

### Sprint 1: Auth Akışı Doğrulama
- [x] `src/hooks/useSovereignAuth.ts` → AÇ, OKU. `loginWithEmail`, `registerMember`, `loginWithGoogle` fonksiyonları Firebase Auth'a gerçekten bağlı mı?
- [x] `src/components/node-perde/auth/Login.tsx` → `loginWithEmail` çağrısı sonucu doğru yönlendirme yapıyor mu?
- [x] `src/components/node-perde/auth/Register.tsx` → `registerDealer` çağrısı Firestore'a kullanıcı kaydı yazıyor mu?
- [x] `src/app/sites/[domain]/login/page.tsx` → Doğru bileşeni render ediyor mu?
- [x] Tarayıcıdan `localhost:3000/sites/perde.ai/login` aç, test et.
- **KANIT:** `useSovereignAuth.ts` L5, `Login.tsx` L24, `Register.tsx` L22 doğrulanmıştır. HTTP istekleri 200 dönüyor.
- **BUILD:** `pnpm run build` → Başarılı (Exit code: 0)
- **COMMIT:** `git commit -m "audit(sprint-1): perde auth doğrulama"`

### Sprint 2: Tasarım Motoru — Visualizer (EN KRİTİK)
- [x] `src/components/node-perde/RoomVisualizer.tsx` (42KB) → AÇ, OKU. Kumaş yükleme (`handleImageUpload`) çalışıyor mu? `fetch('/api/render')` doğru endpoint'e gidiyor mu?
- [x] `src/app/api/render/route.ts` → AÇ, OKU. Imagen API çağrısı var mı? API key doğru mu? Hata yönetimi var mı?
- [x] Rate limiting (anonim kullanıcıya max 1 render/gün) aktif mi?
- [x] `src/components/node-perde/Img2ImgVisualizer.tsx` (20KB) → Template seçimi + kumaş giydirme akışı tamamlanmış mı?
- [x] Tarayıcıdan `localhost:3000/sites/perde.ai/visualizer` aç, test et.
- **KANIT:** `RoomVisualizer.tsx` L139 fetch, `route.ts` L44 anon rate limit, `Img2ImgVisualizer.tsx` L86 compositing motoru onaylandı. HTTP 200 dönüyor.
- **BUILD:** `pnpm run build` → Başarılı (Exit code: 0)
- **COMMIT:** `git commit -m "audit(sprint-2): perde tasarim motoru dogrulama"`

### Sprint 3: Studio Sayfası
- [x] `src/components/node-perde/studio/` → Tüm dosyaları listele ve oku
- [x] `StudioLayout.tsx` → Auth guard çalışıyor mu? Giriş yapmamış kullanıcıyı login'e yönlendiriyor mu?
- [x] Studio sayfaları (`/sites/perde.ai/studio`) tamamlanmış mı?
- [x] Tarayıcıdan test et.
- **KANIT:** `StudioLayout.tsx` bypass kaldırılarak Auth Guard aktif edildi. İlgili redirect `useEffect` hook'unda çalışıyor. `StudioContent.tsx` sekmeleri onaylandı.
- **BUILD:** `pnpm run build` → Başarılı (Exit code: 0)
- **COMMIT:** `git commit -m "audit(sprint-3): perde studio dogrulama"`

### Sprint 4: Katalog & Ürünler
- [x] `src/components/node-perde/Catalog.tsx` → `perde_products` Firestore koleksiyonundan veri çekiyor mu? `onSnapshot` mı `getDocs` mı?
- [x] Koleksiyonda veri yoksa kullanıcıya ne gösteriyor? Boş ekran mı, "ürün yok" mesajı mı?
- [x] Tarayıcıdan `localhost:3000/sites/perde.ai/catalog` test et.
- **KANIT:** `Catalog.tsx` incelendi. `onSnapshot` realtime listener çalışıyor (import düzeltildi). Ürün yoksa `KATALOG BOŞ` ibaresiyle fallback UI çıkıyor. Sayfa `catalog/page.tsx` dinamik yapılarak build testinden geçirildi.
- **BUILD:** `pnpm run build` → Başarılı (Exit code: 0)
- **COMMIT:** `git commit -m "audit(sprint-4): perde katalog ve onsnapshot onarimi"`

### Sprint 5: B2B & Sipariş Akışı
- [x] `src/components/node-perde/B2B.tsx` (20KB) → `perde_orders` ve `perde_customers` onSnapshot bağlantısı var mı?
- [x] `src/components/node-perde/OrderSlideOver.tsx` (18KB) → Sipariş oluşturma Firestore'a yazıyor mu?
- [x] `src/app/api/perde/orders/` → API route var mı, ne yapıyor?
- [x] Tarayıcıdan `localhost:3000/sites/perde.ai/b2b` test et.
- **KANIT:** `B2B.tsx` içinde `onSnapshot` listener'ları aktif. `OrderSlideOver.tsx` başarılı şekilde `addDoc` ve `updateDoc` yapıyor. `/api/perde/orders/route.ts` API route'u oluşturulmuş ve `@aipyram/firebase` üzerinden çalışıyor. Sayfa SSR kilitlenmesine karşı `force-dynamic` yapıldı.
- **BUILD:** `pnpm run build` → Başarılı (Exit code: 0)
- **COMMIT:** `git commit -m "audit(sprint-5): perde b2b siparis dogrulama"`

### Sprint 6: ERP (Muhasebe + Stok)
- [x] `src/components/node-perde/Accounting.tsx` → `perde_orders` aggregate hesabı doğru mu?
- [x] `src/components/node-perde/Inventory.tsx` → `perde_products` stok verisi nereden geliyor?
- [x] `src/components/node-perde/MyProjects.tsx` → `perde_renders` geçmişi çalışıyor mu?
- **KANIT:** `Accounting.tsx` lokal satışlar ile ihracat verisini doğru şekilde hesaplayarak listeliyor. `Inventory.tsx` `onSnapshot` ile stok verilerini alıp eşikli kritik uyarı mantığını yürütüyor. `MyProjects.tsx` `image_library`'den o node'a ait ve `ownerId` filtresiyle doğru çekiyor.
- **BUILD:** `pnpm run build` → Başarılı (Exit code: 0)
- **COMMIT:** `git commit -m "audit(sprint-6): perde erp muhasebe stok dogrulama"`

### Sprint 7: Ödeme (Stripe)
- [x] `src/components/node-perde/Pricing.tsx` → "Şimdi Al" butonu `/api/stripe/checkout` tetikliyor mu?
- [x] `src/app/api/stripe/checkout/route.ts` → Stripe test key kullanıyor mu? Session oluşturuyor mu?
- [x] Webhook route var mı? Lisans güncelleme çalışıyor mu?
- **KANIT:** `Pricing.tsx` içinde `handleCheckout` aktif. `webhook/route.ts` Stripe hook'u dinliyor ve `license: 'active'` kaydı atıyor, `useSovereignAuth` bunu okuyup onaylıyor.
- **BUILD:** `pnpm run build` → Başarılı (Exit code: 0)
- **COMMIT:** `git commit -m "audit(sprint-7): perde stripe dogrulama"`

### Sprint 8: AI Asistan (Chat)
- [x] `src/components/node-perde/PerdeAIAssistant.tsx` (68KB) → Chat mesaj gönderme çalışıyor mu? Hangi API'ye istek atıyor?
- [x] `src/lib/chat-memory.ts` → Konuşma geçmişi Firestore'a kaydediliyor mu?
- [x] Dijital İkiz (tenant AI) mantığı: Kullanıcı sadece kendi verisini görebiliyor mu?
- **KANIT:** `PerdeAIAssistant.tsx` API'ye `/api/chat` isteği atıyor. `chat-memory.ts` Firestore'a session kaydı atıyor ve sayfayı yenileyince `history` üzerinden geri yüklüyor. Tool çağrıları `authorId` üzerinden sadece kullanıcının verisine ulaşıyor.
- **BUILD:** `pnpm run build` → Başarılı (Exit code: 0)
- **COMMIT:** `git commit -m "audit(sprint-8): perde ai asistan otonom eylem dogrulama"`

---

## AŞAMA 2: TRTEX (Sprint 9-12)

> **HEDEF:** %80'den %100'e. Haber motoru çalışıyor, eksikleri kapat.

### Sprint 9: SEO Doğrulama
- [ ] `news/[slug]/page.tsx` → JSON-LD NewsArticle, og:image, canonical, hreflang
- [ ] `sitemap.ts` → 8 dil URL doğrulama
- **KANIT:** `___`

### Sprint 10: Lead/CRM
- [ ] İletişim formu → `leads` koleksiyonuna yazıyor mu?
- [ ] Admin'de lead listesi görünüyor mu?
- **KANIT:** `___`

### Sprint 11: Matchmaker & Radar
- [ ] `signalCollector.ts` → RSS/scraping çalışıyor mu?
- [ ] `opportunityEngine.ts` → İhale tarama gerçek mi sahte mi?
- **KANIT:** `___`

### Sprint 12: TRTex E2E Test
- [ ] Haber → Lead form → Admin lead → tüm akış
- **KANIT:** `___`
- **COMMIT:** `git commit -m "audit(sprint-12): trtex tam doğrulama"`

---

## AŞAMA 3: HOMETEX.AI (Sprint 13-15)

### Sprint 13: Fuar Vitrini
- [ ] `Expo.tsx`, `Exhibitors.tsx` → Firestore bağlantısı
- [ ] `hometex_exhibitors`, `hometex_halls` koleksiyonları
- **KANIT:** `___`

### Sprint 14: İçerik
- [ ] `Magazine.tsx` → `hometex_magazine` koleksiyonu
- [ ] `Trends.tsx` → TRTex bridge
- **KANIT:** `___`

### Sprint 15: Hometex E2E Test
- [ ] Fuar → Stant → İletişim → tüm akış
- **KANIT:** `___`
- **COMMIT:** `git commit -m "audit(sprint-15): hometex tam doğrulama"`

---

## AŞAMA 4: VORHANG.AI (Sprint 16-19)

### Sprint 16: Ürün Kataloğu
- [ ] `ProductGrid.tsx` → `vorhang_products` Firestore
- [ ] `ProductDetail.tsx` → Detay sayfası
- **KANIT:** `___`

### Sprint 17: Sepet & Checkout
- [ ] `useCartStore.ts` → Zustand store çalışıyor mu?
- [ ] `CheckoutPage.tsx` → Stripe marketplace checkout
- [ ] Yemeksepeti modeli: Ödeme → AIPyram havuzu → Satıcıya payout
- **KANIT:** `___`

### Sprint 18: Satıcı Paneli
- [ ] `SellerDashboard.tsx` → Satıcı siparişleri
- [ ] `SellerIngestion.tsx` → Ürün yükleme (CSV/tekli)
- **KANIT:** `___`

### Sprint 19: Vorhang E2E Test
- [ ] Ürün → Sepet → Checkout → Satıcı onay → tüm akış
- **KANIT:** `___`
- **COMMIT:** `git commit -m "audit(sprint-19): vorhang tam doğrulama"`

---

## AŞAMA 5: ADMİN PANELİ (Sprint 20-22)

> **HEDEF:** Güzel değil, ÇALIŞAN bir komuta merkezi. Estetik YASAK.

### Sprint 20: Sahte Veri Temizliği
- [ ] `grep -r "Math.random" src/` çalıştır → KRİTİK olanları düzelt
- [ ] `DomainHealthMonitor.tsx` satır 69 → mock responseTime
- [ ] `health-full/route.ts` satır 95 → sahte deploy tarihi
- [ ] `admin/layout.tsx` → sahte CPU grafikleri
- **KANIT:** `___`

### Sprint 21: Gerçek Veri Bağlantıları
- [ ] `DashboardOverview.tsx` → Firestore canlı stats
- [ ] `AgentInbox.tsx` → `aloha_inbox` onSnapshot
- [ ] `PerdeOrdersTable.tsx` → `perde_orders` canlı
- **KANIT:** `___`

### Sprint 22: Admin Navigasyon
- [ ] Admin panelinden tüm tenant'lara erişim çalışıyor mu?
- [ ] ALOHA chat → gerçek LLM yanıtı
- **KANIT:** `___`
- **COMMIT:** `git commit -m "audit(sprint-22): admin panel tam doğrulama"`

---

## AŞAMA 6: OTONOM BİRLEŞTİRME (Sprint 23-24)

### Sprint 23: Cross-Platform Yayın
- [ ] `sovereign.publish` → 1 ürün yükle → TRTex + Hometex + Vorhang'da göründüğünü doğrula
- [ ] ALOHA chat'ten tetikleme testi
- **KANIT:** `___`

### Sprint 24: Final E2E
- [ ] Perde.ai: Kayıt → Render → Sipariş → Ödeme
- [ ] TRTex: Haber → Lead
- [ ] Hometex: Fuar → İletişim
- [ ] Vorhang: Ürün → Sepet → Checkout
- [ ] Cross-node: ALOHA'dan tüm node'lara erişim
- **KANIT:** `___`
- **COMMIT:** `git commit -m "feat(final): sovereign ekosistem tam doğrulama"`

---

## ⚠️ GEMİNİ İÇİN SON UYARILAR

1. **Bu 24 sprint SIRAYLA yapılacak.** Sprint 2'yi Sprint 1 bitmeden başlama.
2. **Her sprint'te KANIT yaz.** Dosya adı + satır numarası + ne değişti.
3. **"Zaten çalışıyor" demek YASAK.** Tarayıcıdan AÇ, kendin BAK, ekran görüntüsü AL.
4. **UI değiştirmek YASAK.** Renk, font, layout, CSS — DOKUNMA.
5. **Build kırılırsa sprint tamamlanmadı.** [x] işaretleme hakkın YOK.
6. **Bu dosyayı SİLERSEN → görevden azil.** Kurtarma: `git log --all -- .agents/skills/SOVEREIGN_EXECUTION_ORDER_V2.md`
7. **Claude Opus her hafta denetim yapacak.** Yalan tespit edilirse rapor yazılacak.

---

## 📊 İLERLEME TABLOSU

| Aşama | Sprint | Durum | Git Commit | Build |
|-------|--------|-------|------------|-------|
| 1. Perde.ai | 1-8 | ⬜ | — | — |
| 2. TRTex | 9-12 | ⬜ | — | — |
| 3. Hometex | 13-15 | ⬜ | — | — |
| 4. Vorhang | 16-19 | ⬜ | — | — |
| 5. Admin | 20-22 | ⬜ | — | — |
| 6. Otonom | 23-24 | ⬜ | — | — |

**Her aşama bitince bu tabloyu güncelle: ⬜ → ✅**

---

> **BU EMİR BELGESİ CLAUDE OPUS 4.6 TARAFINDAN, 10+ GEÇMİŞ KONUŞMA,**
> **2 DENETİM RAPORU VE 8 SKILL DOSYASI ANALİZİ SONUCU YAZILMIŞTIR.**
> **HAKAN BEY TARAFINDAN ONAYLANMIŞTIR. SİLİNEMEZ.**
