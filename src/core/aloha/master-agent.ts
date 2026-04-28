import { Schema, Type } from "@google/genai";
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { getProfileForProject } from "./profiles/index";
import { processImageForContent } from '../aloha/imageAgent';
import { executeTranslationAgent } from '../aloha/translationAgent';
import { slugify } from '@/core/utils/slugify';

// API Key Control
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("⚠️ API Key eksik. Master Agent otonomisi kapalı.");
}

/**
 * Mimarinin Kalbi: Tek Dosya Yönetimi
 * Tüm Ajanları (News, Translate, Image, Market) tek bir beyne (Master) hapsettik.
 */

export interface MasterSystemState {
  last_news_time: number;       // Unix timestamp (Ne zaman haber üretildi)
  topics_used: string[];        // Kapsanan konular (Tekrarı önlemek için)
  last_market_update: number;   // Unix timestamp
  todays_news_count: number;    // Günlük kota takibi
  added_topic?: string;         // Son eklenen konu
  action_taken?: string;        // Son alınan aksiyon
}

export interface MasterAgentResponse {
  type: "news" | "site-brain";
  action: "create" | "update";
  payload: any;
  meta: {
    timestamp: string;
    confidence: number;
    source: string;
  };
  newStateUpdate: Partial<MasterSystemState>; // Ajan'ın durumu nasıl güncellediği
}

const getMasterPrompt = async (projectName: string) => `
You are the central intelligence system of AIPYRAM.
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

🧩 SYSTEM MODULES (AGENTS)
You physically control these functions via your generation:
1. News-Guard Agent → finds and generates realistic news
2. Otonom Çeviri (Translation) için SADECE TR ve EN üret. Diğer diller TranslationAgent tarafından halledilecektir! 
TR is PRIMARY. EN is SECONDARY.
3. Image Agent → generates a relevant image_url string (or a realistic placeholder). NEVER return empty.
4. QA Agent → validates output quality internally before yielding JSON.

⏱ AUTONOMOUS TRIGGERS
Continuously evaluate the provided JSON STATE:
- If no news in last 6 hours → trigger News-Guard
- If less than 5 news today → generate more
- If market data older than 12 hours → update site-brain

📰 NEWS GENERATION RULES
- Must be REALISTIC and INDUSTRY-RELEVANT according to your ECOSYSTEM PROFILE.
- 📅 GÜNCEL VERİ KURALI (CRITICAL): Üretilen haber ve bilgiler SADECE günümüz tarihini (bugün/bu hafta) yansıtmalıdır. ASLA bir önceki yıldan veya bir önceki aydan gelen eski verileri haber yapma. Sadece günlük, taze ve canlı veriler kullanılacaktır!
- Include: Strong headline, Summary, Structured content (paragraphs), Category, Tags, and CEO Priority Level.
- You MUST ASSIGN EXACTLY ONE of the following 4 Main Pillars for the 'category' field: 
  "PERDE", "EV TEKSTİLİ", "DÖŞEMELİK", "DEKORASYON"
- For the 'tags' array, you MUST select 1-3 tags from these 5 Dynamic CEO Tags ONLY:
  "FİYAT BASKISI", "İHRACAT FIRSATI", "YENİ TEKNOLOJİ", "FUAR ANALİZİ", "STRATEJİK RİSK" (Only include if the content explicitly justifies it with numbers/opportunities).
- You MUST generate a 'ceo_priority_level' string summarizing the business impact (e.g., "Kritik - %8 Maliyet Artışı", "Fırsat - Almanya Pazarında Boşluk").
- Compare with "topics_used" in STATE and NEVER repeat same topic within short time window.
- 🔒 SOVEREIGN SCHEMA CONTRACT: You are NOT a simple text generator. Every single news output MUST include the exact structured 'intelligence_layer' and 'routing_actions'. 
  - intelligence_layer.executive_brief (3 bullet points for CEO)
  - intelligence_layer.risk_matrix (object with numeric level, reason, and target)
  - intelligence_layer.opportunity_map (object with numeric level, action, and impact)
  - intelligence_layer.action_queue (array of 2-3 immediate actionable steps)
  - intelligence_layer.trade_brief (a short B2B market interpretation)
  - intelligence_layer.decision_signal (MUST be one of: BUY, HOLD, WATCH)
  - routing_actions (Boolean flags based on the news score. If risk>90 but no action, push_to_quarantine=true)

🌍 TRANSLATION RULES
- Languages to output here: TR and EN.
- Avoid literal translation. Adapt to commercial context.

🚫 HARD RULES
- NEVER produce empty outputs or flat text without deep intelligence structure.
- IF intelligence_layer is empty -> YOUR DATA WILL BE REJECTED AND QUARANTINED.
- NEVER hallucinate irrelevant industries.
- You are not a chatbot. You are a SYSTEM delivering JSON.
`;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ["news", "site-brain"] },
    action: { type: Type.STRING, enum: ["create", "update"] },
    payload: {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING, enum: ["PERDE", "EV TEKSTİLİ", "DÖŞEMELİK", "DEKORASYON"] },
        ceo_priority_level: { type: Type.STRING, description: "e.g., Kritik - %8 Maliyet Artışı" },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        image_url: { type: Type.STRING, description: "Must be a valid URL string" },
        translations: {
          type: Type.OBJECT,
          properties: {
            TR: {
              type: Type.OBJECT,
              properties: { title: { type: Type.STRING }, summary: { type: Type.STRING }, content: { type: Type.STRING } }
            },
            EN: {
              type: Type.OBJECT,
              properties: { title: { type: Type.STRING }, summary: { type: Type.STRING }, content: { type: Type.STRING } }
            }
          },
          required: ["TR", "EN"]
        },
        intelligence_layer: {
          type: Type.OBJECT,
          properties: {
            executive_brief: { type: Type.ARRAY, items: { type: Type.STRING } },
            risk_matrix: { type: Type.OBJECT, properties: { level: { type: Type.NUMBER }, reason: { type: Type.STRING }, target: { type: Type.STRING } }, required: ["level"] },
            opportunity_map: { type: Type.OBJECT, properties: { level: { type: Type.NUMBER }, action: { type: Type.STRING }, impact: { type: Type.STRING } }, required: ["level"] },
            action_queue: { type: Type.ARRAY, items: { type: Type.STRING } },
            trade_brief: { type: Type.STRING },
            decision_signal: { type: Type.STRING, description: "BUY, HOLD, or WATCH" }
          },
          required: ["executive_brief", "risk_matrix", "opportunity_map", "action_queue", "trade_brief", "decision_signal"]
        },
        routing_actions: {
          type: Type.OBJECT,
          properties: {
            push_to_radar: { type: Type.BOOLEAN },
            push_to_academy: { type: Type.BOOLEAN },
            push_to_opportunities: { type: Type.BOOLEAN },
            push_to_quarantine: { type: Type.BOOLEAN },
            push_to_sector: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["push_to_radar", "push_to_academy", "push_to_opportunities", "push_to_quarantine", "push_to_sector"]
        }
      },
      required: ["category", "ceo_priority_level", "tags", "image_url", "translations", "intelligence_layer", "routing_actions"]
    },
    meta: {
      type: Type.OBJECT,
      properties: {
        timestamp: { type: Type.STRING },
        confidence: { type: Type.NUMBER },
        source: { type: Type.STRING }
      }
    },
    newStateUpdate: {
      type: Type.OBJECT,
      properties: {
        added_topic: { type: Type.STRING },
        action_taken: { type: Type.STRING }
      }
    }
  },
  required: ["type", "action", "payload", "meta", "newStateUpdate"]
};

/**
 * AIPYRAM MASTER EXECUTION (v2.0 — Retry + Fallback)
 */
export async function executeMasterAgent(projectName: string, state: MasterSystemState, externalSignal?: string): Promise<MasterAgentResponse> {
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
  
  DECIDE YOUR ACTION. If news is needed, run News-Guard + Translate + Image sub-routines and output the JSON.
  If Market data is needed, output site-brain JSON.
  `;

  // RETRY: 3 deneme, exponential backoff
  const MAX_RETRIES = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[🧠 MASTER] Deneme ${attempt}/${MAX_RETRIES}...`);
      
      const masterSystemInstruction = `${await getMasterPrompt(projectName)}\nBağlam: ${JSON.stringify(triggerContext)}\n\n⚠️ DISIPLİN PROTOKOLÜ: 1. Önce Sorgula: Asla hafızandaki isimlere (Başkan, Tarih vb.) güvenme. Her zaman GÜNCEL VERİLERİ KULLAN (Google Search Grounding AKTİF). 2. Hakan Filtresi: Hayali ve abartı ifadeleri SİL. Saf, kanıtlı ve sektörel B2B dili kullan. 3. Kaynak Mührü: Her hamleni doğrula.`;
      
      const { text: responseText } = await alohaAI.generate(
        triggerContext,
        {
          complexity: 'complex',
          systemInstruction: masterSystemInstruction,
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.7,
        },
        'master_agent'
      );

      if (responseText) {
        const result: MasterAgentResponse = JSON.parse(responseText);
        
        // GÖRSEL GÜVENLİK DUVARI (AI Hallucination Engelleme)
        const trTitle = result.payload?.translations?.TR?.title || "B2B Haber";
        const cat = result.payload?.category || "";
        result.payload.image_url = await processImageForContent(result.type, cat, trTitle, result.payload.image_url);

        // ÇOKLU RESİM: Haber uzunluğuna göre ek görseller üret (max 3)
        try {
          const { processMultipleImages, getImageCount } = require('./imageAgent');
          const content = result.payload?.translations?.TR?.content || result.payload?.content || '';
          const imageCount = getImageCount(content);
          
          if (imageCount > 1 && result.type === 'news') {
            const additionalImages = await processMultipleImages(cat, trTitle, content, imageCount);
            // İlk resim zaten kapak görseli — geri kalanları media.images'a ekle
            result.payload.media = {
              images: additionalImages.map((url: string, i: number) => ({
                url,
                caption: i === 0 ? trTitle : `${trTitle} - Detay ${i}`,
                alt_text: `${trTitle} - ${cat} görseli ${i + 1}`,
                order: i,
              })),
              videos: [],
              documents: [],
              audio: [],
            };
            // Kapak görseli ilk multi-image olsun
            if (additionalImages[0]?.startsWith('https://storage.googleapis.com/')) {
              result.payload.image_url = additionalImages[0];
            }
          }

          // İçerik metrikleri
          const wordCount = content.split(/\s+/).filter((w: string) => w.length > 0).length;
          result.payload.content_word_count = wordCount;
          result.payload.reading_time = Math.ceil(wordCount / 200); // ~200 kelime/dk
        } catch (multiErr: any) {
          console.warn(`[🧠 MASTER] Çoklu resim hatası (yok sayıldı): ${multiErr.message}`);
        }

        // OTONOM ÇEVİRİ AĞI - 8 Dile (TR, EN, DE, FR, ES, AR, RU, ZH) yay
        if (result.type === 'news' && result.payload?.translations?.TR?.content) {
           const expandedTranslations = await executeTranslationAgent(result.payload.translations.TR, 'TR');
           
           // İngilizce orijinal kalitesini bozmamak için üzerine yaz:
           if (result.payload.translations.EN) {
             expandedTranslations.EN = result.payload.translations.EN;
           }
           
           result.payload.translations = expandedTranslations;
        }

        console.log(`[🧠 MASTER] ✅ Başarılı (deneme ${attempt})`);
        return result;
      }
      
      throw new Error("Empty response from AI");
    } catch (error: any) {
      lastError = error;
      console.warn(`[🧠 MASTER] ❌ Deneme ${attempt} başarısız: ${error.message?.substring(0, 100)}`);
      
      if (attempt < MAX_RETRIES) {
        const backoffMs = Math.pow(2, attempt) * 1000; // 2s, 4s
        console.log(`[🧠 MASTER] ⏳ ${backoffMs/1000}s bekleniyor...`);
        await new Promise(r => setTimeout(r, backoffMs));
      }
    }
  }

  // FALLBACK: Gemini tamamen çöktü — statik sektörel haber üret
  console.error(`[🧠 MASTER] 🔴 3 deneme başarısız. FALLBACK haber üretiliyor.`);
  return await generateFallbackNews(state);
}

/**
 * FALLBACK NEWS GENERATOR
 * Gemini API çöktüğünde bile Firebase'e gerçek sektörel içerik basar.
 * Zero-downtime garantisi.
 */
async function generateFallbackNews(state: MasterSystemState): Promise<MasterAgentResponse> {
  const FALLBACK_TOPICS = [
    {
      category: "EV TEKSTİLİ",
      titleTR: "Avrupa Yeşil Mutabakat Tekstil Etkisi: 2026 Uyum Rehberi",
      titleEN: "EU Green Deal Textile Impact: 2026 Compliance Guide",
      summaryTR: "Avrupa Birliği'nin sürdürülebilir tekstil stratejisi, Türk ihracatçılarını doğrudan etkiliyor. EPR düzenlemeleri ve dijital ürün pasaportu zorunlulukları hakkında kapsamlı analiz.",
      summaryEN: "The EU's sustainable textile strategy directly impacts Turkish exporters. Comprehensive analysis on EPR regulations and digital product passport requirements.",
      contentTR: "## Avrupa Yeşil Mutabakat ve Tekstil Sektörü\n\nAvrupa Birliği'nin 2026 itibarıyla yürürlüğe giren genişletilmiş üretici sorumluluğu (EPR) düzenlemeleri, Türk ev tekstili ihracatçıları için kritik bir dönüm noktası oluşturuyor.\n\n## Dijital Ürün Pasaportu Zorunluluğu\n\nYeni düzenlemeye göre, AB pazarına giren her tekstil ürününün dijital ürün pasaportuna sahip olması gerekecek. Bu pasaport, hammadde kaynağından geri dönüşüm sürecine kadar tüm tedarik zinciri bilgilerini içermeli.\n\n## Türk İhracatçılar İçin Aksiyon Planı\n\n1. **Sertifikasyon:** OEKO-TEX, GOTS ve EU Ecolabel sertifikalarının güncellenmesi\n2. **Tedarik Zinciri Şeffaflığı:** Tier 1-3 tedarikçilerin haritalanması\n3. **Dijital Altyapı:** QR kod bazlı ürün takip sistemlerinin kurulması\n\nSektör uzmanları, bu düzenlemelere uyum sağlayan firmaların %15-20 fiyat avantajı elde edebileceğini öngörüyor.",
      contentEN: "## EU Green Deal and the Textile Sector\n\nThe EU's extended producer responsibility (EPR) regulations, effective from 2026, represent a critical turning point for Turkish home textile exporters.\n\n## Digital Product Passport Requirement\n\nUnder the new regulation, every textile product entering the EU market must have a digital product passport containing full supply chain information from raw material sourcing to recycling.\n\n## Action Plan for Turkish Exporters\n\n1. **Certification:** Update OEKO-TEX, GOTS, and EU Ecolabel certifications\n2. **Supply Chain Transparency:** Map Tier 1-3 suppliers\n3. **Digital Infrastructure:** Implement QR code-based product tracking\n\nIndustry experts project that compliant companies can achieve 15-20% price premiums.",
      tags: ["İHRACAT FIRSATI", "STRATEJİK RİSK"],
      ceo_priority_level: "Kritik - %15 Fiyat Avantajı Fırsatı",
      image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1200&q=80"
    },
    {
      category: "PERDE",
      titleTR: "Türk Ev Tekstili İhracatı 2026: Avrupa ve Körfez Pazarları Büyüme Raporu",
      titleEN: "Turkish Home Textile Exports 2026: Europe & Gulf Markets Growth Report",
      summaryTR: "Türkiye'nin ev tekstili ihracatı 2026 ilk çeyreğinde %12 büyüme kaydetti. Almanya, İngiltere ve BAE en büyük alıcı pazarlar olarak öne çıkıyor.",
      summaryEN: "Turkey's home textile exports grew 12% in Q1 2026. Germany, UK, and UAE emerge as leading buyer markets.",
      contentTR: "## İhracat Verileri: 2026 İlk Çeyrek\n\nTürk İstatistik Kurumu verilerine göre, ev tekstili sektörü 2026'nın ilk çeyreğinde 1.8 milyar dolarlık ihracat gerçekleştirdi. Bu rakam, önceki yılın aynı dönemine kıyasla %12'lik bir artışa işaret ediyor.\n\n## Pazar Bazlı Analiz\n\n**Almanya:** Toplam ihracatın %18'ini oluşturan en büyük pazar. Otel tekstili segmentinde %25 artış.\n**İngiltere:** Brexit sonrası yeniden yapılanan ticaret anlaşmaları, Türk üreticilere avantaj sağlıyor.\n**BAE:** Lüks otel projeleri ve yeni konut inşaatları talep artışını destekliyor.\n\n## Stratejik Öneriler\n\n1. DACH pazarında sürdürülebilir ürün gamını genişletme\n2. Körfez ülkelerinde otel tedarikçi ağını kurma\n3. Dijital B2B kanallarını güçlendirme",
      contentEN: "## Export Data: Q1 2026\n\nAccording to TurkStat data, the home textile sector achieved $1.8 billion in exports in Q1 2026, marking a 12% increase year-over-year.\n\n## Market Analysis\n\n**Germany:** The largest market at 18% of total exports. Hotel textile segment saw 25% growth.\n**UK:** Post-Brexit trade restructuring provides advantages for Turkish manufacturers.\n**UAE:** Luxury hotel projects and new residential construction support demand growth.\n\n## Strategic Recommendations\n\n1. Expand sustainable product range in DACH markets\n2. Build hotel supplier networks in Gulf countries\n3. Strengthen digital B2B channels",
      tags: ["İHRACAT FIRSATI", "FİYAT BASKISI"],
      ceo_priority_level: "Yüksek - %25 Büyüme Fırsatı",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80"
    },
    {
      category: "DÖŞEMELİK",
      titleTR: "Akıllı Tekstil Devrimi: IoT Entegreli Ev Tekstili Ürünleri 2026 Trendleri",
      titleEN: "Smart Textile Revolution: IoT-Integrated Home Textile Products 2026 Trends",
      summaryTR: "Sıcaklık ayarlı yatak çarşaflarından hava kalitesi ölçen perdelerine, akıllı ev tekstili pazarı 2026'da 4.2 milyar dolara ulaşıyor.",
      summaryEN: "From temperature-regulating bed sheets to air quality-measuring curtains, the smart home textile market reaches $4.2B in 2026.",
      contentTR: "## Akıllı Tekstil Pazarı Büyüyor\n\nGlobal akıllı tekstil pazarı 2026 yılında 4.2 milyar dolar büyüklüğe ulaştı. Ev tekstili segmenti, bu pazarın %35'ini oluşturuyor.\n\n## Öne Çıkan Ürün Kategorileri\n\n**Termoregülatif Kumaşlar:** PCM (Phase Change Material) teknolojisi ile vücut sıcaklığına adapte olan yatak tekstili.\n**Antimikrobiyal Kaplamalar:** Gümüş iyon teknolojisi ile kalıcı hijyen koruması sağlayan havlu ve nevresim takımları.\n**Fotokatalitik Perdeler:** TiO2 nanopartikül kaplı, hava kalitesini iyileştiren perde kumaşları.\n\n## B2B Fırsatları\n\n1. Otel zincirleri için toptan akıllı yatak tekstili tedariki\n2. Hastane ve sağlık kuruluşları için antimikrobiyal ürün gamı\n3. Akıllı ev sistemleri ile entegre perde çözümleri",
      contentEN: "## Smart Textile Market Growth\n\nThe global smart textile market reached $4.2 billion in 2026, with the home textile segment accounting for 35% of this market.\n\n## Key Product Categories\n\n**Thermoregulative Fabrics:** Bedding that adapts to body temperature using PCM (Phase Change Material) technology.\n**Antimicrobial Coatings:** Towels and bedding sets with permanent hygiene protection using silver ion technology.\n**Photocatalytic Curtains:** Curtain fabrics coated with TiO2 nanoparticles that improve air quality.\n\n## B2B Opportunities\n\n1. Wholesale smart bedding supply for hotel chains\n2. Antimicrobial product lines for hospitals and healthcare facilities\n3. Curtain solutions integrated with smart home systems",
      tags: ["YENİ TEKNOLOJİ", "İHRACAT FIRSATI"],
      ceo_priority_level: "Fırsat - IoT Entegrasyonunda Yüksek Tüketici Talebi",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80"
    }
  ];

  // Kullanılmamış bir konu seç
  const usedTopics = new Set((state.topics_used || []).map(t => t.toLowerCase()));
  let chosen = FALLBACK_TOPICS.find(t => !usedTopics.has(t.titleTR.toLowerCase()));
  if (!chosen) chosen = FALLBACK_TOPICS[Date.now() % FALLBACK_TOPICS.length];

  const slug = slugify(chosen.titleTR, 60);

  const baseExpandedTranslations = await executeTranslationAgent({ 
    title: chosen.titleTR, 
    summary: chosen.summaryTR, 
    content: chosen.contentTR 
  }, 'TR');
  
  // Orijinal İngilizceyi koru
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
      translations: baseExpandedTranslations
    },
    meta: {
      timestamp: new Date().toISOString(),
      confidence: 0.75,
      source: "fallback-static-generator"
    },
    newStateUpdate: {
      added_topic: chosen.titleTR,
      action_taken: "fallback_news_generated"
    }
  };
}
