/**
 * SOVEREIGN AUTHORITY — Merkezi Ajan Yetki ve Bütçe Kontrol Katmanı v2.0
 * 
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  TÜM NODE AJANLARI BU MODÜLDEN GÖREV VE YETKİ ALIR          ║
 * ║  AIPyram = BEYİN. Diğer node'lar = DUMB CLIENT.             ║
 * ║  TEK GİRİŞ NOKTASI: executeTask() — bypass yok.             ║
 * ╚═══════════════════════════════════════════════════════════════╝
 * 
 * Hakan Bey Feedback (v2.0):
 * 1. ✅ Hard Lock — Tek giriş noktası (executeTask)
 * 2. ✅ Action-Level Control — Node değil, aksiyon bazlı yetki
 * 3. ✅ Cost Control — Adet değil, para ($) kontrolü
 * 4. ✅ Kill Switch — aloha_system_state/global tek tuşla dur
 * 5. ✅ Audit Log — Her aksiyon kayıt altında
 * 6. ✅ Render Tipi — curtain/wall/sofa/full_room
 * 
 * Sovereign Bypass: hakantoprak71@gmail.com → tüm limitleri atlar
 */

import { adminDb } from '@/lib/firebase-admin';

// ═══════════════════════════════════════
//  TİP TANIMLARI
// ═══════════════════════════════════════

/** Sistemin desteklediği aksiyon tipleri */
export type ActionType = 
  | 'text_generation'      // Gemini text üretim
  | 'image_generation'     // Gemini Image / Imagen render
  | 'image_to_image_generation' // Imagen Image-to-Image
  | 'embedding'            // Embedding vektör
  | 'news_pipeline'        // Otonom haber pipeline
  | 'seo_indexing'         // Google Index API
  | 'agent_communication'  // Ajanlar arası iletişim
  | 'data_write'           // Firestore yazma
  | 'web_search';          // Web arama

/** Render tipleri — ileride otomatik fiyat/sipariş/Perde.ai entegrasyonu */
export type RenderType = 'curtain' | 'wall' | 'sofa' | 'full_room' | 'bedding' | 'outdoor' | 'generic';

export interface NodeBudget {
  nodeId: string;
  dailyTokenBudget: number;
  dailyRenderBudget: number;
  dailyCallLimit: number;
  dailyCostLimitUSD: number;     // 💰 Günlük maliyet limiti ($)
  costPerRender: number;          // 💰 Render başına maliyet ($)
  costPerTextCall: number;        // 💰 Text çağrısı başına maliyet ($)
  allowedActions: ActionType[];   // 🧠 Bu node hangi aksiyonları yapabilir
  renderEnabled: boolean;
  autonomousEnabled: boolean;
  allowedRenderTypes?: RenderType[]; // 🎯 İzin verilen render tipleri
}

export interface AuthorityCheck {
  allowed: boolean;
  reason: string;
  maxTokens?: number;
  maxRenders?: number;
  toolsAllowed?: string[];
  remainingBudget?: {
    tokens: number;
    renders: number;
    calls: number;
    costUSD: number;
  };
}

export interface AuditLogEntry {
  timestamp: string;
  nodeId: string;
  agentId: string;
  action: ActionType;
  approved: boolean;
  reason: string;
  costUSD?: number;
  renderType?: RenderType;
}

// ═══════════════════════════════════════
//  KONFİGÜRASYON
// ═══════════════════════════════════════

const SOVEREIGN_BYPASS_EMAIL = 'hakantoprak71@gmail.com';

/** Render tipine göre maliyet çarpanı */
const RENDER_TYPE_COST_MULTIPLIER: Record<RenderType, number> = {
  curtain: 1.0,
  wall: 1.0,
  sofa: 1.2,
  full_room: 1.5,     // Tam oda daha karmaşık, daha pahalı
  bedding: 1.0,
  outdoor: 1.2,
  generic: 1.0,
};

/**
 * Node bazlı bütçe haritası — ACTION-LEVEL CONTROL
 * Her node SADECE izin verilen aksiyonları yapabilir.
 */
const DEFAULT_NODE_BUDGETS: Record<string, NodeBudget> = {
  icmimar: {
    nodeId: 'icmimar',
    dailyTokenBudget: 30_000,
    dailyRenderBudget: 10,
    dailyCallLimit: 50,
    dailyCostLimitUSD: 2.00,       // Günde max $2
    costPerRender: 0.04,            // Imagen ~$0.04/render
    costPerTextCall: 0.0003,        // Flash-Lite ~$0.0003/çağrı
    allowedActions: ['image_generation', 'text_generation', 'embedding', 'data_write'],
    renderEnabled: true,
    autonomousEnabled: false,
    allowedRenderTypes: ['curtain', 'wall', 'sofa', 'full_room', 'bedding', 'outdoor'],
  },
  trtex: {
    nodeId: 'trtex',
    dailyTokenBudget: 20_000,
    dailyRenderBudget: 0,
    dailyCallLimit: 30,
    dailyCostLimitUSD: 0.50,
    costPerRender: 0.04,
    costPerTextCall: 0.0003,
    allowedActions: ['text_generation', 'embedding', 'news_pipeline', 'seo_indexing', 'web_search', 'agent_communication', 'data_write'],
    renderEnabled: false,
    autonomousEnabled: true,
  },
  perde: {
    nodeId: 'perde',
    dailyTokenBudget: 15_000,
    dailyRenderBudget: 5,
    dailyCallLimit: 20,
    dailyCostLimitUSD: 0.50,
    costPerRender: 0.04,
    costPerTextCall: 0.0003,
    allowedActions: ['text_generation', 'embedding', 'data_write'],
    renderEnabled: false,
    autonomousEnabled: false,
  },
  hometex: {
    nodeId: 'hometex',
    dailyTokenBudget: 10_000,
    dailyRenderBudget: 0,
    dailyCallLimit: 15,
    dailyCostLimitUSD: 0.30,
    costPerRender: 0.04,
    costPerTextCall: 0.0003,
    allowedActions: ['text_generation', 'embedding', 'data_write'],
    renderEnabled: false,
    autonomousEnabled: false,
  },
  vorhang: {
    nodeId: 'vorhang',
    dailyTokenBudget: 10_000,
    dailyRenderBudget: 0,
    dailyCallLimit: 15,
    dailyCostLimitUSD: 0.30,
    costPerRender: 0.04,
    costPerTextCall: 0.0003,
    allowedActions: ['text_generation', 'embedding', 'data_write'],
    renderEnabled: false,
    autonomousEnabled: false,
  },
  heimtex: {
    nodeId: 'heimtex',
    dailyTokenBudget: 10_000,
    dailyRenderBudget: 0,
    dailyCallLimit: 15,
    dailyCostLimitUSD: 0.30,
    costPerRender: 0.04,
    costPerTextCall: 0.0003,
    allowedActions: ['text_generation', 'embedding', 'news_pipeline', 'data_write'],
    renderEnabled: false,
    autonomousEnabled: true,
  },
  curtaindesign: {
    nodeId: 'curtaindesign',
    dailyTokenBudget: 10_000,
    dailyRenderBudget: 0,
    dailyCallLimit: 15,
    dailyCostLimitUSD: 0.30,
    costPerRender: 0.04,
    costPerTextCall: 0.0003,
    allowedActions: ['text_generation', 'embedding', 'data_write'],
    renderEnabled: false,
    autonomousEnabled: false,
  },
};

// ═══════════════════════════════════════
//  RUNTIME KULLANIM TAKİBİ (IN-MEMORY)
// ═══════════════════════════════════════

interface NodeUsage {
  tokensUsed: number;
  rendersUsed: number;
  callsUsed: number;
  dailyCostUSD: number;        // 💰 Bugün harcanan toplam $
  lastReset: string;
}

const _nodeUsage: Record<string, NodeUsage> = {};

function getOrResetUsage(nodeId: string): NodeUsage {
  const today = new Date().toISOString().split('T')[0];
  
  if (!_nodeUsage[nodeId] || _nodeUsage[nodeId].lastReset !== today) {
    _nodeUsage[nodeId] = {
      tokensUsed: 0,
      rendersUsed: 0,
      callsUsed: 0,
      dailyCostUSD: 0,
      lastReset: today,
    };
  }
  
  return _nodeUsage[nodeId];
}

// ═══════════════════════════════════════
//  FIRESTORE RUNTIME OVERRIDE (60s TTL)
// ═══════════════════════════════════════

let _overrideCache: Record<string, { data: Partial<NodeBudget>; fetchedAt: number }> = {};
const OVERRIDE_TTL_MS = 60_000;

async function fetchFirestoreOverride(nodeId: string): Promise<Partial<NodeBudget> | null> {
  const cached = _overrideCache[nodeId];
  if (cached && Date.now() - cached.fetchedAt < OVERRIDE_TTL_MS) {
    return cached.data;
  }

  if (!adminDb) return null;

  try {
    const doc = await adminDb.collection('sovereign_agent_authority').doc(nodeId).get();
    if (doc.exists) {
      const data = doc.data() as Partial<NodeBudget>;
      _overrideCache[nodeId] = { data, fetchedAt: Date.now() };
      return data;
    }
  } catch {
    // Firestore kapalıysa sessiz devam et
  }

  return null;
}

// ═══════════════════════════════════════
//  GLOBAL KILL SWITCH (aloha_system_state/global)
// ═══════════════════════════════════════

let _systemLocked = false;
let _systemLockReason = '';
let _lastLockCheck = 0;
const LOCK_CHECK_TTL_MS = 30_000; // 30 saniye

async function checkGlobalLockdown(): Promise<{ locked: boolean; reason: string }> {
  // Cache kontrolü
  if (Date.now() - _lastLockCheck < LOCK_CHECK_TTL_MS) {
    return { locked: _systemLocked, reason: _systemLockReason };
  }
  _lastLockCheck = Date.now();

  if (!adminDb) return { locked: false, reason: '' };

  try {
    const doc = await adminDb.collection('aloha_system_state').doc('global').get();
    if (doc.exists) {
      const data = doc.data();
      _systemLocked = data?.lockdown === true || data?.global_kill_switch === true;
      _systemLockReason = data?.reason || 'Sistem yönetici tarafından durduruldu.';
    }
  } catch {
    // Firestore hatası — mevcut durumu koru
  }

  return { locked: _systemLocked, reason: _systemLockReason };
}

// ═══════════════════════════════════════
//  AUDIT LOG — Her aksiyonu kayıt altına al
// ═══════════════════════════════════════

const _auditBuffer: AuditLogEntry[] = [];
const AUDIT_BUFFER_MAX = 50;

function normalizeNodeId(nodeId: string): string {
  return nodeId.toLowerCase().replace('.ai', '').replace('.com', '');
}

/**
 * Audit log kaydı — in-memory buffer + async Firestore flush
 */
export function logAudit(entry: AuditLogEntry): void {
  _auditBuffer.push(entry);
  
  // Buffer taşması koruması
  if (_auditBuffer.length > AUDIT_BUFFER_MAX) {
    _auditBuffer.splice(0, _auditBuffer.length - AUDIT_BUFFER_MAX);
  }

  // Async Firestore yazma (fire & forget)
  if (adminDb && process.env.NODE_ENV !== 'development') {
    adminDb.collection('sovereign_audit_log').add(entry).catch(() => {});
  }
}

/** Son audit loglarını oku (dashboard için) */
export function getRecentAuditLogs(limit: number = 20): AuditLogEntry[] {
  return _auditBuffer.slice(-limit);
}

// ═══════════════════════════════════════
//  ANA FONKSİYONLAR
// ═══════════════════════════════════════

/**
 * Node'un efektif bütçesini döndür (varsayılan + Firestore override)
 */
export async function getNodeBudget(nodeId: string): Promise<NodeBudget> {
  const normalized = normalizeNodeId(nodeId);
  
  const defaultBudget: NodeBudget = DEFAULT_NODE_BUDGETS[normalized] || {
    nodeId: normalized,
    dailyTokenBudget: 5_000,
    dailyRenderBudget: 0,
    dailyCallLimit: 10,
    dailyCostLimitUSD: 0.10,
    costPerRender: 0.04,
    costPerTextCall: 0.0003,
    allowedActions: ['text_generation'],
    renderEnabled: false,
    autonomousEnabled: false,
  };

  const override = await fetchFirestoreOverride(normalized);
  if (override) {
    return { ...defaultBudget, ...override, nodeId: normalized };
  }

  return defaultBudget;
}

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  ANA YETKİ KONTROLÜ — Action-Level Permission                ║
 * ║  Node + Aksiyon + Maliyet kontrolü tek fonksiyonda            ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */
export async function checkNodeAuthority(
  nodeId: string,
  action: ActionType,
  userEmail?: string,
  renderType?: RenderType,
): Promise<AuthorityCheck> {
  const normalized = normalizeNodeId(nodeId);
  
  // ── 0. GLOBAL KILL SWITCH ──
  const lockdown = await checkGlobalLockdown();
  if (lockdown.locked && userEmail !== SOVEREIGN_BYPASS_EMAIL) {
    logAudit({
      timestamp: new Date().toISOString(),
      nodeId: normalized,
      agentId: 'system',
      action,
      approved: false,
      reason: `LOCKDOWN: ${lockdown.reason}`,
    });
    return { allowed: false, reason: `🚨 SİSTEM KİLİTLİ: ${lockdown.reason}` };
  }

  // ── 1. SOVEREIGN BYPASS ──
  if (userEmail === SOVEREIGN_BYPASS_EMAIL) {
    logAudit({
      timestamp: new Date().toISOString(),
      nodeId: normalized,
      agentId: 'sovereign',
      action,
      approved: true,
      reason: 'Sovereign Bypass',
    });
    return {
      allowed: true,
      reason: 'Sovereign Bypass — Kurucu yetkilendirmesi',
      toolsAllowed: ['*'],
      remainingBudget: { tokens: Infinity, renders: Infinity, calls: Infinity, costUSD: Infinity },
    };
  }

  const budget = await getNodeBudget(normalized);
  const usage = getOrResetUsage(normalized);

  // ── 2. ACTION-LEVEL PERMISSION ──
  if (!budget.allowedActions.includes(action)) {
    const reason = `🚫 ${normalized} node'u "${action}" aksiyonuna yetkili DEĞİL. İzin verilen: [${budget.allowedActions.join(', ')}]`;
    logAudit({ timestamp: new Date().toISOString(), nodeId: normalized, agentId: 'authority', action, approved: false, reason });
    return { allowed: false, reason, toolsAllowed: budget.allowedActions };
  }

  // ── 3. RENDER ÖZEL KONTROLLER ──
  if (action === 'image_generation') {
    if (!budget.renderEnabled) {
      const reason = `🚫 ${normalized} render motoru KAPALI.`;
      logAudit({ timestamp: new Date().toISOString(), nodeId: normalized, agentId: 'authority', action, approved: false, reason });
      return { allowed: false, reason };
    }
    if (usage.rendersUsed >= budget.dailyRenderBudget) {
      const reason = `⚠️ ${normalized} günlük render limiti doldu: ${usage.rendersUsed}/${budget.dailyRenderBudget}`;
      logAudit({ timestamp: new Date().toISOString(), nodeId: normalized, agentId: 'authority', action, approved: false, reason });
      return { allowed: false, reason };
    }
    // Render tipi kontrolü
    if (renderType && budget.allowedRenderTypes && !budget.allowedRenderTypes.includes(renderType)) {
      const reason = `🚫 ${normalized} "${renderType}" render tipine yetkili değil.`;
      logAudit({ timestamp: new Date().toISOString(), nodeId: normalized, agentId: 'authority', action, approved: false, reason, renderType });
      return { allowed: false, reason };
    }
  }

  // ── 4. OTONOM PIPELINE KONTROLÜ ──
  if (action === 'news_pipeline' && !budget.autonomousEnabled) {
    const reason = `🚫 ${normalized} otonom pipeline KAPALI.`;
    logAudit({ timestamp: new Date().toISOString(), nodeId: normalized, agentId: 'authority', action, approved: false, reason });
    return { allowed: false, reason };
  }

  // ── 5. TOKEN BÜTÇE KONTROLÜ ──
  if (action === 'text_generation' && usage.tokensUsed >= budget.dailyTokenBudget) {
    const reason = `⚠️ ${normalized} günlük token bütçesi doldu: ${usage.tokensUsed}/${budget.dailyTokenBudget}`;
    logAudit({ timestamp: new Date().toISOString(), nodeId: normalized, agentId: 'authority', action, approved: false, reason });
    return { allowed: false, reason };
  }

  // ── 6. API ÇAĞRI LİMİTİ ──
  if (usage.callsUsed >= budget.dailyCallLimit) {
    const reason = `⚠️ ${normalized} günlük API çağrı limiti doldu: ${usage.callsUsed}/${budget.dailyCallLimit}`;
    logAudit({ timestamp: new Date().toISOString(), nodeId: normalized, agentId: 'authority', action, approved: false, reason });
    return { allowed: false, reason };
  }

  // ── 7. 💰 MALİYET KONTROLÜ ($) ──
  const estimatedCost = action === 'image_generation'
    ? budget.costPerRender * (renderType ? RENDER_TYPE_COST_MULTIPLIER[renderType] : 1)
    : budget.costPerTextCall;

  if (usage.dailyCostUSD + estimatedCost > budget.dailyCostLimitUSD) {
    const reason = `💰 ${normalized} günlük maliyet limiti aşıldı: $${usage.dailyCostUSD.toFixed(4)}/$${budget.dailyCostLimitUSD} — bu çağrı ~$${estimatedCost.toFixed(4)}`;
    logAudit({ timestamp: new Date().toISOString(), nodeId: normalized, agentId: 'authority', action, approved: false, reason, costUSD: estimatedCost });
    return { allowed: false, reason };
  }

  // ── ✅ TÜM KONTROLLERDEN GEÇTİ ──
  logAudit({
    timestamp: new Date().toISOString(),
    nodeId: normalized,
    agentId: 'authority',
    action,
    approved: true,
    reason: 'OK',
    costUSD: estimatedCost,
    renderType,
  });

  return {
    allowed: true,
    reason: 'OK',
    toolsAllowed: budget.allowedActions,
    remainingBudget: {
      tokens: budget.dailyTokenBudget - usage.tokensUsed,
      renders: budget.dailyRenderBudget - usage.rendersUsed,
      calls: budget.dailyCallLimit - usage.callsUsed,
      costUSD: budget.dailyCostLimitUSD - usage.dailyCostUSD,
    },
  };
}

// ═══════════════════════════════════════
//  KULLANIM KAYIT FONKSİYONLARI
// ═══════════════════════════════════════

export function recordNodeTokenUsage(nodeId: string, tokens: number): void {
  const normalized = normalizeNodeId(nodeId);
  const budget = DEFAULT_NODE_BUDGETS[normalized];
  const usage = getOrResetUsage(normalized);
  usage.tokensUsed += tokens;
  usage.callsUsed++;
  usage.dailyCostUSD += budget?.costPerTextCall || 0.0003;
}

export function recordNodeRenderUsage(nodeId: string, renderType?: RenderType): void {
  const normalized = normalizeNodeId(nodeId);
  const budget = DEFAULT_NODE_BUDGETS[normalized];
  const usage = getOrResetUsage(normalized);
  usage.rendersUsed++;
  usage.callsUsed++;
  const multiplier = renderType ? RENDER_TYPE_COST_MULTIPLIER[renderType] : 1;
  usage.dailyCostUSD += (budget?.costPerRender || 0.04) * multiplier;
}

/**
 * Tüm node kullanımlarının özet raporu (Unified Dashboard için)
 */
export function getSystemUsageReport(): Record<string, NodeUsage & { budget: NodeBudget }> {
  const report: Record<string, NodeUsage & { budget: NodeBudget }> = {};
  
  for (const [nodeId, usage] of Object.entries(_nodeUsage)) {
    const budget = DEFAULT_NODE_BUDGETS[nodeId] || {
      nodeId, dailyTokenBudget: 5000, dailyRenderBudget: 0, dailyCallLimit: 10,
      dailyCostLimitUSD: 0.10, costPerRender: 0.04, costPerTextCall: 0.0003,
      allowedActions: ['text_generation'], renderEnabled: false, autonomousEnabled: false,
    };
    report[nodeId] = { ...usage, budget };
  }
  
  return report;
}

/**
 * Override cache temizle + kill switch zorla kontrol et
 */
export function clearOverrideCache(): void {
  _overrideCache = {};
  _lastLockCheck = 0;
}

/**
 * Programmatik olarak sistemi kilitle (CFO ajanı veya costGuard tetikleyebilir)
 */
export async function activateGlobalLockdown(reason: string): Promise<void> {
  _systemLocked = true;
  _systemLockReason = reason;

  if (adminDb) {
    try {
      await adminDb.collection('aloha_system_state').doc('global').set({
        lockdown: true,
        global_kill_switch: true,
        reason,
        lockedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.error('[SOVEREIGN] Lockdown yazma hatası:', err);
    }
  }

  console.error(`[SOVEREIGN] 🔴 GLOBAL LOCKDOWN AKTİF: ${reason}`);
}
