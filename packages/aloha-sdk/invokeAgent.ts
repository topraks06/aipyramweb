/**
 * ALOHA SOVEREIGN GATEWAY — invokeAgent
 * 
 * TÜM SİSTEMİN KALBİ.
 * Her tenant bu fonksiyonu çağırır.
 * Hiçbir tenant direkt agent çalıştırmaz.
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
// RATE LIMITER (Tenant bazlı, in-memory)
// ═══════════════════════════════════════

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(tenant: string): void {
  const now = Date.now();
  const windowMs = 60_000; // 1 dakika
  const maxCalls = 50;

  const key = `rl_${tenant}`;
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  entry.count++;
  if (entry.count > maxCalls) {
    throw new Error(`[RATE_LIMIT] ${tenant} için dakikalık limit aşıldı (${maxCalls}/dk)`);
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
  tenant: string;
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
  const { tenant, action, uid, payload, idempotencyKey } = invocation;
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

    // 2. Tenant rate limit (50 call/dakika)
    cleanupRateLimits();
    checkRateLimit(tenant);

    // 3. Wallet kontrolü (uid varsa)
    if (uid) {
      const wallet = await checkCredits(tenant, uid, action);
      if (!wallet.allowed) {
        return {
          success: false,
          message: `Yetersiz kredi. Kalan: ${wallet.remaining}, Gerekli: ${wallet.cost}`,
          duration: Date.now() - start,
          creditUsed: 0,
        };
      }
    }

    // 4. Tool çalıştır
    const toolResult: ToolResult = await runTool(action, payload);

    const duration = Date.now() - start;
    const cost = getActionCost(action);

    // 5. Logla (aloha_sovereign_logs koleksiyonu)
    await logSovereignAction({
      tenant,
      action,
      uid,
      payload,
      result: toolResult as any,
      duration,
      cost,
    });

    // 6. Kredi düş (atomic Firestore transaction)
    if (uid && toolResult.success) {
      await deductCredit(tenant, uid, action);
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
    await logDLQ(tenant, action, err.message, payload);

    return {
      success: false,
      message: `Sovereign hata: ${err.message}`,
      duration,
      creditUsed: 0,
    };
  }
}
