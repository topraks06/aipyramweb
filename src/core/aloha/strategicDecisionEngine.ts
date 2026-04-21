import { adminDb } from '@/lib/firebase-admin';
import { sendAndWait, chainAgents } from './agentBus';
import { dlq } from './dlq';

/**
 * ALOHA STRATEGIC DECISION ENGINE — Stratejik Karar Beyni
 * 
 * Mevcut decisionEngine.ts → piyasa sinyalleri (commodity/fx/logistics)
 * BU MODÜL → iş kararları (pazar hedefle, sayfa aç, lead yönlendir, strateji değiştir)
 * 
 * Aloha artık "çalışan eleman" değil, "ortak" olacak.
 * 
 * KARAR GARANTİLERİ:
 * 🟢 LOW RISK → Direkt uygula (haber üret, görsel ekle)
 * 🟡 MEDIUM RISK → Uygula + logla (sayfa güncelle, SEO değiştir)
 * 🔴 HIGH RISK → ASLA direkt yapma (ana sayfa, veri sil, büyük yapısal değişiklik)
 * 
 * SAFE MODE: 3 hata üst üste → tüm aksiyonlar DUR
 */

// ═══════════════════════════════════════
// TİP TANIMLARI
// ═══════════════════════════════════════

export interface StrategicDecision {
  id?: string;
  action: string;                    // "target_poland_market", "create_product_page"
  category: DecisionCategory;
  confidence: number;                // 0-1
  risk: 'low' | 'medium' | 'high';
  expectedOutcome: string;           // "lead_increase", "seo_improvement", "traffic_boost"
  reasoning: string;                 // Neden bu karar alındı
  rollbackPlan: string;              // Geri alma planı
  inputs: Record<string, any>;       // Karar verileri (news, signals, leads)
  output: DecisionOutput;
  status: 'proposed' | 'approved' | 'executing' | 'completed' | 'failed' | 'rolled_back';
  requiresApproval: boolean;         // 🔴 HIGH → true
  createdAt: string;
  executedAt?: string;
  resultMetrics?: DecisionResult;
}

export type DecisionCategory =
  | 'market_expansion'     // Yeni pazar hedefle
  | 'content_strategy'     // İçerik stratejisi değişikliği
  | 'page_management'      // Sayfa oluştur/güncelle
  | 'lead_routing'         // Lead yönlendirme
  | 'seo_optimization'     // SEO iyileştirme
  | 'competitive_response' // Rakibe karşı hamle
  | 'risk_mitigation'      // Risk azaltma
  | 'revenue_action';      // Gelir artırma aksiyonu

export interface DecisionOutput {
  tools: Array<{ name: string; args: Record<string, any> }>;
  sequence: 'parallel' | 'sequential';
  estimatedDurationMs: number;
}

export interface DecisionResult {
  measuredAt: string;
  views?: number;
  leads?: number;
  conversion?: number;
  lesson: string;
  nextAction?: string;
}

// ═══════════════════════════════════════
// SAFE MODE — Kendini Durdurma Mekanizması
// ═══════════════════════════════════════

interface SafeModeState {
  active: boolean;
  activatedAt?: string;
  reason?: string;
  consecutiveErrors: number;
  lastErrors: string[];
}

let safeModeState: SafeModeState = {
  active: false,
  consecutiveErrors: 0,
  lastErrors: [],
};

const SAFE_MODE_THRESHOLD = 3; // 3 ust uste hata -> safe mode

/**
 * Container restart sonrasi safe mode state'i Firestore'dan yukle
 */
export async function recoverSafeModeState(): Promise<void> {
  if (!adminDb) return;
  try {
    const doc = await adminDb.collection('system_state').doc('safe_mode').get();
    if (doc.exists) {
      const data = doc.data() as SafeModeState;
      if (data.active) {
        safeModeState = data;
        console.log('[SAFE MODE] Firestore\'dan recover edildi: AKTIF (' + data.reason + ')');
      }
    }
  } catch (e) {
    await dlq.recordSilent(e, 'strategicDecisionEngine', 'system');
  }
}

/** Safe mode state'i Firestore'a kaydet */
async function persistSafeModeState(): Promise<void> {
  if (!adminDb) return;
  try {
    await adminDb.collection('system_state').doc('safe_mode').set(safeModeState);
  } catch (e) {
    await dlq.recordSilent(e, 'strategicDecisionEngine', 'system');
  }
}

export function checkSafeMode(): { allowed: boolean; reason?: string } {
  if (safeModeState.active) {
    return {
      allowed: false,
      reason: '[SAFE MODE AKTIF] (' + safeModeState.reason + '). Otonom aksiyonlar durduruldu. Aktivasyon: ' + safeModeState.activatedAt,
    };
  }
  return { allowed: true };
}

export function reportError(error: string): void {
  safeModeState.consecutiveErrors++;
  safeModeState.lastErrors.push('[' + new Date().toISOString() + '] ' + error);
  if (safeModeState.lastErrors.length > 10) safeModeState.lastErrors.shift();

  if (safeModeState.consecutiveErrors >= SAFE_MODE_THRESHOLD) {
    safeModeState.active = true;
    safeModeState.activatedAt = new Date().toISOString();
    safeModeState.reason = safeModeState.consecutiveErrors + ' ardisik hata: ' + safeModeState.lastErrors.slice(-3).join(' | ');
    console.error('[SAFE MODE] AKTIF! ' + safeModeState.reason);

    // Firestore'a kaydet (hem alert hem state)
    if (adminDb) {
      adminDb.collection('aloha_alerts').add({
        type: 'SAFE_MODE_ACTIVATED',
        reason: safeModeState.reason,
        errors: safeModeState.lastErrors,
        timestamp: new Date().toISOString(),
      }).catch(() => {});
      persistSafeModeState().catch(() => {});
    }
  }
}

export function reportSuccess(): void {
  safeModeState.consecutiveErrors = 0;
  // Safe mode'dan cikis -> sadece Hakan yapabilir veya 30dk sonra otomatik
  if (safeModeState.active && safeModeState.activatedAt) {
    const elapsed = Date.now() - new Date(safeModeState.activatedAt).getTime();
    if (elapsed > 30 * 60 * 1000) { // 30 dakika sonra otomatik cikis
      safeModeState.active = false;
      safeModeState.reason = undefined;
      safeModeState.activatedAt = undefined;
      console.log('[SAFE MODE] Otomatik cikis (30dk gecti + basarili calisma)');
      persistSafeModeState().catch(() => {});
    }
  }
}

export function resetSafeMode(): void {
  safeModeState = { active: false, consecutiveErrors: 0, lastErrors: [] };
  console.log('[SAFE MODE] Manuel sifirlama -- Hakan tarafindan');
  persistSafeModeState().catch(() => {});
}

// ═══════════════════════════════════════
// RİSK DEĞERLEME
// ═══════════════════════════════════════

function assessRisk(action: string, category: DecisionCategory): 'low' | 'medium' | 'high' {
  // 🔴 HIGH RISK — ASLA otomatik yapma
  const highRiskPatterns = [
    'delete', 'remove', 'drop', 'reset', 'homepage',
    'ana_sayfa', 'home_page', 'pricing', 'payment',
  ];
  if (highRiskPatterns.some(p => action.toLowerCase().includes(p))) return 'high';
  if (category === 'risk_mitigation') return 'high';

  // 🟡 MEDIUM RISK — Yap ama logla
  const mediumRiskPatterns = [
    'update', 'modify', 'change', 'seo', 'redirect',
    'page_update', 'menu_change',
  ];
  if (mediumRiskPatterns.some(p => action.toLowerCase().includes(p))) return 'medium';
  if (category === 'page_management' || category === 'seo_optimization') return 'medium';

  // 🟢 LOW RISK — Direkt çalıştır
  return 'low';
}

// ═══════════════════════════════════════
// GUARDRAILS — Günlük Limitler
// ═══════════════════════════════════════

const DAILY_DECISION_LIMITS: Record<string, number> = {
  page_management: 3,
  content_strategy: 5,
  seo_optimization: 5,
  market_expansion: 2,
  lead_routing: 10,
  competitive_response: 2,
  risk_mitigation: 1,
  revenue_action: 5,
};

async function checkDecisionLimit(category: DecisionCategory): Promise<boolean> {
  if (!adminDb) return true;
  
  const today = new Date().toISOString().split('T')[0];
  const key = `decision_${category}_${today}`;
  
  try {
    const doc = await adminDb.collection('aloha_guardrails').doc(key).get();
    const count = doc.exists ? (doc.data()?.count || 0) : 0;
    const limit = DAILY_DECISION_LIMITS[category] || 5;
    
    if (count >= limit) return false;
    
    await adminDb.collection('aloha_guardrails').doc(key).set(
      { count: count + 1, lastAction: new Date().toISOString() },
      { merge: true }
    );
    return true;
  } catch {
    return true;
  }
}

// ═══════════════════════════════════════
// ANA KARAR MOTORU
// ═══════════════════════════════════════

export interface DecisionInput {
  news?: any[];         // Son haberler
  signals?: any[];      // Piyasa sinyalleri
  leads?: any[];        // Mevcut leadler
  healthScores?: Record<string, number>; // Proje sağlık skorları
  recentActions?: any[];  // Son aksiyonlar
  context?: string;     // Ek bağlam
}

/**
 * ANA KARAR FONKSİYONU
 * 
 * Veri topla → analiz et → karar üret → risk değerle → uygula veya onay iste
 */
export async function makeStrategicDecision(
  input: DecisionInput,
  project: string = 'trtex',
): Promise<StrategicDecision[]> {
  // 🛑 Safe mode kontrolü
  const safeCheck = checkSafeMode();
  if (!safeCheck.allowed) {
    console.warn(`[DECISION] ${safeCheck.reason}`);
    return [];
  }

  const decisions: StrategicDecision[] = [];

  // 🧠 HAFIZA OKUMA — Geçmiş dersler karar kalitesini artırır
  let memoryContext = '';
  try {
    if (adminDb) {
      const lessonsSnap = await adminDb.collection('aloha_lessons')
        .where('project', '==', project)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();
      if (!lessonsSnap.empty) {
        const lessons = lessonsSnap.docs.map(d => d.data());
        memoryContext = '\n\nGEÇMİŞ DERSLER (son 5):\n' + 
          lessons.map((l: any) => `- [${l.type}] ${l.content?.substring(0, 150)}`).join('\n');
        console.log(`[DECISION] 🧠 ${lessonsSnap.size} ders hafızadan okundu`);
      }
    }
  } catch { /* hafıza okunamazsa devam et */ }

  try {
    // Agent Bus ile Research → Decision zincirini çalıştır
    const chainResult = await chainAgents([
      {
        agent: 'research_agent',
        type: 'query',
        payload: {
          task: 'Mevcut verileri analiz et ve stratejik fırsatları belirle',
          news: (input.news || []).slice(0, 5).map((n: any) => ({
            title: n.title || n.translations?.TR?.title,
            category: n.category,
            ai_impact_score: n.ai_impact_score,
          })),
          signals: input.signals || [],
          leadCount: (input.leads || []).length,
          healthScores: input.healthScores || {},
          context: input.context || '',
        },
      },
      {
        agent: 'decision_agent',
        type: 'decision_request',
        payload: {
          task: `${project} için stratejik karar üret. Her karar somut, uygulanabilir ve ölçülebilir olmalı.${memoryContext}`,
          project,
          instructions: `JSON formatında max 3 karar döndür:
[{
  "action": "kısa_aksiyon_adı",
  "category": "market_expansion|content_strategy|page_management|lead_routing|seo_optimization|competitive_response|revenue_action",
  "expectedOutcome": "beklenen_sonuç",
  "reasoning": "neden bu karar",
  "rollbackPlan": "geri alma planı",
  "tools": [{"name": "tool_adı", "args": {...}}]
}]`,
        },
        passResultAs: 'researchData',
      },
    ]);

    if (!chainResult.success) {
      console.warn('[DECISION] Zincir başarısız — varsayılan kararlar üretiliyor');
      // Fallback: basit kural tabanlı kararlar
      return generateRuleBasedDecisions(input, project);
    }

    // Chain sonucunu parse et
    const rawDecisions = chainResult.finalResult;
    if (Array.isArray(rawDecisions)) {
      for (const raw of rawDecisions.slice(0, 3)) {
        const risk = assessRisk(raw.action, raw.category);
        const requiresApproval = risk === 'high';

        // Günlük limit kontrolü
        const withinLimit = await checkDecisionLimit(raw.category);
        if (!withinLimit) {
          console.log(`[DECISION] ${raw.category} günlük limiti doldu → atlanıyor`);
          continue;
        }

        const decision: StrategicDecision = {
          action: raw.action,
          category: raw.category || 'content_strategy',
          confidence: chainResult.steps[1]?.response?.confidence || 0.5,
          risk,
          expectedOutcome: raw.expectedOutcome || 'improvement',
          reasoning: raw.reasoning || '',
          rollbackPlan: raw.rollbackPlan || 'değişikliği geri al',
          inputs: { newsCount: (input.news || []).length, signalCount: (input.signals || []).length },
          output: {
            tools: raw.tools || [],
            sequence: 'sequential',
            estimatedDurationMs: (raw.tools || []).length * 10000,
          },
          status: requiresApproval ? 'proposed' : 'approved',
          requiresApproval,
          createdAt: new Date().toISOString(),
        };

        decisions.push(decision);
      }
    }
  } catch (e: any) {
    console.error(`[DECISION] Karar üretme hatası: ${e.message}`);
    reportError(`decision_engine: ${e.message}`);
  }

  // Kararları Firestore'a kaydet
  await persistDecisions(decisions, project);

  return decisions;
}

// ═══════════════════════════════════════
// KURAL TABANI FALLBACK
// ═══════════════════════════════════════

function generateRuleBasedDecisions(input: DecisionInput, project: string): StrategicDecision[] {
  const decisions: StrategicDecision[] = [];
  const now = new Date().toISOString();

  // Kural 1: İçerik bayat → haber üret
  const healthScore = input.healthScores?.[project] || 0;
  if (healthScore < 60) {
    decisions.push({
      action: 'generate_fresh_content',
      category: 'content_strategy',
      confidence: 0.9,
      risk: 'low',
      expectedOutcome: 'freshness_improvement',
      reasoning: `Proje sağlık skoru düşük (${healthScore}/100). Taze içerik gerekli.`,
      rollbackPlan: 'Üretilen içeriği arşivle',
      inputs: { healthScore },
      output: {
        tools: [{ name: 'compose_article', args: { project, topic: 'sektör güncel gelişmeleri', word_count: 1200 } }],
        sequence: 'sequential',
        estimatedDurationMs: 30000,
      },
      status: 'approved',
      requiresApproval: false,
      createdAt: now,
    });
  }

  // Kural 2: Lead var ama takip yok → outreach planla
  if ((input.leads || []).length > 5) {
    decisions.push({
      action: 'activate_lead_followup',
      category: 'revenue_action',
      confidence: 0.7,
      risk: 'low',
      expectedOutcome: 'conversion_increase',
      reasoning: `${(input.leads || []).length} lead bekliyor. Otomatik takip gerekli.`,
      rollbackPlan: 'Takibi durdur',
      inputs: { leadCount: (input.leads || []).length },
      output: {
        tools: [{ name: 'trtex_lead_stats', args: {} }],
        sequence: 'sequential',
        estimatedDurationMs: 5000,
      },
      status: 'approved',
      requiresApproval: false,
      createdAt: now,
    });
  }

  return decisions;
}

// ═══════════════════════════════════════
// KARAR PERSİSTANSI
// ═══════════════════════════════════════

async function persistDecisions(decisions: StrategicDecision[], project: string): Promise<void> {
  if (!adminDb || decisions.length === 0) return;

  try {
    const batch = adminDb.batch();
    for (const decision of decisions) {
      const ref = adminDb.collection('aloha_decisions').doc();
      decision.id = ref.id;
      batch.set(ref, {
        ...decision,
        project,
      });
    }
    await batch.commit();
    console.log(`[DECISION] ${decisions.length} karar Firestore'a yazıldı`);
  } catch (e: any) {
    console.warn(`[DECISION] Persist hatası: ${e.message}`);
  }
}

// ═══════════════════════════════════════
// KARAR UYGULAMA (EXECUTION)
// ═══════════════════════════════════════

/**
 * Onaylanmış kararları çalıştır
 * HIGH RISK kararlar ATLANIR (Hakan onayı gerekli)
 */
export async function executeApprovedDecisions(
  decisions: StrategicDecision[],
  toolExecutor: (call: { name: string; args: Record<string, any> }) => Promise<string>,
): Promise<Array<{ decision: string; success: boolean; result: string }>> {
  const results: Array<{ decision: string; success: boolean; result: string }> = [];

  for (const decision of decisions) {
    if (decision.status !== 'approved') {
      results.push({
        decision: decision.action,
        success: false,
        result: `Atlandı (status: ${decision.status}, risk: ${decision.risk})`,
      });
      continue;
    }

    // Son safe mode kontrolü
    const safeCheck = checkSafeMode();
    if (!safeCheck.allowed) {
      results.push({ decision: decision.action, success: false, result: safeCheck.reason || 'Safe mode aktif' });
      break;
    }

    console.log(`[DECISION] ▶️ Uygulama: ${decision.action} (risk: ${decision.risk}, güven: ${decision.confidence})`);

    for (const tool of decision.output.tools) {
      try {
        const result = await toolExecutor({ name: tool.name, args: tool.args });
        const success = !result.includes('[HATA]') && !result.includes('[TOOL HATA]');

        if (success) {
          reportSuccess();
        } else {
          reportError(`${decision.action}: ${result.substring(0, 100)}`);
        }

        results.push({ decision: decision.action, success, result: result.substring(0, 500) });

        // Firestore güncelle
        if (adminDb && decision.id) {
          await adminDb.collection('aloha_decisions').doc(decision.id).update({
            status: success ? 'completed' : 'failed',
            executedAt: new Date().toISOString(),
          });
        }
      } catch (e: any) {
        reportError(`${decision.action}: ${e.message}`);
        results.push({ decision: decision.action, success: false, result: e.message });
      }
    }
  }

  return results;
}

// ═══════════════════════════════════════
// LEARNING LOOP — Aksiyondan Öğren
// ═══════════════════════════════════════

/**
 * Geçmiş karar sonuçlarını analiz et ve öğren
 */
export async function runLearningCycle(project: string = 'trtex'): Promise<string> {
  if (!adminDb) return '[HATA] Firestore bağlantısı yok';

  try {
    // Son 7 günün kararlarını çek
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const snap = await adminDb.collection('aloha_decisions')
      .where('project', '==', project)
      .where('createdAt', '>=', sevenDaysAgo)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    if (snap.empty) return '[LEARNING] Son 7 günde karar bulunamadı';

    const decisions = snap.docs.map(d => d.data());
    const completed = decisions.filter((d: any) => d.status === 'completed');
    const failed = decisions.filter((d: any) => d.status === 'failed');

    // Learning agent ile analiz et
    const learningResponse = await sendAndWait('learning_agent', 'query', {
      task: 'Geçmiş kararları analiz et, başarılı/başarısız olanları değerlendir, ders çıkar',
      decisions: decisions.map((d: any) => ({
        action: d.action,
        category: d.category,
        status: d.status,
        confidence: d.confidence,
        reasoning: d.reasoning,
      })),
      stats: {
        total: decisions.length,
        completed: completed.length,
        failed: failed.length,
        successRate: decisions.length > 0 ? Math.round((completed.length / decisions.length) * 100) : 0,
      },
    }, { timeoutMs: 20000 });

    // Öğrenme sonuçlarını kaydet
    if (learningResponse.success && adminDb) {
      await adminDb.collection('aloha_lessons').add({
        project,
        period: '7d',
        totalDecisions: decisions.length,
        successRate: decisions.length > 0 ? Math.round((completed.length / decisions.length) * 100) : 0,
        insights: learningResponse.data,
        reasoning: learningResponse.reasoning,
        suggestedNextAction: learningResponse.suggestedNextAction,
        learnedAt: new Date().toISOString(),
      });
    }

    return `[🧠 LEARNING] ${project} — Son 7 gün:\n` +
      `📊 Toplam: ${decisions.length} karar\n` +
      `✅ Başarılı: ${completed.length} (${decisions.length > 0 ? Math.round((completed.length / decisions.length) * 100) : 0}%)\n` +
      `❌ Başarısız: ${failed.length}\n` +
      `💡 Ders: ${learningResponse.reasoning || 'analiz edilemedi'}\n` +
      `🎯 Önerilen: ${learningResponse.suggestedNextAction || 'yok'}`;

  } catch (e: any) {
    return `[LEARNING HATA] ${e.message}`;
  }
}

// ═══════════════════════════════════════
// DURUM RAPORU
// ═══════════════════════════════════════

export function getDecisionEngineStatus(): string {
  const safeMode = safeModeState.active ? '🛑 SAFE MODE AKTİF' : '🟢 Normal';
  const errors = `Ardışık hata: ${safeModeState.consecutiveErrors}/${SAFE_MODE_THRESHOLD}`;
  const lastErrors = safeModeState.lastErrors.slice(-3).join('\n  ');

  return `═══ DECISION ENGINE DURUMU ═══\n` +
    `Durum: ${safeMode}\n` +
    `${errors}\n` +
    (lastErrors ? `Son hatalar:\n  ${lastErrors}` : 'Hata yok ✅');
}
