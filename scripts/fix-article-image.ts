import { adminDb } from '../src/lib/firebase-admin';

async function fixArticle() {
  try {
    const snap = await adminDb.collection('trtex_news').where('title', '>=', 'Küresel Ev Tekstili Pazarı 2026').where('title', '<=', 'Küresel Ev Tekstili Pazarı 2026\uf8ff').get();
    
    if (snap.empty) {
      console.log('Makale bulunamadı!');
      // Eğer başlık tam eşleşmiyorsa tüm makaleleri çekip bulalım
      const all = await adminDb.collection('trtex_news').get();
      let found = false;
      all.docs.forEach(doc => {
        const title = doc.data().title || '';
        if (title.includes('124.13') || title.includes('Küresel Ev Tekstili Pazarı')) {
          console.log('Bulundu (includes ile):', doc.id, title);
          found = true;
          // Resmi değiştir
          adminDb.collection('trtex_news').doc(doc.id).update({
            images: ['https://storage.googleapis.com/aipyram-web.firebasestorage.app/trtex-news/kuzey-ve-guney-amerika-luks-otel-projele-curtain-blackout-2026-1.jpg'],
            image_url: 'https://storage.googleapis.com/aipyram-web.firebasestorage.app/trtex-news/kuzey-ve-guney-amerika-luks-otel-projele-curtain-blackout-2026-1.jpg'
          }).then(() => console.log('Görsel güncellendi!'));
        }
      });
      if (!found) console.log('Hiçbir şekilde bulunamadı.');
      return;
    }

    snap.docs.forEach(async (doc) => {
      console.log('Bulundu:', doc.id, doc.data().title);
      await adminDb.collection('trtex_news').doc(doc.id).update({
        images: ['https://storage.googleapis.com/aipyram-web.firebasestorage.app/trtex-news/mena-luks-konut-projeleri-premium-perde--trend-color-2026-1.jpg'],
        image_url: 'https://storage.googleapis.com/aipyram-web.firebasestorage.app/trtex-news/mena-luks-konut-projeleri-premium-perde--trend-color-2026-1.jpg'
      });
      console.log('Resim başarıyla TRTex lüks otel perde resmiyle değiştirildi.');
    });

  } catch (err) {
    console.error(err);
  }
}

fixArticle();
