// ═══════════════════════════════════════════════════
// GOOGLE-NATIVE: Upstash Redis → Firestore
// Anayasa: Sadece Google altyapısı.
// ═══════════════════════════════════════════════════

import { aloha } from "../agents/aloha";
import * as os from "os";
import * as http from "http";

/**
 * V8.7 THE HARDENED DAEMON (Production Worker - Google-Native)
 * Özellikler: Heartbeat v2 (RAM/CPU/Queue Telemetrisi), 
 * Distributed Lock (Firestore) ve Kesintisiz İşletim Döngüsü.
 */

async function getFirestoreDb() {
  const { adminDb } = await import("@/lib/firebase-admin");
  return adminDb;
}

export class WorkerDaemon {
  private static isRunning = false;
  private static pollInterval = 5000;
  private static lastHeartbeat = 0;

  static async startPulse() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("[⚙️ DAEMON V10.0] Google-Native Worker Çanları Çalıyor.");

    // Google Cloud Run İlk Nabız Protokolü (HEALTH_CHECK & Port Listen)
    const port = process.env.PORT || 8080;
    http.createServer((req, res) => {
      if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'Sovereign Node Online', timestamp: Date.now() }));
      } else {
        res.writeHead(404);
        res.end();
      }
    }).listen(port, () => {
      console.log(`[🚀 GCP HEALTH_CHECK] Cloud Run Port ${port} üzerinden Mühürlendi.`);
    });

    while (this.isRunning) {
      await this.pollActionQueue();
      await new Promise((resolve) => setTimeout(resolve, this.pollInterval));

      // 🚨 HEARTBEAT v2 SİNYALİ (Her 60 Saniyede Bir Tam Telemetri)
      if (Date.now() - this.lastHeartbeat > 60000) {
         this.lastHeartbeat = Date.now();
         
         let qLen = 0;
         try {
           const db = await getFirestoreDb();
           const pendingJobs = await db.collection("action_queue").where("status", "==", "pending").count().get();
           qLen = pendingJobs.data().count;
         } catch {}

         const totalMem = os.totalmem();
         const freeMem = os.freemem();
         const usedMemPercent = (((totalMem - freeMem) / totalMem) * 100).toFixed(2);
         const cpuLoad = os.loadavg()[0].toFixed(2);

         const telemetry = {
            timestamp: this.lastHeartbeat,
            queueLength: qLen,
            ramUsagePercent: usedMemPercent,
            cpuLoad: cpuLoad,
            status: "HEALTHY"
         };

         console.log(`[💓 HEARTBEAT v2] Yaşıyorum. RAM: %${usedMemPercent} | CPU: ${cpuLoad} | Kuyruk: ${qLen}`);
         
         try {
           const db = await getFirestoreDb();
           await db.collection("system_state").doc("daemon_heartbeat").set(telemetry);
         } catch {}
      }
    }
  }

  private static async pollActionQueue() {
    try {
      const db = await getFirestoreDb();
      
      // 1. KUYRUKTAN GÖREV ÇEKME (En eski pending job)
      const pendingSnap = await db.collection("action_queue")
        .where("status", "==", "pending")
        .orderBy("createdAt", "asc")
        .limit(1)
        .get();
      
      if (pendingSnap.empty) return;

      const jobDoc = pendingSnap.docs[0];
      const job = jobDoc.data();
      const jobId = job.id || jobDoc.id;

      console.log(`[⚙️ DAEMON] Yeni İş Emri Yakalandı. JobID: ${jobId}`);

      // 2. DAĞITILMIŞ KİLİT (Firestore transaction ile)
      const locked = await db.runTransaction(async (tx) => {
        const freshDoc = await tx.get(jobDoc.ref);
        if (freshDoc.data()?.status !== "pending") return false;
        tx.update(jobDoc.ref, { status: "processing", startedAt: Date.now() });
        return true;
      });
      
      if (!locked) {
        console.log(`[⚙️ DAEMON] Race Condition Engellendi! JobID: ${jobId} başka worker tarafından alındı.`);
        return;
      }

      // 3. İNFAZ
      try {
        console.log(`[⚙️ DAEMON] Aloha İnfaza Başlıyor... Görev: ${job.type}`);
        await aloha.executeAction(job);
        await jobDoc.ref.update({ status: "completed", completedAt: Date.now() });
        console.log(`[⚙️ DAEMON] Görev Tamamlandı. JobID: ${jobId}`);
      } catch (executionError) {
         console.error(`[🚨 DAEMON HATA] İş infazı çöktü.`);
         await jobDoc.ref.update({ status: "failed", error: String(executionError), failedAt: Date.now() });
      }

    } catch (err) {
      // Firestore yoksa sessizce geç
    }
  }

  static stopPulse() {
     this.isRunning = false;
     console.log("[⚙️ DAEMON] İşçi Motoru Kapatıldı.");
  }
}

if (require.main === module) {
  WorkerDaemon.startPulse();
}
