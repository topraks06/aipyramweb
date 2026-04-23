/**
 * ALOHA SOVEREIGN LOGGER — İşlem Kayıt Sistemi
 * 
 * Her sovereign çağrı buraya loglanır.
 * Debug, satış kanıtı ve yatırımcı demosu için.
 * Koleksiyon: aloha_sovereign_logs
 * DLQ (Dead Letter Queue): aloha_sovereign_dlq
 */

import { adminDb } from '@/lib/firebase-admin';

// ═══════════════════════════════════════
// SOVEREIGN LOG KAYDI
// ═══════════════════════════════════════

export interface SovereignLogEntry {
  node: string;
  action: string;
  uid?: string;
  payload: Record<string, any>;
  result: Record<string, any>;
  duration: number;
  cost: number;
}

export async function logSovereignAction(entry: SovereignLogEntry): Promise<void> {
  if (!adminDb) {
    console.warn('[SOVEREIGN_LOG] adminDb yok — log kaydı atlandı');
    return;
  }

  try {
    // Payload'ı güvenli hale getir (base64 vb. kırp)
    const safePayload = JSON.parse(
      JSON.stringify(entry.payload, (_key, val) => {
        if (typeof val === 'string' && val.length > 500) return '[TRUNCATED]';
        return val;
      })
    );

    const safeResult = JSON.parse(
      JSON.stringify(entry.result || {}, (_key, val) => {
        if (typeof val === 'string' && val.length > 1000) return '[TRUNCATED]';
        return val;
      })
    );

    await adminDb.collection('aloha_sovereign_logs').add({
      node: entry.node,
      action: entry.action,
      uid: entry.uid || 'system',
      payload: safePayload,
      result: safeResult,
      duration_ms: entry.duration,
      cost: entry.cost,
      success: entry.result?.success ?? true,
      createdAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error(`[SOVEREIGN_LOG] Log kaydı başarısız: ${err.message}`);
  }
}

// ═══════════════════════════════════════
// DLQ — Dead Letter Queue (Hata Kaydı)
// ═══════════════════════════════════════

export async function logDLQ(
  node: string,
  action: string,
  error: string,
  payload: Record<string, any>
): Promise<void> {
  if (!adminDb) return;

  try {
    await adminDb.collection('aloha_sovereign_dlq').add({
      node,
      action,
      error,
      payload: JSON.stringify(payload).substring(0, 2000),
      createdAt: new Date().toISOString(),
      resolved: false,
    });
    console.error(`[DLQ] Hata kaydı oluşturuldu: ${node}/${action} → ${error}`);
  } catch (err: any) {
    console.error(`[DLQ] DLQ kaydı bile başarısız: ${err.message}`);
  }
}

// ═══════════════════════════════════════
// IDEMPOTENCY CHECK (Double-call koruması)
// ═══════════════════════════════════════

export async function checkIdempotency(
  idempotencyKey: string
): Promise<any | null> {
  if (!adminDb || !idempotencyKey) return null;

  try {
    const ref = adminDb.collection('aloha_idempotency').doc(idempotencyKey);
    const snap = await ref.get();

    if (snap.exists) {
      const data = snap.data();
      // 1 saat içindeki kayıtları geçerli say
      const createdAt = new Date(data?.createdAt || 0).getTime();
      if (Date.now() - createdAt < 3600_000) {
        console.log(`[IDEMPOTENCY] Duplicate çağrı engellendi: ${idempotencyKey}`);
        return data?.result || { success: true, message: 'Already processed' };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveIdempotency(
  idempotencyKey: string,
  result: any
): Promise<void> {
  if (!adminDb || !idempotencyKey) return;

  try {
    await adminDb.collection('aloha_idempotency').doc(idempotencyKey).set({
      result,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Sessiz hata — kritik değil
  }
}
