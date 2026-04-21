import { config } from 'dotenv';
config({ path: '.env.local' });
import { adminDb, admin } from '../src/lib/firebase-admin';

async function verify() {
  console.log('🔍 Gerçeklik Kontrolü Başlıyor...\n');

  try {
      // 1. GCS KONTROLÜ
      console.log('--- 🖼️ FAZ 1 (GCS) KONTROLÜ ---');
      let files: any[] = [];
      try {
         const bucket = admin.storage().bucket('aipyram-core.firebasestorage.app'); 
         [files] = await bucket.getFiles({ prefix: 'trtex-news/' });
      } catch (e) {
         console.log('❌ GCS BUCKET HATASI:', e.message);
      }
      
      console.log(`Bulunan Dosya Sayısı: ${files.length}`);
      if (files.length === 0) {
         console.log('❌ GCS KLASÖRÜ BOŞ! (Görsel üretilmemiş)');
      } else {
         console.log(`GCS'de ${files.length} dosya var.`);
      }

      // 2. FIRESTORE RASTGELE 3 HABER
      console.log('\n--- 📰 FAZ 1 & FAZ 3 (FIRESTORE) KONTROLÜ ---');
      const newsSnap = await adminDb.collection('trtex_news').limit(3).get();
      newsSnap.forEach(snap => {
          const data = snap.data();
          console.log(`Haber ID: ${snap.id}`);
          console.log(`Image URL: ${data.image_url}`);
          
          const hasTranslations = !!data.translations;
          if (hasTranslations) {
              const enTitle = data.translations?.EN?.title;
              const deTitle = data.translations?.DE?.title;
              console.log(`Çeviri durumu: EN [${enTitle || 'yok'}], DE [${deTitle || 'yok'}]`);
          } else {
              console.log('❌ Translations Objesi YOK - Çeviri scripti atlamış!');
          }
          console.log('-'.repeat(30));
      });
      
  } catch(e) {
      console.error('Doğrulama hatası:', e.message);
  }
  
  process.exit(0);
}

verify();
