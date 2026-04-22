# 🔴 CLAUDE OPUS SKILL — TRTEX Tenant Taşıma & Kritik Altyapı

> **Versiyon:** 2.0 | **Tarih:** 22 Nisan 2026 (Güncellendi)
> **Görev:** TRTEX'i aipyram tenant'a taşı, riskli entegrasyonlar, Gemini kontrolü
> **Kural:** TRTEX canlıda çalışıyor, bozma. Canlı Firebase verilerini kullan.

### ✅ TAMAMLANAN GÖREVLER (22 Nisan 2026 itibariyle)
- **Görev 1.1:** TrtexAbout — oluşturuldu ve about/page.tsx'e entegre edildi ✅
- **Görev 1.2:** TrtexContact — oluşturuldu ve contact/page.tsx'e entegre edildi ✅
- **Görev 2.1:** about/contact/terms/privacy sayfaları 4 tenant için tenant-aware yapıldı ✅
- **Görev 2.2:** Tenant Config Registry (`src/config/tenants.ts`) oluşturuldu ✅
- **Görev 3:** Gemini çıktıları kontrol edildi, build doğrulandı ✅
- **SEO/JSON-LD:** layout.tsx'e tenant-aware metadata ve JSON-LD eklendi ✅
- **Hometex yasal sayfalar:** HometexAbout, Contact, Privacy, Terms oluşturuldu ✅
- **Vorhang yasal sayfalar:** VorhangAbout, Contact, Privacy, Terms, Impressum ✅

### 🔴 KALAN GÖREVLER
- **Görev 1.3:** SEO JSON-LD derinleştirme (Article, Product schema'ları)
- **Görev 4.1:** Chat Hafıza Kalıcılığı
- **Görev 4.2:** ERP Panel Canlandırma (Perde.ai)
- **Görev 4.3:** Admin Panel Güçlendirme
- **Görev 4.4:** Cross-Tenant Veri Akışı

---

## 🎯 GÖREV 1: TRTEX TENANT MİGRASYONU

### Mevcut Durum
TRTEX **zaten kısmen taşındı** — ana sayfa çalışıyor:
- `page.tsx` → `fetchAlohaPayload('trtex')` → Firestore'dan haber çekiyor ✅
- `PremiumB2BHomeLayout` render ediliyor ✅  
- `TrtexNavbar`, `TrtexFooter`, `IntelligenceTicker` çalışıyor ✅
- Haber detay (`/news/[slug]`) çalışıyor ✅

### Eksik Sayfalar (Eski trtex.com'da vardı, aipyramweb'de YOK)

#### 1.1: `/about` → TrtexAbout Bileşeni
**Eski:** `projeler zip/trtex.com/src/app/[locale]/hakkimizda/page.tsx` (15 satır, çok basit)
**Hedef:** Profesyonel kurumsal sayfa
**Bileşen:** `src/components/trtex/TrtexAbout.tsx` — OLUŞTUR
**İçerik:**
- AIPyram GmbH tanıtımı
- TRTEX vizyonu — "Sovereign B2B Intelligence"
- Ekip/Teknoloji bölümü
- Ekosistem linkleri (Perde.ai, Hometex, Vorhang)
**Route düzenleme:** `src/app/sites/[domain]/about/page.tsx` → domain trtex ise TrtexAbout göster

#### 1.2: `/contact` → TrtexContact Bileşeni  
**Eski:** `projeler zip/trtex.com/src/app/[locale]/iletisim/page.tsx` (22 satır, basit)
**Hedef:** İletişim formu + firma bilgileri
**Bileşen:** `src/components/trtex/TrtexContact.tsx` — OLUŞTUR
**Route düzenleme:** `src/app/sites/[domain]/contact/page.tsx` → domain trtex ise TrtexContact göster

#### 1.3: SEO & JSON-LD Zenginleştirmesi
**Eski:** `projeler zip/trtex.com/src/app/[locale]/layout.tsx` (150 satır) — Zengin SEO
**Taşınacaklar:**
- Organization JSON-LD schema (satır 93-128)
- WebSite JSON-LD schema (satır 129-145)
- 7 dilde title/description metadata (satır 18-36)
- hreflang alternates (satır 42-52)
**Hedef:** `src/app/sites/[domain]/layout.tsx` veya `page.tsx`'e ekle

#### 1.4: Silinen Bileşenleri Değerlendir
Git'te (`c11cf33`) silinen bileşenler:
- `ChinaWatchSection.tsx` (588 satır) — Uzak Doğu radarı
- `FairCalendarSection.tsx` (451 satır) — Fuar takvimi
- `IntelligenceScoreSection.tsx` (365 satır) — TRTEX IQ skor
- `IntelligenceTicker.tsx` (645 satır) — extracted versiyonu (ana IntelligenceTicker hâlâ var)
- `DailyInsightSection.tsx` (169 satır) — Günlük içgörü
- `ContentHubSection.tsx` (73 satır) — İçerik merkezi

**Karar:** Bu bileşenler eski `extracted/` klasöründeydi. Ana `PremiumB2BHomeLayout` zaten bu verileri kendi içinde gösteriyor. Ama eğer ana sayfaya ek bölümler gerekirse, eski trtex.com projesinden (`projeler zip/trtex.com/src/components/home/`) referans alınabilir.

### 1.5: TRTEX'e Özel Tenant Navbar/Footer Entegrasyonu
**Şu an:** TrtexNavbar ve TrtexFooter bileşenleri var ve PremiumB2BHomeLayout içinde render ediliyor
**Kontrol:** Menü yapısının doğruluğu (Haberler, İhaleler, Ticaret, Akademi)
**Kontrol:** Footer linkleri (hakkımızda, iletişim, gizlilik, kvkk)
**Kontrol:** Dil değiştirme (TR/EN) çalışıyor mu

---

## 🎯 GÖREV 2: TENANT ROUTER GÜÇLENDİRME

### 2.1: about/contact/terms sayfalarını tenant-aware yap
Mevcut `about/page.tsx` sadece Perde.ai bileşenini gösteriyor.
Domain'e göre doğru bileşeni yükle:

```tsx
// src/app/sites/[domain]/about/page.tsx
import AboutEnterprise from '@/components/tenant-perde/AboutEnterprise';
// + import TrtexAbout, HometexAbout, VorhangAbout

export default async function AboutPage({ params }) {
  const { domain } = await params;
  const d = decodeURIComponent(domain);
  if (d.includes('trtex'))   return <TrtexAbout />;
  if (d.includes('hometex')) return <HometexAbout />;
  if (d.includes('vorhang')) return <VorhangAbout />;
  return <AboutEnterprise />; // Perde.ai default
}
```

Aynı pattern: contact, terms, privacy sayfalarına da uygula.

### 2.2: Tenant Config Registry
`src/config/tenants.ts` — merkezi tenant konfigürasyonu:
```typescript
export const TENANT_CONFIG = {
  'trtex.com': { 
    name: 'TRTEX', brand: 'TRTEX.COM', theme: 'dark',
    primaryColor: '#dc2626', locale: 'tr', 
    navItems: ['news','tenders','academy'],
    features: ['news','tenders','opportunities','academy','radar']
  },
  'perde.ai': {
    name: 'PERDE.AI', brand: 'PERDE.AI', theme: 'light',
    primaryColor: '#b8860b', locale: 'tr',
    navItems: ['studio','b2b','catalog','pricing'],
    features: ['visualizer','studio','b2b','pricing','catalog']
  },
  'hometex.ai': {
    name: 'HOMETEX.AI', brand: 'HOMETEX.AI', theme: 'dark',
    primaryColor: '#ffffff', locale: 'tr',
    navItems: ['expo','magazine','trends','exhibitors'],
    features: ['expo','magazine','trends','exhibitors']
  },
  'vorhang.ai': {
    name: 'VORHANG.AI', brand: 'VORHANG.AI', theme: 'light',
    primaryColor: '#D4AF37', locale: 'de',
    navItems: ['products','try-at-home','seller'],
    features: ['products','cart','checkout','seller','try-at-home']
  }
};
```

---

## 🎯 GÖREV 3: GEMİNİ KONTROLÜ

### 3.1: Gemini'nin her tesliminde kontrol et
1. `pnpm run build` → Exit code: 0
2. Tüm 4 tenant localhost'ta yüklenebiliyor
3. Yeni bileşenler doğru dosya konumlarında
4. Import path'leri doğru (`@/components/...`)
5. `'use client'` gerekli yerlerde var
6. Firestore sorguları `adminDb` kullanıyor (server-side)
7. Mock veri kalmamış (hardcoded useState kaldırılmış)

### 3.2: Build kırılırsa düzelt
Gemini'nin yazdığı kodda hata varsa:
1. Hata mesajını oku
2. İlgili dosyayı düzelt
3. Build tekrar test et
4. Gerekirse Gemini'ye feedback ver

---

## 🎯 GÖREV 4: UZUN VADELI — EKOSİSTEM DERİNLEŞTİRME

### 4.1: Chat Hafıza Kalıcılığı
Firestore `chat_sessions/{uid}` koleksiyonu:
- Kullanıcı geri geldiğinde eski konuşmayı yükle
- ConciergeWidget'a session restore özelliği

### 4.2: ERP Panel Canlandırma (Perde.ai)
- `B2B.tsx` → Firestore `projects` koleksiyonu
- `Catalog.tsx` → Firestore `products` koleksiyonu
- `MyProjects.tsx` → Kullanıcının render geçmişi
- `Accounting.tsx` → Gerçek fatura verileri
- `Inventory.tsx` → Stok takibi

### 4.3: Admin Panel Güçlendirme
- `/admin/leads` → Lead yönetimi (mevcut)
- `/admin/media` → Görsel kütüphanesi (mevcut)
- `/admin/tenants` → Tenant yönetimi (OLUŞTUR)
- `/admin/analytics` → Tenant bazlı analitik (OLUŞTUR)
- `/admin/users` → Kullanıcı yönetimi (OLUŞTUR)

### 4.4: Cross-Tenant Veri Akışı
EcosystemBridge'i güçlendir:
- TRTEX trend verisi → Hometex trend sayfası
- Hometex katılımcı → Vorhang satıcı havuzu
- Perde.ai render → Vorhang try-at-home

---

## 📋 CLAUDE ÇALIŞMA SIRASI

```
AŞAMA 1 (ŞİMDİ):
├── TRTEX TrtexAbout + TrtexContact oluştur
├── about/contact/terms sayfalarını tenant-aware yap
├── SEO/JSON-LD ekle
└── Build doğrula

AŞAMA 2 (GEMİNİ BAŞLADIĞINDA):
├── Gemini'nin Hometex çıktılarını kontrol et
├── Build hataları düzelt
└── Firestore bağlantıları doğrula

AŞAMA 3 (GEMİNİ VORHANG YAPARKEN):
├── Gemini'nin Vorhang çıktılarını kontrol et
├── Stripe entegrasyonunu doğrula
└── Cross-tenant testler

AŞAMA 4 (FUAR ÖNCESI):
├── Tüm tenant'lar deploy
├── DNS yapılandırmaları
├── Canlı smoke test
└── Fuar demo hazırlığı
```

---

## 🆕 YENİ MİMARİ BİLGİLER

### Tenant Config Registry (SSoT)
`src/config/tenants.ts` — Tüm tenant yapılandırmalarının merkezi kaynağı:
- `getTenantConfig(domain)` → SEO, tema, dil, özellikler
- `getTenantName(domain)` → 'trtex' | 'perde' | 'hometex' | 'vorhang'

### Domain Layout SEO
`src/app/sites/[domain]/layout.tsx` şimdi:
- `generateMetadata()` ile tenant-aware title/description üretiyor
- Organization + WebSite JSON-LD structured data enjekte ediyor
- **Yeni tenant sayfaları otomatik SEO alır**

### Yasal Sayfalar Routing
Tüm yasal sayfalar (`about`, `contact`, `privacy`, `terms`, `impressum`) şu pattern ile çalışır:
```tsx
if (d.includes('hometex')) return <HometexAbout />;
if (d.includes('vorhang')) return <VorhangAbout />;
if (d.includes('trtex'))   return <TrtexAbout />;
return <AboutEnterprise />; // perde.ai default
```
