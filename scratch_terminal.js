// Günlük limiti sıfırla — ajan yeni haber + görsel üretsin
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-sa-key.json");
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

async function resetLimits() {
  const db = admin.firestore();
  const today = new Date().toISOString().split('T')[0];
  
  console.log("\n═══ GÜNLÜK LİMİT SIFIRLAMA ═══\n");
  
  // 1. Günlük haber sayacını sıfırla
  await db.collection('aloha_daily_stats').doc(today).set({
    articles_created: 0,
    signals_collected: 0,
    reset_at: new Date().toISOString(),
    reset_reason: 'Otonom test — görsel pipeline doğrulama'
  });
  console.log(`✅ Günlük sayaç sıfırlandı (${today})`);
  
  // 2. Circuit breaker'ı sıfırla
  await db.collection('trtex_system_metrics').doc('current').set({
    image_errors_24h: 0,
    api_errors_24h: 0,
    core_errors_24h: 0,
    circuit_breaker_active: false,
    last_reset: new Date().toISOString()
  }, { merge: true });
  console.log("✅ Circuit breaker sıfırlandı");
  
  // 3. Signal filter daily count sıfırla
  try {
    await db.collection('aloha_signal_filter').doc(today).set({
      count: 0,
      reset_at: new Date().toISOString()
    });
    console.log("✅ Signal filter sayacı sıfırlandı");
  } catch {}
  
  console.log("\n═══ Şimdi run_agent.ts çalıştırın — ajan YENİ haber + görsel üretecek ═══\n");
}

resetLimits().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
