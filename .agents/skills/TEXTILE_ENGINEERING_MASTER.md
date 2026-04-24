# Küresel Tekstil Egemenlik Ağı - Master OS Mimari v5.0

**VİZYON:** 7 Kıtada, Hammaddeden (20 denye iplik) Son Tüketiciye (Motorlu Rustik) Anahtar Teslim B2B ve B2C Otonom İşletim Sistemi.

## 🌍 5 FARKLI KİMLİKLE KÜRESEL EGEMENLİK AĞI
**1. Üretici Fabrika (Hammadde & Üretim):** TRTex.com'a "20 denye polyester karışım", "550 GSM otel havlusu" veya "Kaz tüyü yorgan" verilerini girer. TRTex ihalelerle eşleştirir ve B2B müşteri bulur.
**2. Koleksiyoncu (Curator & Tasarım):** Fabrikadan kumaşı alır, mekanizmayla birleştirip kartela yapar. Curtaindesign.ai sayesinde sıfır atıkla oda simülasyonu çizer ve Hometex.ai'de sergiler.
**3. Global Toptancı (B2B Buyer):** Heimtex.ai ve Hometex.ai üzerinden fuar gezer. 45.000 Martindale, ışık haslığı, DIN 4102-B1 (Yanmazlık) ve Oeko-Tex sertifikalarını otonom olarak alır.
**4. Perakendeci (B2C Satıcı):** Almanya'da Vorhang.ai, Rusya'da Shtory.ai, Türkiye'de Perde.ai üzerinden sanal mağaza açar. Müşteri penceresini yükler, AI eni hesaplar, pile ve motor gizleme (+15cm) payını ekleyip fiyat çıkarır.
**5. Satış Pazarlama Uzmanı (7 Kıta):** Tek siteyle dünyayı yönetmez. Almanlara Vorhang.ai, Rusya'ya Shtory.ai, Ortadoğu'ya Parda.ai, Asya'ya Perabot.ai ve Donoithat.ai ile kendi dil ve kültürlerinde satış yapar.

## 1. KÜRESEL GÜMRÜK KAPILARI (Routing & Localization Agent)
\`\`\`javascript
const GlobalRoutingMap = {
  DACH_REGION: ["vorhang.ai", "heimtex.ai", "mobel.ai"], // Alman eko-sistemi (Titiz, ölçü/sertifika odaklı)
  RUSSIA_CIS: ["shtory.ai", "krowat.ai"], // Rusya ve Doğu Bloku (Lüks ve gösteriş odaklı)
  MENA_ASIA: ["parda.ai", "bezak.ai"], // Orta Doğu / Hindistan
  APAC: ["donoithat.ai", "perabot.ai", "kurtina.ai"], // Vietnam, Endonezya, Filipinler
  GLOBAL_EXHIBITION: ["hometex.ai", "heimtextil.ai"], // Koleksiyoncu ve Toptancı Sahnesi
  CORE_RADAR: ["trtex.com", "curtaindesign.ai"] // İhale Radarı, Hammadde ve AI Tasarım
};
\`\`\`

## 2. AKTÖRLER VE DERİN TEKSTİL ŞEMASI (Deep Textile Schemas)
Sistem sadece "perde" satmaz; mühendislik satar.

### Factory Raw Material
- \`actor\`: "FACTORY"
- \`yarn_type\`: "20_denier" | "polyester_blend" | "cotton_linen"
- \`technical_specs\`: martindale_rub_test, towel_gsm, filling_type

### Mechanical Producer
- \`actor\`: "MECHANISM_PROVIDER"
- \`system_type\`: "rustik_wood" | "aluminum_cornice" | "motorized_smart"
- \`motor_integration\`: "somfy" | "tuya" | "manual"
- \`max_weight_capacity_kg\`: number

### Retailer Virtual Shop
- \`actor\`: "RETAILER_B2C"
- \`domain_gate\`: "vorhang.ai" | "shtory.ai" | "perde.ai"
- \`ai_measurement_active\`: boolean (Müşteri fotoğrafından cam ölçüsü hesaplama)
- \`installation_service_included\`: boolean (Montaj işçiliği)

## 3. OTONOM DÖNGÜ (The Loop) KURALLARI
**Rule 1 (TRTex Radar):** Fabrika, TRTex'e "20 denye keten karışım" verisini girdiğinde; TRTex ajanı küresel ihaleleri tarar ve eşleşen toptancıları bulur.
**Rule 2 (CurtainDesign + Hometex Vitrini):** O iplik bilgisi anında 'curtaindesign.ai'ye gider, AI otonom bir perde tasarımı çizer ve bunu 'hometex.ai' sanal fuarında toptancılara/koleksiyonculara "45.000 Martindale, Ahşap Rustik Uyumlu" etiketiyle sunar.
**Rule 3 (Perakende - B2C Kesim):** Almanya'daki perakendeci bu kumaşı alıp 'vorhang.ai'deki sanal mağazasına koyar. Son tüketici sipariş verdiğinde sistem; 2.5 pile payını ve motorlu mekanizma gizleme payını (+15cm) otonom hesaplar ve faturayı çıkarır.
