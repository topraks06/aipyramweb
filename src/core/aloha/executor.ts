/**
 * ALOHA PLAN EXECUTOR
 * 
 * Onaylanmış planları adım adım yürütür.
 * Her adım sonrası VERIFY yapar, başarısız olursa ADAPT eder.
 * Git backup ile güvenlik sigortası sağlar.
 * 
 * Akış: Plan → Git Backup → Step 1 → Verify → Step 2 → Verify → ... → Complete
 */

import { adminDb } from '@/lib/firebase-admin';
import { 
  StoredPlan, 
  PlanStep, 
  ExecutionPlan,
  verifyStepResult, 
  updatePlanStep, 
  generatePlan,
  submitPlanForApproval,
  formatPlanSummary
} from './planner';
import { executeToolCall } from './engine';
import { logAlohaAction } from './engine';
import { alohaMemory } from './memory';

// ═══════════════════════════════════════════════════
// GIT BACKUP SİSTEMİ
// ═══════════════════════════════════════════════════

/**
 * Step öncesi git backup oluşturur (lokal ortamda)
 */
async function createGitBackup(projectPath: string, stepId: number, planId: string): Promise<string | null> {
  const isCloudEnv = process.env.K_SERVICE || process.env.CLOUD_RUN_JOB;
  if (isCloudEnv) return null; // Cloud'da git yok
  
  try {
    const { execSync } = require('child_process');
    const fs = require('fs');
    
    // .git klasörü var mı kontrol
    const path = require('path');
    if (!fs.existsSync(path.join(projectPath, '.git'))) {
      return null; // Git repo değil
    }
    
    const tag = `aloha-plan-${planId.substring(0,8)}-step-${stepId}-${Date.now()}`;
    
    // Stage all changes
    execSync('git add -A', { cwd: projectPath, encoding: 'utf8', timeout: 10000 });
    
    // Commit
    execSync(`git commit -m "ALOHA_BEFORE_STEP_${stepId} [Plan: ${planId}]" --allow-empty`, {
      cwd: projectPath, encoding: 'utf8', timeout: 10000
    });
    
    // Tag
    execSync(`git tag ${tag}`, { cwd: projectPath, encoding: 'utf8', timeout: 5000 });
    
    return tag;
  } catch (e: any) {
    console.log(`[ALOHA GIT] Backup oluşturulamadı: ${e.message}`);
    return null;
  }
}

/**
 * Git rollback — başarısız step'ten önceki duruma döner
 */
async function gitRollback(projectPath: string, tag: string): Promise<boolean> {
  const isCloudEnv = process.env.K_SERVICE || process.env.CLOUD_RUN_JOB;
  if (isCloudEnv) return false;
  
  try {
    const { execSync } = require('child_process');
    execSync(`git reset --hard ${tag}`, { cwd: projectPath, encoding: 'utf8', timeout: 10000 });
    return true;
  } catch (e: any) {
    console.log(`[ALOHA GIT] Rollback başarısız: ${e.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════
// PLAN EXECUTOR CORE
// ═══════════════════════════════════════════════════

export interface ExecutionResult {
  planId: string;
  status: 'completed' | 'failed' | 'aborted' | 'adapted';
  completedSteps: number;
  totalSteps: number;
  failedStep?: number;
  failReason?: string;
  adaptedPlanId?: string; // Eğer ADAPT olduysa yeni plan ID
  log: Array<{
    step: number;
    title: string;
    status: string;
    result: string;
    duration: number;
    gitTag?: string;
  }>;
}

/**
 * Onaylanmış planı adım adım yürütür.
 * Her adım sonrası verification yapar.
 * Başarısız olursa ADAPT mekanizması devreye girer.
 */
export async function executePlan(
  planId: string, 
  onStepComplete?: (step: number, total: number, result: string) => void
): Promise<ExecutionResult> {
  // 1. Planı Firebase'den oku
  const doc = await adminDb.collection('aloha_plans').doc(planId).get();
  if (!doc.exists) {
    throw new Error(`Plan bulunamadı: ${planId}`);
  }
  
  const storedPlan = doc.data() as StoredPlan;
  
  if (storedPlan.status !== 'approved') {
    throw new Error(`Plan henüz onaylanmadı. Durum: ${storedPlan.status}`);
  }
  
  const plan = storedPlan.plan;
  const log: ExecutionResult['log'] = [];
  
  // Planı "executing" olarak işaretle
  await adminDb.collection('aloha_plans').doc(planId).update({
    status: 'executing',
    started_at: new Date().toISOString(),
  });
  
  logAlohaAction('PLAN_EXECUTION_START', { planId, goal: plan.goal, steps: plan.plan.length });
  
  // 2. Step-by-step yürütme
  for (let i = 0; i < plan.plan.length; i++) {
    const step = plan.plan[i];
    const stepStart = Date.now();
    
    // Dependency kontrolü — bağımlı step'ler başarılı mı?
    if (step.depends_on && step.depends_on.length > 0) {
      const depsFailed = step.depends_on.some(depIdx => {
        const depStep = plan.plan[depIdx - 1];
        return depStep && depStep.status === 'failed';
      });
      if (depsFailed) {
        step.status = 'skipped';
        await updatePlanStep(planId, i, 'skipped', 'Bağımlı adım başarısız — atlandı');
        log.push({
          step: step.step,
          title: step.title,
          status: 'skipped',
          result: 'Bağımlı adım başarısız — atlandı',
          duration: 0,
        });
        continue;
      }
    }
    
    // Git backup (yüksek riskli adımlar için)
    let gitTag: string | null = null;
    if (step.risk_level === 'high' || step.risk_level === 'medium') {
      const projectPath = step.tool_args?.projectPath || step.tool_args?.filePath?.split('/src/')[0];
      if (projectPath) {
        gitTag = await createGitBackup(projectPath, step.step, planId);
      }
    }
    
    // Step'i "running" olarak işaretle
    step.status = 'running';
    step.started_at = new Date().toISOString();
    
    try {
      // 3. Tool çağrısı yap
      const toolResult = await executeToolCall({ name: step.tool, args: step.tool_args });
      const duration = Date.now() - stepStart;
      
      // 4. VERIFY — sonuç beklentiyle uyuşuyor mu?
      const verification = verifyStepResult(step, toolResult);
      
      if (verification.passed) {
        // ✅ Başarılı
        step.status = 'success';
        step.result = toolResult;
        await updatePlanStep(planId, i, 'success', toolResult);
        
        log.push({
          step: step.step,
          title: step.title,
          status: 'success',
          result: toolResult.substring(0, 300),
          duration,
          ...(gitTag ? { gitTag } : {}),
        });
        
        logAlohaAction('PLAN_STEP_SUCCESS', { planId, step: step.step, title: step.title, duration });
        
      } else {
        // ❌ Verification başarısız
        step.status = 'failed';
        step.result = `VERIFICATION FAILED: ${verification.reason}\n\nTool Result: ${toolResult}`;
        await updatePlanStep(planId, i, 'failed', step.result);
        
        log.push({
          step: step.step,
          title: step.title,
          status: 'failed',
          result: `❌ ${verification.reason}`,
          duration,
          ...(gitTag ? { gitTag } : {}),
        });
        
        logAlohaAction('PLAN_STEP_FAILED', { planId, step: step.step, reason: verification.reason });
        
        // Git rollback
        if (gitTag) {
          const projectPath = step.tool_args?.projectPath || step.tool_args?.filePath?.split('/src/')[0];
          if (projectPath) {
            const rolled = await gitRollback(projectPath, gitTag);
            if (rolled) logAlohaAction('GIT_ROLLBACK', { planId, step: step.step, tag: gitTag });
          }
        }
        
        // 5. ADAPT — Yeni plan üret
        // 🧠 LEARNING: Başarısızlıktan öğren (EN DEĞERLİ DERS!)
        try {
          const project = step.tool_args?.projectName || step.tool_args?.project || 'global';
          await alohaMemory.learnFromPlanExecution(
            plan.goal, project, i, plan.plan.length,
            { title: step.title, reason: verification.reason }
          );
        } catch { /* silent */ }
        
        const adaptResult = await adaptPlan(planId, plan, step, verification.reason, i);
        
        return {
          planId,
          status: 'adapted',
          completedSteps: i,
          totalSteps: plan.plan.length,
          failedStep: step.step,
          failReason: verification.reason,
          adaptedPlanId: adaptResult.newPlanId || undefined,
          log,
        };
      }
      
      // Callback
      if (onStepComplete) {
        onStepComplete(i + 1, plan.plan.length, toolResult);
      }
      
    } catch (e: any) {
      // Unexpected error
      step.status = 'failed';
      const errorMsg = e.message || 'Bilinmeyen hata';
      await updatePlanStep(planId, i, 'failed', `ERROR: ${errorMsg}`);
      
      log.push({
        step: step.step,
        title: step.title,
        status: 'error',
        result: errorMsg,
        duration: Date.now() - stepStart,
      });
      
      // Git rollback
      if (gitTag) {
        const projectPath = step.tool_args?.projectPath || step.tool_args?.filePath?.split('/src/')[0];
        if (projectPath) await gitRollback(projectPath, gitTag);
      }
      
      return {
        planId,
        status: 'failed',
        completedSteps: i,
        totalSteps: plan.plan.length,
        failedStep: step.step,
        failReason: errorMsg,
        log,
      };
    }
  }
  
  // Tüm adımlar başarılı — LEARNING LOOP
  logAlohaAction('PLAN_EXECUTION_COMPLETE', { planId, goal: plan.goal, steps: plan.plan.length });
  
  // 🧠 LEARNING LOOP: Ne öğrendik?
  try {
    const project = plan.plan[0]?.tool_args?.projectName || plan.plan[0]?.tool_args?.project || 'global';
    await alohaMemory.learnFromPlanExecution(
      plan.goal,
      project,
      plan.plan.length,
      plan.plan.length,
      undefined,
      plan.plan
        .filter(s => s.status === 'success' && s.result)
        .slice(0, 3)
        .map(s => `${s.title}: başarılı (${s.tool})`)
    );
  } catch { /* learning loop hatası plan sonucunu etkilemesin */ }
  
  return {
    planId,
    status: 'completed',
    completedSteps: plan.plan.length,
    totalSteps: plan.plan.length,
    log,
  };
}

// ═══════════════════════════════════════════════════
// ADAPT MEKANİZMASI — Başarısız planı yeniden planlar
// ═══════════════════════════════════════════════════

async function adaptPlan(
  originalPlanId: string,
  originalPlan: ExecutionPlan,
  failedStep: PlanStep,
  failReason: string,
  failedStepIndex: number
): Promise<{ newPlanId: string | null }> {
  try {
    // Kalan adımları bul
    const remainingSteps = originalPlan.plan.slice(failedStepIndex);
    const completedSteps = originalPlan.plan.slice(0, failedStepIndex);
    
    // Planner'a yeniden gönder
    const adaptPrompt = `
ÖNCEKİ PLAN BAŞARISIZ OLDU. YENİ PLAN OLUŞTUR.

ORIJINAL HEDEF: ${originalPlan.goal}

TAMAMLANAN ADIMLAR:
${completedSteps.map(s => `✅ ${s.step}. ${s.title}: ${(s.result || '').substring(0, 100)}`).join('\n')}

BAŞARISIZ ADIM:
❌ ${failedStep.step}. ${failedStep.title}
Araç: ${failedStep.tool}
Hata: ${failReason}

KALAN ADIMLAR (yeniden planla):
${remainingSteps.map(s => `⏳ ${s.step}. ${s.title}`).join('\n')}

ÖNCEKİ PLAN ANALİZİ: ${originalPlan.analysis}

KRİTİK: Başarısız olan yaklaşımı TEKRARLAMA. Farklı bir strateji geliştir.
Eğer aynı tool aynı hatayla başarısız olacaksa, alternatif tool veya yaklaşım kullan.
`.trim();

    const newPlan = await generatePlan(adaptPrompt);
    const newPlanId = await submitPlanForApproval(
      newPlan, 
      `ADAPT: ${originalPlan.goal} (Önceki plan ${originalPlanId} başarısız oldu)`,
      'aloha_adapt'
    );
    
    // Orijinal planı "adapted" olarak işaretle
    await adminDb.collection('aloha_plans').doc(originalPlanId).update({
      status: 'aborted',
      completed_at: new Date().toISOString(),
      adapted_to: newPlanId,
    });
    
    logAlohaAction('PLAN_ADAPTED', { originalPlanId, newPlanId, reason: failReason });
    
    return { newPlanId };
  } catch (e: any) {
    console.error('[ALOHA ADAPT] Yeni plan oluşturulamadı:', e.message);
    return { newPlanId: null };
  }
}

// ═══════════════════════════════════════════════════
// PLAN SORGULAMA FONKSİYONLARI
// ═══════════════════════════════════════════════════

/**
 * Bekleyen planları listeler
 */
export async function listPendingPlans(): Promise<StoredPlan[]> {
  const snapshot = await adminDb.collection('aloha_plans')
    .orderBy('created_at', 'desc')
    .limit(30)
    .get();
  
  const allPlans = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as StoredPlan));
  return allPlans.filter(p => ['pending_approval', 'approved', 'executing'].includes(p.status)).slice(0, 10);
}

/**
 * Plan detayını getirir
 */
export async function getPlanDetails(planId: string): Promise<StoredPlan | null> {
  const doc = await adminDb.collection('aloha_plans').doc(planId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as StoredPlan;
}

/**
 * Execution sonucunu insan-okunabilir formatta döndürür
 */
export function formatExecutionResult(result: ExecutionResult): string {
  const lines: string[] = [];
  
  lines.push(`╔══════════════════════════════════════════╗`);
  lines.push(`║  🏗️ PLAN YÜRÜTME SONUCU                 ║`);
  lines.push(`╚══════════════════════════════════════════╝`);
  lines.push(`🆔 Plan: ${result.planId}`);
  lines.push(`📊 Durum: ${result.status.toUpperCase()}`);
  lines.push(`📈 İlerleme: ${result.completedSteps}/${result.totalSteps} adım`);
  
  if (result.failedStep) {
    lines.push(`❌ Başarısız adım: #${result.failedStep}`);
    lines.push(`📝 Sebep: ${result.failReason}`);
  }
  
  if (result.adaptedPlanId) {
    lines.push(`🔄 ADAPT: Yeni plan oluşturuldu → ${result.adaptedPlanId}`);
    lines.push(`👉 Yeni planı incelemek için: "Plan ${result.adaptedPlanId} göster"`);
  }
  
  lines.push(``);
  lines.push(`📋 ADIM DETAYI:`);
  result.log.forEach(l => {
    const icon = l.status === 'success' ? '✅' : l.status === 'failed' ? '❌' : l.status === 'skipped' ? '⏭️' : '⚠️';
    lines.push(`  ${icon} ${l.step}. ${l.title} (${l.duration}ms)`);
    if (l.gitTag) lines.push(`     🏷️ Git: ${l.gitTag}`);
    lines.push(`     ${l.result.substring(0, 150)}`);
  });
  
  return lines.join('\n');
}
