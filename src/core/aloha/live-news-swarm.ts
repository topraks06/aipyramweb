import { GoogleGenAI, Type, Schema } from "@google/genai";
import { saveToGoogleNativeMemory } from "./publishers/google-native-memory";
import { learningMatrix } from "../cache/learningMatrix";
import { alohaAI } from './aiClient';

// SINGLETON ZORLAMA: Kendi client'ı KULLANIMDAN KALDIRILDI — Maliye Bakanı v2
// Eski: const aiClient = new GoogleGenAI({ apiKey });
// Yeni: tüm çağrılar alohaAI.getClient() üzerinden yapılır (token takibi aktif)
const getAI = () => alohaAI.getClient();

/**
 * 🕵️‍♂️ SCOUT AGENT
 * Piyasadan/Verilen brief üzerinden iddialı ve gerçekçi haber taslağı üretir.
 */
async function runScoutAgent(brief: string): Promise<string> {
    console.log("🕵️‍♂️ [SCOUT AGENT] Verilen brief inceleniyor, haber taslağı oluşturuluyor...");
    
    const lessons = learningMatrix.getLessonsLearned("SCOUT_NEWS");
    const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const CURRENT_YEAR = new Date().getFullYear(); // 2026

    const response = await getAI().models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Aşağıdaki brief bilgisini baz alarak profesyonel, B2B ev tekstili piyasasına uygun, 100% gerçekçi bir haber taslağı oluştur.
        ${lessons}
        Brief: "${brief}"`,
        config: {
            systemInstruction: `🎯 ALOHA HUNTER MODE — 7 CONTINENT B2B RETAIL & WHOLESALE INTELLIGENCE

TODAY = ${TODAY}
CURRENT_YEAR = ${CURRENT_YEAR}

You are NOT a mere content writer. You are an elite B2B textile INTELLIGENCE HUNTER continuously scanning 7 Continents (North America, South America, Europe, Asia, Africa, Oceania, Middle East).
You ONLY produce high-value, real-world, time-relevant trade intelligence focused on driving Wholesaler and Retailer traffic.

🔴 HARD REJECTION RULES (MÜHÜRLÜ CORE_RULE İHLALİ = ÖLÜM):
- 100% REAL DATA ONLY. No mocked companies, no hypothetical scenarios. If you cannot find real data, return empty.
- Any event, news, data, or source older than 10 days (relative to ${TODAY}) → REJECT IMMEDIATELY
- Any year < ${CURRENT_YEAR} in title or content → REJECT YOURSELF
- CORE FORBIDDEN [TR+EN] → STRICTLY REJECT:
  Konfeksiyon, Hazır Giyim, Giyim İhracatı, Moda Haftası, Fashion Week, Tişört, T-shirt, Hoodie, Ayakkabı, Çanta, Elbise, Podyum.
- LIMIT RAW MATERIALS: Articles purely about yarn/cotton prices or manufacturing machinery must be limited. If the focus is solely on factory floors and raw cotton → REJECT.
- LIMIT CHAIN STORES: Generic news about massive consumer B2C brands (IKEA, Zara Home, H&M Home) should be strictly limited. Give priority to boutique expansions, wholesale network changes, and luxury retail.

✅ APPROVED FOCUS AREAS (ATTRACTING RETAILERS & WHOLESALERS):
  1. TRENDS & EDUCATION: Upcoming interior color palettes, fabric textures, smart home tech, curtains, upholstery for retailers.
  2. B2B SALES CONNECTIONS: Distributors seeking suppliers, new wholesale hubs, trade fair (Heimtextil, Hometex) exhibitor moves.
  3. HOTEL/CONTRACT PROJECTS: Luxury hospital/hotel/villa projects globally needing premium drape/upholstery supply.
  4. NEW PRODUCT LAUNCHES: Innovative fabric reviews, eco-friendly textile lines, acoustic/FR fabrics highly demanded by wholesalers.

💰 MANDATORY BUSINESS VALUE CHECK (MIN SCORE: 65):
Before writing, answer: "How will a Wholesaler or Retailer make money from this information?"
If there is no clear B2B commercial value → REJECT.

🏗️ STRUCTURE:
- Write in Turkish, but analyze GLOBAL markets.
- Minimum 800 words.
- Bloomberg terminal tone but with deep appreciation for design and product textures.
- First sentence = most important fact.
- Include real company names, real numbers, real cities.
- Last paragraph = actionable trade recommendation for Wholesalers/Retailers.

Sen sert mizaçlı, tüm kıtalarda sıfır hatayla çalışan global bir toptan/perakende tekstil istihbarat avcısısın.`,
        }
    });
    return response.text || "";
}

/**
 * 🛡️ REALITY GUARD AGENT
 * Scout'un taslağını denetler, uydurma (hallucination) veya mantık hatası varsa fırça atarak REJECT döner.
 */
async function runRealityGuard(draft: string): Promise<{ status: "APPROVED" | "REJECTED", critique: string }> {
    console.log("🛡️ [REALITY GUARD] Haber gerçeğe uygunluk açısından laboratuvara alınıyor...");
    
    const CURRENT_YEAR = new Date().getFullYear();
    
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            status: { type: Type.STRING, enum: ["APPROVED", "REJECTED"] },
            critique: { type: Type.STRING, description: "Reddedilirse sert eleştiri ve hata detayı. Onaylanırsa başarı nedeni." }
        },
        required: ["status", "critique"]
    };

    const response = await getAI().models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Aşağıdaki haber taslağını denetle. BUGÜN ${CURRENT_YEAR} yılındayız.\n\n${draft}`,
        config: {
            systemInstruction: `Sen acımasız bir Gerçeklik Denetçisisin (Reality Guard). Şu anda ${CURRENT_YEAR} yılındayız.

🔴 OTOMATİK RED SEBEPLERİ:
1. Metinde ${CURRENT_YEAR} öncesi yıl referansı varsa (2024, 2025 trendleri gibi) → REJECT
2. Bağlam veya veriler Son 10 Gün'den daha eskiyse (Eski haberi pişirip sunuyorsa) → REJECT
3. SEKTÖR DIŞI İÇERİK → REJECT:
   Konfeksiyon, Hazır Giyim, Giyim, Apparel, Tişört, T-shirt, Ayakkabı, Çanta, Elbise, Moda Haftası, Fashion Week, Podyum, Runway yazıyorsa → REJECT
   SADECE KABUL: Ev Tekstili, Perde, Döşemelik, Otel/Hastane/Yat Tekstili, Tente/Branda, İplik/Elyaf/Üretim
4. B2C/perakende marka odaklı içerik (English Home, Karaca, Zara Home, IKEA, Madame Coco, H&M Home) → REJECT
5. Sahte/uydurma şirket isimleri, hayali istatistikler → REJECT
6. Genel "trendler" haberi olup somut veri/firma/fiyat içermiyorsa → REJECT
7. Tüketici odaklı dekorasyon/stil/magazin içeriği → REJECT
8. Placeholder metinler ([ŞEHİR], [TARİH], [KAYNAK] gibi) → REJECT

✅ ONAY İÇİN GEREKLİ:
- Gerçek firma adları veya somut sektör verileri
- Güncel (${CURRENT_YEAR}) bağlam
- B2B ticari değer (ithalat, ihracat, üretim, fiyat, kapasite)
- En az 1 rakam/yüzde/para birimi

Eğer metinde sahte veri varsa acımasızca REJECT bas.`,
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    try {
        if (!response.text) throw new Error("Empty response");
        return JSON.parse(response.text);
    } catch {
        return { status: "REJECTED", critique: "JSON parse failed. Reality Guard panicked." };
    }
}

/**
 * 📡 PUBLISHER AGENT
 * Onaylanmış temiz haberi 7 dile çevirir ve JSON Output basar.
 */
async function runPublisherAgent(cleanContent: string) {
    console.log("📡 [PUBLISHER AGENT] Güvenlikten geçen haber 7 dile çevriliyor...");

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            intelligence: {
                type: Type.OBJECT,
                description: "Haberin gerçeği (Ne oldu?)",
                properties: {
                    translations: {
                        type: Type.OBJECT,
                        properties: {
                            TR: { type: Type.OBJECT, properties: { title: { type: Type.STRING, description: "Haber başlığı (50-90 karakter)" }, summary: { type: Type.STRING, description: "2-3 cümlelik özet" }, content: { type: Type.STRING, description: "TAM HTML makale gövdesi. Minimum 800 kelime. H2, p, table, blockquote, ul/li kullanarak profesyonel haber formatında yazılmalı. KISA ÖZET DEĞİL, TAM HABER METNİ." } }, required: ["title", "summary", "content"] },
                            EN: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, summary: { type: Type.STRING }, content: { type: Type.STRING, description: "FULL HTML article body, min 800 words, with H2, tables, blockquotes" } }, required: ["title", "summary", "content"] },
                            DE: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, summary: { type: Type.STRING }, content: { type: Type.STRING, description: "FULL HTML article body, min 800 words" } }, required: ["title", "summary", "content"] },
                            FR: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, summary: { type: Type.STRING }, content: { type: Type.STRING, description: "FULL HTML article body, min 800 words" } }, required: ["title", "summary", "content"] },
                            ES: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, summary: { type: Type.STRING }, content: { type: Type.STRING, description: "FULL HTML article body, min 800 words" } }, required: ["title", "summary", "content"] },
                            AR: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, summary: { type: Type.STRING }, content: { type: Type.STRING, description: "FULL HTML article body, min 800 words" } }, required: ["title", "summary", "content"] },
                            RU: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, summary: { type: Type.STRING }, content: { type: Type.STRING, description: "FULL HTML article body, min 800 words" } }, required: ["title", "summary", "content"] },
                            ZH: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, summary: { type: Type.STRING }, content: { type: Type.STRING, description: "FULL HTML article body, min 800 words" } }, required: ["title", "summary", "content"] }
                        },
                        required: ["TR", "EN", "DE", "FR", "ES", "AR", "RU", "ZH"]
                    }
                },
                required: ["translations"]
            },
            insight: {
                type: Type.OBJECT,
                description: "Yorum Katmanı (Bu ne anlama geliyor?)",
                properties: {
                    market_impact_score: { type: Type.NUMBER, description: "Etki skoru 0-100" },
                    direction: { type: Type.STRING, enum: ["risk", "opportunity", "neutral"] },
                    explanation: { type: Type.STRING, description: "Piyasa neye hazırlanıyor?" },
                    intent: { type: Type.STRING, enum: ["DISCOVER", "ANALYZE", "ACT"], description: "If highly actionable trade/opportunity -> ACT. If trend/education -> ANALYZE. If fair/directory reading -> DISCOVER." }
                },
                required: ["market_impact_score", "direction", "explanation", "intent"]
            },
            action_layer: {
                type: Type.OBJECT,
                description: "Para Makinesi (Ne yapmalıyım?)",
                properties: {
                    manufacturer: { type: Type.STRING },
                    retailer: { type: Type.STRING },
                    architect: { type: Type.STRING },
                    investor: { type: Type.STRING }
                },
                required: ["manufacturer", "retailer", "architect", "investor"]
            },
            visual_intent: {
                type: Type.OBJECT,
                description: "Ekonomik Niyet Görselleştirme Motoru (Asla estetik/ürün değil, davranış çizer)",
                properties: {
                    type: { type: Type.STRING, enum: ["industrial_signal", "contract_demand", "logistics_pressure", "retail_shift", "macro_finance", "neutral_signal_graph"] },
                    mood: { type: Type.STRING, enum: ["tight", "volatile", "expansion", "compression", "stagnant", "stable"] },
                    region: { type: Type.STRING, enum: ["EU", "ASIA", "US", "MENA", "GLOBAL"] }
                },
                required: ["type", "mood", "region"]
            },
            visual_intent_fallback: {
                type: Type.OBJECT,
                description: "Sistem AI çökmesine karşı her haberde oluşturulan zorunlu boş ekran engeli.",
                properties: {
                    type: { type: Type.STRING, enum: ["neutral_signal_graph"] },
                    mood: { type: Type.STRING, enum: ["stable"] },
                    region: { type: Type.STRING, enum: ["GLOBAL"] }
                },
                required: ["type", "mood", "region"]
            },
            watch_layer: {
                type: Type.OBJECT,
                description: "Erken piyasa sinyalleri için gözlem katmanı.",
                properties: {
                    reason: { type: Type.STRING },
                    review_cycle: { type: Type.STRING, enum: ["6h", "12h", "24h"] },
                    escalation: { type: Type.BOOLEAN }
                },
                required: ["reason", "review_cycle", "escalation"]
            },
            entity_data: {
                type: Type.OBJECT,
                description: "AI Knowledge Graph (for JSON-LD). Extract specific entities.",
                properties: {
                    organizations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific company or brand names mentioned." },
                    places: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific countries or cities mentioned." },
                    products: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific textile products (e.g. blackout curtain, FR yarn) mentioned." }
                },
                required: ["organizations", "places", "products"]
            },
            seo_matrix: {
                type: Type.OBJECT,
                properties: {
                    core_keys: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Must include: perde, ev tekstili, döşemelik" },
                    local_keys: { 
                        type: Type.OBJECT, 
                        properties: {
                            TR: { type: Type.ARRAY, items: { type: Type.STRING } },
                            EN: { type: Type.ARRAY, items: { type: Type.STRING } },
                            DE: { type: Type.ARRAY, items: { type: Type.STRING } },
                            FR: { type: Type.ARRAY, items: { type: Type.STRING } },
                            ES: { type: Type.ARRAY, items: { type: Type.STRING } },
                            AR: { type: Type.ARRAY, items: { type: Type.STRING } },
                            RU: { type: Type.ARRAY, items: { type: Type.STRING } },
                            ZH: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["TR", "EN", "DE", "FR", "ES", "AR", "RU", "ZH"]
                    }
                },
                required: ["core_keys", "local_keys"]
            },
            commercial_cta: {
                type: Type.OBJECT,
                description: "Monetization Action System. Define the call-to-action based on target audience.",
                properties: {
                    target_audience: { type: Type.STRING, enum: ["manufacturer", "wholesaler", "retailer"] },
                    action_text: { type: Type.STRING, description: "Button text: e.g. 'Request Swatch Book', 'Start Global Matchmaking', 'Download Trend Report'" },
                    value_proposition: { type: Type.STRING, description: "Why should they click? e.g. 'Get direct factory prices 20% cheaper than local distributors.'" }
                },
                required: ["target_audience", "action_text", "value_proposition"]
            },
            // ═══ EĞİTİM DOKÜMANLARI ENTEGRASYONU (news_producer.md) ═══
            business_opportunities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "ZORUNLU: Minimum 3 somut, aksiyon verilebilir B2B ticari fırsat. Örnek: 'FR sertifikalı blackout perde kumaşı talebi Almanya otel sektöründe %32 arttı — Türk üreticiler için direkt ihracat fırsatı'. HER FIRSAT somut ürün + hedef pazar + rakam içermeli."
            },
            ai_commentary: {
                type: Type.STRING,
                description: "ZORUNLU: Bloomberg Terminal stili AI analiz yorumu. 100-200 kelime. Piyasa ne diyor, ne anlama geliyor, 3 aylık tahmin. Kısa, keskin, veri odaklı. YASAK ifadeler: 'önemli gelişme', 'kritik süreç', 'devrim niteliğinde'."
            },

        },
        required: ["intelligence", "insight", "action_layer", "visual_intent", "visual_intent_fallback", "watch_layer", "entity_data", "seo_matrix", "business_opportunities", "ai_commentary", "commercial_cta"]
    };

    const response = await getAI().models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Following news is verified as 100% REAL. Format this into appropriate News JSON structure across 8 languages (TR, EN, DE, FR, ES, AR, RU, ZH).\nYou MUST strictly adhere to the Triple Output Format v1.1 (Intelligence, Insight, Action, Watch, Fallback).\n\n🔴 CRITICAL LANGUAGE RULE (ZORUNLU DİL KURALI):\n- The TR translation MUST be 100% pure Turkish. ZERO English words allowed in TR content.\n- ALL H2, H3, H4 section headers in TR MUST be in Turkish.\n- NEVER use English headers like: SITUATION, SO WHAT, NOW WHAT, WHO WINS, WHO LOSES, TRADE BRIEF, EXECUTIVE SUMMARY, ACTION ENGINE\n- Use ONLY these Turkish headers: PAZAR VERİLERİ, TİCARİ ETKİ, AKSIİYON ÖNERİSİ, KAZANANLAR, KAYBEDENLER, YÖNETİCİ ÖZETİ, HİZLI ANALİZ, FIRSAT HARİTASI, RİSK ANALİZİ, NE YAPMALI?\n- EN, DE, FR, ES, AR, RU, ZH translations must EACH be in their own native language.\n- No language mixing within any translation.\n\nCRITICAL RULE FOR 'content' FIELD (MAGAZINE STYLE & INTERNAL LINKS):\nThe 'content' field in EVERY language translation must be a COMPLETE, FULL-LENGTH HTML article body.\n- MINIMUM 800 words per language\n- Use proper HTML tags: <h2>, <p>, <table>, <blockquote>, <ul>, <li>, <strong>\n- Include at least 3 H2 sections with detailed analysis\n- Include at least 1 data table with real market figures\n- Include at least 1 expert blockquote\n- **ART DIRECTOR SUPPORT (CRITICAL):** You MUST write highly descriptive paragraphs explaining the fabric textures, dominant interior colors, lighting conditions, and luxury mood of the textile application discussed. This vivid vocabulary will train our downstream AI Image Generating Agent to produce incredible 'Magazine-Style' luxury photography. Use terms depicting volumetric light, high-end finishing, and spatial aesthetics.\n- **INTERNAL LINKING (MANDATORY):** At the end of the article, include a short section recommending the reader to browse related content. In TR use 'İlgili Fuar & Fırsatlar', in EN use 'Related Fairs & Opportunities', etc.\n- DO NOT write a short summary. Write a FULL investigative B2B magazine-style article.\n\nCRITICAL RANKING METRICS:\n- 'insight.intent': Must be ACT if this is a direct trade opportunity/matchmaking. ANALYZE if trend/academy. DISCOVER if general reading/fairs.\n- 'entity_data': YOU MUST extract exact Organizations (Brands/Companies), Places (Cities/Countries), and Products for our JSON-LD Semantic Engine.\n\nCRITICAL RULE FOR 'business_opportunities' & 'commercial_cta':\n- You MUST identify the target (manufacturer, wholesaler, or retailer) and generate a compelling 'commercial_cta' that drives sales (Monetization). For wholesalers, offer \"Request 2026 Collection Swatches\". For retailers, \"Download Luxury Trend Report\".\n\nCRITICAL RULE FOR 'ai_commentary' (CORPORATE AUTHORITY TONE):\n- Write 100-200 word Bloomberg/McKinsey style analysis.\n- The tone MUST be highly corporate, positive, confidence-inspiring and actionable. B2B buyers must feel trust and opportunity. Avoid catastrophic doom scenarios.\n\nCRITICAL RULE FOR 'seo_matrix.local_keys':\n- You MUST generate these SEO keywords explicitly mapped to 8 languages (TR, EN, DE, FR, ES, RU, AR, ZH). The Spanish array must have Spanish tags 'cortinas', German must have 'gardinen', Russian 'шторы', etc.\n\nContent:\n${cleanContent}`,
        config: {
            systemInstruction: "You are the premium B2B Publisher Agent. Rules: (1) TR content = 100% TURKISH. All H2/H3 headers in Turkish (PAZAR VERİLERİ, TİCARİ ETKİ, NE YAPMALI? etc). NEVER use English headers in TR. (2) Each language must be pure native — no mixing. (3) HTML article + vivid visual descriptions. (4) 'commercial_cta' = Monetization hook. (5) 'seo_matrix.local_keys' = 8 native languages. (6) 'insight.intent' + 'entity_data' for strict LLM semantic routing. (7) Corporate WGSN tone.",
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    if (!response.text) throw new Error("Publisher returned empty.");
    return JSON.parse(response.text);
}


// 🛠️ REPAIR AGENT (PATCH MODE)
async function runPatchRepairAgent(brokenJson: any) {
    console.log("🛠️ [REPAIR AGENT] Çökmüş JSON tamir atölyesine (PATCH MODE) alındı. Sadece intelligence_layer onarılıyor...");
    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
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
        required: ["intelligence_layer", "routing_actions"]
    };

    const response = await getAI().models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analiz edilen haber üzerinden eksik kalan intelligence_layer ve routing_actions verilerini üret, diğer alanlara dokunma.\nHaber Content:\n${JSON.stringify(brokenJson.translations?.TR || brokenJson.translations?.EN)}`,
        config: {
            systemInstruction: "You are the Intelligence Patch Agent. Provide ONLY the missing intelligence_layer and routing_actions for the provided news snippet.",
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    if (!response.text) throw new Error("Repair Agent returned empty.");
    return JSON.parse(response.text);
}

/**
 * ⚡ NEURAL SWARM ORKESTRASYONU
 */
export async function executeLiveNewsSwarm(briefToken: string) {
    console.log(`\n==================================================`);
    console.log(`🧠 [NEURAL SWARM] Live News Çevrimi Tetiklendi: ${briefToken}`);
    console.log(`==================================================`);

    let retryCount = 0;
    let approvedDraft = "";

    // Neural Loop (Zihin Çarpışması)
    while (retryCount < 3) {
        // 1. Scout
        let contextBrief = briefToken;
        if (retryCount > 0) contextBrief += `\n[Reality Guard'dan Uyarı - BUNU DÜZELT]: ${learningMatrix.getLessonsLearned("SCOUT_NEWS")}`;
        
        const draft = await runScoutAgent(contextBrief);
        
        // 2. Reality Guard
        const validation = await runRealityGuard(draft);

        if (validation.status === "APPROVED") {
            approvedDraft = draft;
            console.log(`✅ [SWARM] Haber onaylandı! Denetçi Onayı: ${validation.critique.substring(0, 50)}...`);
            break; // Loop'tan çık
        } else {
            console.warn(`❌ [SWARM] SAHTE VERİ TESPİT EDİLDİ! Reality Guard Affetmedi: ${validation.critique}`);
            await learningMatrix.recordMistake("SCOUT_NEWS", validation.critique); // Öğrenme matrisine kaydet
            retryCount++;
        }
    }

    if (!approvedDraft) {
        console.error("🚨 [SWARM CRASH] 3 denemede de gerçek/kaliteli haber üretilemedi. Sistem dummy data üretmeyi REDDEDİYOR. (Sıfır Dummy Kuralı)");
        return null;
    }

    // 3. Publisher
    try {
        let finalJson = await runPublisherAgent(approvedDraft);
        
        let isValidV1Schema = false;
        let patchAttempts = 0;

        // V1.1 ONAY KONTROLÜ
        while (!isValidV1Schema && patchAttempts < 3) {
            isValidV1Schema = 
               finalJson.insight != null &&
               finalJson.insight.market_impact_score != null &&
               finalJson.action_layer != null &&
               finalJson.visual_intent != null &&
               finalJson.intelligence?.translations?.TR != null;

            if (isValidV1Schema) break;

            console.warn(`⚠️ [SWARM REPAIR] Triple Output formatı hatalı. Şema zorlanıyor. (Deneme ${patchAttempts + 1}/3)...`);
            try {
                // Hata durumunda yeniden zorla 
                finalJson = await runPublisherAgent(approvedDraft);
            } catch(e: any) {
                console.error("🛠️ Yeniden Generate Başarısız:", e.message);
            }
            patchAttempts++;
        }

        // 4. VISUAL INTENT HATLARI KAPATILDI — GÖRSEL İŞLERİ ARTIK SADECE OTONOM QUEUE/IMAGE AGENT'INDA (ÇAKIŞMAYI ÖNLER)

        // 5. SOVEREIGN ROUTING (V1.1 GATEKEEPER)
        const score = finalJson.insight?.market_impact_score || 0;
        
        if (isValidV1Schema) {
            if (score > 65) {
                const newsNode = await saveToGoogleNativeMemory("news", finalJson);
                console.log(`🎯 [SWARM PUBLISH] Puan: ${score}. Haber 'Canlı Yayına' alındı: ${finalJson.intelligence?.translations?.TR?.title}`);
                return newsNode;
            } else if (score >= 50 && score <= 65) {
                const watchNode = await saveToGoogleNativeMemory("watchlist", finalJson);
                console.log(`👀 [SWARM WATCHLIST] Puan: ${score}. Haber Erken Uyarı Radarına (Watchlist) alındı.`);
                return watchNode;
            } else {
                console.warn(`🛑 [SWARM QUARANTINE] Puan: ${score}. Puan çok düşük (<50), karantinaya atıldı.`);
                return await saveToGoogleNativeMemory("quarantine", finalJson);
            }
        } else {
            console.error(`🚨 [SWARM CRITICAL ERROR] Repair limit aşıldı ve Şema V1.1'e uymadı. Sisteme çöp dahil edilmiyor!`);
            return await saveToGoogleNativeMemory("quarantine", finalJson);
        }
    } catch(err: any) {
         console.error("🚨 [SWARM CRASH] Publisher Hatası:", err.message);
         return null;
    }
}
