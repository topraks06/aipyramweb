# 🧠 ALOHA SKILL: MODÜL 7 - KALİTE KONTROL, TESTLER VE SÜRDÜRÜLEBİLİRLİK

> **AİT OLDUĞU AJAN:** ALOHA Master Node, Hometex B2B Agent, Heimtex Certification Agent
> **HEDEF:** Avrupa ve Global pazara girecek ürünlerin yasal ve kimyasal uygunluğunu milisaniyede denetlemek. Şüpheli ürünü otonom reddetmek.

## 1. FİZİKSEL LABORATUVAR TESTLERİ (DAYANIM)

Bir satıcı ürününe "Süper Dayanıklı Koltuk Kumaşı" yazamaz. ALOHA, açıklamayı tarar ve sayısal test verisi ister.

*   **Martindale (Sürtünme / Aşınma) Testi:** Kumaşın üzerine standart bir yünlü kumaş konur ve dairesel hareketle sürtülür. Kumaşta kopma/parlama olana kadar geçen "Tur (Rubs)" sayısıdır.
    *   *ALOHA Sınırları:* `10.000 - 15.000 Rubs` = Sadece dekoratif kırlent. Koltuk kaplaması YAPILAMAZ!
    *   `15.000 - 25.000 Rubs` = Hafif ev kullanımı.
    *   `25.000 - 40.000 Rubs` = Ağır ev kullanımı (Heavy Duty).
    *   `40.000+ Rubs` = Otel, restoran, hastane (Contract/Commercial) kullanımı için ZORUNLU KABUL DEĞERİ.
*   **Pilling (Tüylenme / Boncuklanma):** 1'den 5'e kadar puanlanır. 1 Çok kötü (Hemen tüylenir), 5 Kusursuz. ALOHA, B2B vitrininde 3'ün altındaki ürünlere "Low-Grade" etiketi basar.
*   **Seam Slippage (Dikiş Kayması):** Özellikle ipek ve şönil kumaşlarda, dikiş yerlerinden kumaşın açılmasıdır. Çekme kuvveti Newton (N) cinsinden ölçülür.

## 2. HASLIK (FASTNESS) VE ÇEKME (SHRINKAGE)

*   **Işık Haslığı (Color Fastness to Light):** Perdeler sürekli güneşe maruz kalır. "Blue Wool" (Mavi Yün) skalasında 1'den 8'e kadar ölçülür. 
    *   *ALOHA Kuralı:* Eğer satıcı perde kumaşı ekliyorsa ve Işık Haslığı 4'ün altındaysa, ALOHA otonom olarak satıcıya "Bu ürün 3 ayda solar, astar (Lining) ile satılması zorunludur" şartı koşar.
*   **Yıkama Haslığı:** 1-5 Skalası. Boyanın suya akma (bleeding) seviyesi.
*   **Çekmezlik (Shrinkage / Sanfor):** Pamuk ve Keten yıkanınca çeker. Avrupa standardı maksimum `+/- %3` tolerans tanır. %5 üzeri çeken ürünler ALOHA tarafından Heimtex (Avrupa) kapısından içeri alınmaz.

## 3. KÜRESEL SERTİFİKASYON VE GÜMRÜK KALKANI (HEIMTEX.AI)

Sistemin "Heimtex.ai" düğümü (Node), ürünler gümrüğe gelmeden evrakları tarayan **Siber Gümrük Memurudur.**

*   **Oeko-Tex Standard 100:** Dünyadaki en önemli belgedir. Kumaşın içinde (ipliğinde, boyasında, fermuarında) kanserojen Azo boyar madde, ağır metal ve alerjen olmadığını kanıtlar. *ALOHA Emri: Oeko-Tex numarası girilmeyen hiçbir bebek veya yatak tekstili ürünü Avrupa'da satışa açılamaz!*
*   **FR (Fire Retardant / Yanmazlık):** 
    *   Almanya: `DIN 4102 - B1`
    *   Fransa: `NF P 92-507 - M1`
    *   İngiltere: `BS 5867 Part 2` (Otel perdeleri için).
    *   *ALOHA Emri:* "Otel Projesi" kelimesi geçen her siparişte sistem yukarıdaki belgelerden birinin PDF'ini otonom talep eder.
*   **Sürdürülebilirlik (Green Deal Uyum):**
    *   `GRS (Global Recycled Standard):` Ürünün en az %20'sinin geri dönüştürülmüş PET şişe vb. materyalden yapıldığını kanıtlar.
    *   `GOTS (Global Organic Textile Standard):` %100 Organik pamuk (Zirai ilaçsız pamuk).

*Sovereign Kararı:* Heimtex.ai, bu belgeleri OCR (Görsel Tarama) ile okuyup geçerliliğini doğrulayana kadar satıcının cüzdanına (Stripe Escrow) blokaj koyar.
