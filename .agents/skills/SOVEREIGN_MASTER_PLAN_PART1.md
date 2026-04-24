# 🛡️ SOVEREIGN OS MASTER PLAN — BÖLÜM 1/4
# MEVCUT DURUM RÖNTGENİ + FAZ 3-4

> **TARİH:** 24 Nisan 2026 | **YAZAN:** Claude Opus 4.6 (Derin Analiz)
> **HEDEF:** Dünyanın En İyi Sovereign B2B Tekstil OS'u
> **KURAL:** HER FAZ SONUNDA `pnpm run build` + `git commit` + skill dosyası güncelle

---

## MEVCUT DURUM — ACMASIZ RÖNTGEN

### ✅ ÇALIŞAN SİSTEMLER (DOKUNMA)
| Sistem | Dosya | Durum |
|--------|-------|-------|
| TRTEX Otonom Pipeline | `src/core/aloha/autoRunner.ts` (88KB) | 7/24 haber üretiyor |
| TRTEX Engine | `src/core/aloha/engine.ts` (250KB) | Tool registry çalışıyor |
| Firebase Admin | `src/lib/firebase-admin.ts` | 3 kademeli fallback |
| Middleware | `src/middleware.ts` | 4 node + DDoS koruması |
| Sovereign Config SSoT | `src/lib/sovereign-config.ts` | 4 node tanımlı |
| Auth Hook | `src/hooks/useSovereignAuth.ts` | Firebase Auth + lisans + wallet init |
| ALOHA Registry | `src/lib/aloha/registry.ts` | 5 ajan + invokeAgent() executor |
| ALOHA Agent Sistemi | `src/lib/agents/*.ts` | 9 ajan dosyası (WhatsApp, Document, Fabric, Retention, vb.) |
| Admin AlohaControl | `src/components/admin/AlohaControl.tsx` | Gerçek SSE stream + Gemini bağlantısı |
| SwarmTerminal | `src/components/console/SwarmTerminal.tsx` | Deep/Fast/Autonomous mod |
| ConciergeWidget | `src/components/ConciergeWidget.tsx` (35KB) | Gemini API + 3 dil |
| EconomyEngineGraph | `src/components/admin/EconomyEngineGraph.tsx` | Gerçek API verisi |
| DashboardOverview | `src/components/admin/DashboardOverview.tsx` | Firestore API, sıfır mock |

### 🔴 KRİTİK EKSİKLİKLER — KATMAN KATMAN

#### KATMAN 1: VERİ BÜTÜNLÜĞÜ (Firestore'a sahte veri yazılıyor)
| # | Dosya | Satır | Sorun | Çözüm |
|---|-------|-------|-------|-------|
| 1 | `core/aloha/lead-engine/trigger.ts` | 41 | `Math.random() * 500000` → Firestore `b2b_opportunities` koleksiyonuna SAHTE hacim yazıyor | Kategori bazlı sabit tahmin tablosu |
| 2 | `api/v1/master/vorhang/create-order/route.ts` | 30 | `VOR-${Math.floor(1000 + Math.random() * 9000)}` → Order ID collision riski | `crypto.randomUUID()` tabanlı benzersiz ID |
| 3 | `api/stripe/marketplace-checkout/route.ts` | 13 | Aynı random order ID pattern | Aynı düzeltme |

#### KATMAN 2: DASHBOARD GÜVENİLİRLİĞİ (Admin'de sahte görüntü)
| # | Dosya | Satır | Sorun | Çözüm |
|---|-------|-------|-------|-------|
| 4 | `app/api/system/pulse/route.ts` | 31 | netLatency `Math.random()` | Sabit 15ms veya Firestore ping ölçümü |
| 5 | `app/admin/layout.tsx` | 184 | Bellek radarı bar yükseklikleri random | `radarData` tabanlı deterministik dağılım |
| 6 | `components/console/SwarmTerminal.tsx` | 68 | Log ID `Math.random().toString()` | `crypto.randomUUID()` |

#### KATMAN 3: OTONOM MOTOR GÜVENLİĞİ
| # | Dosya | Satır | Sorun | Çözüm |
|---|-------|-------|-------|-------|
| 7 | `core/aloha/deployGuard.ts` | 17 | Shadow deploy trafiği `Math.random()` simülasyonu | Firestore `feature_flags` koleksiyonu veya `isLive = false` |
| 8 | `core/aloha/goalEngine.ts` | 71,74 | Experiment/Growth rollout `Math.random()` | Firestore'dan okunan A/B test konfigürasyonu |

#### KATMAN 4: YARIM KALAN ALTYAPI (packages/)
| # | Dosya | Sorun |
|---|-------|-------|
| 9 | `packages/aloha-sdk/` | İskelet var ama production-grade değil, wallet atomic transaction eksik |
| 10 | `packages/shared-types/` | Tip tanımları eksik: Order, Product, Customer, AgentLog |
| 11 | `packages/shared-config/` | sovereign-config.ts burada olmalı ama src/lib'de |
| 12 | `packages/shared-firebase/` | Re-export doğrulanmalı |

#### KATMAN 5: FounderDashboard MOCK VERİLERİ
| # | Dosya | Satır | Sorun |
|---|-------|-------|-------|
| 13 | `admin/FounderDashboard.tsx` | 36-41 | `PLATFORMS` dizisi hardcoded visitor/routed sayıları (hepsi 0) |
| 14 | `admin/FounderDashboard.tsx` | 37 | `didimemlak.ai` → Sovereign Config'de tanımsız, phantom node |
| 15 | `admin/FounderDashboard.tsx` | 37-40 | `activeAgents: 12, 8, 4, 8` → Hardcoded, gerçek veri yok |

#### KATMAN 6: ROUTE TEMİZLİĞİ (Sprint H yarım kaldı)
| # | Dosya | Sorun |
|---|-------|-------|
| 16 | `sites/[domain]/demo-dashboard/` | Gereksiz duplicate route |
| 17 | `sites/[domain]/akademi/` | `/academy/` ile çakışıyor |
| 18 | `sites/[domain]/ihaleler/` | `/tenders/` ile çakışıyor |

#### KATMAN 7: KABUL EDİLEBİLİR MOCK'LAR (DOKUNMA)
Aşağıdakiler KASITLI çeşitlilik mekanizmalarıdır — dokunulmayacak:
- `imageAgent.ts` → Prompt çeşitliliği (mood/subject/aspect random seçimi)
- `newsEngine.ts` → Editoryal pipeline doğal çeşitlilik
- `initiative.ts` → Konu havuzundan random seçim
- `dynamicSignalCollector.ts` → RSS feed rotasyonu
- `tenderAgent.ts` → İhale sorgu karıştırma
- `aiClient.ts:254` → Backoff jitter (RFC 7231 standardı)
- `GodsEyeWidget` x/y animasyon → Sadece radar görsel efekti
- `PerdeAIAssistant` / `ConciergeWidget` → Client-side chat mesaj ID

---

## FAZ 3: PERDE.AI — MOCK'TAN ÜRETİME (4-5 gün)

> **HEDEF:** Para üreten ilk Sovereign App — eksiksiz ERP

### 3.1 Auth Katmanı (Zaten useSovereignAuth var — doğrula)
- [x] `B2B.tsx` → `useSovereignAuth('perde')` hook'u import et, `isLicensed` kontrolü ekle
- [x] `Catalog.tsx` → Aynı auth entegrasyonu
- [x] `MyProjects.tsx` → Auth + render geçmişi: `perde_renders` koleksiyonundan `onSnapshot`
- [x] Kullanıcı lisanssızsa → "Lisansınız aktif değil. Kurumsal Üyelik için /pricing sayfasına gidin" mesajı

### 3.2 ERP Veri Katmanı (Firestore Bağlantıları)
- [x] `B2B.tsx` → `perde_orders` + `perde_customers` koleksiyonlarına `onSnapshot` bağla
  - Sipariş listesi, durum güncellemeleri, müşteri CRM verileri gerçek Firestore'dan
- [x] `Catalog.tsx` → `perde_products` koleksiyonu bağlantısı
  - Ürün ekleme/düzenleme/silme CRUD operasyonları
  - Empty state: "Henüz ürün eklenmemiş. İlk ürününüzü ekleyin."
- [x] `Accounting.tsx` → `perde_orders` aggregate (gelir/gider hesaplama)
  - `grandTotal`, `status`, `createdAt` alanlarından raporlama
- [x] `Inventory.tsx` → `perde_products` stok durumu (zaten `onSnapshot` var — doğrula)
- [x] `OrderSlideOver.tsx` → Gerçek sipariş oluşturma:
  - `addDoc(collection(db, 'perde_orders'), {...})` 
  - Room verileri JSON.stringify yerine array olarak kaydet

### 3.3 Ödeme Entegrasyonu
- [x] `Pricing.tsx` → "Şimdi Al" butonları → `/api/stripe/checkout` (type: 'plan')
  - Stripe test key ile 3 plan (Keşfet ücretsiz, Pro $49, Enterprise $199)
  - Başarılı ödeme → Firestore `perde_members/{uid}.license = 'active'` güncelle
- [x] `/api/stripe/webhook/route.ts` → `checkout.session.completed` event'inde lisans aktivasyonu
- [x] Ödeme başarılı sonrası → `/b2b` sayfasına yönlendirme

### 3.4 Chat Hafıza Kalıcılığı
- [x] `chat-memory.ts` → `chat_sessions` Firestore koleksiyonu
  - Session ID: `{userId}_{SovereignNodeId}_{timestamp}`
  - Her mesaj Firestore'a yazılacak
  - Kullanıcı tekrar geldiğinde son 20 mesaj yüklenecek
- [x] `PerdeAIAssistant.tsx` → chat-memory.ts entegrasyonu

### 3.5 Render Pipeline Doğrulama
- [x] `RoomVisualizer.tsx` → `/api/render` gerçek Imagen çağrısı doğrula
  - Başarısızlık durumunda kullanıcıya "Render kotanız doldu" mesajı
  - Her render → `perde_renders` koleksiyonuna kaydet
  - Wallet kredi kontrolü (invokeAgent → WalletService)

### 3.6 DesignEngine → ERP Köprüsü (Zaten yapıldı — doğrula)
- [x] `DesignEngine.tsx` → `handleSaveToERP` async → `/api/perde/erp` POST
- [x] `/api/perde/erp/route.ts` → `perde_orders` koleksiyonuna draft sipariş kaydetme doğrula

### FAZ 3 DOĞRULAMA:
```bash
pnpm run build  # Exit Code: 0 zorunlu
git commit -m "feat(faz-3): perde.ai mock-to-production ERP"
```
**Skill güncelle:** `.agents/skills/skill_perde_ai_production.md`

---

## FAZ 4: HOMETEX.AI + VORHANG.AI CANLANDIRMA (3-4 gün)

### 4A: HOMETEX.AI (Sanal Fuar + Dergi)

#### 4A.1 Veri Katmanı
- [x] `HometexLandingPage.tsx` → Hardcoded 6 hall objesi → `hometex_exhibitors` Firestore koleksiyonu
  - Fallback: `hometex-demoData.ts` mevcut verileri seed olarak kullan
  - `/admin` linkini KESİNLİKLE kaldır (son kullanıcıya admin gösterilmez)
- [x] `Expo.tsx` → `hometex_halls` Firestore koleksiyonu (salon bilgileri)
- [x] `Exhibitors.tsx` → `hometex_exhibitors` Firestore, auth hook entegrasyonu
- [x] `ExhibitorDetail.tsx` → `useSovereignAuth('hometex')` (zaten yapıldı — doğrula)
- [x] `BoothDetail.tsx` → Aynı auth doğrulama
- [x] `Magazine.tsx` → `hometex_articles` Firestore koleksiyonu
- [x] `MagazineDetail.tsx` → Tekil makale çekme
- [x] `Trends.tsx` → TRTEX bridge (`trtex-bridge.ts` üzerinden haber çekme)

#### 4A.2 Seed Script
- [x] `scripts/seedHometex.ts` oluştur:
  - 6 katılımcı firma (exhibitors)
  - 4 dergi makalesi (magazine)
  - 8 salon tanımı (halls)
  - `hometex-demoData.ts` verileri seed kaynağı olarak kullanılabilir

#### 4A.3 Navbar Düzeltme
- [x] Hometex → Kendi hardcoded header'ını kaldır → Merkezi `HometexNavbar` bileşenine geçiş

### 4B: VORHANG.AI (B2C E-Ticaret Marketplace)

#### 4B.1 Sepet Altyapısı
- [x] `useCartStore.ts` → Zustand store (mevcut ise doğrula, yoksa oluştur)
  - addItem, removeItem, updateQuantity, clearCart, getTotal
  - localStorage persistence (hydrate on mount)

#### 4B.2 Ürün Sistemi
- [x] `ProductGrid.tsx` → `vorhang_products` Firestore koleksiyonu
  - Empty state: "Henüz ürün eklenmemiş" (zaten var — doğrula)
- [x] `ProductDetail.tsx` → Tekil ürün detay + sepete ekle
- [x] Seed script: `scripts/seedVorhang.ts` → 12 ürün + 3 satıcı

#### 4B.3 Checkout + Escrow
- [x] `CheckoutPage.tsx` → Stripe marketplace checkout
  - Yemeksepeti modeli: Ödeme AIPyram havuz hesabına düşer
  - `/api/stripe/marketplace-checkout/route.ts` → Gerçek Stripe session
- [x] `OrderConfirmation.tsx` → Sipariş onay sayfası (basePath fix zaten yapıldı)

#### 4B.4 Satıcı Paneli
- [x] `SellerDashboard.tsx` → `vorhang_orders` + `vorhang_sellers` Firestore
  - Satıcının siparişlerini görmesi
  - Sipariş durumu güncelleme (hazırlanıyor → kargoda → teslim)
- [x] `SellerOnboarding.tsx` → Firestore kaydı (zaten yapıldı — doğrula)
- [x] `SellerIngestion.tsx` → Firestore kaydı (zaten yapıldı — doğrula)

### FAZ 4 DOĞRULAMA:
```bash
pnpm run build  # Exit Code: 0 zorunlu
git commit -m "feat(faz-4): hometex + vorhang canlandırma"
```
**Skill güncelle:** `.agents/skills/skill_gemini_ecosystem_builder.md`
