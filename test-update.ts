import { adminDb } from './src/lib/firebase-admin';
async function run() {
  const articleId = 'pamuk-fiyat-artisi-ev-tekstili-i-hracatcilarini-maliyet-bask';
  const url = 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=2000&q=80&auto=format';
  await adminDb.collection('trtex_news').doc(articleId).update({ image_url: url });
  console.log('Dummy MasterPhotographer URL injected');
}
run();
