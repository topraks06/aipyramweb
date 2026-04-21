# 🧠 GEMİNİ HANDOFF — TRTEX ALOHA SİSTEMİ

> **SON GÜNCELLEME:** 16 Nisan 2026
> **Git Commit'ler:** `7d04609`, `b945d81`, `788af55`
> **DURUM:** %90 Production-Ready

---

## 🚨 TEK ÇATI KURALI (MUTLAK YASA — BU BOZULURSA HER ŞEY ÇÖKER)

### TRTEX SADECE `aipyramweb` İÇİNDE YAŞAR!
```
✅ DOĞRU YOL: c:\Users\MSI\Desktop\aipyramweb\src\app\sites\[domain]\page.tsx
❌ YANLIŞ:    c:\Users\MSI\Desktop\projeler zip\trtex.com\  ← ESKİ ARŞİV, DOKUNMA!
❌ YANLIŞ:    c:\Users\MSI\Desktop\projeler zip\_ARCHIVED_trtex_standalone\  ← ARŞİV!
```

### Firebase: SADECE `aipyramweb` yazabilir
- `projeler zip/trtex.com/.env.local` → Firebase Admin key DEVREDİŞİ bırakıldı (16 Nisan 2026)
- Eski proje çalıştırılsa bile Firestore'a YAZAMAZ
- Tüm Firestore yazma yetkisi SADECE `aipyramweb` üzerinden

### Değerli Bileşenler KOPYALANDI
- 14 bileşen `aipyramweb/src/components/trtex/extracted/` altına alındı
- ChinaWatchSection, IntelligenceTicker, FairCalendarSection, CommodityHeatmap vb.

---

## ⚠️ KRİTİK MİMARİ KURALLAR (BUNLARI ASLA BOZMA)

### 1. DUMB CLIENT MİMARİSİ
Frontend (`page.tsx`) **ASLA kendi mantığı çalıştırmaz**. Tüm veri Firestore'daki tek bir atomik payload'dan gelir:
```
Firestore: trtex_terminal/current → page.tsx okur → render eder
```
- Frontend'e business logic EKLEME
- Yeni veri lazımsa → `terminalPayloadBuilder.ts`'e ekle

### 2. DOSYA HARİTASI
```
src/core/aloha/
├── autoRunner.ts          ← ANA ORKESTRATÖR (3 saatte 1 çalışır)
├── engine.ts              ← Haber üretim motoru (compose_article)
├── initiative.ts          ← Konu seçim motoru (Hunter Mode)
├── signalCollector.ts     ← Web'den sinyal toplama (limit: 12/gün)
├── signalEngine.ts        ← Pazar sinyal analizi (Gemini)
├── opportunityEngine.ts   ← Sinyal → ticari fırsat çevirici
├── terminalPayloadBuilder.ts ← TEK ATOMİK PAYLOAD ÜRETİCİ
├── tickerDataFetcher.ts   ← Döviz/emtia/lojistik canlı veri
├── costGuard.ts           ← Bütçe koruma (max 15 makale/gün)
├── controlTower.ts        ← Rate limit, gate check
├── executiveLayer.ts      ← CEO brief üretici
├── intelligenceEngine.ts  ← Karar motoru
├── marketRuleEngine.ts    ← Piyasa kuralları → aksiyon kartları
├── contentGuard.ts        ← B2C marka filtresi
├── textileResearcher.ts   ← Haftalık sektör araştırma
├── siteAuditor.ts         ← Günlük site sağlık tarama
├── deepAudit.ts (swarm/)  ← İçerik kalite denetimi ← YENİ DÜZELTİLDİ

src/app/sites/[domain]/
├── page.tsx               ← ANA SAYFA (Dumb Client)
├── [category]/page.tsx    ← KATEGORİ/ARŞİV SAYFASI (pagination)
├── [category]/[slug]/page.tsx ← HABER DETAY SAYFASI
```

### 3. YASAKLAR
- ❌ `engine.ts` prompt'larından B2C marka yasağını KALDIRMA
- ❌ `initiative.ts`'deki Hunter Mode kategorilerini B2C'ye GERİ ÇEVİRME
- ❌ `terminalPayloadBuilder.ts`'e LLM çağrısı EKLEME (statik çeviri tablosu var)
- ❌ `signalCollector.ts`'deki limiti 12'nin ALTINA düşürme
- ❌ Frontend'e doğrudan Firestore sorgusu EKLEME (payload'dan oku)

---

## ✅ TAMAMLANAN İŞLER (TEKRAR YAPMA)

| # | İş | Dosya | Detay |
|---|---|------|-------|
| 1 | Hunter Mode prompt | `engine.ts` L3246-3256 | B2C ban + tarih bilinci |
| 2 | Initiative B2B | `initiative.ts` L268-303 | Dynamic topic selector |
| 3 | LLM timeout fix | `terminalPayloadBuilder.ts` L334-382 | 8 dil statik çeviri |
| 4 | deepAudit fix | `autoRunner.ts` L933+ | Fonksiyon adı + field adı |
| 5 | Sinyal limit | `signalCollector.ts` L154 | 6→12, konu 3→4 |
| 6 | Opportunity fix | `signalEngine.ts` L246-270 | Index-free query |
| 7 | UI labels fix | `page.tsx` L121 | Array `[0]` kaldırıldı |
| 8 | Hammadde dinamik | `page.tsx` L613+ | Ticker'dan canlı okuma |
| 9 | Arşiv linki | `page.tsx` L553+ | "TÜM ARŞİV →" eklendi |

---

## 📋 KALAN GÖREVLER (6 MADDE)

---

### GÖREV 1: Firestore Composite Index Oluştur (2 tane)
**Zorluk:** Kolay | **Tip:** Firebase Console

Bu görev KOD DEĞİL, Firebase Console'dan yapılır. Ama Gemini şunu yapabilir: index gerekip gerekmediğini test etmek için küçük bir API endpoint yazabilir.

**Index 1:**
```
Koleksiyon: trtex_news
Alanlar: category (Ascending) + createdAt (Ascending)
Kullanım: Radar Alert — son 24h haberleri kategoriye göre filtreler
Hata mesajı: FAILED_PRECONDITION: The query requires an index
```

**Index 2:**
```
Koleksiyon: trtex_task_memory  
Alanlar: outcome (Ascending) + timestamp (Descending)
Kullanım: Regression Guard — önceki hataları kontrol eder
Hata mesajı: FAILED_PRECONDITION: The query requires an index
```

**Alternatif çözüm (index oluşturulamazsa):** `autoRunner.ts`'deki Radar (L568 civarı) ve Regression Guard (L464 civarı) sorgularını client-side filter'a çevir — `signalEngine.ts` L246-270'de yaptığımız gibi.

---

### GÖREV 2: deepAudit → Otomatik Onarım Döngüsü
**Zorluk:** Orta | **Dosya:** `src/core/aloha/autoRunner.ts` L933-960

**Mevcut durum:** deepAudit çalışıyor, rapor üretiyor AMA onarım yapmıyor. Sadece loglara yazıyor.

**Yapılması gereken:**
`autoRunner.ts` L944 civarından sonra repair mantığı ekle:

```typescript
// autoRunner.ts — deepAudit sonrası onarım
const auditResult = await deepSiteAudit(projectName);
if (auditResult?.repairPlan?.length > 0) {
  // 1. Kritik onarımları filtrele (priority 1-2)
  const criticalRepairs = auditResult.repairPlan.filter(r => r.priority <= 2);
  
  for (const repair of criticalRepairs.slice(0, 5)) { // Max 5/cycle
    try {
      if (repair.action === 'replace_image' || repair.action === 'add_images') {
        // Görselsiz habere AI görsel üret
        await executeToolCall({
          name: 'scan_missing_images',
          args: { collection: `${projectName}_news`, articleId: repair.articleId, limit: 1, dryRun: false }
        });
      } else if (repair.action === 'fix_slug') {
        // Türkçe slug düzelt
        const { slugify } = await import('@/core/utils/slugify');
        const newSlug = slugify(repair.title);
        await adminDb.collection(`${projectName}_news`).doc(repair.articleId).update({ slug: newSlug });
      }
      // ... diğer repair tipleri
    } catch (e) { /* log and continue */ }
  }
}
```

**repairPlan tipleri** (deepAudit.ts L89-95):
- `fill_content` — boş/kısa body
- `replace_image` — görsel yok veya stok fotoğraf
- `add_keywords` — SEO keyword eksik
- `fix_formatting` — h2/h3 eksik
- `add_ai_commentary` — AI yorum yok
- `add_images` — minimum görsel sayısı altında
- `fix_alt_text` — alt text eksik
- `fix_slug` — Türkçe karakter slug sorunu

---

### GÖREV 3: Opportunity Engine Güçlendirme
**Zorluk:** Orta | **Dosya:** `src/core/aloha/opportunityEngine.ts`

**Mevcut sorun:** 2 haber → 0 fırsat. Çünkü:
1. `getUnprocessedSignals` index hatası → ✅ DÜZELTİLDİ
2. Prompt çok genel — somut veri olmadan fırsat üretmemeli AMA varsa ZORLA üretmeli

**Yapılması gereken:** `opportunityEngine.ts` L105-145 arasındaki prompt'u güçlendir:

```typescript
const analysisPrompt = `Sen AIPyram B2B fırsat analistsin. SERT KURALLAR:

KURAL 1: Sinyalde SOMUT VERİ (sayı, yüzde, tarih, fiyat) VARSA → FIRSAT ZORLA ÜRET
  Örnek sinyal: "Polonya ev tekstili ithalatı %18 arttı"
  → FIRSAT: "Polonya hedefli landing page + SEO kampanyası"

KURAL 2: Sinyalde somut veri YOKSA → ÜRETME, skip et
  Örnek sinyal: "Tekstil sektörü olumlu"
  → SKIP (çöp fırsat üretme)

KURAL 3: Her fırsatın EN AZ 1 çalıştırılabilir tool'u olmalı
  Toolsuz fırsat = çöp fırsat

KURAL 4: "content oluştur" SADECE hedefe yönelik olmalı
  ❌ YANLIŞ: "tekstil hakkında yazı yaz"
  ✅ DOĞRU: "Polonya B2B alıcılarına yönelik Lehçe landing page oluştur"
...`;
```

**Test:** Cycle çalıştırdıktan sonra Firestore'da `aloha_opportunities` koleksiyonunu kontrol et. `tools` array'i boş olmamalı.

---

### GÖREV 4: Premium Rapor Sayfası
**Zorluk:** Orta | **Dosyalar:** Yeni sayfa oluştur

**Mevcut durum:** Ana sayfada "Premium Report" bölümü var (L700-724) ama:
- Başlık/metin HARDCODED
- `/premium` sayfası YOK (404 verir)
- Rapor içeriği oluşturulmuyor

**Yapılması gereken:**

1. `textileResearcher.ts` zaten haftalık araştırma yapıyor. Bu veriyi premium rapor olarak kullan.

2. `terminalPayloadBuilder.ts`'e premium rapor verisi ekle:
```typescript
// terminalPayloadBuilder.ts — premium report bölümü
let premiumReport = null;
try {
  const reportSnap = await adminDb.collection('trtex_intelligence')
    .doc('weekly_report').get();
  if (reportSnap.exists) premiumReport = reportSnap.data();
} catch {}
// payload'a ekle:
hasPremiumReport: !!premiumReport,
premiumReportData: premiumReport,
```

3. `src/app/sites/[domain]/premium/page.tsx` oluştur — Firestore'dan `trtex_intelligence/weekly_report` oku ve göster.

4. Ana sayfadaki hardcoded metinleri payload'dan oku:
```typescript
// page.tsx L707 civarı
<h2>{payload.premiumReportData?.title || 'Türkiye Tekstil Raporu'}</h2>
```

---

### GÖREV 5: Menü Linklerindeki Eksik Sayfalar
**Zorluk:** Düşük | **Tüm menü linkleri zaten çalışıyor**

`[domain]/[category]/page.tsx` catch-all route var ve şu slug'ları destekliyor:
- `/perde` → `trtex_news` WHERE category IN ['PERDE']
- `/ev-tekstili` → filtre: ['EV TEKSTİLİ']
- `/dosemelik` → filtre: ['DÖŞEMELİK']
- `/dekorasyon` → filtre: ['DEKORASYON']
- `/news` veya `/haberler` → filtre yok (tüm haberler)
- `/radar` → `trtex_radar` pointer koleksiyonu
- `/academy` → `trtex_academy` pointer koleksiyonu
- `/opportunities` → `trtex_opportunities` pointer koleksiyonu

**Sorun:** `/radar`, `/academy`, `/opportunities` pointer koleksiyonları doluysa çalışır. AMA bu koleksiyonlara veri YAZAN mekanizma terminaPayloadBuilder'da var mı kontrol et.

**Kontrol et:**
```bash
# Bu koleksiyonlarda veri var mı?
# Firestore: trtex_radar, trtex_academy, trtex_opportunities
```

Eğer boşlarsa → `autoRunner.ts` veya `terminalPayloadBuilder.ts`'e radar/academy/opportunity yazma mantığı ekle. Haberlerden filtreleyerek:
- `category === 'RADAR'` → `trtex_radar` pointer yaz
- `quality_score > 75 && tags.includes('academy')` → `trtex_academy` pointer yaz
- Opportunity Engine output → `trtex_opportunities` pointer yaz

---

### GÖREV 6: Kendi Kendini Geliştirme Döngüsü (Self-Improvement Loop)
**Zorluk:** Yüksek | **EN KRİTİK GÖREV**

**Mevcut durum:** Sistem üretiyor ama kalitesini ölçmüyor ve düzeltmiyor.

**Yapılması gereken — 3 parçalı feedback loop:**

#### Parça A: IQ Skoru Tracking
`terminalPayloadBuilder.ts`'de zaten `payloadConfidence` (IQ skoru) hesaplanıyor. Bunu Firestore'a tarihsel olarak kaydet:
```typescript
// terminalPayloadBuilder.ts — payload yazıldıktan sonra
await adminDb.collection('trtex_iq_history').add({
  date: new Date().toISOString(),
  iq: payloadConfidence,
  articleCount: gridArticles.length,
  imageRate: /* görselli haber oranı */,
  signalCount: /* sinyal sayısı */,
  version: payloadVersion,
});
```

#### Parça B: IQ Düşüş Alarmı
`autoRunner.ts`'de IQ skoru kontrolü:
```typescript
// Son 3 cycle'ın IQ ortalamasını kontrol et
const iqHistory = await adminDb.collection('trtex_iq_history')
  .orderBy('date', 'desc').limit(3).get();
const avgIQ = iqHistory.docs.reduce((sum, d) => sum + d.data().iq, 0) / iqHistory.size;

if (avgIQ < 60) {
  console.warn(`[ALOHA] 🚨 IQ DÜŞÜŞ ALARMI: Ortalama ${avgIQ}/100`);
  // Acil onarım moduna geç: deepAudit + zorla yeni haber üret
}
```

#### Parça C: Öğrenme Kayıt
Her cycle sonunda başarılı/başarısız aksiyonları `trtex_task_memory`'ye yaz (zaten kısmen var `executiveLayer.ts`'de). Ama öğrenmeleri bir sonraki cycle'da KULLANAN mekanizma güçlendirilmeli.

---

## 🧪 DOĞRULAMA KOMUTLARI

Build testi:
```bash
cd c:\Users\MSI\Desktop\aipyramweb
pnpm run build
# exit code 0 olmalı
```

Cycle testi (local dev server çalışırken):
```bash
curl -X POST http://localhost:3001/api/cron/aloha-cycle \
  -H "Authorization: Bearer aloha-cron-sovereign-2026" \
  -H "Content-Type: application/json"
```

Terminal payload testi:
```bash
curl -X POST http://localhost:3001/api/brain/v1/trigger \
  -H "Content-Type: application/json" \
  -d '{"tool":"force_terminal_payload","args":{"project":"trtex"}}'
```

---

## 📊 BAŞARI KRİTERLERİ

| Kriter | Şu An | Hedef |
|--------|-------|-------|
| Build | ✅ 0 hata | ✅ 0 hata |
| deepAudit onarım | Rapor üretiyor, onarım yok | Kritik onarımlar otomatik |
| Opportunity Engine | 0 fırsat | ≥1 fırsat/cycle |
| IQ Skoru | 63/100 | ≥75/100 |
| Premium sayfa | 404 | Çalışan sayfa |
| Self-improvement | Yok | IQ tracking + alarm |
| Radar/Academy/Opp sayfaları | Pointer koleksiyonu boş olabilir | Veri akışı aktif |

---

## ⚡ ÖNCELİK SIRASI

```
1. GÖREV 2: deepAudit onarım → Kalite güvencesi (EN ACİL)
2. GÖREV 3: Opportunity Engine → Para makinesi
3. GÖREV 6: Self-improvement → Uzun vadeli stabilite
4. GÖREV 5: Pointer koleksiyonları → Menü sayfaları
5. GÖREV 4: Premium rapor → Ek gelir
6. GÖREV 1: Firestore index → Console'dan 2 tık
```
