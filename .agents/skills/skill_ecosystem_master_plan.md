# AIPyram Sovereign Ecosystem — Ana Plan & Kurallar
**TARİH:** 20 Nisan 2026 | **DURUM:** TRTEX Canlı, Perde.ai Yeni Vizyon
**MUTLAK KURAL:** TRTEX otonom pipeline'ına (src/core/aloha/*, cron/*, trtex bileşenleri) ASLA DOKUNULMAZ.

---

## GIT GÜVENLİK STRATEJİSİ

```
master branch    → TRTEX canlı kodu (ASLA doğrudan commit yapılmaz)
                   Tag: trtex-safe-v1 (19 Nisan 2026 güvenlik noktası)

ecosystem-iskelet → Tüm yeni çalışma burada yapılır

GERİ DÖNME PLANI:
  Bir şey bozulursa → git checkout master
  TRTEX canlı build'i → Cloud Run'daki son deploy'dan çalışıyor
  Deploy etmediğimiz sürece canlıya ETKİ YOK
```

**DEPLOY KURALI:** `ecosystem-iskelet` branch ASLA doğrudan deploy edilmez.
Hazır olduğunda → master'a merge → build test → onay → deploy. **Deploy Hakan yapar.**

```
✅ TRTEX     → Canlı, otonom, 7/24 haber üretiyor. DOKUNMA.
🔄 Perde.ai  → Sıfır Menü vizyonu ile yeniden tasarlanıyor (20 Nisan).
❌ Hometex   → Mock veri, mock header, auth yok. İskelet yok.
❌ Vorhang   → Henüz iskelet aşamasında (Phase 8'de e-ticaret bağlantıları yapılacak).
```

### ✅ FAZ KAYITLARI VE BİTİRİLENLER (Güncel Durum)
- **Phase 1-6**: Başarıyla tamamlandı (EcosystemBus, Vorhang İskeleti, Hometex Mock, Perde.ai Visualizer Animasyonları).
- **Phase 7 (B2B Conversion & Lead Engine)**: 22 Nisan'da tamamlandı.
  - Perde.ai "B2B Teklif Al" butonu gerçek Firestore/API'ye bağlandı (`LeadCaptureModal`).
  - TRTEX Intelligence CTAs (Premium Haberlerdeki teklif/fırsat yakalama butonları) aktifleştirildi.
  - Master Concierge satış niyetini (intent) anlayarak otonom CTA butonları üretmeye başladı.
  - `/admin/leads` paneli Brutalist B2B Terminal estetiğiyle tasarlandı. Otonom Lead/Veri akışı sağlandı.
  - Tüm bu işlemler tek bir `pnpm run build` ile 0 hata (Exit Code 0) vererek prod-ready hale getirildi.

---

# PERDE.AI VİZYONU — SIFIR MENÜ, TEK CHAT

## Temel Felsefe

> **Menü yok. Sayfa gezintisi yok. Tek bir chat kutusu ve arkasında 33 ajanın ordusu.**
> Kullanıcı ne istediğini yazar, AI yapar. Sıfır öğrenme eğrisi.
> **Perde.ai bir "perde programı" değil — "Tekstil İşletim Sistemi" (Textile OS)**

### Üstline Kapatma Stratejisi (Çöpe Atma Değil)
- Mevcut menüleri silmiyoruz — **görünürlüklerini düşürüyoruz**
- Chat'i ana kontrol paneli yapıyoruz
- Eski sistem = arkada çalışan motor
- Risk sıfır, hız maksimum

### WOW Anı (KONVERSİYON MOTORU)
- Ziyaretçi daha **giriş yapmadan** foto yükler + 1 render alır
- "Bu iş gerçekmiş" der → kayıt olur
- Freemium conversion'ın altın kuralı
- **Ana sayfada demo render alanı ZORUNLU**

### Chat Hafıza Katmanı
- Firestore `chat_sessions` koleksiyonu
- Kullanıcı tekrar geldiğinde: "geçen hafta baktığın salon projesi" diye devam eder
- Session-based context window

## Perde.ai = Tekstilin İlk "Sıfır Arayüz" Motoru

| Bileşen | Açıklama |
|---------|----------|
| **Ana Sayfa** | Çok etkileyici, içeride neler var net anlatılmalı, resimler bol. Ziyaretçi "aradığım her şey var" demeli |
| **Chat Widget** | Sağ altta TEK chat — taşınabilir, büyütülebilir, küçültülebilir. DOKUNMA. Küçük eksikleri not al ama elle müdahale yok |
| **Sayfalar** | Ana sayfa, Hakkımızda, İletişim, Stüdyo, Üyelik — MUTLAKA olacak |
| **Detay Sayfaları** | İçeride neler oluyor net anlatmak için ayrı detay sayfalar açılabilir |

### Chat Widget Kuralları (DOKUNMA)
- `src/components/ConciergeWidget.tsx` — 665 satırlık güçlü widget
- Gemini API entegrasyonu (`/api/chat`) çalışıyor
- Minimize/Maximize (isExpanded) var
- 3 dilde quick actions var
- Visual charts (pie, bar, KPI) inline render
- **ASLA 2. chat açılmayacak — tek chat her şeyi bilir**
- Mesleki persona: Kullanıcı mesleğini yazınca panelde o persona'nın adı çıkıyor

---

## Chat Ajanı Yetenekleri (Persona Bazlı)

### 🎨 İç Mimar / Dekoratör
- Oda fotoğrafı yükle → Vision AI analiz → perde önerisi render (Imagen 3.0)
- Mekan foto yükleme chat'te VAR + ana kanvas'ta da VAR
- Ölçü hesaplama → chat'ten ERP ajanı
- Kumaş + fiyat aralığı → numune talep (B2B eşleşme)

### 🏭 Firma Sahibi / Üretici
- "Piyasada ne oldu?" → TRTEX.com'a link verilir (doğrudan istihbarat)
- Kartela/ürün yükleme → chat'ten çoklu dosya + ürün yükle → kimlikler altta Tex'e key olarak yazılır
- Dijital katalog oluştur → AI otomatik render
- ERP entegrasyonu → yönetim paneline chat'ten erişim

### 🌍 Toptancı / İhracatçı
- Fırsat radarı → TRTEX canlı veriler
- 8 dilde ticari yazışma (sektör terminolojisi bilen çeviri)
- Hometex.ai'ye link → fuar bilgileri

### Sınırsız Yaratıcılık
- **Üye panelde ASLA sınır koymayalım** — kredisi olduğu sürece istediğini yapsın
- Uzmanlık alanı: perde, ev tekstili, dekorasyon, mimarlık, iç mimarlık
- Mobilya, aksesuar — canı ne isterse tasarlasın

---

## AIPYRAM SOVEREIGN ECOSYSTEM — BÜYÜK RESİM VE İŞ MODELLERİ

Ekosistem 5 ana yapıdan (Sovereign Node) oluşur. İş zekası (Business Logic) bu roller etrafında örülmüştür:

### 1. AIPyram (Ana Beyin / Motor)
- **Görev:** Ekosistemin görünmez "İşletim Sistemi"dir (OS).
- **Hedef:** Son kullanıcıya hizmet etmez. Tüm yapay zeka ajanlarının (ALOHA), veritabanının, dil çevirilerinin ve API köprülerinin barındığı arka plan (backend) motorudur. Dilsiz bir hizmetkardır.

### 2. TRTEX (Sektörel İstihbarat ve Medya Ağı)
- **Görev:** Otonom İstihbarat Terminalidir. Yapay zeka ile sektörü tarar, trendleri yazar, yeni projeleri ve ihaleleri bulur.
- **Hedef Kitle:** Sektörle uğraşan *herkes*. Üreticiden toptancıya, perakendeciden mimara kadar global tekstil ve iç mimari dünyası. Pazarın gazetesi ve hafiyesidir.

### 3. Perde.ai (Üretici & Perakendeci ERP / Satış Motoru)
- **Görev:** İşin kalbi ve ana çalışma masasıdır. Hedef kitle küçük perakendeciler ve orta ölçekli toptancılardır. (Büyük fabrikalar için sadece sinir ağları üzerinden API bağlantısı kurulur).
- **Tam Kapsamlı ERP:** Sadece bir "satış/komisyon" motoru değildir. Üyeler; **muhasebe, sipariş yönetimi, stok takibi** dâhil işletmelerinin TÜM ihtiyaçlarını buradan çözer. Başka hiçbir muhasebe veya CRM yazılımına ihtiyaç duymayacakları %100 kapsayıcı bir sistemdir. (Bu kural tüm projeler için geçerlidir).
- **İş Modeli 1 (Komisyon):** Toptancı perakendeciye bu sistem üzerinden ürün sattığında, sistem aracı olur ve **komisyon alır**.
- **İş Modeli 2 (Abonelik):** Perakendeci, son kullanıcısına (müşterisine) bir mekan tasarlarken (kusursuz otel/ev/ofis tasarımı) Perde.ai'nin render ve 3D altyapısını kullanır ve bunun için **aylık abonelik (üyelik ücreti)** öder.
- **Kapsam:** Sadece perde ve ev tekstili DEĞİLDİR. Mobilya, aydınlatma, iç mekan tasarımı... Sınır yoktur. Çatı kavram "Sınırsız Tasarım"dır. (Örn: Bir giyim markası bile kıyafet tasarlayabilir, sistem sektör ayrımı yapmaksızın tasarım hizmeti verir. Üye girişte sektörünü chat'e yazarak veya profilden belirler).

### 4. Hometex (Sanal Fuar ve İç Mekan Dergisi)
- **Görev:** Global Ürün Vitrini. Kesinlikle "online satış / e-ticaret" platformu DEĞİLDİR. Perakende satış yapılmaz.
- **Hedef:** Tıpkı fiziksel bir fuar veya prestijli bir iç mekan dergisi gibi çalışır. Firmaların ürünlerini "Wow!" dedirtecek şekilde global pazara sergiler. B2B bağlantılar ve büyük iş fırsatları oluşturur. Buradan müşteri bulan firmalardan komisyon/abonelik alınır.

### 5. Vorhang (B2C & B2B Avrupa Satış Kapısı / E-Ticaret Pazar Yeri)
- **Görev:** Avrupa (DACH) merkezli, son kullanıcının tasarım yaparak doğrudan satın aldığı "E-Ticaret Dönüşüm Hunisi"dir. 
- **Pazar Yeri (Marketplace) Modeli:** Biz (AIPyram) doğrudan ürün satmayız. Bizim altyapımızda toptancı ve perakendeciler **"Dükkan Açarlar"** (Hepsiburada mantığı).
- **Akıllı Sipariş Yönlendirme:** Dünyanın neresinden sipariş gelirse gelsin, sistem o siparişi en yakın perakendeciye veya kargo avantajı en yüksek olan dükkan sahibine otonom olarak yönlendirir.
- **Ödeme Altyapısı Kuralı (Yemeksepeti Modeli):** Vorhang üzerinden (veya sistemdeki herhangi bir satın almadan) geçen *tüm ödemeler (Kredi Kartı/Stripe) önce BİZİM (AIPyram) havuz hesabımıza düşer*. İş sorunsuz bittikten sonra, biz ay sonunda veya hakediş döneminde iş ortaklarına/üreticilere toplu ödeme yaparız. Ödemeler asla doğrudan iş ortaklarının hesabına gitmez. Para her zaman merkezin kontrolündedir.

---

## Görsel Kütüphane Sistemi

### Kütüphane Kuralları
- Müşterilerin yüklediği güzel veriler → TRTEX ve Hometex'te kullanılabilir
- **Dev bir görsel havuz kur** — tüm ekosistem beslensin
- Resimler **etiketlenerek arşivlenmeli** (kategori, renk, ürün tipi, boyut)
- Çözünürlük seviyeleri: **1K, 2K, 4K, 8K**
- Key sistemi: Ajanların kolayca bulacağı formatda
- Kota tasarrufu: Geliştikçe mevcut fotoları tekrar kullanırız
- Firestore `image_library` koleksiyonu + Cloud Storage

### Image Library Şeması
```typescript
{
  key: string;           // "curtain_modern_cream_2026_hero"
  url_1k: string;        // Cloud Storage 1K versiyonu
  url_2k: string;        // Cloud Storage 2K versiyonu
  url_4k?: string;       // Cloud Storage 4K versiyonu (opsiyonel)
  url_8k?: string;       // Cloud Storage 8K versiyonu (opsiyonel)
  category: string;      // "curtain_modern" | "bedding_luxury" | ...
  tags: string[];        // ["krem", "modern", "oturma-odasi", "blackout"]
  source: string;        // "imagen" | "user_upload" | "trtex_article"
  tenant: string;        // "perde" | "trtex" | "hometex"
  usageCount: number;    // Kaç kez kullanıldı (popülerlik)
  createdAt: string;
}
```

---

## Fiyatlandırma (Hakan Belirledi — DEĞİŞTİRME)

| Plan | Fiyat/Ay | İçerik |
|------|---------|--------|
| **Keşfet** | Ücretsiz | Chat + TRTEX haberleri + 5 render/ay |
| **Pro** | $49 | Sınırsız render + dijital katalog + lead alma |
| **Enterprise** | $199 | Tenant + özel domain + API + CRM entegrasyonu |

> Bu fiyatlar KESİNLEŞTİ. Dünyanın hizmeti var içeride. Değiştirme.

### Ek Gelir Kanalları (Hakan Onayıyla Eklenebilir)
- Render kredi paketi (5 kredi ücretsiz, sonra paket al)
- Premium dataset erişimi (kütüphanedeki 4K/8K görseller)
- Öncelikli lead (Enterprise üyelere gelen talepler önce iletilir)

---

## Pilot Firmalar

| Firma | Şehir | Tip | Tenant ID |
|-------|-------|-----|-----------|
| **Süper Tekstil** | Çorlu / İstanbul | Üretici | `super_tekstil` |
| **Bufera Tekstil** | Bursa | Üretici (araştırılacak) | `bufera` |
| **Ardıç Perde** | Ankara | Perakendeci | `ardic_perde` |

---

## Tenant Sistemi

```
Her firma → perde.ai/[firma-slug]
  ↳ Kendi ürün kataloğu yüklü
  ↳ Kendi fiyat listesi tanımlı
  ↳ Müşterileri bu linki kullanıyor
  ↳ AI, o firmanın ürünlerini öneriyor
  ↳ Gelen talepler firmanın paneline düşüyor
```

---

## KRİTİK KARARLAR (20 Nisan — KESİNLEŞTİ)

| Karar | Seçim | Neden |
|-------|-------|-------|
| İlk MVP persona | **Firma Sahibi** | Para oradan gelir |
| Ana sayfa yapısı | **Chat + detay bloklar birlikte** | Sadece chat yetmez, görsel ikna da lazım |
| TRTEX tetikleme | **Başta admin onaylı** | Çöp kontrolu için |
| Chat sayısı | **TEK chat — asla 2. açılmaz** | ConciergeWidget dokunulmaz |
| Mevcut sayfalar | **Üstüne kapatma, silme** | Risk sıfır |

### Closed-Loop Veri Çarkı
```
Üye kumaş yükler → Perde.ai render üretir → Görsel kütüphaneye düşer
→ Başka üyelerin renderleri bu görsellerden beslenir → Kütüphane sürekli büyür
```

---

## TRTEX OTONOM PIPELINE KURALLARI (20 Nisan Güncellemesi)

### Görsel Pipeline
- Her haber KESİN 1+ görsel ile yayınlanmalı — **ASLA resimsiz haber yok**
- Imagen API kotası dolduğunda → aynı kategorideki eski haberden mid/detail görsel ödünç al
- Ödünç görseller `_image_borrowed: true` ile etiketlenir → kota düzelince gerçek görsel üretilir
- Retry queue: `trtex_image_queue` koleksiyonu → master-cycle cron retry eder
- Kota düşükken: 1K çözünürlük tercih et (maliyet tasarrufu)

### Dil Kuralları
- TR içerik = %100 Türkçe. SIFIR İngilizce kelime.
- H2/H3 başlıklar SADECE Türkçe: PAZAR VERİLERİ, TİCARİ ETKİ, NE YAPMALI?, FIRSAT HARİTASI
- İngilizce yapısal başlıklar YASAK: SITUATION, SO WHAT, NOW WHAT, WHO WINS, WHO LOSES
- Sektörel terimler (OEKO-TEX, GRS, FOB, CIF) kalabilir

### Altyapı
- %100 Google-Native: Firestore, Vertex AI, Cloud Storage, Cloud Run, Cloud Scheduler
- 3. parti bağımlılık (Redis, Upstash, Pinecone) YASAK
- `force-dynamic` — sıfır ön yüz cache

---

## TEKNİK ALTYAPI FAZLARİ

### Tamamlanan Fazlar (19-20 Nisan)
```
✅ FAZ 1: Tenant Config → src/lib/tenant-config.ts
✅ FAZ 2: Universal Auth → useTenantAuth hook
✅ FAZ 3: ALOHA Tools config → tenant-config entegrasyonu
✅ FAZ 4: DynamicCanvas upgrade → yeni widget'lar
✅ TRTEX Pipeline Fix → görsel + dil düzeltmeleri (20 Nisan)
```

### Tamamlanan Master Plan Fazları
```
✅ FAZ 5: Hometex iskelet → auth + navbar (Tamamlandı)
✅ FAZ 6: Perde.ai Sıfır Menü → Ana sayfa + üyelik yeniden tasarım (Tamamlandı)
✅ FAZ 7: The Void Dashboard → tam yönetim paneli (Tamamlandı)
✅ FAZ 8: Vorhang hazırlık → 4. güç altyapısı (Tamamlandı)
✅ FAZ 9: Görsel Kütüphane → etiketli, çok çözünürlüklü arşiv (Tamamlandı)
✅ FAZ 10: Fuar İş Akışı → TRTEX ↔ Perde.ai ↔ Hometex ışınlama (Tamamlandı)
```

### HER FAZ SONUNDA
1. `pnpm run build` → Exit code 0 zorunlu
2. TRTEX rotası render test
3. Değişiklikleri kaydet
4. Skill dosyasını güncelle

---

## 🎯 GÜNLÜK KAYIT: 20 NİSAN 2026 — YAPILANLAR VE KALAN İŞLER

### ✅ BUGÜN YAPILANLAR
1. **Perde.ai UI/UX Devrimi & "Sıfır Menü" Vizyonu:** 
   - Eski navigasyon kaldırılarak "Sıfır Menü" vizyonuyla çalışan, yapay zeka odaklı minimalist B2B Terminal arayüzüne geçildi.
   - `PerdeNavbar.tsx` yeniden yazılarak sağdan açılan Framer Motion destekli mobil uyumlu (hamburger) menü eklendi.
2. **Kapsamlı Lokalizasyon (8-Dil Zekası):** 
   - Perde.ai içerisindeki (Pricing, WowDemo, LandingPage) 200+ satırlık hardcoded Türkçe metin, 8 dili destekleyen dinamik `perde-dictionary.ts` mimarisine entegre edildi.
3. **Kritik Güvenlik ve Cüzdan (Wallet) Entegrasyonu:** 
   - `/api/render` uç noktasının korunmasız yapısı **Upstash Redis RateLimiting** (10s/1 istek) ve **Firebase Admin Auth** ile %100 kapalı devre hale getirildi. 
   - İşlem sonrasında kullanıcının `wallets` Firestore koleksiyonundan bakiye (kredi) düşülme mimarisi kuruldu.
   - `/api/chat` uç noktasına dinamik "Tenant Algılama" yerleştirildi, botun sadece bağlı olduğu tenant'a özel persona (Perde asistanı vs. TRTEX uzmanı) ile cevap vermesi sağlandı.
4. **Build & Altyapı Kurtarma Operasyonu:** 
   - Cloud Run'da yaşanılan kronik `Exit Code: 1` çökme sorunları incelendi. React Server Component içerisindeki yasadışı `onMouseOver` event'leri ve Linux Casing (`components/ui/card` vs `Card`) uyuşmazlıkları tespit edilerek temiz bir build ortamı inşa edildi.
5. **TRTEX Canlı Yayını (Otonom Deployment):** 
   - Hazırlık aşamasındaki tüm **Perde.ai** bileşenleri lokal ortamda `git stash` güvencesiyle kullanıcının bilgisayarında koruma altına alınırken, ustalık eseri olan **TRTEX Intelligence Terminali** %100 sorunsuz bir şekilde Google Cloud Run'da canlı (Production) ortamına alındı. 

### ⏳ YARINKİ HEDEFLER (KALAN İŞLER)
1. **Perde.ai Local Uçtan Uca (E2E) Testleri:**
   - Yazılan Auth, Render API (Kredi Düşme) ve Chatbot zekalarının yerelde (`localhost:3000`) bir B2B müşterisi gözüyle simüle edilerek eksiklerin çıkarılması ve giderilmesi.
2. **Stripe (Faz 9 Mimarisi):**
   - Lokal testler başarılı olduktan sonra `Pricing.tsx` içerisindeki paketlerle Stripe ödeme kanallarının bağlanması, sistemin gelir üreten (revenue-generating) bir forma sokulması.
3. **Perde.ai Production Deployment:**
   - Ödeme yapısı ve lokal testler eksiksiz stabiliteye ulaştıktan sonra Perde.ai sisteminin TRTEX gibi Google Cloud'da canlı ortama fırlatılması. 
4. **Hometex.ai İskelet Klonlama (Faz 5):**
   - Perde.ai kalıplarına uygun şekilde sistemin 3. büyük ayağı olan Hometex altyapısının B2B gatekeeper'ı, üyelik ve dashboard yapılarının oluşturulması.
5. **TRTEX Haber Alt Sayfa/Detay UI Lokalizasyonu (Acil - UI Bug):**
   - TRTEX ana sayfasındaki (PremiumB2BHomeLayout) "PİYASA REJİMİ", "TRTEX İSTİHBARAT ÇIKARIMI" gibi Türkçe kalmış Hardcoded metinlerin ve **haber detay alt sayfalarındaki (ArticleClient vb.) benzer arayüz yapılarının** dinamik 8-dil sözlük yapsına dahil edilmesi.
   - ALOHA'nın "ai_ceo_block" ve "insight.explanation" gibi kısımlarını da dinamik çeviriye veya İngilizce/Türkçe fallback yapısına geçirilmesi.

---

## 🚀 MOCK'TAN ÜRETİME GEÇİŞ ANA PLANI (GEMİNİ 3.1)

Aşağıdaki 8 fazlı plan, Perde.ai ekosistemindeki tüm mock (sahte) verileri kaldırıp gerçek arayüzleri gerçek Firestore, Cloud Storage ve `/api/render`, `/api/chat` uçlarına bağlamak üzere oluşturulmuştur.
Bu planın eksiksiz uygulanmasıyla 3 sacayağı (Chat, Visualizer, B2B ERP) tek bir gerçek veri kaynağı üzerinden konuşmaya başlayacaktır. (Ayrıca yeni ajanların eklenmesini de kapsar).

### Faz 1: Sahte Auth'ları Öldür
* B2B.tsx, Catalog.tsx, Configurator.tsx'te mock `useAuth`lar kaldırılıp gerçek `usePerdeAuth`'a bağlanılacak.
* "Lütfen Giriş Yapın" gibi UI stateleri eklenecek ve temel `onSnapshot` okumaları (projects vb.) açılacak.

### Faz 2: Frontend'i Backend API'lere Bağla
* RoomVisualizer.tsx'deki setTimeout ile dönen Unsplash resimleri yerine, `fetch('/api/render')` tetiklenerek Imagen 3.0 devresi açılacak.
* PerdeAIAssistant.tsx'deki switch-case keyword response'lar silinerek `fetch('/api/chat')` (Gemini 2.5 Flash Memory) tetiklenecek. "Tasarım", "Sipariş" vs. sayfa geçişleri lokal dispatch ile devam edecek.
* RoomVisualizer 'agent_request_edit' gibi dispatcher'ları dinleyecek.

### Faz 3: Firebase Storage Entegrasyonu (Görsel Pipeline)
* `src/lib/storage-utils.ts` adlı utils oluşturulup (`sharp` kütüphanesi yardımıyla) render edilen çıktılar 1k/2k/4k olarak Firebase Storage'a yüklenip, Firestore'a ('image_library') referans verilecek. Base64 yığınlarından kurtulunacak.

### Faz 4: ERP Panelini Canlandır (Gerçek Veri)
* MyProjects.tsx'da MOCK_PROJECTS kaldırılıp, kullanıcının render geçmişi çekilecek (`image_library`).
* StudioContent.tsx'da `?tab=inventory` ve `?tab=orders` için statik ekranlar iptal edilip, Firestore (`products` ve `projects`) bağlanılacak.
* OrderSlideOver.tsx'daki JSON.stringify edilmiş `rooms` dizi olarak kaydedilecek.

### Faz 5: Eksik Ajanlar (Kumaş, PDF, WhatsApp)
* `FabricRecognitionAgent.ts`: Yüklenen resmin kumaş analizini (Gemini Vision) yapan ajan eklenecek.
* `DocumentAgent.ts` & `/api/quote-pdf`: `pdf-lib` kullanılarak kurumsal bir PDF teklif çıktısı hazırlayan ajan/endpoint eklenecek.
* `WhatsAppAgent.ts`: Veriyi biçimlendirip whatsapp deep url (wa.me) üreten ajan eklenecek ve OrderSlideOver.tsx tetikleyicilerine entegre edilecek.

### Faz 6: ALOHA Event Bus Genişletmesi
* EventBus.tsx, `RENDER_COMPLETED`, `ORDER_CREATED`, `FABRIC_ANALYZED`, `QUOTE_GENERATED` vb. yeni sinyallerle donatılacak.
* ALOHA tools (`tools.ts`) kumaş analiz özellikleri eklenerek Schema güncellenecek.

### Faz 7 & 8: Hometex Hazırlığı ve Sinyal Hattı Onarımı
* Hometex Feature Flag'i açılacak. TRTEX, Hometex ve Perde.ai arasındaki capraz okumalar Matchmaker ajanı yardımıyla yapılandırılacak.
* Sinyal çarkının (Chat tetikler -> Visualizer üretir -> ERP okur -> Pdf çıkartır) uçtan uca senkron olduğu test edilecek.

*(Not: Her kod değişikliğinde pnpm build çalıştırılarak sistem kapatılmazdan önce güvenlik testleri yapılacaktır.)*

---

## 🏛️ ALOHA SOVEREIGN AGENT HUB — MERKEZİ AJAN MİMARİSİ (21 Nisan 2026)

### Temel İlke
Tüm ajanlar (WhatsApp, PDF, Render, Chat, FabricRecognition, Retention) izole tenant özellikleri DEĞİLDİR.
AIPyram ALOHA Master Node altında merkezi servisler olarak çalışır.
Her tenant (perde, trtex, hometex, vorhang) "Dumb Client" olarak `invokeAgent({ agentType, tenantId })` çağrısı yapar.

### Mimari Akış
```
Tenant Client → invokeAgent() → Feature Flag Kontrol → Wallet Kredi Kontrol → Ajan Çalıştır → EventBus Sinyal → Firestore Log → Sonuç Dön
```

### Dosya Haritası (Sovereign Agent Hub)
```
src/lib/aloha/
├── registry.ts          → invokeAgent() merkezi executor
├── tools.ts             → Gemini function-calling (agent.whatsapp, agent.document vb.)
├── WalletService.ts     → Merkezi kredi kontrol/düşme servisi [YENİ]

src/lib/agents/
├── EventBus.ts          → 14 event tipi (RENDER_COMPLETED, ORDER_CREATED vb.)
├── SwarmCoordinator.ts  → 8 koreografi kuralı
├── WhatsAppAgent.ts     → [YENİ] Tenant-agnostik WA mesajlaşma
├── DocumentAgent.ts     → [YENİ] Tenant-agnostik PDF üretimi
├── FabricRecognitionAgent.ts → [YENİ] Kumaş tanıma (Gemini Vision)
├── RetentionAgent.ts    → [YENİ] Terk edilmiş teklif takibi
├── PolyglotAgent.ts     → Çeviri ajanı
├── MatchmakerAgent.ts   → Tedarikçi eşleştirme
└── TrendHarvesterAgent.ts → Trend analizi
```

### TenantFeatures Genişletilmiş Flagler
```typescript
whatsapp: boolean;       // WhatsApp bildirim ajanı
documents: boolean;      // PDF/Proforma ajan
fabricAnalysis: boolean; // Kumaş tanıma ajanı
retention: boolean;      // CRM sadakat ajanı
```

### Wallet Kredi Maliyetleri
- render: 1 kredi
- document: 0.5 kredi
- whatsapp: 0.1 kredi
- fabric_analysis: 0.5 kredi
- chat: 0 kredi (ücretsiz)

### Faz Sırası (6 Faz)
```
Faz A: TenantFeatures genişlet + WalletService yaz
Faz B: AgentRegistry'yi invokeAgent() executor'a dönüştür
Faz C: Mevcut API route'ları tenant-agnostik yap (render, whatsapp, documents, vision-analyzer)
Faz D: Eksik ajanları oluştur (Fabric, Document, WhatsApp, Retention)
Faz E: EventBus + SwarmCoordinator genişlet (8 yeni event, 5 yeni kural)
Faz F: ALOHA tools.ts'ye 5 yeni ajan komutu ekle
```

### KRİTİK KURALLAR
1. **Hiçbir tenant doğrudan ajana erişemez** — hepsi invokeAgent() üzerinden geçer
2. **Feature Flag kontrolü zorunlu** — tenant config'de flag kapalıysa ajan çalışmaz
3. **Wallet kontrolü zorunlu** — kredi yoksa ajan çalışmaz
4. **Her ajan çağrısı Firestore'a loglanır** — `aloha_agent_logs` koleksiyonu
5. **Her başarılı ajan çağrısı EventBus sinyali fırlatır** — zincir reaksiyon tetikler
6. **MAYIS 2026 GOOGLE I/O "AGENTIC OS" UYUMU ZORUNLULUĞU:** Bu mimari "Sovereign Agent Hub" olarak adlandırılır. Google 19-20 Mayıs'ta Agentic Workflow ve otonom sistem yeniliklerini (örn: Gemini 2.0 / Vertex Agents) tanıttığında, bu sistem `AgentRegistry` ve `EventBus` zinciri sayesinde kod kırılması yaşamadan tüm yenilikleri Native Function Calling (`tools.ts`) üzerinden anında içine alacak esnekliktedir. Gelecekte projeye eklenecek tüm AI Ajanları veya IDE'ler bu otonom "Merkezi Beyin - Aptal İstemci" felsefesini asla bozmamalı, veriyi asla geriye götürmemelidir.
