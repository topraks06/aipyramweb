import { config } from 'dotenv';
config({ path: '.env.local' });
import { adminDb, admin } from '../src/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';
import { MasterPhotographer } from '../src/core/swarm/master-photographer';

// Vertex AI (Google Native) Entegrasyonuna geçiş
// @ts-ignore: GoogleGenAI vertexai type configuration override to match existing working setup
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
     process.exit(1);
  }
}

async function runImagenPhase() {
  console.log('[🚀 ÖZGÜNLEŞTİRME BAŞLIYOR] Faz 4: Vertex AI Imagen (Kopya Engeli & 15s Kuralı)');
  const bucket = await getBucket();
  
  const newsRef = adminDb.collection('trtex_news');
  const snapshot = await newsRef.get();
  
  const articles = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const { id, title, image_url } = article as any;
    
    // Yalnızca default "showroom" resmi olanları veya özgünleştirilmemişleri yeniden üretebiliriz ama user hepsini özgünleştir dedi.
    console.log(`\n[${i+1}/${articles.length}] 🤖 İşleniyor: ${id}`);
    console.log(`         Başlık: ${title?.substring(0, 50)}...`);

    try {
    
      // Map category to accepted unions
      const cL = ((article as any)?.category || "").toLowerCase();
      let photoCategory: any = "general";
      if (cL.includes("iplik") || cL.includes("yarn")) photoCategory = "yarn";
      else if (cL.includes("makine") || cL.includes("machin")) photoCategory = "machinery";
      else if (cL.includes("perde") || cL.includes("curtain")) photoCategory = "curtains";
      else if (cL.includes("halı") || cL.includes("carpet")) photoCategory = "carpets";

      const subject = `A hyper-realistic premium editorial photograph purely representing the core topic: "${title}".`;

      const { prompt, negativePrompt } = MasterPhotographer.buildMasterPhotographerPrompt({ 
        category: photoCategory, 
        context: subject 
      });
      
      // Promptu özgün bir Seed/ID ile damgalamak kopyayı engeller
      const finalPrompt = `${prompt} [Unique Record Key: ${id}]`;
      
      console.log(`         🎨 Vertex AI Tetikleniyor...`);
      
      const response = await ai.models.generateImages({
          model: 'imagen-3.0-generate-001',
          prompt: finalPrompt,
          config: {
              negativePrompt: negativePrompt,
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
      
      // Cache-Busting (Aynı URL cachelenmesin diye Timestamp eklendi)
      const filename = `trtex-news/${id}_uniq_${Date.now()}.jpg`;
      const file = bucket.file(filename);
      
      await file.save(imageBuffer, { 
        contentType: 'image/jpeg',
        metadata: { cacheControl: 'public, max-age=31536000' }
      });
      await file.makePublic();
      
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      await newsRef.doc(id).update({ image_url: publicUrl });
      
      successCount++;
      console.log(`         ✅ ÖZGÜN GÖRSEL BAŞARILI: ${publicUrl}`);
      
    } catch (e: any) {
      failCount++;
      console.error(`         ❌ HATA [${id}]:`, e.message);
    }
    
    // MALIYE BAKANI KURALI (BÜTÇE KORUMASI VE RATE LIMIT ENGELİ)
    console.log(`         ⏳ Maliye Bakanı Kuralı Devrede: 15 Saniye soğunuyor...`);
    await new Promise(resolve => setTimeout(resolve, 15000));
  }
  
  console.log('\n======================================');
  console.log('🎉 ÖZGÜNLEŞTİRME VE MİNYATÜR DEPLOY BİTTİ');
  console.log('======================================');
  process.exit(0);
}

runImagenPhase();
