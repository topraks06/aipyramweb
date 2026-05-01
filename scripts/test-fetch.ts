import { adminDb } from '../src/lib/firebase-admin';

async function testFetch() {
  const collectionName = 'trtex_news';
  try {
    const queryFallback = adminDb.collection(collectionName).orderBy("createdAt", "desc");
    const newsSnap2 = await queryFallback.offset(30).limit(60).get();
    const categoryNews = newsSnap2.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    console.log("Found:", categoryNews.length);
  } catch (e) {
    console.error("Error:", e);
  }
}
testFetch();
