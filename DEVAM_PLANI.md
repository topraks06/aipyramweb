# AIPYRAM FAZ 2-5 DEVAM PLANI
## Gemini / Herhangi Bir AI Ajan İçin Devir-Teslim Belgesi

**Tarih:** 4 Nisan 2026
**Son Durum:** FAZ 1 tamamlandı, TypeScript build 0 hata, dev server çalışıyor
**Proje:** `c:\Users\MSI\Desktop\aipyramweb`
**Paket Yöneticisi:** pnpm
**Framework:** Next.js 15 (App Router) + TailwindCSS 4 + Radix UI
**AI SDK:** @google/genai (Gemini)
**DB:** Firebase (Firestore + Realtime DB)
**Ödeme:** Stripe (SDK kurulu, henüz entegre edilmedi)

---

## KRİTİK KURALLAR (ANAYASA)

1. **Dumb Client:** Tüm siteler (TRTEX, Perde.ai, Hometex.ai) Master Node'a (AIPyram) bağlı uçbirimdir
2. **Zero-Cache:** Her veri çekme `force-dynamic` olmalı
3. **Server-Side Only:** API key'ler asla client'a sızmayacak
4. **Cost Control:** Her ajan çağrısında `AgentBudget` (maxTokens, maxSteps, maxCostUSD, killSwitch) zorunlu
5. **HITL:** $10.000+ işlemlerde zorunlu insan onayı
6. **Tek Source of Truth:** `src/core/` — `aloha-core/` arşiv, dokunma
7. **Sektör Odağı:** Sadece perde + ev tekstili
8. **Revenue-First:** Her iş "para üretir mi?" sorusuyla değerlendirilir

---

## MEVCUT MİMARİ (FAZ 1 ÇIKTISI)

```
src/core/
├── agents/
│   ├── types.ts              ← V2.0: AgentRole, AgentBudget, HITLConfig, AgentReputation
│   ├── aloha.ts              ← Master Orchestrator
│   ├── visionary.ts          ← Stratejik Plancı
│   ├── reality.ts            ← Fizibilite Denetçisi
│   ├── apollon.ts            ← Hafıza & Denetçi
│   ├── matchmakerAgent.ts    ← ⭐ RFQ→Tedarikçi eşleştirme (Gelir Motoru #1)
│   ├── polyglotAgent.ts      ← 8 dil B2B çeviri
│   ├── auditorAgent.ts       ← Trust Score + sertifika doğrulama
│   ├── trendsetterAgent.ts   ← Pazar trend analizi
│   ├── virtualRepAgent.ts    ← 7/24 AI stand görevlisi
│   ├── domainMasterAgent.ts  ← 270 domain yöneticisi
│   ├── artDirector.ts        ← QC (kalite kontrol)
│   ├── agentFactory.ts       ← Dinamik ajan üretici (JSON tabanlı)
│   ├── core-agents.json      ← 10 ajan tanımı
│   └── site-agents.json      ← 13 domain ajanı tanımı
├── events/
│   ├── eventTypes.ts         ← V2.0: Revenue + Trust + Cost Control sinyalleri
│   └── eventBus.ts           ← Memory-based EventBus (FAZ 3'te Redis'e geçecek)
├── memory/
│   └── rag.ts                ← Firestore tabanlı basit RAG (FAZ 2'de upgrade)
├── registry/
│   └── agentRegistry.ts      ← V2.0: coreAgentRegistry + workerRegistry
├── schema/
│   └── firestoreSchema.ts    ← Koleksiyon şemaları (rfqs, suppliers, matches, deals, trust_scores, agent_costs)
├── swarm/
│   ├── orchestrator.ts       ← 4-fazlı prompt chaining (Visionary→Reality→Apollon→Aloha)
│   └── master-agent.ts       ← Otonom haber/içerik üretimi
└── ...

src/app/api/rfqs/
├── live/route.ts             ← GET: Canlı RFQ üretimi
└── match/route.ts            ← POST: RFQ eşleştirme + HITL

src/services/
└── stripeService.ts          ← Stripe checkout + komisyon (beklemede)

src/components/admin/
└── RFQDashboard.tsx          ← 💰 RFQ sekmesi (admin panelde)
```

---

## FAZ 2: GÜVEN KATMANI — Adım Adım Talimat

### Adım 2.1: Tedarikçi Kayıt API'si
**Dosya:** `src/app/api/suppliers/route.ts`
```
POST /api/suppliers → Yeni tedarikçi kaydı
GET /api/suppliers → Tüm tedarikçileri listele
GET /api/suppliers/[id] → Tek tedarikçi detayı
```
**Şema:** `FirestoreSupplier` (src/core/schema/firestoreSchema.ts'te tanımlı)
**Firestore koleksiyonu:** `suppliers`
**Dikkat:** firebase-admin kullan (server-side), client SDK değil

### Adım 2.2: AuditorAgent → Firestore Entegrasyonu
**Dosya:** `src/app/api/suppliers/[id]/audit/route.ts`
```
POST /api/suppliers/{id}/audit → AuditorAgent ile Trust Score hesapla
```
**İşlem:**
1. Firestore'dan tedarikçiyi çek
2. `auditorAgent.ts` → `auditSupplier()` çağır
3. Sonucu `trust_scores` koleksiyonuna yaz
4. Tedarikçi belgesindeki `trustScore` ve `riskLevel` alanlarını güncelle
5. `TRUST_SCORE_UPDATED` event'i emit et

### Adım 2.3: Supplier Panel UI
**Dosya:** `src/components/admin/SupplierPanel.tsx`
**Admin panele ekle:** `src/app/admin/page.tsx` → Yeni sekme "🏭 Suppliers"
**Özellikler:**
- Tedarikçi listesi (ad, bölge, trust score, sertifikalar)
- Yeni tedarikçi ekleme formu
- "Denetle" butonu → AuditorAgent çağırır
- Trust Score renk kodlu gösterim (0-50 kırmızı, 51-79 sarı, 80-100 yeşil)

### Adım 2.4: Memory Upgrade (Opsiyonel)
**Dosya:** `src/core/memory/rag.ts`
**İyileştirme:** Firestore'daki `knowledge_base` koleksiyonuna şirket bazlı veri ekleme
- Her RFQ eşleşmesi memory'ye yazılsın
- Her audit sonucu memory'ye yazılsın
- Bu "Knowledge Flywheel" döngüsünün temeli

---

## FAZ 3: EKONOMİ MOTORU — Adım Adım Talimat

### Adım 3.1: Stripe Komisyon Entegrasyonu
**Dosya:** `src/services/stripeService.ts` (zaten var, tamamla)
**Yeni dosya:** `src/app/api/stripe/checkout/route.ts`
```
POST /api/stripe/checkout → Komisyon ödeme sayfası oluştur
```
**Yeni dosya:** `src/app/api/stripe/webhook/route.ts`
```
POST /api/stripe/webhook → Ödeme onayı dinle
```
**Env variables gerekli:**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
**Komisyon oranları:** `stripeService.ts`'te tanımlı (perde: %3, ev-tekstili: %3)

### Adım 3.2: Deal Tracking
**Dosya:** `src/app/api/deals/route.ts`
```
POST /api/deals → Yeni anlaşma başlat
GET /api/deals → Aktif anlaşmaları listele
PATCH /api/deals/[id] → Anlaşma durumunu güncelle
```
**Lifecycle:** RFQ → Match → Negotiation → Agreement → Payment → Delivery → Completed
**Şema:** `FirestoreDeal` (firestoreSchema.ts'te tanımlı)

### Adım 3.3: EventBus → Upstash Redis (Büyük Upgrade)
**Paket:** `pnpm add @upstash/redis`
**Dosya:** `src/core/events/eventBus.ts` → Redis pub/sub'a geçiş
**Neden:** Memory-based setTimeout yerine persistent, retry destekli queue
**Upstash:** https://upstash.com → Free tier 10K/gün
**Env:**
```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Adım 3.4: Deal Dashboard UI
**Dosya:** `src/components/admin/DealDashboard.tsx`
**Admin panele ekle:** Yeni sekme "📊 Deals"

---

## FAZ 4: TAM OTONOM — Adım Adım Talimat

### Adım 4.1: Agent-to-Agent Zincir
**Dosya:** `src/core/swarm/rfq-pipeline.ts`
**Akış:**
```
RFQ gelir → MatchmakerAgent eşleştirir → PolyglotAgent çevirir → 
VirtualRepAgent alıcıya döner → AuditorAgent tedarikçiyi doğrular →
Deal oluşturulur → Stripe ile ödeme → Komisyon kazanılır
```
**Dikkat:** Her adımda `AgentBudget` kontrol edilmeli

### Adım 4.2: Bildirim Sistemi
**Dosya:** `src/services/notificationService.ts`
**Kanallar:** Email (Resend/SendGrid), WhatsApp (Twilio — opsiyonel)
**Tetikleyiciler:** RFQ_MATCHED, DEAL_INITIATED, APPROVAL_REQUIRED

### Adım 4.3: Knowledge Flywheel
**Dosya:** `src/core/memory/knowledgeFlywheel.ts`
**Akış:** Her tamamlanan deal → Feedback toplanır → Memory'ye yazılır → Sonraki eşleştirme daha akıllı

---

## FAZ 5: İMPARATORLUK — Adım Adım Talimat

### Adım 5.1: Domain Activation Engine
**Dosya:** `src/app/api/domains/activate/route.ts`
**İşlem:** DomainMasterAgent → domain için plan üret → site iskeleti oluştur

### Adım 5.2: İlk Genişleme
- hometex.ai → Ev tekstili sanal fuarı
- heimtex.ai → Almanca ev tekstili
- vorhang.ai → Almanca perde

---

## TEST KOMUTLARI

```bash
# TypeScript derleme
npx tsc --noEmit

# Dev sunucu
pnpm dev

# Canlı RFQ testi (terminalde)
curl http://localhost:3000/api/rfqs/live

# RFQ eşleştirme testi
curl -X POST http://localhost:3000/api/rfqs/match \
  -H "Content-Type: application/json" \
  -d '{"rfq":{"id":"test-1","buyerRegion":"DACH","buyerType":"Hotel Chain","product":"Tül perde kumaşı 280cm","quantity":"50000 metre","requirements":["OEKO-TEX","Trevira CS"],"urgency":"High"},"suppliers":[]}'
```

---

## DİKKAT EDİLECEK TUZAKLAR

1. **`aloha-core/` dizinine DOKUNMA** — Arşiv, aktif kod değil
2. **`_ARCHIVE_LEGACY/` ve `_TRTEX_SAFE_BACKUP/`** — tsconfig'de exclude, sunucuya gitmiyor
3. **`voice_processor.ts`** — Encoding düzeltildi, tekrar bozulmasın
4. **Gemini model adları:** `gemini-2.5-flash` kullanılıyor, değiştirme
5. **`import.meta.env.VITE_*`** — Bu Next.js'te ÇALIŞMAZ, `process.env.` kullan
6. **Header.tsx:** next-intl Link tipi `as any` ile gideriliyor, normal
7. **Cost tracking:** Her yeni ajan çağrısında `usageMetadata` yoksa `tokensUsed: 0` dön
