import { GoogleGenAI, Type, Schema } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "dummy" });

export interface TranslationInput {
  title: string;
  summary: string;
  content: string;
}

export interface TranslatedContent {
  TR: TranslationInput;
  EN: TranslationInput;
  DE: TranslationInput;
  FR: TranslationInput;
  ES: TranslationInput;
  AR: TranslationInput;
  RU: TranslationInput;
  ZH: TranslationInput;
}

// Target languages required for TRTEX and AIPyram ecosystem
const TARGET_LANGUAGES = ['EN', 'DE', 'FR', 'ES', 'AR', 'RU', 'ZH'];

const translationSchema: Schema = {
  type: Type.OBJECT,
  properties: TARGET_LANGUAGES.reduce((acc, lang) => {
    acc[lang] = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        content: { type: Type.STRING }
      },
      required: ["title", "summary", "content"]
    };
    return acc;
  }, {} as any),
  required: TARGET_LANGUAGES
};

/**
 * 🌍 OTONOM ÇEVİRİ AJANI (Translation Guard)
 * Input (Turkish or English base content) -> Output: Fully translated 8-language object
 */
export async function executeTranslationAgent(baseContent: TranslationInput, sourceLang: string = 'TR'): Promise<TranslatedContent> {
  const promptContext = `
  You are an expert B2B and Textile Industry localization agent.
  Your task is to accurately translate the provided ${sourceLang} content into the following languages:
  English (EN), German (DE), French (FR), Spanish (ES), Arabic (AR), Russian (RU), and Chinese (ZH).
  
  RULES:
  1. Maintain the professional B2B tone.
  2. Do not hallucinate extra information.
  3. Ensure industry-specific terms (like EPR, Supply Chain, Home Textile, B2B) are correctly localized in each language.
  4. Ensure Arabic translation respects RTL nuances and Chinese is Simplified Chinese.
  
  CONTENT TO TRANSLATE (${sourceLang}):
  Title: ${baseContent.title}
  Summary: ${baseContent.summary}
  Content: ${baseContent.content}
  `;

  // Provide initial base setup (inject TR if source is TR)
  let result: TranslatedContent = {
    TR: sourceLang === 'TR' ? baseContent : { title: "", summary: "", content: "" },
    EN: { title: "", summary: "", content: "" },
    DE: { title: "", summary: "", content: "" },
    FR: { title: "", summary: "", content: "" },
    ES: { title: "", summary: "", content: "" },
    AR: { title: "", summary: "", content: "" },
    RU: { title: "", summary: "", content: "" },
    ZH: { title: "", summary: "", content: "" }
  } as TranslatedContent;

  try {
    console.log(`[🌍 TRANSLATOR] Çeviri başlatıldı (${TARGET_LANGUAGES.join(', ')})...`);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptContext,
      config: {
        responseMimeType: "application/json",
        responseSchema: translationSchema,
        temperature: 0.1, // Düşük sıcaklık çeviri tutarlılığı içindir
      }
    });

    if (response.text) {
      const translations = JSON.parse(response.text);
      
      // Merge results
      for (const lang of TARGET_LANGUAGES) {
        if (translations[lang]) {
          (result as any)[lang] = translations[lang];
        }
      }
      console.log(`[🌍 TRANSLATOR] ✅ 7 Dil başarıyla çevrildi.`);
    }
  } catch (error) {
    console.error(`[🌍 TRANSLATOR] ❌ Çeviri hatası:`, error);
    // Fallback: Copy EN or TR if it fails to avoid breaking the pipeline
    const fallbackBase = sourceLang === 'TR' ? baseContent : (result as any)['EN'] || baseContent;
    for (const lang of TARGET_LANGUAGES) {
      (result as any)[lang] = fallbackBase;
    }
  }

  return result;
}
