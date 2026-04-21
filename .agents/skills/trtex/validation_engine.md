# SKILL NAME: trtex_validation_engine

## VERSION: 1.0 — 12 Nisan 2026
## OWNER: Aloha Master Orchestrator
## SCOPE: TRTEX Kalite Kontrol ve Son Onay Kapısı

---

## PURPOSE

Üretilen tüm çıktıların (haber, trade_matrix, lead, görsel) satışa uygun olup olmadığını kontrol etmek.
**Bu "Hakan'ın Filtresi"dir.** "Ben bunu MSI ekranımda görmek ister miyim?" testi.

**Temel Prensip:** Validation Engine'den geçemeyen hiçbir şey yayınlanamaz, gönderilemez, kaydedilemez.

---

## INPUT

```json
{
  "article": "news_producer çıktısı (title, content, tags, ai_commentary...)",
  "trade_matrix": "trade_matrix_builder çıktısı (opsiyonel — sadece trade içerikler)",
  "lead": "lead_generator çıktısı (opsiyonel — sadece outreach yapılacaksa)",
  "images": ["görsel URL'leri veya prompt'ları (opsiyonel)"],
  "validation_type": "article | trade_matrix | lead | image | full_pipeline"
}
```

---

## OUTPUT

```json
{
  "validation_result": {
    "score": 0-100,
    "status": "APPROVED | REWRITE | REJECT",
    "grade": "A+ | A | B | C | F",
    "issues": [
      {
        "field": "string — sorunlu alan",
        "severity": "critical | warning | info",
        "message": "string — ne yanlış",
        "fix_suggestion": "string — nasıl düzeltilir"
      }
    ],
    "passed_checks": ["string — geçen kontroller"],
    "failed_checks": ["string — kalan kontroller"],
    "auto_fixable": true/false,
    "reasoning": "string — genel değerlendirme"
  }
}
```

---

## DECISION LOGIC

### Skor → Durum Eşleme

```
score 90-100 → APPROVED (grade: A+/A) → yayınla
score 70-89  → APPROVED (grade: B)    → yayınla ama uyarı logla
score 60-69  → REWRITE  (grade: C)    → düzelt ve tekrar kontrol
score 0-59   → REJECT   (grade: F)    → DLQ'ya gönder
```

### Otomatik Düzeltme Kararı

```
IF status == "REWRITE" AND auto_fixable == true
  → validation_engine düzeltmeyi kendi uygular (kelime değişimi, SEO ekleme)
  → düzeltildikten sonra tekrar kontrol (max 2 retry)

IF status == "REWRITE" AND auto_fixable == false
  → news_producer'a geri gönder (yeniden üretim)

IF status == "REJECT"
  → DLQ'ya kaydet
  → aloha_lessons'a "neden reddedildi" bilgisi yaz
```

---

## VALIDATION CHECKS

### A. MAKALE KALİTE KONTROL (validation_type: article)

| # | Kontrol | Ağırlık | Geçme Kriteri | Puan |
|---|---------|---------|---------------|------|
| A1 | Kelime sayısı | 10 | >= 400 kelime | 0 veya 10 |
| A2 | Firma adı varlığı | 10 | >= 1 gerçek firma | 0 veya 10 |
| A3 | Rakam/yüzde varlığı | 10 | >= 3 rakam | 0-10 (1=3, 2=6, 3=10) |
| A4 | Şehir/ülke varlığı | 5 | >= 1 coğrafi referans | 0 veya 5 |
| A5 | Ürün referansı | 5 | >= 1 somut ürün | 0 veya 5 |
| A6 | Yasak ifade kontrolü | 10 | 0 yasak ifade | 0 veya 10 |
| A7 | SEO keyword sayısı | 10 | >= 8 keyword | 0-10 (orantılı) |
| A8 | Alt başlık (H2) | 5 | >= 2 H2 | 0 veya 5 |
| A9 | AI CEO bloğu | 10 | Var ve 100+ karakter | 0 veya 10 |
| A10 | Business opportunities | 10 | >= 3 fırsat | 0-10 (orantılı) |
| A11 | Görsel prompt | 5 | 3 prompt | 0 veya 5 |
| A12 | Başlık uzunluğu | 5 | 6-12 kelime | 0 veya 5 |
| A13 | Summary hook | 5 | 2-3 cümle, actionable | 0 veya 5 |

**Toplam: 100 puan**

### B. TRADE MATRIX KALİTE KONTROL (validation_type: trade_matrix)

| # | Kontrol | Ağırlık | Geçme Kriteri |
|---|---------|---------|---------------|
| B1 | sellable_asset fiziksel mi? | 25 | Somut ürün adı (kumaş, perde, iplik...) |
| B2 | target_market ülke+sektör? | 25 | "Almanya" değil → "Almanya B2B Otel" |
| B3 | offer_hook somut mu? | 20 | "Kaliteli ürünler" → REJECT |
| B4 | why_buy_now gerçek mi? | 15 | Tarih/rakam/regülasyon içermeli |
| B5 | cross_project doğru mu? | 10 | Perde → perde.ai, tekstil → hometex.ai |
| B6 | offer_hook kelime sayısı | 5 | <= 20 kelime |

### C. LEAD KALİTE KONTROL (validation_type: lead)

| # | Kontrol | Ağırlık |
|---|---------|---------|
| C1 | Mesaj uzunluğu | 20 | <= 5 satır |
| C2 | Somut teklif var mı? | 25 | offer_hook mesajda geçiyor mu? |
| C3 | Haber linki var mı? | 15 | article_reference zorunlu |
| C4 | Kanal coğrafyaya uygun mu? | 15 | Avrupa→LinkedIn, MENA→WhatsApp |
| C5 | Dil doğru mu? | 10 | DACH→de/en, Çin→zh/en |
| C6 | Günlük limit kontrolü | 15 | Max 10 outreach/gün |

### D. GÖRSEL KALİTE KONTROL (validation_type: image)

| # | Kontrol | Kural |
|---|---------|-------|
| D1 | "Manifaturacı" sığlığı var mı? | Kaba, düşük kalite → REJECT |
| D2 | Soğuk ton mu? | Gri/mavi buz → REJECT (sıcak tonlar zorunlu) |
| D3 | Boş oda mı? | Hayatsız, mobilyasız → REJECT |
| D4 | Stok fotoğraf havası? | Yapay, plastik → REJECT |
| D5 | Dosya ismi SEO uyumlu mu? | kebab-case, ülke-ürün-renk formatı |

---

## RULES

1. **Validation Engine ASLA bypass edilemez** — hiçbir shortcut yok
2. **Hakan'dan gelen (source: manual) → minimum B grade ile geçer** (ama kontrol yine yapılır)
3. **Aynı sorun 3 kez tekrarlanırsa → aloha_lessons'a "pattern" olarak kaydet**
4. **Validation sonucu ŞEFFAF olmalı** — neden reddedildi, hangi check fail etti, nasıl düzeltilir
5. **REWRITE → max 2 retry** — 3. denemede hâlâ geçemiyorsa → REJECT + DLQ
6. **Sıfır tolerans alanlar (critical severity):**
   - Yasak ifade kullanımı
   - sellable_asset boş
   - target_market boş
   - Mesaj > 5 satır (lead)

---

## PIPELINE ENTEGRASYONU

```
news_producer → ÇIKTI
      ↓
validation_engine.validate("article") → APPROVED?
      ↓ EVET                               ↓ HAYIR
trade_matrix_builder                   REWRITE / REJECT
      ↓
validation_engine.validate("trade_matrix") → APPROVED?
      ↓ EVET                                    ↓ HAYIR
lead_generator                              REWRITE / REJECT
      ↓
validation_engine.validate("lead") → APPROVED?
      ↓ EVET                             ↓ HAYIR
PUBLISH + OUTREACH                  REWRITE / REJECT
```

**Her aşamada validation geçmeden sonraki aşamaya GEÇİLMEZ.**

---

## FAILURE MODE

```
IF validation süresi > 10 saniye → timeout, DLQ
IF validation çağrısı kendisi hata verirse → article "DRAFT" olarak kaydet
IF 3 retry sonrası hâlâ REWRITE → REJECT + DLQ + aloha_lessons

Firestore yazım:
  Her validation sonucu → aloha_metrics koleksiyonuna (istatistik)
  REJECT → system_errors koleksiyonuna (DLQ)
  Pattern tespiti → aloha_lessons koleksiyonuna (öğrenme)
```

---

## EXAMPLE

**Input (article validation):**
```json
{
  "article": {
    "title": "Menderes Tekstil, Almanya İhracatını %32 Artırdı",
    "content": "Denizli merkezli Menderes Tekstil, 2026 Q1'de... (450 kelime)",
    "tags": ["menderes", "almanya", "ihracat", "ev-tekstili", "nevresim"],
    "seo_keywords": ["perde", "ev tekstili", "almanya ihracat", "menderes tekstil", "organik pamuk", "nevresim", "B2B", "perde tasarım"],
    "ai_commentary": "Menderes'in Almanya hamlesi, Türk ev tekstili sektörünün...",
    "business_opportunities": ["Organik sertifika talebi artıyor", "DACH pazarı büyüyor", "MOQ düşürme stratejisi"],
    "image_prompts": ["...", "...", "..."]
  },
  "validation_type": "article"
}
```

**Output:**
```json
{
  "validation_result": {
    "score": 93,
    "status": "APPROVED",
    "grade": "A",
    "issues": [],
    "passed_checks": ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12", "A13"],
    "failed_checks": [],
    "auto_fixable": false,
    "reasoning": "Haber tüm kalite kriterlerini karşılıyor. Firma adı, rakamlar, ürün ve coğrafi referans mevcut. Yayına hazır."
  }
}
```
