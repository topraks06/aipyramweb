import { config } from 'dotenv';
config({ path: '.env.local' });
import { adminDb, admin } from '../src/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';

async function testVertexNative() {
  console.log('🎯 VERTEX AI (GOOGLE NATIVE) TESTİ BAŞLIYOR');
  
  // FAIL-FAST Bucket Kontrolü
  let bucketName = 'perde-ai.firebasestorage.app';
  let bucket = admin.storage().bucket(bucketName);
  
  console.log(`[1] GCS Bucket Testi: ${bucketName}...`);
  try {
     let [exists] = await bucket.exists();
     if (!exists) {
         bucketName = 'perde-ai.appspot.com';
         bucket = admin.storage().bucket(bucketName);
         console.log(`İlk bucket bulunamadı, ikinci format deneniyor: ${bucketName}...`);
         [exists] = await bucket.exists();
         if (!exists) {
             throw new Error('Her iki bucket formatı da bulunamadı.');
         }
     }
     console.log(`✅ Bucket erişimi başarılı ve aktif! (${bucketName})`);
  } catch(e: any) {
     console.error(`🚨 KRİTİK HATA: '${bucketName}' isimli bucket Firebase Console'da bulunamadı!`);
     console.error(`Hata Detayı: ${e.message}`);
     console.error('Lütfen Firebase Console -> Storage -> Get Started adımlarını tamamlayın.');
     process.exit(1);
  }

  // VERTEX AI ENTEGRASYONU
  console.log('\n[2] Vertex AI Endpoint (us-central1) ile Imagen 3 Çağrısı...');
  const newsSnap = await adminDb.collection('trtex_news').limit(1).get();
  if (newsSnap.empty) {
      console.log('Haber bulunamadı!');
      process.exit(1);
  }
  const article = { id: newsSnap.docs[0].id, ...newsSnap.docs[0].data() } as any;
  console.log(`\nHaber: ${article.title?.substring(0, 50)}...`);

  try {
      // API Key olmadan tamamen Application Default & Vertex AI Routing (Google Native)
      const ai = new GoogleGenAI({ 
          vertexai: { project: 'perde-ai', location: 'us-central1' } 
      });
      
      const prompt = `High-end luxury B2B textile manufacturing. ${article.title}. Photorealistic commercial photography. Optimized for 2K resolution, strictly maximum 2048px constraints.`;
      
      console.log(`  > 'imagen-3.0-generate-001' Vertex AI modeli çağrılıyor...`);
      const response = await ai.models.generateImages({
          model: 'imagen-3.0-generate-001',
          prompt: prompt,
          config: { 
              numberOfImages: 1, 
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9'
          }
      });
      
      console.log('✅ Vertex Imagen Başarılı! Görüntü üretildi.');
      
      // GCS Yükleme
      if (response.generatedImages && response.generatedImages.length > 0) {
          const imageBuffer = Buffer.from(response.generatedImages[0].image.imageBytes, 'base64');
          const file = bucket.file(`trtex-news/${article.id}_vertex_test.jpg`);
          await file.save(imageBuffer, { contentType: 'image/jpeg' });
          await file.makePublic();
          const url = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
          
          console.log(`✅ GCS Yüklendi: ${url}`);
          
          // Firestore Güncelleme
          await adminDb.collection('trtex_news').doc(article.id).update({ image_url: url });
          console.log(`✅ Firestore Güncellendi!`);
      }
      
  } catch(e: any) {
      console.log(`❌ Vertex Imagen Hatası Yakalandı!`);
      console.log('  Status:', e.status);
      console.log('  Message:', e.message);
      console.error('Bu hata Vertex AI API aktif değilse veya us-central1 bölgesinde Imagen desteği / kota yoksa alınır.');
  }
  
  console.log('\n--- VERTEX TESTİ SONLANDI ---');
  process.exit(0);
}

testVertexNative();
