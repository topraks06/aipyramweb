# SKILL NAME: trtex_trade_matrix_builder

## VERSION: 1.0 — 12 Nisan 2026
## OWNER: Aloha Master Orchestrator
## SCOPE: TRTEX Weaponized Commerce Engine

---

## PURPOSE

Haberin içindeki "gizli parayı" bulmak ve satışa dönüştürülebilir veri üretmek.
**Haber = Bahane. Asıl ürün = Çözüm.**

Bu skill çalıştığında her haber bir "Dijital Satış Temsilcisi"ne dönüşür.

---

## INPUT

```json
{
  "article_title": "string",
  "article_content": "string",
  "article_category": "string",
  "article_tags": ["string"],
  "macro_signal": "opsiyonel — kriz, regülasyon, kur, lojistik sinyali"
}
```

---

## OUTPUT

```json
{
  "trade_matrix": {
    "sellable_asset": "string — fiziksel ürün (kumaş, perde, tül, iplik)",
    "target_market": "string — ülke + sektör (örn: Almanya B2B Otel Tedarikçileri)",
    "intent_type": "buy | sell | partnership",
    "sector": "string — home_textile | curtain | hospitality | healthcare | retail",
    "why_buy_now": "string — gerçek, somut satın alma sebebi",
    "offer_hook": "string — max 20 kelime, satış cümlesi",
    "price_position": "budget | mid | premium | luxury",
    "urgency_level": "cold | warm | hot | critical",
    "b2b_match_target": "string — hedef AIPyram projesi (perde.ai, hometex, trtex)",
    "suggested_cta": "string — CTA butonu metni",
    "cross_project": "string — perde.ai | hometex.ai | didimemlak | trtex",
    "priority_tier": "tier1_direct_sale | tier2_nurture | tier3_traffic",
    "estimated_value": "low | medium | high | premium",
    "validation_score": 0-100
  }
}
```

---

## DECISION LOGIC

### AŞAMA 1: Ürün Çıkarma
```
IF haberde somut ürün adı var (perde, tül, kumaş, nevresim...)
  → sellable_asset = o ürün
IF haberde ürün yok AMA sektör sinyali var
  → sellable_asset AI tarafından TÜRET (Türkiye'nin ihraç ettiği ilgili ürün)
IF haberden hiçbir ürün çıkmıyor
  → validation_score = 0, intent_type = null → DLQ
```

### AŞAMA 2: Hedef Pazar Eşleme
```
IF haberde ülke adı geçiyor → target_market = o ülke + sektör
IF ülke yok → VARSAYILAN hedef pazarlar:
  - Perde → Almanya, Polonya, İngiltere
  - Otel tekstili → BAE, Suudi Arabistan
  - Genel ev tekstili → ABD, Fransa
  - Hammadde → Çin, Hindistan, Bangladeş
```

### AŞAMA 3: Aciliyet ve Değer
```
urgency_level hesaplama:
  critical → Regülasyon deadline var (< 6 ay)
  hot      → Fiyat avantajı VAR + rakip boşluk
  warm     → Trend büyüyor ama acil değil
  cold     → Genel bilgi, satış yok

priority_tier hesaplama:
  tier1_direct_sale → urgency hot/critical + ürün somut + pazar net
  tier2_nurture     → ürün var + pazar var ama aciliyet cold/warm
  tier3_traffic     → sadece bilgilendirme, satış sinyali zayıf
```

---

## RULES

1. **sellable_asset FİZİKSEL ÜRÜN olmalı** — "hizmet", "danışmanlık", "çözüm" gibi soyut terimler YASAK
2. **target_market ÜLKE + SEKTÖR içermeli** — sadece "Almanya" yetmez → "Almanya B2B Otel Zincirleri"
3. **offer_hook SATIŞ CÜMLESİ olmalı** — genel ifade YASAK
4. **why_buy_now GERÇEK SEBEP olmalı** — "pazar büyüyor" yetmez → "AB dijital ürün pasaportu Q3 2027 zorunlu"
5. **cross_project DOĞRU EŞLENMELİ:**
   - Perde/tül/stor → `perde.ai`
   - Genel ev tekstili → `hometex.ai`
   - Lüks gayrimenkul → `didimemlak`
   - İhracat fırsatı → `trtex` (kendi)
6. **validation_score < 60 → DLQ'ya düş, yayınlanmasın**

---

## CTA (Dinamik Aksiyon Butonları)

```
cross_project = "perde.ai"   → CTA: "AI ile Perde Tasarla" → perde.ai/studio
intent_type = "buy"          → CTA: "Toptan Fiyat Al" → /contact?ref=trade
intent_type = "sell"         → CTA: "Teklif Al" → /contact?ref=article
intent_type = "partnership"  → CTA: "İş Birliği Formu" → /is-birligi-firsatlari
urgency = "critical"         → CTA: "Hemen İletişime Geç" → /contact?ref=urgent
DEFAULT                      → CTA: "Detay Al" → /contact
```

---

## QUALITY CONTROL

| # | Kontrol | Kural | Geçemezse |
|---|---------|-------|-----------|
| 1 | sellable_asset boş mu? | Fiziksel ürün zorunlu | REJECT |
| 2 | target_market boş mu? | Ülke + sektör zorunlu | REJECT |
| 3 | offer_hook > 20 kelime | Max 20 kelime | REWRITE |
| 4 | offer_hook genel mi? | "Kaliteli ürünler" gibi → YASAK | REWRITE |
| 5 | why_buy_now somut mu? | Gerçek tarih/rakam/regülasyon | REWRITE |
| 6 | validation_score < 60 | Minimum eşik | DLQ |

---

## FAILURE MODE

```
IF sellable_asset üretilemiyorsa → validation_score = 0, DLQ
IF target_market belirlenemiyorsa → varsayılan pazar ata, validation_score -= 20
IF offer_hook 3 denemede geçmezse → "Teklif Al" fallback, skor -= 10
IF validation tamamlansa bile score < 60 → habere trade_matrix EKLEME

Firestore yazım:
  → trtex_news/{docId} → trade_matrix alanı (merge: true)
  → aloha_signals koleksiyonuna → CTA tıklandığında intent signal yazılır
```

---

## EXAMPLE (İYİ)

**Haber:** "Almanya, 2027'den itibaren otel tekstilinde yangın dayanıklılık sertifikası zorunlu kılıyor"

```json
{
  "trade_matrix": {
    "sellable_asset": "FR (Flame Retardant) sertifikalı blackout perde kumaşı",
    "target_market": "Almanya B2B Otel Zincirleri ve İç Mimar Stüdyoları",
    "intent_type": "sell",
    "sector": "hospitality",
    "why_buy_now": "Almanya 2027 Q1 yangın yönetmeliği — mevcut stoklar uyumsuz olacak",
    "offer_hook": "Turkey-made FR blackout curtains, EN 13773 certified, 3-week delivery",
    "price_position": "mid",
    "urgency_level": "hot",
    "b2b_match_target": "perde.ai toptan alım platformu",
    "suggested_cta": "Sertifikalı Ürün Kataloğu Al",
    "cross_project": "perde.ai",
    "priority_tier": "tier1_direct_sale",
    "estimated_value": "high",
    "validation_score": 92
  }
}
```

## ANTI-EXAMPLE (KÖTÜ)

```json
{
  "trade_matrix": {
    "sellable_asset": "tekstil ürünleri",
    "target_market": "Avrupa",
    "why_buy_now": "pazar büyüyor",
    "offer_hook": "kaliteli Türk ürünleri"
  }
}
```
→ Hiçbir şey somut değil ❌ Genel ❌ Aksiyon yok ❌
