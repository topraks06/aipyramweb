import { adminDb } from '../src/lib/firebase-admin';

async function run() {
  try {
    const snap = await adminDb.collection('trtex_news').limit(3).get();
    snap.docs.forEach((doc, i) => {
      const data = doc.data();
      console.log(`\nDoc ${i+1}: ${doc.id}`);
      console.log(`Status:`, data.status);
      console.log(`Images:`, data.images);
      console.log(`Image URL:`, data.image_url);
    });
  } catch(e) {
    console.error(e);
  }
}
run();
