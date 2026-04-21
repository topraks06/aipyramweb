import { adminDb } from '@/lib/firebase-admin';

/**
 * TRTEX MARKET INTELLIGENCE RULE ENGINE
 * 
 * "Gören Göz" değil "Düşünen Beyin" — Event-Driven Intelligence
 * 
 * Ticker verisi pasif satır değil, arka planda çalışan ajanları uyandırır:
 * - Margin Guard: Maliyet eşik aşımlarında uyarı
 * - Cost Estimator: Hammadde değişiminin ürün maliyetine etkisi
 * - Action Trigger: Kullanıcıya özel aksiyon kartı oluşturma
 * - Role-Based Filter: Üretici vs perakendeci farklı akış
 */

// ═══════════════════════════════════════
// KURAL TANIMLARI
// ═══════════════════════════════════════

export interface MarketRule {
  id: string;
  name: string;
  description: string;
  // Koşul
  condition: {
    metric: string;           // 'usd_try' | 'pta' | 'shanghai_freight' | 'brent' | 'cotton'
    operator: 'gt' | 'lt' | 'change_gt' | 'change_lt'; // büyük, küçük, değişim büyük, değişim küçük
    threshold: number;
  };
  // Etki analizi
  impact: {
    affected_products: string[];  // ['polyester_perde', 'pamuklu_nevresim']
    cost_per_meter?: number;      // $ etki (metre başına)
    cost_percentage?: number;     // % etki
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
  // Aksiyon
  action: {
    type: 'alert' | 'action_card' | 'auto_update' | 'notification';
    title: string;
    message: string;
    buttons?: ActionButton[];
  };
  // Hedef roller
  target_roles: ('manufacturer' | 'buyer' | 'wholesaler' | 'retailer' | 'all')[];
  // Durum
  enabled: boolean;
  cooldown_hours: number;  // Aynı kuralı tekrar tetikleme süresi
  last_triggered?: string;
}

export interface ActionButton {
  label: string;
  action: 'calculate_cost' | 'find_alternative' | 'check_stock' | 'update_pricing' | 'view_analysis';
  context?: Record<string, any>;
}

export interface ActionCard {
  id: string;
  rule_id: string;
  type: 'margin_alert' | 'cost_impact' | 'opportunity' | 'risk_warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metric: string;
  current_value: number;
  change: number;
  impact_detail: string;
  buttons: ActionButton[];
  target_roles: string[];
  created_at: string;
  expires_at: string;  // 24 saat sonra
  dismissed: boolean;
}

// ═══════════════════════════════════════
// VARSAYILAN KURALLAR
// ═══════════════════════════════════════

const DEFAULT_RULES: MarketRule[] = [
  // USD/TRY Kritik Eşik
  {
    id: 'usdtry_spike',
    name: 'USD/TRY Ani Artış',
    description: 'Dolar TL karşısında günlük %2+ değişim gösterirse maliyet uyarısı',
    condition: { metric: 'usd_try', operator: 'change_gt', threshold: 2 },
    impact: {
      affected_products: ['tüm ithal hammaddeler', 'polyester', 'iplik'],
      cost_percentage: 2,
      severity: 'high',
    },
    action: {
      type: 'action_card',
      title: 'Kur Riski: Maliyet Artışı',
      message: 'USD/TRY %{change} arttı. İthal hammadde maliyetleriniz etkilenecek.',
      buttons: [
        { label: 'Maliyet Etkisini Hesapla', action: 'calculate_cost' },
        { label: 'Fiyat Listemi Güncelle', action: 'update_pricing' },
        { label: 'Alternatif Tedarik Bul', action: 'find_alternative' },
      ],
    },
    target_roles: ['manufacturer', 'wholesaler'],
    enabled: true,
    cooldown_hours: 6,
  },

  // PTA/MEG Artışı → Polyester maliyet
  {
    id: 'pta_rise',
    name: 'PTA Hammadde Artışı',
    description: 'PTA fiyatı %3+ artarsa polyester bazlı ürün maliyeti etkilenir',
    condition: { metric: 'pta', operator: 'change_gt', threshold: 3 },
    impact: {
      affected_products: ['polyester perde', 'blackout kumaş', 'tül', 'döşemelik'],
      cost_per_meter: 0.15,
      severity: 'medium',
    },
    action: {
      type: 'action_card',
      title: 'Polyester Maliyet Uyarısı',
      message: 'PTA %{change} arttı. Polyester bazlı ürünlerinizin maliyeti metre başına ~$0.15 artabilir.',
      buttons: [
        { label: 'Koleksiyon Etkisi Analizi', action: 'calculate_cost' },
        { label: 'Pamuk Alternatifi İncele', action: 'find_alternative' },
        { label: 'Stok Durumunu Kontrol Et', action: 'check_stock' },
      ],
    },
    target_roles: ['manufacturer', 'all'],
    enabled: true,
    cooldown_hours: 12,
  },

  // Navlun Spike
  {
    id: 'freight_spike',
    name: 'Navlun Krizi',
    description: 'Shanghai Freight %5+ artarsa lojistik maliyet uyarısı',
    condition: { metric: 'shanghai_freight', operator: 'change_gt', threshold: 5 },
    impact: {
      affected_products: ['tüm ithalat', 'Çin menşeli kumaş', 'aksesuar'],
      cost_percentage: 3,
      severity: 'high',
    },
    action: {
      type: 'action_card',
      title: 'Lojistik Maliyet Alarmı',
      message: 'Konteyner navlunu %{change} arttı. İthalat maliyetleriniz yükseliyor.',
      buttons: [
        { label: 'Nakliye Maliyetini Hesapla', action: 'calculate_cost' },
        { label: 'Alternatif Rota Analizi', action: 'find_alternative' },
        { label: 'Stok Riskini Kontrol Et', action: 'check_stock' },
      ],
    },
    target_roles: ['buyer', 'wholesaler', 'manufacturer'],
    enabled: true,
    cooldown_hours: 12,
  },

  // Brent Petrol düşüşü = Fırsat
  {
    id: 'brent_drop',
    name: 'Petrol Düşüşü Fırsatı',
    description: 'Brent %4+ düşerse lojistik maliyet avantajı',
    condition: { metric: 'brent', operator: 'change_lt', threshold: -4 },
    impact: {
      affected_products: ['lojistik', 'nakliye', 'depolama'],
      cost_percentage: -2,
      severity: 'low',
    },
    action: {
      type: 'action_card',
      title: 'Lojistik Fırsatı',
      message: 'Petrol %{change} düştü. Nakliye maliyetleri düşebilir — büyük siparişler için ideal zamanlama.',
      buttons: [
        { label: 'Maliyet Avantajını Gör', action: 'calculate_cost' },
        { label: 'Toplu Sipariş Analizi', action: 'view_analysis' },
      ],
    },
    target_roles: ['buyer', 'wholesaler'],
    enabled: true,
    cooldown_hours: 24,
  },

  // Pamuk Fiyat Fırsatı
  {
    id: 'cotton_opportunity',
    name: 'Pamuk Fiyat Fırsatı',
    description: 'Pamuk fiyatı %3+ düşerse stok yapma fırsatı',
    condition: { metric: 'cotton', operator: 'change_lt', threshold: -3 },
    impact: {
      affected_products: ['pamuklu havlu', 'nevresim', 'pamuklu perde'],
      cost_per_meter: -0.10,
      severity: 'low',
    },
    action: {
      type: 'action_card',
      title: 'Pamuk Stok Fırsatı',
      message: 'Pamuk fiyatı %{change} düştü. Pamuklu ürünlerde stok yapma zamanı.',
      buttons: [
        { label: 'Stok Planı Oluştur', action: 'check_stock' },
        { label: 'Tedarikçi Fiyat Karşılaştır', action: 'find_alternative' },
      ],
    },
    target_roles: ['manufacturer', 'all'],
    enabled: true,
    cooldown_hours: 24,
  },
];

// ═══════════════════════════════════════
// KURAL MOTORU
// ═══════════════════════════════════════

/**
 * Ticker verilerini kurallara karşı değerlendir ve aksiyon kartları üret
 */
export async function evaluateMarketRules(tickerData: Record<string, any>): Promise<ActionCard[]> {
  const cards: ActionCard[] = [];
  const rules = await loadRules();
  const now = new Date();

  for (const rule of rules) {
    if (!rule.enabled) continue;

    // Cooldown kontrolü
    if (rule.last_triggered) {
      const elapsed = (now.getTime() - new Date(rule.last_triggered).getTime()) / 3600000;
      if (elapsed < rule.cooldown_hours) continue;
    }

    // Metrik değerini bul
    const metricValue = findMetricValue(tickerData, rule.condition.metric);
    if (metricValue === null) continue;

    // Koşul kontrolü
    const triggered = checkCondition(metricValue, rule.condition);
    if (!triggered) continue;

    // Aksiyon kartı oluştur
    const change = metricValue.change || 0;
    const card: ActionCard = {
      id: `card_${rule.id}_${Date.now()}`,
      rule_id: rule.id,
      type: rule.impact.severity === 'critical' || rule.impact.severity === 'high'
        ? (change > 0 ? 'risk_warning' : 'opportunity')
        : (change > 0 ? 'cost_impact' : 'opportunity'),
      severity: rule.impact.severity,
      title: rule.action.title,
      message: rule.action.message
        .replace('{change}', Math.abs(change).toFixed(1))
        .replace('{value}', String(metricValue.value)),
      metric: rule.condition.metric,
      current_value: metricValue.value,
      change,
      impact_detail: rule.impact.cost_per_meter
        ? `Metre başına ~$${Math.abs(rule.impact.cost_per_meter).toFixed(2)} ${change > 0 ? 'artış' : 'düşüş'}`
        : `Maliyet etkisi: ~%${Math.abs(rule.impact.cost_percentage || 0).toFixed(1)}`,
      buttons: rule.action.buttons || [],
      target_roles: rule.target_roles,
      created_at: now.toISOString(),
      expires_at: new Date(now.getTime() + 86400000).toISOString(),
      dismissed: false,
    };

    cards.push(card);

    // Firestore'a kaydet + cooldown güncelle
    if (adminDb) {
      try {
        await adminDb.collection('trtex_action_cards').add(card);
        await adminDb.collection('trtex_intelligence').doc('market_rules').set({
          [`rules.${rule.id}.last_triggered`]: now.toISOString(),
        }, { merge: true });
      } catch { /* kayıt başarısız → sessiz devam */ }
    }
  }

  if (cards.length > 0) {
    console.log(`[RULE ENGINE] 🧠 ${cards.length} aksiyon kartı oluşturuldu`);
  }

  return cards;
}

// ═══════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════

async function loadRules(): Promise<MarketRule[]> {
  // Firestore'dan özel kurallar varsa yükle, yoksa varsayılan kullan
  if (adminDb) {
    try {
      const doc = await adminDb.collection('trtex_intelligence').doc('market_rules').get();
      if (doc.exists && doc.data()?.rules) {
        return Object.values(doc.data()!.rules) as MarketRule[];
      }
    } catch { /* varsayılan kullan */ }
  }
  return DEFAULT_RULES;
}

function findMetricValue(data: Record<string, any>, metric: string): { value: number; change: number } | null {
  // forex
  if (data.forex?.[metric]) return { value: data.forex[metric].value, change: data.forex[metric].change_24h || 0 };
  // commodities
  if (data.commodities?.[metric]) return { value: data.commodities[metric].value, change: data.commodities[metric].change_30d || 0 };
  // logistics
  if (data.logistics?.[metric]) return { value: data.logistics[metric].value, change: data.logistics[metric].change_30d || 0 };
  // flat
  if (data[metric]?.value !== undefined) return { value: data[metric].value, change: data[metric].change || data[metric].change_30d || data[metric].change_24h || 0 };
  return null;
}

function checkCondition(
  metricValue: { value: number; change: number },
  condition: MarketRule['condition']
): boolean {
  switch (condition.operator) {
    case 'gt': return metricValue.value > condition.threshold;
    case 'lt': return metricValue.value < condition.threshold;
    case 'change_gt': return metricValue.change > condition.threshold;
    case 'change_lt': return metricValue.change < condition.threshold;
    default: return false;
  }
}

// ═══════════════════════════════════════
// ROL BAZLI FİLTRELEME
// ═══════════════════════════════════════

/**
 * Kullanıcı rolüne göre ticker öncelik ağırlıklandırma
 */
export function getRoleWeights(role: string): Record<string, number> {
  const weights: Record<string, Record<string, number>> = {
    manufacturer: {
      pta: 1.0, meg: 1.0, cotton: 0.9, shanghai_freight: 0.7,
      usd_try: 0.95, brent: 0.6, news_event: 0.4,
    },
    buyer: {
      pta: 0.4, meg: 0.3, cotton: 0.5, shanghai_freight: 0.9,
      usd_try: 0.8, brent: 0.7, news_event: 0.8,
    },
    wholesaler: {
      pta: 0.5, meg: 0.4, cotton: 0.6, shanghai_freight: 0.8,
      usd_try: 0.9, brent: 0.6, news_event: 0.7,
    },
    retailer: {
      pta: 0.2, meg: 0.1, cotton: 0.3, shanghai_freight: 0.4,
      usd_try: 0.7, brent: 0.3, news_event: 1.0,
    },
  };
  return weights[role] || weights.manufacturer;
}

/**
 * Mevsimsel etki ağırlığı — fuar yaklaştıkça lojistik/haber ağırlığı artar
 */
export function getSeasonalBoost(): Record<string, number> {
  const now = new Date();
  const month = now.getMonth(); // 0-11

  // HOMETEX genellikle Mayıs — yaklaştıkça lojistik ve haber önem kazanır
  const hometexMonth = 4; // Mayıs
  const monthsUntilFair = ((hometexMonth - month + 12) % 12);
  const fairProximity = monthsUntilFair <= 2 ? 1.5 : monthsUntilFair <= 4 ? 1.2 : 1.0;

  return {
    logistics: fairProximity,
    news_event: fairProximity,
    commodity: 1.0,
    fx_energy: 1.0,
  };
}

// ═══════════════════════════════════════
// CONTEXTUAL AUTO-PROMPTS
// ═══════════════════════════════════════

/**
 * Tıklanan veriye göre hazır simülasyon butonları üret
 * Kullanıcı soru sormak zorunda değil — öneriler hazır gelir
 */
export function getContextualPrompts(metricId: string): ActionButton[] {
  const prompts: Record<string, ActionButton[]> = {
    usd_try: [
      { label: 'Maliyet Etkisini Hesapla', action: 'calculate_cost', context: { scope: 'all_imports' } },
      { label: 'Fiyat Listemi Güncelle', action: 'update_pricing' },
      { label: 'Kur Hedging Stratejisi', action: 'view_analysis', context: { topic: 'fx_hedging' } },
    ],
    eur_try: [
      { label: 'Avrupa İhracat Etkisi', action: 'calculate_cost', context: { scope: 'eu_exports' } },
      { label: 'EUR Bazlı Fiyatlandırma', action: 'update_pricing' },
    ],
    pta: [
      { label: 'Polyester Maliyet Simülasyonu', action: 'calculate_cost', context: { material: 'polyester' } },
      { label: 'Pamuk Alternatifi İncele', action: 'find_alternative', context: { from: 'polyester', to: 'cotton' } },
      { label: 'Stok Durumunu Kontrol Et', action: 'check_stock', context: { material: 'polyester' } },
    ],
    meg: [
      { label: 'MEG Maliyet Etkisi', action: 'calculate_cost', context: { material: 'polyester_meg' } },
      { label: 'Alternatif Hammadde', action: 'find_alternative' },
    ],
    cotton: [
      { label: 'Pamuk Stok Planı', action: 'check_stock', context: { material: 'cotton' } },
      { label: 'Tedarikçi Karşılaştır', action: 'find_alternative', context: { material: 'cotton' } },
      { label: 'Sezon Trend Analizi', action: 'view_analysis', context: { topic: 'cotton_seasonal' } },
    ],
    shanghai_freight: [
      { label: 'Nakliye Maliyetini Hesapla', action: 'calculate_cost', context: { scope: 'freight' } },
      { label: 'Alternatif Rota Analizi', action: 'find_alternative', context: { type: 'route' } },
      { label: 'Stok Riskini Kontrol Et', action: 'check_stock' },
    ],
    brent: [
      { label: 'Enerji Maliyet Etkisi', action: 'calculate_cost', context: { scope: 'energy' } },
      { label: 'Üretim Maliyet Analizi', action: 'view_analysis', context: { topic: 'production_cost' } },
    ],
  };
  return prompts[metricId] || [
    { label: 'Detaylı Analiz', action: 'view_analysis' },
    { label: 'Maliyet Etkisi', action: 'calculate_cost' },
  ];
}
