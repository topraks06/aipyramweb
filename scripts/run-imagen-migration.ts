import { config } from 'dotenv';
config({ path: '.env.local' });
import { adminDb, admin } from '../src/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';

// API Key yerine tamamen Vertex AI (Google Native) Entegrasyonuna geçiş
const ai = new GoogleGenAI({ 
    vertexai: { project: 'perde-ai', location: 'us-central1' } 
});

const BUCKET_NAME = 'perde-ai.firebasestorage.app';

async function getBucket() {
  let bucket = admin.storage().bucket(BUCKET_NAME);
  try {
     let [exists] = await bucket.exists();
     if (!exists) {
         bucket = admin.storage().bucket('perde-ai.appspot.com');
         [exists] = await bucket.exists();
         if (!exists) throw new Error('Firebase Konsolunda Storage başlatılmamış!');
     }
     return bucket;
  } catch(e: any) {
     console.error(`🚨 BUCKET HATASI: bucket erişimi başarısız. GCS kapalı olabilir.`);
     console.error('Detay:', e.message);
     process.exit(1);
  }
}

async function runImagenPhase() {
  console.log('[🚀 GÖÇ BAŞLIYOR] Faz 1: Vertex AI Imagen Görsel Operasyonu (2K Sınırı)');
  const bucket = await getBucket();
  
  const newsRef = adminDb.collection('trtex_news');
  const snapshot = await newsRef.get();
  
  const articles = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`[🔍 BİLGİ] Firestore'da ${articles.length} adet TRTEX haberi bulundu.`);
  
  let successCount = 0;
  let failCount = 0;
  let totalBytes = 0;
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const { id, title, ai_insight, image_url } = article as any;
    
    console.log(`[${i+1}/${articles.length}] 🤖 İşleniyor: ${id}`);
    console.log(`         Başlık: ${title?.substring(0, 50)}...`);
    
    try {
      // 1. Yeni Estetik Protokolü (rule_aesthetic_protocol_hometex.md)
      let geography = "Turkish architecture, featuring modern Turkish professionals";
      const tLower = title?.toLowerCase() || '';
      
      if (tLower.includes('çin') || tLower.includes('asya') || tLower.includes('şanghay')) {
          geography = "Asian architectural elements, featuring Asian professionals";
      } else if (tLower.includes('avrupa') || tLower.includes('ab') || tLower.includes('almanya') || tLower.includes('frankfurt') || tLower.includes('heimtextil')) {
          geography = "European modern showroom, featuring European industry professionals";
      } else if (tLower.includes('abd') || tLower.includes('amerika')) {
          geography = "North American high-end showroom, featuring diverse business professionals";
      } else if (tLower.includes('hindistan') || tLower.includes('güney asya')) {
          geography = "South Asian design elements, featuring Indian professionals";
      }

      const basePrompt = `High-end B2B textile industry photography for news article. Setting: ${geography}. `;
      const fabricPhysics = `Realistic fabric draping physics with gravity. `;
      const lightingAndCamera = `Natural golden hour lighting coming from large showroom windows. Shot with a professional DSLR, f/1.8 aperture bokeh, crisp fabric details in focus while background is aesthetically blurred. `;
      const showroom = `A complete high-end showroom environment with marble or wooden floors and matching furniture. `;
      
      const prompt = `${basePrompt}${fabricPhysics}${lightingAndCamera}${showroom}Context: ${title} ${ai_insight || ''}. Optimized strictly for 2K resolution without extreme 8k rendering.`;
      
      console.log(`         🎨 Vertex AI Tetikleniyor...`);
      
      // 2. Vertex AI Imagen Cagrısı (imagen-3)
      const response = await ai.models.generateImages({
          model: 'imagen-3.0-generate-001',
          prompt: prompt,
          config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9'
          }
      });
      
      if (!response.generatedImages || response.generatedImages.length === 0 || !response.generatedImages[0].image?.imageBytes) {
        throw new Error('Imagen response did not contain an image');
      }
      
      const base64Image = response.generatedImages[0].image.imageBytes;
      const imageBuffer = Buffer.from(base64Image, 'base64');
      
      // 3. GCS Entegrasyonu
      const filename = `trtex-news/${id}_${Date.now()}.jpg`;
      const file = bucket.file(filename);
      
      await file.save(imageBuffer, { 
        contentType: 'image/jpeg',
        metadata: { cacheControl: 'public, max-age=31536000' }
      });
      await file.makePublic();
      
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      
      // 4. Firestore Güncelleme
      await newsRef.doc(id).update({ image_url: publicUrl });
      
      successCount++;
      totalBytes += imageBuffer.length;
      
      console.log(`         ✅ BAŞARILI: ${publicUrl}`);
      
    } catch (e: any) {
      failCount++;
      console.error(`         ❌ HATA [${id}]:`, e.message);
      // Timeout vb. durumlarda sistemi durdurma kuralı
    }
  }
  
  console.log('\n======================================');
  console.log('📊 MEDYA GÖÇ RAPORU (FAZ 1 BİTTİ)');
  console.log('======================================');
  console.log(`Toplam Haber: ${articles.length}`);
  console.log(`✅ Başarılı Üretim: ${successCount}`);
  console.log(`❌ Başarısız/Atlanan: ${failCount}`);
  console.log(`💾 GCS Kullanımı: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log('Sıfır localhost politikası başarıyla uygulandı.');
  
  process.exit(0);
}

runImagenPhase();
