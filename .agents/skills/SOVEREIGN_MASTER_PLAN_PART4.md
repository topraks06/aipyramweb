# 🛡️ SOVEREIGN OS MASTER PLAN — BÖLÜM 4/4
# ALOHA DERİN MİMARİ + İLERLEME TABLOSU + GEMİNİ TALİMATLARI

---

## ALOHA SOVEREIGN BRAIN — DERİN MİMARİ PLANI

> Bu bölüm ALOHA'nın dünya standartlarında otonom bir "Dijital İkiz" olması için
> tüm katmanların atom seviyesinde tanımını içerir.

### KATMAN 1: VERI BÜTÜNLÜĞÜ ZIRHI (Tüm fazlarda geçerli)

**KURAL:** Firestore'a yazılan her veri DOĞRULANMIŞ olmalıdır.

| Koleksiyon | Doğrulama Kuralı |
|------------|------------------|
| `b2b_opportunities` | `grandTotal` → kategori tablosundan çekilmeli, ASLA random |
| `perde_orders` | `orderId` → `PER-{timestamp}-{4char_uuid}` formatı |
| `vorhang_orders` | `orderId` → `VOR-{timestamp}-{4char_uuid}` formatı |
| `aloha_agent_logs` | Her log → `SovereignNodeId`, `agentType`, `uid`, `success`, `creditUsed`, `createdAt` |
| `chat_sessions` | Session ID → `{uid}_{nodeId}_{Date.now()}` |
| `perde_renders` | Her render → `imageUrl`, `prompt`, `creditUsed`, `userId`, `createdAt` |

**Kategori Bazlı Hacim Tablosu (trigger.ts için):**
```typescript
const CATEGORY_VOLUME: Record<string, number> = {
  'ihale': 500000,
  'otel': 300000,
  'konut': 250000,
  'fuar': 150000,
  'yatırım': 400000,
  'tesis': 350000,
  'default': 200000
};
```

### KATMAN 2: AJAN ÖZ-EVRİM SİSTEMİ (system_manifest.json'dan)

**Recursive Self-Refinement Protokolü:**
1. Ajanlar dönüşüm oranlarına (Conversion) göre kendi SKILL dosyalarını günceller
2. Her 24 saatte 1 → `aloha_agent_performance` koleksiyonunu oku
3. Başarılı ajan stratejilerini `aloha_knowledge` koleksiyonuna yaz
4. Başarısız stratejileri → Post-Mortem ajanı devreye girer → `aloha_lessons_learned` koleksiyonu

**Implementasyon:**
- [ ] `core/aloha/selfImprovement.ts` → Performans metrikleri toplama
- [ ] `/api/cron/self-improve` → Günlük 1 kez otonom iyileştirme döngüsü
- [ ] `aloha_knowledge` Firestore → KnowledgeTrainer.tsx ile CRUD

### KATMAN 3: EKONOMİK BİLİNÇ (CFO AJAN)

**costGuard.ts Güçlendirme:**
- [ ] Her ajan çağrısının maliyetini `aloha_costs` koleksiyonuna yaz
- [ ] Günlük bütçe limiti: `sovereign_config` → `dailyBudget: { trtex: 5, perde: 10, hometex: 2, vorhang: 3 }`
- [ ] Soft limit (%80) → Yavaşlatma (öncelik düşürme)
- [ ] Hard limit (%100) → KILL SWITCH (durdurma)
- [ ] `EconomyEngineGraph.tsx` → Gerçek maliyet verisi gösterimi (zaten API'den çekiyor — doğrula)

### KATMAN 4: IDENTITY STITCHING (Cross-Platform Müşteri Tanıma)

**Hedef:** TRTEX'te haber okuyan kişi → Perde.ai'ye geldiğinde tanınır

- [ ] `aloha_visitor_profiles` Firestore koleksiyonu:
  ```typescript
  {
    visitorId: string,        // Cookie veya Firebase UID
    firstSeen: string,
    lastSeen: string,
    touchpoints: Array<{
      nodeId: SovereignNodeId,
      page: string,
      action: string,
      timestamp: string
    }>,
    intentVector: string[],   // ['fuar', 'otel_projesi', 'salon_tasarım']
    estimatedValue: number    // ROI tahmini
  }
  ```
- [ ] ConciergeWidget → Visitor profile'dan son touchpoint'e göre kişiselleştirilmiş selamlama

### KATMAN 5: DeployGuard GERÇEK Feature Flags

- [ ] Firestore `feature_flags` koleksiyonu:
  ```typescript
  {
    featureId: string,         // 'new_render_model', 'vorhang_checkout_v2'
    status: 'shadow' | 'canary' | 'live' | 'disabled',
    trafficPercentage: number, // 0-100
    enabledNodes: string[],    // ['perde', 'vorhang']
    createdAt: string,
    updatedBy: string
  }
  ```
- [ ] `deployGuard.ts` → `Math.random()` yerine Firestore'dan `trafficPercentage` oku
- [ ] Admin panel → Feature flag yönetim ekranı (gelecek faz)

---

## 📊 MASTER İLERLEME TABLOSU

| Faz | Kapsam | Tahmini Süre | Durum | Git Commit | Build |
|-----|--------|-------------|-------|------------|-------|
| FAZ 1 | Güvenlik + Hijyen | 1 gün | ✅ | 2eaa29c | ✅ |
| FAZ 2 | Packages İskelet | 2 gün | ✅ | 0c14db1 | ✅ |
| FAZ 3 | Perde.ai Mock→Prod | 4-5 gün | ✅ | 4598731 | ✅ |
| FAZ 4 | Hometex + Vorhang | 3-4 gün | ✅ | (build+commit bekleniyor) | ✅ |
| FAZ 5 | TRTEX SEO + Stabil | 2-3 gün | ✅ | (build+commit bekleniyor) | ✅ |
| FAZ 6 | Admin Panel Full | 3-4 gün | ⬜ | — | — |
| FAZ 7 | Mobil + Performans | 2-3 gün | ⬜ | — | — |
| FAZ 8 | E2E Test + Güvenlik | 3-4 gün | ⬜ | — | — |
| FAZ 9 | Production Deploy | 1-2 gün | ⬜ | — | — |
| FAZ 10 | Fuar Demo | 1 gün | ⬜ | — | — |

**Toplam:** ~22-30 gün (~4-6 hafta gerçekçi tempo)  
**Deadline:** 19 Mayıs 2026

---

## 🎯 GEMİNİ İÇİN TALİMATLAR

### Gemini Oturuma Başladığında:
```
1. `.agents/skills/GEMINI_SOVEREIGN_MISSION.md` OKU (anayasa)
2. `.agents/skills/SOVEREIGN_MASTER_PLAN_PART1.md` OKU (röntgen + faz 3-4)
3. `.agents/skills/SOVEREIGN_MASTER_PLAN_PART2.md` OKU (faz 5-6-7)
4. `.agents/skills/SOVEREIGN_MASTER_PLAN_PART3.md` OKU (faz 8-9-10)
5. `.agents/skills/SOVEREIGN_MASTER_PLAN_PART4.md` OKU (aloha derin + ilerleme)
6. İlerleme tablosunda ⬜ olan İLK faza başla
7. Her checkpoint sonrası: pnpm run build + git commit
8. Bu PART4 dosyasındaki ilerleme tablosunu güncelle: ⬜ → ✅
```

### Her Faz Sonunda ZORUNLU:
```bash
# 1. Build kontrolü
pnpm run build  # Exit Code: 0 OLMALI

# 2. Git commit
git add .
git commit -m "feat(faz-X): [açıklama]"

# 3. İlgili skill dosyasını güncelle
# Faz 3 → skill_perde_ai_production.md
# Faz 4 → skill_gemini_ecosystem_builder.md
# Faz 5 → trtex/news_producer.md (SEO bölümü)
# Faz 6 → ECOSYSTEM_REFERENCE.md (admin bölümü)
# Faz 7 → skill_translator.md (lokalizasyon)
# Faz 8 → SOVEREIGN_GOREV_EMRI.md (test sonuçları)
# Faz 9 → skill_google_cloud_worker.md (deploy)
# Faz 10 → ECOSYSTEM_REFERENCE.md (demo bölümü)

# 4. Bu dosyadaki ilerleme tablosunu güncelle
```

### MUTLAK YASAKLAR:
1. **DOSYA SİLME YASAK** → `_archive/` altına taşı
2. **Build kırık commit YASAK** → Önce düzelt
3. **Faz atlama YASAK** → Sırayla git
4. **Mock veri yazma YASAK** → Firestore'dan oku
5. **Force push YASAK** → ASLA
6. **TRTEX pipeline'a DOKUNMA** → `autoRunner.ts`, `engine.ts` kutsal

### REFERANS DOSYALAR (DOKUNMA):
| Dosya | Neden |
|-------|-------|
| `src/core/aloha/autoRunner.ts` (88KB) | TRTEX otonom pipeline — ÇALIŞIYOR |
| `src/core/aloha/engine.ts` (250KB) | Tool registry — ÇALIŞIYOR |
| `src/core/aloha/aiClient.ts` | Singleton AI — ÇALIŞIYOR |
| `src/middleware.ts` | Routing + DDoS — ÇALIŞIYOR |
| `src/lib/sovereign-config.ts` | SSoT config — ÇALIŞIYOR |
| `src/lib/firebase-admin.ts` | Firebase bağlantısı — ÇALIŞIYOR |
| `scripts/check-rogue-ai.js` | Build guard — ÇALIŞIYOR |
| `AGENTS.md` | Anayasa — DEĞİŞTİRME |

---

**Bu plan, AIPyram Sovereign OS'un dünyanın en kapsamlı B2B tekstil
işletim sistemi olması için gerekli TÜM adımları içerir. Her satır
gerçek dosya yollarına, gerçek koleksiyon isimlerine ve gerçek
implementasyon detaylarına dayanmaktadır. Basit değildir, eksik değildir.**
