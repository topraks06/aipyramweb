import { adminDb } from '@/lib/firebase-admin';
import { dlq } from './dlq';
import { executeUiLocalization } from '@/core/aloha/uiLocalizationAgent';
import { generateDecisions, DecisionEngineOutput } from './intelligenceEngine';

/**
 * TERMINAL PAYLOAD BUILDER — TEK BEYİN, TEK ÇIKTI
 * 
 * GPT haklı: "Sistem parça parça zeki, ama bütün olarak kör."
 * Bu modül o körlüğü bitirir.
 * 
 * HER CYCLE SONUNDA:
 * 1. Tüm veri kaynaklarını oku (trtex_news, ticker_live, homepage_brain)
 * 2. Hero seç, Grid diz, Radar filtrele, Academy ayır
 * 3. Ticker normalize et, Insight birleştir, Fuar takvimi hesapla
 * 4. TEK ATOMİK WRITE → trtex_terminal/current
 * 
 * Frontend SADECE bu dokümanı okur. Başka hiçbir şeye dokunmaz.
 * 
 * "Payload yoksa → hiçbir şey gösterme"
 */

// ═══════════════════════════════════════
// TİP TANIMLARI
// ═══════════════════════════════════════

export interface TerminalArticle {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  category?: string;
  image_url?: string;
  images?: string[];
  quality_score?: number;
  commercial_note?: string;
  ai_block?: { market?: string; risk?: string; action?: string };
  ai_ceo_block?: any;
  business_opportunities?: string[];
  target_audience?: string;
  seo?: { keywords?: string[] };
  source?: string;
  createdAt?: string;
  publishedAt?: string;
  status?: string;
  routing_signals?: Record<string, number>;
  translations?: Record<string, any>;
  insight?: any;
}

export interface TerminalTickerItem {
  id: string;
  type: 'macro' | 'energy' | 'textile' | 'logistics' | 'news_event';
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  direction?: string;
  severity?: string;
  timestamp: number;
  businessImpact?: number;
  isBreaking?: boolean;
  newsHeadline?: string;
}

export interface TerminalFair {
  name: string;
  location: string;
  continent: string;
  date: string;
  attendees: string;
  link: string;
  daysLeft: number;
}

export interface TerminalPayload {
  // Üst veri (meta)
  schema_version: number;
  generatedAt: string;
  cycleId: string;
  version: number;

  // L2 THINK - Karar Motoru
  decision_engine?: DecisionEngineOutput;

  // İçerik blokları (Sovereign 4.0)
  heroArticle: TerminalArticle | null;
  gridArticles: TerminalArticle[];
  radarStream: {
    risk: TerminalArticle | null;
    opportunity: TerminalArticle | null;
    signal: TerminalArticle | null;
  };
  academyArticles: TerminalArticle[];
  haftaninFirsatlari: TerminalArticle[];

  // Veri blokları
  tickerItems: TerminalTickerItem[];
  todayInsight: { market: string; risk: string; opportunity: string };
  fairsWithCountdown: TerminalFair[];
  uzakDoguRadari: any;
  activeTenders: any[];

  // Meta
  menuConfig: { id: string; label: string; slug: string }[];
  hasPremiumReport: boolean;
  intelligenceScore: number;
  priorityEngine: {
    market_regime: 'RISK_ON' | 'RISK_OFF' | 'NEUTRAL';
    top_signal: string;
    confidence_score: number;
  };
}

// ═══════════════════════════════════════
// STATİK VERİ
// ═══════════════════════════════════════

// Fuar takvimi artık statik değil, Firestore "trtex_fairs" koleksiyonundan çekilecek.
// Eğer koleksiyon yoksa veya boşsa, terminal bu bloğu saklayacak.

const DEFAULT_MENU = [
  {
    id: 'haberler', label: 'HABERLER',
    labels: { TR: 'HABERLER', EN: 'NEWS', DE: 'NACHRICHTEN', RU: 'НОВОСТИ', ZH: '新闻', AR: 'أخبار', ES: 'NOTICIAS', FR: 'ACTUALITÉS' },
    slug: 'news',
    subItems: [
      { id: 'guncel', label: 'Son Haberler', slug: 'news', labels: { TR: 'Son Haberler', EN: 'Latest News', DE: 'Aktuelle Nachrichten', RU: 'Последние Новости', ZH: '最新新闻', AR: 'آخر الأخبار', ES: 'Últimas Noticias', FR: 'Dernières Nouvelles' } },
      { id: 'radar', label: 'Dünya Radarı', slug: 'radar', labels: { TR: 'Dünya Radarı', EN: 'World Radar', DE: 'Welt-Radar', RU: 'Мировой Радар', ZH: '世界雷达', AR: 'رادار عالمي', ES: 'Radar Mundial', FR: 'Radar Mondial' } },
      { id: 'analiz', label: 'Pazar Analizi', slug: 'analysis', labels: { TR: 'Pazar Analizi', EN: 'Market Analysis', DE: 'Marktanalyse', RU: 'Анализ Рынка', ZH: '市场分析', AR: 'تحليل السوق', ES: 'Análisis de Mercado', FR: 'Analyse de Marché' } }
    ]
  },
  {
    id: 'ihaleler', label: 'İHALELER',
    labels: { TR: 'İHALELER', EN: 'TENDERS', DE: 'AUSSCHREIBUNGEN', RU: 'ТЕНДЕРЫ', ZH: '招标', AR: 'مناقصات', ES: 'LICITACIONES', FR: 'APPELS D\'OFFRES' },
    slug: 'tenders',
    subItems: [
      { id: 'canli', label: 'Canlı İhaleler', slug: 'tenders', labels: { TR: 'Canlı İhaleler', EN: 'Live Tenders', DE: 'Aktive Ausschreibungen', RU: 'Активные Тендеры', ZH: '活跃招标', AR: 'مناقصات نشطة', ES: 'Licitaciones Activas', FR: 'Appels Actifs' } },
      { id: 'stok', label: 'Stok Fırsatları', slug: 'tenders?filter=HOT_STOCK', labels: { TR: 'Stok Fırsatları', EN: 'Stock Deals', DE: 'Lagerangebote', RU: 'Складские Предложения', ZH: '库存优惠', AR: 'عروض المخزون', ES: 'Ofertas de Stock', FR: 'Offres de Stock' } },
      { id: 'kapasite', label: 'Boş Kapasite', slug: 'tenders?filter=CAPACITY', labels: { TR: 'Boş Kapasite', EN: 'Available Capacity', DE: 'Freie Kapazitäten', RU: 'Свободные Мощности', ZH: '闲置产能', AR: 'طاقة متاحة', ES: 'Capacidad Disponible', FR: 'Capacité Disponible' } }
    ]
  },
  {
    id: 'ticaret', label: 'TİCARET',
    labels: { TR: 'TİCARET', EN: 'TRADE', DE: 'HANDEL', RU: 'ТОРГОВЛЯ', ZH: '贸易', AR: 'تجارة', ES: 'COMERCIO', FR: 'COMMERCE' },
    slug: 'trade',
    subItems: [
      { id: 'firsatlar', label: 'Ticari Fırsatlar', slug: 'opportunities', labels: { TR: 'Ticari Fırsatlar', EN: 'Trade Opportunities', DE: 'Handelschancen', RU: 'Торговые Возможности', ZH: '贸易机会', AR: 'فرص تجارية', ES: 'Oportunidades', FR: 'Opportunités' } },
      { id: 'tedarik', label: 'Tedarik Rehberi', slug: 'supply', labels: { TR: 'Tedarik Rehberi', EN: 'Supplier Guide', DE: 'Lieferantenführer', RU: 'Справочник Поставщиков', ZH: '供应商指南', AR: 'دليل الموردين', ES: 'Guía de Proveedores', FR: 'Guide Fournisseurs' } }
    ]
  },
  {
    id: 'akademi', label: 'AKADEMİ',
    labels: { TR: 'AKADEMİ', EN: 'ACADEMY', DE: 'AKADEMIE', RU: 'АКАДЕМИЯ', ZH: '学院', AR: 'أكاديمية', ES: 'ACADEMIA', FR: 'ACADÉMIE' },
    slug: 'academy',
    subItems: [
      { id: 'egitim', label: 'Sektör Eğitimi', slug: 'academy', labels: { TR: 'Sektör Eğitimi', EN: 'Industry Training', DE: 'Branchenausbildung', RU: 'Отраслевое Обучение', ZH: '行业培训', AR: 'تدريب القطاع', ES: 'Formación Sectorial', FR: 'Formation Sectorielle' } },
      { id: 'fuarlar', label: 'Fuar Takvimi', slug: 'fairs', labels: { TR: 'Fuar Takvimi', EN: 'Fair Calendar', DE: 'Messekalender', RU: 'Календарь Выставок', ZH: '展会日历', AR: 'تقويم المعارض', ES: 'Calendario de Ferias', FR: 'Calendrier des Salons' } }
    ]
  }
];

// ─── TENDERS ───
async function readLiveTenders() {
  if (!adminDb) return [];
  try {
    const snap = await adminDb.collection('trtex_tenders')
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();
    
    const elements: any[] = [];
    snap.forEach((doc: any) => {
      const data = doc.data();
      if (data.status === 'LIVE') elements.push({ id: doc.id, ...data });
    });
    return elements;
  } catch(e) {
    console.error("[TERMINAL BUILDER] Tenders read error:", e);
    return [];
  }
}

// ═══════════════════════════════════════
// ANA FONKSİYON — TEK BEYİN
// ═══════════════════════════════════════

export async function buildTerminalPayload(): Promise<TerminalPayload> {
  const startTime = Date.now();
  console.log(`[TERMINAL BUILDER] 📦 Tek beyin, tek çıktı — payload inşası başladı...`);

  // SİSTEM ERROR OTO KONTROL (Modüler Circuit Breaker Check)
  let sysMetrics: any = {};
  if (adminDb) {
    try {
      const metricSnap = await adminDb.collection('trtex_system_metrics').doc('current').get();
      if (metricSnap.exists) {
        sysMetrics = metricSnap.data() || {};
      }
    } catch(e) {}
  }
  
  const imageErrors = sysMetrics.image_errors_24h || 0;
  const apiErrors = sysMetrics.api_errors_24h || 0;
  const coreErrors = sysMetrics.core_errors_24h || 0;

  if (coreErrors > 3) {
    console.warn(`[TERMINAL BUILDER] 🚨 CORE SAFE MODE: Çok fazla kritik hata (${coreErrors}). Yalnızca cache/last_good üzerinden read-only mod önerilir.`);
  } else {
    if (imageErrors > 5) console.warn(`[TERMINAL BUILDER] ⚠️ IMAGE DEGRADED: Görsel üretim hataları yüksek dolayısıyla görsel servisi pasif modda.`);
    if (apiErrors > 5) console.warn(`[TERMINAL BUILDER] ⚠️ API DEGRADED: Dış haber çekim hataları yüksek.`);
  }

  // ═══ ADIM 1: TÜM VERİ KAYNAKLARINI OKU ═══

  // 1A. Haberler (ana kaynak — trtex_news)
  const allNews = await readAllNews();

  // 1B. Ticker verileri (döviz, emtia)
  const tickerData = await readTickerData();

  // 1C. Homepage Brain (daily insight, opportunities)
  const brainData = await readHomepageBrain();

  // 1D. Mevcut payload'ın versiyonunu oku (increment için)
  const currentVersion = await readCurrentVersion();

  // 1E. İhale / Matchmaker Verileri (LIVE)
  const liveTenders = await readLiveTenders();

  // ═══ ADIM 2: SEÇ, FİLTRELE, SIRALA ═══

  // 2A. Duplikat temizliği
  const dedupedNews = deduplicateNews(allNews);

  // 2A.5 EDİTÖR KAPISI — Text sanity + kalite filtresi
  // GPT: "Builder zayıf olursa tüm site kötü olur. Frontend artık kurtarmayacak."
  const uniqueNews = editorialQualityGate(dedupedNews);
  console.log(`[TERMINAL BUILDER] 🛡️ Editör kapısı: ${dedupedNews.length} → ${uniqueNews.length} haber (${dedupedNews.length - uniqueNews.length} reddedildi)`);

  // 2B. HERO SEÇİMİ — Priority Scoring (impact + recency + sector + image)
  const heroArticle = selectHero(uniqueNews);

  // 2C. GRID — Hero hariç kalan en iyi 12 haber
  const remainingAfterHero = uniqueNews.filter(a => a.id !== heroArticle?.id);
  const gridArticles = remainingAfterHero.slice(0, 12);

  // ═══ DYNAMIC THRESHOLD LOCK (FAZ 3 - BLOOMBERG MODE YASASI) ═══
  const MIN_NEWS_VOLUME = 30; // Beklenen havuz
  const dailyVolumeFactor = Math.max(0, MIN_NEWS_VOLUME - uniqueNews.length);
  // B2B Güveni için eşikler ASLA çok düşürülmez.
  const RADAR_THRESHOLD = Math.max(0.80, 0.85 - (dailyVolumeFactor * 0.002));
  const ACADEMY_THRESHOLD = Math.max(0.75, 0.80 - (dailyVolumeFactor * 0.002));
  const B2B_OPPORTUNITY_THRESHOLD = Math.max(0.85, 0.90 - (dailyVolumeFactor * 0.002));

  console.log(`[TERMINAL BUILDER] 🧭 M-THRESHOLDS: Radar:${RADAR_THRESHOLD.toFixed(2)} | Academy:${ACADEMY_THRESHOLD.toFixed(2)} | B2B:${B2B_OPPORTUNITY_THRESHOLD.toFixed(2)} (Vol: ${uniqueNews.length})`);

  // 2D. RADAR — Yüksek skorlu world radar ve fırsatlar
  const radarStream = selectRadar(remainingAfterHero, RADAR_THRESHOLD, B2B_OPPORTUNITY_THRESHOLD);

  // 2E. ACADEMY — Academy skorunu baz alarak eğitim makalesi filtreleme
  const academyArticles = selectAcademy(uniqueNews, heroArticle, ACADEMY_THRESHOLD);

  // 2F. HAFTANIN FIRSATLARI — Top 5 B2B skorlu haberler
  const haftaninFirsatlari = uniqueNews
    .filter(a => a.id !== heroArticle?.id)
    .sort((a: any, b: any) => {
      const gB = (b.routing_signals?.b2b_opportunity || 0) + (b.quality_score || 0) / 100;
      const gA = (a.routing_signals?.b2b_opportunity || 0) + (a.quality_score || 0) / 100;
      return gB - gA;
    })
    .filter((a: any) => (a.routing_signals?.b2b_opportunity || 0.5) >= Math.min(0.5, B2B_OPPORTUNITY_THRESHOLD))
    .slice(0, 5);

  // ═══ ADIM 2G: POINTER KOLEKSİYONLARI (ARŞİV SENKRONİZASYONU) ═══
  // Alt menülere (Radar, Academy, Fırsatlar) tıklandığında sayfaların boş kalmaması için,
  // her üretilen makale uygunsa kendi arşiv pointer yapısına eklenir.
  if (adminDb && uniqueNews.length > 0) {
    try {
      const batch = adminDb.batch();
      let opCount = 0;

      for (const article of uniqueNews) {
        if (!article.id || !article.createdAt) continue;
        
        // 1. Academy Arşivi
        const isAcademy = (article.routing_signals?.academy_value || 0) >= ACADEMY_THRESHOLD || article.category?.toLowerCase().includes('akademi') || article.category?.toLowerCase().includes('eğitim');
        if (isAcademy) {
          batch.set(adminDb.collection('trtex_academy').doc(article.id), { createdAt: article.createdAt }, { merge: true });
          opCount++;
        }
        
        // 2. Radar Arşivi
        const isRadar = (article.routing_signals?.world_radar || 0) >= RADAR_THRESHOLD || article.category === 'RADAR' || article.ai_block?.risk;
        if (isRadar) {
           batch.set(adminDb.collection('trtex_radar').doc(article.id), { createdAt: article.createdAt }, { merge: true });
           opCount++;
        }
        
        // 3. Fırsatlar Arşivi
        const isOpportunity = (article.routing_signals?.b2b_opportunity || 0) >= B2B_OPPORTUNITY_THRESHOLD || (article.business_opportunities && article.business_opportunities.length > 0);
        if (isOpportunity) {
           batch.set(adminDb.collection('trtex_opportunities').doc(article.id), { createdAt: article.createdAt }, { merge: true });
           opCount++;
        }
        
        // Firebase batch limiti 500 işlem. Güvenli limitte (400) yaz ve sıfırla.
        if (opCount > 400) { 
          await batch.commit(); 
          opCount = 0; 
        } 
      }

      if (opCount > 0) await batch.commit();
      console.log(`[TERMINAL BUILDER] 🔗 Pointer Arşivleri (Radar, Akademi, Fırsatlar) 100% senkronize edildi.`);
    } catch (pointerErr: any) {
      console.warn(`[TERMINAL BUILDER] ⚠️ Pointer arşiv (Menü linkleri) senkronizasyonunda hata:`, pointerErr.message);
    }
  }

  // ═══ ADIM 3: VERİ BLOKLARINI NORMALİZE ET ═══

  // 3A. Ticker normalize
  const tickerItems = normalizeTickerItems(tickerData, uniqueNews);

  // 3B. Today Insight
  const todayInsight = buildTodayInsight(heroArticle, radarStream, brainData);

  // 3C. Fuar takvimi (Gerçek Veri)
  const fairsWithCountdown = await buildFairCountdown();

  // 3D. Uzakdoğu Radarı (Gerçek Veri)
  const uzakDoguRadari = await buildUzakDoguRadar(brainData, uniqueNews);

  // 3E. Menu config (KİLİTLİ: Dışarıdan gelen İngilizce veya bozuk menüleri reddeder)
  const menuConfig = DEFAULT_MENU;

  // ═══ ADIM 4: KALİTE SKORU HESAPLA ═══
  const intelligenceScore = calculateIntelligenceScore({
    heroArticle,
    gridArticles,
    radarStream,
    academyArticles,
    tickerItems,
    todayInsight,
  });

  // ═══ ADIM 5: KALİTE SKORU + GAP FILL ═══
  // Gemini: "intelligenceScore 50'nin altına düşerse gapFill modunu tetikle"
  let finalHero = heroArticle;
  let finalGrid = gridArticles;

  if (intelligenceScore < 50 && uniqueNews.length > 0) {
    console.log(`[TERMINAL BUILDER] ⚠️ IQ ${intelligenceScore}/100 — GAP FILL modu aktif`);
    // Hero yoksa en iyi haberi zorla hero yap (görselsiz bile olsa)
    if (!finalHero && uniqueNews.length > 0) {
      finalHero = uniqueNews[0];
    }
    // Grid 6'dan azsa tüm haberleri doldur
    if (finalGrid.length < 6) {
      const extraPool = uniqueNews.filter(a => a.id !== finalHero?.id && !finalGrid.some(g => g.id === a.id));
      finalGrid = [...finalGrid, ...extraPool].slice(0, 12);
    }
  }

  // ═══ ADIM 5.5: PRIORITY ENGINE İNŞASI ═══
  const priorityEngine = buildPriorityEngine(finalHero, radarStream, intelligenceScore);

  // ═══ ADIM 5.7: L2 THINK LAYER (DECISION ENGINE) ═══
  const decision_engine = await generateDecisions(finalHero, tickerData);

  // ═══ ADIM 5.8: CONFIDENCE SCORE HESAPLAMA ═══
  let payloadConfidence = intelligenceScore; // Taban IQ puanını alır
  const recentArticles = uniqueNews.filter(a => {
    return a.publishedAt && (Date.now() - new Date(a.publishedAt).getTime()) < 6 * 60 * 60 * 1000;
  });
  if (recentArticles.length > 2) payloadConfidence += 10;
  if (tickerItems.length >= 4) payloadConfidence += 5;
  payloadConfidence = Math.min(100, payloadConfidence);

  // ═══ ADIM 6: TEK ATOMİK WRITE ═══
  const payload: TerminalPayload & { payloadConfidence?: number } = {
    schema_version: 2,
    generatedAt: new Date().toISOString(),
    cycleId: `cycle_${Date.now()}`,
    version: currentVersion + 1,
    payloadConfidence,

    decision_engine,

    heroArticle: finalHero,
    gridArticles: finalGrid,
    radarStream,
    academyArticles,
    haftaninFirsatlari,

    tickerItems,
    todayInsight,
    fairsWithCountdown,
    uzakDoguRadari,
    activeTenders: liveTenders,

    menuConfig,
    hasPremiumReport: uniqueNews.length > 0,
    intelligenceScore,
    priorityEngine,
  };

  // 🌍 ADIM 6B: STATİK ÇEVİRİ TABLOSU (8 Dil)
  // ❌ ESKİ: 4 adet Gemini API çağrısı → 30-60sn timeout → builder çöküyordu
  // ✅ YENİ: Hazır çeviri tablosu — anında, deterministik, hatasız
  const STATIC_UI_LABELS: Record<string, Record<string, string>> = {
    TR: {
      today_insight: "GÜNÜN ANALİZİ", insight_sub: "Aloha İstihbarat Özeti", radar_title: "TRTEX RADAR",
      radar_risk: "KÜRESEL RİSK", radar_signal: "PAZAR SİNYALİ", radar_opp: "FIRSAT",
      radar_all: "TÜM RADAR UYARILARI →", radar_empty_alert: "ALOHA UYARISI",
      radar_empty_title: "Uzakdoğu Sinyali Bekleniyor", radar_empty_desc: "Veri setinde güncel Asya pazar tehdit/fırsat sinyali tespit edilemedi. Otonom tarama sürüyor.",
      raw_material: "HAMMADDE & KÖKEN SİNYALİ", cotton: "PAMUK / LİF (Global)", freight: "NAVLUN (Asya-Avr)",
      read_time_min: "dk okuma", thirty_sec_summary: "30 SANİYEDE ANLA", meaning_of_news: "BU HABERİN ANLAMI",
      high_impact: "YÜKSEK ETKİ", moderate_impact: "ORTA", low_impact: "DÜŞÜK",
      footer_engine: "ALOHA İSTİHBARAT MOTORU", back_to_archive: "ARŞİVE DÖN",
      hero_section: "SON GELİŞME", grid_title: "GÜNDEM", opportunities_title: "HAFTANIN FIRSATLARI",
      academy_title: "TEKSTİL AKADEMİ", fairs_title: "FUAR TAKVİMİ", uzakdogu_title: "UZAKDOĞU RADARI",
    },
    EN: {
      today_insight: "TODAY'S ANALYSIS", insight_sub: "Aloha Intelligence Extract", radar_title: "TRTEX RADAR",
      radar_risk: "GLOBAL RISK", radar_signal: "MARKET SIGNAL", radar_opp: "OPPORTUNITY",
      radar_all: "ALL RADAR ALERTS →", radar_empty_alert: "ALOHA ALERT",
      radar_empty_title: "Awaiting Far East Signal", radar_empty_desc: "No current Asia market threat/opportunity signal detected. Autonomous scan continues.",
      raw_material: "RAW MATERIAL & ORIGIN SIGNAL", cotton: "COTTON / FIBER (Global)", freight: "FREIGHT (Asia-Eur)",
      read_time_min: "min read", thirty_sec_summary: "UNDERSTAND IN 30 SECONDS", meaning_of_news: "WHAT THIS MEANS",
      high_impact: "HIGH IMPACT", moderate_impact: "MODERATE", low_impact: "LOW",
      footer_engine: "ALOHA INTELLIGENCE ENGINE", back_to_archive: "BACK TO ARCHIVE",
      hero_section: "BREAKING", grid_title: "HEADLINES", opportunities_title: "WEEKLY OPPORTUNITIES",
      academy_title: "TEXTILE ACADEMY", fairs_title: "FAIR CALENDAR", uzakdogu_title: "FAR EAST RADAR",
    },
    DE: {
      today_insight: "TAGESANALYSE", insight_sub: "Aloha Intelligence Extrakt", radar_title: "TRTEX RADAR",
      radar_risk: "GLOBALES RISIKO", radar_signal: "MARKTSIGNAL", radar_opp: "CHANCE",
      radar_all: "ALLE RADARWARNUNGEN →", radar_empty_alert: "ALOHA WARNUNG",
      radar_empty_title: "Fernost-Signal wird erwartet", radar_empty_desc: "Kein aktuelles Asien-Marktsignal erkannt. Autonomer Scan läuft.",
      raw_material: "ROHSTOFF & HERKUNFTSSIGNAL", cotton: "BAUMWOLLE / FASER (Global)", freight: "FRACHT (Asien-Eur)",
      read_time_min: "Min. Lesezeit", thirty_sec_summary: "IN 30 SEKUNDEN VERSTEHEN", meaning_of_news: "WAS DAS BEDEUTET",
      high_impact: "HOHE AUSWIRKUNG", moderate_impact: "MITTEL", low_impact: "GERING",
      footer_engine: "ALOHA INTELLIGENCE ENGINE", back_to_archive: "ZURÜCK ZUM ARCHIV",
      hero_section: "AKTUELL", grid_title: "SCHLAGZEILEN", opportunities_title: "WOCHENCHANCEN",
      academy_title: "TEXTILAKADEMIE", fairs_title: "MESSEKALENDER", uzakdogu_title: "FERNOST RADAR",
    },
    FR: {
      today_insight: "ANALYSE DU JOUR", insight_sub: "Extrait Intelligence Aloha", radar_title: "TRTEX RADAR",
      radar_risk: "RISQUE MONDIAL", radar_signal: "SIGNAL MARCHÉ", radar_opp: "OPPORTUNITÉ",
      radar_all: "TOUTES LES ALERTES RADAR →", footer_engine: "MOTEUR ALOHA INTELLIGENCE",
      raw_material: "MATIÈRE PREMIÈRE & SIGNAL", cotton: "COTON / FIBRE (Global)", freight: "FRET (Asie-Eur)",
      read_time_min: "min de lecture", high_impact: "IMPACT ÉLEVÉ", moderate_impact: "MODÉRÉ", low_impact: "FAIBLE",
      hero_section: "DERNIÈRE HEURE", grid_title: "ACTUALITÉS", opportunities_title: "OPPORTUNITÉS DE LA SEMAINE",
      academy_title: "ACADÉMIE TEXTILE", fairs_title: "CALENDRIER DES SALONS", uzakdogu_title: "RADAR EXTRÊME-ORIENT",
      back_to_archive: "RETOUR AUX ARCHIVES", thirty_sec_summary: "COMPRENDRE EN 30 SECONDES", meaning_of_news: "CE QUE CELA SIGNIFIE",
      radar_empty_alert: "ALERTE ALOHA", radar_empty_title: "En attente du signal", radar_empty_desc: "Aucun signal actuel détecté.",
    },
    ES: {
      today_insight: "ANÁLISIS DEL DÍA", radar_title: "TRTEX RADAR", radar_risk: "RIESGO GLOBAL",
      radar_signal: "SEÑAL DE MERCADO", radar_opp: "OPORTUNIDAD", footer_engine: "MOTOR ALOHA INTELLIGENCE",
      raw_material: "MATERIA PRIMA Y SEÑAL", cotton: "ALGODÓN / FIBRA (Global)", freight: "FLETE (Asia-Eur)",
      hero_section: "ÚLTIMA HORA", grid_title: "TITULARES", opportunities_title: "OPORTUNIDADES SEMANALES",
      academy_title: "ACADEMIA TEXTIL", fairs_title: "CALENDARIO DE FERIAS", uzakdogu_title: "RADAR LEJANO ORIENTE",
      high_impact: "ALTO IMPACTO", moderate_impact: "MODERADO", low_impact: "BAJO", read_time_min: "min lectura",
      back_to_archive: "VOLVER AL ARCHIVO", thirty_sec_summary: "ENTIENDE EN 30 SEGUNDOS", meaning_of_news: "QUÉ SIGNIFICA ESTO",
      insight_sub: "Extracto de Inteligencia Aloha", radar_all: "TODAS LAS ALERTAS →",
      radar_empty_alert: "ALERTA ALOHA", radar_empty_title: "Esperando señal", radar_empty_desc: "Sin señal actual.",
    },
    AR: {
      today_insight: "تحليل اليوم", radar_title: "رادار TRTEX", radar_risk: "مخاطر عالمية",
      radar_signal: "إشارة السوق", radar_opp: "فرصة", footer_engine: "محرك ALOHA الاستخباراتي",
      raw_material: "مواد خام وإشارة المنشأ", cotton: "قطن / ألياف (عالمي)", freight: "شحن (آسيا-أوروبا)",
      hero_section: "عاجل", grid_title: "العناوين", opportunities_title: "فرص الأسبوع",
      academy_title: "أكاديمية النسيج", fairs_title: "تقويم المعارض", uzakdogu_title: "رادار الشرق الأقصى",
      high_impact: "تأثير عالي", moderate_impact: "متوسط", low_impact: "منخفض", read_time_min: "دقيقة قراءة",
      back_to_archive: "العودة للأرشيف", thirty_sec_summary: "افهم في 30 ثانية", meaning_of_news: "ماذا يعني هذا",
      insight_sub: "ملخص استخبارات Aloha", radar_all: "جميع تنبيهات الرادار ←",
      radar_empty_alert: "تنبيه ALOHA", radar_empty_title: "في انتظار الإشارة", radar_empty_desc: "لم يتم اكتشاف إشارة حالية.",
    },
    RU: {
      today_insight: "АНАЛИЗ ДНЯ", radar_title: "РАДАР TRTEX", radar_risk: "ГЛОБАЛЬНЫЙ РИСК",
      radar_signal: "СИГНАЛ РЫНКА", radar_opp: "ВОЗМОЖНОСТЬ", footer_engine: "АНАЛИТИЧЕСКИЙ ДВИЖОК ALOHA",
      raw_material: "СЫРЬЁ И СИГНАЛ ПРОИСХОЖДЕНИЯ", cotton: "ХЛОПОК / ВОЛОКНО (мировое)", freight: "ФРАХТ (Азия-Евр)",
      hero_section: "СРОЧНО", grid_title: "ЗАГОЛОВКИ", opportunities_title: "ВОЗМОЖНОСТИ НЕДЕЛИ",
      academy_title: "ТЕКСТИЛЬНАЯ АКАДЕМИЯ", fairs_title: "КАЛЕНДАРЬ ВЫСТАВОК", uzakdogu_title: "РАДАР ДАЛЬНЕГО ВОСТОКА",
      high_impact: "ВЫСОКОЕ ВЛИЯНИЕ", moderate_impact: "УМЕРЕННОЕ", low_impact: "НИЗКОЕ", read_time_min: "мин чтения",
      back_to_archive: "НАЗАД В АРХИВ", thirty_sec_summary: "ПОЙМИТЕ ЗА 30 СЕКУНД", meaning_of_news: "ЧТО ЭТО ЗНАЧИТ",
      insight_sub: "Сводка Aloha Intelligence", radar_all: "ВСЕ ОПОВЕЩЕНИЯ РАДАРА →",
      radar_empty_alert: "ОПОВЕЩЕНИЕ ALOHA", radar_empty_title: "Ожидание сигнала", radar_empty_desc: "Текущий сигнал не обнаружен.",
    },
    ZH: {
      today_insight: "今日分析", radar_title: "TRTEX 雷达", radar_risk: "全球风险",
      radar_signal: "市场信号", radar_opp: "机会", footer_engine: "ALOHA 情报引擎",
      raw_material: "原材料与产地信号", cotton: "棉花 / 纤维 (全球)", freight: "运费 (亚洲-欧洲)",
      hero_section: "突发", grid_title: "头条", opportunities_title: "本周商机",
      academy_title: "纺织学院", fairs_title: "展会日历", uzakdogu_title: "远东雷达",
      high_impact: "高影响", moderate_impact: "中等", low_impact: "低", read_time_min: "分钟阅读",
      back_to_archive: "返回档案", thirty_sec_summary: "30秒理解", meaning_of_news: "这意味着什么",
      insight_sub: "Aloha 情报摘要", radar_all: "所有雷达警报 →",
      radar_empty_alert: "ALOHA 警报", radar_empty_title: "等待信号中", radar_empty_desc: "未检测到当前信号。",
    },
  };
  (payload as any).ui_labels = STATIC_UI_LABELS;

  // ═══ ADIM 7: PAYLOAD VALIDATION BARIYERİ ( Soft Degrade ) ═══
  await softDegradePayload(payload);

  // ATOMİK WRITE — Firestore'a tek seferde yaz ve B yedeklemesini çalıştır
  if (adminDb) {
    try {
      await adminDb.collection('trtex_terminal').doc('current').set(payload);
      
      // FAIL-SAFE BACKUP (last_good)
      if (intelligenceScore >= 40) { // Yalnızca sağlığı kabul edilebilir olanı yedekleriz
         await adminDb.collection('trtex_terminal').doc('last_good').set(payload);
      }

      // Parça A: IQ Skoru Tracking (Geçmişe Yönelik İstihbarat Hafızası)
      await adminDb.collection('trtex_iq_history').add({
        date: new Date().toISOString(),
        iq: payloadConfidence,
        articleCount: finalGrid.length,
        imageRate: Math.round((finalGrid.filter(a => a.images?.length || a.image_url).length / (finalGrid.length || 1)) * 100),
        signalCount: tickerItems.length,
        version: payload.version,
      });

      console.log(`[TERMINAL BUILDER] ✅ Payload yazıldı (v${payload.version}, IQ ${intelligenceScore}/100, ${finalGrid.length} haber, ${tickerItems.length} ticker)`);
    } catch (writeErr: any) {
      console.error(`[TERMINAL BUILDER] ❌ Firestore write BAŞARISIZ:`, writeErr.message);
      await dlq.record(writeErr, 'terminalPayloadBuilder', 'trtex', 'atomic_write_failed');
      throw writeErr; // Kritik hata — yukarıya ilet
    }
  }

  const duration = Date.now() - startTime;
  console.log(`[TERMINAL BUILDER] 📦 Payload inşası tamamlandı: ${duration}ms`);

  // ═══ ADIM 8: SYSTEM METRICS KAYDI (Intelligence Observability) ═══
  if (adminDb) {
    try {
      const recent6hCount = uniqueNews.filter(a => a.publishedAt && (Date.now() - new Date(a.publishedAt).getTime() < 6 * 60 * 60 * 1000)).length;
      const content_freshness_score = uniqueNews.length > 0 ? Math.round((recent6hCount / uniqueNews.length) * 100) : 0;
      
      const distinctSources = new Set(uniqueNews.map(a => a.source || 'TRTEX')).size;
      const source_diversity_score = Math.min(100, distinctSources * 20); // 5+ distinct source = 100
      
      const opportunity_density = uniqueNews.reduce((acc, a) => acc + (a.business_opportunities?.length || 0), 0);
      
      await adminDb.collection('trtex_system_metrics').doc('current').set({
        payload_build_time: duration,
        content_freshness_score,
        source_diversity_score,
        opportunity_density,
        duplicate_ratio: allNews.length > 0 ? Math.round(((allNews.length - uniqueNews.length) / allNews.length) * 100) : 0,
        ticker_health: tickerItems.length > 3 ? "OK" : "DEGRADED",
        last_cycle_duration: duration,
        error_count_24h: 0, // Bu dışarıdan modul tabanlı set edilecek
        last_successAt: new Date().toISOString()
      }, { merge: true });
    } catch (metricErr) { /* non-blocking */ }
  }

  return payload;
}

async function softDegradePayload(payload: TerminalPayload) {
  let needsDegrade = false;

  if (!payload.heroArticle || payload.gridArticles.length < 3) {
    needsDegrade = true;
    console.warn("[TERMINAL BUILDER] ⚠️ SOFT DEGRADE TRIGGERED: Hero veya Grid eksik.");
  }

  if (needsDegrade && adminDb) {
    try {
      const lastGoodSnap = await adminDb.collection('trtex_terminal').doc('last_good').get();
      if (lastGoodSnap.exists) {
        const lastGoodData = lastGoodSnap.data() as TerminalPayload;
        if (!payload.heroArticle && lastGoodData.heroArticle) {
           payload.heroArticle = lastGoodData.heroArticle;
           console.log("  ↳ Oksijen çadırı: Hero haberi last_good üzerinden kopyalandı.");
        }
        if (payload.gridArticles.length < 3 && lastGoodData.gridArticles.length >= 3) {
           payload.gridArticles = lastGoodData.gridArticles;
           console.log("  ↳ Oksijen çadırı: Grid haberleri last_good üzerinden kopyalandı.");
        }
      }
    } catch (e) {
      console.warn("Soft degrade failed fetching last_good", e);
    }
  }

  // Degrade denemesine rağmen hala hero yoksa (sistem ilk kez kuruluyorsa) dummy at
  if (!payload.heroArticle) {
     payload.heroArticle = { id: 'dummy_hero', title: 'Sistem Başlatılıyor', slug: 'sistem-hazirlaniyor', category: 'Sistem' } as any;
  }
}


// ═══════════════════════════════════════
// VERİ OKUMA FONKSİYONLARI
// ═══════════════════════════════════════

async function readAllNews(): Promise<TerminalArticle[]> {
  if (!adminDb) return [];

  let rawNews: TerminalArticle[] = [];

  // ═══ TÜM YAYINLANMIŞ HABERLERİ ÇEK (V2 Engine + V1.1 Swarm + Legacy) ═══
  // Kaynak fark etmez — editöryel kalite kapısı ve dedup downstream'de filtreler.
  try {
    const snap = await adminDb.collection('trtex_news')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();
    
    rawNews = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data(), quality_score: doc.data().quality_score ?? 70 } as TerminalArticle));
    
    console.log(`[TERMINAL BUILDER] 📰 Toplam havuz: ${rawNews.length} haber`);
  } catch {
    try {
      const snap2 = await adminDb.collection('trtex_news')
        .orderBy('createdAt', 'desc')
        .limit(60)
        .get();
      
      rawNews = snap2.docs
        .map(doc => ({ id: doc.id, ...doc.data(), quality_score: doc.data().quality_score ?? 70 } as TerminalArticle))
        .filter(a => (!a.status || a.status === 'published'));
      
      console.log(`[TERMINAL BUILDER] ⚠️ Firestore index fallback — ${rawNews.length} haber`);
    } catch (err) {
      await dlq.recordSilent(err, 'terminalPayloadBuilder', 'trtex');
    }
  }

  return rawNews;
}

async function readTickerData(): Promise<any> {
  if (!adminDb) return null;
  try {
    const doc = await adminDb.collection('trtex_intelligence').doc('ticker_live').get();
    return doc.exists ? doc.data() : null;
  } catch {
    return null;
  }
}

async function readHomepageBrain(): Promise<any> {
  if (!adminDb) return null;
  try {
    const doc = await adminDb.collection('trtex_intelligence').doc('homepage_brain').get();
    return doc.exists ? doc.data() : null;
  } catch {
    return null;
  }
}

async function readCurrentVersion(): Promise<number> {
  if (!adminDb) return 0;
  try {
    const doc = await adminDb.collection('trtex_terminal').doc('current').get();
    return doc.exists ? (doc.data()?.version || 0) : 0;
  } catch {
    return 0;
  }
}

// ═══════════════════════════════════════
// EDİTÖR KALİTE KAPISI — "Aloha yazıyor, editör de olmalı"
// GPT: "Builder zayıf olursa tüm site kötü olur"
// ═══════════════════════════════════════

// Yasaklı ifadeler — anlamsız, düşük kalite belirteçleri
const EDITORIAL_BANNED_PHRASES = [
  'çok para ödemek',
  'önemli gelişme yaşandı',
  'kritik süreç devam ediyor',
  'devrim niteliğinde',
  'paradigma değişimi',
  'çığır açan',
  'tüm gözler çevrildi',
  'önemli bir adım atıldı',
  'dikkatle takip edilmeli',
  'büyük yankı uyandırdı',
  'lorem ipsum',
  'test haberi',
  'deneme içerik',
];

function editorialQualityGate(news: TerminalArticle[]): TerminalArticle[] {
  return news.filter(article => {
    const title = (article.title || '').trim();
    const content = (article.content || article.summary || '');
    const fullText = `${title} ${content}`.toLowerCase();

    // KURAL 1: Başlık min 15 karakter
    if (title.length < 15) return false;

    // KURAL 2: Başlık max 150 karakter (aşırı uzun başlık = AI garbage)
    if (title.length > 150) return false;

    // KURAL 3: Yasaklı ifade kontrolü
    for (const banned of EDITORIAL_BANNED_PHRASES) {
      if (fullText.includes(banned)) return false;
    }

    // KURAL 4: Tekrar kelime kontrolü — aynı kelime 5+ kez = spam
    const words = fullText.split(/\s+/).filter(w => w.length > 3);
    const wordFreq = new Map<string, number>();
    for (const w of words) {
      wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
    }
    const maxRepeat = Math.max(...Array.from(wordFreq.values()), 0);
    // Toplam kelime sayısının %15'inden fazla tekrar = spam
    if (words.length > 20 && maxRepeat > Math.max(5, words.length * 0.15)) return false;

    // KURAL 5: İçerik minimum uzunluk (summary veya content en az 50 karakter)
    if (content.length < 50 && !article.image_url && !(article.images && article.images.length > 0)) return false;

    return true;
  });
}

// ═══════════════════════════════════════
// SEÇİM ALGORİTMALARI
// ═══════════════════════════════════════

function deduplicateNews(news: TerminalArticle[]): TerminalArticle[] {
  const seen = new Set<string>();
  const unique: TerminalArticle[] = [];

  for (const item of news) {
    const title = (item.title || '').trim().toLowerCase();
    if (!title) continue;
    if (!seen.has(title)) {
      seen.add(title);
      // 🔥 1MB Limit Fix: Content kırpma (silme DEĞİL — detay sayfası için gerekli)
      // Payload'da kısa versiyon, full content Firestore'dan gelir
      const sanitizedItem: any = { ...item };
      if (sanitizedItem.content && sanitizedItem.content.length > 3000) {
        sanitizedItem.content = sanitizedItem.content.substring(0, 3000) + '...';
      }
      if (sanitizedItem.translations) {
         for (const lang of Object.keys(sanitizedItem.translations)) {
            if (sanitizedItem.translations[lang]?.content && sanitizedItem.translations[lang].content.length > 3000) {
               sanitizedItem.translations[lang].content = sanitizedItem.translations[lang].content.substring(0, 3000) + '...';
            }
         }
      }
      
      // Görev 2.4: CEO Brief / Insight Fallback (Eski Haberler İçin)
      if (!sanitizedItem.insight && (!sanitizedItem.ai_ceo_block || !sanitizedItem.ai_ceo_block.executive_summary)) {
        sanitizedItem.insight = {
          explanation: sanitizedItem.summary || "Bu gelişme sektör dinamiklerini doğrudan etkileyebilir; tedarik ve üretim planlarınızı yeniden değerlendirin.",
          direction: "neutral",
          market_impact_score: 50
        };
      }

      unique.push(sanitizedItem);
    }
  }

  return unique;
}

// ═══════════════════════════════════════
// PRIORITY SCORING — GERÇEK ZEKÂ BURADA
// GPT: "Hero seçimi random olmamalı."
// Skor = impact + recency + sector_relevance + image_quality
// ═══════════════════════════════════════

function calculatePriorityScore(article: TerminalArticle): number {
  let score = 0;

  // 1. IMPACT (0-30) — quality_score bazlı
  score += Math.min(30, ((article.quality_score || 0) / 100) * 30);

  // 2. RECENCY (0-25) — ne kadar taze, o kadar değerli
  if (article.createdAt) {
    const ageHours = (Date.now() - new Date(article.createdAt).getTime()) / (1000 * 60 * 60);
    if (ageHours < 6) score += 25;       // 6 saatten taze: tam puan
    else if (ageHours < 24) score += 20;  // 24 saatten taze
    else if (ageHours < 48) score += 12;  // 48 saatten taze
    else if (ageHours < 72) score += 5;   // 72 saatten taze
    // 72+ saat: 0 puan
  }

  // 3. SECTOR RELEVANCE (0-20) — perde/ev tekstili/hammadde ağırlıklı
  const text = `${article.title} ${article.category || ''} ${article.summary || ''}`.toLowerCase();
  if (/perde|curtain|tül|blackout|stor/.test(text)) score += 20;  // ALTIN ALAN
  else if (/ev tekstil|home textile|nevresim|havlu|bornoz/.test(text)) score += 16;
  else if (/hammadde|cotton|pamuk|polyester|iplik/.test(text)) score += 14;
  else if (/ihracat|export|fuar|fair/.test(text)) score += 12;
  else if (/regülasyon|regulation|lojistik|navlun/.test(text)) score += 10;
  else score += 5; // Genel sektör

  // 4. IMAGE QUALITY (0-15) — görselli > görselsiz
  if (article.images && article.images.length >= 3) score += 15;  // 3'lü set: tam puan
  else if (article.images && article.images.length >= 1) score += 10;
  else if (article.image_url) score += 8;
  // Görselsiz: 0 puan

  // 5. AI BLOK BONUS (0-10) — zengin meta veri
  if (article.ai_block || article.ai_ceo_block) score += 5;
  if (article.business_opportunities && article.business_opportunities.length > 0) score += 3;
  if (article.commercial_note && article.commercial_note.length > 20) score += 2;

  return Math.min(100, score);
}

function selectHero(news: TerminalArticle[]): TerminalArticle | null {
  // Önce resimli olanları filtrele
  const newsWithImages = news.filter(a => a.images?.[0] || a.image_url);
  const pool = newsWithImages.length > 0 ? newsWithImages : news;

  if (pool.length === 0) return null;

  // Priority Score hesapla ve sırala
  const scored = pool.map(a => ({
    article: a,
    priority: calculatePriorityScore(a) + (a.images?.[0] || a.image_url ? +20 : -50), // Resmi olana +20 bonus
  }));

  // En yüksek skor = hero
  scored.sort((a, b) => b.priority - a.priority);

  const best = scored[0];
  console.log(`[TERMINAL BUILDER] 🏆 Hero seçildi: "${best.article.title?.substring(0, 50)}..." (Priority: ${best.priority}/100)`);

  return best.article;
}

function selectRadar(pool: any[], radarThreshold: number, oppThreshold: number): TerminalPayload['radarStream'] {
  const risk = pool.find(a =>
    ((a.routing_signals?.world_radar || 0) >= radarThreshold && a.ai_block?.risk?.toLowerCase().includes('yüksek')) ||
    (a.quality_score || 0) >= 60 && a.ai_block?.risk?.toLowerCase().includes('yüksek')
  ) || pool[0] || null;

  const opportunity = pool.find(a =>
    a.id !== risk?.id &&
    ((a.routing_signals?.b2b_opportunity || 0) >= oppThreshold || (a.quality_score || 0) >= 65)
  ) || pool[1] || null;

  const signal = pool.find(a =>
    a.id !== risk?.id &&
    a.id !== opportunity?.id &&
    ((a.routing_signals?.world_radar || 0) >= radarThreshold || a.quality_score >= 50)
  ) || pool[2] || null;

  return { risk, opportunity, signal };
}

function selectAcademy(allNews: any[], heroArticle: any, academyThreshold: number): any[] {
  // Eğitim/analiz/akademi skorlarına göre filtrele
  let candidates = allNews
    .filter(a => (a.routing_signals?.academy_value || 0) >= academyThreshold)
    .sort((a, b) => (b.routing_signals?.academy_value || 0) - (a.routing_signals?.academy_value || 0));

  // Yeterli yoksa hardcoded keywordlere veya yüksek kalite skoruna göre fallback
  if (candidates.length < 2) {
    const fallbackCandidates = allNews
      .filter(a =>
        a.category?.toLowerCase().includes('eğitim') ||
        a.category?.toLowerCase().includes('akademi') ||
        a.category?.toLowerCase().includes('analiz')
      )
      .sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));
      
    candidates = [...candidates, ...fallbackCandidates];
  }

  // Hero ile çakışma engelle ve benzersizleri al
  const uniqueCandidates = Array.from(new Map(candidates.map(item => [item.id, item])).values());
  return uniqueCandidates
    .filter(a => a.id !== heroArticle?.id)
    .slice(0, 2);
}

// ═══════════════════════════════════════
// NORMALİZASYON FONKSİYONLARI
// ═══════════════════════════════════════

function normalizeTickerItems(tickerData: any, recentNews: TerminalArticle[]): TerminalTickerItem[] {
  const items: TerminalTickerItem[] = [];

  if (!tickerData) return items;

  // Macro -> Döviz & Endeks
  if (tickerData.forex?.usd_try?.value) {
    items.push({
      id: 'usdtry', type: 'macro', label: 'USD/TRY',
      value: tickerData.forex.usd_try.value, unit: '₺',
      change: tickerData.forex.usd_try.change || 0,
      direction: tickerData.forex.usd_try.direction || 'stable',
      severity: 'normal', timestamp: Date.now(), businessImpact: 0.95,
    });
  }
  if (tickerData.forex?.eur_try?.value) {
    items.push({
      id: 'eurtry', type: 'macro', label: 'EUR/TRY',
      value: tickerData.forex.eur_try.value, unit: '₺',
      change: tickerData.forex.eur_try.change || 0,
      direction: tickerData.forex.eur_try.direction || 'stable',
      severity: 'normal', timestamp: Date.now(), businessImpact: 0.9,
    });
  }

  // Energy -> Enerji Maliyetleri
  if (tickerData?.commodities?.brent?.value) {
    items.push({
      id: 'brent', type: 'energy', label: 'BRENT',
      value: tickerData.commodities.brent.value, unit: '$',
      change: tickerData.commodities.brent.change || 0,
      direction: tickerData.commodities.brent.change < 0 ? 'down' : 'up',
      severity: 'normal', timestamp: Date.now(), businessImpact: 0.85,
    });
  }

  // Textile -> Emtialar (PTA, Pamuk vs.)
  if (tickerData.commodities) {
    for (const [key, val] of Object.entries(tickerData.commodities) as [string, any][]) {
      if (val?.value && key !== 'brent') {
        items.push({
          id: key, type: 'textile', label: key.toUpperCase(),
          value: val.value, unit: '', change: val.change || 0,
          direction: val.direction || 'stable', severity: 'normal',
          timestamp: Date.now(), businessImpact: 0.8,
        });
      }
    }
  }

  // Logistics -> SCFI Freight
  if (tickerData?.logistics?.scfi?.value) {
    items.push({
      id: 'scfi', type: 'logistics', label: 'SCFI (NAVLUN)',
      value: tickerData.logistics.scfi.value, unit: '$',
      change: tickerData.logistics.scfi.change || 0,
      direction: tickerData.logistics.scfi.change > 0 ? 'up' : 'down',
      severity: 'attention', timestamp: Date.now(), businessImpact: 0.98,
    });
  }

  // Son 5 haberi breaking ticker olarak ekle
  const publishedNews = recentNews
    .filter(a => a.status === 'published' || !a.status)
    .slice(0, 5);

  for (const news of publishedNews) {
    items.push({
      id: news.id, type: 'news_event',
      label: 'SON DAKİKA',
      value: news.ai_ceo_block?.priority_level
        ? news.ai_ceo_block.priority_level.split('-')[0]
        : 'CANLI',
      direction: 'up', severity: 'attention',
      timestamp: news.createdAt ? new Date(news.createdAt).getTime() : Date.now(),
      isBreaking: true,
      newsHeadline: news.translations?.TR?.title || news.title,
    });
  }

  return items;
}

function buildTodayInsight(
  hero: TerminalArticle | null,
  radar: TerminalPayload['radarStream'],
  brainData: any
): TerminalPayload['todayInsight'] {
  return {
    market: brainData?.dailyInsight?.summary
      || hero?.commercial_note
      || 'Küresel tekstil talebi stratejik olarak dengeli seyrediyor.',
    risk: brainData?.dailyInsight?.risk
      || radar.risk?.ai_block?.market
      || 'Lojistik maliyetlerdeki asimetrik dalgalanmalar takip edilmeli.',
    opportunity: brainData?.dailyInsight?.opportunity
      || radar.opportunity?.title
      || 'Türkiye üreticileri Çin\'e alternatif tedarikçi olarak hacmini artırıyor.',
  };
}

async function buildFairCountdown(): Promise<TerminalFair[]> {
  if (!adminDb) return [];
  try {
    // Simple get — composite index gerektirmeyen yaklaşım
    const snap = await adminDb.collection('trtex_fairs').get();
    if (snap.empty) {
      console.log('[TERMINAL BUILDER] 🏛️ trtex_fairs koleksiyonu boş');
      return [];
    }
    
    const today = new Date();
    const fairs = snap.docs
      .map(doc => doc.data() as TerminalFair & { status?: string })
      .filter(f => !f.status || f.status === 'active') // JS tarafında filtrele
      .map(f => {
        const diffTime = new Date(f.date).getTime() - today.getTime();
        return { ...f, daysLeft: Math.ceil(diffTime / (1000 * 60 * 60 * 24)) };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .filter(f => f.daysLeft > -30);

    console.log(`[TERMINAL BUILDER] 🏛️ ${fairs.length} fuar bulundu (${snap.size} toplam)`);
    return fairs;
  } catch (err: any) {
    console.error('[TERMINAL BUILDER] ❌ Fuar verisi okunamadı:', err.message);
    return [];
  }
}

async function buildUzakDoguRadar(brainData: any, recentNews: TerminalArticle[]): Promise<any> {
  if (brainData?.uzakDoguRadari) return brainData.uzakDoguRadari;

  // Gerçek Uzakdoğu haberlerinden sentez 
  const asianNews = recentNews.filter(a => {
    const txt = `${a.title} ${a.summary}`.toLowerCase();
    return txt.includes('çin') || txt.includes('china') || txt.includes('shanghai') || txt.includes('vietnam') || txt.includes('hindistan') || txt.includes('asya');
  });

  if (asianNews.length === 0) return null; // Veri yoksa gösterme

  const topNews = asianNews[0];

  return {
    title: "UZAKDOĞU B2B RADARI",
    status: `ACTIVE MONITORING: ${asianNews.length} SİNYAL`,
    alerts: [
      {
        type: topNews.category || "STRATEJİK UYARI",
        headline: topNews.title,
        detail: topNews.summary || topNews.commercial_note || "",
        confidence: topNews.quality_score ? `%${topNews.quality_score} (YÜKSEK)` : "",
        action: topNews.ai_block?.action || "",
        slug: topNews.slug || topNews.id
      }
    ],
  };
}

// ═══════════════════════════════════════
// PRIORITY ENGINE
// ═══════════════════════════════════════
function buildPriorityEngine(
  heroArticle: TerminalArticle | null,
  radarStream: TerminalPayload['radarStream'],
  intelligenceScore: number
): TerminalPayload['priorityEngine'] {
  let regime: 'RISK_ON' | 'RISK_OFF' | 'NEUTRAL' = 'NEUTRAL';
  let topSignal = 'MARKET STABLE';
  
  if (radarStream.risk && (radarStream.risk.quality_score || 0) >= 80) {
    regime = 'RISK_OFF';
    topSignal = radarStream.risk.ai_block?.action || radarStream.risk.title.substring(0, 30).toUpperCase();
  } else if (radarStream.opportunity && (radarStream.opportunity.quality_score || 0) >= 75) {
    regime = 'RISK_ON';
    topSignal = radarStream.opportunity.ai_block?.action || radarStream.opportunity.title.substring(0, 30).toUpperCase();
  } else if (heroArticle) {
    regime = heroArticle.ai_block?.risk?.toLowerCase().includes('yüksek') ? 'RISK_OFF' : 'NEUTRAL';
    topSignal = heroArticle.commercial_note?.substring(0, 40).toUpperCase() || 'MONITORING';
  }

  // Confidence hesaplaması (Hero impact + Ticker density)
  let confidence = Math.min(99, Math.max(30, intelligenceScore + 15));

  return {
    market_regime: regime,
    top_signal: topSignal,
    confidence_score: confidence,
  };
}

// ═══════════════════════════════════════
// KALİTE SKORU
// ═══════════════════════════════════════

function calculateIntelligenceScore(components: {
  heroArticle: TerminalArticle | null;
  gridArticles: TerminalArticle[];
  radarStream: TerminalPayload['radarStream'];
  academyArticles: TerminalArticle[];
  tickerItems: TerminalTickerItem[];
  todayInsight: TerminalPayload['todayInsight'];
}): number {
  let score = 0;

  // Hero (0-20)
  if (components.heroArticle) {
    score += 10;
    if (components.heroArticle.images && components.heroArticle.images.length >= 3) score += 10;
    else if (components.heroArticle.image_url) score += 5;
  }

  // Grid (0-25) — her haber 2 puan, max 12 haber
  score += Math.min(25, components.gridArticles.length * 2);

  // Radar (0-15) — her slot 5 puan
  if (components.radarStream.risk) score += 5;
  if (components.radarStream.opportunity) score += 5;
  if (components.radarStream.signal) score += 5;

  // Academy (0-10)
  score += Math.min(10, components.academyArticles.length * 5);

  // Ticker (0-15) — döviz 5, emtia 5, breaking 5
  const hasFx = components.tickerItems.some(t => t.type === 'macro' || t.type === 'energy');
  const hasCommodity = components.tickerItems.some(t => t.type === 'textile' || t.type === 'logistics');
  const hasBreaking = components.tickerItems.some(t => t.type === 'news_event');
  if (hasFx) score += 5;
  if (hasCommodity) score += 5;
  if (hasBreaking) score += 5;

  // Insight (0-15)
  if (components.todayInsight.market && components.todayInsight.market.length > 20) score += 5;
  if (components.todayInsight.risk && components.todayInsight.risk.length > 20) score += 5;
  if (components.todayInsight.opportunity && components.todayInsight.opportunity.length > 20) score += 5;

  return Math.min(100, score);
}
