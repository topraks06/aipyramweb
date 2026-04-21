import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { exec } from 'child_process';

// Çevresel değişkenleri yükle
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("✅ [CLOUD WORKER] Firebase Admin başlatıldı (Service Account Key).");
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      console.log("✅ [CLOUD WORKER] Firebase Admin başlatıldı (Application Default Config).");
    }
  } catch (error) {
    console.error("❌ [CLOUD WORKER] Firebase auth başarısız:", error);
    process.exit(1);
  }
}

const db = admin.firestore();

// -----------------------------------------------------------------------------
// GÜVENLİK GUARD'I (actionRunner.ts ile aynı)
// -----------------------------------------------------------------------------
const ALLOWED_COMMAND_PREFIXES = [
  'echo ', 'git status', 'git log', 'git diff', 'git branch', 'git stash',
  'pnpm run build', 'pnpm run dev', 'pnpm run lint', 'pnpm install',
  'npm run build', 'npm run dev', 'npm run lint', 'npm install',
  'npx tsc', 'npx next', 'npx firebase',
  'firebase deploy', 'firebase projects:list', 'firebase hosting',
  'node --version', 'node -e ', 'node scripts/', 'pnpm --version',
  'dir ', 'ls ', 'cat ', 'type ', 'find ', 'grep ',
];

const BLOCKED_PATTERNS = [
  'rm -rf /', 'del /s /q c:\\', 'format ', 'shutdown', 'reboot', 'mkfs', ':(){', 'dd if=',
];

function isCommandSafe(command: string): { safe: boolean; reason?: string } {
  const trimmed = command.trim().toLowerCase();
  for (const blocked of BLOCKED_PATTERNS) {
    if (trimmed.includes(blocked)) {
      return { safe: false, reason: `BLOCKED` };
    }
  }
  const isWhitelisted = ALLOWED_COMMAND_PREFIXES.some(prefix => trimmed.startsWith(prefix.toLowerCase()));
  if (!isWhitelisted) {
    return { safe: false, reason: `NOT_WHITELISTED` };
  }
  return { safe: true };
}

// -----------------------------------------------------------------------------
// WORKER DÖNGÜSÜ
// -----------------------------------------------------------------------------
console.log("🚀 [CLOUD WORKER] Kuyruk Dinleniyor...");

db.collection('aloha_jobs')
  .where('status', '==', 'queued')
  .onSnapshot(async (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === 'added') {
        const jobId = change.doc.id;
        const jobData = change.doc.data();
        
        console.log(`\n📦 [YENİ GÖREV ALINDI] ID: ${jobId} | Tip: ${jobData.actionType}`);

        // State update (Race-condition / Multi-worker clash preventer)
        try {
          await db.runTransaction(async (t) => {
            const doc = await t.get(change.doc.ref);
            if (doc.data()?.status !== 'queued') throw new Error("Görev başkası tarafından alındı.");
            t.update(change.doc.ref, { status: 'processing', processedAt: Date.now() });
          });
        } catch (e) {
          console.log(`⚠️ [ATLANDI] Job ${jobId} alınamadı (Muhtemelen işleniyor).`);
          return;
        }

        // İnfaz (Execution)
        if (jobData.actionType === 'SHELL_COMMAND') {
          const command = jobData.payload?.command || "echo 'Bos Komut'";
          const safety = isCommandSafe(command);
          
          if (!safety.safe) {
             console.error(`🛡️ [GÜVENLİK ENGELİ] ${command} reddedildi.`);
             await change.doc.ref.update({ status: 'failed', error: 'Güvenlik İhlali', completedAt: Date.now() });
             return;
          }

          console.log(`⚙️ [ÇALIŞTIRILIYOR] ${command}`);
          const projectRoot = path.resolve(__dirname, '../');

          exec(command, { cwd: projectRoot, timeout: 120000, maxBuffer: 1024 * 1024 * 10 }, async (error, stdout, stderr) => {
             let result = stdout || "";
             if (error) {
               console.error(`❌ [HATA DETAYI]`, stderr || error.message);
               result = `[KOMUT HATASI] ${stderr || error.message}\n` + result;
               await change.doc.ref.update({ status: 'failed', error: result, completedAt: Date.now() });
             } else {
               console.log(`✅ [BAŞARILI] İşlem tamam.`);
               await change.doc.ref.update({ status: 'completed', result: result, completedAt: Date.now() });
             }
          });
        } else {
           // Diğer tipler için (Şimdilik Desteklenmiyor yaz ve geç)
           await change.doc.ref.update({ status: 'failed', error: 'Bilinmeyen ActionType', completedAt: Date.now() });
        }
      }
    });
  });

console.log("🛠️ [SİSTEM] Cloud Worker Uykuya geçmiyor. Node.js Daemon Modu AKTİF.");

// -----------------------------------------------------------------------------
// OTONOM KALP ATIŞI (HEARTBEAT CRON) - FAZ 5
// -----------------------------------------------------------------------------
const HEARTBEAT_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 saatte bir uyanır

async function triggerAlohaHeartbeat() {
    console.log("💓 [HEARTBEAT] Otonom Kalp Atışı Tetikleniyor...");
    try {
        const response = await fetch("http://localhost:3000/api/aloha/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: "SYSTEM_DAEMON",
                message: "SİSTEM KALP ATIŞI (CRON): Tüm ekosistemi 'global_b2b_strategy_scan' ile tara. Gördüğün boğulmaları veya sorunları 'run_project_script' ile düzelt. Eğer sorun yoksa sadece 'Sistem Sağlam' raporu ver.",
                systemContext: { trigger: "cron_heartbeat" }
            })
        });
        const data = await response.json();
        console.log(`✅ [HEARTBEAT SONUCU] Aloha Uyandı ve Döndü.`);
    } catch (e: any) {
        console.error(`❌ [HEARTBEAT HATASI] Aloha'ya ulaşılamadı. API çevrimdışı olabilir: ${e.message}`);
    }
}

// Daemon ilk açıldığında tetiği ver. Ardından periyodik devam et.
setTimeout(triggerAlohaHeartbeat, 5000); 
setInterval(triggerAlohaHeartbeat, HEARTBEAT_INTERVAL_MS);
