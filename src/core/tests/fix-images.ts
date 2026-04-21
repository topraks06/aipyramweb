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

async function fixImages() {
  console.log("=== FIXING IMAGE FIELDS (image_url -> images[]) ===");
  const snap = await db.collection('trtex_news').get();
  
  const updates = [];
  let modifiedCount = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    
    // Yalnızca image_url var ama images dizisi boş/yoksa
    if (data.image_url && (!data.images || data.images.length === 0)) {
      updates.push(doc.ref.update({
        images: [data.image_url]
      }));
      modifiedCount++;
    }
  }

  if (updates.length > 0) {
    await Promise.all(updates);
  }

  console.log(`>> Migration Complete: ${modifiedCount} articles updated with images array.`);
}

fixImages().then(() => process.exit(0)).catch(console.error);
