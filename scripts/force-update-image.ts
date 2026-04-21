import { config } from 'dotenv';
config({ path: '.env.local' });
import { adminDb, admin } from '../src/lib/firebase-admin';
import { GoogleGenAI } from '@google/genai';
import { MasterPhotographer } from '../src/core/swarm/master-photographer';

// Vertex AI (Google Native) Entegrasyonuna geçiş
// @ts-ignore
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
     }
     return bucket;
  } catch(e: any) {
     console.error(`🚨 BUCKET HATASI`);
     process.exit(1);
  }
}

async function updateFirstArticleImage() {
  console.log("Firestore'dan en güncel TRTEX haberi çekiliyor...");
  const snapshot = await adminDb.collection("trtex_news").orderBy('publishedAt', 'desc').limit(1).get();
  
  if (snapshot.empty) {
    console.error("Hiç haber bulunamadı.");
    return;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();
  const docId = doc.id;
  const title = data.translations?.TR?.title || data.title || "Ev Tekstili Trendleri";
  
  const cL = (data.category || "").toLowerCase();
  let photoCategory: any = "general";
  if (cL.includes("iplik") || cL.includes("yarn")) photoCategory = "yarn";
  else if (cL.includes("makine") || cL.includes("machin")) photoCategory = "machinery";
  else if (cL.includes("perde") || cL.includes("curtain")) photoCategory = "curtains";
  else if (cL.includes("halı") || cL.includes("carpet")) photoCategory = "carpets";

  console.log(`[HABER BULUNDU] ID: ${docId} | Başlık: ${title}`);
  
  const spec = await MasterPhotographer.buildMasterPhotographerPrompt({ category: photoCategory, context: title });
  const finalPrompt = `${spec.prompt} [Unique Record Key: ${docId}]`;

  console.log("\nVertex AI Imagen 3 çağrılıyor...");
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-001',
        prompt: finalPrompt,
        config: {
            negativePrompt: spec.negativePrompt,
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '16:9'
        }
    });

    const base64Image = response.generatedImages[0].image.imageBytes;
    const bucket = await getBucket();
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    const filename = `trtex-news/${docId}_uniq_${Date.now()}.jpg`;
    const file = bucket.file(filename);
    
    await file.save(imageBuffer, { 
      contentType: 'image/jpeg',
      metadata: { cacheControl: 'public, max-age=31536000' }
    });
    await file.makePublic();
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    await adminDb.collection("trtex_news").doc(docId).update({ image_url: publicUrl });
    console.log(`\n✅ Resim başarıyla üretildi ve yüklendi: ${publicUrl}`);
    console.log("✅ Firestore güncellendi!");
  } catch (err: any) {
    console.error("❌ Resim üretilirken hata oluştu:", err.message);
  }
}

updateFirstArticleImage();
