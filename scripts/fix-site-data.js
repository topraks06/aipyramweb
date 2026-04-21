/**
 * ALOHA SITE FIXER — Firestore'daki bozuk/eski verileri düzelt
 * 
 * Bu script master API'nin serve ettiği verileri temizler.
 * TRTEX frontend "dumb client" olarak bu veriyi okur.
 * Veri düzeltilince frontend otomatik düzelir.
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
  });
}

const db = admin.firestore();

async function fixSiteData() {
  console.log('=== ALOHA SITE FIXER ===\n');

  // 1. live_dashboard'daki eski hardcoded market verilerini temizle
  console.log('1. live_dashboard eski market verileri temizleniyor...');
  try {
    const dashRef = db.collection('trtex_intelligence').doc('live_dashboard');
    const dashDoc = await dashRef.get();
    
    if (dashDoc.exists) {
      const data = dashDoc.data();
      console.log('   Mevcut market:', JSON.stringify(data.market, null, 2));
      
      // Eski hardcoded verileri sil — ticker_live'dan gelecek
      await dashRef.update({
        'market': admin.firestore.FieldValue.delete(),
      });
      console.log('   ✅ Eski market verileri silindi');
    } else {
      console.log('   ⚠️ live_dashboard dokümanı yok');
    }
  } catch (err) {
    console.error('   ❌ Hata:', err.message);
  }

  // 2. trtex_signals/live_feed'deki eski veriyi temizle
  console.log('\n2. trtex_signals/live_feed temizleniyor...');
  try {
    const sigRef = db.collection('trtex_signals').doc('live_feed');
    const sigDoc = await sigRef.get();
    
    if (sigDoc.exists) {
      const data = sigDoc.data();
      console.log('   Mevcut data keys:', Object.keys(data));
      
      // last_updated'ı sıfırla ki yeniden fetch zorla
      await sigRef.update({
        last_updated: 0,
        last_safe_fetch: 0,
      });
      console.log('   ✅ Cache invalidated — yeniden fetch zorlanacak');
    }
  } catch (err) {
    console.error('   ❌ Hata:', err.message);
  }

  // 3. ticker_live kontrol — gerçek veri var mı?
  console.log('\n3. ticker_live kontrol...');
  try {
    const tickerRef = db.collection('trtex_intelligence').doc('ticker_live');
    const tickerDoc = await tickerRef.get();
    
    if (tickerDoc.exists) {
      const data = tickerDoc.data();
      console.log('   forex:', JSON.stringify(data.forex, null, 2)?.substring(0, 300));
      console.log('   commodities:', JSON.stringify(data.commodities, null, 2)?.substring(0, 300));
      console.log('   logistics:', JSON.stringify(data.logistics, null, 2)?.substring(0, 300));
      console.log('   ✅ ticker_live mevcut');
    } else {
      console.log('   ⚠️ ticker_live yok — henüz hiç güncellenmemiş');
    }
  } catch (err) {
    console.error('   ❌ Hata:', err.message);
  }

  // 4. Encoding bozuk haberleri kontrol ve raporla
  console.log('\n4. Encoding kontrol (trtex_news)...');
  try {
    const newsSnap = await db.collection('trtex_news')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();
    
    let encodingIssues = 0;
    newsSnap.docs.forEach(doc => {
      const data = doc.data();
      const title = data.title || data.title_tr || '';
      // Bozuk encoding tespiti — "Ä" "Ã" gibi karakterler
      if (/[ÄÃ¼Ã¶Ã§Ã¼ÅŸÄ±Ä°]/.test(title)) {
        console.log(`   ⚠️ Encoding bozuk: ${doc.id} — "${title.substring(0, 60)}"`);
        encodingIssues++;
      }
    });
    
    if (encodingIssues === 0) {
      console.log('   ✅ Encoding sorunlu haber bulunamadı (top 20)');
    } else {
      console.log(`   ⚠️ ${encodingIssues} haber encoding sorunu var`);
    }
  } catch (err) {
    console.error('   ❌ Hata:', err.message);
  }

  console.log('\n=== TAMAMLANDI ===');
  process.exit(0);
}

fixSiteData();
