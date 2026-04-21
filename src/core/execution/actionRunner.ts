import { exec } from 'child_process';
import { adminDb } from '../../lib/firebase-admin';
import { EventBus } from '../events/eventBus';
import * as fs from 'fs';
import * as path from 'path';

/**
 * ACTION RUNNER v2.0 (THE REAL EXECUTION ENGINE)
 * 
 * ÖNCEKİ SORUNLAR:
 * 1. CWD = .sandbox_tmp → Gerçek komutlar çalışamıyordu
 * 2. Sadece echo komutları geliyordu (chat/route.ts'ten)
 * 
 * FIX:
 * 1. CWD = process.cwd() (proje kökü) + komut whitelist koruması
 * 2. chat/route.ts gerçek komutlar gönderiyor artık
 */

// Güvenli komut whitelist'i
const ALLOWED_COMMAND_PREFIXES = [
  'echo ',
  'git status', 'git log', 'git diff', 'git branch', 'git stash',
  'pnpm run build', 'pnpm run dev', 'pnpm run lint', 'pnpm install',
  'npm run build', 'npm run dev', 'npm run lint', 'npm install',
  'npx tsc', 'npx next', 'npx firebase',
  'firebase deploy', 'firebase projects:list', 'firebase hosting',
  'node --version', 'node -e ', 'node scripts/', 'pnpm --version',
  'dir ', 'ls ', 'cat ', 'type ',
  'find ', 'grep ',
];

// Kesinlikle YASAK komutlar (bu override whitelist'i)
const BLOCKED_PATTERNS = [
  'rm -rf /',
  'del /s /q c:\\',
  'format ',
  'shutdown',
  'reboot',
  'mkfs',
  ':(){', // fork bomb
  'dd if=',
];

function isCommandSafe(command: string): { safe: boolean; reason?: string } {
  const trimmed = command.trim().toLowerCase();

  // Blok kontrolü
  for (const blocked of BLOCKED_PATTERNS) {
    if (trimmed.includes(blocked)) {
      return { safe: false, reason: `BLOCKED: '${blocked}' tespit edildi. Sistem korunuyor.` };
    }
  }

  // Whitelist kontrolü
  const isWhitelisted = ALLOWED_COMMAND_PREFIXES.some(prefix =>
    trimmed.startsWith(prefix.toLowerCase())
  );

  if (!isWhitelisted) {
    return { safe: false, reason: `WHITELIST: '${command.substring(0, 50)}...' güvenli listede yok.` };
  }

  return { safe: true };
}

export class ActionRunner {
  private static instance: ActionRunner;

  private constructor() {}

  public static getInstance(): ActionRunner {
    if (!ActionRunner.instance) {
      ActionRunner.instance = new ActionRunner();
    }
    return ActionRunner.instance;
  }

  /**
   * Aloha'nın kararını fiziksel komuta dönüştürür
   */
  async execute(taskId: string, actionType: string, payload: any): Promise<string | undefined> {
    console.log(`[🚀 EXECUTIONER v2.0] ActionRunner Ateşlendi: Tip=${actionType} | Task=${taskId}`);

    try {
      switch (actionType) {
        case 'SHELL_COMMAND':
          return await this.runShellCommand(taskId, payload.command);

        case 'FIREBASE_UPDATE':
          return await this.updateFirestore(taskId, payload);

        case 'DOMAIN_ACTIVATE':
          return await this.activateDomain(taskId, payload.domain);

        case 'GCS_FILE_WRITE':
          return await this.writeToCloudStorage(taskId, payload.filePath, payload.content);

        default:
          throw new Error(`Bilinmeyen Otonom Eylem Tipi: ${actionType}`);
      }
    } catch (error: any) {
      await this.reportError(taskId, error);
      return `[HATA] ${error.message}`;
    }
  }

  private async runShellCommand(taskId: string, command: string): Promise<string> {
    // Güvenlik kontrolü
    const safety = isCommandSafe(command);
    if (!safety.safe) {
      const msg = `[🛡️ GÜVENLİK DUVARI] Komut engellendi: ${safety.reason}`;
      console.warn(msg);
      await this.reportError(taskId, new Error(msg));
      return msg;
    }

    const isCloudMode = process.env.FORCE_CLOUD_WORKER === 'true' || process.env.VERCEL === '1';

    if (isCloudMode) {
      console.log(`[☁️ CLOUD QUEUE] Görev Firestore'a gönderiliyor... Task: ${taskId}`);
      
      return new Promise(async (resolve) => {
        try {
          const jobRef = await adminDb.collection("aloha_jobs").add({
            taskId,
            actionType: 'SHELL_COMMAND',
            payload: { command },
            status: 'queued',
            createdAt: Date.now(),
          });

          console.log(`[☁️ CLOUD QUEUE] Job yazıldı: ${jobRef.id}. Yanıt bekleniyor (Mak: 30sn)...`);

          let unsubscribe: any = null;
          let timeoutId: any = null;

          const cleanup = () => {
            if (unsubscribe) unsubscribe();
            if (timeoutId) clearTimeout(timeoutId);
          };

          // 30 saniye timeout (Vercel limitlerinden korunmak için, Vercel default Timeout: 10-60sn)
          timeoutId = setTimeout(() => {
            cleanup();
            resolve(`[OTONOM-ASYNC] Görev kuyruğa eklendi. İşlem uzun sürebileceğinden Arka Planda (Cloud Worker) devam ediyor. İşlem tamamlandığında sistem bilgilendirilecek.\nJob ID: ${jobRef.id}`);
          }, 30000);

          unsubscribe = jobRef.onSnapshot((snap) => {
            if (snap.exists) {
              const data = snap.data();
              if (data?.status === 'completed') {
                cleanup();
                resolve(data.result || "İşlem başarıyla tamamlandı.");
              } else if (data?.status === 'failed') {
                cleanup();
                resolve(`[HATA (WORKER)] ${data.error || "Bilinmeyen hata"}`);
              }
            }
          });

        } catch (e: any) {
          resolve(`[☁️ CLOUD QUEUE HATA] Firestore'a yazılamadı: ${e.message}`);
        }
      });
    }

    // ────────────────────────────────────────────────────────────
    // LOCAL EXECUTION (Eski Mantık) - Kendi bilgisayarımız
    // ────────────────────────────────────────────────────────────
    return new Promise((resolve, reject) => {
      // v2.0: CWD = proje kökü (.sandbox_tmp DEĞİL!)
      const projectRoot = process.cwd();

      console.log(`[🚀 EXECUTIONER v2.0] Shell Çalıştırılıyor: "${command}"`);
      console.log(`[🚀 EXECUTIONER v2.0] CWD: ${projectRoot}`);

      exec(command, { 
        cwd: projectRoot,
        timeout: 60000, // 60 saniye timeout (runaway koruması)
        maxBuffer: 1024 * 1024 * 5, // 5MB output buffer
      }, async (error, stdout, stderr) => {
        if (error) {
          const errMsg = stderr || error.message;
          console.error(`[❌ EXECUTIONER HATA] ${errMsg}`);
          // Hata olsa bile çıktıyı döndür (stderr bilgi taşıyabilir)
          const result = `[HATA] ${errMsg}\n${stdout || ""}`.trim();
          await this.markAsDone(taskId, result);
          resolve(result);
          return;
        }

        const result = stdout.trim();
        console.log(`[✅ EXECUTIONER BAŞARILI] Çıktı uzunluğu: ${result.length} karakter`);
        await this.markAsDone(taskId, result);
        resolve(result);
      });
    });
  }

  private async updateFirestore(taskId: string, payload: any): Promise<string> {
    if (!payload.collection || !payload.docId || !payload.data) {
      throw new Error("Geçersiz Firebase Döküman Formatı");
    }
    await adminDb.collection(payload.collection).doc(payload.docId).set(payload.data, { merge: true });
    const msg = `DB Update Successful: ${payload.collection}/${payload.docId}`;
    console.log(`[🚀 EXECUTIONER] ${msg}`);
    await this.markAsDone(taskId, msg);
    return msg;
  }

  private async writeToCloudStorage(taskId: string, filePath: string, content: string): Promise<string> {
    try {
      console.log(`[🚀 GCS UPLOAD] Dosya Yükleniyor: ${filePath}`);
      const { getStorage } = require('firebase-admin/storage');
      const bucket = getStorage().bucket();

      const file = bucket.file(filePath);
      await file.save(content, {
        metadata: { contentType: filePath.endsWith('.html') ? 'text/html' : 'text/plain' }
      });

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      console.log(`[✅ GCS UPLOAD] URL: ${publicUrl}`);
      await this.markAsDone(taskId, `UPLOAD_SUCCESS: ${publicUrl}`);
      return publicUrl;
    } catch (e: any) {
      console.error(`[🚨 GCS ERROR]`, e);
      throw e;
    }
  }

  private async activateDomain(taskId: string, domain: string): Promise<string> {
    // TODO: Gerçek gcloud komutları eklenecek
    const msg = `[DOMAIN] ${domain} aktivasyonu için gcloud komutları çalıştırılacak (henüz aktif değil).`;
    console.log(`[🚀 EXECUTIONER] ${msg}`);
    await this.markAsDone(taskId, msg);
    return msg;
  }

  private async markAsDone(taskId: string, output: string) {
    await adminDb.collection('action_queue').doc(taskId).update({
      status: 'COMPLETED',
      completedAt: Date.now(),
      result: output.substring(0, 5000) // Firestore 1MB limit koruması
    }).catch(() => {}); // Firestore yoksa sessizce geç

    EventBus.emit({ type: "TASK_FINISHED", source: "ACTION_RUNNER", payload: { taskId, output: output.substring(0, 1000) } });
  }

  private async reportError(taskId: string, error: any) {
    await adminDb.collection('action_queue').doc(taskId).update({
      status: 'FAILED',
      error: error.message || error
    }).catch(() => {});

    EventBus.emit({ type: "TASK_FAILED", source: "ACTION_RUNNER", payload: { taskId, error: error.message } });
  }
}
