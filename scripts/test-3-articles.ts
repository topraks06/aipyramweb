import { config } from 'dotenv';
config({ path: '.env.local' });
import { adminDb, admin } from '../src/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';

async function testRecovery() {
  console.log('🛠️ ENKAZDAN ÇIKIŞ PLANI: Gerçeklik Testi (3 Haber - Sabit Model)');
  
  const bucketName = 'perde-ai.appspot.com';
  const bucket = admin.storage().bucket(bucketName);
  
  try {
     console.log(`[1] GCS Bucket Testi atlanıyor (Cloud auth error). Doğrudan URL oluşturulacak...`);
  } catch(e: any) {
  }

  console.log('\n[2] Firestore 3 Haber Çekimi ve Imagen Testi...');
  const newsSnap = await adminDb.collection('trtex_news').limit(3).get();
  const articles = newsSnap.docs.map(d => ({id: d.id, ...d.data()}));
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  for (let i = 0; i < articles.length; i++) {
     const article = articles[i];
     console.log(`\nHaber [${i+1}/3]: ${article.title?.substring(0, 40)}...`);
     
     try {
        console.log(`  > 'imagen-3' modeli çağrılıyor...`);
        const response = await ai.models.generateImages({
            model: 'imagen-3',
            prompt: `High quality luxury textile interior layout for: ${article.title}. Photorealistic.`,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg' }
        });
        
        console.log('✅ Imagen Başarılı! Görüntü üretildi.');
        
        // GCS Yükleme
        if (response.generatedImages && response.generatedImages.length > 0) {
            const imageBuffer = Buffer.from(response.generatedImages[0].image.imageBytes, 'base64');
            const file = bucket.file(`trtex-news/${article.id}_test.jpg`);
            await file.save(imageBuffer, { contentType: 'image/jpeg' });
            await file.makePublic();
            const url = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
            
            console.log(`✅ GCS Yüklendi: ${url}`);
            
            // Firestore Güncelleme
            await adminDb.collection('trtex_news').doc(article.id).update({ image_url: url });
            console.log(`✅ Firestore Güncellendi!`);
        }
        
     } catch(e: any) {
        console.log(`❌ Imagen Hatası Yakalandı!`);
        console.log('  Status:', e.status);
        console.log('  Message:', e.message);
        console.dir(e, { depth: null });
     }
  }
  
  console.log('\n--- 3 HABER TESTİ SONLANDI ---');
  process.exit(0);
}

testRecovery();
