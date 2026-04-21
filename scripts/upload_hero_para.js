const admin = require('firebase-admin');
const fs = require('fs');
require('dotenv').config({path: '.env.local'});

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
});

const bucket = admin.storage().bucket();
const db = admin.firestore();

async function run() {
  const localImagePath = 'C:\\Users\\MSI\\.gemini\\antigravity\\brain\\0b537ced-8e34-416b-a8a7-ad75f6b92562\\para_luxury_fabric_1776341349349.png';
  const destination = 'trtex-news/para_luxury_fabric_hero.png';

  console.log("Uploading image...");
  await bucket.upload(localImagePath, {
    destination: destination,
    public: true,
    metadata: {
      contentType: 'image/png',
      cacheControl: 'public, max-age=31536000'
    }
  });

  const url = `https://storage.googleapis.com/${bucket.name}/${destination}`;
  console.log("Uploaded! URL:", url);

  const docId = 'par-dan-proposte-2026-i-cin-alev-geciktiricili-perdelik-kuma';
  
  const docRef = db.collection('trtex_news').doc(docId);
  const docSnap = await docRef.get();
  let existingImages = [];
  if (docSnap.exists) {
    existingImages = docSnap.data().images || [];
  }
  
  if (existingImages.length === 0) existingImages = [url, url, url];
  existingImages[0] = url;

  await docRef.update({
    image_url: url,
    images: existingImages
  });
  
  const termConfig = await db.collection('trtex_terminal').doc('current').get();
  if (termConfig.exists) {
      const data = termConfig.data();
      if (data.heroArticle && data.heroArticle.id === docId) {
          data.heroArticle.image_url = url;
          data.heroArticle.images = data.heroArticle.images || [];
          data.heroArticle.images[0] = url;
      }
      if (data.gridArticles) {
          for(let g of data.gridArticles) {
              if (g.id === docId) {
                  g.image_url = url;
                  g.images = g.images || [];
                  g.images[0] = url;
              }
          }
      }
      await db.collection('trtex_terminal').doc('current').set(data);
  }

  console.log("Firestore updated with the new Aloha image!");
  process.exit(0);
}

run().catch(console.error);
