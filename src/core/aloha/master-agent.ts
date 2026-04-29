import { z } from 'zod';
import { aiGenkit, alohaAI } from '@/core/aloha/aiClient';
import { getProfileForProject } from "./profiles/index";
import { processImageForContent } from '../aloha/imageAgent';
import { executeTranslationAgent } from '../aloha/translationAgent';
import { slugify } from '@/core/utils/slugify';

// API Key Control
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("⚠️ API Key eksik. Master Agent otonomisi kapalı.");
}

export interface MasterSystemState {
  last_news_time: number;
  topics_used: string[];
  last_market_update: number;
  todays_news_count: number;
  added_topic?: string;
  action_taken?: string;
}

// ═══════════════════════════════════════════════════════════════
// 1. ZOD SCHEMA (Genkit Native Type-Safety)
// ═══════════════════════════════════════════════════════════════
export const MasterAgentResponseSchema = z.object({
  type: z.enum(["news", "site-brain"]),
  action: z.enum(["create", "update"]),
  payload: z.object({
    category: z.enum(["PERDE", "EV TEKSTİLİ", "DÖŞEMELİK", "DEKORASYON"]),
    ceo_priority_level: z.string().describe("e.g., Kritik - %8 Maliyet Artışı"),
    tags: z.array(z.string()),
    image_url: z.string().describe("Must be a valid URL string"),
    translations: z.object({
      TR: z.object({ title: z.string(), summary: z.string(), content: z.string() }),
      EN: z.object({ title: z.string(), summary: z.string(), content: z.string() })
    }),
    intelligence_layer: z.object({
      executive_brief: z.array(z.string()),
      risk_matrix: z.object({ level: z.number(), reason: z.string(), target: z.string() }),
      opportunity_map: z.object({ level: z.number(), action: z.string(), impact: z.string() }),
      action_queue: z.array(z.string()),
      trade_brief: z.string(),
      decision_signal: z.string().describe("BUY, HOLD, or WATCH")
    }),
    routing_actions: z.object({
      push_to_radar: z.boolean(),
      push_to_academy: z.boolean(),
      push_to_opportunities: z.boolean(),
      push_to_quarantine: z.boolean(),
      push_to_sector: z.array(z.string())
    }),
    slug: z.string().optional(),
    media: z.any().optional(),
    content_word_count: z.number().optional(),
    reading_time: z.number().optional()
  }),
  meta: z.object({
    timestamp: z.string(),
    confidence: z.number(),
    source: z.string()
  }),
  newStateUpdate: z.object({
    added_topic: z.string().optional(),
    action_taken: z.string().optional()
  })
});

export type MasterAgentResponse = z.infer<typeof MasterAgentResponseSchema>;

const getMasterPrompt = async (projectName: string) => `
You are the central intelligence system of aipyram (Genkit Supervisor).
Your role is to autonomously manage, produce, validate, and distribute content and data for connected platforms.
You do NOT wait for instructions. You operate continuously based on signals, schedules, and system state.

TARGET ECOSYSTEM PROFILE:
${await getProfileForProject(projectName)}

🎯 PRIMARY OBJECTIVES
- Maintain continuous content flow (news, insights, signals)
- Ensure data freshness (no stale content beyond thresholds)
- Coordinate all sub-agents (news, translation, image, analysis)
- Deliver structured outputs to external systems via webhook
- Never produce duplicate, low-quality, or irrelevant content

📰 NEWS GENERATION RULES
- 📅 GÜNCEL VERİ KURALI (CRITICAL): Üretilen haber ve bilgiler SADECE günümüz tarihini (bugün/bu hafta) yansıtmalıdır.
- You MUST ASSIGN EXACTLY ONE of the following 4 Main Pillars for the 'category' field: 
  "PERDE", "EV TEKSTİLİ", "DÖŞEMELİK", "DEKORASYON"
- For the 'tags' array, you MUST select 1-3 tags from these 5 Dynamic CEO Tags ONLY:
  "FİYAT BASKISI", "İHRACAT FIRSATI", "YENİ TEKNOLOJİ", "FUAR ANALİZİ", "STRATEJİK RİSK".
- 🔒 SOVEREIGN SCHEMA CONTRACT: You are NOT a simple text generator. Every single news output MUST include the exact structured 'intelligence_layer' and 'routing_actions'. 

🚫 HARD RULES
- NEVER produce empty outputs or flat text without deep intelligence structure.
- IF intelligence_layer is empty -> YOUR DATA WILL BE REJECTED AND QUARANTINED.
- You are not a chatbot. You are a Genkit Supervisor delivering strictly validated JSON via Zod schema.
`;

// ═══════════════════════════════════════════════════════════════
// 2. GENKIT SUPERVISOR FLOW (Native 2026 Orchestrator)
// ═══════════════════════════════════════════════════════════════
export const masterSupervisorFlow = aiGenkit.defineFlow({
  name: 'masterSupervisorFlow',
  inputSchema: z.object({
    projectName: z.string(),
    state: z.any(), // MasterSystemState
    externalSignal: z.string().optional()
  }),
  outputSchema: MasterAgentResponseSchema,
}, async (input) => {
  const { projectName, state, externalSignal } = input;
  
  const currentTime = Date.now();
  const hoursSinceNews = (currentTime - state.last_news_time) / (1000 * 60 * 60);
  const hoursSinceMarket = (currentTime - state.last_market_update) / (1000 * 60 * 60);

  const triggerContext = `
  CURRENT SYSTEM TIME: ${new Date().toISOString()}
  SYSTEM STATE:
  - Hours since last news: ${hoursSinceNews.toFixed(2)}
  - Today's generated news count: ${state.todays_news_count}
  - Hours since last market update: ${hoursSinceMarket.toFixed(2)}
  - Previously used topics (DO NOT REPEAT): ${JSON.stringify(state.topics_used)}
  
  EXTERNAL SIGNAL (if any): ${externalSignal || "None. Run autonomous logic."}
  `;

  console.log(`[🤖 Genkit Supervisor] Sürü Yöneticisi Uyanıyor... (Proje: ${projectName})`);

  try {
    const masterSystemInstruction = `${await getMasterPrompt(projectName)}\nBağlam: ${JSON.stringify(triggerContext)}\n\n⚠️ DISIPLİN PROTOKOLÜ: 1. Önce Sorgula: Asla hafızandaki isimlere (Başkan, Tarih vb.) güvenme. Her zaman GÜNCEL VERİLERİ KULLAN (Google Search Grounding AKTİF). 2. Hakan Filtresi: Hayali ve abartı ifadeleri SİL. Saf, kanıtlı ve sektörel B2B dili kullan.`;
    
    // Genkit AI çağrısı - Zod ile %100 tip güvenli çıktı
    const resultJson = await alohaAI.generateJSON<MasterAgentResponse>(
      masterSystemInstruction,
      { complexity: 'complex', temperature: 0.7 },
      'master_supervisor_agent'
    );

    if (!resultJson || !resultJson.payload) {
      throw new Error("Genkit Supervisor: Boş yanıt alındı.");
    }

    let finalResult: MasterAgentResponse = resultJson;

    // ═══════════════════════════════════════════════════════════════
    // 3. ALT SÜRÜLERİN YÖNETİMİ (Sub-Agent Orchestration)
    // ═══════════════════════════════════════════════════════════════
    console.log(`[🤖 Genkit Supervisor] Çekirdek içerik onaylandı. Alt ajanlar (Görsel & Çeviri) tetikleniyor...`);

    const trTitle = finalResult.payload?.translations?.TR?.title || "B2B Haber";
    const cat = finalResult.payload?.category || "";
    
    // Image Agent Tetiklemesi
    finalResult.payload.image_url = await processImageForContent(finalResult.type, cat, trTitle, finalResult.payload.image_url);

    try {
      const { processMultipleImages, getImageCount } = require('./imageAgent');
      const content = finalResult.payload?.translations?.TR?.content || '';
      const imageCount = getImageCount(content);
      
      if (imageCount > 1 && finalResult.type === 'news') {
        const additionalImages = await processMultipleImages(cat, trTitle, content, imageCount);
        finalResult.payload.media = {
          images: additionalImages.map((url: string, i: number) => ({
            url,
            caption: i === 0 ? trTitle : `${trTitle} - Detay ${i}`,
            alt_text: `${trTitle} - ${cat} görseli ${i + 1}`,
            order: i,
          })),
          videos: [], documents: [], audio: [],
        };
        if (additionalImages[0]?.startsWith('https://storage.googleapis.com/')) {
          finalResult.payload.image_url = additionalImages[0];
        }
      }

      const wordCount = content.split(/\s+/).filter((w: string) => w.length > 0).length;
      finalResult.payload.content_word_count = wordCount;
      finalResult.payload.reading_time = Math.ceil(wordCount / 200);
    } catch (multiErr: any) {
      console.warn(`[🤖 Genkit Supervisor] Çoklu resim ajan hatası: ${multiErr.message}`);
    }

    // Translation Agent Tetiklemesi
    if (finalResult.type === 'news' && finalResult.payload?.translations?.TR?.content) {
       const expandedTranslations = await executeTranslationAgent(finalResult.payload.translations.TR, 'TR');
       if (finalResult.payload.translations.EN) {
         expandedTranslations.EN = finalResult.payload.translations.EN;
       }
       finalResult.payload.translations = expandedTranslations;
    }

    console.log(`[🤖 Genkit Supervisor] ✅ Sürü orkestrasyonu başarıyla tamamlandı.`);
    return finalResult;

  } catch (error: any) {
    console.error(`[🤖 Genkit Supervisor] ❌ Hata: ${error.message}`);
    throw error;
  }
});

// ═══════════════════════════════════════════════════════════════
// 4. GERİYE DÖNÜK UYUMLULUK (Wrapper)
// ═══════════════════════════════════════════════════════════════
/**
 * Dış sistemler (Cron vb.) hala bu fonksiyonu çağırır, 
 * ancak içeride Native Genkit Supervisor Flow çalışır.
 */
export async function executeMasterAgent(projectName: string, state: MasterSystemState, externalSignal?: string): Promise<MasterAgentResponse> {
  const MAX_RETRIES = 3;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Doğrudan Genkit Flow'u tetikle
      const result = await masterSupervisorFlow({ projectName, state, externalSignal });
      return result;
    } catch (error: any) {
      console.warn(`[🧠 MASTER WRAPPER] ❌ Deneme ${attempt} başarısız: ${error.message?.substring(0, 100)}`);
      if (attempt < MAX_RETRIES) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await new Promise(r => setTimeout(r, backoffMs));
      }
    }
  }

  // FALLBACK
  console.error(`[🧠 MASTER WRAPPER] 🔴 3 deneme başarısız. FALLBACK haber üretiliyor.`);
  return await generateFallbackNews(state);
}

// ═══════════════════════════════════════════════════════════════
// 5. FALLBACK HABER ÜRETİCİ
// ═══════════════════════════════════════════════════════════════
async function generateFallbackNews(state: MasterSystemState): Promise<MasterAgentResponse> {
  const FALLBACK_TOPICS = [
    {
      category: "EV TEKSTİLİ" as const,
      titleTR: "Avrupa Yeşil Mutabakat Tekstil Etkisi: 2026 Uyum Rehberi",
      titleEN: "EU Green Deal Textile Impact: 2026 Compliance Guide",
      summaryTR: "Avrupa Birliği'nin sürdürülebilir tekstil stratejisi, Türk ihracatçılarını doğrudan etkiliyor.",
      summaryEN: "The EU's sustainable textile strategy directly impacts Turkish exporters.",
      contentTR: "## Avrupa Yeşil Mutabakat ve Tekstil Sektörü\nAvrupa Birliği'nin 2026 itibarıyla yürürlüğe giren genişletilmiş üretici sorumluluğu (EPR) düzenlemeleri kritik.",
      contentEN: "## EU Green Deal and the Textile Sector\nThe EU's EPR regulations, effective from 2026, represent a critical turning point.",
      tags: ["İHRACAT FIRSATI", "STRATEJİK RİSK"],
      ceo_priority_level: "Kritik - %15 Fiyat Avantajı Fırsatı",
      image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&q=80"
    }
  ];

  const chosen = FALLBACK_TOPICS[Date.now() % FALLBACK_TOPICS.length];
  const slug = slugify(chosen.titleTR, 60);

  const baseExpandedTranslations = await executeTranslationAgent({ 
    title: chosen.titleTR, summary: chosen.summaryTR, content: chosen.contentTR 
  }, 'TR');
  
  baseExpandedTranslations.EN = { title: chosen.titleEN, summary: chosen.summaryEN, content: chosen.contentEN };

  return {
    type: "news",
    action: "create",
    payload: {
      category: chosen.category,
      ceo_priority_level: chosen.ceo_priority_level,
      tags: chosen.tags,
      image_url: chosen.image,
      slug: slug,
    },
    newStateUpdate: {
      added_topic: chosen.titleTR,
      action_taken: "fallback_news_generated"
    }
  };
}
