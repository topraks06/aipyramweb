import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { adminDb } from '../src/lib/firebase-admin';
import { processImageForContent } from '../src/core/swarm/imageAgent';

async function fixMissingImagesWithLuxuriousVogue() {
  const terminalRef = adminDb.collection('trtex_terminal').doc('current');
  const snap = await terminalRef.get();
  if (!snap.exists) return;
  const data = snap.data();

  const toUpdate = data?.gridArticles || [];
  let updatedCount = 0;

  for (let article of toUpdate) {
    // Only target those we recently updated with ugly images or the targeted ones
    const isTarget = ['global-home-textiles-market-to-expand-to-119-2-billion-by-20', '1iO32xl0nBIfJjw6XfZc', 'E20WKow5OCipofdG398a'].includes(article.id);
    
    if (isTarget) {
      let title = article.title;
      const ref = adminDb.collection('trtex_news').doc(article.id);
      
      if (!title) {
        const newsSnap = await ref.get();
        if (newsSnap.exists) title = newsSnap.data()?.title;
      }
      
      if (!title) {
        console.log(`Bypassing ${article.id} - No Title`);
        continue;
      }

      console.log(`Regenerating 1:1 LUXURIOUS image for: ${title}`);
      
      try {
        // Here we trigger the FULL imageAgent pipeline which embeds Hakan's Rule and Vogue styling
        const url = await processImageForContent('news', 'curtain_modern', title, undefined, 'wide', '1:1');
        
        if (url) {
            await ref.update({ image_url: url, images: [url] });
            article.image_url = url;
            article.images = [url];
            updatedCount++;
            console.log(`✅ Success for ${article.id} -> ${url}`);
        }
        
        // Anti-rate-limit sleep
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        console.error(`Failed for ${article.id}:`, err);
      }
    }
  }

  if (updatedCount > 0) {
    await terminalRef.set(data);
    console.log(`Updated terminal with ${updatedCount} NEW luxurious images.`);
  }
}

fixMissingImagesWithLuxuriousVogue().then(() => process.exit(0)).catch(console.error);
