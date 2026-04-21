# AIPYRAM Otonom Tedarik Zinciri (Supply Chain Intelligence Pipeline)

Bu belge, Aipyram Master Node (Ana Beyin) üzerindeki ajanların (ALOHA) birbirinden yalıtılmış veya birbirine entegre 4 Tenant (TRTEX, Perde.AI, Hometex.AI ve E-Ticaret) arasındaki **Veri ve Üretim Aktarım Kurallarını** tanımlar. Sistem, "Hammadde Haberi"nden başlayıp "Son Kullanıcı Satışına" kadar giden devasa bir Otonom Tedarik Zinciri gibi çalışır.

## 1. ZİNCİRİN HALKALARI VE GÖREVLERİ

### HALKA 1: TRTEX (Avcı & İstihbarat)
- **Rol:** Global pazarı tarayan sismik sensör ve istihbarat toplayıcı.
- **Tetikleyici (Trigger):** Yeni bir hammadde gelişmesi (Örn: "Hindistan'da 20 denye polyester ip üretimi hızlandı", "Yeni su itici pamuk kartelası tanıtıldı").
- **ALOHA Görevi:** Bu haberi derler, doğruluk filtresinden geçirir, ticari önem derecesini (Lead Score) belirler ve TRTEX Terminaline (Sıcak B2B Lead Makinesi) basar.
- **Bağlantı Çıkışı:** TRTEX, ürettiği bu ham istihbarat paketini özel bir sinyal (Event Emitter veya Webhook) olarak Aipyram Merkez Veriyoluna (Master Bus) fırlatır.

### HALKA 2: Perde.AI (AR-GE & Tasarım)
- **Rol:** TRTEX'ten gelen hammadde haberini alıp "Son Kullanıcıya Uygun Ürün" tasarlayan yapay zeka tasarım fabrikası.
- **Tetikleyici (Trigger):** Aipyram Veriyoluna düşen yeni hammadde sinyali.
- **ALOHA Görevi (Perde-Agent):**
  1. TRTEX'teki polyester/pamuk ip haberini okur.
  2. "20 denye polyester ipten inovatif ne üretilebilir?" diye analiz eder (Örn: Akustik ses yalıtımlı perde, hafif yazlık nevresim takımı).
  3. Image Agent'ı tetikleyerek bu fikri *Dergi Kalitesinde* (High-End, Architectural Digest tarzı) renderlar.
  4. 3D Modelleme / Konfigürasyon dosyalarını (JSON) hazırlar.
- **Bağlantı Çıkışı:** Üretilen bu ürün konseptleri ve render dosyaları Hometex havuzuna aktarılır.

### HALKA 3: Hometex.AI (Vitrin & Toptan Satış Pazarı)
- **Rol:** Lüks Sanal Fuar ve Sovereign Dergi platformu.
- **Tetikleyici (Trigger):** Perde.AI'nin tasarım mutfağından çıkan yeni ürün paketi.
- **ALOHA Görevi (Hometex-Agent):**
  1. Perde.AI'nin tasarladığı akustik perde konseptini alır.
  2. Bunu sanal bir fuar standına dijital ikiz (Exhibitor / Booth) olarak yerleştirir.
  3. Satışa hazır hale getirilmiş bir B2B toptan alım proforması oluşturur.
  4. TRTEX'te haberi çıkan hammadde sağlayıcısını, Perde.AI tasarımını ve Hometex alıcısını birleştirir.
- **Bağlantı Çıkışı:** Ürün toptan değil perakende kitlesi yakalarsa 4. Halka'ya sürülür.

### HALKA 4: B2C E-Ticaret (Son Kullanıcı Terminali - Gelecek Tenant)
- **Rol:** Siparişi alan ve bireysel tüketiciye ulaştıran e-ticaret noktası.
- **Tetikleyici (Trigger):** Hometex.AI fuarında en çok hit alan ve beğeni toplayan prototipler.
- **ALOHA Görevi:** Trend olan bu ürün için perakende sayfalarını otomatik oluşturup son kullanıcı satışı başlatır.

---

## 2. VERİ YOLU (EVENT BUS) KURALLARI

Sistemin "şizofreniye" bağlamaması (yani ajanların dosyaları veya akıllarını karıştırmaması) için katı **Pub/Sub (Publish/Subscribe)** kuralları uygulanacaktır:

1. **`trtex_signal_raw_material`**
   - **Tetikleyen:** `trtexSiteManager` veri tabanına haber eklediğinde ateşler.
   - **Dinleyen:** `Perde.AI Tasarım Ajanı`.
   - **Payload:** `{ "material": "20 denye ip", "source": "TRTEX", "urgency": "high" }`

2. **`perde_signal_product_design`**
   - **Tetikleyen:** Perde.AI ajanı tasarımı bitirdiğinde ateşler.
   - **Dinleyen:** `Hometex Sanal Fuar Ajanı`.
   - **Payload:** `{ "product_type": "Acustic Curtain", "renders": ["url1", "url2"], "b2b_ready": true }`

---

## 3. ASKERİ KODLAMA DİSİPLİNİ UYARISI
Bu devasa mimari anında kodlamayla veya "bir script ile" halledilemez. Aşağıdaki sıralama kesin kuraldır:
1. **Şu an bulunduğumuz aşama:** Kuralların yazılması ve sistemin teorik haritasının çıkarılması.
2. **Adım 2:** Ajanlar arası mesajlaşmayı sağlayan `src/core/aloha/agentBus.ts` event-driven omurgasının kurulması.
3. **Adım 3:** Perde.AI ajanı (Designer Agent) için yeni prompt ve kural dosyalarının yazılması.
4. **Adım 4:** TRTEX ve Perde.AI arasında ilk deneme verisi aktarımı (Mock Test).

> **AIPYRAM GENERAL MANAGER NOTU:** Bu dosya bir yapay zeka zihniyet bildirgesidir. Otonomi zincirinin temel yetenek ağacını (Skill Tree) belirler. Kodlamaya geçilmeden önce kurucu otorite tarafından onaylanmalıdır.
