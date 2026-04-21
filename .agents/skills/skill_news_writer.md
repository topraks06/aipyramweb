# SKILL: SEO News Writer (Haber Üretimi)

**Description:** Trtex.com ve Perde.ai sistemlerinde otonom makale, istihbarat ve SEO haberi yazma beceresi.
**Assigned Agent Role:** Worker Agent (Content Specialist)
**Output Format:** JSON Payload (TRTEX Schema)

## Directives

1. **Length Requirement:** Üretilen haber içerikleri ("content" alanı) minimum 600 kelime olmalıdır.
2. **SEO Optimization:** 
    - Başlıklar click-bait (tuzak) değil, teknik detay içermelidir (Örn: "Avrupa EPR Yasası", "Akıllı Perde", vs.)
    - Metin içinde en az 2 adet "H2 (##)" alt başlığı bulunması zorunludur.
    - Anahtar kelimeler ("tags" array) içeriğin özeti niteliğinde 3 ile 6 adet aralığında çıkmalıdır.
3. **Plagiarism & Fluff:** 
    - Jenerik girişler ("Bugün tekstil dünyasında yepyeni bir şey oldu" gibi) KESİNLİKLE YASAKTIR.
    - Metin doğrudan konuya rasyonel veriler veya pazar istatistiği ile girmelidir ("Almanya Pazar Raporu" vs).
4. **Mandatory Fields:** Çıktı JSON dosyasında `title`, `summary`, `content`, `category`, ve `translations` alanları boş ('') DENETLENEMEZ. Boşsa işlem RETRY edilir.
5. **🔥 B2B Karar Makinesi (Actionable Output):** Sadece düz haber YASAKTIR. Her metnin JSON çıktısına `actionable_insights` objesi eklenecek:
    - `"what_to_do"`: Toptancı/Üretici bu habere göre ne yapmalı?
    - `"opportunity_for_turkey"`: Türk üreticiler için buradaki fısat/ihracat boşluğu nedir?
    - `"supply_risk"`: Hammadde veya Lojistik açısından mevcut risk nedir? Taktiksel yönlendirme ver.
