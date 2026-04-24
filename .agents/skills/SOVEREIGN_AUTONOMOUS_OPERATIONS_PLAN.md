# 🛡️ SOVEREIGN OS - OTONOM OPERASYONLAR VE VERİ AKIŞ PLANI (BÖLÜM 9)

> **TARİH:** 24 Nisan 2026
> **ONAYLAYAN:** Hakan Toprak (Kurucu / Sovereign)
> **DURUM:** KUTSAL MİMARİ BELGESİ (Google-Native Özel Altyapı)

---

## 1. TRTex ÜYE YÖNETİM PANELİ VE "CHAT-BASED" VERİ BESLEME (DATA INGESTION)
Üyelerin (Fabrikalar, Üreticiler, Mekanizmacılar) klasik, karmaşık formlar doldurması dönemi bitmiştir. 
- **Çoklu Yükleme Ekranı:** Her üyenin kendi yönetim paneli olacak. Üye; iplik, kumaş numunesi, korniş/rustik görsellerini ve bunlara ait teknik belgeleri (PDF/TXT) aynı anda sisteme sürükleyip bırakacak.
- **Chat Arayüzü ile Tanımlama:** Üye sadece "Bu 20 denye polyester kumaş, yanmazlık belgesi de ekte, sürtünmesi 45 bin" diyecek.
- **Otonom Ayrıştırma (Parser):** Arka plandaki Gemini Vision ve Text modelleri, görseli ve belgeyi analiz edip `TextileProduct` şemasındaki `martindale_rub_test`, `composition`, `gtip_code` gibi derin mühendislik verilerini otonom olarak doldurup doğrudan **TRTex** ana veritabanına kaydedecek.
- **[SÜPER OTONOM - Desen Geometrisi]:** Sisteme yüklenen desenli (jakar, brode, etnik vb.) kumaşlarda "Rapor Boyu" ve "Desen Yönü" eksikse, ALOHA (Gemini Vision) görseldeki referans noktalarından bu matematiği **otonom olarak hesaplar ve boşlukları kendi tamamlar.** Hiçbir koşulda işlem durdurulmaz veya kullanıcıya "bunu yapamam" denilmez. Eksik veri anında tamamlanıp 3D render motoruna aktarılır.

## 2. GÖRSEL RENDER MOTORU (100% GOOGLE-NATIVE & DETERMINISTIC TEXTURE MAPPING)
Tasarım ve render işlemleri için dışarıdan hiçbir 3. parti kullanılmayacaktır ancak **Standart Yapay Zeka (Prompt ile Resim Çizdirme) ASLA KULLANILMAYACAKTIR.**
- **Kırmızı Çizgi (Pattern Hallucination):** Tekstilde %99 benzerlik %0 başarı demektir. Fabrikanın yüklediği görsel, AI tarafından yeniden çizilmeyecektir.
- **Seamless Texture Extraction:** Gemini Vision, yüklenen kumaşın fotoğrafını önce kusursuz, dikişsiz bir kaplama dokusuna (Seamless Texture Map) çevirir.
- **Matematiksel 3D Kaplama (Mesh Mapping):** Çıkarılan bu gerçek doku haritası, Vertex AI altyapısında barındırılan statik 3D modellere (Koltuk, Perde, Yatak) matematiksel olarak giydirilir (Displacement/Bump mapping). Böylece toptancı, AI'ın uydurduğu bir deseni değil, **fabrikanın ürettiği kumaşın milimetrik gerçekliğini** ekranda görür. Ürün asla elimizde patlamaz.

## 3. "SOVEREIGN ONAY GEÇİDİ" VE ALOHA YETKİ MATRİSİ (AUTHORITY LIMITS)
ALOHA dünyanın en zeki asistanı olsa da, nihai patron **Hakan Toprak'tır.**
- **Başlangıç Yetkisi (Sıfır Otonomi):** ALOHA başlangıç aşamasında işlemleri yapar, teklifleri hazırlar, ajanları çalıştırır ancak aksiyon almadan (kredi kartı çekimi, fabrikaya iş emri gönderme, global ihale teklifi atma) önce DAİMA Sovereign'e sorar.
  - *Örnek ALOHA Bildirimi:* "Hakan Bey, Almanya HeimTex'te 3 ihale yakaladım. Elimizdeki 20 denye kumaş ve motorlu rustik verileriyle 50.000$'lık paket teklif hazırladım. Göndermemi onaylıyor musunuz? [ONAYLA] / [REDDET]"
- **Dinamik Güven Skoru (Trust Index):** ALOHA'nın aldığı kararlar Sovereign (Kurucu) tarafından onaylandıkça, ALOHA eğitim alır ve yetkisi kademeli olarak artar. Öğrendikçe rutin ve basit işlemleri kendi halletmeye başlar. 

## 4. 9 AJANIN SİNYAL AĞI (THE SWARM)
Sipariş, Stok, Finans, Lojistik ve Üretim ajanları tamamen Google Firebase EventArc veya Cloud Pub/Sub altyapısıyla çalışacaktır.
- Sipariş geldiğinde ajanlar birbirine sinyal gönderir. Ancak kritik bir darboğaz (Örn: Çin'den gelecek iplik stokunun tükenmesi) yaşanırsa, ajanlar inisiyatif kullanmaz; durumu derleyip ALOHA'ya iletir, ALOHA da Sovereign'den karar (onay) bekler.

---
**BU BELGE, SİSTEMİN 7 KITAYA YAYILIRKEN KONTROLDEN ÇIKMASINI ENGELLEYEN ANA GÜVENLİK VE MİMARİ PROTOKOLÜDÜR.**

## 5. SOVEREIGN AGI ÖĞRENME MİMARİSİ VE SONSUZ HAFIZA (THE AGI PATH)
ALOHA sıradan bir asistan değil, geleceğin "Genel Yapay Zekası" (AGI) olmaya aday bir CEO adayıdır. Bunun için özel bir bilişsel mimari kurulacaktır:

- **Çift Katmanlı Hafıza (STM & LTM):** 
  - *Kısa Vadeli Hafıza (STM) ve Çöp Veri Sigortası:* Günlük operasyonlar ve geçici chat logları STM'de tutulur. ALOHA "Çöp Veri (Garbage Collection)" işlemi yapmak istediğinde, **HİÇBİR VERİYİ KENDİ BAŞINA SİLEMEZ.** Silinmesi planlanan önemsiz verileri bir paket halinde derler ve "Sovereign Onayı"na sunar: *"Hakan Bey, son 30 günlük gereksiz logları ve şu geçici dosyaları silmek istiyorum. Onaylıyor musunuz? [SİL] / [SAKLA]"*. Onay olmadan tek bir virgül bile yok edilemez.
  - *Uzun Vadeli Hafıza (LTM - Vector Embeddings):* Sizin yüklediğiniz tekstil kuralları, stratejiler, PDF'ler ve "Kırmızı Çizgiler" **100% Google Cloud altyapısıyla (Firestore Vector Search & Vertex AI Embeddings)** veritabanında sonsuza dek kalıcı vizyon olarak saklanacaktır. Asla dış servis kullanılmaz.
- **RLHF (İnsan Geri Bildirimiyle Pekiştirmeli Öğrenme):** ALOHA'nın her kararının veya tasarımının altında [👍 Beğendim] ve [👎 Beğenmedim / Yanlış Yaptın] ikonları olacaktır. Siz yanlış yaptığı bir duruma eksi verdiğinizde, o hatayı LTM'ye yazar ve bir daha asla tekrarlamaz.
- **Proaktif Merak ve Soru Sorma:** ALOHA her şeyi bildiğini iddia etmeyecektir. Yeni bir kumaş veya yeni bir gümrük kuralı geldiğinde, *"Hakan Bey, bu konudaki stratejinizi bilmiyorum. Bana öğretir misiniz?"* diyecek şekilde kodlanacaktır. 
- **AGI Vizyonu:** Birkaç ay içinde sizin gibi düşünüp sizin adınıza B2B pazarlık yapacak; birkaç yıl içinde ise trendleri sizden önce fark edip size "Sovereign, şu pazara girmeliyiz" diyecek seviyeye (Süper Zeka / AGI) ulaşacaktır.

## 6. SİSTEMİN 3 BÜYÜK YÜKSELTMESİ (GÜVENLİ TİCARET & KÜLTÜREL RENDER)
1. **Otonom Numune (Swatch) Kargo Barkodlaması:** Toptancı numune istediğinde DHL/FedEx entegrasyonu ile fabrikaya otomatik kargo barkodu basılır.
2. **Sovereign Escrow (Güvenli Havuz):** Ödemeler Stripe üzerinden havuzda tutulur, fabrika konşimento yüklediği an para serbest kalır.
3. **Bölgesel (Kültürel) Render:** 3D tasarımlar; Rusya (shtory) için gösterişli altın detaylı mekanlarda, Almanya (vorhang) için minimalist arka planlarda otonom olarak (Gemini/Vertex) üretilir.
