import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { adminDb } from "../../lib/firebase-admin";

// Rate limiting state for failed operations (Maliyet Sensörü)
const failureMap = new Map<string, number>();

/**
 * 🏛️ AIPyram Apex V9.0 - LOCAL NEXUS (Fiziksel Kol)
 * Buluttaki Master Node'dan gelen "Local Dosya Düzenleme" veya "Terminal İşleme" komutlarını 
 * Hakan'ın fiziksel makinesinde doğrudan çalıştıran otonom işçi (Worker).
 */

export class LocalNexusWorker {
  private static isRunning = false;
  private static pollInterval = 3000; // Agresif Hız: 3 Saniye
  private static lastHeartbeat = 0;

  static async startPulse() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log("=========================================================");
    console.log("[🦾 APEX V9.3] LOCAL NEXUS BAŞLATILDI - SİLAH DEVREDE");
    console.log(`[📡 HEDEF] CWD: ${process.cwd()}`);
    console.log("=========================================================");

    // [V9.4 ARMOR UYANIŞ RUTİNİ]: Çakışma Önleyici Stash & Pull
    console.log("[🛡️ ZIRH] Bulut hafızası (Git) kontrol ediliyor, Local Stash işlemi başlatıldı...");
    try {
        // 1. Seni yedekle (Cebine at)
        exec("git stash", { cwd: process.cwd() }, (errStash) => {
             if (errStash && !errStash.message.includes("No local changes to save")) {
                 console.log(`[⚠️ ZIRH UYARI] Stash başarısız: ${errStash.message}`);
             }
             
             // 2. Geceyi İndir
             exec("git pull origin main", { cwd: process.cwd() }, (errPull, stdoutPull) => {
                 if (errPull) {
                     console.log(`[⚠️ ZIRH UYARI] Git pull tamamlanamadı: ${errPull.message}`);
                 } else {
                     const output = (stdoutPull as any).toString().trim();
                     if (output === "Already up to date." || output === "Eşzamanlı.") {
                         console.log("[🌅 UYANIŞ RUTİNİ] Gece Aloha kod değiştirmemiş. %100 günceliz.");
                     } else {
                         console.log("[🌅 UYANIŞ RUTİNİ] ⚠️ DİKKAT! Gece Aloha Bulutta Kod Yazdı! Değişenler:\n" + output);
                     }
                 }

                 // 3. Seni masaya geri koy (Dikkatlice üstüne birleştir)
                 exec("git stash pop", { cwd: process.cwd() }, (errPop) => {
                     // Hata verebilir eğer stash boşsa (No stash entries found), o yüzden sessizce geçebiliriz.
                     if (errPop && errPop.message.includes("conflict")) {
                         console.log(`[🚨 ZIRH ALARMI] STASH POP SIRASINDA ÇAKIŞMA (CONFLICT)! Lütfen IDE üzerinden dosyaları kontrol edin.`);
                     }
                 });
             });
        });
    } catch(e) {
        // Sessizce geç
    }

    // İlk Sinyal
    await this.pingCloud("ONLINE");

    while (this.isRunning) {
      await this.pollLocalActionQueue();
      
      await new Promise(r => setTimeout(r, this.pollInterval));

      // 60 sn'de bir Buluta "Yaşıyorum" pingi atar
      if (Date.now() - this.lastHeartbeat > 60000) {
          this.lastHeartbeat = Date.now();
          await this.pingCloud("AWAITING_ORDERS");
      }
    }
  }

  private static async pingCloud(status: string) {
      const pcName = os.hostname();
      console.log(`[💓 NEXUS HEARTBEAT] Durum: ${status} | Makine: ${pcName}`);
      try {
        await adminDb.collection('nexus_heartbeat').doc('current').set({ status, pcName, timestamp: Date.now() });
      } catch (err) {
        console.error("Heartbeat error:", err);
      }
  }

  private static async pollLocalActionQueue() {
      try {
          // LPoP mantığını Firestore üzerinden Transaction ile yapıyoruz
          const job: any = await adminDb.runTransaction(async (transaction) => {
              const querySnap = await transaction.get(
                  adminDb.collection('nexus_task_queue')
                  .where('status', '==', 'PENDING')
                  .orderBy('createdAt')
                  .limit(1)
              );

              if (querySnap.empty) {
                  return null;
              }

              const doc = querySnap.docs[0];
              const data = doc.data();
              // "LOCKED" (Kilitli) yapıp çekiyoruz
              transaction.update(doc.ref, { status: "LOCKED" });

              return { id: doc.id, ...data } as any;
          });

          if (!job) return;

          const jobId = job.id;
          console.log(`[⚠️ NEXUS İNFAZ EMRİ] Görev Yakalandı: ${job.type} | JobID: ${jobId}`);

          try {
              if (job.type === "SHELL_COMMAND") {
                  await this.executeShell(job.payload?.command || "", jobId);
              } else if (job.type === "FILE_EDIT") {
                  await this.executeFileEdit(job.payload?.filePath || "", job.payload?.content || "", jobId);
              } else if (job.type === "DELETE_FILE") {
                  await this.executeFileDelete(job.payload?.filePath || "", jobId);
              } else {
                  console.warn(`[❌ NEXUS] Bilinmeyen Emir Tipi: ${job.type}`);
              }
          } catch (execErr) {
              console.error("[❌ NEXUS FATAL İŞLEME HATA]:", execErr);
          }
      } catch (err) {
          console.error("[❌ NEXUS FATAL HATA] Kuyruk Taraması Çöktü:", err);
      }
  }

  private static async executeShell(command: string, jobId: string) {
      console.log(`[🚀 NEXUS SHELL] Koşturuluyor: ${command}`);
      
      return new Promise((resolve) => {
          exec(command, { cwd: process.cwd() }, async (error, stdout, stderr) => {
              if (error) {
                  console.error(`[🚨 NEXUS SHELL HATA] ${stderr || error.message}`);
                  await this.markJobDone(jobId, "FAILED", stderr || error.message);
                  resolve(false);
              } else {
                  console.log(`[✅ NEXUS SHELL BAŞARILI]\n${stdout}`);
                  await this.markJobDone(jobId, "COMPLETED", stdout);
                  resolve(true);
              }
          });
      });
  }

  private static async executeFileEdit(targetPath: string, content: string, jobId: string) {
      console.log(`[🚀 NEXUS FILE EDIT] Sızılıyor: ${targetPath}`);
      try {
          const absolutePath = path.resolve(process.cwd(), path.normalize(targetPath));
          if (!absolutePath.startsWith(process.cwd())) {
              throw new Error("LFI Engellendi: CWD dışına çıkılamaz.");
          }
          const dir = path.dirname(absolutePath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

          fs.writeFileSync(absolutePath, content, "utf8");
          console.log(`[✅ NEXUS FILE MÜHÜRLENDİ] ${absolutePath}`);
          await this.markJobDone(jobId, "COMPLETED", "File edited successfully.");
          failureMap.delete(targetPath); // Reset on success
      } catch (err: any) {
          console.error(`[🚨 NEXUS FILE HATA] ${err.message}`);
          
          // [V9.4 KILL-SWITCH]: Maliyet Sensörü
          const fails = (failureMap.get(targetPath) || 0) + 1;
          failureMap.set(targetPath, fails);
          
          if (fails >= 3) {
             console.error(`[🛑 KILL-SWITCH AKTİF] Dosya ${targetPath} üst üste ${fails} kez patladı. Sistem deli gömleği giydirip askıya aldı! (Maliyet Sensörü)`);
             await this.markJobDone(jobId, "SUSPENDED", `Sonsuz döngü engellendi. Hedef kalıcı hasarlı: ${err.message}`);
          } else {
             await this.markJobDone(jobId, "FAILED", err.message);
          }
      }
  }

  private static async executeFileDelete(targetPath: string, jobId: string) {
     console.log(`[🚀 NEXUS FILE DELETE] Yok ediliyor: ${targetPath}`);
      try {
          const absolutePath = path.resolve(process.cwd(), targetPath);
          if (fs.existsSync(absolutePath)) {
             fs.unlinkSync(absolutePath);
             console.log(`[✅ NEXUS FILE SİLİNDİ] ${absolutePath}`);
             await this.markJobDone(jobId, "COMPLETED", "File deleted successfully.");
          } else {
             await this.markJobDone(jobId, "SKIPPED", "File did not exist, nothing to delete.");
          }
      } catch (err: any) {
          console.error(`[🚨 NEXUS FILE HATA] ${err.message}`);
          await this.markJobDone(jobId, "FAILED", err.message);
      }
  }

  private static async markJobDone(jobId: string, status: "COMPLETED" | "FAILED" | "SKIPPED" | "SUSPENDED", log: string) {
      try {
          await adminDb.collection('nexus_task_queue').doc(jobId).update({ 
              status, 
              log, 
              completedAt: new Date().toISOString() 
          });
      } catch (err) {
          console.error("[❌ NEXUS MARK JOB HATA]", err);
      }
  }

  static stopPulse() {
     this.isRunning = false;
     console.log("[⚙️ NEXUS] Yerel Kol Kapatıldı.");
     this.pingCloud("OFFLINE");
  }
}

if (require.main === module) {
  LocalNexusWorker.startPulse();
}
