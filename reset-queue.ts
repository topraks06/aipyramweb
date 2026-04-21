import { adminDb } from './src/lib/firebase-admin';
async function run() {
  const c = await adminDb.collection('trtex_image_queue').where('articleId', '==', 'pamuk-fiyat-artisi-ev-tekstili-i-hracatcilarini-maliyet-bask').get();
  for (const doc of c.docs) {
      await doc.ref.update({ status: 'pending', retryCount: 0 });
      console.log('Reset queue item to pending');
  }
}
run();
