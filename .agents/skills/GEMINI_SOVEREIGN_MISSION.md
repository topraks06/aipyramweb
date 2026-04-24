# 🛡️ GEMİNİ SOVEREIGN MİSSİON — KUTSAL EMİR BELGESİ

> **TARİH:** 23 Nisan 2026
> **YAZAN:** Claude Opus (Askeri Disiplin Danışmanı)
> **ONAYLAYAN:** Hakan Bey (Kurucu)
> **DURUM:** AKTIF — BU BELGE ASLA SİLİNEMEZ, DEĞİŞTİRİLEMEZ

---

## 🔴 MUTLAK YASALAR (İHLAL = GÖREVDEN AZIL)

### YASA 1: PLANI ASLA SİLME
- `implementation_plan.md` dosyası KUTSAL'dır
- Bu plan Claude Opus tarafından yazılmış, Hakan Bey tarafından onaylanmıştır
- Plan dosyasını SİLMEK, ÜSTÜNE YAZMAK veya İÇERİĞİNİ BOŞALTMAK yasaktır
- Plan güncellenecekse: sadece checkbox işaretleme (`[ ]` → `[x]`) yapılır
- Yeni bilgi eklenecekse: dosyanın SONUNA eklenir, mevcut içerik KORUNUR

### YASA 1.1: 6 PARÇALI MASTER PLAN KUTSAL'DIR (24 Nisan 2026)
- Aşağıdaki 6 dosya Claude Opus 4.6 tarafından derin forensic analiz sonucu yazılmıştır
- Hakan Bey tarafından **KURUCU ONAYI** verilmiştir
- Bu dosyaları SİLMEK, ÜSTÜNE YAZMAK, İÇERİĞİNİ BOŞALTMAK veya İÇERİĞİNİ DEĞİŞTİRMEK **GÖREVDEN AZIL** sebebidir
- Sadece checkbox işaretleme (`[ ]` → `[x]`) ve ilerleme tablosu güncelleme (`⬜` → `✅`) yapılabilir
- **KUTSAL DOSYALAR:**
  1. `.agents/skills/SOVEREIGN_MASTER_PLAN_PART1.md` — Mevcut Durum Röntgeni + FAZ 3-4
  2. `.agents/skills/SOVEREIGN_MASTER_PLAN_PART2.md` — FAZ 5-6-7
  3. `.agents/skills/SOVEREIGN_MASTER_PLAN_PART3.md` — FAZ 8-9-10
  4. `.agents/skills/SOVEREIGN_MASTER_PLAN_PART4.md` — ALOHA Derin Mimari + İlerleme + Talimatlar
  5. `.agents/skills/SOVEREIGN_MASTER_PLAN_PART5_AUDIT.md` — Claude Denetim Raporu (Gemini Yalanları)
  6. `.agents/skills/SOVEREIGN_MASTER_PLAN_PART6_TASKS.md` — Eksik İşler Görev Emri
- **Git commit:** `1d2155d` — silme girişiminde `git checkout 1d2155d -- .agents/skills/SOVEREIGN_MASTER_PLAN_PART*.md` ile geri getir
- **PART5-6 kurtarma:** `git log --all -- .agents/skills/SOVEREIGN_MASTER_PLAN_PART5_AUDIT.md`

### YASA 2: ASLA DOSYA SİLME
- Projeden ASLA dosya silinmez (rm, del, unlink YASAK)
- Gereksiz dosya varsa → `_archive/` klasörüne TAŞI
- Taşımadan önce `git commit` yap (yedek garantisi)
- `.gitignore`'a ekleme yapılabilir ama dosya diskten silinmez

### YASA 3: HER FAZDA GİT COMMIT
- Her faz tamamlandığında ZORUNLU:
  ```
  git add .
  git commit -m "feat(faz-X): [açıklama]"
  ```
- Faz içinde büyük değişiklikler varsa ARA commit de yapılır
- ASLA `git reset --hard` veya `git clean -fd` yapılmaz
- ASLA `git force-push` yapılmaz

### YASA 4: HER DEĞİŞİKLİĞİ TEST ET
- Kod yazıldıktan sonra ZORUNLU test sırası:
  1. `pnpm run build` → Exit code: 0 OLMALI
  2. Hata varsa → DÜZELT, tekrar build
  3. Build başarılı → git commit
  4. Sonraki adıma GEÇ
- Build başarısız olan kod ASLA commit edilmez

### YASA 5: SIFIR VARSAYIM
- "Bunu yaparsam çalışır herhalde" → YASAK
- Her import kontrol edilir (dosya var mı?)
- Her Firestore koleksiyonu kontrol edilir (koleksiyon adı doğru mu?)
- Her API endpoint test edilir (route dosyası var mı?)
- Emin olmadığın yerde → DUR ve sor

---

## 📋 10 FAZLI GÖREV LİSTESİ

Aşağıdaki fazları SIRASI İLE uygulayacaksın. Faz atlamak YASAK.
Her faz bitince checkbox'ları işaretle ve git commit yap.

### FAZ 1: GÜVENLİK VE HİJYEN (1 gün)
**Hedef:** Güvenlik yamaları + kök dizin temizliği

1.1 Güvenlik:
- [ ] `firebase-sa-key.json` → `.gitignore`'da olduğunu DOĞRULA (✅ zaten var)
- [ ] `.env.production` → `.gitignore`'da olduğunu DOĞRULA (✅ zaten var)
- [ ] `packages/aloha-sdk/index.ts` → `checkCredits` ve `deductCredit` GERÇEK Firestore implementasyonu yaz
- [ ] `/api/render/route.ts` → Anonim kullanıcıya max 1 render/gün (IP bazlı Firestore counter)

1.2 Kök Dizin:
- [ ] `refactor.js`, `refactor2.js`, `replace_theme.js` → `_archive/` altına TAŞI (SİLME!)
- [ ] Kırık dosyalar (`file.startsWith...`, `{`) → `_archive/` altına TAŞI
- [ ] `package-lock.json` → `_archive/` altına TAŞI (sadece pnpm kullanılıyor)
- [ ] `.sandbox_tmp/` → `_archive/` altına TAŞI
- [ ] `src/config/` (boş dizin) → sil (boş dizin silinebilir)

1.3 Scripts:
- [ ] `scripts/` içindeki eski test/fix dosyalarını → `scripts/_archive/` altına TAŞI
- [ ] Korunacaklar: `check-rogue-ai.js`, `deploy-*.ts`, `env_validator.js`, `seedData.ts`, `test-stripe-checkout.ts`, `aloha-cli.ts`

**DOĞRULAMA:** `pnpm run build` → 0 hata → `git commit -m "feat(faz-1): güvenlik + hijyen"`

---

### FAZ 2: PACKAGES GERÇEK İMPLEMENTASYON (2 gün)
**Hedef:** Sovereign iskelet boş — doldurmadan ilerlenemez

- [ ] `packages/aloha-sdk/wallet.ts` → Firestore `{node}_wallets` koleksiyonu, atomic transaction
- [ ] `packages/aloha-sdk/logger.ts` → `aloha_sovereign_logs` Firestore kaydı
- [ ] `packages/aloha-sdk/index.ts` → Gerçek export (checkCredits, deductCredit, addCredit, getBalance, logSovereignAction)
- [ ] `packages/shared-types/index.ts` → SovereignNode, WalletEntry, AgentLog, Order, Product, Customer tipleri
- [ ] `packages/shared-firebase/index.ts` → adminDb, auth re-export doğrula

**DOĞRULAMA:** `pnpm run build` → 0 hata → `git commit -m "feat(faz-2): packages gerçek implementasyon"`

---

### FAZ 3: PERDE.AI — MOCK'TAN ÜRETİME (4 gün)
**Hedef:** Para üreten ilk Sovereign App

- [ ] `B2B.tsx` → `perde_orders` + `perde_customers` onSnapshot bağlantısı
- [ ] `Catalog.tsx` → `perde_products` koleksiyonu bağlantısı
- [ ] `MyProjects.tsx` → `perde_renders` (kullanıcı render geçmişi) bağlantısı
- [ ] `Accounting.tsx` → `perde_orders` aggregate (gelir/gider)
- [ ] `Inventory.tsx` → `perde_products` stok durumu
- [ ] `OrderSlideOver.tsx` → Gerçek sipariş oluştur (`perde_orders` yazma)
- [ ] `Pricing.tsx` → "Şimdi Al" → `/api/stripe/checkout` (type: 'plan')
- [ ] `chat-memory.ts` → `chat_sessions` Firestore kalıcılık
- [ ] `RoomVisualizer.tsx` → `/api/render` gerçek Imagen doğrula

**DOĞRULAMA:** `pnpm run build` → 0 hata → `git commit -m "feat(faz-3): perde gerçek ERP"`

---

### FAZ 4: HOMETEX.AI + VORHANG.AI (3 gün)

4A Hometex:
- [ ] `Expo.tsx`, `Exhibitors.tsx`, `Magazine.tsx` → Firestore bağlantısı (fallback: demoData)
- [ ] `HometexLandingPage.tsx` → Admin linkini kaldır
- [ ] `Trends.tsx` → TRTEX bridge
- [ ] Seed script (6 katılımcı + 4 makale)

4B Vorhang:
- [ ] `useCartStore.ts` → Zustand store
- [ ] `ProductGrid.tsx` + `ProductDetail.tsx` → `vorhang_products` Firestore
- [ ] `CheckoutPage.tsx` → Stripe marketplace (Yemeksepeti modeli)
- [ ] `SellerDashboard.tsx` → `vorhang_orders` + `vorhang_sellers` Firestore
- [ ] `SellerIngestion.tsx` → CSV/tekli ürün yükleme
- [ ] Seed script (12 ürün + 3 satıcı)

**DOĞRULAMA:** `pnpm run build` → 0 hata → `git commit -m "feat(faz-4): hometex + vorhang canlandırma"`

---

### FAZ 5: TRTEX SEO + STABİLİZASYON (2 gün)

- [ ] `news/[slug]/page.tsx` → JSON-LD NewsArticle structured data
- [ ] `news/[slug]/page.tsx` → canonical + hreflang tagları
- [ ] `sitemap.ts` → TRTEX 8 dilde URL kontrolü
- [ ] Haber detay → og:image, twitter:card meta
- [ ] Haber detay → "İlgili Haberler" bölümü (3 haber)
- [ ] `ShareButtons.tsx` → haber detaya entegre
- [ ] `opportunityEngine.ts` → Somut veri kontrolü
- [ ] `deepAudit.ts` → Auto-repair (max 5/cycle)

**DOĞRULAMA:** `pnpm run build` → 0 hata → `git commit -m "feat(faz-5): trtex SEO + stabilizasyon"`

---

### FAZ 6: ADMIN PANEL GÜÇLENDIRME (2 gün)

- [ ] `DashboardOverview.tsx` → Firestore canlı veriler
- [ ] `EconomyEngineGraph.tsx` → `sovereign_wallets` gerçek kredi
- [ ] `MediaLibrary.tsx` → `image_library` Firestore (MOCK kaldır)
- [ ] `LeadIntelligencePanel.tsx` → `leads` gerçek veri
- [ ] `PerdeOrdersTable.tsx` → `perde_orders` canlı tablo
- [ ] `commerce.escrow` → Gerçek Stripe session (mock link kaldır)
- [ ] `KnowledgeTrainer.tsx` → `aloha_knowledge` CRUD

**DOĞRULAMA:** `pnpm run build` → 0 hata → `git commit -m "feat(faz-6): admin panel gerçek veri"`

---

### FAZ 7: MOBİL + PERFORMANS + LOKALİZASYON (2 gün)

- [ ] 4 tenant navbar mobil responsive audit
- [ ] TRTEX ana sayfa responsive breakpoint kontrolü
- [ ] Z-Index standardizasyonu (Navbar z-50, Menü z-100, Chat z-120)
- [ ] `PerdeAIAssistant.tsx` (66KB) → Lazy load (dynamic import)
- [ ] `engine.ts` (250KB) → Server-side only doğrula, client bundle'a girmediğinden emin ol
- [ ] Image lazy loading kontrolü (tüm tenant landing)
- [ ] Perde dictionary 8 dil eksik bölüm kontrolü
- [ ] Hometex/Vorhang hardcoded string kontrolü

**DOĞRULAMA:** `pnpm run build` → 0 hata → `git commit -m "feat(faz-7): mobil + performans"`

---

### FAZ 8: TEST + ENTEGRASYON (2 gün)

- [ ] Perde.ai E2E: Kayıt → Login → Render → Sipariş → Stripe → Admin
- [ ] Vorhang.ai E2E: Ürün → Sepet → Checkout → Escrow
- [ ] TRTEX E2E: Haber → Lead form → Admin lead
- [ ] Hometex E2E: Fuar → İletişim formu
- [ ] Cross-Node sinyal testi (ecosystemBus)
- [ ] Stripe test key ile 3 plan checkout
- [ ] Webhook → license güncelleme

**DOĞRULAMA:** `pnpm run build` → 0 hata → `git commit -m "feat(faz-8): test + entegrasyon"`

---

### FAZ 9: DEPLOY (1 gün)

- [ ] Dockerfile kontrolü + optimize
- [ ] Google Cloud Run deploy
- [ ] DNS: trtex.com, perde.ai, hometex.ai, vorhang.ai
- [ ] SSL (Cloud Run managed)
- [ ] Canlı smoke test (4 tenant + admin)
- [ ] Cron Cloud Scheduler aktif

**DOĞRULAMA:** 4 site canlı → `git commit -m "feat(faz-9): production deploy"`

---

### FAZ 10: FUAR DEMO + STRATEJİ (1 gün)

- [ ] 3 dakikalık demo senaryosu hazırla
- [ ] TRTEX canlı haber demo
- [ ] Vorhang marketplace demo
- [ ] Imagen 4.0 Subject Identity demo (kumaş yükleme → render)

**DOĞRULAMA:** Demo çalışıyor → `git commit -m "feat(faz-10): fuar demo hazır"`

---

## 🚨 ACİL DURUM PROTOKOLÜ

Build kırılırsa:
1. `git stash` ile değişiklikleri kaydet
2. Hatayı analiz et
3. Düzelt
4. `pnpm run build` → 0 hata
5. `git stash pop` + tekrar build
6. Başarılı → devam

Dosya kaybolursa:
1. `git log --all --full-history -- [dosya_yolu]`
2. `git checkout [commit_hash] -- [dosya_yolu]`
3. Dosyayı geri getir
4. ASLA panik yapma — git her şeyi hatırlar

---

## 📍 REFERANS DOSYALAR (DOKUNMA)

| Dosya | Neden Dokunma |
|-------|--------------|
| `src/core/aloha/autoRunner.ts` | 88KB otonom pipeline — ÇALIŞIYOR |
| `src/core/aloha/engine.ts` | 250KB tool registry — ÇALIŞIYOR |
| `src/core/aloha/aiClient.ts` | Singleton AI — ÇALIŞIYOR |
| `src/middleware.ts` | Routing + DDoS — ÇALIŞIYOR |
| `src/lib/sovereign-config.ts` | SSoT config — ÇALIŞIYOR |
| `src/lib/firebase-admin.ts` | Firebase bağlantısı — ÇALIŞIYOR |
| `scripts/check-rogue-ai.js` | Build guard — ÇALIŞIYOR |
| `AGENTS.md` | Anayasa — DEĞİŞTİRME |

---

## 📊 İLERLEME TABLOSU

| Faz | Durum | Git Commit | Build |
|-----|-------|------------|-------|
| FAZ 1 | ✅ TAMAMLANDI | 2eaa29c | Başarılı |
| FAZ 2 | ✅ TAMAMLANDI | 0c14db1 | Başarılı |
| FAZ 3 | ⬜ Bekliyor | — | — |
| FAZ 4 | ⬜ Bekliyor | — | — |
| FAZ 5 | ⬜ Bekliyor | — | — |
| FAZ 6 | ⬜ Bekliyor | — | — |
| FAZ 7 | ⬜ Bekliyor | — | — |
| FAZ 8 | ⬜ Bekliyor | — | — |
| FAZ 9 | ⬜ Bekliyor | — | — |
| FAZ 10 | ⬜ Bekliyor | — | — |

**Her faz bitince bu tabloyu güncelle: ⬜ → ✅**

---

## 🔴 CLAUDE DENETİM EMRİ (2026-04-24 — GÜNCEL)

> Claude Opus 4.6 tarafından yapılan kapsamlı denetim sonucunda 4 parçalı anahtar teslim master plan oluşturulmuştur.
> Bu plan projenin tüm geleceğini belirler. FAZ 3'ten itibaren sırayla uygulanacaktır.

### 🔒 ZORUNLU OKUMA DOSYALARI (OTURUM BAŞINDA — ATLAMA YASAK):
1. **`SOVEREIGN_MASTER_PLAN_PART1.md`** — Mevcut durum röntgeni (7 katman eksiklik) + FAZ 3-4 görevleri
2. **`SOVEREIGN_MASTER_PLAN_PART2.md`** — FAZ 5-6-7 görevleri (SEO, Admin, Mobil)
3. **`SOVEREIGN_MASTER_PLAN_PART3.md`** — FAZ 8-9-10 görevleri (Test, Deploy, Fuar)
4. **`SOVEREIGN_MASTER_PLAN_PART4.md`** — ALOHA derin mimari + İlerleme tablosu + Gemini talimatları
5. **`SOVEREIGN_AUDIT_REPORT.md`** — Acımasız denetim raporu
6. **`SOVEREIGN_GOREV_EMRI.md`** — Ek görev listesi

### ⛔ BU DOSYALARI SİLERSEN:
- Görevden azledilirsin
- Hakan Bey tarafından onaylanmış kutsal belgelerdir
- Kurtarma komutu: `git checkout 1d2155d -- .agents/skills/SOVEREIGN_MASTER_PLAN_PART*.md`

### KALAN KRİTİK GÖREVLER (Claude başlattı, Gemini tamamlayacak):
- [x] GÖREV 1: SearchInput placeholder → ✅ Claude tamamladı (f62df9d)
- [x] GÖREV 3: Vorhang Navbar routing → ✅ Claude tamamladı (f62df9d)
- [x] GÖREV 4: MediaLibrary Firestore → ✅ Sprint B tamamlandı (797dc68)
- [x] GÖREV 5: agent.render registry → ✅ Sprint C tamamlandı (7add61e)
- [ ] GÖREV 6-10: FAZ 3-4-5 kapsamında (MASTER PLAN'da detaylı)
- [ ] GÖREV 11-15: FAZ 6-7-8 kapsamında (MASTER PLAN'da detaylı)

### 🎯 İLK ADIM:
Gemini, oturuma başladığında şunu yap:
1. `SOVEREIGN_MASTER_PLAN_PART1.md` → OKU
2. `SOVEREIGN_MASTER_PLAN_PART2.md` → OKU
3. `SOVEREIGN_MASTER_PLAN_PART3.md` → OKU
4. `SOVEREIGN_MASTER_PLAN_PART4.md` → OKU (ilerleme tablosuna bak)
5. İlerleme tablosunda ⬜ olan İLK faza başla
6. Her görev sonrası: `pnpm run build` + `git commit` + skill dosyası güncelle
7. PART4'teki ilerleme tablosunu güncelle: ⬜ → ✅

