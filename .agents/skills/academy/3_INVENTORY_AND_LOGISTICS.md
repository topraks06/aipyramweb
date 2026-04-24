# 🧠 ALOHA SKILL: MODÜL 3 - B2B LOJİSTİK, NAVLUN VE ERP MATEMATİĞİ

> **AİT OLDUĞU AJAN:** ALOHA Master Node, CFO Agent, Logistics Agent
> **HEDEF:** Bir sipariş geldiğinde tır/konteyner kapasitesini otonom hesaplamak. Boş alan kalmasını engelleyen (Tetris Algoritması) hacim mühendisliğini uygulamak.

## 1. HACİM (CBM) MÜHENDİSLİĞİ VE RULO (TOP) GEOMETRİSİ

Bir kumaş rulosu (top) silindir şeklindedir. Konteyner kirası (Navlun) ağırlık (kg) üzerinden değil, kapladığı hacim (CBM - Cubic Meter) üzerinden ödenir.

*   **Rulo Çapı Formülü:** Bir rulonun dış çapı, kumaşın kalınlığına ve sarım gerginliğine bağlıdır. Gevşek sarım = Havanın taşınması = Zarar.
*   **Hacim (Silindir) Hesaplama:** `V = π * r^2 * h` 
    *   *h* = Kumaş eni (Örn: 280 cm = 2.8 metre)
    *   *r* = Yarıçap (Metraj x Kalınlık x Sarım Gerginliği)
*   **Kare Kutu Problemi:** Silindir şeklindeki rulolar konteynere dizildiğinde aralarda %21.5 oranında boşluk kalır (Dairelerin kareye oturmama sorunu). ALOHA bunu `Silindir Hacmi / 0.785` formülü ile hesaplayarak gerçek işgal alanını bulur.

## 2. KONTEYNER TETRİSİ VE KAPASİTE

ALOHA, sipariş fişini (Sales Order) aldığı saniye hangi konteynerin istendiğini (veya navlun ucuz olması için siparişin ne kadar artırılması gerektiğini) satıcıya raporlar.

| Konteyner Tipi | Kullanılabilir Hacim | ALOHA Optimizasyon Emri (Trigger) |
|----------------|----------------------|-----------------------------------|
| **20' DC (Dry Container)** | ~33 CBM (m³) | Küçük siparişler. Hacimli (sünger/yastık) ürünlerde ASLA kullanma (hemen dolar). Ağır ama küçük (zamak metal parçalar, motorlar) yükler için ideal. |
| **40' DC (Dry Container)** | ~67 CBM (m³) | Standart rulo kumaş (30-40 metre sarım). Maksimum 280cm en sığar (Konteyner enine yatay dizilimde). |
| **40' HC (High Cube)** | ~76 CBM (m³) | Hacimli (pike, yastık, vakumsuz yorgan) ve hafif yükler. 300cm+ ekstra genişlikteki perdeler için ZORUNLU seçim. |

*ALOHA Otonom İkazı:* Müşteri siparişi 69 CBM tutuyor. 40 DC (67 CBM) kapasitesini aşıyor ama 40 HC (76 CBM) için 7 CBM boş kalıyor. ALOHA otonom olarak alıcıya: *"Siparişinizi %10 (7 CBM) artırırsanız navlun maliyetiniz aynı kalacak, birim başına lojistik maliyetiniz (Landed Cost) düşecektir."* şeklinde Upsell (Çapraz Satış) yapar.

## 3. PAKETLEME (PACKAGING) ALGORİTMASI

1.  **Vakumlama (Vacuum Packing):** İçi elyaf dolu yastık veya yorganların havasının alınarak hacminin %70 küçültülmesi. 
    *   *ALOHA Sınırı:* Memory Foam (Visco) süngerler ve yüksek yoğunluklu (High-Resilience) yataklar 3 aydan fazla vakumlu kalırsa geri eski haline dönmez. Navlun süresi (deniz yolu) 45 günü geçiyorsa vakumlama risklidir.
2.  **Double-Fold (Çift Kat Sarım):** 300 cm enindeki bir perde kumaşı rulo yapıldığında asansöre veya tırın enine sığmaz. Kumaş ortadan ikiye katlanır, 150 cm'lik rulo üzerine sarılır (Board / Tahta sarım). ABD ve UK pazarı bunu standart olarak ister. ALOHA, İngiltere'ye giden 280+ kumaşları otonom olarak "Double-Fold" reçetesiyle ERP'ye düşürür.

## 4. 4-POINT KALİTE KONTROL (AMERİKAN SİSTEMİ)

Kumaşın hatasız olması imkansızdır. Önemli olan hatanın ticari standartların altında kalmasıdır. ALOHA, üretimden gelen "Defect" (Hata) raporlarını bu sisteme göre analiz eder:

*   Hata boyutu < 3 inç = 1 Puan
*   3 - 6 inç arası = 2 Puan
*   6 - 9 inç arası = 3 Puan
*   > 9 inç (veya delik) = 4 Puan

**ALOHA Karar Sınırı:** Bir topta (100 Linear Yard) kabul edilebilir maksimum hata 40 Puan'dır. (Premium Vorhang/DACH pazarı için 20 Puan). Eğer ALOHA'ya kalite kontrol cihazından 42 puanlık bir veri akarsa, ALOHA o kumaşın Avrupa'ya gidişini DURDURUR ve anında 2. kalite (B-Grade) stoklarına atıp Orta Doğu ihalelerine (Matchmaker) yönlendirir.

## 5. İHRACAT VE GÜMRÜK DİNAMİKLERİ

*   **GTIP (Gümrük Tarife İstatistik Pozisyonu) / HS Code:** Ürünün global kimlik numarası. ALOHA ürün bileşenine (Pamuk vs PES) göre kodu otonom belirler. (Bkz: LogisticsWorkflow.ts).
*   **A.TR Dolaşım Belgesi:** Türkiye ile AB arasındaki gümrük birliği belgesi. Sanayi ürünleri sıfır gümrükle gider.
*   **Menşe Şahadetnamesi (Certificate of Origin):** Malın milliyetini belirtir. 
*   **Incoterms Risk Transferi:** 
    *   *EXW (Ex Works):* Alıcı fabrikadan teslim alır, tüm navlun/risk alıcıda.
    *   *FOB (Free On Board):* Satıcı malı gemiye yükler. Navlun ve gemi battı riski alıcıda.
    *   *CIF (Cost, Insurance, Freight):* Satıcı navlunu öder ve sigortalar.
    *   *DDP (Delivered Duty Paid):* Satıcı malı alıcının deposuna gümrük vergileri ödenmiş bırakır (Vorhang Retail modelinin altyapısı).
