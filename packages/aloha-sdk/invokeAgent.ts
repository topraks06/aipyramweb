/**
 * ALOHA SOVEREIGN GATEWAY — invokeAgent
 * 
 * TÜM SİSTEMİN KALBİ.
 * Her node bu fonksiyonu çağırır.
 * Hiçbir node direkt agent çalıştırmaz.
 * 
 * Akış: Whitelist → Rate Limit → Wallet → Tool → Log → Kredi Düş
 */

import { checkCredits, deductCredit, getActionCost } from './wallet';
import { logSovereignAction, logDLQ, checkIdempotency, saveIdempotency } from './logger';
import { runTool, type ToolResult } from './tools';

// ═══════════════════════════════════════
// ACTION WHITELIST (Güvenlik)
// ═══════════════════════════════════════

const ALLOWED_ACTIONS = [
  'render',
  'analysis',
  'opportunity',
  'compose_article',
  'chat',
  'document',
  'image_generation',
  'autonomous_cycle', // TRTEX otonom döngüsü
] as const;

type AllowedAction = typeof ALLOWED_ACTIONS[number];

// ═══════════════════════════════════════
// RATE LIMITER (Node bazlı, in-memory)
// ═══════════════════════════════════════

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(node: string): void {
  const now = Date.now();
  const windowMs = 60_000; // 1 dakika
  const maxCalls = 50;

  const key = `rl_${node}`;
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  entry.count++;
  if (entry.count > maxCalls) {
    throw new Error(`[RATE_LIMIT] ${node} için dakikalık limit aşıldı (${maxCalls}/dk)`);
  }
}

// Rate limit bellek temizliği (5 dakikada bir)
let lastRLCleanup = Date.now();
function cleanupRateLimits() {
  const now = Date.now();
  if (now - lastRLCleanup < 300_000) return;
  lastRLCleanup = now;
  for (const [key, val] of rateLimitStore) {
    if (now > val.resetAt) rateLimitStore.delete(key);
  }
}

// ═══════════════════════════════════════
// SOVEREIGN INVOKE AGENT
// ═══════════════════════════════════════

export interface SovereignInvocation {
  node: string;
  action: string;
  uid?: string;
  payload: Record<string, any>;
  idempotencyKey?: string;
}

export interface SovereignResult {
  success: boolean;
  data?: any;
  message: string;
  duration: number;
  creditUsed: number;
}

export async function invokeAgent(invocation: SovereignInvocation): Promise<SovereignResult> {
  const { node, action, uid, payload, idempotencyKey } = invocation;
  const start = Date.now();

  try {
    // 0. Idempotency check (double call koruması — özellikle Stripe webhook)
    if (idempotencyKey) {
      const existing = await checkIdempotency(idempotencyKey);
      if (existing) {
        return {
          success: true,
          data: existing,
          message: 'İşlem zaten tamamlanmış (idempotent).',
          duration: Date.now() - start,
          creditUsed: 0,
        };
      }
    }

    // 1. Action whitelist kontrolü
    if (!ALLOWED_ACTIONS.includes(action as AllowedAction)) {
      return {
        success: false,
        message: `Geçersiz action: ${action}. İzin verilen: ${ALLOWED_ACTIONS.join(', ')}`,
        duration: Date.now() - start,
        creditUsed: 0,
      };
    }

    // 2. Node rate limit (50 call/dakika)
    cleanupRateLimits();
    checkRateLimit(node);

    // 3. Wallet kontrolü (uid varsa)
    if (uid) {
      const wallet = await checkCredits(node, uid, action);
      if (!wallet.allowed) {
        return {
          success: false,
          message: `Yetersiz kredi. Kalan: ${wallet.remaining}, Gerekli: ${wallet.cost}`,
          duration: Date.now() - start,
          creditUsed: 0,
        };
      }
    }

    // 3.5. Admin Training Injection (CORE BRAIN LOCK)
    const { injectKnowledgeContext, writeSemanticMemory } = await import('./memory');
    const adminRules = await injectKnowledgeContext(node, action);
    
    // Inject the rules into the payload so the tool can use them
    if (adminRules) {
      payload.sovereignContext = adminRules;
    }

    // 4. Tool çalıştır
    const toolResult: ToolResult = await runTool(action, payload);

    const duration = Date.now() - start;
    const cost = getActionCost(action);

    // 4.5. Semantic Memory Write Loop (RLHF)
    await writeSemanticMemory({
      node,
      action,
      uid,
      payload,
      outcome: toolResult.success,
      message: toolResult.message,
      data: toolResult.data,
      createdAt: new Date().toISOString()
    });

    // 5. Logla (aloha_sovereign_logs koleksiyonu)
    await logSovereignAction({
      node,
      action,
      uid,
      payload,
      result: toolResult as any,
      duration,
      cost,
    });

    // 6. Kredi düş (atomic Firestore transaction)
    if (uid && toolResult.success) {
      await deductCredit(node, uid, action);
    }

    // 7. Idempotency kaydet
    if (idempotencyKey && toolResult.success) {
      await saveIdempotency(idempotencyKey, toolResult);
    }

    return {
      success: toolResult.success,
      data: toolResult.data,
      message: toolResult.message,
      duration,
      creditUsed: toolResult.success ? cost : 0,
    };

  } catch (err: any) {
    const duration = Date.now() - start;

    // DLQ kaydı — sistem çökerse veri kaybolmaz
    await logDLQ(node, action, err.message, payload);

    // 4.5. Semantic Memory Write Loop (Crash)
    const { writeSemanticMemory } = await import('./memory');
    await writeSemanticMemory({
      node,
      action,
      uid,
      payload,
      outcome: false,
      message: `CRASH: ${err.message}`,
      data: null,
      createdAt: new Date().toISOString()
    });

    return {
      success: false,
      message: `Sovereign hata: ${err.message}`,
      duration,
      creditUsed: 0,
    };
  }
}
