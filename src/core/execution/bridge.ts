import * as path from 'path';
import { admin } from '../../lib/firebase-admin';
import { CloudExecutor } from './cloudExecutor';

// ═══════════════════════════════════════════════════
// GOOGLE-NATIVE: Upstash Redis → Firestore
// Anayasa: Sadece Google altyapısı.
// ═══════════════════════════════════════════════════

export class ExecutionBridge {
  /**
   * Belirtilen projeye (Trtex/Firebase) sızıp dosya günceller
   */
  async injectCode(projectId: string, filePath: string, newContent: string) {
    console.log(`[🚀 İNFAZ] ${projectId} projesine sızılıyor: ${filePath}`);
    
    // 1. Durum Kontrolü (Nexus Heartbeat — Firestore'dan oku)
    let isPcOnline = false;
    try {
      const { adminDb } = await import("@/lib/firebase-admin");
      const hbDoc = await adminDb.collection("system_state").doc("nexus_heartbeat").get();
      if (hbDoc.exists) {
        const hb = hbDoc.data();
        if (hb?.timestamp && Date.now() - hb.timestamp < 120000) {
          isPcOnline = true; // PC son 2 dk içinde sinyal verdi
        }
      }
    } catch (e) {
      // Firestore okunamazsa offline varsay
    }

    if (!isPcOnline) {
       console.log(`[🌩️ OTONOMİYİ KORUMA] PC Offline. Ascension Protocol (Cloud Strike) tetikleniyor!`);
       await CloudExecutor.executeGhostStrike(path.join(projectId, filePath), newContent);
       return;
    }

    // 2. Local İnfaz Emri (Firestore kuyruğuna ekle — PC'nin alması için)
    console.log(`[🚀 İNFAZ] Hakan'ın PC'sine emir gönderiliyor: ${filePath}`);
    
    try {
      const { adminDb } = await import("@/lib/firebase-admin");
      await adminDb.collection("action_queue").add({
        id: Date.now().toString(),
        type: "FILE_EDIT",
        payload: { filePath: path.join(projectId, filePath), content: newContent },
        status: "pending",
        createdAt: Date.now(),
      });
    } catch (e) {
      console.error('[ExecutionBridge] Firestore kuyruğuna yazılamadı:', e);
    }
  }

  async triggerCloudDeploy(projectId: string) {
    console.log(`[🌩️ OTONOM DEPLOY] ${projectId} için GCP/Firebase deploy zinciri tetikleniyor...`);
    
    let isPcOnline = false;
    try {
      const { adminDb } = await import("@/lib/firebase-admin");
      const hbDoc = await adminDb.collection("system_state").doc("nexus_heartbeat").get();
      if (hbDoc.exists) {
        const hb = hbDoc.data();
        if (hb?.timestamp && Date.now() - hb.timestamp < 120000) isPcOnline = true;
      }
    } catch (e) {}

    if (!isPcOnline) {
        console.log(`[🌩️ GHOST STRIKE DEPLOY] PC kapalı. Deploy bulutta gerçekleşecek.`);
        return;
    }

    try {
      const { adminDb } = await import("@/lib/firebase-admin");
      await adminDb.collection("action_queue").add({
        id: Date.now().toString(),
        type: "SHELL_COMMAND",
        payload: { command: `pnpm run build && firebase deploy` },
        status: "pending",
        createdAt: Date.now(),
      });
    } catch (e) {
      console.error('[ExecutionBridge] Deploy komutu kuyruğa eklenemedi:', e);
    }
  }
}
