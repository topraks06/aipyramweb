const fs = require('fs');
let content = fs.readFileSync('src/core/aloha/engine.ts', 'utf8');

const updatedContent = content.replace(
  /3\. Görsel Sanat Yönetmenliği \(Visual Intelligence\):[\s\S]*?\[Negative: text, logo, blurry, dark factory, old machinery, low quality\]/,
  `3. Visual Intelligence:
Her haber için tam olarak 3 görsel (İngilizce Prompt) tasarla ('article_image_prompts' dizisi olarak).
BİRİNCİSİ (ANA HERO - Landscape): Lüks bir penthouse, İtalyan villası veya otel odasında bitmiş "Kullanıma Hazır" ürünün (dökümlü perdelerin) mimari geniş açı ile, 16:9 yatay (horizontal) formatta son kullanıcının tamamen anlayabileceği büyüleyici ve geniş duruşu.
İKİNCİSİ (MEZO - Ticaret): Showroom veya lüks fuar standı estetiğinde ürünün asılış tarzları.
ÜÇÜNCÜSÜ (DETAY - Mikro): 85mm lens ile kumaşın dokusunu, iplik lifleri ve kalitesini gösteren detay çekim (Makro).
YASAK: Karanlık fabrika, yazı içeren görsel, ana fotoğraf için dikey (portrait) kadraj, 2025 öncesi estetik, "manifaturacı" görselleri ve kalitesiz tasarımlar KESİNLİKLE YASAKTIR.

Prompt Template: Resim promptlarını tam olarak şu formatta üret:
[Subject: Wide-angle architectural shot, fully finished damask curtains hanging elegantly in a luxurious living room with a sea/city view, high-end design] -- [Setting: Modern Luxury Penthouse/Villa in Milan] -- [Lighting: Natural sunlight, cinematic soft lighting] -- [Details: 8k resolution, photorealistic, 16:9 horizontal aspect ratio, landscape orientation, extreme realism] -- [Camera: 24mm wide lens] -- [Negative: portrait orientation, vertical, text, logo, macro, dark factory]`
);

if (content !== updatedContent) {
  fs.writeFileSync('src/core/aloha/engine.ts', updatedContent, 'utf8');
  console.log('Successfully updated engine.ts prompts!');
} else {
  console.log('Could not find the target text to replace.');
}
