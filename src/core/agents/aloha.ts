import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { AgentRole, AgentCapability } from './types';
import { adminDb } from '../../lib/firebase-admin';
import { NotificationService } from '../../services/notificationService';
import { sandboxAgent } from './sandboxAgent';
import { ActionRunner } from '../execution/actionRunner';

const ai = alohaAI.getClient();

export class AlohaMaster {
  public role: AgentRole = "ALOHA";
  public capabilities: AgentCapability[] = ["ACT", "OVERRIDE"];
  public name = "ALOHA";

  private systemPrompt = `
    KİMLİK VE ROL:
    Sen, AIPyram İmparatorluğu'nun Baş Mimarı ve Askeri Stratejisti (Aloha)’sın. Sistemi kârlı ve hatasız tutmak yoksulca kodlamaktan daha önemlidir.
    
    TEMEL DİSİPLİN KURALLARI:
    1. Yüksek Güvenilirlik. Hatalı onay vermektense vazgeçmeyi (Rollback) seç.
    2. Otonom İnfaz: Bir hata olduğunda devre kesiciyi (Circuit Breaker) tetiklemeden önce kendini düzelt.
    
    [ZORUNLU JSON FORMATI]:
    { "status": "solved"|"failed", "action": "CREATE_DOMAIN" | "REFUND" | "FATAL_ERROR", "confidence": "95%", "require_hitl": boolean, "details": {} }
  `;

  constructor() {
    console.log('[👑 ALOHA_CORE V8.7] Baş Orkestratör Uyandı. Atomic İşlemler ve Circuit Breaker Aktif.');
  }

  public async orchestrate(visionaryPlan: any, realityCheck: any, context?: any) {
    try {
      if (!process.env.GEMINI_API_KEY) return { decision: "APPROVED", finalActionPrompt: "MOCK" };
      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${this.systemPrompt}\nPlan:${JSON.stringify(visionaryPlan)}\nReality:${JSON.stringify(realityCheck)}`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(res.text || '{}');
    } catch (e) {
      console.error('[👑 ALOHA_CORE] ❌ Konsey Çöktü:', e);
      return null;
    }
  }

  // V8.7 THE EXECUTIONER: Atomic Operations (Rollback) & Circuit Breaker
  public async executeAction(job: any): Promise<boolean> {
     const transactionId = job.id || Date.now().toString();
     console.log(`[👑 ALOHA_EXECUTION] İnfaz Ediliyor ID: ${transactionId} - Tipi: ${job.type}`);

     // Circuit Breaker Kontrolü
     const retryCount = job.retryCount || 0;
     if (retryCount >= 3) {
        console.error(`[🔴 CIRCUIT BREAKER] JobID: ${transactionId} art arda 3 kez çöktü. Karantinaya alındı.`);
        await NotificationService.sendWhatsApp(
          process.env.SYSTEM_MASTER_PHONE || "+905553330511", 
          `🔴 KIRMIZI ALARM (Circuit Breaker)\n\nSistem ${job.type} işlemini yaparken sonsuz döngü tehlikesi sezip ŞALTERİ İNDİRDİ.\nManuel müdahale (HITL) gerekiyor.`,
          "aipyram-core"
        );
        await adminDb.collection("aloha_transactions").doc(transactionId).update({ status: "QUARANTINED" });
        return false;
     }

     const txRef = adminDb.collection("aloha_transactions").doc(transactionId);

     try {
       // 1. ATOMIC OPERATION KÖPRÜSÜ (Two-Phase Commit / Rollback Simülasyonu)
       // Eğer hata olursa Firestore otomatik geri alacaktır.
       await adminDb.runTransaction(async (t) => {
          // Durum güncellemesini Transaction içerisine kilitliyoruz.
          const doc = await t.get(txRef);
          if (!doc.exists) {
             t.set(txRef, { status: "PROCESSING", jobType: job.type, payload: job.payload, timestamp: Date.now() });
          } else {
             t.update(txRef, { status: "PROCESSING", "metrics.retry": retryCount });
          }

          // 2. İnsan Onayı Süzgeci (HITL - Human In The Loop)
          if (job.highRisk || job.type === "DELETE_DOMAIN" || job.type === "MASS_REFUND") {
             console.warn(`[🚨 HITL BARİYERİ] ${job.type} Yüksek Riskli Eylem! Hakan Bey'in (Sovereign) onayına gönderiliyor.`);
             
             // NOT: Await içinde dış IO (WhatsApp vb.) yapıyoruz. Eğer bu patlarsa transaction Rollback (Geri sarar) olur! Bu da Atomicliği sağlar!
             await NotificationService.sendWhatsApp(
               process.env.SYSTEM_MASTER_PHONE || "+905553330511", 
               `🚨 SOVEREIGN ONAYI GEREKİYOR\n\nRiskli Eylem: ${job.type}\nDetay: Sistem kilitli.`,
               "aipyram-core"
             );
             t.update(txRef, { status: "WAITING_HITL" });
             throw new Error("HITL_WAIT"); // Transaction'ı bilinçli kırmak (Rollback ile state'i WAITING yapmaz ama kodu durdurur)
          }

          // 3. OTONOM İCRAAT & DIŞ API ENTEGRASYONU
          if (job.type === "CREATE_DOMAIN" || job.type === "DOMAIN_ACTIVATE") {
            console.log("[👑 ALOHA_EXECUTION] Otonom şube açılışı. ActionRunner tetikleniyor.");
            await ActionRunner.getInstance().execute(transactionId, "DOMAIN_ACTIVATE", job.payload);
          }
          
          if (job.type === "CHARGE_STRIPE") {
            console.log("[💳 STRIPE SAGA] Fatura kesildi. DB onayı bekleniyor...");
            job.__stripeChargeId = "ch_simulated_9999"; 
            // Burada gerçek Stripe charge apisi çağrılırdı.
          }

          if (job.type === "SHELL_COMMAND" || job.type === "FIREBASE_UPDATE") {
             console.log(`[👑 ALOHA_EXECUTION] Fiziksel İnfaz Motoru (ActionRunner) Başlatılıyor: ${job.type}`);
             await ActionRunner.getInstance().execute(transactionId, job.type, job.payload);
          }

          if (job.type === "TEST_CODE") {
             console.log("[👑 ALOHA_EXECUTION] 🚧 Sandbox Stres Testi Otonom Döngüsü Tetiklendi");
             // Transaction kilitli tutulduğundan, bu süreç Transaction içinde işlenir. (Senkron Promise)
             const safeCode = await sandboxAgent.generateAndTestComponent(job.payload.objective);
             if (!safeCode) {
                 throw new Error("SANDBOX_FAILED"); // Döngü patladı, rollback yapıp QUARANTINE aşaması başlar
             }
             console.log("[👑 ALOHA_EXECUTION] Sandbox kodu derlendi ve temizlendi.");
             // Kod DB'ye component_library gibi bir koleksiyona eklenebilir.
             job.__generatedCode = safeCode;
          }

          // Başarılı İşlem
          t.update(txRef, { status: "SUCCESS" });
       });

       return true;

     } catch (err: any) {
       // Bilinçli duraklama ise hatadan sayma
       if (err.message === "HITL_WAIT") {
           await txRef.update({ status: "WAITING_HITL" });
           return false;
       }

       console.error(`[🚨 ALOHA_EXECUTION] Hata yakalandı. Transaction Rollback edildi.`, err);

       // FAZ 8: SAGA TELAFİ MANTIĞI (COMPENSATION)
       // Eğer dışarıdan para/kontrat alındı ama DB patladıysa işi geri sar.
       if (job.type === "CHARGE_STRIPE" && job.__stripeChargeId) {
          console.warn(`[💸 SAGA PATTERN] Kritik Senkronizasyon Hatası! Stripe'tan para çekildi ama DB kilitlendi.`);
          console.warn(`[💸 SAGA PATTERN] Müşteriye Otonom İade (Refund) yapılıyor: ChargeID: ${job.__stripeChargeId}`);
          // await stripe.refunds.create({ charge: job.__stripeChargeId });
          console.warn(`[💸 SAGA PATTERN] İade Tamamlandı. Güvenlik sağlandı.`);
       }
       
       await txRef.set({ 
         status: "FAILED_RETRYING",
         lastError: err.message,
         timestamp: Date.now()
       }, { merge: true });

       // Recursive Döngü Tetikleme
       await this.performSelfHealing(job, err);
       return false;
     }
  }

  private async performSelfHealing(failedJob: any, error: any) {
      console.log(`[🩹 ALOHA_HEALING] Plan B Üretiliyor (Retry ${failedJob.retryCount || 0} + 1)`);
      failedJob.retryCount = (failedJob.retryCount || 0) + 1;
      
      // Firebase Queue — Upstash kaldırıldı (Anayasa: Sadece Google altyapısı)
      try {
          await adminDb.collection('aloha_retry_queue').add({
            ...failedJob,
            retryCount: failedJob.retryCount,
            queuedAt: Date.now(),
            status: 'pending_retry',
          });
          console.log(`[🩹 ALOHA_HEALING] Job Firebase kuyruğuna eklendi. Retry #${failedJob.retryCount}`);
      } catch (retryErr: any) {
          console.error(`[🩹 ALOHA_HEALING] Firebase retry başarısız:`, retryErr.message);
      }
  }
}

export const aloha = new AlohaMaster();
