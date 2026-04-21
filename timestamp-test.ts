const admin = require('firebase-admin');
const serviceAccount = require('./firebase-sa-key.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function runTest() {
   console.log("1. Zaman Makinesi: TRTEX Terminali'ni 48 saat eskiye alıyorum...");
   const oldDate = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
   await db.collection('trtex_terminal').doc('current').update({
       generatedAt: oldDate
   });
   
   console.log("2. ALOHA Deep Audit Başlatılıyor...");
   const { deepSiteAudit } = require('./src/core/swarm/deepAudit');
   const auditReport = await deepSiteAudit('trtex');
   console.log(`Bulunan Hatalar: ${typeof auditReport === 'object' ? auditReport.issues.length : 'unknown'}`);
   
   console.log("3. ALOHA Auto Repair Başlatılıyor (HESAP SORMA)...");
   const { autoRepair } = require('./src/core/swarm/autoRepair');
   await autoRepair('trtex');
   
   console.log("Test Tamamlandı! Terminal kontrol ediliyor...");
   const snap = await db.collection('trtex_terminal').doc('current').get();
   console.log("Yeni Oluşturulma Tarihi: " + snap.data().generatedAt);
   process.exit(0);
}

runTest();
