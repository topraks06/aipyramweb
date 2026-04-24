# 🧠 ALOHA SKILL: MODÜL 6 - DİJİTAL TASARIM VE "ZERO-COST" GİYDİRME MİMARİSİ

> **AİT OLDUĞU AJAN:** ALOHA Master Node, Design Agent (Perde.ai / Tüm Bölgesel Kapılar)
> **HEDEF:** Tasarım motorunun "Sıfır Sunucu Maliyeti (Zero API Cost)" ile çalışmasını sağlamak. Halüsinasyon gören AI modelleri yerine deterministik matematiği kullanmak.

## 1. "ZERO-COST" (SIFIR MALİYET) MİMARİSİ

Hakan Bey'in emriyle sistemin en büyük gider kalemi olan "Görsel Üretim (Rendering)" işlemi sunucu tarafından **MÜŞTERİNİN TARAYICISINA (Client-Side)** yıkılmıştır.

*   **API Maliyeti YOKTUR:** Perde.ai tasarım motoru (`Img2ImgVisualizer`), Midjourney veya Stable Diffusion gibi her tıkta para yakan API'leri KULLANMAZ. 
*   **Tek Motor, Tüm Dünyaya Dağıtım:** Motor bir kez Perde.ai'de yazılmıştır. Vorhang (Almanya) veya Shtori (Rusya) müşterisi tasarım yapmak istediğinde, motor o sitelere "Klonlanır (Component Mounting)". 1 milyon Rus aynı anda perde tasarlasa bile AIPyram'ın cebinden $0.00 çıkar. Tüm işlemler kullanıcının ekran kartı (GPU) kullanılarak WebGL ve Canvas API ile yapılır.

## 2. KUMAŞ GİYDİRME FİZİĞİ (ALPHA COMPOSITING)

Müşterinin yüklediği düz kumaş fotoğrafını, 3D odadaki boş perde şablonuna giydirmek için ALOHA şu 5 katmanlı (Layer) mantığı uygular:

1.  **Base Layer (Oda Arka Planı):** Odanın orijinal fotoğrafı.
2.  **Mask Layer (Kesim Şablonu):** Sadece perdenin olacağı piksellerin maskesi (source-in metodu).
3.  **Pattern Layer (Kumaş Deseni):** Kullanıcının yüklediği kumaş. ALOHA bu kumaşın "Rapor Boyunu (Desen Büyüklüğünü)" UV Mapping ile pencereye oranlar. (Örn: Çiçek deseni 64cm ise, camda mikroskobik veya devasa görünmesini engeller).
4.  **Shadow/Fold Layer (Pile Gölgeleri):** Multiply (Çarpma) blend moduyla kumaşın üzerine 3D dalga (pile) efekti verilir. Kumaş kalınlaştıkça (GSM arttıkça) ALOHA gölgeleri %30 daha koyu yapar (Sert Düşüm/Drape Efekti).
5.  **Light/Highlight Layer (Işık Yansımaları):** Kumaş eğer "Saten" veya "Organze" ise ALOHA parlama (Overlay/Screen) katsayısını artırır. Mat ketense bu katmanı kapatır.

## 3. IŞIK GEÇİRGENLİĞİ VE MATERYAL TESPİTİ

Müşteri tasarım ekranında kumaşın tipini seçtiğinde ALOHA otonom saydamlık atar:

*   **Tül (Sheer/Voile):** Opaklık (Opacity) `%40 - %60` arası ayarlanır. Arkadaki manzara görünür. Güneş ışığı (Glow) içeri vurur.
*   **Fon Perde (Dimout):** Opaklık `%85 - %95` arasıdır. Arka plan görünmez ama ışık silüeti kumaşa vurur.
*   **Karartma (Blackout):** Opaklık `%100` ayarlanır. Güneş sıfırlanır, gölgeler maksimum sertliğe ulaşır. 

*ALOHA Uyarısı:* "LLM tabanlı üretken yapay zekalar (Generative AI) perdeyi baştan çizerse deseni uydurur (Halüsinasyon). Bizim 'Deterministik Engine' yaklaşımımızda ise müşterinin yüklediği piksel %100 oranında piksel kaybı olmadan giydirilir. Sıfır halüsinasyon, sıfır API faturası."
