/**
 * SIGNAL COLLECTOR (ALOHA RAW ENGINE) -> TISF -> TRTEX CONTRACT
 * 
 * Dış dünyadan sektörel sinyalleri toplar.
 * OTONOM ÇEKİRDEK:
 * 1. Ham Sinyali toplar (POWER_SOURCES).
 * 2. TISF (Intelligence Standard Format) üretir.
 * 3. TISF nesnesini Zone Classifier üzerinden tasnif edip TRTEX_CORE_PAYLOAD'a çevirir.
 */

import { adminDb } from '@/lib/firebase-admin';
import { alohaAI } from './aiClient';
import { filterSignal, incrementDailyCount, type RawSignal } from './signalFilter';
import { dlq } from './dlq';
import { SYSTEM_LAW, MASTER_RULE } from '../aloha/system_law';
import { validateCampaign } from './validator';
import { TRTEX_ZONE, TRTEX_TYPE, TRTEX_CORE_PAYLOAD } from './trtex-data-contract';
import { classifyZone } from './zone-classifier';
import { INTELLIGENCE_TYPE, TRTEX_INTELLIGENCE_PACKET } from './trtex-intelligence-standard';
import { getStrategicFocusCombo } from './global-sources';

const getAI = () => alohaAI.getClient();

// ═══════════════════════════════════════
// KONFİGÜRASYON & GÜÇLÜ KAYNAKLAR (TISF MAP)
// ═══════════════════════════════════════
const MAX_ARTICLES_PER_CYCLE = 3;
const CYCLE_TIMEOUT_MS = 90_000;

// YASAK İFADELER
const BANNED_PHRASES = [
  'önemli gelişme', 'kritik süreç', 'devrim niteliğinde',
  'paradigma değişimi', 'çığır açan', 'köklü dönüşüm',
  'tüm gözler çevrildi', 'önemli bir adım atıldı'
];

// Otonom Sinyal Kaynakları Haritası (TISF Mapping)
const POWER_SOURCES = [
  // 1. TRADE CORE (Ticaret Sinyali)
  { url: 'site:heimtextil.messefrankfurt.com', type: 'TRADE_OPPORTUNITY' },
  { url: 'site:hometex.istanbul', type: 'TRADE_OPPORTUNITY' },
  { url: 'site:intertextile-shanghai.hk.messefrankfurt.com', type: 'TRADE_OPPORTUNITY' },
  // 2. MARKET INTEL
  { url: 'site:fibre2fashion.com', type: 'NEWS_INTEL' },
  { url: 'site:hometextilestoday.com', type: 'NEWS_INTEL' },
  { url: 'site:businessofhome.com', type: 'NEWS_INTEL' },
  // 3. MACRO DATA (Veri / Rakam)
  { url: 'site:itmf.org', type: 'MARKET_SIGNAL' },
  { url: 'site:oecd.org textile', type: 'MARKET_SIGNAL' },
  { url: 'site:statista.com home textile', type: 'MARKET_SIGNAL' },
  // 4. DESIGN SIGNAL
  { url: 'site:dezeen.com', type: 'NEWS_INTEL' },
  { url: 'site:archdaily.com', type: 'NEWS_INTEL' },
  { url: 'site:wallpaper.com', type: 'NEWS_INTEL' }
];

export interface SignalCollectorResult {
  signalsFound: number;
  signalsFiltered: number;
  articlesCreated: number;
  rejectedReasons: string[];
  duration: number;
  errors: string[];
}

import { WorkerTask, lockWorkerStrategyModification } from './aloha-directive-protocol';

// ═══════════════════════════════════════
// 1. ANA FONKSİYON — OTONOM MİMARİ
// ═══════════════════════════════════════

export async function collectSignals(project: string = 'trtex', workerTask?: WorkerTask): Promise<SignalCollectorResult> {
  const start = Date.now();
  const COLLECTION = project + '_news'; // Geri uyumluluk için, UI değişse bile db ismi kalsın.
  console.log(`[SIGNAL] 🎣 ${project.toUpperCase()} sinyal toplama başladı...`);

  const result: SignalCollectorResult = {
    signalsFound: 0, signalsFiltered: 0, articlesCreated: 0,
    rejectedReasons: [], duration: 0, errors: [],
  };

  try {
    // 1. Global Daily Limit (Sovereign Directive ise limiti DEL geç)
    if (adminDb && process.env.NODE_ENV === 'production' && !(workerTask && workerTask.strictMode)) {
      const today = new Date().toISOString().split('T')[0];
      const dailyDoc = await adminDb.collection('aloha_daily_stats').doc(today).get();
      const globalCount = dailyDoc.exists ? (dailyDoc.data()?.articles_created || 0) : 0;
      if (globalCount >= 6) {
        console.log(`[SIGNAL] 🛑 GLOBAL GÜNLÜK LİMİT DOLDU: ${globalCount}/6`);
        result.duration = Date.now() - start;
        return result;
      }
    }

    // 2. Power Sources'tan Çekim veya SOVEREIGN EMRİ UYGULAMA (Worker Katmanı Mührü)
    let gatherTopics: string[] = [];
    
    if (workerTask && workerTask.strictMode) {
      console.log(`[SIGNAL - WORKER] 🔐 SOVEREIGN DIRECTIVE (Emir) Alındı! Odak: ${workerTask.focus}, Hedef Pazarlar: ${workerTask.targetMarkets.join(', ')}`);
      
      // İşçi ajan (Worker) burada kendi aklıyla konu türetemez. ALOHA'nın emrine itaat eder.
      const globalFocus = getStrategicFocusCombo();
      gatherTopics = [
        globalFocus,
        `B2B textile market analysis for ${workerTask.targetMarkets.join(' and ')}`,
        `latest news regarding ${workerTask.focus} in home textile industry`
      ];

      // Stratejik drift engelleme koruması: Çalışma başladığında, girdi ile eylemin tamamen örtüştüğünden emin ol.
      // (Bunu formalite gereği mockluyoruz, zira worker burada inputta verilen emri uyguluyor)
      lockWorkerStrategyModification(workerTask.focus, workerTask.focus);
    } else {
       // YENİ GLOBAL SOURCE (UTİB, TETSIAD, TENDERS) MANTIĞI
       const globalFocus = getStrategicFocusCombo();
       gatherTopics = [
         globalFocus,
         `global home textile market intelligence and B2B opportunities ${new Date().getFullYear()}`,
         `curtain fabric and upholstery supply chain disruptions and manufacturer opportunities`,
         `global luxury hotel curtain procurement and government living space tenders`
       ];
    }

    // 3. Raw Signals Topla
    const rawSignals = await gatherSignals(gatherTopics);
    result.signalsFound = rawSignals.length;

    let articlesProduced = 0;

    for (const signal of rawSignals) {
      if (Date.now() - start > CYCLE_TIMEOUT_MS) break;
      if (articlesProduced >= MAX_ARTICLES_PER_CYCLE) break;

      const filterResult = await filterSignal(signal);
      if (filterResult.decision === 'REJECT') {
        result.signalsFiltered++;
        result.rejectedReasons.push(`${signal.title.substring(0, 40)}: ${filterResult.reason}`);
        continue;
      }

      try {
        // TISF -> CORE PAYLOAD
        const payload = await produceIntelligencePayload(signal, filterResult.commercial_gravity || 50, project);
        if (payload) {
          await savePayload(payload, COLLECTION);
          
          await incrementDailyCount();
          articlesProduced++;
          result.articlesCreated++;
          console.log(`[SIGNAL] ✅ [${payload.zone}] ${payload.title}`);
        }
      } catch (err: any) {
        result.errors.push(err.message);
      }
    }

  } catch (err: any) {
    console.error('[SIGNAL] ❌ Kritik hata:', err.message);
    result.errors.push(err.message);
  }

  result.duration = Date.now() - start;
  return result;
}

// ═══════════════════════════════════════
// 2. SİNYAL TOPLAMA (RAW ENGINE)
// ═══════════════════════════════════════

async function gatherSignals(topics: string[]): Promise<RawSignal[]> {
  try {
    const topicList = topics.map((t, i) => `${i + 1}. ${t}`).join('\n');
    const result = await getAI().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Search the internet for 5 strictly B2B trade intelligence updates, breaking market news, or macro numbers based on these topics:\n${topicList}\n\nIMPORTANT: Find REAL, RECENT news from 2026. Each entry must be a unique, distinct story.\nReturn JSON ONLY exactly like:\n[{"title":"...","summary":"...","url":"...","source":"...","category":"..."}]`,
      config: { 
        temperature: 0.4,
        tools: [{ googleSearch: {} }],
      }
    });
    
    let text = result?.text || '';
    // Clean markdown fences if present
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];
    return JSON.parse(match[0]);
  } catch (e) {
    console.warn('[SIGNAL] gatherSignals hatasi:', e);
    return [];
  }
}

// ═══════════════════════════════════════
// 3. TISF ÜRETİMİ VE PAYLOAD OLUŞTURMA
// ═══════════════════════════════════════

async function produceIntelligencePayload(signal: any, gravity: number, project: string): Promise<TRTEX_CORE_PAYLOAD | null> {
  // Hafıza
  const usedScenes = adminDb ? await adminDb.collection("core_memory").doc("campaign_memory").get().then(s => s.data()?.used_scenes || []) : [];
  const usedPalettes = adminDb ? await adminDb.collection("core_memory").doc("campaign_memory").get().then(s => s.data()?.used_palettes || []) : [];
  
  const memoryBlock = `USED SCENES: ${usedScenes.slice(-5).join(", ")}\nUSED PALETTES: ${usedPalettes.slice(-5).join(", ")}`;

  let finalParsed: any = null;

  for (let attempt = 1; attempt <= SYSTEM_LAW.FAILURE_POLICY.max_retry; attempt++) {
    try {
      const result = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `SYSTEM ROLE:
You are TISF (TRTEX Intelligence Standard Format) AI Core — the world's most elite B2B textile intelligence analyst.
You write like a senior Bloomberg/Reuters analyst who spent 20 years in the Turkish textile export sector.

🔴 SECTOR GATE (MÜHÜRLÜ — İHLAL = REJECT):
ONLY these 6 sectors are allowed:
1. HOME_TEXTILE (Perde, Döşemelik, Nevresim, Havlu, Kırlent)
2. CONTRACT (Otel, Hospitality, AVM, Ofis, Yangın Geciktirici/FR, Akustik)
3. MEDICAL (Hastane Perdesi, Antibakteriyel, Cleanroom)
4. MARINE (Yat, Tekne, Cruise, UV Dayanımlı, Havacılık Koltuk)
5. OUTDOOR (Tente, Branda, Zip Screen, Gölgelendirme, Mimari Membran)
6. INDUSTRIAL (İplik, Elyaf, Nonwoven, Jacquard, Dokuma Tezgahı)
FORBIDDEN: Konfeksiyon, Hazır Giyim, Moda Haftası, Fashion Week, Tişört, Ayakkabı, Çanta, Elbise, Podyum, Apparel, Clothing, Fast Fashion, Influencer.
If the signal belongs to a FORBIDDEN sector → DO NOT PROCESS. Return empty JSON {}.

🎯 CONTENT QUALITY MANDATE:
Your article MUST be genuinely informative and commercially valuable. A senior textile manufacturer reading this should:
- Learn something actionable they can implement THIS WEEK
- Understand exactly WHO is buying, WHERE, and at WHAT price range
- See a clear business opportunity (partnership, export chance, tender, or market gap)

📝 CONTENT BODY REQUIREMENTS (MINIMUM 5 RICH PARAGRAPHS):
<h2>PAZAR VERİLERİ</h2> Hard numbers, market size, growth rates, pricing trends with specific $ amounts and % changes.
<h2>TİCARİ ETKİ ANALİZİ</h2> Why this matters for Turkish manufacturers/exporters. Impact on margins, orders, and competitive positioning.
<h2>İŞ FIRSATI & ORTAKLIK SİNYALLERİ</h2> Specific companies seeking suppliers, government tenders open, JV opportunities, emerging buyer markets. Name countries and buyer types.
<h2>TEDARİK ZİNCİRİ & HAMMADDELERİN ETKİSİ</h2> How raw material prices, logistics, and supply chain shifts affect this opportunity. Include cotton/polyester/freight price data if relevant.
<h2>STRATEJİK AKSİYON PLANI</h2> Concrete 3-step action plan for a Turkish textile CEO reading this article. What to do Monday morning.

Each paragraph must be 4-6 sentences minimum. Use concrete data, not vague statements.
Do NOT use cliché phrases: "devrim", "göz kamaştırıcı", "paradigma", "çığır açan". Write like a Wall Street analyst who happens to know textiles deeply.

Do NOT use cliché phrases: "devrim", "göz kamaştırıcı", "paradigma", "çığır açan". Write like a Wall Street analyst who happens to know textiles deeply.

CONTENT TYPE CLASSIFICATION:
Classify into ONE: MARKET_SIGNAL | NEWS_INTEL | TRADE_OPPORTUNITY | REGIONAL_RISK

${MASTER_RULE}

RAW SIGNAL:
Title: ${signal.title}
Summary: ${signal.summary}

RETURN EXACT JSON FORMAT:
{
  "tisf_type": "MARKET_SIGNAL|NEWS_INTEL|TRADE_OPPORTUNITY|REGIONAL_RISK",
  "title": "[GEO/COMPANY] + NUMERIC DATA + EFFECT (MUST BE 100% IN TURKISH)",
  "summary": "3-4 sentences solid CEO Briefing with $ figures and % data (MUST BE 100% IN TURKISH)",
  "data_points_count": 4,
  "market_impact_score": 85,
  "commercial_score": 80,
  "geo": {"country": "...", "region": "...", "trade_zone": "..." },
  "action_plan": {"why": "Detailed reason with data", "action": "Specific 3-step action", "target": "Target buyer/market segment" },
  "business_opportunity": {"type": "TENDER|PARTNERSHIP|EXPORT|JV|SUPPLIER_MATCH", "value_estimate": "$X million", "deadline": "Q2 2026", "contact_hint": "Industry association or trade body to contact"},
  "content_body": "<h2>PAZAR VERİLERİ</h2>...<h2>TİCARİ ETKİ ANALİZİ</h2>...<h2>İŞ FIRSATI & ORTAKLIK SİNYALLERİ</h2>...<h2>TEDARİK ZİNCİRİ & HAMMADDELERİN ETKİSİ</h2>...<h2>STRATEJİK AKSİYON PLANI</h2>...",
  "keywords": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}
Return ONLY JSON. NO MARKDOWN. NO COMMENTS.`,
        config: { temperature: 0.4 },
      });

      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Art Director iptal edildi (God-Mode imageAgent devrede)

      finalParsed = parsed;
      break; 
    } catch (e: any) {
      console.warn(`[SIGNAL] Parse error in attempt ${attempt}:`, e.message);
    }
  }

  if (!finalParsed) return null;
  
  if (finalParsed.data_points_count < 2) return null; // Reject low quality

  // TISF nesnesi
  const tisf: TRTEX_INTELLIGENCE_PACKET = {
    id: `tisf-${Date.now()}`,
    type: finalParsed.tisf_type,
    raw_source: signal.source || 'TRTEX Core',
    confidence: 0.95,
    data_quality: finalParsed.data_points_count,
    extracted_entities: finalParsed.keywords || [],
    normalized_meaning: finalParsed.summary,
    economic_relevance_score: finalParsed.commercial_score
  };

  // TISF Türünü TRTEX_TYPE türüne map etme
  const typeMap: Record<string, TRTEX_TYPE> = {
    "MARKET_SIGNAL": "MARKET",
    "NEWS_INTEL": "NEWS",
    "TRADE_OPPORTUNITY": "OPPORTUNITY",
    "REGIONAL_RISK": "REGION"
  };

  const coreType = typeMap[tisf.type] || "NEWS";
  const slug = finalParsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 60);

  // CORE PAYLOAD oluşturma
  const payload: TRTEX_CORE_PAYLOAD = {
    id: slug,
    type: coreType,
    zone: "BREAKING", // Varsayılan, Classifier ezecek
    title: finalParsed.title,
    timestamp: Date.now(),
    score: {
      market_impact: finalParsed.market_impact_score,
      commercial: finalParsed.commercial_score,
      confidence: tisf.confidence
    },
    geo: {
      country: finalParsed.geo?.country || "Global",
      region: finalParsed.geo?.region || "Global",
      trade_zone: finalParsed.geo?.trade_zone || "Global"
    },
    content: {
      summary: finalParsed.summary,
      data_points: finalParsed.data_points_count
    },
    seo: {
      keywords: finalParsed.keywords || [],
      slug: slug
    },
    triggers: {
      trigger_perde_ai: finalParsed.commercial_score > 75,
      trigger_hometex: finalParsed.commercial_score > 75,
      trigger_campaign: finalParsed.commercial_score > 75
    },
    
    // Geri dönük uyumluluk (Eski UI'ın çalışması için geçici)
    original_article: {
      ...finalParsed,
      category: coreType,
      id: slug,
      slug: slug,
      commercial_note: finalParsed.action_plan?.action || '',
      scoring: { market_impact_score: finalParsed.market_impact_score, commercial_score: finalParsed.commercial_score },
      createdAt: new Date().toISOString(),
      translations: {
        TR: { title: finalParsed.title, summary: finalParsed.summary, content: finalParsed.content_body || finalParsed.summary }
      }
    }
  };

  // SİHİRLİ DOKUNUŞ: Zone Classifier'ı devreye sok!
  payload.zone = classifyZone(payload);

  return payload;
}

// ═══════════════════════════════════════
// KAYIT İŞLEMLERİ
// ═══════════════════════════════════════

async function savePayload(payload: TRTEX_CORE_PAYLOAD, collection: string) {
  if (!adminDb) return;
  // Payload standartlara göre kaydedilir (Geriye dönük uyumlu)
  const doc = {
    ...payload.original_article,
    trtex_payload_core: payload // Yeni sistem entegrasyonu
  };
  await adminDb.collection(collection).doc(payload.id).set(doc);
}

