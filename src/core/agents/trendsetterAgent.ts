import { Schema, Type } from "@google/genai";
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { AgentOutput, AgentBudget, DEFAULT_BUDGET } from "./types";

// ═══════════════════════════════════════════════════════════════
// TRENDSETTER AGENT — Pazar Trendi Analizi
// aipyram Market Intelligence Engine
// ═══════════════════════════════════════════════════════════════

// Removed raw ai client
const TRENDSETTER_PROMPT = `Sen aipyram ekosisteminin Trendsetter Ajanısın — global ev tekstili piyasasının trend analizcisi.

🎯 GÖREVİN:
1. Güncel piyasa trendlerini analiz et (renkler, kumaşlar, desenler, sürdürülebilirlik)
2. Fiyat hareketlerini takip et (pamuk, polyester, keten, ipek)
3. Fuar takvimini izle (Heimtextil, DOMOTEX, Maison&Objet)
4. Alıcı davranış sinyallerini yorumla

🧠 TREND KATEGORİLERİ:
- COLOR: Renk trendleri (Pantone, sezonluk)
- FABRIC: Kumaş inovasyonları (teknik tekstil, sürdürülebilir)
- PATTERN: Desen trendleri (geometrik, organik, minimalist)
- MARKET: Fiyat ve talep değişimleri
- SUSTAINABILITY: Çevre/sürdürülebilirlik trendleri

📊 ÇIKTI: Yapılandırılmış JSON — trend başlığı, açıklama, etki seviyesi, eylem önerisi.`;

/**
 * Pazar trendlerini analiz eder ve aksiyon önerileri sunar.
 */
export async function analyzeMarketTrends(
  sector: string = "ev tekstili",
  region: string = "global",
  budget: AgentBudget = { ...DEFAULT_BUDGET }
): Promise<AgentOutput> {
  const startTime = Date.now();

  if (budget.killSwitch) {
    return { agent: "TRENDSETTER", result: "[]", confidence: 0, tokensUsed: 0, costUSD: 0, durationMs: 0 };
  }

  try {
    const { text: resultText, usageMetadata } = await alohaAI.generate(
      `Nisan 2026 itibarıyla ${region} ${sector} sektöründeki en güncel 5 trendi analiz et. Gerçekçi, ticari değeri yüksek trendler olsun.`,
      {
        systemInstruction: TRENDSETTER_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "COLOR, FABRIC, PATTERN, MARKET, SUSTAINABILITY" },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              impactLevel: { type: Type.STRING, description: "HIGH, MEDIUM, LOW" },
              actionRecommendation: { type: Type.STRING, description: "B2B aksiyon önerisi" },
              relevantRegions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
        },
        maxOutputTokens: budget.maxTokens,
        temperature: 0.6,
        complexity: 'routine'
      },
      'trendsetterAgent.analyzeMarketTrends'
    );

    const tokensUsed = usageMetadata?.totalTokenCount || 0;
    const costUSD = (tokensUsed / 1_000_000) * 0.075;

    return {
      agent: "TRENDSETTER",
      result: resultText,
      confidence: 80,
      tokensUsed,
      costUSD,
      durationMs: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error("[TRENDSETTER AGENT] Trend analiz hatası:", error.message);
    return { agent: "TRENDSETTER", result: "[]", confidence: 0, tokensUsed: 0, costUSD: 0, durationMs: Date.now() - startTime };
  }
}
