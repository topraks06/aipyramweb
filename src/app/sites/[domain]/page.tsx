import { adminDb } from "@/lib/firebase-admin";
import PremiumB2BHomeLayout from '@/components/home/PremiumB2BHomeLayout';
import PerdeLandingPage from '@/components/node-perde/PerdeLandingPage';
import HometexLandingPage from '@/components/node-hometex/HometexLandingPage';
import VorhangLandingPage from '@/components/node-vorhang/VorhangLandingPage';
import IntelligenceTicker from "@/components/trtex/IntelligenceTicker";
import OpportunityRadarWidget from "@/components/trtex/OpportunityRadarWidget";
import type { Metadata } from 'next';

export const dynamic = "force-dynamic";

// SEO — Dinamik Title ve Description
export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const brandName = exactDomain.split('.')[0].toUpperCase();
  
  return {
    title: `${brandName} — B2B Ev Tekstili İstihbarat Terminali`,
    description: `${brandName}.com — Perde, ev tekstili, döşemelik sektörü B2B istihbarat platformu. Otonom AI-destekli pazar analizi, fuar takvimi, ticari fırsatlar ve gerçek zamanlı sektör sinyalleri.`,
    icons: {
      icon: `/assets/${exactDomain}/favicon.ico`,
      shortcut: `/assets/${exactDomain}/favicon.png`,
      apple: `/assets/${exactDomain}/apple-touch-icon.png`,
    },
    openGraph: {
      title: `${brandName} — B2B Textile Intelligence Terminal`,
      description: `Real-time B2B intelligence for curtain, home textile & upholstery industry. Powered by TRTEX AI Engine.`,
      type: 'website',
      images: [
        {
          url: `/assets/${exactDomain}/og-image.jpg`,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: `https://${exactDomain}`,
      languages: {
        'tr': `https://${exactDomain}`,
        'en': `https://${exactDomain}?lang=en`,
        'de': `https://${exactDomain}?lang=de`,
        'ru': `https://${exactDomain}?lang=ru`,
        'zh': `https://${exactDomain}?lang=zh`,
        'ar': `https://${exactDomain}?lang=ar`,
        'es': `https://${exactDomain}?lang=es`,
        'fr': `https://${exactDomain}?lang=fr`,
      }
    }
  };
}

interface SitePageProps {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ lang?: string; page?: string }>;
}

// --- ANA SAYFA VERİ OKUYUCU (v3 — SIFIRDAN) ---
// ESKİ SORUN: trtex_terminal.current'ten okuyordu. 
// Eski builder (terminalPayloadBuilder) bunu sürekli eski verilerle eziyordu.
// KÖKTEN ÇÖZÜM: Haberler DAIMA trtex_news'ten okunur (taze, güvenilir).
// Terminal'den sadece ticker/fuar gibi ek veri alınır - haberler ASLA terminal'den gelmez.
async function fetchAlohaPayload(projectName: string, cmsData?: any) {
  try {
    // ═══ ADIM 1: HABERLER — DOĞRUDAN trtex_news'ten (TEK GERÇEK KAYNAK) ═══
    let freshArticles: any[] = [];

    // Deneme 1: status + createdAt composite index
    try {
      const snap = await adminDb.collection(`${projectName}_news`)
        .where('status', '==', 'published')
        .orderBy('createdAt', 'desc')
        .limit(15)
        .get();
      freshArticles = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e1: any) {
      console.warn('[TRTEX] Index hatası (status+createdAt), fallback deneniyor:', e1.message?.substring(0, 80));
    }

    // Deneme 2: Sadece createdAt sıralaması (index gerektirmez)
    if (freshArticles.length === 0) {
      try {
        const snap2 = await adminDb.collection(`${projectName}_news`)
          .orderBy('createdAt', 'desc')
          .limit(30)
          .get();
        freshArticles = snap2.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((a: any) => !a.status || a.status === 'published')
          .slice(0, 15);
      } catch (e2: any) {
        console.warn('[TRTEX] createdAt sıralaması da başarısız:', e2.message?.substring(0, 80));
      }
    }

    // Deneme 3: Ham koleksiyon okuma (son çare)
    if (freshArticles.length === 0) {
      try {
        const snap3 = await adminDb.collection(`${projectName}_news`).limit(30).get();
        freshArticles = snap3.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((a: any) => !a.status || a.status === 'published')
          .sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''))
          .slice(0, 15);
      } catch (e3: any) {
        console.error('[TRTEX] Ham okuma da başarısız:', e3.message);
      }
    }

    if (freshArticles.length === 0) {
      console.warn('[TRTEX] ⚠️ trtex_news koleksiyonunda hiç haber yok');
      return null;
    }

    console.log(`[TRTEX] ✅ ${freshArticles.length} taze haber doğrudan trtex_news'ten okundu`);

    // ═══ ADIM 2: EK VERİLER — terminal'den sadece ticker/fuar/insight (haber DEĞİL) ═══
    let terminalExtras: any = {};
    try {
      const termDoc = await adminDb.collection(`${projectName}_terminal`).doc('current').get();
      if (termDoc.exists) {
        const td = termDoc.data();
        terminalExtras = {
          tickerItems: td?.tickerItems || [],
          todayInsight: td?.todayInsight || null,
          fairsWithCountdown: td?.fairsWithCountdown || [],
          uzakDoguRadari: td?.uzakDoguRadari || null,
          decision_engine: td?.decision_engine || null,
          priorityEngine: td?.priorityEngine || null,
          ui_labels: td?.ui_labels || null,
          activeTenders: td?.activeTenders || [],
        };
      }
    } catch { /* terminal yoksa sorunsuz devam */ }

    // ═══ ADIM 3: SİSTEM METRİKLERİ ═══
    let sysMetrics: any = {};
    try {
      const metricsDoc = await adminDb.collection(`${projectName}_system_metrics`).doc('current').get();
      if (metricsDoc.exists) sysMetrics = metricsDoc.data();
    } catch { /* sorunsuz */ }

    // ═══ ADIM 4: PAYLOAD İNŞA ET ═══
    const hero = freshArticles[0] as any;
    const grid = freshArticles.slice(1, 13);

    // ZEKİ FİLTRELEME (Akademi, Fırsat, Radar)
    const academyPool = freshArticles.filter(a => {
      const cat = a.category?.toLowerCase() || '';
      return cat.includes('akademi') || cat.includes('eğitim') || (a.routing_signals?.academy_value || 0) >= 0.6;
    });

    const oppPool = freshArticles.filter(a => {
      return (a.routing_signals?.b2b_opportunity || 0) >= 0.6 || (a.business_opportunities?.length > 0);
    });

    const radarPool = freshArticles.filter(a => {
      const cat = a.category?.toUpperCase() || '';
      return cat === 'RADAR' || (a.routing_signals?.world_radar || 0) >= 0.6 || a.ai_block?.risk;
    });

    return {
      // HABERLER — TAZE VERİ (trtex_news'ten)
      heroArticle: hero,
      gridArticles: grid,
      haftaninFirsatlari: oppPool.length > 0 ? oppPool.slice(0, 5) : freshArticles.slice(0, 5),
      academyArticles: academyPool.slice(0, 4),
      radarStream: {
        risk: radarPool[0] || freshArticles[1] || null,
        opportunity: radarPool[1] || freshArticles[2] || null,
        signal: radarPool[2] || freshArticles[3] || null,
      },

      // EK VERİLER — terminal'den (ticker, fuar, insight)
      tickerItems: terminalExtras.tickerItems || [],
      todayInsight: terminalExtras.todayInsight || {
        market: hero?.commercial_note || '',
        risk: '',
        opportunity: '',
      },
      fairsWithCountdown: terminalExtras.fairsWithCountdown || [],
      uzakDoguRadari: terminalExtras.uzakDoguRadari || null,
      decision_engine: terminalExtras.decision_engine || null,
      priorityEngine: terminalExtras.priorityEngine || null,
      ui_labels: terminalExtras.ui_labels || null,
      activeTenders: terminalExtras.activeTenders || [],

      // META
      menuConfig: [
        { id: 'haberler', label: 'HABERLER', slug: 'news', subItems: [
          { id: 'guncel', label: 'Son Haberler', slug: 'news' },
          { id: 'radar', label: 'Dünya Radarı', slug: 'radar' },
        ]},
        { id: 'ihaleler', label: 'İHALELER', slug: 'tenders' },
        { id: 'ticaret', label: 'TİCARET', slug: 'trade' },
        { id: 'piyasa', label: 'PİYASA VERİLERİ', slug: 'market-data' },
        { id: 'firsatlar', label: 'GLOBAL FIRSATLAR', slug: 'opportunities' },
        { id: 'akademi', label: 'AKADEMİ', slug: 'academy' },
      ],
      hasPremiumReport: true,
      intelligenceScore: freshArticles.length * 7,
      generatedAt: new Date().toISOString(),
      version: Date.now(),
      cycleId: 'direct-read',
      sysMetrics,
      systemStatus: 'LIVE' as const,
      isOffline: false,
      cmsData, // Omni-CMS verileri
    };
  } catch (e) {
    console.error('[TRTEX] ❌ fetchAlohaPayload hatası:', e);
    return null;
  }
}

export default async function SitePage({ params, searchParams }: SitePageProps) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const lang = resolvedSearch?.lang || "tr";

  let projectName = 'trtex';
  if (exactDomain.includes('hometex')) projectName = 'hometex';
  if (exactDomain.includes('perde')) projectName = 'perde';
  if (exactDomain.includes('vorhang')) projectName = 'vorhang';
  if (exactDomain.includes('icmimar')) projectName = 'icmimar';
  if (exactDomain.includes('heimtex')) projectName = 'heimtex';
  if (exactDomain.includes('curtaindesign')) projectName = 'curtaindesign';
  const brandName = exactDomain.split('.')[0].toUpperCase();

  // ═══ OMNI-CMS VERİLERİ (sovereign_cms) ═══
  let cmsData: any = { hero_image: null, hero_text: null, slogan: null };
  try {
    const cmsSnap = await adminDb.collection('sovereign_cms')
      .where('targetNode', 'in', [projectName, 'all'])
      .where('isActive', '==', true)
      .get();
    cmsSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.contentType === 'hero_image') cmsData.hero_image = data;
      if (data.contentType === 'hero_text') cmsData.hero_text = data;
      if (data.contentType === 'slogan') cmsData.slogan = data;
    });
  } catch (e) { console.warn('[CMS] Fetch error:', e); }

  // 🌍 MİMARİ KARAR: DOMAIN RESOLVER (aipyram ROUTER)
  if (projectName === 'heimtex') {
    const HeimtexLandingPage = (await import('@/components/node-heimtex/HeimtexLandingPage')).default;
    let articles: any[] = [];
    let trends: any[] = [];
    try {
      const articlesSnap = await adminDb.collection('heimtex_articles').orderBy('publishedAt', 'desc').limit(4).get();
      articles = articlesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const trendsSnap = await adminDb.collection('heimtex_trends').limit(3).get();
      trends = trendsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[HEIMTEX] Firestore fetch error:', e);
    }
    return <HeimtexLandingPage lang={lang} articles={articles} trends={trends} />;
  }
  if (projectName === 'perde') {
    return <PerdeLandingPage cmsData={cmsData} />;
  }
  if (projectName === 'icmimar') {
    const IcmimarLandingPage = (await import('@/components/node-icmimar/IcmimarLandingPage')).default;
    return <IcmimarLandingPage />;
  }
  if (projectName === 'hometex') {
    let articles: any[] = [];
    let exhibitors: any[] = [];
    let halls: any[] = [];
    try {
      const articlesSnap = await adminDb.collection('hometex_articles').orderBy('publishedAt', 'desc').limit(4).get();
      const exhibitorsSnap = await adminDb.collection('hometex_exhibitors').limit(6).get();
      const hallsSnap = await adminDb.collection('hometex_halls').limit(8).get();
      articles = articlesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      exhibitors = exhibitorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      halls = hallsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[HOMETEX] Firestore fetch error:', e);
    }
    return <HometexLandingPage articles={articles} exhibitors={exhibitors} halls={halls} />;
  }
  if (projectName === 'vorhang') {
    let products: any[] = [];
    try {
      const productsSnap = await adminDb.collection('vorhang_products').limit(6).get();
      products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[VORHANG] Firestore fetch error:', e);
    }
    return <VorhangLandingPage products={products} />;
  }
  if (projectName === 'curtaindesign') {
    const CurtaindesignLandingPage = (await import('@/components/node-curtaindesign/CurtaindesignLandingPage')).default;
    let products: any[] = [];
    try {
      const productsSnap = await adminDb.collection('curtaindesign_products').limit(8).get();
      products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[CURTAINDESIGN] Firestore fetch error:', e);
    }
    return <CurtaindesignLandingPage products={products} />;
  }

  // FAZ 1.4: basePath for localhost routing
  const basePath = `/sites/${exactDomain}`;

  // FAZ 2.1: 8-Dil Merkezi t() motoru
  const { t } = await import('@/i18n/labels');
  const { LOCALE_MAP } = await import('@/i18n/labels');
  const L = {
    impact: t('impact', lang), density: t('density', lang), diversity: t('diversity', lang), freshness: t('freshness', lang),
    globalRisk: t('globalRisk', lang), marketSignal: t('marketSignal', lang), opportunity: t('opportunity', lang),
    academy: t('textileAcademy', lang), expertHub: t('expertHub', lang),
    premiumBadge: t('premiumBadge', lang), reviewReport: t('reviewReport', lang),
    graphLabel: t('graphLabel', lang), sovLimit: t('sovLimit', lang),
    academyDesc: t('academyHomeDesc', lang),
  };

  // DUMB CLIENT: Frontend SADECE bu önceden pişmiş payload'u alır.
  const payload: any = await fetchAlohaPayload(projectName, cmsData);
  
  if (!payload) return <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'monospace' }}>{t('syncing', lang)}</div>;

  const { heroArticle, gridArticles, radarStream, todayInsight, tickerItems, haftaninFirsatlari, academyArticles, hasPremiumReport, menuConfig, systemStatus, decision_engine, payloadConfidence, sysMetrics } = payload;
  const { market: wmtMarket, risk: wmtRisk, opportunity: wmtOpportunity } = todayInsight || {};

  // 8-Dil Otonom Ajan Desteği
  const targetLang = lang.toUpperCase();
  const uzakBase = payload.uzakDoguRadari;
  const uzakDoguRadari = uzakBase?.[targetLang] ? uzakBase[targetLang][0] : Array.isArray(uzakBase) ? uzakBase[0] : uzakBase;
  
  const priorityBase = payload.priorityEngine;
  const priorityEngine = priorityBase?.[targetLang] ? priorityBase[targetLang][0] : Array.isArray(priorityBase) ? priorityBase[0] : priorityBase;
  
  const fairsBase = payload.fairsWithCountdown;
  const fairsWithCountdown = fairsBase?.[targetLang] ? fairsBase[targetLang] : Array.isArray(fairsBase) ? fairsBase : [];

  const uiBase = (payload as any).ui_labels;
  const ui = uiBase?.[targetLang] || uiBase?.['EN'] || uiBase?.['TR'] || {
    today_insight: "TODAY INSIGHT", insight_sub: "TRTEX Intelligence Extract",
    radar_title: "TRTEX RADAR", radar_risk: "GLOBAL RISK", radar_signal: "MARKET SIGNAL", radar_opp: "OPPORTUNITY",
    radar_all: "TÜM RADAR UYARILARI →", radar_empty_alert: "TRTEX UYARISI",
    radar_empty_title: "Uzakdoğu Sinyali Bekleniyor", radar_empty_desc: "Otonom tarama sürüyor.",
    raw_material: "HAMMADDE & KÖKEN SİNYALİ", cotton: "PAMUK / LİF (Global)", freight: "NAVLUN (Asya-Avr)"
  };

  const dateFormat = (d: string) => {
    try { return new Date(d).toLocaleDateString(LOCALE_MAP[lang] || 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return ''; }
  };

  return (
    <PremiumB2BHomeLayout
      payload={payload}
      lang={lang}
      exactDomain={exactDomain}
      basePath={basePath}
      brandName={brandName}
      L={L}
      uzakDoguRadari={uzakDoguRadari}
      priorityEngine={priorityEngine}
      fairsWithCountdown={fairsWithCountdown}
      ui={ui}
    />
  );
}
