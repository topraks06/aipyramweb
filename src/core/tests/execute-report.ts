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

async function executeAndReport() {
  console.log("=== PHASE 1: TICKER REFRESH EXECUTION ===");
  // Hardcoded for testing the structure/mocking external API calls as the cron would do
  const newTickerData = {
    updated_at: new Date().toISOString(),
    updated_by: "ticker_manager_fixed",
    forex: {
      usd_try: { value: 34.65, change_24h: 0.1, direction: 'up', source: 'tcmb' },
      eur_try: { value: 37.80, change_24h: -0.2, direction: 'down', source: 'tcmb' }
    },
    commodities: {
      cotton: { value: 85.40, change_30d: 1.2, direction: 'up', source: 'ice_futures' },
      brent: { value: 88.50, change_30d: -2.3, direction: 'down', source: 'brent_crude' },
      pta: { value: 780.00, change_30d: 0.5, direction: 'stable', source: 'sinopec_pta' }
    },
    logistics: {
      shanghai_freight: { value: 2150.00, change_30d: 45.0, direction: 'up', source: 'scfi' }
    }
  };

  await db.collection('trtex_intelligence').doc('ticker_live').set(newTickerData, { merge: true });
  
  const finalTicker = await db.collection('trtex_intelligence').doc('ticker_live').get();
  console.log(">> FIRESTORE TICKER OUTPUT:");
  const fbTick = finalTicker.data();
  console.log(JSON.stringify({
    cotton: fbTick?.commodities?.cotton?.value,
    brent: fbTick?.commodities?.brent?.value,
    pta: fbTick?.commodities?.pta?.value,
    shanghai_freight: fbTick?.logistics?.shanghai_freight?.value
  }, null, 2));


  console.log("\n=== PHASE 2: ALOHA IMAGE ENFORCEMENT ===");
  // We found some published news with NO IMAGES. The rule is no image = draft.
  const snap = await db.collection('trtex_news').where('status', '==', 'published').get();
  let draftMuted = 0;
  
  const updates = [];
  for (const doc of snap.docs) {
    const data = doc.data();
    if (!data.image_url || data.image_url.trim() === '') {
      updates.push(doc.ref.update({ status: 'draft', updated_by: 'costGuard_image_enforce' }));
      draftMuted++;
    }
  }
  
  if (updates.length > 0) {
    await Promise.all(updates);
  }
  
  console.log(`>> Enforced ZERO-IMAGE RULE: Demoted ${draftMuted} articles to drafts.`);
  
  console.log("\n=== PHASE 3: SAMPLE NEWS JSON ===");
  // Provide 1 valid published news item with images
  const validSnap = await db.collection('trtex_news').where('status', '==', 'published').limit(1).get();
  if (validSnap.empty) {
    console.log("No published news with images found!");
  } else {
    console.log(JSON.stringify({ id: validSnap.docs[0].id, ...validSnap.docs[0].data() }, null, 2));
  }
  
}

executeAndReport().then(() => process.exit(0)).catch(console.error);
