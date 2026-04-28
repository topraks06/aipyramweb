import { adminDb } from '@/lib/firebase-admin';

/**
 * TRTEX EXECUTIVE LAYER — Aloha'nın "CEO Beyni"
 * 
 * 4 Kritik Katman:
 * 1. Task Memory — ne yaptı, ne öğrendi, neden başarılı/başarısız
 * 2. Self-Triggered Actions — kendi aksiyonunu kendi başlatır
 * 3. Confidence Scoring — kesin mi, tahmin mi, düşük güven mi
 * 4. Executive Decision — son kararı veren katman (hangi kural önemli, hangisi override)
 * 
 * Mimari Pozisyon:
 * Feed → Rule → Decision → EXECUTIVE → Action
 *                              ↕
 *                          Task Memory (öğrenme döngüsü)
 */

// ═══════════════════════════════════════
// 1. TASK MEMORY — ÖĞRENİP GELİŞEN SİSTEM
// ═══════════════════════════════════════

export interface TaskMemoryEntry {
  id: string;
  task: string;                // 'ticker_update' | 'compose_article' | 'lead_capture' | 'price_alert'
  timestamp: string;
  input_context: string;       // Giriş durumu
  result: string;              // Çıktı
  outcome: string;             // Sonuç (olumlu/olumsuz)
  metrics?: {
    lead_change?: number;      // Lead sayısı değişimi
    traffic_change?: number;   // Trafik etkisi
    engagement?: number;       // Etkileşim oranı
  };
  learning: string;            // "PTA spike = polyester lead artışı"
  confidence: number;          // 0-1 kesinlik
  should_repeat: boolean;      // Bu stratejyi tekrarla mı?
}

/**
 * Görevi yürüt, sonucunu kaydet ve öğrenme çıkar
 */
export async function recordTaskOutcome(entry: Omit<TaskMemoryEntry, 'id'>): Promise<void> {
  if (!adminDb) return;

  const id = `task_${Date.now()}_${crypto.randomUUID().substring(0, 6)}`;
  const fullEntry: TaskMemoryEntry = { ...entry, id };

  try {
    await adminDb.collection('trtex_task_memory').doc(id).set(fullEntry);

    // Son 50 öğrenmeyi tut (eski olanları temizleme — sadece yaz)
    console.log(`[EXECUTIVE] 📝 Task kaydedildi: ${entry.task} → ${entry.learning}`);
  } catch (err: any) {
    console.warn(`[EXECUTIVE] Task kayıt hatası:`, err.message);
  }
}

/**
 * Geçmiş öğrenmelerden dersler çıkar
 * "Bu durumda daha önce ne yaptık? Sonucu ne oldu?"
 */
export async function getRelevantLearnings(taskType: string, limit = 10): Promise<TaskMemoryEntry[]> {
  if (!adminDb) return [];

  try {
    const snap = await adminDb.collection('trtex_task_memory')
      .where('task', '==', taskType)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snap.docs.map(d => d.data() as TaskMemoryEntry);
  } catch {
    return [];
  }
}

/**
 * Başarılı stratejileri bul (should_repeat = true)
 */
export async function getSuccessfulStrategies(limit = 5): Promise<TaskMemoryEntry[]> {
  if (!adminDb) return [];

  try {
    const snap = await adminDb.collection('trtex_task_memory')
      .where('should_repeat', '==', true)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snap.docs.map(d => d.data() as TaskMemoryEntry);
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════
// 2. SELF-TRIGGERED ACTIONS — KENDİ AKSİYONUNU BAŞLATIR
// ═══════════════════════════════════════

export interface AutoAction {
  id: string;
  trigger: string;              // 'pta_spike' | 'freight_crisis' | 'lead_drop'
  action: string;               // 'auto_price_draft' | 'flash_news' | 'lead_campaign'
  confidence: number;
  params: Record<string, any>;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  created_at: string;
}

/**
 * Piyasa koşullarına göre otomatik aksiyon başlat
 * İnsan tetiklemez — sistem kendi karar verir
 */
export async function evaluateAutoActions(
  marketData: Record<string, any>,
  recentLearnings: TaskMemoryEntry[]
): Promise<AutoAction[]> {
  const actions: AutoAction[] = [];
  const now = new Date().toISOString();

  // Geçmiş öğrenmelerden başarılı stratejileri kontrol et
  const successPatterns = recentLearnings.filter(l => l.should_repeat && l.confidence > 0.6);

  // ── PTA SPIKE → Otomatik Fiyat Taslağı ──
  const ptaChange = marketData.commodities?.pta?.change_30d || 0;
  if (ptaChange > 3) {
    actions.push({
      id: `auto_${Date.now()}_pta_price`,
      trigger: 'pta_spike',
      action: 'auto_price_draft',
      confidence: calculateConfidence('pta_spike', ptaChange, successPatterns),
      params: {
        affected_products: ['polyester_perde', 'blackout', 'tül', 'döşemelik'],
        change_percent: ptaChange,
        suggestion: `PTA %${ptaChange.toFixed(1)} arttı. Polyester bazlı ürünler için yeni fiyat listesi taslağı hazırlanıyor.`,
      },
      status: 'pending',
      created_at: now,
    });
  }

  // ── NAVLUN KRİZİ → Otomatik Lojistik Uyarısı ──
  const freightChange = marketData.logistics?.shanghai_freight?.change_30d || 0;
  if (freightChange > 5) {
    actions.push({
      id: `auto_${Date.now()}_freight_alert`,
      trigger: 'freight_crisis',
      action: 'logistics_alert',
      confidence: calculateConfidence('freight_crisis', freightChange, successPatterns),
      params: {
        routes_affected: ['China-Turkey', 'China-Europe'],
        impact: `Konteyner navlunu %${freightChange.toFixed(1)} arttı`,
        recommendation: 'Acil stok kontrolü ve alternatif rota araştırması başlatlıdı',
      },
      status: 'pending',
      created_at: now,
    });
  }

  // ── KUR ATLAMI → Otomatik İhracat Fiyat Güncelleme ──
  const fxChange = marketData.forex?.usd_try?.change_24h || 0;
  if (Math.abs(fxChange) > 2) {
    actions.push({
      id: `auto_${Date.now()}_fx_pricing`,
      trigger: 'fx_jump',
      action: 'auto_export_pricing',
      confidence: calculateConfidence('fx_jump', Math.abs(fxChange), successPatterns),
      params: {
        direction: fxChange > 0 ? 'TL_weakening' : 'TL_strengthening',
        change: fxChange,
        suggestion: fxChange > 0
          ? `TL %${Math.abs(fxChange).toFixed(1)} zayıfladı. İhracat fiyatlarınız daha rekabetçi. Yeni teklif hazırlayın.`
          : `TL %${Math.abs(fxChange).toFixed(1)} güçlendi. İthalat avantajı doğdu. Hammadde alımı değerlendirin.`,
      },
      status: 'pending',
      created_at: now,
    });
  }

  // ── LEAD DÜŞÜŞÜ → Otomatik İçerik Kampanyası ──
  // (Önceki döngüdeki lead sayısıyla karşılaştır)
  if (marketData._lead_stats?.daily_leads !== undefined && marketData._lead_stats.daily_leads < 1) {
    actions.push({
      id: `auto_${Date.now()}_lead_campaign`,
      trigger: 'lead_drop',
      action: 'content_campaign',
      confidence: 0.6,
      params: {
        strategy: 'Yüksek impact kategoride 3 ek haber üret + fırsat radarı güçlendir',
        focus: 'perde_focused', // Perde içerikler daha fazla lead getirir
      },
      status: 'pending',
      created_at: now,
    });
  }

  // ── FIRSAT PENCERESI → Otomatik Buyer Outreach ──
  const cottonChange = marketData.commodities?.cotton?.change_30d || 0;
  const brentChange = marketData.commodities?.brent?.change_30d || 0;
  if (cottonChange < -3 && brentChange < -2) {
    actions.push({
      id: `auto_${Date.now()}_opportunity`,
      trigger: 'cost_window',
      action: 'buyer_outreach',
      confidence: 0.75,
      params: {
        message: 'Pamuk ve lojistik maliyetleri düşüyor. Alıcılara özel kampanya fırsatı.',
        target_segments: ['buyer', 'wholesaler'],
      },
      status: 'pending',
      created_at: now,
    });
  }

  // Firestore'a kaydet
  if (adminDb && actions.length > 0) {
    for (const action of actions) {
      try {
        await adminDb.collection('trtex_auto_actions').doc(action.id).set(action);
      } catch { /* sessiz */ }
    }
    console.log(`[EXECUTIVE] 🚀 ${actions.length} otomatik aksiyon başlatıldı`);
  }

  return actions;
}

// ═══════════════════════════════════════
// 3. CONFIDENCE SCORING
// ═══════════════════════════════════════

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ConfidenceResult {
  score: number;        // 0-1
  level: ConfidenceLevel;
  reasoning: string;
  ui_behavior: 'auto_execute' | 'suggest' | 'ticker_only';
}

/**
 * Bir kararın güven seviyesini hesapla
 * Geçmiş başarılar + veri kalitesi + sinyal gücü
 */
function calculateConfidence(
  triggerType: string,
  signalStrength: number,
  pastSuccesses: TaskMemoryEntry[]
): number {
  let confidence = 0.5; // Baz

  // Sinyal gücü — ne kadar büyük değişim o kadar kesin
  const strength = Math.min(signalStrength / 10, 0.3);
  confidence += strength;

  // Geçmiş başarılar — bu trigger daha önce başarılı olduysa güven artar
  const relatedSuccesses = pastSuccesses.filter(s =>
    s.task.includes(triggerType) || s.input_context.includes(triggerType)
  );
  if (relatedSuccesses.length > 0) {
    const avgPastConfidence = relatedSuccesses.reduce((sum, s) => sum + s.confidence, 0) / relatedSuccesses.length;
    confidence += avgPastConfidence * 0.2;
  }

  return Math.min(0.95, Math.max(0.1, confidence));
}

/**
 * Güven seviyesine göre UI davranışı belirle
 */
export function getConfidenceBehavior(score: number): ConfidenceResult {
  if (score >= 0.8) {
    return {
      score, level: 'high',
      reasoning: 'Yüksek güven: Veriler tutarlı ve geçmiş deneyimler destekliyor.',
      ui_behavior: 'auto_execute',
    };
  } else if (score >= 0.5) {
    return {
      score, level: 'medium',
      reasoning: 'Orta güven: Veri yeterli ama kesinlik düşük. Öneri olarak sun.',
      ui_behavior: 'suggest',
    };
  } else {
    return {
      score, level: 'low',
      reasoning: 'Düşük güven: Yetersiz veri veya çelişen sinyaller. Sadece bilgilendirme.',
      ui_behavior: 'ticker_only',
    };
  }
}

// ═══════════════════════════════════════
// 4. EXECUTIVE DECISION — SON KARAR KATMANI
// ═══════════════════════════════════════

export interface ExecutiveDecision {
  timestamp: string;
  market_state: 'favorable' | 'cautious' | 'warning';
  net_impact_score: number;
  active_rules_fired: number;
  auto_actions_triggered: number;
  confidence_avg: number;
  // CEO Brief
  daily_brief: {
    headline: string;
    key_changes: string[];
    risks: string[];
    opportunities: string[];
    recommended_actions: string[];
  };
  // Öğrenme
  learnings_applied: number;
  successful_strategies_reused: number;
}

/**
 * Tüm katmanları birleştir ve günlük CEO kararı üret
 * Bu fonksiyon autoRunner'da çağrılır — günde 1 kez
 */
export async function makeExecutiveDecision(
  netImpact: { score: number; verdict: string; summary: string; recommended_action: string },
  rulesFired: number,
  autoActions: AutoAction[],
  recentLearnings: TaskMemoryEntry[]
): Promise<ExecutiveDecision> {
  const now = new Date().toISOString();

  // Güven ortalaması
  const avgConfidence = autoActions.length > 0
    ? autoActions.reduce((s, a) => s + a.confidence, 0) / autoActions.length
    : 0.5;

  // Başarılı stratejiler
  const successfulStrategies = recentLearnings.filter(l => l.should_repeat);

  // CEO Brief oluştur
  const headline = netImpact.score > 0.3
    ? '⚠️ Maliyet baskısı artıyor — acil aksiyon gerekiyor'
    : netImpact.score < -0.2
    ? '🟢 Fırsat penceresi açık — agresif hareket zamanı'
    : '📊 Piyasa stabil — mevcut stratejiyi sürdür';

  const key_changes: string[] = [];
  const risks: string[] = [];
  const opportunities: string[] = [];
  const recommended_actions: string[] = [];

  // Auto action'lardan brief doldur
  for (const action of autoActions) {
    if (action.trigger === 'pta_spike' || action.trigger === 'freight_crisis' || action.trigger === 'fx_jump') {
      key_changes.push(action.params.suggestion || action.params.impact || action.trigger);
      if (action.confidence > 0.7) {
        recommended_actions.push(`${action.action}: ${action.params.suggestion || ''}`);
      }
    }
    if (action.trigger === 'freight_crisis' || action.trigger === 'fx_jump') {
      risks.push(action.params.impact || action.trigger);
    }
    if (action.trigger === 'cost_window') {
      opportunities.push(action.params.message || 'Maliyet düşüşü fırsatı');
    }
  }

  // Geçmiş öğrenmelerden tavsiye
  if (successfulStrategies.length > 0) {
    recommended_actions.push(`📚 Geçmiş başarılı strateji: "${successfulStrategies[0].learning}"`);
  }

  // Eğer hiçbir şey yoksa varsayılan
  if (key_changes.length === 0) key_changes.push('Bugün önemli bir piyasa değişimi yok');
  if (recommended_actions.length === 0) recommended_actions.push('Mevcut stratejiyi sürdür, fırsatları izle');

  const decision: ExecutiveDecision = {
    timestamp: now,
    market_state: netImpact.score > 0.3 ? 'warning' : netImpact.score < -0.2 ? 'favorable' : 'cautious',
    net_impact_score: netImpact.score,
    active_rules_fired: rulesFired,
    auto_actions_triggered: autoActions.length,
    confidence_avg: parseFloat(avgConfidence.toFixed(2)),
    daily_brief: {
      headline,
      key_changes,
      risks,
      opportunities,
      recommended_actions,
    },
    learnings_applied: recentLearnings.length,
    successful_strategies_reused: successfulStrategies.length,
  };

  // Firestore'a kaydet
  if (adminDb) {
    try {
      await adminDb.collection('trtex_intelligence').doc('executive_brief').set(decision);
      // Tarihsel kayıt
      await adminDb.collection('trtex_executive_history').add(decision);
      console.log(`[EXECUTIVE] 🎯 CEO Brief: ${headline}`);
    } catch (err: any) {
      console.warn(`[EXECUTIVE] Brief kayıt hatası:`, err.message);
    }
  }

  return decision;
}
