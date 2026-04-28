import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { AgentOutput, AgentBudget, DEFAULT_BUDGET } from "./types";

// ═══════════════════════════════════════════════════════════════
// VIRTUAL REP AGENT — 7/24 AI Stand Görevlisi
// aipyram Autonomous Sales Engine
// ═══════════════════════════════════════════════════════════════

// Removed raw ai client
/**
 * Belirli bir tedarikçinin sanal temsilcisi olarak alıcı sorularını yanıtlar.
 * Tedarikçinin ürün kataloğu, kapasitesi ve sertifikaları bağlam olarak verilir.
 */
export async function handleBuyerInquiry(
  supplierContext: {
    companyName: string;
    products: string[];
    certifications: string[];
    moq: string;
    leadTime: string;
    specialties: string[];
  },
  buyerMessage: string,
  buyerLanguage: string = "tr",
  budget: AgentBudget = { ...DEFAULT_BUDGET }
): Promise<AgentOutput> {
  const startTime = Date.now();

  if (budget.killSwitch) {
    return { agent: "VIRTUAL_REP", result: "", confidence: 0, tokensUsed: 0, costUSD: 0, durationMs: 0 };
  }

  const systemPrompt = `Sen ${supplierContext.companyName} firmasının 7/24 aktif AI Sanal Temsilcisisin.

HAKKINDA:
- Ürünler: ${supplierContext.products.join(", ")}
- Sertifikalar: ${supplierContext.certifications.join(", ")}
- Minimum Sipariş: ${supplierContext.moq}
- Teslim Süresi: ${supplierContext.leadTime}
- Uzmanlık: ${supplierContext.specialties.join(", ")}

KURALLAR:
1. Alıcının dilinde (${buyerLanguage}) cevap ver
2. Profesyonel, güvenilir ve kesin konuş
3. Fiyat verme — sadece fiyat aralığı ve "detaylı teklif için iletişim" de
4. Bilmediğin bilgiyi UYDURMA — "Bu konuda satış ekibimiz kısa sürede dönecektir" de
5. Alıcıyı teklif istemeye yönlendir (RFQ oluştur)`;

  try {
    const { text: resultText, usageMetadata } = await alohaAI.generate(
      buyerMessage,
      {
        systemInstruction: systemPrompt,
        maxOutputTokens: budget.maxTokens,
        temperature: 0.5,
        complexity: 'routine'
      },
      'virtualRepAgent.handleBuyerInquiry'
    );

    const tokensUsed = usageMetadata?.totalTokenCount || 0;
    const costUSD = (tokensUsed / 1_000_000) * 0.075;

    return {
      agent: "VIRTUAL_REP",
      result: resultText,
      confidence: 85,
      tokensUsed,
      costUSD,
      durationMs: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error("[VIRTUAL_REP AGENT] Yanıt hatası:", error.message);
    return { agent: "VIRTUAL_REP", result: "Şu an teknik bir sorun yaşıyoruz. Lütfen daha sonra tekrar deneyin.", confidence: 0, tokensUsed: 0, costUSD: 0, durationMs: Date.now() - startTime };
  }
}
