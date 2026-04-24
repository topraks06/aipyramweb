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
- [x] `firebase-sa-key.json` → `.gitignore`'da olduğunu DOĞRULA (✅ zaten var)
- [x] `.env.production` → `.gitignore`'da olduğunu DOĞRULA (✅ zaten var)
- [x] `packages/aloha-sdk/index.ts` → `checkCredits` ve `deductCredit` GERÇEK Firestore implementasyonu yaz
- [x] `/api/render/route.ts` → Anonim kullanıcıya max 1 render/gün (IP bazlı Firestore counter)

1.2 Kök Dizin:
- [x] `refactor.js`, `refactor2.js`, `replace_theme.js` → `_archive/` altına TAŞI (SİLME!)
- [x] Kırık dosyalar (`file.startsWith...`, `{`) → `_archive/` altına TAŞI
- [x] `package-lock.json` → `_archive/` altına TAŞI (sadece pnpm kullanılıyor)
- [x] `.sandbox_tmp/` → `_archive/` altına TAŞI
- [x] `src/config/` (boş dizin) → sil (boş dizin silinebilir)

1.3 Scripts:
- [x] `scripts/` içindeki eski test/fix dosyalarını → `scripts/_archive/` altına TAŞI
- [x] Korunacaklar: `check-rogue-ai.js`, `deploy-*.ts`, `env_validator.js`, `seedData.ts`, `test-stripe-checkout.ts`, `aloha-cli.ts`

**DOĞRULAMA:** `pnpm run build` → 0 hata → `git commit -m "feat(faz-1): güvenlik + hijyen"`

---

### FAZ 2: PACKAGES GERÇEK İMPLEMENTASYON (2 gün)
**Hedef:** Sovereign iskelet boş — doldurmadan ilerlenemez

- [x] `packages/aloha-sdk/wallet.ts` → Firestore `{node}_wallets` koleksiyonu, atomic transaction
- [x] `packages/aloha-sdk/logger.ts` → `aloha_sovereign_logs` Firestore kaydı
- [x] `packages/aloha-sdk/index.ts` → Gerçek export (checkCredits, deductCredit, addCredit, getBalance, logSovereignAction)
- [x] `packages/shared-types/index.ts` → SovereignNode, WalletEntry, AgentLog, Order, Product, Customer tipleri
- [x] `packages/shared-firebase/index.ts` → adminDb, auth re-export doğrula

**DOĞRULAMA:** `pnpm run build` → 0 hata → `git commit -m "feat(faz-2): packages gerçek implementasyon"`

---

### FAZ 3: PERDE.AI — MOCK'TAN ÜRETİME (4 gün)
**Hedef:** Para üreten ilk Sovereign App

- [x] `B2B.tsx` → `perde_orders` + `perde_customers` onSnapshot bağlantısı
- [x] `Catalog.tsx` → `perde_products` koleksiyonu bağlantısı
- [x] `MyProjects.tsx` → `perde_renders` (kullanıcı render geçmişi) bağlantısı
- [x] `Accounting.tsx` → `perde_orders` aggregate (gelir/gider)
- [x] `Inventory.tsx` → `perde_products` stok durumu
- [x] `OrderSlideOver.tsx` → Gerçek sipariş oluştur (`perde_orders` yazma)
- [x] `Pricing.tsx` → "Şimdi Al" → `/api/stripe/checkout` (type: 'plan')
- [x] `chat-memory.ts` → `chat_sessions` Firestore kalıcılık
- [x] `RoomVisualizer.tsx` → `/api/render` gerçek Imagen doğrula

**DOĞRULAMA:** `pnpm run build` → 0 hata → `git commit -m "feat(faz-3): perde gerçek ERP"`

---

### FAZ 4: HOMETEX.AI + VORHANG.AI (3 gün)

4A Hometex:
- [x] `Expo.tsx`, `Exhibitors.tsx`, `Magazine.tsx` → Firestore bağlantısı (fallback: demoData)
- [x] `HometexLandingPage.tsx` → Admin linkini kaldır
- [x] `Trends.tsx` → TRTEX bridge
- [x] Seed script (6 katılımcı + 4 makale)

4B Vorhang:
- [x] `useCartStore.ts` → Zustand store
- [x] `ProductGrid.tsx` + `ProductDetail.tsx` → `vorhang_products` Firestore
- [x] `CheckoutPage.tsx` → Stripe marketplace (Yemeksepeti modeli)
- [x] `SellerDashboard.tsx` → `vorhang_orders` + `vorhang_sellers` Firestore
- [x] `SellerIngestion.tsx` → CSV/tekli ürün yükleme
- [x] Seed script (12 ürün + 3 satıcı)

**DOĞRULAMA:** `pnpm run build` → 0 hata → `git commit -m "feat(faz-4): hometex + vorhang canlandırma"`

---

### FAZ 5: TRTEX SEO + STABİLİZASYON (2 gün)

- [x] `news/[slug]/page.tsx` → JSON-LD NewsArticle structured data
- [x] `news/[slug]/page.tsx` → canonical + hreflang tagları
- [x] `sitemap.ts` → TRTEX 8 dilde URL kontrolü
- [x] Haber detay → og:image, twitter:card meta
- [x] Haber detay → "İlgili Haberler" bölümü (3 haber)
- [x] `ShareButtons.tsx` → haber detaya entegre
- [x] `opportunityEngine.ts` → Somut veri kontrolü
- [x] `deepAudit.ts` → Auto-repair (max 5/cycle)

**DOĞRULAMA:** `pnpm run build` → 0 hata → `git commit -m "feat(faz-5): trtex SEO + stabilizasyon"`

---

### FAZ 6: ADMIN PANEL GÜÇLENDIRME (2 gün)

- [x] `DashboardOverview.tsx` → Firestore canlı veriler
- [x] `EconomyEngineGraph.tsx` → `sovereign_wallets` gerçek kredi
- [x] `MediaLibrary.tsx` → `image_library` Firestore (MOCK kaldır)
- [x] `LeadIntelligencePanel.tsx` → `leads` gerçek veri
- [x] `PerdeOrdersTable.tsx` → `perde_orders` canlı tablo
- [x] `commerce.escrow` → Gerçek Stripe session (mock link kaldır)
- [x] `KnowledgeTrainer.tsx` → `aloha_knowledge` CRUD

**DOĞRULAMA:** `pnpm run build` → 0 hata → `git commit -m "feat(faz-6): admin panel gerçek veri"`

---

### FAZ 7: MOBİL + PERFORMANS + LOKALİZASYON (2 gün)

- [x] 4 tenant navbar mobil responsive audit
- [x] TRTEX ana sayfa responsive breakpoint kontrolü
- [x] Z-Index standardizasyonu (Navbar z-50, Menü z-100, Chat z-120)
- [x] `PerdeAIAssistant.tsx` (66KB) → Lazy load (dynamic import)
- [x] `engine.ts` (250KB) → Server-side only doğrula, client bundle'a girmediğinden emin ol
- [x] Image lazy loading kontrolü (tüm tenant landing)
- [x] Perde dictionary 8 dil eksik bölüm kontrolü
- [x] Hometex/Vorhang hardcoded string kontrolü

**DOĞRULAMA:** `pnpm run build` → 0 hata → `git commit -m "feat(faz-7): mobil + performans"`

---

### FAZ 8: TEST + ENTEGRASYON (2 gün)

- [x] Perde.ai E2E: Kayıt → Login → Render → Sipariş → Stripe → Admin
- [x] Vorhang.ai E2E: Ürün → Sepet → Checkout → Escrow
- [x] TRTEX E2E: Haber → Lead form → Admin lead
- [x] Hometex E2E: Fuar → İletişim formu
- [x] Cross-Node sinyal testi (ecosystemBus)
- [x] Stripe test key ile 3 plan checkout
- [x] Webhook → license güncelleme

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

- [x] 3 dakikalık demo senaryosu hazırla
- [x] TRTEX canlı haber demo
- [x] Vorhang marketplace demo
- [x] Imagen 4.0 Subject Identity demo (kumaş yükleme → render)

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
| FAZ 3 | ✅ TAMAMLANDI | 4598731 | Başarılı |
| FAZ 4 | ✅ TAMAMLANDI | e169552 | Başarılı |
| FAZ 5 | ✅ TAMAMLANDI | 045db29 | Başarılı |
| FAZ 6 | ✅ TAMAMLANDI | e169552 | Başarılı |
| FAZ 7 | ✅ TAMAMLANDI | e169552 | Başarılı |
| FAZ 8 | ✅ TAMAMLANDI | e169552 | Başarılı |
| FAZ 9 | ⏸️ İPTAL | Sadece Local Test Yapılacak | — |
| FAZ 10 | ✅ TAMAMLANDI | Seed verileri eklendi | — |

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
- [x] GÖREV 6-10: FAZ 3-4-5 kapsamında (MASTER PLAN'da detaylı)
- [x] GÖREV 11-15: FAZ 6-7-8 kapsamında (MASTER PLAN'da detaylı)

### 🎯 İLK ADIM:
Gemini, oturuma başladığında şunu yap:
1. `SOVEREIGN_MASTER_PLAN_PART1.md` → OKU
2. `SOVEREIGN_MASTER_PLAN_PART2.md` → OKU
3. `SOVEREIGN_MASTER_PLAN_PART3.md` → OKU
4. `SOVEREIGN_MASTER_PLAN_PART4.md` → OKU (ilerleme tablosuna bak)
5. İlerleme tablosunda ⬜ olan İLK faza başla
6. Her görev sonrası: `pnpm run build` + `git commit` + skill dosyası güncelle
7. PART4'teki ilerleme tablosunu güncelle: ⬜ → ✅

