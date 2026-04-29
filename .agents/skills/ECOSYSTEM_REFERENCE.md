# AIPyram Monorepo — Tam Teknik Referans Belgesi
> Son Güncelleme: 2026-04-29T08:49 | Yazar: Antigravity Q2 Audit

Bu belge, yeni oturum açıldığında tek seferde okunarak tüm projeyi kavramak için hazırlanmıştır.
Her gelişte bu dosyayı oku, tekrar tekrar dosya taramaya gerek yok.

---

## 1. MİMARİ GENEL BAKIŞ

```
Kök: c:\Users\MSI\Desktop\aipyramweb
Framework: Next.js 15 (App Router) + TypeScript + TailwindCSS 4
Paket Yönetici: PNPM
Veritabanı: Firebase/Firestore (Admin SDK + Client SDK)
Cache/Rate Limit: Upstash Redis
LLM: Gemini API (GEMINI_API_KEY env)
Auth: Firebase Auth (Google + Email) — Client tarafı
Deployment: Google Cloud Run
```

### Multi-Tenant Mimari
Middleware (`src/middleware.ts`) hostname'e göre domain çözümler:
- `perde.ai` / `perde.localhost` → `/sites/perde.ai/...`
- `hometex.ai` / `hometex.localhost` → `/sites/hometex.ai/...`
- `trtex.com` / `trtex.localhost` → `/sites/trtex.com/...`
- `localhost` / `aipyram.*` → Ana Master Node (next-intl ile DE/EN/TR)
- Admin paneli: `/admin` (sadece Master domain'den erişilebilir)

### Rate Limiting
Middleware'de Upstash Redis ile 10 saniyede 100 istek limiti. Redis yoksa by-pass.

---

## 2. TENANT DOSYA HARİTASI

### 2.1 PERDE.AI (Tenant: `perde`)
**Ana Sayfa Bileşeni:** `src/components/tenant-perde/PerdeLandingPage.tsx` (318 satır, 21KB)
- 3 slaytlı hero, workflow bölümü, galeri, footer
- Unsplash görselleri kullanıyor (external)
- `PerdeNavbar` bileşenini import ediyor

**Navigasyon:** `src/components/tenant-perde/PerdeNavbar.tsx` (101 satır)
- Public/Private link ayrımı var (localStorage mock auth)
- `isLicensedMember` = `localStorage.getItem('perde_ai_license') === 'active'`
- Public: Kurumsal Üyelik
- Private (sadece üyelere): Tasarım Stüdyosu, B2B ERP, Katalog Stoku, Ekosistem Sinyali
- Sağda: İletişim, Bayi Başvurusu (üye değilse), Sisteme Giriş/B2B Paneline Git

**Auth Sayfaları:** `src/components/tenant-perde/auth/`
- `AuthWrapper.tsx` — Siyah (#0a0a0a) tam ekran, merkezi kart layout
- `Login.tsx` — E-posta + Şifre + Google ile giriş. **⚠️ MOCK: Her giriş localStorage'a 'active' yazar ve /b2b'ye atar**
- `Register.tsx` — Firma/Ad/E-posta formu + Google. **⚠️ MOCK: Sadece "Başvuru Alındı" ekranı gösterir, hiçbir veri kaydedilmez**

**Rotalar (`src/app/sites/[domain]/`):**
| Rota | Dosya | Navbar | Gatekeeper | Durum |
|------|-------|--------|------------|-------|
| `/` | `page.tsx` → PerdeLandingPage | PerdeNavbar light | Yok | ✅ Çalışıyor |
| `/visualizer` | `visualizer/page.tsx` → RoomVisualizer | PerdeNavbar dark | B2BGatekeeper | ✅ Kilitli |
| `/b2b` | `b2b/page.tsx` → B2B | PerdeNavbar light | B2BGatekeeper | ✅ Kilitli |
| `/catalog` | `catalog/page.tsx` → Catalog | PerdeNavbar light | B2BGatekeeper | ✅ Kilitli |
| `/ecosystem` | `ecosystem/page.tsx` → Ecosystem | PerdeNavbar light | B2BGatekeeper | ✅ Kilitli |
| `/pricing` | `pricing/page.tsx` → Pricing | PerdeNavbar light | Yok (public) | ✅ Çalışıyor |
| `/contact` | `contact/page.tsx` → Contact | PerdeNavbar light | Yok (public) | ✅ Çalışıyor |
| `/login` | `login/page.tsx` → auth/Login | Yok (izole) | Yok | ✅ MOCK |
| `/register` | `register/page.tsx` → auth/Register | Yok (izole) | Yok | ✅ MOCK |

**Perde Bileşenleri (`src/components/tenant-perde/`):**
- `RoomVisualizer.tsx` (340 satır, 16KB) — AI tasarım motoru, adım adım render simülasyonu
- `B2B.tsx` (11KB) — ERP paneli mock
- `Catalog.tsx` (11KB) — Ürün kataloğu mock
- `Configurator.tsx` (8KB) — Perde konfigürasyonu
- `Contact.tsx` (3.8KB) — İletişim formu
- `DesignEngine.tsx` (12KB) — Eski tasarım motoru (artık kullanılmıyor, Visualizer aldı)
- `Ecosystem.tsx` (7KB) — Ekosistem sinyalleri
- `Pricing.tsx` (9KB) — Üyelik paketleri

**B2BGatekeeper:** `src/components/auth/B2BGatekeeper.tsx`
- localStorage kontrolü, yoksa kırmızı "Erişim Reddedildi" + 3sn sonra /pricing'e yönlendir
- **⚠️ MOCK: Gerçek auth yok, bypasslanabilir**

### 2.2 HOMETEX.AI (Tenant: `hometex`)
**Ana Sayfa:** `src/components/tenant-hometex/HometexLandingPage.tsx` (209 satır)
- **⚠️ Kendi hardcoded header'ı var (PerdeNavbar gibi merkezi değil)**
- `/admin`'e link veriyor (yanlış — son kullanıcı admin'e ulaşmamalı)
- Veriler tamamen MOCK (useState ile hardcoded articles ve exhibitors)
- Firebase import'ları yoruma alınmış

**Hometex Bileşenleri:**
- `Expo.tsx`, `Exhibitors.tsx`, `ExhibitorDetail.tsx`, `BoothDetail.tsx` — Fuar sistemi
- `Magazine.tsx`, `MagazineDetail.tsx` — Dergi sistemi
- `Trends.tsx` — Trend takibi

**Hometex Rotaları:** expo, exhibitors, magazine, trends — Tamamı `/sites/[domain]/` altında

### 2.3 TRTEX (Tenant: `trtex`)
**Ana Sayfa:** `src/app/sites/[domain]/page.tsx` içinde `projectName === 'trtex'` dalında
- `fetchAlohaPayload()` ile Firestore'dan canlı haber çeker (`trtex_news` koleksiyonu)
- 3 kademeli fallback: index query → createdAt sort → ham okuma
- Terminal verisi ayrı: `trtex_terminal.current`
- Render: `PremiumB2BHomeLayout` bileşeni

**TRTEX Bileşenleri (`src/components/trtex/`):**
- `TrtexNavbar.tsx` (14KB) — Tam özellikli navbar (hamburger, dil, search)
- `IntelligenceTicker.tsx` (27KB) — Ana sayfa istihbarat terminali
- `ArticleIntelligenceBlock.tsx` (20KB) — Haber detay bloğu
- `OpportunityRadarWidget.tsx` (11KB) — Ticari fırsat radarı
- `TrtexFooter.tsx` (9KB) — Footer
- `StickyCtaBar.tsx` (7KB) — Yapışkan CTA
- `LeadCaptureModal.tsx` (7KB) — Lead yakalama
- `GlobalTicker.tsx` (1.8KB) — Küçük ticker
- `ShareButtons.tsx`, `NewsletterCapture.tsx`, `ArticleLightbox.tsx`

**TRTEX Rotaları:** news, tenders, academy, trends, fairs, supply, opportunities, request-quote

### 2.4 AIPYRAM MASTER NODE
**Ana Sayfa:** `src/app/[locale]/page.tsx` (next-intl ile DE/EN/TR)
**Admin/The Void:** `src/app/admin/page.tsx` — ALOHA komut merkezi
**Home Bileşenleri:** `src/components/home/PremiumB2BHomeLayout` (TRTEX render)
**Layout:** `src/app/layout.tsx` — Inter + Roboto fontları, AipyramAuthProvider, ConciergeWidget, Toaster

---

## 3. ALOHA SİSTEMİ (The Void) — ✅ 19 Nisan 2026 GÜNCELLEME

### Admin Paneli: `/admin`
- `src/app/admin/page.tsx` — Siyah terminal UI, komut girişi + dinamik canvas
- `AlohaInput.tsx` → POST `/api/aloha/command` → cevabı DynamicCanvas'a basar
- `DynamicCanvas.tsx` — Komut yanıtlarını widget'lara dönüştürür

### API: `/api/aloha/command` — ✅ GEMİNİ-DESTEKLİ (ARTIK MOCK DEĞİL)
- `src/app/api/aloha/command/route.ts` — Gemini 2.0 Flash intent resolver + tool executor
- Gemini yoksa keyword-based fallback çalışır
- Gerçek Firestore operasyonları yapar (member CRUD, cron trigger, health check)

### ALOHA Araç Sistemi: `src/lib/aloha/tools.ts` — ✅ YENİ
- `member.list` — Tenant bazlı üye listesi (perde_members, hometex_members, trtex_members)
- `member.approve` — Lisans aktivasyonu
- `member.reject` — Lisans reddi
- `member.suspend` — Lisansı askıya alma
- `system.health` — Tüm tenant + altyapı sağlık kontrolü
- `content.stats` — İçerik istatistikleri
- `cron.trigger` — master-cycle, ticker-refresh vb. tetikleme

### Agent Registry
- `src/lib/aloha/registry.ts` — 5 ajan tanımı (in-memory object)
- **⚠️ IN-MEMORY: Sayfa yenilenince tüm değişiklikler uçar**

---

## 4. AUTH SİSTEMİ — ✅ 19 Nisan 2026 GÜNCELLEME

### Firebase Auth Provider (Merkezi)
- `src/components/auth/AipyramAuthProvider.tsx` — Layout.tsx'de sardırılmış
- `useAuth()` hook → `user`, `loading`, `isAdmin`, `loginWithGoogle`, `logout`

### Perde.ai Auth — ✅ GERÇEK (ARTIK MOCK DEĞİL)
- `src/hooks/usePerdeAuth.ts` — Firebase Auth + Firestore perde_members lisans hook'u
- `usePerdeAuth()` → `user`, `isLicensed`, `licenseStatus`, `loginWithEmail`, `registerDealer`, `loginWithGoogle`, `logout`
- Lisans durumları: `active`, `pending`, `rejected`, `suspended`, `none`
- Firestore koleksiyonu: `perde_members/{uid}`

### B2BGatekeeper — ✅ GERÇEK
- `src/components/auth/B2BGatekeeper.tsx` — `usePerdeAuth()` kullanıyor
- 3 durum: giriş yok → pending lisans → aktif lisans

### Auth API
- `src/app/api/auth/setup/` — **BOŞ dizin** (henüz gerekli değil — client-side Firebase Auth kullanılıyor)

---

## 5. ALTYAPI SERVİSLERİ

### Firebase Admin
- `src/lib/firebase-admin.ts` (155 satır) — Sağlam, 3 kademeli fallback init
- Base64 env → JSON env → Lokal dosya → applicationDefault
- Firestore başlatılamazsa NoopProxy (sistem devam eder, veri gelmez)
- `checkFirestoreHealth()` export edilir

### Firebase Client
- `src/lib/firebase-client.ts` — Standard init, auth + db + googleProvider export
- Env değişkenleri: NEXT_PUBLIC_FIREBASE_* serisi gerekli

### Upstash Redis
- Middleware + Health check'te kullanılıyor
- Env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

### Gemini API
- `GEMINI_API_KEY` env gerekli
- **Modeller (Q2 2026):**
  - `gemini-2.5-flash` — Ana model (hızlı, düşük maliyet)
  - `gemini-3.1-pro` — Kompleks analiz (Deep Research Max)
  - `gemini-3.1-flash-image-preview` — Görsel üretim (Nano Banana 2, 4K)
  - `gemini-embedding-2` — Multimodal embedding (GA, 3072-dim)
- ConciergeWidget → `/api/chat` üzerinden Gemini'ye çağrı yapar (fallback: lokal intent)
- ALOHA command → Gemini destekli intent resolver + tool executor

---

## 6. ConciergeWidget
- `src/components/ConciergeWidget.tsx` (665 satır, 35KB)
- Sağ alt köşe floating chat butonu
- 3 dilli (DE/EN/TR) intent classification + visual data generation
- `/api/chat` endpoint'ine Gemini API çağrısı yapar, başarısız olursa lokal yanıt üretir
- Admin/Aloha sayfalarında gizlenir
- **Tüm sayfalarda aktif** (layout.tsx'de)

---

## 7. CORE MODÜLLER (`src/core/`)
Devasa bir otonom ajan altyapısı (Q2 2026: 86+ dosya, ~1.2MB kod):
- `core/aloha/` — 86+ dosya: aiClient, engine, orchestrator, agentBus (A2A Protocol), imageAgent, newsAgent, visualDNA, controlTower vb.
- `core/antigravity/` — master_agent, worker_agent, reviewer_agent, execution_engine
- `core/cache/` — feedCache, learningMatrix
- `core/cron/` — masterCron.ts (10KB)
- `core/events/` — eventBus, eventTypes, idempotencyGuard
- `core/execution/` — actionRunner, bridge, cloudExecutor
- `core/memory/` — knowledgeFlywheel, rag, semanticGraph
- `core/registry/` — agentRegistry.ts

**✅ TRTEX otonom pipeline'I canlı. A2A Protocol ile ajan iletişimi standartlaştırıldı.**

---

## 8. CRON ROTALAR (`/api/cron/`)
14 cron endpoint: academy-cycle, aloha-cycle, health-check, image-processor, market-data, master-cycle, signal-collector, tech-scan, tender-cycle, tenders-cycle, ticker-refresh, translation-processor, trtex-feed, trtex-news

`trtex-news` → DEPRECATED, master-cycle'a redirect eder.

---

## 9. KRİTİK SORUNLAR VE BORÇLAR

### 🔴 SEVİYE 1 — Kırık / Çalışmayan
1. **Perde.ai Auth tamamen MOCK** — Login/Register formları hiçbir şeyi Firebase'e kaydetmiyor. Google butonu da mock. Gerçek Firebase Auth (`AipyramAuthProvider`) mevcut ama Perde.ai auth flow'una bağlanmamış.
2. **İki Ayrı Auth Sistemi Çakışması** — `AipyramAuthProvider` (layout.tsx, Firebase tabanlı) vs `B2BGatekeeper` (localStorage tabanlı). Bunlar birbirinden habersiz.
3. **`/api/auth/setup/` BOŞ** — Auth API route'u yok.
4. **ALOHA Command Route MOCK** — LLM entegrasyonu yok, if/else ile 3 hardcoded senaryo.
5. **AgentRegistry IN-MEMORY** — Sayfa yenilenince resetlenir.

### 🟡 SEVİYE 2 — Eksik / Yarım
6. **Hometex.ai hardcoded header** — PerdeNavbar gibi merkezi navbar kullanmıyor.
7. **Hometex.ai tüm veriler MOCK** — Firestore'dan hiçbir şey okumuyor.
8. **Hometex.ai header'da `/admin` linki** — Son kullanıcıya admin paneli gösteriyor.
9. **Perde.ai ana sayfadaki "Demoyu Başlat" butonu** — `/visualizer`'a gidiyor ama Gatekeeper var, giriş yapmamış kullanıcı "Erişim Reddedildi" görür.
10. **pricing/page.tsx'te unused import** — `import Link from 'next/link'` kullanılmıyor.
11. **Register eski RegisterClient.tsx dosyası** — `src/app/sites/[domain]/register/RegisterClient.tsx` hâlâ disk'te duruyor (artık import edilmiyor).

### 🟢 SEVİYE 3 — Çalışıyor ama İyileştirme Gerekli
12. **TRTEX canlı veri pipeline'ı** — Firestore'dan gerçek haber çekiyor, çalışıyor.
13. **ConciergeWidget** — Gemini API'ye bağlı, fallback mekanizması var, çalışıyor.
14. **Middleware rate limiting** — Redis varsa çalışıyor, yoksa graceful degradation.
15. **Firebase Admin init** — Sağlam, 3 kademeli fallback.

---

## 10. ENV DEĞİŞKENLERİ (GEREKLİ)
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 (veya FIREBASE_SERVICE_ACCOUNT_KEY veya firebase-sa-key.json)
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
GEMINI_API_KEY
CRON_SECRET
```

---

## 11. DOSYA SAYILARI
- Toplam `.ts` + `.tsx` dosyası: ~200+
- `src/core/aloha/`: ~35 dosya (otonom pipeline)
- `src/components/`: 17 dizin, 8 dosya
- `src/app/api/`: 24 API dizini
- `src/app/sites/[domain]/`: 24 alt rota dizini

---

## 12. ALOHA SKILL DOSYALARI (`.agents/skills/`)

Bu dosyalar, otonom ajanların görev kurallarını tanımlar. SİLİNMEZ, DEĞİŞTİRİLMEZ.

| Dosya | Fonksiyon |
|-------|-----------|
| `aloha_supreme_matrix_backup.md` | 7 kıta arama matrisi (sinyal toplama hedefleri) — **LOCKED BY HAKAN** |
| `skill_google_cloud_worker.md` | Local PC kullanımı YASAK, her ağır iş Google Cloud Worker'a devredilecek |
| `skill_image_generator.md` | Pollinations.AI ile ultra gerçekçi foto — seed zorunlu, 1600x900, nologo |
| `skill_news_writer.md` | 600+ kelime, SEO, B2C yasak, `actionable_insights` zorunlu |
| `skill_translator.md` | 7 dil çeviri (TR,EN,DE,FR,ES,RU,AR), SEO uyumlu terminoloji |
| `trtex/decision_engine.md` | Ticari yerçekimi skoru (0-100), perde çarpanı 1.3x, B2C REJECT |
| `trtex/lead_generator.md` | Lead yakalama kuralları |
| `trtex/news_producer.md` | Haber üretim pipeline kuralları |
| `trtex/trade_matrix_builder.md` | Ticaret matrisi inşa kuralları |
| `trtex/trtex_supreme_matrix_backup.md` | TRTEX'e özel arama matrisi yedeği |
| `trtex/validation_engine.md` | İçerik doğrulama motor kuralları |

---

## 13. TRTEX HANDOFF ÖZETİ (`.agents/TRTEX_HANDOFF.md`)

**TEK ÇATI KURALI:** TRTEX sadece `aipyramweb` içinde yaşar. Eski `projeler zip/trtex.com/` ARŞİV.

**Dumb Client Mimarisi:** Frontend asla kendi mantığı çalıştırmaz. Veri akışı:
```
Firestore: trtex_terminal/current → page.tsx okur → render
```

**TRTEX Core Dosya Haritası:**
```
src/core/aloha/
├── autoRunner.ts          ← ANA ORKESTRATÖR (3 saatte 1)
├── engine.ts              ← Haber üretim motoru
├── initiative.ts          ← Konu seçim (Hunter Mode)
├── signalCollector.ts     ← Web sinyal toplama (limit: 12/gün)
├── signalEngine.ts        ← Pazar sinyal analizi (Gemini)
├── opportunityEngine.ts   ← Sinyal → ticari fırsat
├── terminalPayloadBuilder.ts ← TEK ATOMİK PAYLOAD
├── tickerDataFetcher.ts   ← Döviz/emtia/lojistik
├── costGuard.ts           ← Bütçe koruma (max 15 makale/gün)
├── contentGuard.ts        ← B2C marka filtresi
```

**Kalan 6 Görev (TRTEX):**
1. Firestore Composite Index (2 adet — console'dan)
2. deepAudit → Otomatik Onarım Döngüsü
3. Opportunity Engine Güçlendirme
4. Premium Rapor Sayfası (`/premium` → 404 veriyor)
5. Radar/Academy/Opportunity pointer koleksiyonları
6. Self-Improvement Loop (IQ tracking + alarm)

**Başarı Kriterleri:**
- Build: ✅ 0 hata
- IQ Skoru: 63/100 → Hedef ≥75/100
- Premium sayfa: 404 → Çalışan sayfa hedef

---

## 14. WORKFLOW DOSYALARI (`.agents/workflows/`)

| Workflow | Amaç |
|----------|------|
| `aipyram-localization.md` | 8 dilde TR-öncelikli başlangıç kuralı |
| `dil-politikasi.md` | Proje dil politikası ve çeviri kuralları |
| `marka-riskli-domainler.md` | Marka/patent riskli domain listesi |
| `master-concierge-agent.md` | Niyet analizi, ziyaretçi yönlendirme kuralları |

---

## 15. KRİTİK YASAKLAR (TÜM OTURUMLARda GEÇERLİ)

1. **Local PC'de ağır işlem YASAK** — Her analiz/tarama Google Cloud Worker'a devredilecek
2. **B2C içerik YASAK** — Tüm haber/içerik B2B odaklı olmalı
3. **`aloha_supreme_matrix_backup.md` SİLİNEMEZ** — Hakan tarafından kilitlenmiş
4. **`engine.ts` prompt'larından B2C marka yasağı KALDIRILAMAZ**
5. **Frontend'e doğrudan Firestore sorgusu EKLENEMEZ** — Dumb Client mimarisi bozulamaz
6. **`signalCollector.ts`'deki sinyal limiti 12'nin altına düşürülemez**
