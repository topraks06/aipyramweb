import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (getApps().length === 0) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function getHakanReport() {
  const finalTicker = await db.collection('trtex_intelligence').doc('ticker_live').get();
  const fbTick = finalTicker.data();
  
  console.log("-----------------------------------------");
  console.log(">> TICKER FIRESTORE ÇIKTISI:");
  console.log(JSON.stringify({
    cotton: fbTick?.commodities?.cotton?.value,
    brent: fbTick?.commodities?.brent?.value,
    pta: fbTick?.commodities?.pta?.value,
    shanghai_freight: fbTick?.logistics?.shanghai_freight?.value
  }, null, 2));
  console.log("-----------------------------------------");

  const validSnap = await db.collection('trtex_news').where('status', '==', 'published').limit(1).get();
  const d = validSnap.docs[0].data();
  
  console.log("\n>> 1 HABER JSON (Görsel Kontrolü İçin):");
  console.log(JSON.stringify({
    id: validSnap.docs[0].id,
    title: d.title,
    status: d.status,
    image_url: d.image_url,
    category: d.category,
    images: d.images || []
  }, null, 2));
  console.log("-----------------------------------------");
}

getHakanReport().then(() => process.exit(0)).catch(console.error);
