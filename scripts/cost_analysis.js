const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');
if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function analyze() {
  const now = Date.now();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Son 24 saat
  const snap24 = await db.collection('trtex_news').where('createdAt', '>=', oneDayAgo).get();
  let count24 = snap24.size;
  let images24 = 0;
  snap24.forEach(doc => { 
    const data = doc.data();
    images24 += (data.images ? data.images.length : (data.image_url ? 1 : 0)); 
  });

  // Son 30 gün
  const snap30 = await db.collection('trtex_news').where('createdAt', '>=', thirtyDaysAgo).get();
  let count30 = snap30.size;
  let images30 = 0;
  snap30.forEach(doc => { 
    const data = doc.data();
    images30 += (data.images ? data.images.length : (data.image_url ? 1 : 0)); 
  });

  const costPerArticle = 0.005; // Ortalama Gemini API token mailiyeti (Metin - tahmini)
  const costPerImage = 0.03;  // Google Imagen-3 maliyeti

  const cost24 = (count24 * costPerArticle) + (images24 * costPerImage);
  const cost30 = (count30 * costPerArticle) + (images30 * costPerImage);

  console.log('=== ÜRETÝM RAPORU ===');
  console.log('Son 24 Saat Haber:', count24, '| Görsel:', images24);
  console.log('Son 24 Saat Tahmini Maliyet: $' + cost24.toFixed(2));
  
  console.log('Son 30 Gün Haber:', count30, '| Görsel:', images30);
  console.log('Son 30 Gün Tahmini Maliyet: $' + cost30.toFixed(2));
}

analyze().catch(console.error);
