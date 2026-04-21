/**
 * TRTEX DECISION ENGINE — Katman 3: Conflict Resolution + Simulation + Prediction
 * 
 * 1. Conflict Resolution: Çoklu sinyalleri net etki skoruna çevir
 * 2. Scenario Simulation: Ürün bazlı maliyet hesaplama
 * 3. Prediction Layer: Trend birleşiminden gelecek tahmini
 * 
 * 4 Katmanlı Mimari:
 * Feed Layer → Rule Layer → DECISION LAYER → Action Layer
 */

// ═══════════════════════════════════════
// 1. CONFLICT RESOLUTION
// ═══════════════════════════════════════

export interface MarketSignal {
  metric: string;
  change: number;        // % değişim
  direction: 'up' | 'down' | 'stable';
  impact_category: 'commodity' | 'fx' | 'logistics';
  business_impact: number;  // 0-1 (iş etkisi)
}

export interface NetImpactResult {
  score: number;           // -1 (büyük fırsat) → 0 (nötr) → +1 (büyük risk)
  verdict: 'critical_risk' | 'moderate_risk' | 'neutral' | 'moderate_opportunity' | 'strong_opportunity';
  summary: string;
  breakdown: {
    commodity_impact: number;
    fx_impact: number;
    logistics_impact: number;
  };
  recommended_action: string;
  conflicting_signals: string[];
}

const IMPACT_WEIGHTS = {
  commodity: 0.4,   // Hammadde etkisi
  fx: 0.3,          // Döviz etkisi
  logistics: 0.3,   // Lojistik etkisi
};

/**
 * Çoklu piyasa sinyallerini birleştirip NET ETKİ SKORU hesapla
 * "USD↑ + Brent↓ + PTA↑ = net durum nedir?"
 */
export function resolveConflicts(signals: MarketSignal[]): NetImpactResult {
  // Kategorilere göre grupla
  const groups: Record<string, number[]> = { commodity: [], fx: [], logistics: [] };
  const conflicts: string[] = [];

  for (const sig of signals) {
    // Normalize: artış = pozitif maliyet (risk), düşüş = negatif maliyet (fırsat)
    const normalized = sig.direction === 'up' ? Math.abs(sig.change) : -Math.abs(sig.change);
    const weighted = (normalized / 10) * sig.business_impact; // -1 to +1 arası
    groups[sig.impact_category]?.push(weighted);
  }

  // Çakışma tespiti: aynı kategoride zıt yönler
  for (const [cat, values] of Object.entries(groups)) {
    const hasPositive = values.some(v => v > 0.1);
    const hasNegative = values.some(v => v < -0.1);
    if (hasPositive && hasNegative) {
      conflicts.push(`${cat}: çelişen sinyaller (hem risk hem fırsat)`);
    }
  }

  // Kategori ortalamalarını hesapla
  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const commodityImpact = avg(groups.commodity);
  const fxImpact = avg(groups.fx);
  const logisticsImpact = avg(groups.logistics);

  // Net etki skoru
  const score = (
    commodityImpact * IMPACT_WEIGHTS.commodity +
    fxImpact * IMPACT_WEIGHTS.fx +
    logisticsImpact * IMPACT_WEIGHTS.logistics
  );

  // Karar
  let verdict: NetImpactResult['verdict'];
  let summary: string;
  let recommended_action: string;

  if (score >= 0.5) {
    verdict = 'critical_risk';
    summary = 'Ciddi maliyet baskısı. Fiyat güncellemesi ve tedarik stratejisi gözden geçirilmeli.';
    recommended_action = 'Acil fiyat listesi güncelle + hammadde stoku değerlendir + alternatif tedarik ara';
  } else if (score >= 0.2) {
    verdict = 'moderate_risk';
    summary = 'Orta düzey maliyet artışı. Dikkatli izlenmeli.';
    recommended_action = 'Maliyet simülasyonu çalıştır + müşterilere erken bildirim hazırla';
  } else if (score > -0.2) {
    verdict = 'neutral';
    summary = 'Piyasa dengesinde. Mevcut stratejiyi sürdür.';
    recommended_action = 'Mevcut stratejiye devam + fırsatları izle';
  } else if (score > -0.5) {
    verdict = 'moderate_opportunity';
    summary = 'Fırsat penceresi açılıyor. Alım/stok zamanlaması uygun.';
    recommended_action = 'Hammadde stoku yap + büyük sipariş zamanlaması değerlendir';
  } else {
    verdict = 'strong_opportunity';
    summary = 'Güçlü fırsat. Agresif alım ve stok stratejisi önerilir.';
    recommended_action = 'Agresif alım yap + lojistik avantajı yakala + rekabetçi fiyat teklifi hazırla';
  }

  return {
    score: parseFloat(score.toFixed(3)),
    verdict,
    summary,
    breakdown: {
      commodity_impact: parseFloat(commodityImpact.toFixed(3)),
      fx_impact: parseFloat(fxImpact.toFixed(3)),
      logistics_impact: parseFloat(logisticsImpact.toFixed(3)),
    },
    recommended_action,
    conflicting_signals: conflicts,
  };
}

// ═══════════════════════════════════════
// 2. SCENARIO SIMULATION ENGINE
// ═══════════════════════════════════════

export interface ProductProfile {
  name: string;
  type: 'curtain' | 'upholstery' | 'towel' | 'bedding' | 'fabric';
  material_composition: {
    polyester?: number;  // % oran
    cotton?: number;
    linen?: number;
    viscose?: number;
    acrylic?: number;
  };
  weight_gsm: number;      // gram/m²
  width_cm?: number;       // cm
  current_cost_per_meter?: number;  // $/m
}

export interface SimulationResult {
  product: string;
  original_cost: number;
  new_cost: number;
  change_amount: number;
  change_percent: number;
  breakdown: {
    material: string;
    contribution: number;    // $ etki
    reason: string;
  }[];
  recommendation: string;
}

// Hammadde → maliyet etki katsayıları ($/ton → $/m² dönüşümü)
const MATERIAL_COST_FACTORS: Record<string, {
  base_price_per_ton: number;
  gsm_to_cost_factor: number;  // gram → $ dönüşüm katsayısı
}> = {
  polyester: { base_price_per_ton: 1200, gsm_to_cost_factor: 0.0012 },
  cotton:    { base_price_per_ton: 2500, gsm_to_cost_factor: 0.0025 },
  linen:     { base_price_per_ton: 4000, gsm_to_cost_factor: 0.004 },
  viscose:   { base_price_per_ton: 1800, gsm_to_cost_factor: 0.0018 },
  acrylic:   { base_price_per_ton: 1500, gsm_to_cost_factor: 0.0015 },
};

/**
 * Ürün bazlı maliyet simülasyonu
 * "Bu PTA artışında, 280 gr/m² polyester fon perdede maliyet ne kadar artar?"
 */
export function simulateProductCost(
  product: ProductProfile,
  priceChanges: Record<string, number>  // { pta: 3, cotton: -1.5, brent: -2 }
): SimulationResult {
  const baseCost = product.current_cost_per_meter || estimateBaseCost(product);
  let totalImpact = 0;
  const breakdown: SimulationResult['breakdown'] = [];

  for (const [material, percentage] of Object.entries(product.material_composition)) {
    if (!percentage || percentage <= 0) continue;

    const factors = MATERIAL_COST_FACTORS[material];
    if (!factors) continue;

    // Hangi hammadde fiyat değişimi bu materyali etkiler?
    let priceChange = 0;
    if (material === 'polyester' && (priceChanges.pta !== undefined || priceChanges.meg !== undefined)) {
      // PTA + MEG → polyester maliyeti (PTA %70, MEG %30 etki)
      priceChange = (priceChanges.pta || 0) * 0.7 + (priceChanges.meg || 0) * 0.3;
    } else if (material === 'cotton' && priceChanges.cotton !== undefined) {
      priceChange = priceChanges.cotton;
    } else if (priceChanges[material] !== undefined) {
      priceChange = priceChanges[material];
    }

    if (priceChange === 0) continue;

    // Maliyet etkisi hesapla
    const materialWeight = product.weight_gsm * (percentage / 100);
    const costImpact = materialWeight * factors.gsm_to_cost_factor * (priceChange / 100);

    totalImpact += costImpact;
    breakdown.push({
      material,
      contribution: parseFloat(costImpact.toFixed(4)),
      reason: `${material} %${percentage} × ${product.weight_gsm} gsm × ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(1)}%`,
    });
  }

  // Lojistik etkisi
  if (priceChanges.shanghai_freight !== undefined || priceChanges.brent !== undefined) {
    const logImpact = ((priceChanges.shanghai_freight || 0) * 0.6 + (priceChanges.brent || 0) * 0.4) / 100 * 0.05;
    if (Math.abs(logImpact) > 0.001) {
      totalImpact += logImpact;
      breakdown.push({
        material: 'logistics',
        contribution: parseFloat(logImpact.toFixed(4)),
        reason: `Navlun/enerji etkisi`,
      });
    }
  }

  // Kur etkisi
  if (priceChanges.usd_try !== undefined) {
    const fxImpact = baseCost * (priceChanges.usd_try / 100) * 0.3; // İthal hammadde payı
    if (Math.abs(fxImpact) > 0.001) {
      totalImpact += fxImpact;
      breakdown.push({
        material: 'fx_exposure',
        contribution: parseFloat(fxImpact.toFixed(4)),
        reason: `USD/TRY kur etkisi (ithal hammadde payı)`,
      });
    }
  }

  const newCost = baseCost + totalImpact;
  const changePercent = baseCost > 0 ? (totalImpact / baseCost) * 100 : 0;

  let recommendation: string;
  if (changePercent > 3) {
    recommendation = `⚠️ ${product.name} maliyeti %${changePercent.toFixed(1)} artıyor. Fiyat listesi güncellenmeli. Alternatif hammadde mix değerlendirilmeli.`;
  } else if (changePercent > 1) {
    recommendation = `📊 ${product.name} maliyetinde hafif artış (%${changePercent.toFixed(1)}). İzlemeye devam, henüz fiyat güncelleme acil değil.`;
  } else if (changePercent < -2) {
    recommendation = `🟢 ${product.name} maliyetinde düşüş (%${Math.abs(changePercent).toFixed(1)}). Stok yapma ve rekabetçi teklif fırsatı!`;
  } else {
    recommendation = `✅ ${product.name} maliyetinde anlamlı değişim yok.`;
  }

  return {
    product: product.name,
    original_cost: parseFloat(baseCost.toFixed(4)),
    new_cost: parseFloat(newCost.toFixed(4)),
    change_amount: parseFloat(totalImpact.toFixed(4)),
    change_percent: parseFloat(changePercent.toFixed(2)),
    breakdown,
    recommendation,
  };
}

function estimateBaseCost(product: ProductProfile): number {
  let cost = 0;
  for (const [material, pct] of Object.entries(product.material_composition)) {
    if (!pct) continue;
    const factors = MATERIAL_COST_FACTORS[material];
    if (!factors) continue;
    cost += product.weight_gsm * (pct / 100) * factors.gsm_to_cost_factor;
  }
  return cost || 1.5; // varsayılan $1.50/m
}

// Yaygın ürün profilleri (hazır şablonlar)
export const COMMON_PRODUCTS: ProductProfile[] = [
  { name: 'Blackout Perde (Polyester)', type: 'curtain', material_composition: { polyester: 100 }, weight_gsm: 280 },
  { name: 'Tül Perde', type: 'curtain', material_composition: { polyester: 85, viscose: 15 }, weight_gsm: 80 },
  { name: 'Fon Perde (Pamuk-Poly)', type: 'curtain', material_composition: { polyester: 60, cotton: 40 }, weight_gsm: 220 },
  { name: 'Linen-Look Perde', type: 'curtain', material_composition: { polyester: 70, linen: 30 }, weight_gsm: 200 },
  { name: 'Kadife Döşemelik', type: 'upholstery', material_composition: { polyester: 90, cotton: 10 }, weight_gsm: 350 },
  { name: 'Pamuklu Havlu', type: 'towel', material_composition: { cotton: 100 }, weight_gsm: 500 },
  { name: 'Nevresim Takımı', type: 'bedding', material_composition: { cotton: 80, polyester: 20 }, weight_gsm: 180 },
  { name: 'Şönil Döşemelik', type: 'upholstery', material_composition: { polyester: 50, acrylic: 30, viscose: 20 }, weight_gsm: 400 },
];

// ═══════════════════════════════════════
// 3. PREDICTION LAYER (Mini AI Forecast)
// ═══════════════════════════════════════

export interface TrendDataPoint {
  metric: string;
  current: number;
  direction: 'up' | 'down' | 'stable';
  velocity: number;         // değişim hızı (% / gün)
  duration_days: number;    // kaç gündür bu yönde
}

export interface PredictionResult {
  horizon: string;           // '7d' | '14d' | '21d' | '30d'
  confidence: number;        // 0-1
  predictions: {
    metric: string;
    scenario: 'bullish' | 'bearish' | 'stable';
    predicted_change: number;
    reasoning: string;
  }[];
  composite_outlook: 'favorable' | 'cautious' | 'warning';
  strategic_advice: string;
}

/**
 * Trend birleşiminden gelecek tahmini üret
 * Reaktif değil PROAKTİF — olay olmadan ÖNCE sinyal
 */
export function predictMarketOutlook(trends: TrendDataPoint[]): PredictionResult {
  const predictions: PredictionResult['predictions'] = [];
  let riskScore = 0;
  let opportunityScore = 0;

  for (const trend of trends) {
    // Momentum hesabı: hız × süre = birikim
    const momentum = trend.velocity * trend.duration_days;

    // Devam tahmini (trend ne kadar sürdüyse, devam olasılığı o kadar yüksek ama azalan)
    const continuationProb = Math.min(0.85, 0.5 + (trend.duration_days / 60));
    const predictedChange = trend.velocity * 14 * continuationProb; // 14 günlük projeksiyon

    let scenario: 'bullish' | 'bearish' | 'stable';
    let reasoning: string;

    if (trend.direction === 'up' && momentum > 2) {
      scenario = 'bullish';
      reasoning = `${trend.metric} ${trend.duration_days} gündür yükseliyor (günlük %${trend.velocity.toFixed(2)}). ${Math.round(continuationProb * 100)}% olasılıkla devam edecek.`;
      
      // Maliyet metriklerinde artış = risk
      if (['pta', 'meg', 'usd_try', 'shanghai_freight'].includes(trend.metric)) {
        riskScore += momentum * 0.1;
      } else {
        opportunityScore += momentum * 0.1;
      }
    } else if (trend.direction === 'down' && Math.abs(momentum) > 2) {
      scenario = 'bearish';
      reasoning = `${trend.metric} ${trend.duration_days} gündür düşüyor. Düşüş devam edebilir.`;
      
      if (['pta', 'meg', 'brent', 'shanghai_freight'].includes(trend.metric)) {
        opportunityScore += Math.abs(momentum) * 0.1;
      } else {
        riskScore += Math.abs(momentum) * 0.1;
      }
    } else {
      scenario = 'stable';
      reasoning = `${trend.metric} stabil seyrediyor.`;
    }

    predictions.push({
      metric: trend.metric,
      scenario,
      predicted_change: parseFloat(predictedChange.toFixed(2)),
      reasoning,
    });
  }

  // Çoklu sinyal birleşim tahminleri
  const freightUp = trends.find(t => t.metric === 'shanghai_freight' && t.direction === 'up');
  const oilUp = trends.find(t => t.metric === 'brent' && t.direction === 'up');

  if (freightUp && oilUp) {
    predictions.push({
      metric: 'composite_logistics',
      scenario: 'bullish',
      predicted_change: (freightUp.velocity + oilUp.velocity) * 14,
      reasoning: '⚠️ Navlun VE petrol aynı anda yükseliyor → 14-21 gün içinde ciddi lojistik maliyet baskısı bekleniyor.',
    });
    riskScore += 3;
  }

  const ptaUp = trends.find(t => t.metric === 'pta' && t.direction === 'up');
  const fxUp = trends.find(t => t.metric === 'usd_try' && t.direction === 'up');

  if (ptaUp && fxUp) {
    predictions.push({
      metric: 'composite_cost',
      scenario: 'bullish',
      predicted_change: (ptaUp.velocity + fxUp.velocity) * 14,
      reasoning: '🔴 PTA VE dolar aynı anda yükseliyor → polyester bazlı ürünlerde çift taraflı maliyet baskısı. Acil fiyat güncelleme gerekebilir.',
    });
    riskScore += 5;
  }

  const cottonDown = trends.find(t => t.metric === 'cotton' && t.direction === 'down');
  const brentDown = trends.find(t => t.metric === 'brent' && t.direction === 'down');

  if (cottonDown && brentDown) {
    predictions.push({
      metric: 'composite_opportunity',
      scenario: 'bearish',
      predicted_change: (cottonDown.velocity + brentDown.velocity) * 14,
      reasoning: '🟢 Pamuk VE petrol düşüyor → pamuklu ürünlerde maliyet avantajı + lojistik fırsatı. Stok yapma ve büyük sipariş zamanı.',
    });
    opportunityScore += 4;
  }

  // Genel görünüm
  const netScore = riskScore - opportunityScore;
  let composite_outlook: PredictionResult['composite_outlook'];
  let strategic_advice: string;

  if (netScore > 3) {
    composite_outlook = 'warning';
    strategic_advice = 'Piyasa maliyet baskısı altında. Fiyat listelerini güncelle, müşterilere erken uyarı yap, alternatif tedarik araştır.';
  } else if (netScore < -2) {
    composite_outlook = 'favorable';
    strategic_advice = 'Fırsat penceresi açık. Hammadde stoku yap, büyük siparişleri şimdi kapat, rekabetçi teklif hazırla.';
  } else {
    composite_outlook = 'cautious';
    strategic_advice = 'Piyasa karışık sinyal veriyor. Dikkatli izle, büyük pozisyon alma, esnek kal.';
  }

  return {
    horizon: '14d',
    confidence: Math.min(0.85, 0.4 + predictions.length * 0.08),
    predictions,
    composite_outlook,
    strategic_advice,
  };
}
