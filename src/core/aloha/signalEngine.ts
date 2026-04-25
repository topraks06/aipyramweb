import { adminDb } from '@/lib/firebase-admin';
import { alohaAI } from './aiClient';

/**
 * ALOHA SIGNAL ENGINE — Pazar Sinyal Toplama Motoru
 * 
 * Aloha'nın "gözleri" — sürekli tarar:
 * - Ülke bazlı büyüme verileri
 * - Fiyat değişimleri (hammadde, lojistik)
 * - Rakip hareketleri
 * - Yeni şirketler / kapanan firmalar
 * - Sektörel trend kaymaları
 * 
 * Çıktı: aloha_signals koleksiyonuna yazılır → Decision Engine tarafından okunur
 * 
 * TÜM PROJELERİ kapsar — sadece TRTEX değil
 */



// ═══════════════════════════════════════
// TİP TANIMLARI
// ═══════════════════════════════════════

export interface MarketSignalEvent {
  id?: string;
  type: SignalType;
  source: 'gemini_grounding' | 'manual' | 'api' | 'autoRunner';
  project: string;           // trtex, hometex, perde, all
  country?: string;
  signal: string;            // İnsan-okunur özet
  data: Record<string, any>; // Ham veri
  confidence: number;        // 0-1
  severity: 'critical' | 'high' | 'medium' | 'low';
  actionable: boolean;       // Fırsata çevrilebilir mi?
  detectedAt: string;
  expiresAt?: string;        // Sinyalin geçerliliği
  processed: boolean;        // Opportunity Engine işledi mi?
}

export type SignalType =
  | 'market_shift'         // Ülke bazlı büyüme/daralma
  | 'price_change'         // Hammadde/lojistik fiyat değişimi
  | 'competitor_move'      // Rakip hareketi
  | 'new_company'          // Yeni firma
  | 'regulation_change'    // Mevzuat değişikliği
  | 'demand_surge'         // Talep patlaması
  | 'supply_disruption'    // Tedarik kesintisi
  | 'trend_shift'          // Sektörel trend kayması
  | 'seasonal'             // Sezonsal fırsat
  | 'event_reminder';      // Fuar/etkinlik hatırlatması

// ═══════════════════════════════════════
// PROJE → SEKTÖR MAPPING
// ═══════════════════════════════════════

interface ProjectSectorMap {
  sectors: string[];
  products: string[];
  countries: string[];    // Odak ülkeler
  searchQueries: string[]; // Taranacak sorgular
}

const PROJECT_SECTOR_CONFIG: Record<string, ProjectSectorMap> = {
  trtex: {
    sectors: ['ev tekstili', 'tekstil ihracat', 'perde kumaş', 'havlu', 'nevresim'],
    products: ['perde', 'tül', 'fon perde', 'havlu', 'nevresim', 'döşemelik'],
    countries: ['Almanya', 'Polonya', 'ABD', 'Fransa', 'İngiltere', 'İtalya', 'Hollanda', 'İspanya', 'BAE', 'Suudi Arabistan'],
    searchQueries: [
      'Turkish textile export growth 2026',
      'home textile import trends Europe',
      'curtain fabric demand global',
      'cotton polyester price today',
      'Heimtextil Frankfurt trends',
      'PTA MEG price Asia',
      'Turkish lira exchange rate impact textile',
      'home textile fair calendar 2026',
      'sustainable textile certification demand',
      'textile factory opening closing Turkey',
    ],
  },
  hometex: {
    sectors: ['sanal fuar', 'ev dekorasyonu', 'B2B fuar'],
    products: ['sanal showroom', 'mobilya', 'aydınlatma', 'dekorasyon'],
    countries: ['Türkiye', 'Almanya', 'ABD', 'İngiltere', 'BAE'],
    searchQueries: [
      'virtual trade fair technology 2026',
      'home decoration trends B2B',
      'furniture expo Istanbul 2026',
      'B2B showroom platform market',
    ],
  },
  perde: {
    sectors: ['perde tasarım', 'iç mekan', 'window treatment'],
    products: ['perde', 'stor', 'jaluzi', 'zebra perde', 'motorlu perde'],
    countries: ['Türkiye', 'Almanya', 'ABD', 'Avrupa'],
    searchQueries: [
      'AI interior design market growth',
      'smart curtain motorized blinds demand',
      'window treatment trends 2026',
      'custom curtain online design platform',
    ],
  },
  didimemlak: {
    sectors: ['emlak', 'gayrimenkul', 'Didim'],
    products: ['villa', 'daire', 'arsa', 'yazlık'],
    countries: ['Türkiye'],
    searchQueries: [
      'Didim emlak fiyatları 2026',
      'Aegean coast property market foreigners',
      'Turkey property golden visa update',
    ],
  },
};

function getProjectSectorConfig(project: string): ProjectSectorMap {
  const normalized = project.toLowerCase().replace('.com', '').replace('.ai', '');
  return PROJECT_SECTOR_CONFIG[normalized] || PROJECT_SECTOR_CONFIG.trtex;
}

// ═══════════════════════════════════════
// ANA TARAMA FONKSİYONU
// ═══════════════════════════════════════

/**
 * TARAMA DÖNGÜSÜ — Gemini Grounding ile canlı veri topla
 * autoRunner Adım 0.7'de çağrılır
 */
export async function runSignalScan(project: string = 'all'): Promise<{
  signals: MarketSignalEvent[];
  scanned: number;
  actionable: number;
}> {
  const signals: MarketSignalEvent[] = [];
  const projects = project === 'all'
    ? Object.keys(PROJECT_SECTOR_CONFIG)
    : [project.toLowerCase().replace('.com', '').replace('.ai', '')];

  let scanned = 0;

  for (const proj of projects) {
    const config = getProjectSectorConfig(proj);

    // Gemini'ye sektörel analiz yaptır (grounding ile gerçek veri)
    try {
      const analysisPrompt = `Sen bir B2B pazar istihbarat analistsin.

PROJE: ${proj.toUpperCase()}
SEKTÖRLER: ${config.sectors.join(', ')}
ÜRÜNLER: ${config.products.join(', ')}
HEDEF ÜLKELER: ${config.countries.join(', ')}

SON GÜNCELLEMELERİ TARA ve şu kategorilerde sinyal üret:
1. Ülke bazlı ithalat/ihracat büyüme/daralma
2. Hammadde (pamuk, polyester, PTA, MEG) fiyat değişimleri
3. Yeni rakipler veya kapanan firmalar
4. Fuar/etkinlik yaklaşanlar
5. Mevzuat/tariff değişiklikleri
6. Talep değişimleri (sezonsal veya yapısal)

Her sinyal için JSON döndür:
[{
  "type": "market_shift|price_change|competitor_move|new_company|regulation_change|demand_surge|supply_disruption|trend_shift|seasonal|event_reminder",
  "country": "ülke veya 'global'",
  "signal": "kısa açıklama (max 200 karakter)",
  "confidence": 0.0-1.0,
  "severity": "critical|high|medium|low",
  "actionable": true/false,
  "data": { "metric": "...", "value": "...", "change": "...", "source": "..." }
}]

EN AZ 3, EN FAZLA 8 sinyal üret. Uydurma yapma — bilmediğin konularda "confidence" düşük verEBİLİRSİN ama uydurmak YASAK.`;

      const parsed = await alohaAI.generateJSON<any[]>(
        analysisPrompt,
        { complexity: 'routine', temperature: 0.3 },
        `signal_engine_${proj}`
      );

      scanned++;

      const signalArray = Array.isArray(parsed) ? parsed : ((parsed as any)?.signals || []);

      for (const raw of signalArray.slice(0, 8)) {
        const signal: MarketSignalEvent = {
          type: raw.type || 'market_shift',
          source: 'gemini_grounding',
          project: proj,
          country: raw.country || undefined,
          signal: raw.signal || 'bilinmeyen sinyal',
          data: raw.data || {},
          confidence: Math.min(1, Math.max(0, raw.confidence || 0.5)),
          severity: raw.severity || 'medium',
          actionable: raw.actionable !== false,
          detectedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 gün geçerli
          processed: false,
        };

        signals.push(signal);
      }
    } catch (e: any) {
      console.error(`[SIGNAL] ${proj} tarama hatası: ${e.message}`);
    }
  }

  // Firestore'a kaydet
  if (adminDb && signals.length > 0) {
    try {
      const batch = adminDb.batch();
      for (const signal of signals) {
        const ref = adminDb.collection('aloha_signals').doc();
        signal.id = ref.id;
        batch.set(ref, signal);
      }
      await batch.commit();
      console.log(`[📡 SIGNAL] ${signals.length} sinyal Firestore'a yazıldı`);
    } catch (e: any) {
      console.warn(`[SIGNAL] Firestore yazma hatası: ${e.message}`);
    }
  }

  const actionable = signals.filter(s => s.actionable).length;
  console.log(`[📡 SIGNAL] Tarama tamamlandı: ${scanned} proje, ${signals.length} sinyal, ${actionable} actionable`);

  return { signals, scanned, actionable };
}

// ═══════════════════════════════════════
// SON SİNYALLERİ OKU
// ═══════════════════════════════════════

/**
 * En son işlenmemiş sinyalleri getir
 */
export async function getUnprocessedSignals(project?: string, limit: number = 10): Promise<MarketSignalEvent[]> {
  if (!adminDb) return [];

  try {
    // ESKİ: compound query (processed==false + orderBy) → INDEX GEREKTİRİYORDU → HATA!
    // YENİ: basit query + client-side filter → index gerekmez
    const snap = await adminDb.collection('aloha_signals')
      .orderBy('detectedAt', 'desc')
      .limit(50) // fazla çek, client-side filtrele
      .get();

    let signals = snap.docs
      .map(d => ({ id: d.id, ...d.data() as MarketSignalEvent }))
      .filter(s => s.processed === false); // client-side filter

    // Proje filtresi
    if (project) {
      const normalized = project.toLowerCase().replace('.com', '').replace('.ai', '');
      signals = signals.filter(s => s.project === normalized || s.project === 'all');
    }

    return signals.slice(0, limit);
  } catch (e: any) {
    console.warn(`[SIGNAL] Okuma hatası: ${e.message}`);
    return [];
  }
}

/**
 * Sinyal raporu oluştur (insan-okunur)
 */
export function formatSignalReport(signals: MarketSignalEvent[]): string {
  if (signals.length === 0) return '📡 Yeni sinyal bulunamadı.';

  const severityIcon: Record<string, string> = { critical: '🔴', high: '🟠', medium: '🟡', low: '🔵' };

  let report = `═══ PAZAR SİNYAL RAPORU ═══\n`;
  report += `📊 Toplam: ${signals.length} sinyal\n`;
  report += `🎯 Actionable: ${signals.filter(s => s.actionable).length}\n\n`;

  for (const s of signals) {
    const icon = severityIcon[s.severity] || '⚪';
    report += `${icon} [${s.type}] ${s.signal}\n`;
    if (s.country) report += `   🌍 ${s.country}`;
    report += `   📊 Güven: ${(s.confidence * 100).toFixed(0)}%`;
    report += `   🏢 ${s.project}\n`;
  }

  return report;
}
