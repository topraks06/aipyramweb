# SKILL NAME: trtex_lead_generator

## VERSION: 1.0 — 12 Nisan 2026
## OWNER: Aloha Master Orchestrator
## SCOPE: TRTEX Stratejik Müşteri Kazanım Motoru

---

## PURPOSE

trade_matrix çıktısını alıp potansiyel B2B müşteri profili ve ilk temas mesajı üretmek.
**Aloha'nın "Avcı" modu.** İçerikten ticari ilişkiye geçiş kapısı.

**Temel Prensip:** İçerik = Bahane. Mesaj = Köprü. Satış = Hedef.

---

## INPUT

```json
{
  "trade_matrix": "trade_matrix_builder çıktısı (tam JSON)",
  "article_title": "string — haber başlığı (referans için)",
  "article_url": "string — haber linki (mesajda kullanılacak)"
}
```

---

## OUTPUT

```json
{
  "lead_profile": {
    "country": "string — hedef ülke",
    "sector": "string — hedef sektör",
    "company_type": "string — alıcı firma tipi (otel zinciri, mağaza, distribütör, iç mimar)",
    "company_size": "small | medium | enterprise",
    "decision_maker_role": "string — Procurement Manager, Design Director, vb.",
    "contact_channels": ["LinkedIn", "Email", "WhatsApp", "WeChat"],
    "primary_channel": "string — birincil kanal",
    "language": "string — mesaj dili (en, de, fr, ar, zh, ru)"
  },
  "outreach_message": {
    "subject": "string — email subject / LinkedIn headline",
    "body": "string — max 5 satır, somut teklif içerir",
    "cta": "string — tek aksiyon cümlesi",
    "article_reference": "string — haber linki"
  },
  "lead_score": 0-100,
  "recommended_action": "send_now | queue_for_review | skip"
}
```

---

## DECISION LOGIC

### AŞAMA 1: Kanal Seçimi (Coğrafyaya Göre)

```
AVRUPA (EU / DACH / UK / Nordik):
  primary_channel = "LinkedIn"
  secondary = "Email"
  language = "en" (İngiltere, Nordik) | "de" (DACH) | "fr" (Fransa)
  üslup = Resmi, teknik veri odaklı, sertifika vurgulu

ORTA DOĞU (BAE, Suudi, Katar, Kuveyt):
  primary_channel = "WhatsApp"
  secondary = "Email"
  language = "en" (iş dili) | "ar" (opsiyonel)
  üslup = İlişki odaklı, lüks vurgulu, hızlı çözüm

ASYA-PASİFİK (Çin, Japonya, G.Kore):
  primary_channel = "WeChat" (Çin) | "Email" (diğer)
  secondary = "LinkedIn"
  language = "en" | "zh" (Çin)
  üslup = Fiyat/performans, lojistik hızı, MOQ odaklı

AMERİKA (ABD, Kanada):
  primary_channel = "Email"
  secondary = "LinkedIn"
  language = "en"
  üslup = Direkt, ROI odaklı, vaka çalışması vurgulu

TÜRKİYE (iç pazar):
  primary_channel = "WhatsApp"
  secondary = "Email"
  language = "tr"
  üslup = Samimi ama profesyonel
```

### AŞAMA 2: Lead Skoru Hesaplama

```
lead_score = trade_matrix.validation_score * 0.6 + kanal_uygunluk * 0.2 + aciliyet * 0.2

kanal_uygunluk:
  LinkedIn profil bulunabilir → +20
  Email domain tahmin edilebilir → +15
  WhatsApp numarası bilinmiyor → +5

aciliyet (trade_matrix.urgency_level):
  critical → +20
  hot → +15
  warm → +10
  cold → +5
```

### AŞAMA 3: Aksiyon Kararı

```
IF lead_score >= 80 → recommended_action = "send_now"
IF lead_score 60-79 → recommended_action = "queue_for_review"
IF lead_score < 60  → recommended_action = "skip"

IF trade_matrix.priority_tier == "tier1_direct_sale" 
  → recommended_action OVERRIDE → "send_now"
```

---

## MESSAGE TEMPLATE (Altın Şablon)

### LinkedIn / Email (Avrupa)
```
Subject: [sector] insight from Turkey — [sellable_asset]

Hi [Name],

We're seeing growing demand in [country] for [sellable_asset], 
especially after [why_buy_now].

Here's our latest analysis:
[article_url]

We supply directly from Turkey with competitive pricing 
and [delivery_time] delivery.

Would it make sense to explore this for your projects?

Best regards,
TRTEX Intelligence
```

### WhatsApp (Orta Doğu)
```
Merhaba [Name] 👋

[sellable_asset] konusunda [country] pazarında güçlü talep görüyoruz.

🔗 [article_url]

Türkiye'den direkt tedarik, hızlı teslimat.
Detay paylaşabilir miyim?
```

---

## RULES

1. **Mesaj max 5 satır** — kısa ve net (uzun mesaj okunmaz)
2. **Her mesajda SOMUT TEKLİF olmalı** — offer_hook mesajda kullanılmalı
3. **Haber linki ZORUNLU** — güvenilirlik sağlar
4. **Günlük max 10 kişi** — daha fazla SPAM'dır
5. **Aynı firmaya 30 gün içinde max 2 mesaj** — ısrarcılık YASAK
6. **Yanıt gelen → Firestore'a HOT LEAD kaydet** (`trtex_leads` koleksiyonu)
7. **Yanıt gelmeyen → 14 gün sonra farklı açıyla 1 kez daha dene**
8. **"Unsubscribe" / "Not interested" → KALICI KARA LİSTE**

---

## QUALITY CONTROL

| # | Kontrol | Kural |
|---|---------|-------|
| 1 | Mesaj < 5 satır mı? | Uzun mesaj REJECT |
| 2 | offer_hook mesajda var mı? | Somut teklif zorunlu |
| 3 | Haber linki var mı? | article_url zorunlu |
| 4 | Dil doğru mu? | Ülkeye uygun dil |
| 5 | Kanal doğru mu? | Coğrafyaya uygun kanal |
| 6 | Günlük limit aşılmadı mı? | Max 10 outreach/gün |
| 7 | Tekrar kontrolü | 30 gün kuralı |

---

## FAILURE MODE

```
IF trade_matrix.validation_score < 60
  → lead üretme, haber sadece trafik amaçlı

IF mesaj 3 denemede quality gate geçemezse
  → DLQ + fallback: genel şablon kullan

IF outreach_limiti aşıldıysa (10/gün)
  → kuyruğa ekle, ertesi gün gönder

Firestore yazım:
  lead_score >= 70 → trtex_leads koleksiyonuna kaydet
  lead_score < 70 → sadece aloha_signals'a logla
  Yanıt gelen → status: "hot", Firestore güncelle
```

---

## EXAMPLE

**Input trade_matrix:**
```json
{
  "sellable_asset": "FR sertifikalı blackout perde kumaşı",
  "target_market": "Almanya B2B Otel Zincirleri",
  "urgency_level": "hot",
  "offer_hook": "EN 13773 certified FR curtains, 3-week delivery from Turkey",
  "priority_tier": "tier1_direct_sale"
}
```

**Output:**
```json
{
  "lead_profile": {
    "country": "Almanya",
    "sector": "Hospitality / Otel Tedarik",
    "company_type": "Otel zinciri iç mimar departmanı / FF&E tedarikçi",
    "company_size": "medium",
    "decision_maker_role": "Procurement Manager / Interior Design Director",
    "contact_channels": ["LinkedIn", "Email"],
    "primary_channel": "LinkedIn",
    "language": "en"
  },
  "outreach_message": {
    "subject": "Hotel textile insight — FR certified curtains from Turkey",
    "body": "Hi [Name],\n\nWith Germany's upcoming fire safety regulation update, hotel textile suppliers are actively sourcing EN 13773 certified products.\n\nWe supply FR blackout curtains directly from Turkey with 3-week delivery.\n\nHere's our latest market analysis: [article_url]\n\nWould a quick call make sense?",
    "cta": "Schedule a 15-min call",
    "article_reference": "https://trtex.com/news/almanya-otel-yangin-yonetmeligi-2027"
  },
  "lead_score": 88,
  "recommended_action": "send_now"
}
```
