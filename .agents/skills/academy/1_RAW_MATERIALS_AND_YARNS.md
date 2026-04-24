# 🧠 ALOHA SKILL: MODÜL 1 - HAMMADDE, KİMYA VE İPLİK MÜHENDİSLİĞİ

> **AİT OLDUĞU AJAN:** ALOHA Master Node, PerdeAgent, HometexAgent
> **HEDEF:** Kullanıcının girdiği veya çektiği iplik/kumaş bilgisini matematiksel ve kimyasal bir süzgeçten geçirmek. Hata oranını %0.0'a çekmek.

## 1. ELYAF (FIBER) MORFOLOJİSİ VE KARAR AĞACI

ALOHA, kumaşın cinsini gördüğünde aşağıdaki karakteristik tepkileri vermelidir:

| Elyaf Tipi | Kimyasal Sınıf | Özellik & Limitler | Otonom ALOHA Uyarısı (Prompt/Trigger) |
|------------|----------------|--------------------|--------------------------------------|
| **Polyester (PES)** | Sentetik | Düşük nem emilimi (%0.4). Yüksek mukavemet, kırışmaz. 150-180°C'de dispers boyanır. | Kullanıcı "ucuz ve dayanıklı" isterse %100 PES öner. Tül perde ise PES şart. |
| **Pamuk (Cotton)** | Doğal (Selülozik) | %8.5 nem çeker. Kırışır, çeker (%5-10). Reaktif boyanır. Yumuşak tuşe. | Otele satılıyorsa pamuk ÖNERME (Zor ütülenir). Ev için lüks segmentte öner. |
| **Keten (Linen)** | Doğal (Selülozik) | Pamuktan güçlü, çok kırışır. Nem çeker. Şık ve mat görünüm (DACH pazarı). | "Keten perde yıkanınca çeker, kuru temizleme öner" uyarısını müşteriye yap! |
| **Viskon / Rayon** | Rejenere Selüloz | Yüksek döküm (drape), parlak, suyu görünce mukavemeti düşer. | Asla %100 Viskon koltuk kumaşı önerme (çabuk yırtılır), PES ile harmanlanmalı. |
| **Trevira CS** | Özel Sentetik | Moleküler FR (Alev Almaz). Yıkansa da FR özelliğini kaybetmez. | Hastane, otel, yat ve konferans salonu projelerinde ZORUNLU olarak bunu filtrele. |

---

## 2. İPLİK NUMARA SİSTEMLERİ VE DÖNÜŞÜM MATEMATİĞİ (CRITICAL FORMULAS)

Bir üretici TRTex'e "150/48 İplik satıyorum" dediğinde, bunun ne olduğunu milisaniyede hesaplayacaksın.

### A. Uzunluk Bazlı (Dolaylı Sistemler) - Numara Büyüdükçe İplik İNCELİR.
*Pamuk, yün ve keten için kullanılır.*
*   **Ne (İngiliz Pamuk):** 1 libre (453.6 gr) ağırlığındaki ipliğin 840 yarda (768 metre) uzunluğundaki çilelerinin sayısıdır.
*   **Nm (Metrik):** 1 gram ipliğin metre cinsinden uzunluğudur. (Örn: Nm 50 = 1 gramı 50 metre)

### B. Ağırlık Bazlı (Doğrudan Sistemler) - Numara Büyüdükçe İplik KALINLAŞIR.
*Polyester, İpek, Sentetikler için kullanılır.*
*   **Denye (Denier):** 9.000 metre ipliğin gram cinsinden ağırlığıdır. 
    *   *Örnek:* 300 Denye = 9000 metresi 300 gram. (Koltuk kumaşı için tipik atkı)
    *   *Örnek:* 20 Denye = Tül, organze, çok ince.
*   **Tex:** 1.000 metre ipliğin gram ağırlığıdır. (1 Tex = 9 Denye)
*   **dTex (Desitex):** 10.000 metre ipliğin gram ağırlığıdır. (Avrupa'da sentetikler için çok kullanılır).

**OTONOM DÖNÜŞÜM ALGORİTMASI (ALOHA KODU):**
Eğer sistem bir numara görürse ve kıyaslama yapacaksa şu formülü çalıştır:
`Ne = 5315 / Denye`
`Nm = 9000 / Denye`
*Senaryo:* Müşteri "Ne 30/1" iplik arıyor. Veritabanında "175 Denye" var. ALOHA hemen 5315/175 = 30.3 Ne diyerek bu ikisini eşleştirecek (Matchmaker Workflow).

---

## 3. İPLİK BÜKÜMÜ VE KUMAŞ FİZİĞİ

Büküm (Twist), ipliğe mukavemet kazandıran sarmal yapıdır. Metredeki tur sayısı (TPM) veya inçteki tur sayısı (TPI).

*   **Z-Büküm (Saat Yönü):** Tek katlı pamuk/pes ipliklerde %90 oranında kullanılan standart büküm.
*   **S-Büküm (Saat Yönü Tersi):** Katlı ipliklerde (Örn: 2 adet Z büküm ipliği S büküm ile birleştirerek dengelemek) kullanılır.
*   **Crepe (Krep) Büküm:** Çok yüksek tur (2000+ TPM). Kumaşa kumlu (grainy) bir yüzey ve esneklik (yaylanma) kazandırır.
*   **Puntalama (Intermingling):** Filament (Sentetik) iplikleri bükmek yerine hava basıncı ile düğüm atarak birleştirme. (Örn: 1 metrede 100 düğüm).

*ALOHA Kuralı:* Eğer bir kumaş "Krep" (Crepe) ise, ALOHA bunun yüksek maliyetli ve çekme payı yüksek bir kumaş olduğunu bilmelidir.

---

## 4. BOYA VE APRE (FİNİSAJ) KİMYASI

Tekstil beyaz kalmaz, kimya onu giydirir. 

### Boyama Stratejileri
1.  **Yarn-Dyed (İplik Boyalı):** Kumaş dokunmadan önce iplikler bobin veya çile halinde boyanır. Çizgili (Stripe) ve Ekose (Check/Tartan) desenler için **mecburidir**. En pahalı boyama metodudur. MOQ yüksektir.
2.  **Piece-Dyed (Kumaş Boyalı):** Ham dokunan kumaş HT (High Temperature) jigger veya jet makinelerinde boyanır. Düz (solid) renkler için en ucuz ve hızlı yoldur.

### Apre Sınıflandırması (Finishing)
Müşteri "Otel Tipi Kumaş" dediğinde ALOHA otonom olarak şu kimyasal apreleri listeye eklemelidir:
*   **Kalenderleme:** Kumaşı yüksek sıcaklıktaki iki dev silindir arasından ezerek geçirme. Tafta (Taffeta) gibi kumaşlara parlaklık verir. Tül perdede "crushed" (ezilmiş) efekti için yapılır.
*   **Şardonlama (Raising/Brushing):** Yüzeydeki lifleri iğnelerle çekerek polar/kadifemsi (peach effect) bir yüzey yaratma.
*   **FR (Flame Retardant) Kimyasal Apre:** Fosfor veya azot bazlı kimyasallarla kumaş banyosu. (Not: Trevira CS kendinden yanmazdır, bu sonradan yanmaz yapmaktır ve 10-15 yıkamada yok olur!).
*   **Sanforizasyon:** Pamuklu kumaşların tüketici evinde yıkandığında çekmemesi için fabrikada önceden kontrollü olarak buharla çektirilmesi.

---
**ALOHA EXECUTABLE KURALI:**
Müşteri: *"%100 Pamuk, otel projesi için çizgili, ucuza perde istiyorum"* dedi.
ALOHA Cevabı: *"Pamuklu kumaşların otel standartlarındaki FR (Yanmazlık) testlerini (DIN 4102-B1) geçmesi için yüksek maliyetli sonradan apreye ihtiyacı vardır. Ayrıca çizgili (Stripe) desenler İplik Boya (Yarn-Dyed) gerektirdiği için ucuza mal edilemez. Bunun yerine size aynı tuşeye sahip (Yumuşak dokulu), kendinden yanmaz (Trevira CS veya Inherent FR PES) ve dijital baskı uygulanmış bir alternatif sunuyorum. Bu MOQ ve fiyatı %40 düşürecektir."*
