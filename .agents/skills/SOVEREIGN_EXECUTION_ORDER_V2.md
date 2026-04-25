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
- [ ] `src/hooks/useSovereignAuth.ts` → AÇ, OKU. `loginWithEmail`, `registerMember`, `loginWithGoogle` fonksiyonları Firebase Auth'a gerçekten bağlı mı?
- [ ] `src/components/node-perde/auth/Login.tsx` → `loginWithEmail` çağrısı sonucu doğru yönlendirme yapıyor mu?
- [ ] `src/components/node-perde/auth/Register.tsx` → `registerDealer` çağrısı Firestore'a kullanıcı kaydı yazıyor mu?
- [ ] `src/app/sites/[domain]/login/page.tsx` → Doğru bileşeni render ediyor mu?
- [ ] Tarayıcıdan `localhost:3000/sites/perde.ai/login` aç, test et.
- **KANIT:** `___`
- **BUILD:** `pnpm run build` → `___`
- **COMMIT:** `git commit -m "audit(sprint-1): perde auth doğrulama"`

### Sprint 2: Tasarım Motoru — Visualizer (EN KRİTİK)
- [ ] `src/components/node-perde/RoomVisualizer.tsx` (42KB) → AÇ, OKU. Kumaş yükleme (`handleImageUpload`) çalışıyor mu? `fetch('/api/render')` doğru endpoint'e gidiyor mu?
- [ ] `src/app/api/render/route.ts` → AÇ, OKU. Imagen API çağrısı var mı? API key doğru mu? Hata yönetimi var mı?
- [ ] Rate limiting (anonim kullanıcıya max 1 render/gün) aktif mi?
- [ ] `src/components/node-perde/Img2ImgVisualizer.tsx` (20KB) → Template seçimi + kumaş giydirme akışı tamamlanmış mı?
- [ ] Tarayıcıdan `localhost:3000/sites/perde.ai/visualizer` aç, test et.
- **KANIT:** `___`
- **BUILD:** `pnpm run build` → `___`
- **COMMIT:** `git commit -m "audit(sprint-2): perde tasarım motoru doğrulama"`

### Sprint 3: Studio Sayfası
- [ ] `src/components/node-perde/studio/` → Tüm dosyaları listele ve oku
- [ ] `StudioLayout.tsx` → Auth guard çalışıyor mu? Giriş yapmamış kullanıcıyı login'e yönlendiriyor mu?
- [ ] Studio sayfaları (`/sites/perde.ai/studio`) tamamlanmış mı?
- [ ] Tarayıcıdan test et.
- **KANIT:** `___`
- **BUILD:** `pnpm run build` → `___`
- **COMMIT:** `git commit -m "audit(sprint-3): perde studio doğrulama"`

### Sprint 4: Katalog & Ürünler
- [ ] `src/components/node-perde/Catalog.tsx` → `perde_products` Firestore koleksiyonundan veri çekiyor mu? `onSnapshot` mı `getDocs` mı?
- [ ] Koleksiyonda veri yoksa kullanıcıya ne gösteriyor? Boş ekran mı, "ürün yok" mesajı mı?
- [ ] Tarayıcıdan `localhost:3000/sites/perde.ai/catalog` test et.
- **KANIT:** `___`
- **BUILD:** `pnpm run build` → `___`
- **COMMIT:** `git commit -m "audit(sprint-4): perde katalog doğrulama"`

### Sprint 5: B2B & Sipariş Akışı
- [ ] `src/components/node-perde/B2B.tsx` (20KB) → `perde_orders` ve `perde_customers` onSnapshot bağlantısı var mı?
- [ ] `src/components/node-perde/OrderSlideOver.tsx` (18KB) → Sipariş oluşturma Firestore'a yazıyor mu?
- [ ] `src/app/api/perde/orders/` → API route var mı, ne yapıyor?
- [ ] Tarayıcıdan `localhost:3000/sites/perde.ai/b2b` test et.
- **KANIT:** `___`
- **BUILD:** `pnpm run build` → `___`
- **COMMIT:** `git commit -m "audit(sprint-5): perde b2b sipariş doğrulama"`

### Sprint 6: ERP (Muhasebe + Stok)
- [ ] `src/components/node-perde/Accounting.tsx` → `perde_orders` aggregate hesabı doğru mu?
- [ ] `src/components/node-perde/Inventory.tsx` → `perde_products` stok verisi nereden geliyor?
- [ ] `src/components/node-perde/MyProjects.tsx` → `perde_renders` geçmişi çalışıyor mu?
- **KANIT:** `___`
- **BUILD:** `pnpm run build` → `___`
- **COMMIT:** `git commit -m "audit(sprint-6): perde ERP doğrulama"`

### Sprint 7: Ödeme (Stripe)
- [ ] `src/components/node-perde/Pricing.tsx` → "Şimdi Al" butonu `/api/stripe/checkout` tetikliyor mu?
- [ ] `src/app/api/stripe/checkout/route.ts` → Stripe test key kullanıyor mu? Session oluşturuyor mu?
- [ ] Webhook route var mı? Lisans güncelleme çalışıyor mu?
- **KANIT:** `___`
- **BUILD:** `pnpm run build` → `___`
- **COMMIT:** `git commit -m "audit(sprint-7): perde stripe doğrulama"`

### Sprint 8: AI Asistan (Chat)
- [ ] `src/components/node-perde/PerdeAIAssistant.tsx` (68KB) → Chat mesaj gönderme çalışıyor mu? Hangi API'ye istek atıyor?
- [ ] `src/lib/chat-memory.ts` → Konuşma geçmişi Firestore'a kaydediliyor mu?
- [ ] Dijital İkiz (tenant AI) mantığı: Kullanıcı sadece kendi verisini görebiliyor mu?
- **KANIT:** `___`
- **BUILD:** `pnpm run build` → `___`
- **COMMIT:** `git commit -m "audit(sprint-8): perde AI asistan doğrulama"`

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
