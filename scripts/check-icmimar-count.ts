import { adminDb } from '../src/lib/firebase-admin';

async function run() {
  try {
    const snap = await adminDb.collection('icmimar_designs').count().get();
    console.log("Total designs in icmimar_designs:", snap.data().count);
    
    // Let's also check trtex_market_data or other collections
    const marketSnap = await adminDb.collection('trtex_market_data').count().get();
    console.log("Total records in trtex_market_data:", marketSnap.data().count);
  } catch(e) {
    console.error(e);
  }
}
run();
