/**
 * ALOHA TRADE PIPELINE — "Haber = Ticaret Sinyali"
 * 
 * Bu modül 125 haberi → ticari fırsata çevirir.
 * En güçlü 5 fırsat için landing page üretir.
 * Lead toplama akışını başlatır.
 * 
 * AKIŞ:
 * 1. Firestore'dan haberleri çek
 * 2. Gemini ile her haberden ticari fırsat çıkar
 * 3. Fırsatları puanla ve sırala
 * 4. Top-5 için landing page şablonu üret
 * 5. trtex_opportunities koleksiyonuna yaz
 * 
 * "Aloha teknik ekip değil, ticaret ortağı"
 */

import { adminDb } from '@/lib/firebase-admin';
import { alohaAI } from './aiClient';
import { dlq } from './dlq';

// ═══════════════════════════════════════
// TİPLER
// ═══════════════════════════════════════

export interface TradeOpportunity {
  id?: string;
  sourceNewsId: string;
  sourceNewsTitle: string;
  type: 'import_demand' | 'export_opportunity' | 'market_gap' | 'trend_surge' | 'competitor_exit' | 'regulation_change';
  targetCountries: string[];
  targetBuyers: string[];
  productCategories: string[];
  estimatedValue: 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'this_week' | 'this_month';
  actionPlan: string[];
  landingPageSlug?: string;
  status: 'detected' | 'page_created' | 'leads_collecting' | 'converted';
  score: number;  // 0-100
  createdAt: string;
}

export interface TradePipelineResult {
  newsAnalyzed: number;
  opportunitiesFound: number;
  landingPagesGenerated: number;
  topOpportunities: TradeOpportunity[];
  summary: string;
}

/**
 * Q2 Vision: Native Infographics
 * Üretilen ticari analiz raporunu görselleştirilebilir bir JSON şablonu halinde döndürür.
 * Bu veri istemci tarafında (ör. Recharts, Tailwind chart) render edilecektir.
 */
export async function generateTradeInfographic(): Promise<any> {
  const snapshot = await adminDb.collection('trtex_opportunities')
    .orderBy('score', 'desc')
    .limit(5)
    .get();

  const opps = snapshot.docs.map(d => d.data());
  const categories = opps.flatMap(o => o.productCategories || []);
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

  return {
    type: "NATIVE_INFOGRAPHIC",
    chartType: "BAR",
    title: "TRTex Fırsat Dağılımı",
    data: data.length > 0 ? data : [{ name: "Yükleniyor", value: 0 }],
    meta: {
      totalOpportunities: opps.length,
      topCategory: data.sort((a, b) => b.value - a.value)[0]?.name || "N/A"
    }
  };
}

// ═══════════════════════════════════════
// 1. ANA PIPELINE — HABER→FIRSAT→SAYFA
// ═══════════════════════════════════════

export async function runTradePipeline(project: string = 'trtex'): Promise<TradePipelineResult> {
  console.log(`[TRADE PIPE] 🚀 TİCARET MODU BAŞLADI — ${project}`);
  const startTime = Date.now();

  // 1. Haberleri çek
  const newsItems = await fetchNews(project);
  if (newsItems.length === 0) {
    return { newsAnalyzed: 0, opportunitiesFound: 0, landingPagesGenerated: 0, topOpportunities: [], summary: 'Haber bulunamadı' };
  }

  // 2. Haberleri fırsata çevir
  const opportunities = await analyzeNewsForOpportunities(newsItems);

  // 3. Fırsatları puanla ve sırala
  const rankedOpps = rankOpportunities(opportunities);

  // 4. Top 5 için landing page bilgisi üret
  const top5 = rankedOpps.slice(0, 5);
  let pagesGenerated = 0;
  for (const opp of top5) {
    const page = await generateLandingPageData(opp);
    if (page) {
      opp.landingPageSlug = page.slug;
      opp.status = 'page_created';
      pagesGenerated++;
    }
  }

  // 5. Firestore'a yaz
  await saveOpportunities(project, rankedOpps);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const summary = `[TRADE PIPE] ✅ ${elapsed}s | ${newsItems.length} haber → ${opportunities.length} fırsat → ${pagesGenerated} landing page`;
  console.log(summary);

  return {
    newsAnalyzed: newsItems.length,
    opportunitiesFound: opportunities.length,
    landingPagesGenerated: pagesGenerated,
    topOpportunities: top5,
    summary,
  };
}

// ═══════════════════════════════════════
// 2. HABER ÇEK
// ═══════════════════════════════════════

async function fetchNews(project: string): Promise<Array<{ id: string; title: string; summary: string; category: string }>> {
  try {
    // created_at ile dene
    let snapshot;
    try {
      snapshot = await adminDb.collection(`${project}_news`).orderBy('created_at', 'desc').limit(60).get();
    } catch {
      // createdAt fallback
      snapshot = await adminDb.collection(`${project}_news`).orderBy('createdAt', 'desc').limit(60).get();
    }

    if (!snapshot || snapshot.empty) {
      // Son fallback — direkt limit
      snapshot = await adminDb.collection(`${project}_news`).limit(60).get();
    }

    return snapshot.docs.map(doc => {
      const d = doc.data();
      const title = d.title || d.TR?.title || d.EN?.title || '';
      const summary = (d.summary || d.TR?.summary || d.content || d.TR?.content || '').substring(0, 300);
      return { id: doc.id, title, summary, category: d.category || '' };
    }).filter(n => n.title.length > 10);
  } catch (err: any) {
    console.error(`[TRADE PIPE] Haber çekme hatası:`, err.message);
    return [];
  }
}

// ═══════════════════════════════════════
// 3. HABER → FIRSAT ANALİZİ
// ═══════════════════════════════════════

async function analyzeNewsForOpportunities(
  newsItems: Array<{ id: string; title: string; summary: string; category: string }>
): Promise<TradeOpportunity[]> {
  const allOpps: TradeOpportunity[] = [];

  // 15'erli batch
  for (let i = 0; i < newsItems.length; i += 15) {
    const batch = newsItems.slice(i, i + 15);
    const newsList = batch.map((n, idx) =>
      `[${idx + 1}] "${n.title}" (${n.category}) — ${n.summary.substring(0, 150)}`
    ).join('\n');

    try {
      const parsed = await alohaAI.generateJSON<any[]>(
        `Sen dünya çapında bir B2B tekstil ticaret istihbarat uzmanısın.

GÖREV: Her haberden TİCARİ FIRSAT çıkar. Sadece PARA GETİREN, SOMUT fırsatları bul.

HABERLER:
${newsList}

Her fırsat için belirle:
- type: import_demand | export_opportunity | market_gap | trend_surge | competitor_exit | regulation_change
- targetCountries: ["DE","PL","SA","AE","US","GB","FR","EG","NG"] gibi ülke kodları
- targetBuyers: kim alıcı? ["Alman toptancılar","Suudi otel zincirleri","Polonyalı perakendeciler"]
- productCategories: ["perde","havlu","nevresim","masa örtüsü","döşemelik"]
- estimatedValue: high | medium | low
- urgency: immediate | this_week | this_month
- actionPlan: ["Landing page aç: Almanya perde tedarikçisi","Lead toplama formu ekle","SEO: 'Turkish curtain wholesale Germany'"]

EN AZ 5, EN FAZLA 8 fırsat çıkar. JSON array döndür:
[{"newsIndex":1,"type":"...","targetCountries":[...],"targetBuyers":[...],"productCategories":[...],"estimatedValue":"...","urgency":"...","actionPlan":["..."]}]

SADECE JSON döndür.`,
        { complexity: 'routine' },
        'trade_pipeline'
      );

      if (parsed && Array.isArray(parsed)) {
        for (const item of parsed) {
            const srcNews = batch[(item.newsIndex || 1) - 1];
            if (!srcNews) continue;

            allOpps.push({
              sourceNewsId: srcNews.id,
              sourceNewsTitle: srcNews.title,
              type: item.type || 'market_gap',
              targetCountries: item.targetCountries || [],
              targetBuyers: item.targetBuyers || [],
              productCategories: item.productCategories || [],
              estimatedValue: item.estimatedValue || 'medium',
              urgency: item.urgency || 'this_week',
              actionPlan: item.actionPlan || [],
              status: 'detected',
              score: 0,  // puanlanacak
              createdAt: new Date().toISOString(),
            });
        }
      }
    } catch (err: any) {
      console.warn(`[TRADE PIPE] Batch analiz hatası:`, err.message);
    }
  }

  return allOpps;
}

// ═══════════════════════════════════════
// 4. FIRSAT PUANLAMA & SIRALAMA
// ═══════════════════════════════════════

function rankOpportunities(opps: TradeOpportunity[]): TradeOpportunity[] {
  const valueMap = { high: 40, medium: 25, low: 10 };
  const urgencyMap = { immediate: 30, this_week: 20, this_month: 10 };
  const premiumCountries = ['DE', 'US', 'GB', 'SA', 'AE', 'FR', 'PL', 'NL', 'IT'];

  for (const opp of opps) {
    let score = 0;
    score += valueMap[opp.estimatedValue] || 15;
    score += urgencyMap[opp.urgency] || 10;

    // Premium ülke bonusu
    const hasPremium = opp.targetCountries.some(c => premiumCountries.includes(c));
    if (hasPremium) score += 20;

    // Çok ülkeli fırsat bonusu
    if (opp.targetCountries.length >= 3) score += 10;

    opp.score = Math.min(score, 100);
  }

  return opps.sort((a, b) => b.score - a.score);
}

// ═══════════════════════════════════════
// 5. LANDING PAGE VERİSİ ÜRET
// ═══════════════════════════════════════

async function generateLandingPageData(opp: TradeOpportunity): Promise<{ slug: string; keywords: string[] } | null> {
  try {
    const parsed = await alohaAI.generateJSON<{ slug: string; keywords: string[] }>(
      `B2B landing page için slug ve SEO keywordleri üret.

TİCARİ FIRSAT:
- Ülkeler: ${opp.targetCountries.join(', ')}
- Alıcılar: ${opp.targetBuyers.join(', ')}
- Ürünler: ${opp.productCategories.join(', ')}
- Kaynak: ${opp.sourceNewsTitle}

1. İngilizce URL slug (kısa, SEO uyumlu, tire ile)
2. 5 adet SEO keyword (İngilizce)

JSON döndür: {"slug":"turkish-curtain-wholesale-germany","keywords":["..."]}
SADECE JSON döndür.`,
      { complexity: 'routine' },
      'trade_pipeline'
    );

    if (parsed && parsed.slug) {
      // Firestore'a landing page kaydet
      try {
        await adminDb.collection('trtex_landing_pages').add({
          slug: parsed.slug,
          keywords: parsed.keywords || [],
          opportunityId: opp.id || '',
          targetCountries: opp.targetCountries,
          productCategories: opp.productCategories,
          sourceNewsTitle: opp.sourceNewsTitle,
          status: 'draft',
          leadCount: 0,
          createdAt: new Date().toISOString(),
        });
      } catch (e) { await dlq.recordSilent(e, 'tradePipeline', 'trtex'); }

      return { slug: parsed.slug, keywords: parsed.keywords || [] };
    }
  } catch (err: any) {
    console.warn(`[TRADE PIPE] Landing page üretim hatası:`, err.message);
  }
  return null;
}

// ═══════════════════════════════════════
// 6. FIRESTORE'A KAYDET
// ═══════════════════════════════════════

async function saveOpportunities(project: string, opps: TradeOpportunity[]): Promise<void> {
  try {
    const batch = adminDb.batch?.();
    if (!batch) {
      // Manual fallback
      for (const opp of opps.slice(0, 30)) {
        try {
          await adminDb.collection('trtex_opportunities').add(opp);
        } catch (e) { await dlq.recordSilent(e, 'tradePipeline', 'trtex'); }
      }
      return;
    }

    for (const opp of opps.slice(0, 30)) {
      const ref = adminDb.collection('trtex_opportunities').doc();
      batch.set(ref, opp);
    }
    await batch.commit();
    console.log(`[TRADE PIPE] ✅ ${Math.min(opps.length, 30)} fırsat Firestore'a kaydedildi`);
  } catch (err: any) {
    console.warn(`[TRADE PIPE] Batch kayıt hatası, tek tek yazılıyor:`, err.message);
    for (const opp of opps.slice(0, 10)) {
      try { await adminDb.collection('trtex_opportunities').add(opp); } catch (e) { await dlq.recordSilent(e, 'tradePipeline', 'trtex'); }
    }
  }
}

// ═══════════════════════════════════════
// 7. TRADE REPORT (Aloha Tool)
// ═══════════════════════════════════════

export async function getTradeReport(): Promise<string> {
  try {
    const opps = await adminDb.collection('trtex_opportunities').orderBy('createdAt', 'desc').limit(30).get();
    const pages = await adminDb.collection('trtex_landing_pages').limit(20).get();
    const leads = await adminDb.collection('trtex_leads').limit(100).get();

    const topOpps = opps.docs.slice(0, 5).map(d => {
      const o = d.data();
      return `[${o.score || 0}] ${o.targetCountries?.join(',')} | ${o.productCategories?.join(',')} | ${o.urgency} | ${o.status}`;
    });

    return `═══ TRTEX TİCARET RAPORU ═══
Fırsatlar: ${opps.size}
Landing Page: ${pages.size}
Lead: ${leads.size}
Top 5:
${topOpps.join('\n')}`;
  } catch (err: any) {
    return `Ticaret raporu alınamadı: ${err.message}`;
  }
}
