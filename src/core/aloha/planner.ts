/**
 * ALOHA PLANNER AGENT
 * 
 * ALOHA'nın "beyni" — düşünür, planlar, parçalar.
 * Direkt tool çağırmaz, yapılandırılmış plan üretir.
 * 
 * Akış: USER → Planner → Plan JSON → Firebase → Onay → Executor
 */

import { alohaAI } from './aiClient';
import { adminDb } from '@/lib/firebase-admin';

// ═══════════════════════════════════════════════════
// PLANNER AGENT SYSTEM PROMPT
// ═══════════════════════════════════════════════════

const PLANNER_PROMPT = `You are ALOHA Master Orchestrator — the LEAD DATA SCIENTIST & CTO of the AIPyram ecosystem.

## YOUR ROLE & PHILOSOPHY
You are NOT a junior developer or a simple task executor. You never blindly execute commands.
Your core philosophy is: ROOT CAUSE FIRST. 
You must DECOMPOSE complex tasks into a strategic, verifiable, and clinical execution plan.

## RULES (STRICT B2B SOVEREIGN PROTOCOL)
1. CLINICAL DIAGNOSIS FIRST: If asked to fix or update something, your VERY FIRST STEP must ALWAYS be a Root Cause Analysis (e.g., query database to see what is missing).
2. CLASSIFICATION: Never treat all errors the same. You must classify the problem (e.g., 'missing field', '404 broken URL', 'low resolution').
3. MATHEMATICAL VERIFICATION: Every step MUST have a strict mathematical or definitive verification condition. (Instead of "check if urls increased", use "Count of null images must be exactly 0 after this step").
4. AVOID HALLUCINATED TOOLS: Use ONLY the tools strictly given below (never invent tools like master_feed).
5. CLOUD RUN ADAPTATION: You are running on Google Cloud Run. NO LOCAL FILESYSTEM. NO DIRECTORY SCANNING (unless explicitly permitted). Rely on Firestore databases and real web requests.
6. NO LAZY FIXES: If an image is broken, don't just blindly regenerate it without knowing WHY it's broken.
7. MAX BATCH SIZE: If mutating data, process in distinct small batches (e.g., 10 items) per step to prevent memory leaks and API timeouts.

## AVAILABLE TOOLS FOR EXECUTOR
- analyze_project, verify_project_health, query_firestore_database (SAFE - read only data/schema)
- fetch_url, web_search (SAFE - interact globally to fetch real world facts, stop hallucinating)
- scan_missing_images, update_article_image, compose_article (RISKY - media/content)
- deploy_target_project (RISKY - trigger deployment)
- list_plans, approve_plan (SAFE - workflow)

## OUTPUT FORMAT (STRICT JSON — NO MARKDOWN WRAPPING!)
You MUST respond with ONLY valid JSON:

{
  "goal": "Clear description of the end goal",
  "root_cause_hypothesis": "What you think is fundamentally wrong before starting",
  "analysis": "Your strategy incorporating classification and batching",
  "environment": "cloud",
  "risks": ["Risk 1", "Risk 2"],
  "plan": [
    {
      "step": 1,
      "title": "Diagnosis & Classification",
      "description": "Query the dataset to group errors by type (missing vs broken)",
      "tool": "query_firestore_database",
      "tool_args": { "collection": "xyz", "where": "xyz" },
      "verification": {
        "method": "query_firestore_database",
        "expected": "Must return an exact count of items to fix (e.g., 23 missing, 5 broken)",
        "fail_condition": "0 items returned but system expects errors"
      },
      "risk_level": "low",
      "depends_on": []
    }
  ],
  "estimated_duration_minutes": 5,
  "confidence": 0.95,
  "abort_conditions": ["If error count > 100", "If format is unexpected"]
}`;

// ═══════════════════════════════════════════════════
// PLAN TYPES
// ═══════════════════════════════════════════════════

export interface PlanStep {
  step: number;
  title: string;
  description: string;
  tool: string;
  tool_args: Record<string, any>;
  verification: {
    method: string;
    expected: string;
    fail_condition: string;
  };
  risk_level: 'low' | 'medium' | 'high';
  depends_on: number[];
  status?: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  result?: string;
  started_at?: string;
  completed_at?: string;
}

export interface ExecutionPlan {
  goal: string;
  root_cause_hypothesis: string;
  analysis: string;
  environment: 'cloud' | 'local';
  risks: string[];
  plan: PlanStep[];
  estimated_duration_minutes: number;
  confidence: number;
  abort_conditions: string[];
}

export interface StoredPlan {
  id?: string;
  type: 'execution_plan';
  status: 'pending_approval' | 'approved' | 'executing' | 'completed' | 'failed' | 'aborted';
  created_by: string;
  original_prompt: string;
  plan: ExecutionPlan;
  current_step: number;
  total_steps: number;
  approved_by: string | null;
  approved_at: string | null;
  created_at: any;
  started_at: string | null;
  completed_at: string | null;
  execution_log: Array<{
    step: number;
    status: string;
    result: string;
    timestamp: string;
  }>;
}

// ═══════════════════════════════════════════════════
// PLANNER AGENT CORE
// ═══════════════════════════════════════════════════



/**
 * Verilen kullanıcı isteğini analiz eder ve yapılandırılmış plan üretir.
 * Tool çağırmaz — sadece düşünür ve plan oluşturur.
 */
export async function generatePlan(userPrompt: string, context?: string): Promise<ExecutionPlan> {
  let contextStr = context ? `\n\nMEVCUT DURUM:\n${context}` : '';
  
  // Memory-aware: Geçmiş dersleri plan context'ine enjekte et
  try {
    const { alohaMemory } = await import('./memory');
    const criticalLessons = await alohaMemory.getCriticalLessons(5);
    if (criticalLessons.length > 0) {
      contextStr += '\n\n🧠 GEÇMİŞ DERSLER (ASLA TEKRAR!):\n';
      for (const l of criticalLessons) {
        contextStr += `- [${l.project}] ${l.content}\n`;
      }
    }
  } catch { /* memory yüklenemezse sessiz devam */ }
  
  const plan = await alohaAI.generateJSON<ExecutionPlan>(
    `${userPrompt}${contextStr}`,
    {
      complexity: 'complex',
      systemInstruction: PLANNER_PROMPT,
      temperature: 0.2,
    },
    'planner_agent'
  );

  if (!plan || !plan.goal || !plan.plan || plan.plan.length === 0) {
    throw new Error('Plan boş veya eksik');
  }
  
  // Step numaralarını düzelt
  plan.plan.forEach((step, i) => {
    step.step = i + 1;
    step.status = 'pending';
  });
  
  return plan;
}

/**
 * Planı Firebase'e yazar ve onay bekler
 */
export async function submitPlanForApproval(
  plan: ExecutionPlan, 
  originalPrompt: string,
  createdBy: string = 'aloha'
): Promise<string> {
  const storedPlan: StoredPlan = {
    type: 'execution_plan',
    status: 'pending_approval',
    created_by: createdBy,
    original_prompt: originalPrompt,
    plan,
    current_step: 0,
    total_steps: plan.plan.length,
    approved_by: null,
    approved_at: null,
    created_at: new Date().toISOString(),
    started_at: null,
    completed_at: null,
    execution_log: [],
  };

  const ref = await adminDb.collection('aloha_plans').add(storedPlan);
  return ref.id;
}

/**
 * Planı onaylar ve yürütme için hazır işaretler
 */
export async function approvePlan(planId: string, approvedBy: string = 'admin'): Promise<void> {
  await adminDb.collection('aloha_plans').doc(planId).update({
    status: 'approved',
    approved_by: approvedBy,
    approved_at: new Date().toISOString(),
  });
}

/**
 * Plan step'ini tamamlandı olarak işaretler
 */
export async function updatePlanStep(
  planId: string, 
  stepIndex: number, 
  status: 'success' | 'failed' | 'skipped',
  result: string
): Promise<void> {
  const doc = await adminDb.collection('aloha_plans').doc(planId).get();
  const data = doc.data() as StoredPlan;
  
  // Step durumunu güncelle
  data.plan.plan[stepIndex].status = status;
  data.plan.plan[stepIndex].result = result;
  data.plan.plan[stepIndex].completed_at = new Date().toISOString();
  
  // Log ekle
  data.execution_log.push({
    step: stepIndex + 1,
    status,
    result: result.substring(0, 500),
    timestamp: new Date().toISOString(),
  });
  
  // Genel durumu güncelle
  const allDone = data.plan.plan.every(s => s.status === 'success' || s.status === 'skipped');
  const anyFailed = data.plan.plan.some(s => s.status === 'failed');
  
  await adminDb.collection('aloha_plans').doc(planId).update({
    'plan': data.plan,
    'current_step': stepIndex + 1,
    'execution_log': data.execution_log,
    'status': allDone ? 'completed' : anyFailed ? 'failed' : 'executing',
    ...(allDone || anyFailed ? { completed_at: new Date().toISOString() } : {}),
  });
}

/**
 * Verification: Step sonucu beklenen sonuçla uyuşuyor mu?
 */
export function verifyStepResult(step: PlanStep, result: string): { passed: boolean; reason: string } {
  const expected = step.verification.expected.toLowerCase();
  const failCondition = step.verification.fail_condition.toLowerCase();
  const resultLower = result.toLowerCase();
  
  // Fail condition kontrolü
  if (failCondition && resultLower.includes(failCondition)) {
    return { passed: false, reason: `Başarısızlık koşulu tetiklendi: ${step.verification.fail_condition}` };
  }
  
  // Hata kontrolü
  if (resultLower.includes('[hata]') || resultLower.includes('error') || resultLower.includes('permission_denied')) {
    return { passed: false, reason: `Hata tespit edildi: ${result.substring(0, 200)}` };
  }
  
  // "0 sonuç" mantık kontrolü
  if (resultLower.includes('0 sonuç') || resultLower.includes('0 doküman') || resultLower.includes('count: 0')) {
    // Eğer beklenen sonuç > 0 ise bu mantıksız
    if (expected.includes('> 0') || expected.includes('bulunmalı') || expected.includes('olmalı')) {
      return { passed: false, reason: `Mantık hatası: Sonuç 0 ama beklenen > 0. Tool bug olabilir.` };
    }
  }
  
  return { passed: true, reason: 'Doğrulama geçti' };
}

/**
 * Plan özetini insan-okunabilir formatta döndürür
 */
export function formatPlanSummary(plan: ExecutionPlan, planId?: string): string {
  const lines: string[] = [];
  
  lines.push(`╔══════════════════════════════════════════╗`);
  lines.push(`║  📋 ALOHA EXECUTION PLAN                ║`);
  lines.push(`╚══════════════════════════════════════════╝`);
  if (planId) lines.push(`🆔 Plan ID: ${planId}`);
  lines.push(`🎯 Hedef: ${plan.goal}`);
  lines.push(`📊 Güven: %${Math.round(plan.confidence * 100)} | ⏱️ ~${plan.estimated_duration_minutes} dk | 📍 ${plan.environment}`);
  lines.push(``);
  
  if (plan.risks.length > 0) {
    lines.push(`⚠️ RİSKLER:`);
    plan.risks.forEach(r => lines.push(`  • ${r}`));
    lines.push(``);
  }
  
  lines.push(`📝 ADIMLAR (${plan.plan.length} step):`);
  plan.plan.forEach(step => {
    const statusIcon = step.status === 'success' ? '✅' : step.status === 'failed' ? '❌' : step.status === 'running' ? '🔄' : '⏳';
    const riskIcon = step.risk_level === 'high' ? '🔴' : step.risk_level === 'medium' ? '🟡' : '🟢';
    lines.push(`  ${statusIcon} ${step.step}. [${riskIcon}] ${step.title}`);
    lines.push(`     Tool: ${step.tool} | Doğrulama: ${step.verification.expected.substring(0, 60)}`);
  });
  
  if (plan.abort_conditions.length > 0) {
    lines.push(``);
    lines.push(`🛑 İPTAL KOŞULLARI:`);
    plan.abort_conditions.forEach(c => lines.push(`  • ${c}`));
  }
  
  lines.push(``);
  lines.push(`👉 Onaylamak için: "Planı onayla" veya "Plan ${planId} onayla"`);
  
  return lines.join('\n');
}
