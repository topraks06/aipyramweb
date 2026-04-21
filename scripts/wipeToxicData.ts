import { adminDb } from '../src/lib/firebase-admin';

async function wipeToxicData() {
  console.log('[WIPE] Zehirli, B2C veya resimsiz haberler siliniyor...');
  const db = adminDb.collection('trtex_news');
  const snap = await db.get();
  let deletedCount = 0;
  
  const batch1 = adminDb.batch();
  const batch2 = adminDb.batch();

  let c = 0;
  snap.forEach(doc => {
    const data = doc.data();
    // Resim yoksa SİL (image_url yoksa veya unsplash/pexels varsa SİL)
    const hasImage = data.image_url || (data.images && data.images.length > 0);
    const hasExternal = (data.image_url && (data.image_url.includes('unsplash') || data.image_url.includes('pexels')));
    
    // B2C başlıkları SİL
    const titleLower = data.title ? data.title.toLowerCase() : '';
    const isB2C = titleLower.includes('english home') 
               || titleLower.includes('yaz sezonu') 
               || titleLower.includes('ev dekorasyon')
               || titleLower.includes('bahar koleksiyonu')
               || titleLower.includes('yeni sezon')
               || titleLower.includes('yorgan')
               || titleLower.includes('nevresim takımı');

    if (!hasImage || hasExternal || isB2C) {
      if (c < 450) {
        batch1.delete(doc.ref);
      } else {
        batch2.delete(doc.ref);
      }
      c++;
      deletedCount++;
      console.log(`❌ SİLİNDİ: ${data.title?.substring(0,40)} (Sebep: ${!hasImage ? 'Resim Yok' : hasExternal ? 'Unsplash Dış Kaynak' : 'B2C Kelime Saptandı'})`);
    } else {
      console.log(`✅ TUTULDU: ${data.title?.substring(0,40)}`);
    }
  });

  if (c > 0) await batch1.commit();
  if (c >= 450) await batch2.commit();

  console.log(`[WIPE] TAMAMLANDI. Toplam Silinen: ${deletedCount}`);
  
  // Terminal payloadı da güncelleyelim ki arayüz boşluğa düşmesin
  console.log('[WIPE] Terminal payload temizleniyor...');
  await adminDb.collection('trtex_terminal').doc('current').set({
    gridArticles: [],
    haftaninFirsatlari: [],
    heroArticle: null
  }, { merge: true });
}

wipeToxicData().catch(console.error);
