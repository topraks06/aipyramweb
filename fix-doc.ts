import { adminDb } from './src/lib/firebase-admin';
async function run() {
  const c = await adminDb.collection('trtex_news').limit(1).orderBy('created_at', 'desc').get();
  const a = c.docs[0];
  const d = a.data();
  
  if (a.id !== d.slug) {
      await adminDb.collection('trtex_news').doc(d.slug).set(d);
      await adminDb.collection('trtex_news').doc(a.id).delete();
      console.log('Moved document to slug-based ID:', d.slug);
  }
}
run();
