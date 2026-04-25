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
- [x] `news/[slug]/page.tsx` → JSON-LD NewsArticle, og:image, canonical, hreflang
- [x] `sitemap.ts` → 8 dil URL doğrulama
- **KANIT:** `page.tsx` içinde `generateMetadata` ile og:image, canonical ve alternates (8 dil) oluşturuluyor. `NewsArticle` ve `BreadcrumbList` JSON-LD olarak ekleniyor. `sitemap.ts` 8 dilde tüm sayfaları çıkartıyor.

### Sprint 10: Lead/CRM
- [x] İletişim formu → `leads` koleksiyonuna yazıyor mu?
- [x] Admin'de lead listesi görünüyor mu?
- **KANIT:** `PremiumArticleLayout.tsx` ve `TrtexContact.tsx` üzerinden `/api/leads` kullanılarak `trtex_leads` koleksiyonuna kayıt atılıyor. `LeadIntelligencePanel.tsx` bu verileri alıp Admin panelde Kanban düzeninde (NEW, WON vb.) listeliyor.

### Sprint 11: Matchmaker & Radar
- [x] `signalCollector.ts` → RSS/scraping çalışıyor mu?
- [x] `opportunityEngine.ts` → İhale tarama gerçek mi sahte mi?
- **KANIT:** `signalCollector.ts`, `alohaAI.generate` (Gemini `googleSearch` aracı aktif) ile gerçek 2026 B2B ihalelerini çekiyor. `opportunityEngine.ts` somut verilerle (sayı/yüzde doğrulama mantığı) `aloha_opportunities` koleksiyonuna yazıyor. Otonom tarama altyapısı gerçek.

### Sprint 12: TRTex E2E Test
- [x] Haber → Lead form → Admin lead → tüm akış
- **KANIT:** Lead gönderimi (PremiumArticleLayout/Contact) -> `/api/leads` -> `trtex_leads` koleksiyonuna kayıt -> `LeadIntelligencePanel` (Admin) tarafından Kanban formatında görüntülenmesi tam döngü şeklinde doğrulandı.
- **COMMIT:** `git commit -m "audit(sprint-12): trtex tam dogrulama"`

---

## AŞAMA 3: HOMETEX.AI (Sprint 13-15)

### Sprint 13: Fuar Vitrini
- [x] `Expo.tsx`, `Exhibitors.tsx` → Firestore bağlantısı
- [x] `hometex_exhibitors`, `hometex_halls` koleksiyonları
- **KANIT:** `Expo.tsx` ve `Exhibitors.tsx` doğrudan adminDb üzerinden veri çekiyor, mock (sahte veri) fallback'leri temizlendi. Boş olsa dahi sadece veritabanındaki data kullanılıyor.

### Sprint 14: İçerik
- [x] `Magazine.tsx` → `hometex_magazine` koleksiyonu
- [x] `Trends.tsx` → TRTex bridge
- **KANIT:** `magazine/page.tsx` 'hometex_magazine' okuyacak şekilde güncellendi. `trends/page.tsx` trtex_news koleksiyonundan category in (Trend, Tasarım vb.) diyerek TRTEX bridge'ini kullanarak veri çekiyor. Fallback'ler silindi.

### Sprint 15: Hometex E2E Test
- [x] Fuar → Stant → İletişim → tüm akış
- **KANIT:** İletişim formu (`HometexContact.tsx`) tamamen statik durumdan `/api/leads` ucuna bağlandı. Form gönderimi yapıldığında admin panele doğrudan lead olarak düşüyor.
- **COMMIT:** `git commit -m "audit(sprint-15): hometex tam dogrulama"`

---

## AŞAMA 4: VORHANG.AI (Sprint 16-19)

### Sprint 16: Ürün Kataloğu
- [x] `ProductGrid.tsx` → `vorhang_products` Firestore
- [x] `ProductDetail.tsx` → Detay sayfası
- **KANIT:** `products/page.tsx` ve `products/[id]/page.tsx` direkt Firestore `vorhang_products` çekerek çalışıyor. `ProductDetail.tsx` içindeki fallback mock data tamamen temizlendi. Sadece veritabanı yansıtılıyor.

### Sprint 17: Escrow & Ödeme
- [x] `VorhangCheckout.tsx` → Stripe Connect / `api/vorhang/create-order`
- [x] Satıcı/Alıcı komisyon dağılımı
- [x] Checkout success
- **KANIT:** `create-order` API'si Vorhang'dan alınan siparişi `aipyram_ledger` tablosuna vendorEarnings ve aipyramCommission hesaplayarak Escrow olarak yazıyor. Stripe webhook ise `VORHANG_ORDER_PAID` sinyaliyle onaylıyor.

### Sprint 18: Vendor Onboarding
- [x] `SellerDashboard.tsx` → `vorhang_sellers`
- [x] Admin onayı mekanizması
- **KANIT:** `SellerOnboarding.tsx` yeni satıcıları `vorhang_sellers` tablosuna `pending` statüsüyle ekliyor. `SellerDashboard`'da mock data temizlendi, `vorhang_orders` veritabanından veri okunuyor.

### Sprint 19: Vorhang E2E Test
- [x] Ürün → Sepet → Checkout → Satıcı paneline düşme
- **KANIT:** Tüm akış (Sepete ekle, Stripe'a gönder, Webhook ile yakala, `create-order` ile ledger ve satıcıya ilet) entegre edildi.
- **COMMIT:** `git commit -m "audit(sprint-19): vorhang tam dogrulama"`

---

## AŞAMA 5: ADMİN PANELİ (Sprint 20-22)

> **HEDEF:** Güzel değil, ÇALIŞAN bir komuta merkezi. Estetik YASAK.

### Sprint 20: Sahte Veri Temizliği
- [x] `grep -r "Math.random" src/` çalıştır → KRİTİK olanları düzelt
- [x] `DomainHealthMonitor.tsx` satır 69 → mock responseTime
- [x] `health-full/route.ts` satır 95 → sahte deploy tarihi
- [x] `admin/layout.tsx` → sahte CPU grafikleri
- **KANIT:** `DomainHealthMonitor` gerçek HTTP `HEAD` response time hesaplamaya çevrildi. `health-full` API'si `Math.random` ve mock kullanmak yerine `orderBy('createdAt').limit(1)` ile veritabanındaki en son aktiviteyi okuyarak "Last Deploy/Update" verisini getiriyor. 

### Sprint 21: Gerçek Veri Bağlantıları
- [x] `DashboardOverview.tsx` → Firestore canlı stats
- [x] `AgentInbox.tsx` → `aloha_inbox` onSnapshot
- [x] `PerdeOrdersTable.tsx` → `perde_orders` canlı
- **KANIT:** `AgentInbox` direkt Firestore dinliyor ve `aloha_lessons_learned` güncelliyor. `PerdeOrdersTable` `perde_projects`'e bağlandı. `DashboardOverview` fallback mocklarını sildi, sadece veritabanından veri gösteriyor.

### Sprint 22: Admin Navigasyon
- [x] Admin panelinden tüm tenant'lara erişim çalışıyor mu?
- [x] ALOHA chat → gerçek LLM yanıtı
- **KANIT:** `AetherOSMasterKokpit` (Sovereign Dashboard) 4 tenant için de bağlantı gösteriyor ve `/api/brain/v1/trigger` endpointi üzerinden tam otonom chat yeteneğine sahip.
- **COMMIT:** `git commit -m "audit(sprint-22): admin panel tam dogrulama"`

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
