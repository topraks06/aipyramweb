/**
 * ALOHA DLQ (Dead Letter Queue)
 * 
 * Sessiz catch bloklarinin yerini alan yapilandirilmis hata kaydi.
 * Her hata system_errors Firestore koleksiyonuna kaydedilir.
 * 
 * Kullanim:
 *   import { dlq } from './dlq';
 *   try { ... } catch (err) { await dlq.record(err, 'autoRunner', 'trtex', 'cron_lock'); }
 */

import { adminDb } from '@/lib/firebase-admin';

// Hata kategorileri
export type ErrorCategory =
  | 'api_failure'
  | 'parse_error'
  | 'timeout'
  | 'permission_denied'
  | 'rate_limit'
  | 'validation_error'
  | 'state_error'
  | 'unknown';

export interface DLQEntry {
  id?: string;
  category: ErrorCategory;
  message: string;
  stack?: string;
  source: string;
  project: string;
  context?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  retryable: boolean;
  retry_count: number;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

// Throttle - ayni hata 5dk icinde max 3 kez
const _errorThrottle = new Map<string, { count: number; firstSeen: number }>();
const THROTTLE_WINDOW_MS = 5 * 60 * 1000;
const THROTTLE_MAX_COUNT = 3;

function shouldThrottle(errorKey: string): boolean {
  const now = Date.now();
  const existing = _errorThrottle.get(errorKey);

  if (!existing || (now - existing.firstSeen) > THROTTLE_WINDOW_MS) {
    _errorThrottle.set(errorKey, { count: 1, firstSeen: now });
    return false;
  }

  existing.count++;
  return existing.count > THROTTLE_MAX_COUNT;
}

function cleanupThrottle(): void {
  const now = Date.now();
  for (const [key, val] of _errorThrottle) {
    if (now - val.firstSeen > THROTTLE_WINDOW_MS * 2) {
      _errorThrottle.delete(key);
    }
  }
}

// Otomatik siniflandirma
function classifyError(err: Error | string): { category: ErrorCategory; severity: DLQEntry['severity']; retryable: boolean } {
  const msg = typeof err === 'string' ? err : (err.message || '');
  const lower = msg.toLowerCase();

  if (lower.includes('permission_denied') || lower.includes('insufficient permissions')) {
    return { category: 'permission_denied', severity: 'critical', retryable: false };
  }
  if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('rate limit') || lower.includes('quota')) {
    return { category: 'rate_limit', severity: 'high', retryable: true };
  }
  if (lower.includes('timeout') || lower.includes('deadline') || lower.includes('econnreset') || lower.includes('socket hang up')) {
    return { category: 'timeout', severity: 'high', retryable: true };
  }
  if (lower.includes('json') || lower.includes('parse') || lower.includes('unexpected token') || lower.includes('syntaxerror')) {
    return { category: 'parse_error', severity: 'medium', retryable: false };
  }
  if (lower.includes('api') || lower.includes('fetch') || lower.includes('http') || lower.includes('500') || lower.includes('503')) {
    return { category: 'api_failure', severity: 'high', retryable: true };
  }
  if (lower.includes('validation') || lower.includes('required') || lower.includes('invalid')) {
    return { category: 'validation_error', severity: 'medium', retryable: false };
  }

  return { category: 'unknown', severity: 'medium', retryable: false };
}

// PUBLIC API
export const dlq = {
  /**
   * Hatayi DLQ'ya kaydet
   */
  async record(
    err: Error | string | unknown,
    source: string,
    project: string = 'system',
    context?: string
  ): Promise<void> {
    const error = err instanceof Error ? err : new Error(String(err || 'Unknown error'));
    const { category, severity, retryable } = classifyError(error);

    // Throttle
    const throttleKey = source + ':' + category + ':' + (error.message || '').substring(0, 50);
    if (shouldThrottle(throttleKey)) {
      return;
    }

    // Console
    const icon = severity === 'critical' ? '[CRITICAL]' : severity === 'high' ? '[HIGH]' : '[MEDIUM]';
    console.error('[DLQ] ' + icon + ' [' + source + '] ' + category + ': ' + (error.message || '').substring(0, 200));

    if (!adminDb) return;

    try {
      const entry: Omit<DLQEntry, 'id'> = {
        category,
        message: (error.message || 'No message').substring(0, 2000),
        stack: (error.stack || '').substring(0, 1000) || undefined,
        source,
        project,
        context: context || undefined,
        severity,
        timestamp: new Date().toISOString(),
        retryable,
        retry_count: 0,
        resolved: false,
      };

      // Deterministik ID (idempotent)
      const dateKey = new Date().toISOString().split('T')[0];
      const errorHash = (source + '_' + category + '_' + (error.message || '').substring(0, 30)).replace(/[^a-zA-Z0-9_]/g, '_');
      const docId = dateKey + '_' + errorHash;

      await adminDb.collection('system_errors').doc(docId).set(entry, { merge: true });
    } catch (writeErr) {
      console.error('[DLQ] Firestore yazma da basarisiz! Orijinal hata: ' + error.message);
    }

    cleanupThrottle();
  },

  /**
   * Kisa form - eski sessiz catch yerini alan
   */
  async recordSilent(
    err: unknown,
    source: string,
    project: string = 'system'
  ): Promise<void> {
    await this.record(err, source, project);
  },

  /**
   * Cozulmemis kritik hatalari getir
   */
  async getUnresolved(limit: number = 20): Promise<DLQEntry[]> {
    if (!adminDb) return [];

    try {
      const snap = await adminDb.collection('system_errors')
        .where('resolved', '==', false)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      return snap.docs.map(d => ({ id: d.id, ...d.data() } as DLQEntry));
    } catch {
      return [];
    }
  },

  /**
   * Hatayi cozuldu olarak isaretle
   */
  async resolve(errorId: string, resolvedBy: string = 'aloha_auto'): Promise<void> {
    if (!adminDb) return;

    try {
      await adminDb.collection('system_errors').doc(errorId).update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
      });
    } catch {
      console.warn('[DLQ] Hata cozumleme basarisiz: ' + errorId);
    }
  },

  /**
   * Son 24 saatteki hata ozetini dondur
   */
  async getDailySummary(): Promise<{
    total: number;
    critical: number;
    byCategory: Record<string, number>;
    bySource: Record<string, number>;
  }> {
    if (!adminDb) return { total: 0, critical: 0, byCategory: {}, bySource: {} };

    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const snap = await adminDb.collection('system_errors')
        .where('timestamp', '>=', oneDayAgo)
        .limit(200)
        .get();

      const byCategory: Record<string, number> = {};
      const bySource: Record<string, number> = {};
      let critical = 0;

      for (const doc of snap.docs) {
        const data = doc.data() as DLQEntry;
        byCategory[data.category] = (byCategory[data.category] || 0) + 1;
        bySource[data.source] = (bySource[data.source] || 0) + 1;
        if (data.severity === 'critical') critical++;
      }

      return { total: snap.size, critical, byCategory, bySource };
    } catch {
      return { total: 0, critical: 0, byCategory: {}, bySource: {} };
    }
  },
};
