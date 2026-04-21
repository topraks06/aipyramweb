import { adminDb } from '@/lib/firebase-admin';
import { dlq } from './dlq';

/**
 * TRTEX CONTROL TOWER — Güvenlik & Fren Katmanı
 * 
 * "Güç kontrolsüz büyürse silah olur" — bu modül sistemi sınırlar.
 * 
 * 4 Bileşen:
 * 1. Cycle Guard — döngü başına limit (article, lead, flash)
 * 2. Signal Dedup — aynı sinyali 1 kere işle, spam engelle
 * 3. Human Override — yüksek impactli kararlar insan onayı ister
 * 4. Impact Scoring Gate — düşük güvenli kararları engelle
 */

// ═══════════════════════════════════════
// 1. CYCLE GUARD — DÖNGÜ LİMİTLERİ
// ═══════════════════════════════════════

export interface CycleState {
  cycleId: string;
  startedAt: string;
  tickerUpdated: boolean;
  rulesEvaluated: boolean;
  conflictsResolved: boolean;
  executiveDecisionMade: boolean;
  // Limitler
  articlesProduced: number;
  leadsProcessed: number;
  flashNewsAdded: number;
  actionCardsCreated: number;
  autoActionsTriggered: number;
  // Durum
  halted: boolean;
  haltReason?: string;
}

const CYCLE_LIMITS = {
  maxArticles: 3,          // Döngü başına max haber
  maxLeads: 5,             // Döngü başına max lead işleme
  maxFlashNews: 2,         // Döngü başına max flash
  maxActionCards: 5,       // Döngü başına max aksiyon kartı
  maxAutoActions: 3,       // Döngü başına max otonom aksiyon
  minCycleIntervalMs: 600000, // İki döngü arası minimum 10 dk
};

let _currentCycle: CycleState | null = null;
let _cycleLoadedFromFirestore = false;

/**
 * Firestore'dan son cycle state'i yukle (container restart sonrasi)
 */
async function loadCycleFromFirestore(): Promise<CycleState | null> {
  if (!adminDb) return null;
  try {
    const doc = await adminDb.collection('system_state').doc('current_cycle').get();
    if (doc.exists) {
      const data = doc.data() as CycleState;
      // 10 dk'dan eski cycle — expired, yenisini baslat
      const startedAt = new Date(data.startedAt).getTime();
      if (Date.now() - startedAt > CYCLE_LIMITS.minCycleIntervalMs) {
        return null; // Expired
      }
      return data;
    }
  } catch (e) {
    await dlq.recordSilent(e, 'controlTower', 'system');
  }
  return null;
}

/**
 * Cycle state'i Firestore'a kaydet (container restart dayanikliligi)
 */
async function saveCycleToFirestore(cycle: CycleState): Promise<void> {
  if (!adminDb) return;
  try {
    await adminDb.collection('system_state').doc('current_cycle').set(cycle, { merge: true });
  } catch (e) {
    await dlq.recordSilent(e, 'controlTower', 'system');
  }
}

/**
 * Yeni dongu baslat
 */
export function startCycle(): CycleState {
  _currentCycle = {
    cycleId: 'cycle_' + Date.now(),
    startedAt: new Date().toISOString(),
    tickerUpdated: false,
    rulesEvaluated: false,
    conflictsResolved: false,
    executiveDecisionMade: false,
    articlesProduced: 0,
    leadsProcessed: 0,
    flashNewsAdded: 0,
    actionCardsCreated: 0,
    autoActionsTriggered: 0,
    halted: false,
  };
  // Arka planda Firestore'a kaydet (bloklama yok)
  saveCycleToFirestore(_currentCycle).catch(() => {});
  console.log('[CONTROL TOWER] Dongu basladi: ' + _currentCycle.cycleId);
  return _currentCycle;
}

/**
 * Donguyu bitir ve Firestore'a kaydet
 */
export async function endCycle(): Promise<void> {
  if (_currentCycle) {
    await saveCycleToFirestore(_currentCycle);
    _currentCycle = null;
  }
}

/**
 * Container restart sonrasi cycle recovery
 * autoRunner baslangicinda cagrilmali
 */
export async function recoverCycleState(): Promise<void> {
  if (_cycleLoadedFromFirestore) return;
  _cycleLoadedFromFirestore = true;
  const recovered = await loadCycleFromFirestore();
  if (recovered && !recovered.halted) {
    _currentCycle = recovered;
    console.log('[CONTROL TOWER] Firestore\'dan cycle recover edildi: ' + recovered.cycleId);
  }
}

/**
 * Limit kontrolü — izin var mı?
 */
export function canProceed(action: string): boolean {
  if (!_currentCycle) { startCycle(); }
  const c = _currentCycle!;

  if (c.halted) {
    console.log(`[CONTROL TOWER] 🛑 HALT: ${c.haltReason}`);
    return false;
  }

  switch (action) {
    case 'compose_article':
      if (c.articlesProduced >= CYCLE_LIMITS.maxArticles) {
        console.log(`[CONTROL TOWER] ⛔ Haber limiti: ${c.articlesProduced}/${CYCLE_LIMITS.maxArticles}`);
        return false;
      }
      return true;

    case 'process_lead':
      if (c.leadsProcessed >= CYCLE_LIMITS.maxLeads) {
        console.log(`[CONTROL TOWER] ⛔ Lead limiti: ${c.leadsProcessed}/${CYCLE_LIMITS.maxLeads}`);
        return false;
      }
      return true;

    case 'flash_news':
      if (c.flashNewsAdded >= CYCLE_LIMITS.maxFlashNews) {
        console.log(`[CONTROL TOWER] ⛔ Flash limiti: ${c.flashNewsAdded}/${CYCLE_LIMITS.maxFlashNews}`);
        return false;
      }
      return true;

    case 'action_card':
      if (c.actionCardsCreated >= CYCLE_LIMITS.maxActionCards) {
        console.log(`[CONTROL TOWER] ⛔ Action card limiti: ${c.actionCardsCreated}/${CYCLE_LIMITS.maxActionCards}`);
        return false;
      }
      return true;

    case 'auto_action':
      if (c.autoActionsTriggered >= CYCLE_LIMITS.maxAutoActions) {
        console.log(`[CONTROL TOWER] ⛔ Auto action limiti: ${c.autoActionsTriggered}/${CYCLE_LIMITS.maxAutoActions}`);
        return false;
      }
      return true;

    default:
      return true;
  }
}

/**
 * Aksiyon tamamlandığını bildir
 */
export function recordAction(action: string): void {
  if (!_currentCycle) return;

  switch (action) {
    case 'compose_article': _currentCycle.articlesProduced++; break;
    case 'process_lead': _currentCycle.leadsProcessed++; break;
    case 'flash_news': _currentCycle.flashNewsAdded++; break;
    case 'action_card': _currentCycle.actionCardsCreated++; break;
    case 'auto_action': _currentCycle.autoActionsTriggered++; break;
    case 'ticker_update': _currentCycle.tickerUpdated = true; break;
    case 'rules_evaluated': _currentCycle.rulesEvaluated = true; break;
    case 'conflicts_resolved': _currentCycle.conflictsResolved = true; break;
    case 'executive_decision': _currentCycle.executiveDecisionMade = true; break;
  }
}

/**
 * Döngüyü durdur (acil fren)
 */
export function haltCycle(reason: string): void {
  if (_currentCycle) {
    _currentCycle.halted = true;
    _currentCycle.haltReason = reason;
    console.log(`[CONTROL TOWER] 🛑 HALT: ${reason}`);
  }
}

/**
 * Döngü özeti al
 */
export function getCycleState(): CycleState | null {
  return _currentCycle;
}

// ═══════════════════════════════════════
// 2. SIGNAL DEDUP — AYNI SİNYALİ 1 KERE İŞLE
// ═══════════════════════════════════════

const _processedSignals = new Map<string, number>(); // hash → timestamp
const SIGNAL_DEDUP_WINDOW_MS = 3600000; // 1 saat

/**
 * Sinyal hash oluştur
 */
function signalHash(source: string, type: string): string {
  // Zaman bucket: saat bazlı (aynı saat içinde aynı sinyal = tekrar)
  const hourBucket = Math.floor(Date.now() / SIGNAL_DEDUP_WINDOW_MS);
  return `${source}:${type}:${hourBucket}`;
}

/**
 * Sinyal daha önce işlendi mi?
 */
export function isSignalDuplicate(source: string, type: string): boolean {
  const hash = signalHash(source, type);

  // Eski hash'leri temizle (memory leak önle)
  const cutoff = Date.now() - SIGNAL_DEDUP_WINDOW_MS * 2;
  for (const [key, ts] of _processedSignals) {
    if (ts < cutoff) _processedSignals.delete(key);
  }

  if (_processedSignals.has(hash)) {
    console.log(`[CONTROL TOWER] 🔄 DEDUP: ${source}:${type} zaten işlendi (skip)`);
    return true;
  }

  return false;
}

/**
 * Sinyali işlenmiş olarak kaydet
 */
export function markSignalProcessed(source: string, type: string): void {
  const hash = signalHash(source, type);
  _processedSignals.set(hash, Date.now());
}

/**
 * Birden fazla kural aynı sinyalden tetiklendiyse birleştir
 * "USD ↑ %2 → 5 kural tetikledi → 1 birleşik karara merge"
 */
export function mergeRelatedActions<T extends { id: string; trigger: string }>(
  actions: T[]
): T[] {
  const seen = new Map<string, T>();

  for (const action of actions) {
    if (!seen.has(action.trigger)) {
      seen.set(action.trigger, action);
    }
    // Aynı trigger'dan ikincisi → merge (ilkini tut)
  }

  const merged = Array.from(seen.values());
  if (merged.length < actions.length) {
    console.log(`[CONTROL TOWER] 🔀 MERGE: ${actions.length} aksiyon → ${merged.length} birleşik`);
  }
  return merged;
}

// ═══════════════════════════════════════
// 3. HUMAN OVERRIDE — İNSAN ONAYI GEREKTİREN KARARLAR
// ═══════════════════════════════════════

export interface PendingApproval {
  id: string;
  action: string;
  reason: string;
  impact_score: number;
  confidence: number;
  details: Record<string, any>;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

const HUMAN_OVERRIDE_THRESHOLDS = {
  impactScoreThreshold: 0.8,    // Net impact > 0.8 → insan onayı
  priceChangeThreshold: 5,      // Fiyat değişimi > %5 → insan onayı
  bulkLeadThreshold: 10,        // 10+ lead üstü → insan kontrolü
  autoActionConfidenceLow: 0.4, // Güven < 0.4 → otomatik engelle
};

/**
 * Bu karar insan onayı gerektiriyor mu?
 */
export function requiresHumanApproval(
  action: string,
  impactScore: number,
  confidence: number,
  context?: Record<string, any>
): { required: boolean; reason: string } {
  // Düşük güvenli kararları direkt engelle
  if (confidence < HUMAN_OVERRIDE_THRESHOLDS.autoActionConfidenceLow) {
    return {
      required: true,
      reason: `Düşük güven (${(confidence * 100).toFixed(0)}%). Otomatik aksiyon engellendi.`,
    };
  }

  // Yüksek etkili kararlar
  if (Math.abs(impactScore) > HUMAN_OVERRIDE_THRESHOLDS.impactScoreThreshold) {
    return {
      required: true,
      reason: `Yüksek etki skoru (${impactScore.toFixed(2)}). İnsan onayı gerekli.`,
    };
  }

  // Büyük fiyat değişimi
  if (action === 'auto_price_draft' && (context?.change_percent ?? 0) > HUMAN_OVERRIDE_THRESHOLDS.priceChangeThreshold) {
    return {
      required: true,
      reason: `Fiyat değişimi %${context?.change_percent} > %${HUMAN_OVERRIDE_THRESHOLDS.priceChangeThreshold}. Onay gerekli.`,
    };
  }

  // Toplu lead işleme
  if (action === 'bulk_lead_outreach' && (context?.count || 0) > HUMAN_OVERRIDE_THRESHOLDS.bulkLeadThreshold) {
    return {
      required: true,
      reason: `${context?.count} lead'e toplu mesaj. İnsan kontrolü gerekli.`,
    };
  }

  return { required: false, reason: '' };
}

/**
 * İnsan onayı bekleyen kararı Firestore'a kaydet
 */
export async function requestApproval(approval: Omit<PendingApproval, 'id' | 'status' | 'created_at'>): Promise<string> {
  const id = `approval_${Date.now()}`;
  const entry: PendingApproval = {
    ...approval,
    id,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  if (adminDb) {
    try {
      await adminDb.collection('trtex_pending_approvals').doc(id).set(entry);
      console.log(`[CONTROL TOWER] 🔒 Onay bekleniyor: ${approval.action} → ${approval.reason}`);
    } catch { /* sessiz */ }
  }

  return id;
}

// ═══════════════════════════════════════
// 4. IMPACT SCORING GATE — GEÇİŞ KAPISI
// ═══════════════════════════════════════

/**
 * Karar geçiş kapısı — tüm kontrolleri birleştir
 * autoRunner bu fonksiyonu HER aksiyon öncesi çağırır
 */
export function gateCheck(
  action: string,
  impactScore: number,
  confidence: number,
  source: string,
  context?: Record<string, any>
): {
  allowed: boolean;
  reason: string;
  requiresApproval: boolean;
} {
  // 1. Cycle limit kontrolü
  if (!canProceed(action)) {
    return {
      allowed: false,
      reason: `Döngü limiti aşıldı: ${action}`,
      requiresApproval: false,
    };
  }

  // 2. Signal dedup kontrolü
  if (isSignalDuplicate(source, action)) {
    return {
      allowed: false,
      reason: `Tekrar sinyal: ${source}:${action}`,
      requiresApproval: false,
    };
  }

  // 3. Human override kontrolü
  const override = requiresHumanApproval(action, impactScore, confidence, context);
  if (override.required) {
    return {
      allowed: false,
      reason: override.reason,
      requiresApproval: true,
    };
  }

  // 4. Düşük güven filtresi
  if (confidence < 0.3) {
    return {
      allowed: false,
      reason: `Çok düşük güven (${(confidence * 100).toFixed(0)}%). Engellendi.`,
      requiresApproval: false,
    };
  }

  // Geçiş izni
  markSignalProcessed(source, action);
  recordAction(action);
  return { allowed: true, reason: 'OK', requiresApproval: false };
}
