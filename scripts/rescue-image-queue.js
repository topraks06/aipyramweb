const admin = require('firebase-admin');

// Load env explicitly
require('dotenv').config({ path: '.env.local' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
  });
}

const db = admin.firestore();

async function rescueQueue() {
  console.log("🛠️ Image Queue Kurtarma Operasyonu Basliyor...");
  const queueRef = db.collection('trtex_image_queue');
  
  // Find permanently failed
  const failedSnap = await queueRef.where('status', '==', 'failed_permanent').get();
  console.log(`Bulunan 'failed_permanent' islem sayisi: ${failedSnap.size}`);
  
  const batch1 = db.batch();
  let deleted = 0;
  failedSnap.forEach(doc => {
    batch1.delete(doc.ref);
    deleted++;
  });
  
  if (deleted > 0) {
    await batch1.commit();
    console.log(`✅ ${deleted} adet kalici hatali islem SU TANKINDAN BOSALTILDI.`);
  }

  // Find stuck pending (older than 2 hours)
  const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
  const pendingSnap = await queueRef.where('status', 'in', ['pending', 'processing']).get();
  
  const batch2 = db.batch();
  let stuckCount = 0;
  pendingSnap.forEach(doc => {
    const data = doc.data();
    if (data.created_at < twoHoursAgo || data.updated_at < twoHoursAgo || data.error?.includes('404')) {
      batch2.delete(doc.ref);
      stuckCount++;
    }
  });

  if (stuckCount > 0) {
    await batch2.commit();
    console.log(`✅ ${stuckCount} adet takilmis (404 / zaman asimi) pending islem ICRIKTAN TEMIZLENDI.`);
  }

  console.log("🚀 Image Queue artik tertemiz. Yeni SOVEREIGN 4.0 uretimleri icin yol acik.");
}

rescueQueue()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("HATA:", err);
    process.exit(1);
  });
