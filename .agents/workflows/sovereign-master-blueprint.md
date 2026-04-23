# AIPYRAM & ALOHA SOVEREIGN MASTER BLUEPRINT
*Dünya Standartlarında "Anahtar Teslim" Kurumsal Yapay Zeka Mimarisi*

Bu belge, AIPyram ekosistemini sıradan bir web uygulamasından; Palantir, Bloomberg ve BlackRock gibi devlerin kullandığı "Sovereign AI (Egemen Yapay Zeka)" seviyesine çıkarmak için hazırlanmış kalıcı ve bağlayıcı bir ustalık (skill) planıdır.

## 🌍 DÜNYA DEVLERİNDE NE VAR? BİZDE NE EKSİK?

Dünyanın en iyi kurumsal firmalarının (Enterprise AI) sistemlerini incelediğimizde şu 5 temel direği görüyoruz:

1.  **Semantic Knowledge Graph (Anlamsal Bilgi Ağı):**
    *   *Dünya Devleri:* Veriyi sadece metin olarak saklamaz. Şirketleri, ürünleri ve ihaleleri birbirine bağlayan bir "Anlamsal Ağ" (Knowledge Graph) kurar.
    *   *Bizim Eksik:* Veriyi JSON olarak Firestore'da tutuyoruz ancak "X firması Y fuarında Z ürünü sattı" şeklindeki anlamsal bağları (Entity linking) ajanlar tam kuramıyor.
2.  **Hierarchical Swarm (Hiyerarşik Kovan Zekası):**
    *   *Dünya Devleri:* Tek bir ajan her işi yapmaz. "Yönetici Ajan (Orchestrator)", "Analist Ajan (Scout)", "İnfazcı Ajan (Action)" ve "Denetçi Ajan (Auditor)" vardır. Biri hata yaparsa diğeri sistemi durdurur.
    *   *Bizim Eksik:* `live-news-swarm.ts` ile buna çok güzel başladık ama tüm sisteme (Perde, Hometex, Vorhang) henüz yayılmadı.
3.  **Human-in-the-Loop (HITL) Cockpit:**
    *   *Dünya Devleri:* Yapay zeka tamamen serbest bırakılmaz. Kritik kararlarda (örn. 10.000 dolarlık ihale onayı veya bir müşteriye fiyat teklifi) sistem "İnsan Onayı" bekler.
    *   *Bizim Eksik:* Admin panelimiz sadece "olanı biteni" gösteriyor. Ajanı durduracak, kuralını anında güncelleyecek "Kontrol Odası" (Brain Training / DLQ) mekanizmamız eksik.
4.  **Continuous RLHF (Sürekli Geri Bildirim ile Öğrenme):**
    *   *Dünya Devleri:* Sistem bir hata yaptığında ve insan bunu düzelttiğinde, AI bunu `LearningMatrix`'e yazar ve *bir daha asla aynı hatayı yapmaz.*
    *   *Bizim Eksik:* Ajanlarımız hala büyük ölçüde statik promptlar (`knowledge.md`) üzerinden çalışıyor. Dinamik kendi kendine öğrenme (Self-Reflection) yeteneği zayıf.
5.  **Strict Data Sovereignty & Idempotency:**
    *   *Dünya Devleri:* Sistemdeki hiçbir veri izinsiz dışarı çıkmaz, hiçbir AI iki kere aynı işlemi yanlışlıkla yapmaz (Mükemmel Idempotency).

---

## 🚀 ANAHTAR TESLİM AYLIK UYGULAMA PLANI (ROADMAP)

Bu plan kısa vadeli bir yama değil, aylarca sürecek ama sonunda "Yıkılmaz bir B2B İmparatorluğu" yaratacak Master Plandır.

### AŞAMA 1: THE IRON GATE (Demir Geçit ve Telemetri) — *İçinde Bulunduğumuz Aşama*
**Hedef:** Sistemin kalbini dış tehditlere ve iç israflara karşı %100 kilitlemek.
*   **Aksiyon 1:** Kaçak yapay zeka (Rogue AI) çağrılarının build anında (compile-time) engellenmesi (Tamamlandı).
*   **Aksiyon 2:** `aloha-sdk` içerisindeki loglama ve DLQ (Dead Letter Queue) yapısının kusursuzlaştırılması.
*   **Aksiyon 3:** Hangi tenant'ın (Perde, TRTEX) ne kadar kredi/token yaktığını saniyesi saniyesine izleyen "Maliye (Billing) Ajanı"nın kurulması.

### AŞAMA 2: THE COCKPIT (İnsan-AI Arayüzü / Admin Paneli)
**Hedef:** Admin panelini sadece rapor sunan değil, ekosistemi yöneten bir Bloomberg Terminaline dönüştürmek.
*   **Aksiyon 1:** "Hata Masası (DLQ UI)" inşası. Başarısız ajan operasyonları burada listelenir, admin hatayı düzeltip "Retry" diyebilir.
*   **Aksiyon 2:** "Brain Training" arayüzü. Adminin PDF veya metin girerek ajanların kurallarını (örn. Fiyatlama politikası) anında değiştirebilmesi.
*   **Aksiyon 3:** "Master Concierge" UI (Ana Sayfa Görsel Zekası). Kullanıcıya metin değil, anlık D3.js grafikleri çizen prestijli bir asistan.

### AŞAMA 3: KNOWLEDGE GRAPH & ARCHIVIST (Hafıza ve Arşiv)
**Hedef:** Veri Sermayesini korumak ve birbirine bağlamak.
*   **Aksiyon 1:** `ArchivistAgent`'ın devreye alınması. Eski haberlerin silinmeden sıkıştırılıp SEO uyumlu alt sayfalara (Legacy) taşınması.
*   **Aksiyon 2:** "Semantic Entity Extraction". Her içerikten Firma, Şehir, Ürün isimlerinin çekilip JSON-LD (Google zengin sonuçlar) grafiğine dönüştürülmesi.
*   **Aksiyon 3:** Tüm projelerin (Perde, Hometex, Vorhang) devasa alt sayfalarının (`/ihaleler`, `/akademi`, `/fairs`) taslaklarının ve veri modellerinin kurulması.

### AŞAMA 4: B2B MONETIZATION (Kasa ve Tahsilat)
**Hedef:** Kurulan devasa yapay zeka altyapısından para kazanmak.
*   **Aksiyon 1:** Rol bazlı üyelik (Auth) sistemi. Standart üye haberleri okur, Premium üye ihalelere teklif verir.
*   **Aksiyon 2:** Sovereign "Cüzdan (Wallet)" sisteminin Stripe ile tam entegrasyonu. B2B alıcılarının kredi kartı ile "Aloha Kredisi" satın alıp, platformda 3D render veya ihalelere harcaması.
*   **Aksiyon 3:** Kredi bitmeye yaklaştığında müşteriyi uyaran ve ödeme linki gönderen `FinanceAgent`.

### AŞAMA 5: THE SOVEREIGN SWARM (Tam Otonomi)
**Hedef:** Platformun insan müdahalesi olmadan 7/24 kendi kendini büyütmesi.
*   **Aksiyon 1:** TRTEX, Perde ve Hometex için haber/ihale toplayan ajanların Cron-Job ile gece gündüz veri girmesi.
*   **Aksiyon 2:** Üretilen içeriklerin 8 dile sıfır hata ile çevrilip SEO'ya uygun indekslenmesi.
*   **Aksiyon 3:** Vorhang.ai pazar yerinin satıcı-alıcı eşleştirmelerini ajanların otonom (Matchmaker) şekilde yapması.

---
**BU BİR ANAYASADIR.** AIPyram projelerinde yazılacak her satır kod, bu "Master Blueprint" hedefi doğrultusunda yazılacaktır.
