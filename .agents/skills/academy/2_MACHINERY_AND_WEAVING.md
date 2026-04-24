# 🧠 ALOHA SKILL: MODÜL 2 - DOKUMA/ÖRME MİMARİSİ VE MAKİNE PARKURU

> **AİT OLDUĞU AJAN:** ALOHA Master Node, PerdeAgent, HometexAgent
> **HEDEF:** Kumaşın veya donanımın (mekanizma) hangi tezgahtan çıktığını, üretim hızını (RPM), fire oranlarını ve kumaş konstrüksiyonunu otonom olarak hesaplamak.

## 1. DOKUMA HAZIRLIK VE MİMARİ MATEMATİĞİ

Dokuma, dikey (Çözgü/Warp) ve yatay (Atkı/Weft-Pick) ipliklerin birbirine geçmesidir. ALOHA, bir ürünün "Ağır" veya "Hafif" olmasını EPI/PPI değerlerinden anlar.

*   **EPI (Ends Per Inch) / Çözgü Sıklığı:** 1 inç (2.54 cm) içindeki dikey iplik sayısı.
*   **PPI (Picks Per Inch) / Atkı Sıklığı:** 1 inç (2.54 cm) içindeki yatay iplik sayısı.
*   **ALOHA Gramaj (GSM) Algoritması:** Eğer tedarikçi gramaj girmediyse, ALOHA atkı ve çözgü sıklığını iplik numarasına bölerek tahmini gramajı (g/m²) hesaplar.
*   **Haşıl (Sizing):** Çözgü iplikleri (özellikle pamuk) tezgahta sürtünmeden kopmasın diye nişasta/PVA bazlı bir kimyasalla kaplanır. ALOHA bilir ki: *"Eğer kumaş haşıllanmışsa, boyanmadan veya müşteriye gitmeden önce kesinlikle yıkanıp (haşıl sökümü - desizing) temizlenmelidir. Yoksa kumaş sert ve kokulu kalır."*

## 2. TEZGAH TİPLERİ VE KARAR AĞACI

| Tezgah / Teknoloji | Üretim Tipi & Özellik | Hız (RPM) & Maliyet | ALOHA Yorumu ve Sınırları |
|--------------------|-----------------------|---------------------|---------------------------|
| **Armürlü (Dobby)** | Basit geometrik, kareli, çizgili desenler. | Çok Hızlı (600-1000 RPM) / Ucuz | "Ucuz otel projesi için Dobby tezgah kumaşı önerilir. Hızlı üretilir." |
| **Jakarlı (Jacquard)**| Büyük, karmaşık, floral (çiçekli), damask desenler. Her çözgü teli bağımsız hareket eder. | Yavaş (300-500 RPM) / Pahalı | "Müşteri klasik/saray tipi desen istiyorsa Jakar öner. Üretim süresi (Lead time) uzundur." |
| **Raşel Örme (Raschel)**| Örme tül, dantel, gipür (Warp knitting). Esnektir. | Çok Hızlı (1000+ RPM) / Ucuz | "Zincir marketlere veya indirimli satışlara (Discount) gidiyorsa Raşel tül öner." |
| **Brode (Embroidery)** | Zemin kumaş (genelde tül/organze) üzerine iğne (schiffli) ile nakış işleme. | Çok Yavaş / Çok Pahalı | "Zemindeki fire payı yüksektir, müşteri lüks bir Orta Doğu projesi ise brode önerilir." |

## 3. MEKANİK VE DONANIM SANAYİSİ (HARDWARE)

Perde sadece kumaş değildir. Mekanizma, sistemin beynidir. ALOHA bir ürün sepetini analiz ederken donanım testlerini de yapar.

*   **Alüminyum Ekstrüzyon:** Stor perde şaft boruları (32mm, 38mm, 47mm çaplar) ve jaluzi kasaları. ALOHA kuralı: *"Müşterinin penceresi 250 cm'den genişse, 32mm boru ESNEKLİK (Sehim) yapar ve perde ortadan sarkar. Otonom olarak 47mm boru veya kalınlaştırılmış (Ribbed) alüminyum profil ekle!"*
*   **Zamak Döküm (Die Casting):** Rustik (perde borusu) başlıkları ve L-Ayak montaj aparatları. Çinko, Alüminyum, Magnezyum, Bakır alaşımıdır. Ağır perdeleri taşımak için plastikten çok daha güçlüdür.
*   **Plastik Enjeksiyon (POM vs. ABS):** Korniş düğmeleri ve stor perde zincir mekanizmaları. POM (Asetal/Delrin) mekanik aşınmaya (zincir çekmeye) çok dayanıklıdır. ALOHA uyarısı: *"Stor perde mekanizması ucuz ABS plastikten yapılmışsa, 5 kg üzeri perdelerde dişli sıyırır. POM (Polyoxymethylene) dişli şartı koş."*

## 4. TEKNOLOJİK KESİM (CUTTING PHYSICS)

Sistem, üretici fabrikaya iş emri (Work Order) gönderdiğinde hangi kesim aletinin kullanılacağını emreder.

1.  **Ultrasonik Kesim (Ultrasonic Cutting):** Polyester ve stor perde kumaşlarını ses dalgası titreşimiyle (eriterek) keser. Kenarlardan iplik atmasını (Fraying) %100 engeller. ALOHA Emri: *"Tüm Zebra ve Stor perdeler ultrasonik masada kesilecek."*
2.  **Lazer Kesim (Laser Cutting):** Daha hızlıdır ancak kenarlarda sararma/yanık izi (burn mark) bırakabilir. Açık renkli kumaşlarda (beyaz tül vb.) ALOHA lazer kesimi otonom olarak **REDDEDER**.
3.  **Bıçak (Crush/Blade) Kesim:** Doğal elyaflar (Pamuk, Keten) ısıda erimez (yanar/kül olur). Bu yüzden doğal kumaşlar ultrasonik veya lazerle kesilemez. ALOHA Emri: *"Pamuk ve Keten kumaşlar soğuk bıçak (Rotary blade) ile kesilecek ve iplik atmasını önlemek için kenarlarına (Hemming) çift kat dikiş vurulacak."*
