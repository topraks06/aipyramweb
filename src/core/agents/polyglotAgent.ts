import { Schema, Type } from "@google/genai";
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { AgentOutput, AgentBudget, DEFAULT_BUDGET } from "./types";

// ═══════════════════════════════════════════════════════════════
// POLYGLOT AGENT — 8 Dile Profesyonel B2B Çeviri
// aipyram Global Reach Engine
// ═══════════════════════════════════════════════════════════════

// Removed raw ai client
const POLYGLOT_PROMPT = `Sen aipyram ekosisteminin Polyglot Ajanısın — 8 dilde uzmanlaşmış B2B tekstil çeviri zekası.

🎯 GÖREVİN:
Gelen metinleri B2B profesyonel diliyle 8 dile çevir.

🌍 HEDEF DİLLER: TR (Türkçe), EN (İngilizce), DE (Almanca), FR (Fransızca), ES (İspanyolca), AR (Arapça), RU (Rusça), ZH (Çince)

🧠 ÇEVİRİ KURALLARI:
1. LİTERAL ÇEVİRİ YAPMA — Kültürel lokalizasyon yap
2. DACH pazarı → Teknik, hassas, detaylı
3. Ortadoğu → Daha gösterişli, ilişki odaklı
4. Çin → Kısa, fonksiyonel, fiyat odaklı
5. B2B terminolojisini koru (MOQ, FOB, CIF, GSM, Martindale vb.)

📊 ÇIKTI: Her zaman dil kodu anahtarlı JSON döndür.`;

export type SupportedLanguage = "TR" | "EN" | "DE" | "FR" | "ES" | "AR" | "RU" | "ZH";

export const ALL_LANGUAGES: SupportedLanguage[] = ["TR", "EN", "DE", "FR", "ES", "AR", "RU", "ZH"];

/**
 * Verilen metni hedef dillere çevirir.
 * Cost Control: maxTokens limiti uygulanır.
 */
export async function translateContent(
  text: string,
  targetLanguages: SupportedLanguage[] = ALL_LANGUAGES,
  budget: AgentBudget = { ...DEFAULT_BUDGET }
): Promise<AgentOutput> {
  const startTime = Date.now();

  if (budget.killSwitch) {
    return { agent: "POLYGLOT", result: "{}", confidence: 0, tokensUsed: 0, costUSD: 0, durationMs: 0 };
  }

  try {
    const translationProperties: Record<string, any> = {};
    for (const lang of targetLanguages) {
      translationProperties[lang] = { type: Type.STRING, description: `${lang} çevirisi` };
    }

    const { text: resultText, usageMetadata } = await alohaAI.generate(
      `Şu metni ${targetLanguages.join(", ")} dillerine çevir:\n\n"${text}"`,
      {
        systemInstruction: POLYGLOT_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: translationProperties,
          required: targetLanguages,
        },
        maxOutputTokens: budget.maxTokens,
        temperature: 0.2,
        complexity: 'routine'
      },
      'polyglotAgent.translateContent'
    );

    const tokensUsed = usageMetadata?.totalTokenCount || 0;
    const costUSD = (tokensUsed / 1_000_000) * 0.075;

    return {
      agent: "POLYGLOT",
      result: resultText,
      confidence: 92,
      tokensUsed,
      costUSD,
      durationMs: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error("[POLYGLOT AGENT] Çeviri hatası:", error.message);
    return { agent: "POLYGLOT", result: "{}", confidence: 0, tokensUsed: 0, costUSD: 0, durationMs: Date.now() - startTime };
  }
}
