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

## 🧹 FAZ 0: BÜYÜK TEMİZLİK (✅ TAMAMLANDI)

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

## 🧠 FAZ 1: AIPyram Master Node (✅ TAMAMLANDI)

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

## 📡 FAZ 2: TRTEX Stabilizasyon (COMPLETED)

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

## ⚡ FAZ S1: SOVEREIGN BEYİN (ŞİMDİ — En Öncelikli)

> **MİMARİ KARAR:** Tenant mimarisinden TAM ÇIKIŞ. Sovereign Owner mimarisi.
> **KURAL:** Sistem çalışırken mimari değişir, sistem DURMAZ.
> **YÖNTEM:** Fiziksel taşıma YAPMA. Önce re-export yap. Fiziksel taşıma = fuar sonrası.

### S1.1 — packages/aloha-sdk/ Doldur (Re-export Yöntemi)

**ÖNEMLİ:** `src/lib/aloha/` dosyalarını SİLME veya TAŞIMA. Sadece `packages/aloha-sdk/` içinden re-export yap. Import zinciri kırılmasın.

#### [NEW] `packages/aloha-sdk/invokeAgent.ts`
Kaynak mantık: `src/lib/aloha/registry.ts` → invokeAgent fonksiyonu
Yeni Sovereign versiyonu:
```typescript
export async function invokeAgent({ tenant, action, uid, payload, idempotencyKey }: {
  tenant: string;
  action: string;
  uid?: string;
  payload: Record<string, any>;
  idempotencyKey?: string;
}) {
  // 0. Idempotency check (double call koruması)
  if (idempotencyKey) {
    const existing = await checkIdempotency(idempotencyKey);
    if (existing) return existing;
  }

  // 1. Action whitelist kontrolü
  const ALLOWED_ACTIONS = ['render','analysis','opportunity','compose_article','chat','document','image_generation'];
  if (!ALLOWED_ACTIONS.includes(action)) throw new Error(`Invalid action: ${action}`);

  // 2. Tenant rate limit (50 call/dakika)
  await checkRateLimit(tenant);

  // 3. Feature flag kontrolü (tenant-config'den)
  // 4. Wallet kontrolü (kredi yeterli mi?)

  const start = Date.now();

  // 5. Tool çalıştır
  const result = await runTool(action, payload);

  const duration = Date.now() - start;

  // 6. Logla (aloha_sovereign_logs koleksiyonu)
  await logSovereignAction({ tenant, action, uid, payload, result, duration, cost: ACTION_COST[action] || 1 });

  // 7. Kredi düş (atomic Firestore transaction)
  if (uid) await deductCredit(tenant, uid, action);

  return { ...result, duration, creditUsed: ACTION_COST[action] || 1 };
}
```

#### [NEW] `packages/aloha-sdk/wallet.ts`
- `checkCredits(tenant, uid, action)` → Koleksiyon: `{tenant}_wallets`
- `deductCredit(tenant, uid, action)` → Atomic Firestore transaction
- `addCredit(tenant, uid, amount)` → Stripe webhook sonrası çağrılır
- `getBalance(tenant, uid)` → Admin panel için

Maliyet tablosu:
```
render = 5, analysis = 2, opportunity = 1, compose_article = 3,
image_generation = 4, chat = 0.5, document = 2, default = 1
```

#### [NEW] `packages/aloha-sdk/logger.ts`
Firestore koleksiyonu: `aloha_sovereign_logs`
```
{ tenant, action, uid, payload, result, cost, duration_ms, createdAt }
```

#### [NEW] `packages/aloha-sdk/tools.ts`
Tool dispatch — switch(action) ile yönlendir:
- `render` → Basit versiyon (fuar için mock/placeholder, gerçek Imagen sonra)
- `analysis` → Gemini analiz çağrısı
- `opportunity` → Fırsat motoru
- `compose_article` → İçerik üretimi
- `chat` → Chat completion

#### [MODIFY] `packages/aloha-sdk/index.ts`
Tüm export'ları birleştir.

### S1.2 — packages/shared-firebase/ Doldur

#### [MODIFY] `packages/shared-firebase/index.ts`
```typescript
export { adminDb } from '@/lib/firebase-admin';
export { db, auth } from '@/lib/firebase-client';
```

### S1.3 — Unified Agent API

#### [NEW] `src/app/api/agent/invoke/route.ts`
```typescript
// POST /api/agent/invoke
// Body: { tenant, action, uid?, payload, idempotencyKey? }
// Response: { success, data, creditUsed, duration, message }
```
- Request validation (tenant + action zorunlu)
- try/catch + DLQ kaydı (sistem çökerse veri kaybolmaz)
- Rate limiting (tenant bazlı, 50/dakika)

### S1.4 — Perde Collection İzolasyonu

#### [MODIFY] `src/lib/tenant-config.ts`
Perde tenant config değişikliği:
```
projectCollection: 'projects' → 'perde_orders'
walletCollection: 'wallets' → 'perde_wallets'
```
YENİ alanlar ekle:
```
customerCollection: 'perde_customers'
productCollection: 'perde_products'
renderCollection: 'perde_renders'
```

**NOT:** B2B.tsx zaten `config.projectCollection` kullanıyor (satır 58). Collection adı değişince otomatik çalışır.

### S1.5 — Stripe Plan Desteği

#### [MODIFY] `src/app/api/stripe/checkout/route.ts`
Mevcut `commission` ve `marketplace` type'larına ek olarak `plan` type'ı ekle:
```typescript
if (type === 'plan') {
  // planId: starter|pro|enterprise, isYearly: boolean
  // Plan fiyatları: starter $15.90/$19.90, pro $63.90/$79.90, enterprise $199.90/$249.90
  // metadata.tenant + metadata.planId ekle
}
```

#### [MODIFY] `src/app/api/stripe/webhook/route.ts`
Plan ödemesi sonrası:
- `addCredit(tenant, uid, planCredits)` çağır (starter=100, pro=500, enterprise=2000)
- `{tenant}_members` koleksiyonunda `license: 'active'` güncelle

### S1.6 — Admin Sovereign Metrikleri

#### [MODIFY] `src/app/admin/page.tsx`
Yeni widget'lar ekle:
- Toplam Sovereign Çağrı (aloha_sovereign_logs count)
- Tenant Bazlı Kredi Durumu (4 tenant bakiye)
- Son 10 İşlem Logu (tablo)
- Hata Sayısı (DLQ count)

### S1 Doğrulama
- `pnpm run build` → Exit code: 0
- `POST /api/agent/invoke` test
- Admin panelde sovereign metrikler
- `git add .; git commit -m "feat(sovereign): S1 Brain + Wallet + Logger + API"`

---

## ⚡ FAZ S2: PERDE.AI SOVEREIGN APP (S1 Bittikten Sonra)

> **Hedef:** Sipariş → Fiyat → Ödeme → Admin akışı. Para üreten ilk Sovereign app.

### S2.1 — Order + Customer API

#### [NEW] `src/app/api/perde/orders/route.ts`
- `GET` → Kullanıcının siparişlerini listele (`perde_orders` koleksiyonu)
- `POST` → Yeni sipariş oluştur (ölçü + ürün + müşteri + fiyat hesaplama)

#### [NEW] `src/app/api/perde/customers/route.ts`
- `GET` → Müşteri listesi (`perde_customers`)
- `POST` → Yeni müşteri kaydet

### S2.2 — Pricing Engine

#### [NEW] `src/services/perdePricingEngine.ts`
Basit formül (karmaşık olmasın):
```
price = (width_cm * height_cm / 10000) * fabricPrice * quantity
```
Fabric fiyatları: blackout=450₺/m², tül=280, stor=520, fon=380, zebra=620

### S2.3 — Stripe Bağlantı

#### [MODIFY] `src/components/tenant-perde/Pricing.tsx`
- `handleCheckout()` → body'ye `type: 'plan'` ekle (satır 27)
- Zaten `/api/stripe/checkout` çağırıyor, sadece payload düzeltmesi

#### [MODIFY] `src/components/tenant-perde/OrderSlideOver.tsx`
- "Siparişi Onayla ve Öde" butonu → Stripe checkout URL

### S2.4 — Admin Panel Perde Tablosu

#### [MODIFY] `src/app/admin/page.tsx`
- Perde sipariş tablosu (son 20 kayıt)
- Durum değiştirme (teklif → onay → üretim → teslim)

### S2 Doğrulama
- Sipariş oluştur → Fiyat hesapla → Ödeme → Admin'de gör
- `pnpm run build` → Exit code: 0
- `git add .; git commit -m "feat(perde): S2 Orders + Pricing + Stripe"`

---

## ⚡ FAZ S3: TÜM TENANT BAĞLANTI (S2 Bittikten Sonra)

### S3.1 — TRTEX → Sovereign Log
- `autoRunner.ts` → Her cycle sonunda sovereign log kaydı
- Mevcut ALOHA engine'e dokunma, sadece log ekle

### S3.2 — Hometex.ai → Firestore
- `demoData.ts` → `hometex_exhibitors` + `hometex_articles` fallback ile
- Seed script: `scripts/seed-hometex.ts` (6 katılımcı, 4 makale)

### S3.3 — Vorhang.ai → Marketplace
- Zustand cart store: `src/store/vorhang-cart.ts`
- Products → `vorhang_products` koleksiyonu
- Checkout → Stripe marketplace type
- Seller → `vorhang_sellers` koleksiyonu

### S3 Doğrulama
- 4 tenant localhost çalışıyor, hepsi sovereign API üzerinden
- `pnpm run build` → Exit code: 0
- `git add .; git commit -m "feat(sovereign): S3 All tenants connected"`

---

## ⚡ FAZ S4: SON CİLA + DEPLOY (S3 Bittikten Sonra)

### S4.1 — TypeScript Temizliği
- `pnpm tsc --noEmit` → 0 hata
- `any` minimize, unused import sil

### S4.2 — Mobil Responsive
- 4 tenant responsive kontrol
- Z-Index: Navbar z-50, Menü z-100, Concierge z-120

### S4.3 — Deploy
- Google Cloud Run (tek deploy, 4 tenant)
- DNS: trtex.com, perde.ai, hometex.ai, vorhang.ai
- SSL + smoke test
- Fuar demo senaryosu

### S4 Doğrulama
- Canlı siteler çalışıyor
- `git add .; git commit -m "feat(sovereign): S4 Deploy + Final"`

---

## ⚠️ HER FAZ SONUNDA ZORUNLU

1. `pnpm run build` → **Exit code: 0**
2. 4 tenant localhost render testi
3. `git add .; git commit -m "feat(sovereign-SX): açıklama"`
4. Bu skill dosyasını oku → kurallara uy

## 🔒 SOVEREIGN MUTLAK KURALLARI
1. **Agent sadece Master'da çalışır** — Tenant direkt agent çalıştırmaz
2. **Her işlem loglanır** — `aloha_sovereign_logs` koleksiyonu
3. **Her işlem kredi düşer** — Wallet atomic transaction
4. **Ortak kod sadece `/packages`** — Re-export, fiziksel taşıma fuar sonrası
5. **Veri izolasyonu** — Her tenant `{tenant}_*` koleksiyonları
6. **Sıfır cache** — `force-dynamic` tüm sayfalarda
7. **Google-native** — 3. parti (Redis, AWS, Vercel) YASAK
8. npm/yarn kullanma → sadece pnpm
9. B2C içerik YASAK → sadece B2B
10. Frontend'e business logic koyma → Dumb Client mimarisi
