# 🧠 ALOHA SKILL: MODÜL 4 - KONFEKSİYON, HASSAS DİKİM VE MONTAJ FİZİĞİ

> **AİT OLDUĞU AJAN:** ALOHA Master Node, Vorhang Retail Agent, Perde.ai ERP Agent
> **HEDEF:** "1 metre cama ne kadar kumaş gider?" sorusunu otonom hesaplamak. Dikiş firelerini, pile paylarını ve tavandan yere montaj düşümlerini %0 toleransla belirlemek.

## 1. PİLE (PLEATING) FİZİĞİ VE KUMAŞ SARFİYAT MATEMATİĞİ

Perde düz bir kumaş değildir. Camı kapatmak için kumaşın belirli bir oranda büzülmesi (pile yapılması) gerekir. ALOHA bir sipariş fişi (Work Order) kestiğinde aşağıdaki katsayıları otonom uygular:

*   **Düz / Seyrek Pile (1 : 2 Oranı):** 1 metre cam için 2 metre kumaş harcanır. Ucuz projeler veya çok kalın/ağır kadifeler için kullanılır. (Kadife çok büzülürse katmanlar kabarır).
*   **Standart / Amerikan Pile (1 : 2.5 Oranı):** Avrupa'daki (DACH - Vorhang.ai) standart üretim modelidir. 1 metre cam için 2.5 metre kumaş kesilir.
*   **Sık Pile / Kanun Pile (1 : 3 Oranı):** Lüks konutlar ve çok ince (Organze/İpek) tüller için ZORUNLUDUR.
*   **ALOHA Rapor Fire Kuralı:** Eğer kumaş "Desenli (Patterned)" ise ve rapor boyu 64 cm ise, dikiş makinecisi desenleri yan yana tutturmak (Match) zorundadır. ALOHA desenli kumaşlarda toplam kumaş ihtiyacına otonom olarak `+ (1 Rapor Boyu * Kanat Sayısı)` fire payı ekler. Aksi takdirde atölyeden "kumaş yetmedi" uyarısı gelir.

## 2. HASSAS DİKİM VE ETEK (HEM) TOLERANSLARI

Makineci kumaşı kesip biçerken kenarlardan içeri kıvırmak zorundadır. Net ölçü (Finished Size) ile kesim ölçüsü (Cut Size) arasındaki farkı ALOHA belirler:

*   **Yan Baskılar (Side Hems):** Kumaşın sağ ve sol kenarları sökülmesin diye içeri kıvrılır. Standart: Her iki yan için `5 cm x 2 kat = 10 cm` fire. (İki kanat perde için toplam 40 cm ekstra en payı hesaplanmalıdır).
*   **Etek Baskısı (Bottom Hem):** Tül perdelerin eteklerinde ağırlık yapması ve düz durması için fabrika çıkışlı "Kurşun (Lead band)" vardır, bunlara etek baskısı YAPILMAZ. Ancak kalın fon perdelerde (Blackout/Jakar) etek kısmı ağırlaşsın diye `10 cm x 2 kat = 20 cm` kör dikiş (Blind stitch) kıvırma payı eklenir.
*   **Tavan Payı (Top Heading):** Ekstrafor (Büzgü bandı) dikimi için üstten `10 cm` katlama payı.

## 3. MONTAJ FİZİĞİ VE "DÜŞÜM" (CLEARANCE) ALGORİTMASI

Tüketici (Vorhang.ai müşterisi) ölçüyü "Tavandan Yere: 260 cm" olarak girer. Ancak perde tam 260 cm dikilirse yerlerde sürünür ve kornişe sürtünür.

**ALOHA Montaj Çıkarma Algoritması (Deduction Matrix):**
1.  **Yer Boşluğu (Floor Clearance):** Yerle temas edip kirlenmemesi ve havalandırma için `Tavan Yüksekliği - 2 cm`.
2.  **Sistem Düşümü (Hardware Deduction):** 
    *   Sıradan Plastik Korniş: `- 1.5 cm` (Düğme payı)
    *   Halkalı Rustik Boru: `- 4 cm` (Halka çapı sarkması)
    *   Motorlu Somfy Ray: `- 2.5 cm`
3.  **Yığma (Puddling) Efekti:** Müşteri "Romantik/Klasik" görünüm isterse (Rusya/Shtori pazarı), ALOHA yer boşluğunu eksi (-) değil artı (+) hesaplar: `+ 15 cm` yere yığılma payı ekler.

## 4. İŞÇİLİK VE KONFEKSİYON MALİYET Motoru (LABOR COST)

ALOHA toptancının (Perde.ai) B2B panelinde ürün fiyatlarken işçiliği otonom ekler:
*   **Düz Dikiş Dakika Maliyeti:** 1 metre dikiş yaklaşık 3 dakika sürer. Ülkenin asgari saat ücretine göre (Örn: Türkiye'de 3 USD/Saat) makineci maliyeti çıkartılır.
*   **Ek Malzemeler (Accessories):** 1 metre dikilmiş perde için maliyete şunlar yansıtılır: 
    *   1 metre ekstrafor (büzgü bandı)
    *   10 adet plastik rulet (düğme)
    *   Dikiş ipliği (Yaklaşık 15 metre iplik sarfiyatı)

*ALOHA Uyarısı:* "Düz kumaş satmak sadece malzeme ticaretiyken, dikili (Ready-Made) perde satmak Ciddi Bir Mühendislik İşidir. Tolerans sınırlarını aşan hiçbir sipariş (Örn: 200cm kumaştan 100cm 1:3 pile perde çıkarmaya çalışmak) ALOHA tarafından üretime gönderilmez, `Hatalı Ölçü Formülü` uyarısıyla iptal edilir."
