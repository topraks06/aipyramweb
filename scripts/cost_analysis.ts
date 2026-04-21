import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { adminDb } from '../src/lib/firebase-admin';

async function analyze() {
  if (!adminDb) { console.error('Firebase baglantisi basarisiz'); process.exit(1); }
  
  const now = Date.now();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Son 24 Saat
  const snap24 = await adminDb.collection('trtex_news').where('createdAt', '>=', oneDayAgo).get();
  let count24 = snap24.size;
  let images24 = 0;
  snap24.forEach(doc => { 
    const data = doc.data();
    images24 += (data.images ? data.images.length : (data.image_url ? 1 : 0)); 
  });

  // Son 30 Gun
  const snap30 = await adminDb.collection('trtex_news').where('createdAt', '>=', thirtyDaysAgo).get();
  let count30 = snap30.size;
  let images30 = 0;
  snap30.forEach(doc => { 
    const data = doc.data();
    images30 += (data.images ? data.images.length : (data.image_url ? 1 : 0)); 
  });

  // Tahmini API Maliyetleri
  const costPerArticle = 0.005; 
  const costPerImage = 0.03;  

  const cost24 = (count24 * costPerArticle) + (images24 * costPerImage);
  const cost30 = (count30 * costPerArticle) + (images30 * costPerImage);

  console.log('--- TRTEX AJAN URETIM RAPORU ---');
  console.log('Son 24 Saat Haber Uretimi : ' + count24 + ' adet');
  console.log('Son 24 Saat Gorsel Uretimi: ' + images24 + ' adet');
  console.log('Son 24 Saat Tahmini Fatura: $' + cost24.toFixed(2));
  console.log('--------------------------------');
  console.log('Son 30 Gun Haber Uretimi  : ' + count30 + ' adet');
  console.log('Son 30 Gun Gorsel Uretimi : ' + images30 + ' adet');
  console.log('Son 30 Gun Tahmini Fatura : $' + cost30.toFixed(2));
  process.exit(0);
}

analyze().catch(console.error);
