# 🤖 GEMİNİ MASTER SKILL — AIPyram Sovereign Ecosystem Builder v3.0

> **Tarih:** 23 Nisan 2026 | **Deadline:** 19 Mayıs 2026 (Fuar)
> **Hedef:** 4 proje %90 çalışır seviyeye. Mock'lardan kurtuluş. Canlıda çalışan sistem.
> **Kural:** Tüm projeler EŞİT muamele görür. "Dokunma" kuralı YOKTUR.
> **Projeler:** AIPyram (Master) + TRTEX + Perde.ai + Hometex.ai + Vorhang.ai

---

## 🏗️ MİMARİ KURALLAR

### Mutlak Yasalar
1. `pnpm` kullan, `npm`/`yarn` değil
2. Her iş bittiğinde `pnpm run build` → Exit code: 0 olmalı
3. TailwindCSS 4 + Radix UI
4. `force-dynamic` → tüm sayfalarda cache yok
5. Firestore Admin SDK → `import { adminDb } from '@/lib/firebase-admin'`
6. Client bileşenlerinde → `'use client'` direktifi
7. Tüm görseller `referrerPolicy="no-referrer"` ile
8. Google-native altyapı → 3. parti (Redis, AWS, Vercel, Pinecone) YASAK
9. Sadece Gemini modelleri kullan (gemini-2.5-flash veya gemini-2.0-flash)
10. B2C içerik YASAK — tüm içerik B2B odaklı

### Dosya Konumları
```
Bileşenler:     src/components/tenant-{name}/
Sayfalar:       src/app/sites/[domain]/{route}/page.tsx
API'ler:        src/app/api/
Servisler:      src/services/
Tipler:         src/types/
i18n:           src/i18n/
Config:         src/config/tenants.ts  ← SSoT Tenant Registry
Hooks:          src/hooks/
Lib:            src/lib/
Core/Aloha:     src/core/aloha/
Events:         src/core/events/
Store:          src/store/
```

### Tenant Domain Haritası (middleware.ts)
```
trtex.localhost:3000    → /sites/trtex.com/
perde.localhost:3000    → /sites/perde.ai/
hometex.localhost:3000  → /sites/hometex.ai/
vorhang.localhost:3000  → /sites/vorhang.ai/
localhost:3000          → AIPyram Master Node
```

---

## 🧹 FAZ 0: BÜYÜK TEMİZLİK

### Silinecek Kök Dosyalar (40+)
```
SİL: fix.js, fix_engine.js, fix_route.js, fix_ts.js, fix-doc.ts
SİL: test-compose.ts, test-firebase.mjs, test-image.ts, test-queue.js, test-queue.ts, test-signal.ts, test-update.ts
SİL: batch-repair.mjs, check-status.mjs, audit-images.mjs, seed-fairs.mjs
SİL: migrate.js, execute_migration.js, check_db.ts, reset-queue.ts
SİL: run-trtex.ts, run_agent.ts, runArchiveMender.ts, scaffold_projects.ts, scratch_terminal.js
SİL: generate_corporate_pages.ts
SİL: app.sql, commercial_tables.sql, payload_out.csv
SİL: build.log, tsc.log, tsc_output.txt, deploy_error.log, deploy_fail.txt, evidence.txt, news_audit.txt, evidence_report.md
SİL: TRTEX_MOTORUNU_CALISTIR.bat, start_autonomous_brain.bat
SİL: ecosystem.config.js, ecosystem.config.cjs
SİL: cloud-run-env.yaml, .cloud-env-temp.yaml, env.yaml
SİL: aloha_final_report.json, aloha_test_result.json
SİL: error.html
```

### Silinecek Dizinler
```
SİL: hometex-backup/       (tam proje kopyası)
SİL: aloha-core/           (eski ajan motoru + node_modules)
SİL: _ARCHIVE_LEGACY/      (22 eski hata logu)
SİL: _ARCHIVE/             (eski beyin dosyaları)
SİL: .archive/             (fix scriptleri)
SİL: .sandbox_tmp/         (boş dizin)
SİL: auth/                 (kök — eski Supabase SQL'leri)
SİL: src/_backup/          (eski admin backup)
SİL: src/components/perde/  (tek dosya, tenant-perde var)
SİL: src/components/hometex/ (catalog/seller, tenant-hometex var)
SİL: src/components/vorhang/ (checkout, tenant-vorhang var)
SİL: src/components/didimemlak/ (arşivlendi)
SİL: cloud_worker/         (kullanılmıyor)
SİL: data/                 (kontrol et, gereksizse sil)
SİL: messages/             (kontrol et, gereksizse sil)
SİL: logs/                 (eski loglar)
SİL: scratch/              (ts_errors.txt)
```

### Silinecek Kök MD Dosyaları (Artık Skill Dosyasında Birleşti)
```
SİL: DEVAM_PLANI.md, GEMINI_GOREV_PLANI.md, AIPYRAM_ENGINE_MATRIX.md, AIPYRAM_MANIFEST.md, AIPYRAM_MASTER_SKILL_FILE.md, ADMIN_SETUP.md
SAKLA: README.md, AGENTS.md (anayasa)
```

### Middleware Temizliği
`src/middleware.ts` → didimemlak, fethiye, heimtex, immobiliens domain mapping'lerini SİL.
Sadece: trtex, perde, hometex, vorhang kalacak.

### package.json Temizliği
- `@upstash/ratelimit` ve `@upstash/redis` kaldır (Google-native, kullanılmıyor)
- `worker`, `aloha:worker`, `nexus:start` scriptlerini kaldır (cloud_worker silindi)

### 🏛️ SOVEREIGN İSKELET (Soft Sovereign — Bugün Bitmeli)

**STRATEJİ:** Mevcut Next.js uygulamasına DOKUNMA. Sadece yanına `packages/` dizini ekle.
Ortak kodları buraya referansla. Gelecekte tenant ayırma bu iskeletten doğar.

**ADIM 1:** `pnpm-workspace.yaml` oluştur (kök dizin)
```yaml
packages:
  - "packages/*"
```

**ADIM 2:** Kök `package.json`'a workspace ekle — mevcut içeriği KORU, sadece ekle:
```json
{
  "private": true,
  "workspaces": ["packages/*"]
}
```
> ⚠️ Mevcut dependencies, scripts vs HEPSİ kalacak. Sadece workspaces alanı ekleniyor.

**ADIM 3:** Shared packages oluştur (boş iskelet — içi FAZ 1'de doldurulacak):
```
packages/
├── shared-types/
│   ├── package.json   {"name": "@aipyram/types", "version": "0.0.1", "main": "index.ts"}
│   └── index.ts       // Tenant, Signal, Agent, Wallet type'ları — src/types/'tan taşınacak
├── shared-firebase/
│   ├── package.json   {"name": "@aipyram/firebase", "version": "0.0.1", "main": "index.ts"}
│   └── index.ts       // firebase-admin + firebase-client wrapper — src/lib/'den taşınacak
├── shared-config/
│   ├── package.json   {"name": "@aipyram/config", "version": "0.0.1", "main": "index.ts"}
│   └── index.ts       // tenants.ts + i18n config — src/config/'dan taşınacak
└── aloha-sdk/
    ├── package.json   {"name": "@aipyram/aloha-sdk", "version": "0.0.1", "main": "index.ts"}
    └── index.ts       // invokeAgent, EventBus, WalletService — src/lib/aloha/'dan taşınacak
```

> **ÖNEMLİ:** FAZ 0'da sadece boş iskelet oluşturulur.
> İçerik taşıma FAZ 1'de yapılır (ortak servisleri packages'a taşı).
> Mevcut src/ importları ŞİMDİLİK değişmez — hiçbir şey bozulmaz.

**ADIM 4:** `tsconfig.json`'a path alias ekle:
```json
{
  "compilerOptions": {
    "paths": {
      "@aipyram/types": ["./packages/shared-types/index.ts"],
      "@aipyram/firebase": ["./packages/shared-firebase/index.ts"],
      "@aipyram/config": ["./packages/shared-config/index.ts"],
      "@aipyram/aloha-sdk": ["./packages/aloha-sdk/index.ts"]
    }
  }
}
```

### Doğrulama
- `pnpm run build` → Exit code: 0
- `packages/` dizini oluşmuş, 4 alt paket var
- Mevcut hiçbir import bozulmamış

---

## 🧠 FAZ 1: AIPyram Master Node (3-5 gün)

### 1.1 Admin Panel Güçlendirme
**Dosya:** `src/app/admin/page.tsx` + `src/components/admin/`
- Dashboard overview: 4 proje durumu, toplam kullanıcı, sinyal sayısı, son aksiyonlar
- `/admin/users` → Tenant bazlı kullanıcı listesi (perde_members, hometex_members vb.)
- `/admin/tenants` → Tenant sağlık monitörü (build durumu, DB bağlantısı, son sinyal)

### 1.2 ALOHA Sovereign Brain
- `src/lib/aloha/registry.ts` → In-memory → Firestore kalıcı kayıt
- `src/lib/aloha/WalletService.ts` → **YENİ** Merkezi kredi kontrol/düşme
- `invokeAgent()` → Feature Flag kontrol + Wallet kontrol + Firestore log

### 1.3 Ortak Servisler (Tüm Tenant'lar İçin)
- `src/services/stripeService.ts` → Stripe checkout + subscription + webhook (mevcut, tamamla)
- `src/app/api/stripe/checkout/route.ts` → **YENİ**
- `src/app/api/stripe/webhook/route.ts` → **YENİ**
- `src/services/notificationService.ts` → Gmail SMTP email (mevcut, test et)
- `src/lib/chat-memory.ts` → Chat hafıza (mevcut, güçlendir)

### 1.4 Ecosystem Bus
- `src/core/events/ecosystemBus.ts` → Tam çalışır (mevcut, test et)
- `src/app/api/system/signals/route.ts` → **YENİ** GET/POST sinyal API

### Doğrulama
- Admin paneli render, Stripe endpoint çalışır, sinyal API cevap verir
- `pnpm run build` → Exit code: 0

---

## 📡 FAZ 2: TRTEX Stabilizasyon (2-3 gün)

**TRTEX artık dokunulmaz DEĞİL.** Düzelt, iyileştir, güçlendir.

### 2.1 deepAudit Onarım Döngüsü
**Dosya:** `src/core/aloha/autoRunner.ts`
- deepAudit sonrası kritik onarımları otomatik uygula (max 5/cycle)
- Onarım tipleri: replace_image, fix_slug, add_images, fill_content

### 2.2 Opportunity Engine
**Dosya:** `src/core/aloha/opportunityEngine.ts`
- Somut veri (sayı, yüzde, tarih) → ZORLA fırsat üret
- Soyut sinyal → SKIP
- Her fırsatta en az 1 tool zorunlu

### 2.3 IQ Tracking
**Dosya:** `src/core/aloha/terminalPayloadBuilder.ts`
- Payload sonrası `trtex_iq_history` koleksiyonuna kayıt
- `autoRunner.ts` → Son 3 cycle IQ < 60 → alarm

### 2.4 Premium Rapor Sayfası
**Dosya:** `src/app/sites/[domain]/premium/page.tsx` → **YENİ**
- `trtex_intelligence/weekly_report` Firestore'dan oku
- Ana sayfadaki hardcoded metin → payload'dan oku

### 2.5 Pointer Koleksiyonları
- Haberleri kategorize et → `trtex_radar`, `trtex_academy`, `trtex_opportunities` koleksiyonlarına yaz

### Doğrulama
- Premium sayfa 200 OK, IQ kaydı Firestore'da, pointer sayfalarında veri var
- `pnpm run build` → Exit code: 0

---

## 🎨 FAZ 3: Perde.ai — Gerçek ERP (4-5 gün)

### Mock'tan Kurtulma Listesi
| Bileşen | Şu An | Hedef |
|---------|-------|-------|
| B2B.tsx | Mock sipariş verisi | Firestore `perde_orders` |
| Catalog.tsx | Mock ürünler | Firestore `products` |
| MyProjects.tsx | Mock projeler | Firestore `render_history` |
| Accounting.tsx | Mock fatura | Firestore `perde_invoices` |
| Inventory.tsx | Mock stok | Firestore `products` + stok |
| RoomVisualizer.tsx | setTimeout simülasyon | `/api/render` gerçek Imagen |
| OrderSlideOver.tsx | Statik JSON | Firestore sipariş akışı |

### Yeni Oluşturulacak
- `/api/render/route.ts` → Imagen 3.0 + Vision AI (mevcut iskelet, tamamla)
- `src/lib/trtex-bridge.ts` → getWeeklyDigest() güçlendir (mevcut, az veri çekiyor)
- Chat hafıza → `/api/chat/route.ts`'e session entegrasyonu
- Pricing.tsx → Stripe checkout URL bağlantısı

### Doğrulama
- Login → B2B panel gerçek veri gösteriyor
- Chat hafızası korunuyor (sayfa kapat/aç → geçmiş var)
- `pnpm run build` → Exit code: 0

---

## 🏠 FAZ 4A: Hometex.ai (2 gün)

### Firestore'a Geçiş
| Bileşen | Mock Kaynak | Hedef Firestore |
|---------|-------------|-----------------|
| HometexLandingPage | demoData.ts | `exhibitors` + `articles` |
| Expo.tsx | demoData.ts | `exhibitors` |
| Exhibitors.tsx | demoData.ts | `exhibitors` |
| Magazine.tsx | demoData.ts | `articles` |
| MagazineDetail.tsx | demoData.ts | `articles` doc |
| Trends.tsx | demoData.ts | `articles` WHERE category='Trend' |

### Kritik Düzeltmeler
- HometexLandingPage → `/admin` linkini KALDIR
- Firestore boşsa → demoData.ts graceful fallback (görseller demo kalabilir)

### Seed Data
**Dosya:** `scripts/seed-hometex.ts` → **YENİ**
- 6 demo katılımcı (exhibitors)
- 4 demo makale (articles)
- Tek seferlik çalıştır → Firestore'a yaz

### Doğrulama
- hometex.localhost:3000 → Sayfalar Firestore'dan veri gösteriyor
- `pnpm run build` → Exit code: 0

---

## 🛒 FAZ 4B: Vorhang.ai Marketplace (3 gün)

### Eksik Altyapı
| Parça | Durum | Yapılacak |
|-------|-------|-----------|
| Cart State | YOK | `src/store/vorhang-cart.ts` Zustand store |
| Ürün Listeleme | Mock | Firestore `vorhang_products` bağla |
| Ürün Detay | Mock | Firestore'dan çek, galeri, özellik tablosu |
| Sepet Sidebar | İskelet | Zustand cart'a bağla, miktar güncelle |
| Checkout | Form var, Stripe yok | Stripe Checkout Session entegre et |
| Seller Dashboard | Mock | Firestore `vorhang_orders` bağla |
| Seller Ingestion | İskelet | Ürün yükleme formu + Firestore yazma |

### Seed Data
**Dosya:** `scripts/seed-vorhang.ts` → **YENİ**
- 12 demo ürün (vorhang_products)
- 3 demo satıcı (vorhang_sellers)

### Doğrulama
- Ürün listele → sepete ekle → checkout → Stripe URL oluşur
- Seller login → sipariş listesi görünür
- `pnpm run build` → Exit code: 0

---

## ✨ FAZ 5: Son Cila (2-3 gün)

### TypeScript
- `pnpm tsc --noEmit` → 0 hata hedefi
- `any` kullanımlarını minimize et
- Unused import temizliği

### Mobil Responsive (4 tenant)
- Navbar hamburger: scroll lock hook
- Z-Index: Navbar z-50, Menü z-100, Concierge z-120
- Hero, grid, footer responsive kontrolü

### Routing
- Hardcoded `<Link href="/">` → tenant-aware path
- VorhangNavbar, PerdeFooter, OrderConfirmation kontrol

### Email Bildirim
- `notificationService.ts` → Gmail SMTP test
- Lead yakalama → admin email
- Sipariş → müşteri email

---

## 🚀 FAZ 6: Deploy & Fuar (2 gün)

1. 4 tenant → Google Cloud Run deploy
2. DNS: trtex.com, perde.ai, hometex.ai, vorhang.ai
3. SSL sertifikaları
4. Canlı smoke test
5. Fuar demo senaryosu

---

## 🏛️ FAZ 7: SOVEREIGN-READY ALTYAPI (Fuar sonrası, Q3 2026)

### Neden Şimdiden Hazırlan?
- AI ajanları satın alma/imza yapacak → paylaşımlı altyapıda sızıntı riski
- EU AI Act → veri egemenliği zorunluluğu
- Her tenant bağımsız deploy edilebilmeli

### Şimdi Yapılacak Hazırlıklar (Kod organizasyonu)
1. Ortak kodları `src/lib/shared/` altına topla (firebase, auth, stripe, i18n)
2. Tenant-specific kodları net ayır (src/components/tenant-*/  zaten yapılmış ✅)
3. API route'ları tenant-aware yap (zaten middleware ile yapılmış ✅)
4. Veritabanı koleksiyonlarını tenant prefix ile ayır (trtex_, perde_, vorhang_ ✅)

### Gelecekte Yapılacak (Faz 7 detay)
1. Turborepo + pnpm workspace dönüşümü (apps/ + packages/)
2. Tenant başına ayrı Firestore Named Database
3. Tenant başına ayrı Cloud Run servisi
4. API Gateway (Master Node)
5. Secret Manager (tenant başına ayrı key namespace)
6. Terraform IaC

---

## ⚠️ HER FAZ SONUNDA ZORUNLU

1. `pnpm run build` → **Exit code: 0**
2. 4 tenant localhost render testi
3. `git add . && git commit -m "feat(faz-X): açıklama"`
4. Bu skill dosyasını oku → kurallara uy

## 🔒 MUTLAK YASAKLAR
1. npm/yarn kullanma → sadece pnpm
2. 3. parti altyapı (Redis, AWS, Vercel, Pinecone) → sadece Google
3. B2C içerik → sadece B2B
4. Frontend'e doğrudan business logic → Dumb Client mimarisi
5. ConciergeWidget'a büyük değişiklik → küçük entegrasyon OK
6. Fiyatlar değiştirilmez (Keşfet: ücretsiz, Pro: $49, Enterprise: $199)
