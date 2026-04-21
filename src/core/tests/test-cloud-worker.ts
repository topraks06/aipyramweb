import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env yükle ve başlat
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  admin.initializeApp({
     credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
  });
} else {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

async function testWorker() {
  const db = admin.firestore();
  console.log("➡️ [TEST] Firestore 'aloha_jobs' kuyruğuna 'node --version' emri yazılıyor...");

  const jobRef = await db.collection("aloha_jobs").add({
    taskId: "test_" + Date.now(),
    actionType: 'SHELL_COMMAND',
    payload: { command: "node --version" },
    status: 'queued',
    createdAt: Date.now(),
  });

  console.log(`✅ [TEST] İş eklendi! ID: ${jobRef.id}`);
  console.log("⏳ [TEST] Worker'ın alıp çalıştırması bekleniyor...");

  jobRef.onSnapshot((snap) => {
     if (snap.exists) {
        const data = snap.data();
        if (data?.status === 'processing') {
           console.log("⚙️ [TEST] Worker işi teslim aldı, çalıştırıyor.");
        } else if (data?.status === 'completed') {
           console.log(`🎉 [TEST] Worker İşi TAMAMLADI! Çıktı:\n${data.result}`);
           process.exit(0);
        } else if (data?.status === 'failed') {
           console.error(`💥 [TEST] Worker patladı: ${data.error}`);
           process.exit(1);
        }
     }
  });

  setTimeout(() => {
     console.error("⏱️ [TEST] Zaman Aşımı! Worker açılmamış olabilir.");
     process.exit(1);
  }, 30000);
}

testWorker();
