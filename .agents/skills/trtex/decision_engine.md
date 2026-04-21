# SKILL NAME: trtex_decision_engine

## VERSION: 1.0 — 12 Nisan 2026
## OWNER: Aloha Master Orchestrator
## SCOPE: TRTEX B2B Tekstil İstihbarat Terminali

---

## PURPOSE

Aloha'nın kaynaklarını (API token, Gemini çağrısı, görsel üretim) YALNIZCA ticari yerçekimi olan konulara odaklamak.
"Bu işe vakit harcamaya değer mi?" sorusunun KODLANMIŞ cevabı.

**Temel Prensip:** Haber okuyucuya ya para KAZANDIRIR ya da para KAYBETMESİNİ engeller. Hiçbirini yapmıyorsa → REJECT.

---

## INPUT

```json
{
  "topic": "string — haber konusu / trend sinyali",
  "source": "string — sinyal kaynağı (web_search, ticker, fuar, manual)",
  "category": "string — makro|ülke|hammadde|fuar|ürün|teknoloji|firma|regülasyon",
  "raw_data": "string — ham veri / snippet (opsiyonel)"
}
```

---

## OUTPUT

```json
{
  "decision": "PROCESS | SKIP | REJECT",
  "commercial_gravity": 0-100,
  "reasoning": "string — 1 cümle karar gerekçesi",
  "priority": "critical | high | normal | low",
  "suggested_angle": "string — haberin ticari açısı (opsiyonel)",
  "target_segments": ["string — hedef kitle segmentleri"]
}
```

---

## DECISION LOGIC (Karar Ağacı)

### AŞAMA 1: Sektör Filtresi
```
IF konu ∉ (ev_tekstili, perde, kumaş, iplik, hammadde, lojistik, fuar, B2B_ticaret)
  → REJECT (commercial_gravity: 0, reasoning: "Sektör dışı")
```

### AŞAMA 2: Ticari Yerçekimi Skoru
```
commercial_gravity = 0

+30  → Doğrudan ürün/fiyat/tedarik bilgisi var
+25  → Hedef pazar (Almanya, BAE, İngiltere, Polonya, ABD) ile bağlantı var
+20  → Regülasyon değişikliği (AB Yeşil Mutabakat, yangın yönetmeliği, OEKO-TEX)
+15  → Rakip/firma haberi (Menderes, TAÇ, Sunvim, Luolai, Nitori)
+15  → Hammadde fiyat hareketi (pamuk, PTA, polyester, navlun)
+10  → Fuar yaklaşıyor (Heimtextil, Hometex, M&O) — 60 gün kala 1.5x çarpan
+10  → Jeopolitik etki (Süveyş, savaş, ticaret savaşı, near-shoring)
+5   → Genel sektör trendi (akıllı tekstil, sürdürülebilirlik)

PERDE ÇARPANI:
  IF konu.contains(perde, tül, blackout, stor, window_covering)
    → commercial_gravity × 1.3 (perde ALTIN ALAN)
```

### AŞAMA 3: Karar
```
IF commercial_gravity >= 60  → PROCESS (priority: high/critical)
IF commercial_gravity 40-59  → PROCESS (priority: normal)
IF commercial_gravity 20-39  → SKIP (logla, sonra değerlendir)
IF commercial_gravity < 20   → REJECT
```

### AŞAMA 4: Önceliklendirme
```
critical  → commercial_gravity >= 80 VEYA regülasyon değişikliği VEYA kriz
high      → commercial_gravity >= 60
normal    → commercial_gravity >= 40
low       → commercial_gravity < 40 ama SKIP edilmedi
```

---

## RULES (Değişmez Kurallar)

1. **Revenue-First:** Her karar "Bu para üretir mi?" sorusuyla başlar
2. **Perde Öncelik:** Perde konuları otomatik +30% ağırlık alır
3. **Tekrar Engeli:** Son 48 saatte aynı konu işlendiyse → SKIP (topics_used kontrolü)
4. **Günlük Denge:** Aynı kategoriden günde max 2 haber (çeşitlilik zorunlu)
5. **Firma Adı Zorunlu:** commercial_gravity >= 60 ise haberde en az 1 gerçek firma adı olmalı
6. **Yasak Konular:** Magazin, son kullanıcı dekorasyon tüyoları, "moda trendi" (B2C) → REJECT

---

## QUALITY CONTROL

| Kontrol | Kural |
|---------|-------|
| Sektör uyumu | %100 ev tekstili / perde odaklı |
| Firma/rakam varlığı | En az 1 firma + 1 rakam/yüzde |
| Tekrar kontrolü | topics_used cache ile çapraz kontrol |
| Ticari açı | suggested_angle boş olamaz (gravity >= 40) |

---

## FAILURE MODE

```
IF decision == "REJECT" AND source == "manual" (Hakan'dan gelen)
  → ASLA REJECT etme, priority: critical olarak işle

IF decision == "SKIP"
  → aloha_lessons koleksiyonuna kaydet (öğrenme)
  → 7 gün sonra aynı konu tekrar gelirse yeniden değerlendir

IF karar_süresi > 5 saniye
  → DLQ'ya kaydet, fallback: PROCESS (priority: normal)
```

---

## EXAMPLE

**Input:**
```json
{
  "topic": "AB, 2027'den itibaren tüm tekstil ürünlerinde dijital ürün pasaportu zorunluluğu getiriyor",
  "source": "web_search",
  "category": "regülasyon"
}
```

**Output:**
```json
{
  "decision": "PROCESS",
  "commercial_gravity": 85,
  "reasoning": "AB regülasyon değişikliği + doğrudan ihracat etkisi + sertifikasyon fırsatı",
  "priority": "critical",
  "suggested_angle": "Türk ihracatçılar için DPP uyum rehberi + erken hareket avantajı",
  "target_segments": ["ihracatçılar", "sertifikasyon_firmaları", "DACH_alıcıları"]
}
```
