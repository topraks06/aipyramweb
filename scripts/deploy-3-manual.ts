import { config } from 'dotenv';
config({ path: '.env.local' });
import { adminDb, admin } from '../src/lib/firebase-admin';
import * as fs from 'fs';

async function deploy3() {
    console.log('🚀 MANUEL 3 GÖRSEL YÜKLEMESİ BAŞLIYOR (GCS IAM TEST)');
    const bucket = admin.storage().bucket('perde-ai.appspot.com');
    
    // Antigravity artifacts
    const images = [
      'C:\\Users\\MSI\\.gemini\\antigravity\\brain\\907f97a7-59f4-41ec-b52a-69b7dc20c130\\trtex_news_1_1775460798444.png',
      'C:\\Users\\MSI\\.gemini\\antigravity\\brain\\907f97a7-59f4-41ec-b52a-69b7dc20c130\\trtex_news_2_1775460815481.png',
      'C:\\Users\\MSI\\.gemini\\antigravity\\brain\\907f97a7-59f4-41ec-b52a-69b7dc20c130\\trtex_news_3_1775460834616.png'
    ];

    const newsSnap = await adminDb.collection('trtex_news').where('status', '==', 'published').limit(3).get();
    const articles = newsSnap.docs.map(d => ({id: d.id, ...d.data()}));

    for(let i=0; i<3; i++) {
        const article = articles[i];
        if(!article) break;
        console.log(`[${i+1}] ${article.title} için yükleniyor...`);
        
        try {
            const buffer = fs.readFileSync(images[i]);
            const file = bucket.file(`trtex-news/${article.id}_manual.png`);
            
            await file.save(buffer, { contentType: 'image/png' });
            await file.makePublic();
            const url = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
            
            await adminDb.collection('trtex_news').doc(article.id).update({ image_url: url });
            console.log(`✅ BAŞARILI: ${url}`);
        } catch(e: any) {
            console.error(`❌ YÜKLEME HATASI (${i+1}):`, e.message);
        }
    }
    console.log('✅ İşlem Tamamlandı.');
    process.exit(0);
}
deploy3();
