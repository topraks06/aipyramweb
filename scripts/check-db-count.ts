import { adminDb } from '../src/lib/firebase-admin';

async function run() {
  try {
    const snap = await adminDb.collection('trtex_news').count().get();
    console.log("Total articles in trtex_news:", snap.data().count);
    
    // Check costs collection
    const costSnap = await adminDb.collection('aloha_costs').count().get();
    console.log("Total logs in aloha_costs:", costSnap.data().count);
  } catch(e) {
    console.error(e);
  }
}
run();
