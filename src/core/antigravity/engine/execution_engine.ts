import * as fs from 'fs';
import * as path from 'path';
import { WorkerAgent } from '../agents/worker_agent';
import { ReviewerAgent, ValidationContext } from '../agents/reviewer_agent';
import { MasterAgent } from '../agents/master_agent';

/**
 * ANTI-GRAVITY: EXECUTION ENGINE
 * Sistemin Kalbi. Ajanların askeri nizamda "Task -> Worker -> Review -> Approve/Retry" 
 * zincirinden çıkmamasını sağlayan ana operasyon döngüsüdür.
 */
export class ExecutionEngine {
  private master: MasterAgent;
  private worker: WorkerAgent;
  private reviewer: ReviewerAgent;

  constructor() {
    this.master = new MasterAgent();
    this.worker = new WorkerAgent();
    this.reviewer = new ReviewerAgent();
  }

  private logFailure(task: string, reason: string, fix?: string) {
    const logPath = path.resolve(process.cwd(), 'src/core/antigravity/logs/agent_log.json');
    const logs = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, 'utf-8')) : [];
    logs.push({
      timestamp: new Date().toISOString(),
      task,
      status: "FAILED",
      reason,
      fix_suggested: fix || "No fix suggested."
    });
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  }

  public async runTask(taskId: string, description: string, payload: any): Promise<any> {
    console.log(`\n================================`);
    console.log(`🚀 [EXECUTION ENGINE] Yeni Görev: ${taskId}`);
    console.log(`================================`);

    // 1. Master Atama Yapar
    const selectedSkill = this.master.determineSkillNeeded(description);
    const targetContract = selectedSkill === 'skill_news_writer' ? 'contract_news' : undefined;

    // 2. RETRY LIMIT LOOP (Kural: Maksimum 3 deneme)
    const MAX_RETRIES = 3;
    let currentPayload = payload;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      console.log(`\n🔄 DÖNGÜ [${attempt}/${MAX_RETRIES}] başlatılıyor...`);

      try {
        // A. WORKER ÜRETİR (Yetenek dosyasına bakarak işi yapar)
        // Eğer önceki attempt'ten bir "fix" (düzeltme) önerisi geldiyse, worker'a bunu ilet
        if (currentPayload.reviewer_feedback) {
           console.log(`[Engine] Worker'a önceki hatanın çözümü iletiliyor: "${currentPayload.reviewer_feedback}"`);
        }
        
        const workerResult = await this.worker.executeTask(taskId, selectedSkill, currentPayload);

        // B. REVIEWER DENETLER (Çıktıyı Kontrat ile çarpıştırır)
        const context: ValidationContext = {
          taskId,
          skillUsed: selectedSkill,
          contractId: targetContract,
          workerOutput: workerResult
        };

        const review = await this.reviewer.verify(context);

        // C. KARAR (STATE MACHINE)
        if (review.status === 'COMPLETED') {
          console.log(`\n🎉 [ENGINE SUCCESS] Ajan çıktıları Reviewer Agent tarafından onaylandı. İşlem başarıyla bitirildi.`);
          return workerResult;
        } else if (review.status === 'RETRY') {
          console.log(`\n⚠️ [ENGINE RETRY] Reviewer Reddi Çıktı!`);
          console.log(`   Sebep: ${review.reason}`);
          console.log(`   Çözüm (Fix): ${review.fix}`);
          
          // Geri bildirim ile Worker için input güncelleniyor
          currentPayload = {
             ...currentPayload,
             reviewer_feedback: review.fix
          };
          // Döngü başa (sonraki attempt'e) dönecek
        } else if (review.status === 'FAILED') {
          console.log(`\n❌ [ENGINE FATAL] Reviewer doğrudan İPTAL kararı verdi.`);
          this.logFailure(taskId, review.reason || 'Bilinmeyen Ölümcül Hata', review.fix);
          return null;
        }

      } catch (e: any) {
         console.error(`❌ [ENGINE ERROR] Döngüde çökme meydana geldi:`, e.message);
      }
    }

    // 3. RETRY LIMIT AŞILDI
    console.error(`\n🚫 [ENGINE LIMIT REACHED] Görev 3 denemede de başarılı olamadı. Sistem Sonsuz Döngüyü kesti. Durum: FAILED.`);
    this.logFailure(taskId, "Retry Limit Exhausted (3/3 fail)");
    return null;
  }
}
