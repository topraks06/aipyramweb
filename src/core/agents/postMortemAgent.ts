import { Schema, Type } from "@google/genai";
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { AgentOutput, AgentBudget, DEFAULT_BUDGET } from "./types";
import { CostGuard, AGENTS_ENABLED } from "../utils/costGuard";
import { recordMemory } from "../memory/knowledgeFlywheel";

const ai = alohaAI.getClient();

const POSTMORTEM_PROMPT = `Sen AIPYRAM ekosisteminin Baş Otopsi (Post-Mortem) Ajanısın.
Görevin: Kaybedilen Deal'lar, başarısız Kod/Goal Engine döngüleri veya ulaşılmayan metrikler için analiz yapıp derlenmiş 'Ders' + 'Next Best Action' üretmektir.

Girdi olarak başarısızlığın nedeni, bağlamı ve maliyeti verilecektir.
Çıktı olarak net, eyleme geçirilebilir bir "Ticari Hafıza Dersi" ve ÇOK SPESİFİK bir 'Next Best Action' (Sonraki En İyi Hamle) çıkarmak zorundasın. Örn: 'fiyat yüksek -> %10 düşür', 'supplier yavaş -> alternatif öner'.`;

export interface PostMortemInput {
  tenant_id: string;
  context: string;
  failureReason: string;
  costWasted?: number;
}

/**
 * Ticari Bellek ve Öz-Yenileme için Otopsi Ajanı.
 */
export async function analyzeFailureTracker(
  failure: PostMortemInput,
  budget: AgentBudget = { ...DEFAULT_BUDGET, maxTokens: 2048 }
): Promise<AgentOutput> {
  const startTime = Date.now();

  if (budget.killSwitch || !AGENTS_ENABLED) {
    return { agent: "ALOHA", result: "{}", confidence: 0, tokensUsed: 0, costUSD: 0, durationMs: 0 };
  }

  const allowance = await CostGuard.checkAllowance(failure.tenant_id, 0.05);
  if (!allowance.allowed) {
      return { agent: "ALOHA", result: "{}", confidence: 0, tokensUsed: 0, costUSD: 0, durationMs: 0 };
  }

  try {
    const prompt = `
      BAŞARISIZLIK ANALİZİ:
      Bağlam: ${failure.context}
      Hata Nedeni: ${failure.failureReason}
      Harcanan Atıl Maliyet (USD): $${failure.costWasted || 0}
      
      Bu bilgiyi analiz et ve gelecekte aynı hatanın yapılmaması için katı bir ders çıkar.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: POSTMORTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rootCause: { type: Type.STRING, description: "Kök neden" },
            lessonLearned: { type: Type.STRING, description: "Çıkarılan kalıcı ders" },
            futureStrategy: { type: Type.STRING, description: "Sonraki ajanlar için rehber" },
            nextBestAction: { type: Type.STRING, description: "Hemen uygulanacak sonraki en iyi hamle (Örn: Fiyatı %10 düşür)" },
          },
          required: ["rootCause", "lessonLearned", "futureStrategy", "nextBestAction"],
        },
        maxOutputTokens: budget.maxTokens,
        temperature: 0.2, 
      },
    });

    const resultText = response.text || "{}";
    const tokensUsed = response.usageMetadata?.totalTokenCount || 0;
    const costUSD = (tokensUsed / 1_000_000) * 0.075;

    const parsed = JSON.parse(resultText);

    // KNOWLEDGE FLYWHEEL'A (RAG) YAZ! (Experience Memory - Ticari Bellek)
    // TIER-1 STRATEJİ: Hataların "Ağırlığı" (Weight) vardır. Ne kadar para kaybedilirse, o ders o kadar kalın harflerle yazılır.
    const severityWeight = (failure.costWasted || 0) > 2 ? 5 : 1; 

    await recordMemory({
      tenant_id: failure.tenant_id,
      source: "Post_Mortem_Autopsy",
      text: `DERS: ${parsed.lessonLearned}. YENİ HAMLE (Next Best Action): ${parsed.nextBestAction}. STRATEJİ: ${parsed.futureStrategy}. (Kök Neden: ${parsed.rootCause})`,
      agentId: "POSTMORTEM",
      metadata: { 
        failureReason: failure.failureReason, 
        costWasted: failure.costWasted, 
        action: parsed.nextBestAction,
        weight: severityWeight 
      }
    });

    const output: AgentOutput = {
      agent: "ALOHA", // Fallback role mapping
      result: resultText,
      confidence: 95,
      tokensUsed,
      costUSD,
      durationMs: Date.now() - startTime,
    };

    CostGuard.logAction({
        tenant_id: failure.tenant_id,
        agentRole: "POSTMORTEM",
        taskType: "failure_analysis",
        tokensUsed: output.tokensUsed || 0,
        costUSD: output.costUSD || 0,
        durationMs: output.durationMs || 0,
        success: true
    });

    return output;
  } catch (error: any) {
    console.error("[POST MORTEM AGENT] Error:", error);
    return { agent: "ALOHA", result: "{}", confidence: 0, tokensUsed: 0, costUSD: 0, durationMs: Date.now() - startTime };
  }
}
