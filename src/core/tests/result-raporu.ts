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

async function runCheck() {
  console.log("=== CHECKING TICKER LIVE ===");
  const tickerDoc = await db.collection('trtex_intelligence').doc('ticker_live').get();
  const tickerData = tickerDoc.exists ? tickerDoc.data() : null;
  console.log(JSON.stringify(tickerData, null, 2));

  console.log("\n=== CHECKING NEWS SAMPLES ===");
  const newsSnap = await db.collection('trtex_news').limit(2).get();
  newsSnap.forEach(doc => {
    const d = doc.data();
    console.log(`\nID: ${doc.id}`);
    console.log(`Title: ${d.title?.substring(0,50)}...`);
    console.log(`Category: ${d.category}`);
    console.log(`Image: ${d.image_url}`);
    console.log(`Status: ${d.status}`);
  });
  
  console.log("\n=== CHECKING TOTAL STATS ===");
  const allPublish = await db.collection('trtex_news').where('status','==','published').count().get();
  const allDrafts = await db.collection('trtex_news').where('status','==','draft').count().get();
  console.log(`Published: ${allPublish.data().count}`);
  console.log(`Drafts: ${allDrafts.data().count}`);
}

runCheck().then(() => process.exit(0)).catch(console.error);
