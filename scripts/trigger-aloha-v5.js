require('dotenv').config({ path: '.env.local' });
const { runAutonomousCycle } = require('./src/core/aloha/autoRunner');
const { adminDb } = require('./src/lib/firebase-admin');

async function pushRealSignal() {
  console.log("ALOHA OTONOM TETIKLENIYOR (AIPYRAM V5) ...");
  
  // Forced deletion of stale dummy data in Intelligence dashboard
  try {
     console.log("🛠️ Eski dashboard yikaniyor...");
     await adminDb.collection('trtex_intelligence').doc('live_dashboard').delete();
     await adminDb.collection('trtex_intelligence').doc('homepage_brain').delete();
  } catch(e) {}

  console.log("🧠 Zeka devrede. Web Search ve Makro Analiz basliyor...");
  try {
    const result = await runAutonomousCycle('trtex');
    console.log("RAPOR:", {
      sure_ms: result.duration,
      aksiyonlar: result.actionsPerformed,
      hatalar: result.errors
    });
    console.log("✅ Gercek Piyasadan taze data cekildi.");
  } catch(e) {
    console.error("HATA:", e);
  }
}

pushRealSignal().then(() => process.exit(0));
