import { adminDb } from '../src/lib/firebase-admin';

async function main() {
  try {
    const colls = await adminDb.listCollections();
    for (const c of colls) {
      const s = await c.count().get();
      console.log(c.id, '->', s.data().count);
      
      // Let's sample one document if it's related to news
      if (c.id.includes('news') || s.data().count === 80) {
        const snap = await c.limit(1).get();
        if(!snap.empty) {
          console.log(`Sample from ${c.id}:`, Object.keys(snap.docs[0].data()));
        }
      }
    }
  } catch(e) {
    console.error(e);
  }
  process.exit();
}

main();
