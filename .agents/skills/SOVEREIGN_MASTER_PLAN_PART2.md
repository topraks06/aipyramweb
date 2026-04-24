# 🛡️ SOVEREIGN OS MASTER PLAN — BÖLÜM 2/4
# FAZ 5-6-7: TRTEX SEO + ADMİN PANEL + MOBİL/PERFORMANS

---

## FAZ 5: TRTEX SEO + STABİLİZASYON (2-3 gün)

> **HEDEF:** Google'da ilk sayfaya çıkmak — organik trafik makinesi

### 5.1 Structured Data (JSON-LD)
- [ ] `news/[slug]/page.tsx` → JSON-LD `NewsArticle` schema ekle:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": "...",
    "datePublished": "...",
    "author": { "@type": "Organization", "name": "TRTEX Intelligence" },
    "image": "...",
    "publisher": { "@type": "Organization", "name": "TRTEX" }
  }
  ```
- [ ] `canonical` tag → `<link rel="canonical" href="https://trtex.com/{locale}/news/{slug}" />`
- [ ] `hreflang` tagları → 8 dil için (tr, en, de, fr, es, ru, ar, zh)

### 5.2 Open Graph + Twitter Card
- [ ] `news/[slug]/page.tsx` → `og:image`, `og:title`, `og:description` meta tagları
- [ ] `twitter:card = summary_large_image`
- [ ] `twitter:site = @trtex_com`

### 5.3 İlgili Haberler Bölümü
- [ ] Haber detay sayfasına "İlgili Haberler" bölümü ekle (3 haber)
  - Aynı kategoriden veya aynı etiketlerden Firestore sorgusu
  - `trtex_news` koleksiyonundan `where('category', '==', currentCategory).limit(3)`

### 5.4 Sitemap Güçlendirme
- [ ] `sitemap.ts` → 8 dilde URL kontrolü
  - Her haber × 8 dil = URL listesi
  - `lastmod` alanı doğru çekilmeli (Firestore `updatedAt`)

### 5.5 TRTEX Pipeline Güvenliği
- [ ] `opportunityEngine.ts` → Somut veri kontrolü (boş string/null check)
- [ ] `deepAudit.ts` → Auto-repair döngüsü (max 5/cycle limiti doğrula)
- [ ] `missing-image-scanner.ts` → Görselsiz haberleri tespit + `trtex_image_queue` koleksiyonuna ekle

### FAZ 5 DOĞRULAMA:
```bash
pnpm run build
git commit -m "feat(faz-5): trtex SEO + pipeline stabilizasyon"
```

---

## FAZ 6: ADMİN PANEL FULL GÜÇLENDİRME (3-4 gün)

> **HEDEF:** MasterKokpit = Dünyanın en kapsamlı B2B yönetim terminali

### 6.1 FounderDashboard Gerçek Veri
- [ ] `FounderDashboard.tsx` → `PLATFORMS` hardcoded dizisini kaldır
  - `/api/admin/stats` endpoint'inden gerçek platform verileri çek
  - `didimemlak.ai` → Sovereign Config'de tanımsız, config'e ekle VEYA listeden kaldır
  - `visitors`, `routedByAloha`, `activeAgents` → Firestore `aloha_agent_logs` koleksiyonundan aggregate
  - Son 24 saatlik log sayımı = aktif yönlendirme

### 6.2 KnowledgeTrainer Güçlendirme
- [ ] `KnowledgeTrainer.tsx` → `aloha_knowledge` Firestore CRUD
  - Yeni bilgi ekleme formu
  - Mevcut bilgileri listeleme/düzenleme/silme
  - Kategorilere ayırma (sektörel, teknik, müşteri)

### 6.3 LeadIntelligencePanel Gerçek Veri
- [ ] `LeadIntelligencePanel.tsx` → `leads` koleksiyonundan gerçek veri çekme
  - Lead durumu (yeni, iletişime geçildi, anlaşma, kayıp)
  - Lead kaynağı (TRTEX haber, Perde.ai form, Vorhang sipariş)
  - Dönüşüm oranı hesaplama

### 6.4 PerdeOrdersTable Genişletme
- [ ] `PerdeOrdersTable.tsx` → `perde_orders` canlı tablo
  - Sipariş durumu değiştirme (draft → confirmed → shipped → delivered)
  - Tarih filtreleme
  - Toplam gelir hesaplama

### 6.5 CommercialPanel Doğrulama
- [ ] `CommercialPanel.tsx` → Escrow verilerinin gerçek Stripe session'dan gelmesi
  - Mock link kontrolü → gerçek Stripe dashboard linki

### 6.6 DomainHealthMonitor
- [ ] `DomainHealthMonitor.tsx` → `/api/health-full` endpoint'inden 4 node sağlık durumu
  - SSL durumu, uptime, son deploy zamanı
  - Hata sayısı (son 24 saat)

### 6.7 DataIntegrityShield
- [ ] `DataIntegrityShield.tsx` → Firestore koleksiyonlarının bütünlük kontrolü
  - Orphan dokümanlar (referans kırılmış)
  - Eksik alanlar (required field boş)
  - Duplikat slug kontrolü

### 6.8 ProposalPanel İyileştirme
- [ ] `ProposalPanel.tsx` → ALOHA otonom tekliflerinin onay/red akışı
  - Teklif detayları genişletme
  - Toplu onay/red

### FAZ 6 DOĞRULAMA:
```bash
pnpm run build
git commit -m "feat(faz-6): admin panel full güçlendirme"
```

---

## FAZ 7: MOBİL + PERFORMANS + LOKALİZASYON (2-3 gün)

> **HEDEF:** Her cihazda kusursuz, 8 dilde akıcı deneyim

### 7.1 Responsive Audit (4 Tenant)
- [ ] Perde.ai navbar → Hamburger menü mobilde düzgün açılıyor mu?
- [ ] TRTEX navbar → Mobil breakpoint kontrol (768px, 1024px, 1280px)
- [ ] Hometex navbar → Merkezi navbar'a geçildi mi? (Faz 4'te yapılacak)
- [ ] Vorhang navbar → Mobil sepet ikonu + menü

### 7.2 Z-Index Standardizasyonu
```
Navbar:         z-50
Dropdown Menü:  z-100
Chat Widget:    z-120
Modal/Overlay:  z-130
Toast:          z-140
```
- [ ] Tüm bileşenlerde bu hiyerarşi kontrol edilecek

### 7.3 Performans Optimizasyonu
- [ ] `PerdeAIAssistant.tsx` (66KB) → `dynamic(() => import(...), { ssr: false })` lazy load
- [ ] `engine.ts` (250KB) → Server-side only doğrula, client bundle'a girmediğinden emin ol
  - `typeof window === 'undefined'` guard'ı kontrol et
- [ ] Tüm tenant landing page'lerde `<Image>` bileşeni ile lazy loading
- [ ] `next/font` ile font yükleme optimizasyonu doğrula

### 7.4 Lokalizasyon Audit
- [ ] Perde.ai dictionary → 8 dil eksik bölüm kontrolü
  - `perde-dictionary.ts` → Tüm key'ler 8 dilde var mı?
  - Eksik varsa → Türkçe fallback ekle
- [ ] Hometex hardcoded string kontrolü
  - Almanca sayfalar: `Expo.tsx`, `Magazine.tsx` → i18n kontrolü
- [ ] Vorhang hardcoded string kontrolü
  - Almanca → `VorhangNavbar.tsx`, `VorhangFooter.tsx` → i18n kontrolü
- [ ] TRTEX → Haber içeriği zaten 8 dilde üretiliyor (otonom) — UI metinleri kontrol

### 7.5 Accessibility (a11y) Temel Kontroller
- [ ] Tüm `<img>` taglarında `alt` attribute
- [ ] Tüm `<button>` taglarında `aria-label` (ikon-only butonlarda)
- [ ] Renk kontrastı: Muted text renkleri WCAG AA standardına uygun mu?

### FAZ 7 DOĞRULAMA:
```bash
pnpm run build
git commit -m "feat(faz-7): mobil + performans + lokalizasyon"
```
