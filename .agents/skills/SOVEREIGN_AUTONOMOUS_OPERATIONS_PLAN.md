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

## 2. GÖRSEL RENDER MOTORU (100% GOOGLE-NATIVE INFRASTRUCTURE)
Tasarım ve render işlemleri için dışarıdan hiçbir 3. parti (Midjourney, Unreal vb.) kullanılmayacaktır.
- **Vertex AI & Imagen 4.0:** Trend skoru yükselen ürünlerin 16:9 sinematik vitrin renderları ve kartela tasarımları doğrudan Google'ın Vertex AI Image ve Gemini 3.1 Image Preview modelleriyle oluşturulacaktır.
- **Ortak Motor Mimarisi:** Perde.ai'nin kalbindeki tasarım motoru, TRTex'e de entegre edilecektir. Böylece bir iplik üreticisi sisteme sadece "ip resmi" yüklediğinde, sistem o ipten dokunmuş bitmiş bir perdeyi anında renderlayıp üreticiye gösterecektir.

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
