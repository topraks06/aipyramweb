import { GoogleGenAI } from "@google/genai";
import Parser from "rss-parser";

export async function getDynamicBrief(intent: string = "TREND"): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("⚠️ [Dynamic Signal] API Key eksik, fallback brief dönüyor.");
        return `Tekstil pazarında güncel ${intent} hedefleri inceleniyor.`;
    }

    const aiClient = new GoogleGenAI({ apiKey });

    // Melez Sinyal Mantığı: %70 Google (Spontaneous/Breaking), %30 RSS (Stable/Deep) 
    const isRssTurn = Math.random() < 0.3;

    if (isRssTurn) {
        try {
            console.log(`📡 [SIGNAL COLLECTOR] RSS beslemeleri taranıyor... Intent: ${intent}`);
            const parser = new Parser({
                timeout: 10000,
            });
            // Geniş sektör RSS'leri
            const feeds = [
                'https://www.home-textiles-today.com/feed/',
                'https://www.just-style.com/feed/',
                'https://textilegence.com/feed/' // local example
            ];
            const targetFeed = feeds[Math.floor(Math.random() * feeds.length)];
            
            const feed = await parser.parseURL(targetFeed);
            if (feed.items && feed.items.length > 0) {
                // En yeni ilk 3 haberden birini seç
                const item = feed.items[Math.floor(Math.random() * Math.min(3, feed.items.length))];
                console.log(`✅ [SIGNAL COLLECTOR] RSS Sinyali Bulundu: ${item.title}`);
                return `RSS Kaynağından gerçek veri: "${item.title}". Bu haberi B2B ${intent} (Fırsat/Trend vb) bakış açısıyla küresel vizyonda analiz et: ${item.link || ''}`;
            }
        } catch (e: any) {
            console.error(`❌ [SIGNAL COLLECTOR] RSS Parse Hatası (${e.message}). Google'a düşülüyor.`);
        }
    }

    // --- Google Grounding (Son 48 Saat Flaş Gelişmeler) ---
    try {
        console.log(`📡 [SIGNAL COLLECTOR] Gemini Search Grounding ile gerçek zamanlı piyasa taranıyor... Intent: ${intent}`);
        
        let searchKeywords = "home textile industry news today";
        if (intent === 'PAZAR') searchKeywords = "global curtain and upholstery market trend this week";
        if (intent === 'FIRSAT') searchKeywords = "hotel contract textile supply problems OR opportunities B2B fabric news";
        if (intent === 'TREND') searchKeywords = "innovations or new colors in home textile international fairs";

        const response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Search the web for the absolute latest breaking news regarding: "${searchKeywords}". 
Return ONLY ONE completely unique, highly specific and real B2B intelligence brief (max 2 sentences). 
Focus on: ${intent} (If ACT/Fırsat, look for supply gaps. If Pazar, look for market data. If Trend, look for design shifts).
DO NOT RETURN A GENERAL STATEMENT. It must be a specific event, shift, or price dynamic from the last 48 hours.
Format: just the brief text.`,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.9,
            }
        });

        if (response.text && response.text.length > 20) {
            console.log(`✅ [SIGNAL COLLECTOR] Google Canlı Brief Bulundu: ${response.text.substring(0, 100)}...`);
            return response.text.trim();
        }
    } catch (err: any) {
        console.error("❌ [SIGNAL COLLECTOR] Google Ağ Hatası:", err.message);
    }

    // Fallback if full search fails
    const fallbacks = [
        `Ev tekstili sektöründe küresel ${intent} odaklı tedarik zinciri değişimleri.`,
        `Perde kumaşı ihracatında son durum ve ${intent} analizleri.`,
        `Oteller için kontrat tekstili taleplerinde ${intent} raporu.`
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
