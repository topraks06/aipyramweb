# 🤖 GEMINI MASTER SKILL — AIPyram Ekosistem İnşaatçısı

> **Versiyon:** 2.0 | **Tarih:** 22 Nisan 2026 (Güncelleme: Claude Opus tarafından)
> **Görev:** Hometex sayfaları, Vorhang sıfırdan, ortak sayfalar, Stripe altyapısı
> **Kural:** Claude (Opus) TRTEX taşımayı yapar. Sen geri kalan HER ŞEYİ yaparsın.
> **Deadline:** 19 Mayıs 2026 (Fuar)

### ✅ TAMAMLANAN FAZLAR (22 Nisan 2026 itibariyle)
- **Bölüm A (Hometex):** Tüm sayfalar Firestore'a bağlandı, footer eklendi ✅
- **Bölüm B (Vorhang):** Landing, Products, Seller Hub, TryAtHome, yasal sayfalar ✅
- **Bölüm D (Ortak Sayfalar):** About, Contact, Privacy, Terms, Impressum ✅
- **Tenant Config Registry:** `src/config/tenants.ts` oluşturuldu ✅
- **SEO/JSON-LD:** Domain layout'a tenant-aware metadata ve structured data eklendi ✅

### 🔴 KALAN GÖREVLER (Gemini devam edecek)
- **Bölüm C:** Stripe ödeme altyapısı (stripeService.ts, checkout/webhook route)
- **Bölüm E:** Email bildirim sistemi (notificationService.ts)
- **Bölüm F:** Mobil responsive son cila
- **B.2.13:** OrderConfirmation sayfası (`/checkout/success`)
- **B.2.7:** CartSidebar Zustand global state entegrasyonu

---

## 🏗️ MİMARİ KURALLAR (ASLA İHLAL ETME)

### Mutlak Yasalar
1. `src/core/aloha/engine.ts` → **DOKUNMA**
2. `pnpm` kullan, `npm` değil
3. Her iş bittiğinde `pnpm run build` çalıştır → Exit code: 0 olmalı
4. TailwindCSS 4 kullan
5. `force-dynamic` → tüm sayfalarda cache yok
6. Firestore Admin SDK → `import { adminDb } from '@/lib/firebase-admin'`
7. Client bileşenlerinde → `'use client'` direktifi
8. Tüm görseller `referrerPolicy="no-referrer"` ile
9. Tüm linkler tenant-aware: `/sites/[domain]/hedef` formatı değil, göreceli `/hedef` kullan (middleware rewrite yapar)

### Dosya Konumları
```
Bileşenler:     src/components/tenant-{name}/
Sayfalar:       src/app/sites/[domain]/{route}/page.tsx
API'ler:        src/app/api/
Servisler:      src/services/
Tipler:         src/types/
i18n:           src/i18n/
Config:         src/config/tenants.ts  ← SSoT Tenant Registry (YENİ)
```

### Tenant Domain Haritası (middleware.ts satır 81-90)
```
trtex.localhost:3000    → /sites/trtex.com/     (Claude yapıyor)
perde.localhost:3000    → /sites/perde.ai/      (ZATEN TAMAM)
hometex.localhost:3000  → /sites/hometex.ai/    (SEN YAPACAKSIN)
vorhang.localhost:3000  → /sites/vorhang.ai/    (SEN YAPACAKSIN)
```

### Ana Router: `src/app/sites/[domain]/page.tsx` (satır 217-225)
```tsx
if (projectName === 'perde')   → return <PerdeLandingPage />;
if (projectName === 'hometex') → return <HometexLandingPage />;
if (projectName === 'vorhang') → return <VorhangLandingPage />;
// default (trtex)             → fetchAlohaPayload → PremiumB2BHomeLayout
```

---

## 📦 BÖLÜM A: HOMETEX.AI CANLANDIRMA

### A.0 — Mevcut Durum
Hometex eski bir Vite+React Router projesiydi (`C:\Users\MSI\Desktop\projeler zip\hometex.ai`).
Tasarımları aipyramweb'e **kopyalandı ama tüm veri mock**. Firestore bağlantısı yok.
**Eski projeyi SADECE tasarım referansı olarak kullan.** Veri yapısını Firebase'den al.

### A.1 — Firestore Koleksiyonları (Firebase Console'da oluştur)

#### Koleksiyon: `exhibitors`
```json
{
  "name": "string",
  "description": "string",
  "logoUrl": "string (URL)",
  "coverImageUrl": "string (URL)",
  "halls": ["string array — Döşemelik, Perdelik, vb."],
  "tags": ["string array"],
  "category": "string",
  "country": "string",
  "isPremium": "boolean",
  "products": "number (ürün sayısı)",
  "createdAt": "timestamp"
}
```

#### Koleksiyon: `articles` (Hometex dergi makaleleri)
```json
{
  "title": "string",
  "slug": "string",
  "excerpt": "string",
  "content": "string (markdown/html)",
  "coverImage": "string (URL)",
  "category": "string — Özel Rapor, Trend Radarı, Sektörel İnceleme, Teknoloji",
  "author": "string",
  "isFeatured": "boolean",
  "timeToRead": "string — 5 dk",
  "publishedAt": "timestamp",
  "relatedExhibitors": ["string array — exhibitor ID'leri"]
}
```

#### Koleksiyon: `products` (Hometex ürünleri)
```json
{
  "exhibitorId": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "images": ["string array (URL)"],
  "wholesalePrice": "number",
  "moq": "number (minimum order quantity)",
  "createdAt": "timestamp"
}
```

### A.2 — Bileşen Güncelleme Listesi

#### A.2.1: `HometexLandingPage.tsx` (src/components/tenant-hometex/)
**Mevcut:** 203 satır, tüm veri mock (hardcoded useState)
**Hedef:** Server-side Firestore'dan veri çeken, prop alan bileşen

**Yapılacaklar:**
1. `page.tsx`'te server-side fetch yap (adminDb kullan)
2. `HometexLandingPage`'e `articles` ve `exhibitors` prop olarak ver
3. Mock `useState` + `useEffect`'leri kaldır
4. Eski projedeki `Home.tsx`'in (364 satır) Magazine bölümünü ekle (satır 209-290 — Featured Article + Sidebar Articles grid)
5. Eski projedeki "Dijital İkiz Showroomlar" bölümünü ekle (satır 292-360 — 6'lı hall grid)

**page.tsx düzenleme (src/app/sites/[domain]/page.tsx satır 220-222):**
```tsx
if (projectName === 'hometex') {
  const articlesSnap = await adminDb.collection('articles').orderBy('publishedAt','desc').limit(4).get();
  const exhibitorsSnap = await adminDb.collection('exhibitors').limit(6).get();
  const articles = articlesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const exhibitors = exhibitorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  return <HometexLandingPage articles={articles} exhibitors={exhibitors} />;
}
```

#### A.2.2: `HometexNavbar.tsx` → Zengin Navbar'a Yükselt
**Mevcut:** 6KB basit navbar
**Hedef:** Eski projedeki Layout.tsx'in (542 satır) navbar özelliklerini taşı

**Eklenecek özellikler:**
1. Scroll-hide animasyonu (aşağı kaydırınca gizle, yukarı kaydırınca göster)
2. Full-screen arama overlay (Popüler Aramalar + AI Önerileri)
3. 8 dil seçici dropdown (TR, EN, DE, FR, RU, AR, ES, ZH)
4. Dark/Light mode toggle
5. Mobil full-screen menü (clipPath animasyonu)
6. Footer bileşeni ayır: `HometexFooter.tsx` olarak oluştur

**Referans:** `C:\Users\MSI\Desktop\projeler zip\hometex.ai\src\components\Layout.tsx`

#### A.2.3: `Expo.tsx` — Sanal Fuar Sayfası
**Mevcut:** Mock veriyle çalışıyor
**Hedef:** Firestore `exhibitors` koleksiyonundan canlı veri

**page.tsx route:** `src/app/sites/[domain]/expo/page.tsx`
```tsx
// Server component
const exhibitorsSnap = await adminDb.collection('exhibitors').get();
const exhibitors = exhibitorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
return <Expo exhibitors={exhibitors} />;
```

**Bileşen değişiklikleri:**
- `useState` mock verileri kaldır
- Props'tan gelen `exhibitors` kullan
- Sticky filter bar çalışır durumda olmalı (Tümü, Döşemelik, Perdelik, vb.)
- Arama fonksiyonu çalışmalı

#### A.2.4: `Exhibitors.tsx` — Katılımcı İndeksi
**Mevcut:** Mock veriyle çalışıyor
**Hedef:** Firestore canlı veri + rol bazlı aksiyonlar

**Referans:** Eski `Exhibitors.tsx` (227 satır) — Firestore `onSnapshot` kullanıyordu
**Next.js'te:** Server-side `adminDb.collection('exhibitors').get()` kullan
**Özel:** Role switcher özelliği (manufacturer/retailer/consumer) — farklı butonlar göster

#### A.2.5: `ExhibitorDetail.tsx` — Katılımcı Detay Sayfası
**Route:** `src/app/sites/[domain]/exhibitors/[id]/page.tsx`
**Server-side:** `adminDb.collection('exhibitors').doc(id).get()`
**Alt koleksiyon:** `adminDb.collection('products').where('exhibitorId','==',id).get()`
**Tasarım:** Tam genişlik hero görsel + firma bilgileri + ürün grid

#### A.2.6: `Magazine.tsx` — Sovereign Dergi
**Route:** `src/app/sites/[domain]/magazine/page.tsx`
**Server-side:** `adminDb.collection('articles').orderBy('publishedAt','desc').get()`
**Tasarım:** Featured article (büyük) + sidebar articles (3 adet) + grid

#### A.2.7: `MagazineDetail.tsx` — Makale Detay
**Route:** `src/app/sites/[domain]/magazine/[id]/page.tsx`
**Server-side:** `adminDb.collection('articles').doc(id).get()`
**Tasarım:** Full-width cover image + markdown content + ilgili katılımcılar

#### A.2.8: `Trends.tsx` — Trend Alanı
**Route:** `src/app/sites/[domain]/trends/page.tsx`
**Veri:** `adminDb.collection('articles').where('category','==','Trend Radarı').get()`

#### A.2.9: `BoothDetail.tsx` — Stant Detayı
**Route:** `src/app/sites/[domain]/expo/[boothId]/page.tsx`

#### A.2.10: `HometexFooter.tsx` — OLUŞTUR (yeni dosya)
**Referans:** Eski Layout.tsx satır 501-536
**İçerik:** Logo, navigasyon linkleri, copyright, "Hometex.ai — AIPyram Ekosistemi" metni

### A.3 — Hometex Sayfa Route Haritası

| Route | Sayfa Dosyası | Bileşen | Server Data |
|-------|--------------|---------|-------------|
| `/` | `page.tsx` (mevcut) | HometexLandingPage | articles + exhibitors |
| `/expo` | `expo/page.tsx` (mevcut) | Expo | exhibitors |
| `/expo/[boothId]` | oluştur | BoothDetail | exhibitor + products |
| `/exhibitors` | `exhibitors/page.tsx` (mevcut) | Exhibitors | exhibitors |
| `/exhibitors/[id]` | oluştur | ExhibitorDetail | exhibitor + products |
| `/magazine` | `magazine/page.tsx` (mevcut) | Magazine | articles |
| `/magazine/[id]` | `magazine/[id]/page.tsx` (mevcut) | MagazineDetail | article |
| `/trends` | `trends/page.tsx` (mevcut) | Trends | trend articles |
| `/login` | `login/page.tsx` (mevcut) | HometexLogin | — |
| `/about` | about/page.tsx | HometexAbout | — |
| `/contact` | contact/page.tsx | HometexContact | — |
| `/privacy` | privacy/page.tsx | HometexPrivacy | — |
| `/terms` | terms/page.tsx | HometexTerms | — |

---

## 📦 BÖLÜM B: VORHANG.AI SIFIRDAN

### B.0 — Konsept
Alman pazarı B2B perde pazaryeri. Almanca copywriting. Renk paleti: Siyah + Altın (#D4AF37).
Yemeksepeti modeli: Alıcı sipariş verir → En yakın satıcıya yönlendirilir → Escrow ödeme.

### B.1 — Firestore Koleksiyonları

#### `vorhang_products`
```json
{
  "name": "string",
  "description": "string",
  "category": "string — Blackout, Sheer, Motorized, Decorative",
  "images": ["string array (URL)"],
  "price": "number (EUR, metre başına)",
  "currency": "EUR",
  "sellerId": "string",
  "sellerName": "string",
  "moq": "number",
  "material": "string",
  "width": "string",
  "weight": "string (g/m²)",
  "fireRetardant": "boolean",
  "verified": "boolean",
  "rating": "number (1-5)",
  "reviewCount": "number",
  "createdAt": "timestamp"
}
```

#### `vorhang_sellers`
```json
{
  "name": "string",
  "company": "string",
  "email": "string",
  "country": "string",
  "city": "string",
  "verified": "boolean",
  "rating": "number",
  "totalSales": "number",
  "productCount": "number",
  "coverImage": "string (URL)",
  "description": "string",
  "createdAt": "timestamp"
}
```

#### `vorhang_orders`
```json
{
  "buyerId": "string",
  "buyerEmail": "string",
  "sellerId": "string",
  "items": [{ "productId": "string", "quantity": "number", "price": "number" }],
  "status": "string — pending, confirmed, shipped, delivered, cancelled",
  "total": "number",
  "currency": "EUR",
  "shippingAddress": "object",
  "stripePaymentId": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### B.2 — Bileşen Listesi (src/components/tenant-vorhang/)

#### B.2.1: `VorhangLandingPage.tsx` — YENİDEN YAZ
**Mevcut:** 161 satır iskelet, hero görseli başka projeden ödünç
**Hedef:** Premium Alman B2B pazaryeri landing page

**Bölümler:**
1. **Hero:** Full-screen, gradient overlay, Almanca headline, 2 CTA butonu
2. **Güven Bandı:** "Geprüfte Qualität", "Direkter B2B-Zugang", "KI-Visualisierung" ikonları
3. **Trend Ürünler:** 6'lı grid, Firestore'dan çekilecek (şimdilik mock → sonra bağlanır)
4. **Nasıl Çalışır:** 3 adımlı workflow (Entdecken → Visualisieren → Bestellen)
5. **Satıcı CTA:** "Ihre Produkte auf der größten AI-Plattform" bölümü (mevcut — koru)
6. **Rakamlar Bandı:** "12.000+ Stoffe", "500+ Händler", "50+ Länder" animasyonlu sayaçlar
7. **Footer:** VorhangFooter bileşeni

#### B.2.2: `VorhangNavbar.tsx` — GÜNCELLEYükselt
**Mevcut:** 5KB temel
**Ekle:** Sepet ikonu (badge ile ürün sayısı), Kullanıcı menüsü, DE/EN/TR dil seçici

#### B.2.3: `VorhangFooter.tsx` — OLUŞTUR
Alman yasal gereksinimleri: Impressum linki, Datenschutz, AGB, Widerrufsrecht

#### B.2.4: `ProductGrid.tsx` — GÜNCELLEYükselt
**Mevcut:** 4KB iskelet, mock ürünler
**Hedef:** Filtreli ürün grid (kategori, fiyat aralığı, malzeme)
**Route:** `/products`

#### B.2.5: `ProductCard.tsx` — GÜNCELLEYükselt
**Mevcut:** 2KB iskelet
**Hedef:** Hover efektli, fiyat/satıcı/badge gösteren kart

#### B.2.6: `ProductDetail.tsx` — GÜNCELLEYükselt
**Mevcut:** 5KB iskelet
**Hedef:** Galeri, özellik tablosu, satıcı bilgisi, sepete ekle butonu, benzer ürünler
**Route:** `/products/[id]`

#### B.2.7: `CartSidebar.tsx` — GÜNCELLEYükselt
**Mevcut:** 4KB iskelet
**Hedef:** Slide-over sepet, miktar güncelleme, toplam, checkout CTA

#### B.2.8: `CheckoutPage.tsx` — GÜNCELLEYükselt
**Mevcut:** 11KB form var ama Stripe bağlı değil
**Hedef:** Adres formu + Stripe Elements entegrasyonu
**Route:** `/checkout`

#### B.2.9: `SellerDashboard.tsx` — GÜNCELLEYükselt
**Mevcut:** 5KB mock
**Hedef:** Sipariş listesi, gelir grafiği, ürün yönetimi
**Route:** `/seller`

#### B.2.10: `SellerOnboarding.tsx` — OLUŞTUR (yeni)
Satıcı kayıt formu: Firma bilgileri, vergi no, banka bilgileri
**Route:** `/seller/register`

#### B.2.11: `SellerIngestion.tsx` — Ürün Yükleme
**Route:** `/seller/ingestion` (mevcut)
CSV/Excel ile toplu ürün yükleme + tekli ürün ekleme formu

#### B.2.12: `TryAtHome.tsx` — GÜNCELLEYükselt
**Mevcut:** 5KB iskelet
**Hedef:** Perde.ai RoomVisualizer'ın Vorhang versiyonu (odanıza perde yerleştirin)
**Route:** `/try-at-home`

#### B.2.13: `OrderConfirmation.tsx` — OLUŞTUR
Sipariş onay sayfası: Sipariş numarası, özet, tahmini teslimat
**Route:** `/checkout/success`

### B.3 — Vorhang Sayfa Route Haritası

| Route | Bileşen | Server Data |
|-------|---------|-------------|
| `/` | VorhangLandingPage | trend products |
| `/products` | ProductGrid | vorhang_products |
| `/products/[id]` | ProductDetail | product + seller |
| `/checkout` | CheckoutPage | cart (client state) |
| `/checkout/success` | OrderConfirmation | order |
| `/seller` | SellerDashboard | orders + stats |
| `/seller/register` | SellerOnboarding | — |
| `/seller/ingestion` | SellerIngestion | — |
| `/try-at-home` | TryAtHome | products |
| `/about` | VorhangAbout | — |
| `/impressum` | VorhangImpressum | — |
| `/datenschutz` | VorhangPrivacy | — |
| `/agb` | VorhangTerms | — |

---

## 📦 BÖLÜM C: STRIPE ÖDEME ALTYAPISI (Tüm Tenant'lar İçin Ortak)

### C.1: `src/services/stripeService.ts` — OLUŞTUR
```typescript
// Stripe SDK ile checkout session oluşturma
// createCheckoutSession(items, customerEmail, successUrl, cancelUrl)
// createSubscription(customerId, priceId) — Perde.ai üyelik
// getPaymentStatus(sessionId)
```

### C.2: `POST /api/stripe/checkout/route.ts` — OLUŞTUR
Checkout session oluştur, Stripe URL döndür

### C.3: `POST /api/stripe/webhook/route.ts` — OLUŞTUR
Ödeme onayı dinle → Firestore güncelle → Email gönder

### C.4: Pricing.tsx Bağlantısı
`src/components/tenant-perde/Pricing.tsx` → "Planı Seç" butonlarını Stripe checkout URL'lerine bağla

---

## 📦 BÖLÜM D: ORTAK SAYFALAR (Tüm Tenant'lar İçin)

### D.1 — Tenant-Aware Sayfa Şablonu
Her tenant için about, contact, privacy, terms sayfaları gerekli.
`page.tsx`'te domain'e göre doğru bileşeni yükle:

```tsx
// src/app/sites/[domain]/about/page.tsx
export default async function AboutPage({ params }) {
  const { domain } = await params;
  if (domain.includes('hometex')) return <HometexAbout />;
  if (domain.includes('vorhang')) return <VorhangAbout />;
  if (domain.includes('trtex'))  return <TrtexAbout />;
  return <AboutEnterprise />; // Perde.ai default
}
```

### D.2 — Oluşturulacak Sayfalar (TAMAMLANDI ✅)

| Sayfa | Perde.ai | TRTEX | Hometex | Vorhang |
|-------|----------|-------|---------|---------|
| `/about` | ✅ AboutEnterprise | ✅ TrtexAbout | ✅ HometexAbout | ✅ VorhangAbout |
| `/contact` | ✅ Contact | ✅ TrtexContact | ✅ HometexContact | ✅ VorhangContact |
| `/privacy` | ✅ PerdePrivacy | ✅ Var | ✅ HometexPrivacy | ✅ VorhangPrivacy |
| `/terms` | ✅ PerdeTerms | ✅ Var | ✅ HometexTerms | ✅ VorhangTerms |
| `/impressum` | — | — | — | ✅ VorhangImpressum |

### D.3 — Favicon ve OG Image'lar
Her tenant için `public/assets/{domain}/` altında:
- `favicon.ico`, `favicon.png`, `apple-touch-icon.png`
- `og-image.jpg` (1200x630)

---

## 📦 BÖLÜM E: EMAIL BİLDİRİM SİSTEMİ

### E.1: `src/services/notificationService.ts`
Gmail SMTP veya SendGrid ile email gönderimi

### E.2: Tetikleyiciler
- Lead yakalama → Admin'e email
- Sipariş → Müşteriye onay emaili  
- Ödeme → Fatura emaili
- Kayıt → Hoşgeldin emaili

---

## 📦 BÖLÜM F: MOBİL RESPONSIVE & CİLALAMA

### F.1 — Her Tenant İçin Kontrol Listesi
- [ ] Navbar hamburger menü (320px-768px)
- [ ] Hero section responsive (text size, image layout)
- [ ] Grid responsive (1 col mobile, 2 col tablet, 3-4 col desktop)
- [ ] Footer responsive
- [ ] ConciergeWidget mobil pozisyon

### F.2 — Performance
- [ ] Image lazy loading (`loading="lazy"`)
- [ ] Component lazy loading (`next/dynamic`)
- [ ] Bundle size kontrolü

---

## 📋 ÇALIŞMA SIRASI (GÜNCELLENDİ — 22 Nisan 2026)

```
✅ HAFTA 1: Hometex sayfalarını Firestore'a bağla (A bölümü) — TAMAMLANDI
✅ HAFTA 2: Vorhang ana sayfa + ürün sayfaları (B.2.1-B.2.6) — TAMAMLANDI
✅ HAFTA 3: Seller Hub + ortak sayfalar (B.2.9-B.2.12 + D bölümü) — TAMAMLANDI
🔴 HAFTA 4: Stripe entegrasyonu (C bölümü) — BEKLEMEDE
🔴 HAFTA 5: Email + mobil responsive cila (E + F bölümü) — BEKLEMEDE
🔴 HAFTA 6: OrderConfirmation, CartSidebar Zustand, ERP genişletme — BEKLEMEDE
```

## ⚠️ KONTROL KURALI
Her iş bittiğinde:
1. `pnpm run build` → Exit code: 0
2. `perde.localhost:3000` → çalışıyor
3. `trtex.localhost:3000` → çalışıyor  
4. `hometex.localhost:3000` → çalışıyor
5. `vorhang.localhost:3000` → çalışıyor
6. Değişiklikleri `git add . && git commit -m "feat(...): açıklama"` ile kaydet

## 🆕 YENİ MİMARİ BİLGİLER (Gemini bunları bilmeli)

### Tenant Config Registry
Yeni merkezi tenant konfigürasyonu: `src/config/tenants.ts`
- `getTenantConfig(domain)` → SEO, tema, dil, özellikler
- `getTenantName(domain)` → 'trtex' | 'perde' | 'hometex' | 'vorhang'
- Yeni sayfa eklerken bu registry'yi kullan

### SEO/JSON-LD
`src/app/sites/[domain]/layout.tsx` artık:
- `generateMetadata()` ile tenant-aware title/description üretiyor
- Organization ve WebSite JSON-LD structured data enjekte ediyor
- **Her yeni tenant sayfası otomatik SEO alır, ekstra iş gerekmez**

### Yasal Sayfa Routing Paterni
`about/page.tsx`, `contact/page.tsx`, `privacy/page.tsx`, `terms/page.tsx`, `impressum/page.tsx`:
- Hepsi `d.includes('hometex')`, `d.includes('vorhang')` pattern'i ile çalışıyor
- Yeni yasal sayfa eklemek için: bileşen oluştur → route'a import et → if block ekle
