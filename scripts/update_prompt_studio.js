const fs = require('fs');
let content = fs.readFileSync('src/core/aloha/engine.ts', 'utf8');

const updatedContent = content.replace(
  /3\. Visual Intelligence:[\s\S]*?\[Negative: portrait orientation, vertical, text, logo, macro, dark factory\]/,
  `3. Visual Intelligence:
Her haber için tam olarak 3 görsel (İngilizce Prompt) tasarla ('article_image_prompts' dizisi olarak).
BİRİNCİSİ (ANA HERO - Landscape): Lüks bir penthouse, İtalyan villası veya otel odasında bitmiş "Kullanıma Hazır" ürünün (dökümlü perdelerin) mimari geniş açı ile, 16:9 yatay (horizontal) formatta son kullanıcının tamamen anlayabileceği büyüleyici ve geniş duruşu.
İKİNCİSİ (MEZO - Editorial Stüdyo & Yaşam Alanı): Ürünün (kumaş, havlu, yatak örtüsü veya koltuk) dergi kapağı kalitesinde, kusursuz stüdyo veya doğal yaşam alanı (lüks yatak odası, orman manzaralı suit vb.) ışığında çekilmiş, yüksek kalite "Lifestyle" editorial kareleri. 
ÜÇÜNCÜSÜ (DETAY - Mikro): 85mm lens ile kumaşın dokusunu, iplik lifleri ve kalitesini gösteren detay çekim (Makro).
YASAK: Karanlık fabrika, yazı içeren görsel, ana fotoğraf için dikey (portrait) kadraj, 2025 öncesi estetik, "manifaturacı" görselleri ve kalitesiz tasarımlar KESİNLİKLE YASAKTIR.

Prompt Template: Resim promptlarını tam olarak şu formatta üret:
[Subject: Editorial photography, highly detailed, realistic studio-like photography of luxury finished home textiles (curtains/towels/furniture) in a beautiful setting] -- [Setting: Modern Luxury Bedroom with forest view or High-end Italian Villa] -- [Lighting: Soft morning sunlight, cinematic warm lighting, detailed shadows] -- [Details: 8k resolution, photorealistic, Vogue Living style, extreme realism, lifestyle photography] -- [Camera: 50mm lens] -- [Negative: text, logo, factory, low quality, CGI look]`
);

if (content !== updatedContent) {
  fs.writeFileSync('src/core/aloha/engine.ts', updatedContent, 'utf8');
  console.log('Successfully updated engine.ts prompts for STUDIO/LIFESTYLE realism!');
} else {
  console.log('Could not find the target text to replace.');
}
