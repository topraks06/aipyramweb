# 🔍 TRTEX KAPSAMLI DENETİM RAPORU — Claude Opus (30 Nisan 2026)

> **GEMİNİ:** Bu raporu satır satır oku. İçindeki görevleri sırasıyla yap. Her görev sonunda `pnpm run build` çalıştır. Hata varsa düzelt. Tamamını bitirince `git add -A && git commit` yap. **Mock veri ASLA ekleme.**

---

## 1. 🔴 KRİTİK HATA — HEMEN DÜZELT

### 1.1 ✅ Middleware `/firmalar` Redirect (Claude düzeltti)
- **Dosya:** `src/middleware.ts` satır 47-62
- **Durum:** `/firmalar` → `/manufacturers` eklendi ✅

### 1.2 Haber Detay Sayfasına Article JSON-LD Schema Ekle
- **Dosya:** `src/app/sites/[domain]/news/[slug]/page.tsx`
- **Sorun:** Google News'de görünmek için `NewsArticle` schema ZORUNLU ama şu anda YOK.
- **Yapılacak:** `generateMetadata` fonksiyonunun altına şu JSON-LD'yi ekle:

```tsx
// page.tsx içinde, return JSX'in en üstüne ekle:
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": article.title,
  "datePublished": article.createdAt || article.publishedAt,
  "dateModified": article.updatedAt || article.createdAt,
  "author": { "@type": "Organization", "name": "TRTEX Intelligence" },
  "publisher": {
    "@type": "Organization",
    "name": "TRTEX",
    "url": "https://trtex.com"
  },
  "description": article.summary || article.commercial_note || "",
  "image": article.images?.[0] || article.image_url || "",
  "mainEntityOfPage": { "@type": "WebPage", "@id": `https://trtex.com/haberler/${article.slug}` }
}) }} />
```

---

## 2. 🟡 SAYFA İÇERİK DENETİMİ — Mock Var mı Kontrol Et

Aşağıdaki sayfaları aç ve içlerinde `Math.random`, hardcoded dizi, sahte veri, `mock`, `sample`, `dummy` anahtar kelimeleri ara. Varsa temizle, Firestore'dan gerçek veri çekilmesini sağla:

| # | Sayfa | Dosya | Kontrol Et |
|---|-------|-------|------------|
| 1 | **Trendler** | `src/app/sites/[domain]/trends/page.tsx` | Mock trend verisi var mı? |
| 2 | **Fuar Takvimi** | `src/app/sites/[domain]/fairs/page.tsx` | Hardcoded fuar listesi var mı? |
| 3 | **Akademi** | `src/app/sites/[domain]/academy/page.tsx` | Sahte eğitim içeriği var mı? |
| 4 | **Ticaret** | `src/app/sites/[domain]/trade/page.tsx` | Mock ticaret verisi var mı? |
| 5 | **Fırsatlar** | `src/app/sites/[domain]/opportunities/page.tsx` | Statik fırsat listesi var mı? |

**KURAL:** Veri yoksa boş sayfa gösterme, bunun yerine:
```tsx
<div style={{ textAlign: 'center', padding: '4rem' }}>
  <p>📡 Otonom motor çalışıyor. Veriler yakında burada olacak.</p>
</div>
```

---

## 3. 🟡 ANA SAYFA MİMARİSİ (ÖNEMLİ — Hakan Bey Uyarısı)

> **"Dün farklı ana sayfa, bugün farklı ana sayfa — bu ilerde başımızı inanılmaz ağrıtır"**

### Mevcut Durum:
- TRTex ana sayfası `PremiumB2BHomeLayout.tsx` — **480+ satır TEK dosya**
- Tüm node'lar (perde, hometex, vorhang, heimtex, icmimar, curtaindesign) `page.tsx`'deki domain routing ile ayrılıyor

### Yapılacak:
`PremiumB2BHomeLayout.tsx`'i section bazında ayrı bileşenlere böl:

```
src/components/home/
├── PremiumB2BHomeLayout.tsx  (ana iskelet — max 100 satır)
├── sections/
│   ├── HeroSection.tsx
│   ├── NewsGridSection.tsx
│   ├── TenderRadarSection.tsx
│   ├── FairCalendarSection.tsx
│   ├── AcademySection.tsx
│   ├── RadarSection.tsx
│   ├── EcosystemSection.tsx
│   ├── CtaSection.tsx
│   └── NewsletterSection.tsx
```

**DİKKAT:** Bu refactoring sırasında HİÇBİR özellik kaldırılmamalı. Sadece kodun yapısı değişmeli.

---

## 4. 🟡 SEO EKSİKLERİ

### 4.1 Sitemap'e Yeni Sayfaları Ekle
- **Dosya:** `src/app/api/sitemap/route.ts`
- **Ekle:** `/manufacturers` sayfasını sitemap'e dahil et

### 4.2 hreflang Diğer Sayfalara da Ekle
Şu anda sadece ana sayfada hreflang var. Haberler, ihaleler, trendler, firmalar sayfalarına da 8 dil hreflang ekle.

---

## 5. 📊 AJAN EĞİTİMLERİ VE HARCAMA LİMİTLERİ DURUMU

### Skill Dosyaları (Eğitim):
| Dosya | Konum | Durum |
|-------|-------|-------|
| `news_producer.md` | `.agents/skills/trtex/` | ✅ 196 satır, detaylı |
| `decision_engine.md` | `.agents/skills/trtex/` | ✅ Aktif |
| `validation_engine.md` | `.agents/skills/trtex/` | ✅ Aktif |
| `lead_generator.md` | `.agents/skills/trtex/` | ✅ Aktif |
| `trade_matrix_builder.md` | `.agents/skills/trtex/` | ✅ Aktif |

### Harcama Limitleri (Kod Düzeyinde):
| Katman | Dosya | Limit | Durum |
|--------|-------|-------|-------|
| Token Bütçesi | `aiClient.ts:82` | 100K token/gün | ✅ |
| Maliye Bakanlığı | `financeMinister.ts:8` | $20/ay | ✅ |
| Haber Limiti | `signalFilter.ts:20` | 6 haber/gün | ✅ |
| Muhasebe Ajanı | `accountingAgent.ts` | Firestore takip | ✅ |
| AutoRunner CFO | `autoRunner.ts:140` | `dailyBudget` config | ✅ |

**SONUÇ:** Eğitimler ve limitler KOD DÜZEYİNDE aktif. Sorun yok.

### Haber Üretim Pipeline:
```
newsEngine.ts → signalFilter.ts → contentGuard.ts → costGuard.ts 
    → financeMinister.ts → imageAgent.ts → translationAgent.ts (8 dil)
```
8 farklı editoryal açı (`newsEngine.ts:61-69`), anti-tekrar guard, kalite skoru 70+ zorunluluğu mevcut.

---

## 6. 🟢 İYİLEŞTİRME ÖNERİLERİ

| # | Öneri | Açıklama |
|---|-------|----------|
| 1 | Newsletter double-opt-in | GDPR uyumu için çift onaylı e-posta |
| 2 | Warmup haberleri yükseltme | `source: 'TRTEX-WARMUP'` olanları otonom pipeline ile değiştir |
| 3 | Firma profil sayfası | `/manufacturers/[id]` detay sayfası (gelecek) |

---

## 7. BUGÜN CLAUDE OPUS TARAFINDAN YAPILAN İŞLER

| # | İş | Commit |
|---|------|--------|
| 1 | Terminal mock temizliği | `699c94d` |
| 2 | MatchmakerEngine optimizasyonu (.limit + skor) | `699c94d` |
| 3 | UGC API random score düzeltmesi | `699c94d` |
| 4 | Navbar dead links kaldırıldı | `699c94d` |
| 5 | B2BActionPanel auth guard + email enjeksiyonu | `c7eb95a` |
| 6 | SEO: About/Contact/Terminal metadata + OG | `019f70f` |
| 7 | SEO: Ana sayfa hreflang 8 dil | `019f70f` |
| 8 | SEO: JSON-LD zenginleştirme + SearchAction | `5555ddb` |
| 9 | Firmalar Dizini sayfası oluşturuldu | `d6597ff` |
| 10 | Newsletter CTA ana sayfaya eklendi | `9989037` |
| 11 | Fuar takvimi mock verileri temizlendi | `ff7733d` |
| 12 | Middleware /firmalar redirect eklendi | (commit bekliyor) |

---

## 8. ÖNCELİK SIRASI (GEMİNİ BU SIRADA YAP)

```
1. [KRİTİK] news/[slug]/page.tsx → Article JSON-LD schema ekle
2. [KRİTİK] Trends/Fairs/Academy/Trade/Opportunities → mock kontrol et, temizle
3. [ÖNEMLİ] PremiumB2BHomeLayout.tsx → section bazlı refactoring
4. [ÖNEMLİ] Sitemap'e /manufacturers ekle
5. [İYİ] Warmup haberlerini otonom ile değiştir
6. Build + Git commit
```

> **SON KURAL:** Her değişiklik sonrası `pnpm run build` çalıştır. Exit code 0 olmalı. Olmadan commit ATMA.
