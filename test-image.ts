import { config } from 'dotenv'; config({ path: '.env.local' });
import { adminDb } from './src/lib/firebase-admin';
import { alohaAI } from './src/core/aloha/aiClient';
const ai = alohaAI.getClient();
async function run() {
  const c = await adminDb.collection('trtex_news').limit(1).orderBy('created_at', 'desc').get();
  const a = c.docs[0];
  const articleId = a.id;
  const d = a.data();
  const prompt = d.image_prompts[0];
  console.log('Generating for Prompt:', prompt.substring(0, 50));
  const imageResult = await ai.models.generateImages({ model: 'imagen-3.0-generate-001', prompt: prompt.substring(0, 1000), config: { numberOfImages: 1, aspectRatio: '16:9' } });
  if (imageResult?.generatedImages?.[0]?.image?.imageBytes) {
    const bytes = imageResult.generatedImages[0].image.imageBytes;
    const { getStorage } = require('firebase-admin/storage');
    const bucket = getStorage().bucket();
    const fileName = 'trtex-news/' + articleId + '-hero.jpg';
    const file = bucket.file(fileName);
    const buffer = Buffer.from(bytes, 'base64');
    await file.save(buffer, { contentType: 'image/jpeg', public: true });
    const publicUrl = 'https://storage.googleapis.com/' + bucket.name + '/' + fileName;
    await adminDb.collection('trtex_news').doc(articleId).update({ image_url: publicUrl });
    console.log('SUCCESS! URL:', publicUrl);
  }
}
run();
