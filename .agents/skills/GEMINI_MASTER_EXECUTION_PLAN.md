# 🏛️ GEMINI MASTER EXECUTION PLAN — AIPyram Ecosystem Realization
> **VERSİYON:** v1.0 | **TARİH:** 22 Nisan 2026
> **HEDEF:** 4'lü ekosistemi gerçek "AI Textile Operating System"e dönüştürmek.
> **KAPSAM DIŞI:** Stripe entegrasyonu ve Firebase/Cloud DB kurulumu → Barış yapacak.

---

## 📋 OKUMADAN BAŞLAMA — ZORUNLU DOSYALAR

Her oturumda önce şu dosyaları oku:
1. `AGENTS.md` (kök dizin) — Anayasa
2. `.agents/ECOSYSTEM_REFERENCE.md` — Tam teknik harita
3. `.agents/TRTEX_HANDOFF.md` — TRTEX korumalı dosyalar
4. `.wiki/technical_architecture.md` — Tech stack kuralları
5. `.wiki/persona_aloha.md` — ALOHA persona
6. `.wiki/domain_expertise.md` — Sektör bilgisi
7. Bu dosya — Execution plan

**MUTLAK YASAKLAR:**
- ❌ TRTEX `src/core/aloha/` dosyalarına DOKUNMA (pipeline çalışıyor)
- ❌ `engine.ts` refactor YASAK
- ❌ `middleware.ts` tenant routing mantığını BOZMA
- ❌ `firebase-admin.ts` init akışını DEĞİŞTİRME
- ❌ Upstash, AWS, Vercel, OpenAI — sadece Google altyapısı
- ❌ npm/yarn — sadece pnpm

---

## 🏗️ MİMARİ ÖZET

```
Kök: c:\Users\MSI\Desktop\aipyramweb
Framework: Next.js 15 (App Router) + TypeScript + TailwindCSS 4
DB: Firebase/Firestore (Admin SDK + Client SDK)
AI: Gemini API (@google/genai) + Imagen 3 (Vertex AI)
Auth: Firebase Authentication
Deploy: Google Cloud Run (Dockerfile hazır)
i18n: next-intl, 8 dil (TR/EN/DE/FR/ES/AR/RU/ZH)
Package: pnpm
```

### Multi-Tenant Mimari
```
middleware.ts hostname → rewrite:
  perde.ai / perde.localhost     → /sites/perde.ai/...
  hometex.ai / hometex.localhost → /sites/hometex.ai/...
  trtex.com / trtex.localhost    → /sites/trtex.com/...
  vorhang.ai / vorhang.localhost → /sites/vorhang.ai/...
  localhost / aipyram.*          → /[locale]/... (Master Node)
```

### Dumb Client Kuralı
Frontend ASLA kendi mantığı çalıştırmaz. Tüm iş zekası sunucuda.

---

## FAZ 1: CROSSNEXUS GERÇEK EVENTBUS (Omurga)

### Amaç
4 proje arasında gerçek sinyal iletişimi kurmak. Şu an `crossNexusOrchestrator.ts` JSON dosyasına yazıyor.

### ADIM 1.1: Sinyal Tip Tanımları
**Dosya:** `src/core/events/signalTypes.ts` (genişlet veya yeni)

Tipler: `RAW_MATERIAL_UPDATE`, `TREND_ALERT`, `PRODUCT_DESIGNED`, `RENDER_COMPLETED`, `MATCH_FOUND`, `LEAD_CAPTURED`, `ORDER_CREATED`, `FABRIC_ANALYZED`, `FAIR_OPPORTUNITY`, `PRICE_SHIFT`

Interface: `EcosystemSignal` → id, type, source_tenant, target_tenant, payload, priority, timestamp, processed

### ADIM 1.2: EcosystemBus Servisi
**Dosya:** `src/core/events/ecosystemBus.ts` (YENİ)
- `emit(signal)` → Firestore `ecosystem_signals` koleksiyonuna yaz + in-memory subscriber tetikle
- `subscribe(tenant, signalTypes, handler)` → Dinleyici kaydı
- `getRecentSignals(tenant, limit)` → Son sinyalleri çek
- `adminDb` null ise sessizce geç (NoopProxy pattern)

### ADIM 1.3: CrossNexusOrchestrator Güncelleme
**Dosya:** `src/services/crossNexusOrchestrator.ts` (MODIFY — 67 satır)
- JSON dosyası okuma/yazma → ecosystemBus.emit()
- Switch/case reaksiyon mantığı kalsın ama gerçek sinyal fırlatsın

### ADIM 1.4: API Endpoint
**Dosya:** `src/app/api/system/signals/route.ts` (YENİ)
- GET → Son 20 sinyal | POST → Manuel sinyal gönderme

### ✅ FAZ 1 DOĞRULAMA: `pnpm run build` exit 0, test sinyali Firestore'da görünür

---

## FAZ 2: CONCIERGEWIDGET → SEKTÖR BEYNİ

### Amaç
ConciergeWidget'ı bozmadan cross-tenant aksiyon yeteneği eklemek.

### ADIM 2.1: Orchestration Layer
**Dosya:** `src/core/aloha/orchestrationLayer.ts` (YENİ)
- `orchestrateQuery(request)` → Intent'e göre tenant verilerini paralel çek, Gemini ile birleştir
- Çıktı: executive_brief + DataCard[] + ecosystem_signals_fired

### ADIM 2.2: useEcosystemActions Hook
**Dosya:** `src/hooks/useEcosystemActions.ts` (YENİ)
- `/api/brain/v1/orchestrate` endpoint'ine POST atar

### ADIM 2.3: Orchestration API
**Dosya:** `src/app/api/brain/v1/orchestrate/route.ts` (YENİ)

### ADIM 2.4: ConciergeWidget Entegrasyonu
**Dosya:** `src/components/ConciergeWidget.tsx` (MODIFY — minimum)
- Chat yanıtı sonrası, intent cross-tenant ise ek DataCard'lar ekle

### ✅ FAZ 2 DOĞRULAMA: "perde trendleri?" → Normal yanıt + TRTEX DataCard

---

## FAZ 3: VORHANG.AI TENANT İSKELETİ

### Amaç
DACH pazarı hedefli online marketplace. Almanca öncelikli.

### Yeni Dosyalar
- `src/components/tenant-vorhang/VorhangLandingPage.tsx` — Hero + trend ürünler + satıcı CTA
- `src/components/tenant-vorhang/VorhangNavbar.tsx` — Logo + Produkte/Für Händler/Über Uns/Kontakt
- `src/components/tenant-vorhang/ProductCard.tsx` — Görsel + fiyat + Trust Score
- `src/components/tenant-vorhang/ProductDetail.tsx` — Galeri + "In Ihrem Raum ansehen"
- `src/components/tenant-vorhang/TryAtHome.tsx` — AI render (Perde.ai motoru çağrısı)
- `src/components/tenant-vorhang/SellerDashboard.tsx` — İskelet panel

### Routing
- `src/app/sites/[domain]/page.tsx` → vorhang dalı ekle
- `config/projects.json` → vorhang ekle

### Tasarım: Brutalist B2B ama son kullanıcıya hitap eden. Siyah/beyaz, altın aksan, serif/sans.

### ✅ FAZ 3 DOĞRULAMA: vorhang.localhost:3000 → Landing page render

---

## FAZ 4: HOMETEX.AI MOCK → İSKELET

### ADIM 4.1: HometexLandingPage Fix
- Hardcoded header → HometexNavbar import
- `/admin` linki kaldır
- Mock useState → demoData.ts dosyasına taşı

### ADIM 4.2: HometexNavbar Upgrade
- PerdeNavbar kalıbına uygun, mobil hamburger, dil switcher

### ADIM 4.3: Bileşen Temizliği
- Expo, Exhibitors, Magazine, Trends → prop-driven, loading/empty state

### ✅ FAZ 4 DOĞRULAMA: hometex.localhost:3000 → Merkezi navbar, admin linki yok

---

## FAZ 5: PERDE.AI "WOW ANI"

### ADIM 5.1: Demo Render Alanı
- PerdeLandingPage'e "Hemen Deneyin" bölümü
- 8 demo oda thumbnail → kumaş seç → watermark'lı render

### ADIM 5.2: RoomVisualizer Demo Mode
- `isDemoMode` prop → login gereksiz, demo odalar, watermark, kredi düşmez

### ADIM 5.3: Ekosistem Bağlantı Kartları
- EcosystemBridge.tsx → TRTEX trend + Hometex fuar bilgisi

### ✅ FAZ 5 DOĞRULAMA: perde.localhost:3000 → Demo render çalışır, watermark var

---

## FAZ 6: TRTEX KALAN GÖREVLER

### ADIM 6.1: deepAudit Onarım
- `autoRunner.ts` ~L933 → audit sonrası kritik onarımları otomatik uygula (max 5/cycle)

### ADIM 6.2: Opportunity Engine
- `opportunityEngine.ts` ~L105 → Somut veri varsa ZORLA fırsat üret, yoksa skip

### ADIM 6.3: IQ Tracking
- `terminalPayloadBuilder.ts` → payload sonrası `trtex_iq_history` kaydı
- `autoRunner.ts` → son 3 cycle IQ < 60 ise alarm

### ✅ FAZ 6 DOĞRULAMA: build 0 hata, TRTEX bozulmadı, IQ kaydı Firestore'da

---

## 📐 KODLAMA STANDARTLARI

1. TypeScript strict — `any` minimum
2. Import alias: `@/` kullan
3. Error handling: try/catch + sessiz fallback
4. Logging: `console.log('[MODÜL] emoji mesaj')`
5. TailwindCSS 4 + Radix UI
6. Brutalist B2B estetik
7. force-dynamic — sıfır cache
8. 8 dil i18n uyumlu

## 🔒 DOKUNULMAZ DOSYALAR

```
src/core/aloha/engine.ts           ← 250KB, YASAK
src/middleware.ts                   ← Tenant routing, BOZMA
src/lib/firebase-admin.ts          ← 3 kademeli fallback
src/core/aloha/signalCollector.ts  ← Sinyal limitleri
.agents/skills/aloha_supreme_matrix_backup.md ← LOCKED
```

## 📊 BAŞARI KRİTERLERİ

| Kriter | Hedef |
|--------|-------|
| Build | ✅ 0 hata |
| TRTEX canlı | ✅ Bozulmadı |
| EventBus | ✅ Sinyal gönder/al |
| ConciergeWidget | ✅ Cross-tenant DataCard |
| Vorhang.ai | ✅ Landing render |
| Hometex.ai | ✅ Mock kaldırıldı |
| Perde.ai WOW | ✅ Demo render |
| IQ Tracking | ✅ Tarihçe var |
