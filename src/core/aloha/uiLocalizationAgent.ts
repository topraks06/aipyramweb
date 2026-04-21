import { GoogleGenAI, Type, Schema } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "dummy" });

/**
 * 🌍 ALOHA GLOBAL YERELLEŞTİRME İŞÇİSİ (UI Localization Agent - 8 Languages)
 */

export interface TranslatedUIValues {
  TR: any[];
  EN: any[];
  DE: any[];
  FR: any[];
  ES: any[];
  AR: any[];
  RU: any[];
  ZH: any[];
}

export async function executeUiLocalization(dataArray: any[], contextHint: string = "B2B Textile Intelligence"): Promise<TranslatedUIValues | any[]> {
    if (!apiKey || apiKey === "dummy") {
        console.warn("[🌍 UI-LOCALIZER] Mute Mode: API Key yok. Orijinal veriyi dönüyorum.");
        const fallback: any = {};
        ['TR', 'EN', 'DE', 'FR', 'ES', 'AR', 'RU', 'ZH'].forEach(l => fallback[l] = dataArray);
        return fallback as TranslatedUIValues;
    }

    if (!dataArray || dataArray.length === 0) {
        const emptyFallback: any = {};
        ['TR', 'EN', 'DE', 'FR', 'ES', 'AR', 'RU', 'ZH'].forEach(l => emptyFallback[l] = dataArray);
        return emptyFallback;
    }

    const promptContext = `
    You are the "Global Localization Guard" for a B2B Textile & Intelligence Terminal.
    Your EXACT job is to take the provided JSON array of objects, read through ALL string values meant for human reading, 
    and translate them into 8 target languages: TR, EN, DE, FR, ES, AR, RU, ZH.

    RULES:
    1. DO NOT CHANGE the structure of the JSON items. Output exactly an object containing keys for each language ('TR', 'EN', 'DE', 'FR', 'ES', 'AR', 'RU', 'ZH').
    2. The value of each language key MUST be an array identical to the input array structure, BUT with the human-readable string fields correctly translated to that language.
    3. Keep industry terms correct (e.g. 'PTA/MEG', 'USD/TRY' do not translate).
    4. Keep numerical values, dates, and IDs EXACTLY as they are in all languages.
    5. Return ONLY valid JSON format.
    
    JSON TO TRANSLATE (${contextHint}):
    ${JSON.stringify(dataArray, null, 2)}
    `;

    try {
        console.log(`[🌍 UI-LOCALIZER] İşçi sahada: ${dataArray.length} adet arayüz objesi taranıp 8 DİLE KOPYALANIYOR...`);
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: promptContext,
            config: {
                responseMimeType: "application/json",
                temperature: 0.1,
            }
        });

        if (response.text) {
            const translatedGroups = JSON.parse(response.text);
            return translatedGroups;
        }
    } catch (error: any) {
        console.error(`[🌍 UI-LOCALIZER] Çeviri görevinde hata: ${error.message}. Kırılmamak için orijinal İngilizce ile devam ediliyor.`);
    }

    // Fallback: Return the original data for all languages if execution fails
    const fallback: any = {};
    ['TR', 'EN', 'DE', 'FR', 'ES', 'AR', 'RU', 'ZH'].forEach(l => fallback[l] = dataArray);
    return fallback as TranslatedUIValues;
}
