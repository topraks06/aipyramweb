import { adminDb } from '../src/lib/firebase-admin';

async function testPage2() {
  try {
    const limitCount = 60;
    const snap = await adminDb.collection('trtex_news')
      .where("status", "==", "published")
      .orderBy("createdAt", "desc")
      .limit(limitCount)
      .get();
      
    console.log("Total docs fetched:", snap.docs.length);
    
    // Simulate what fetchAlohaCategoryPayload does for page 2
    let allNews = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Actually page 2 skips the first 30 docs if it was paginated properly.
    // fetchAlohaCategoryPayload code has its own logic. Let's see if we can just import it.
  } catch (e) {
    console.error(e);
  }
}
testPage2();
