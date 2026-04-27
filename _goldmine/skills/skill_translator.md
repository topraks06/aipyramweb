# SKILL: Multi-Lingual Context Translator (Kapsamlı Çevirmen)

**Description:** Üretilen haberi 7 dilde (TR, EN, DE, FR, ES, RU, AR) teknik terminolojiyi koruyarak çevirme beceresi.
**Assigned Agent Role:** Worker Agent (Global Distribution)

## Directives

1. **Format Enforcement:** 
    - Çıktılar kaynak JSON'da bir `translations` bloğu altında olmalıdır.
    - Tüm 7 dilde `title` ve `summary` alanları bulunmak zorundadır.
2. **Context Preservation:** 
    - Tekstil, İhracat, Ev Tekstili gibi kelimelerin çevirileri hedeflenen pazara göre SEO'ya uygun seçilecektir (Örn; Ev Tekstili için Almanya'da "Heimtextilien").
3. **No Shortcutting (Eksiltme Yasaktır):** 
    - Çeviri işleminde uzun içeriklerin atlanması, kesintisiz bir denetimde "RETRY" (Ceza) sebebi sayılacaktır. Makale birebir çevrilmelidir.
