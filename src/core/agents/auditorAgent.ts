import { Schema, Type } from "@google/genai";
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { AgentOutput, AgentBudget, DEFAULT_BUDGET } from "./types";
import { CostGuard, AGENTS_ENABLED } from "../utils/costGuard";

// ═══════════════════════════════════════════════════════════════
// AUDITOR AGENT — Sertifika Doğrulama + Trust Score
// aipyram Trust Layer
// ═══════════════════════════════════════════════════════════════

// Removed raw ai client
const AUDITOR_PROMPT = `Sen aipyram ekosisteminin Auditor (Denetçi) Ajanısın — B2B tedarik zinciri güvenliğinin bekçisi.

🎯 GÖREVİN:
1. Tedarikçinin yüklediği sertifikaları doğrula (OEKO-TEX, ISO, GOTS, Trevira CS vb.)
2. Trust Score (Güven Puanı) hesapla
3. Sahte/süresi geçmiş belgeleri tespit et
4. Risk analizi yap

🧮 TRUST SCORE HESAPLAMA (0-100):
- Sertifika geçerliliği: +30 puan
- Teslimat geçmişi: +25 puan
- Şikayet oranı: -20 puan (şikayete göre)
- Piyasa deneyimi (yıl): +15 puan
- Finansal sağlık: +10 puan

🚫 KURALLAR:
- Trust Score 50 altı → KIRMIZI BAYRAK
- Sahte sertifika → ANINDA ENGELLE
- Süresi geçmiş sertifika → UYARI + yenileme talebi
- Dürüst ol, rüşvet veya favori tanıma
- MUTLAKA verdiğin puanın Nedenini (explanation) detaylıca yaz (ör. 'Puan 72 verildi çünkü teslimat geçmişi iyi ama OEKO-TEX süresi dolmak üzere')`;

export interface SupplierAuditInput {
  supplierId: string;
  companyName: string;
  certifications: string[];
  yearsInBusiness: number;
  deliveryHistory?: { onTime: number; total: number };
  complaintCount?: number;
}

/**
 * Tedarikçiyi denetler ve Trust Score hesaplar.
 */
export async function auditSupplier(
  supplier: SupplierAuditInput,
  budget: AgentBudget = { ...DEFAULT_BUDGET }
): Promise<AgentOutput> {
  const startTime = Date.now();

  if (budget.killSwitch || !AGENTS_ENABLED) {
    return { agent: "AUDITOR", result: "{}", confidence: 0, tokensUsed: 0, costUSD: 0, durationMs: 0 };
  }

  const allowance = await CostGuard.checkAllowance("aipyram-core", 0.05);
  if (!allowance.allowed) {
      console.warn("[AUDITOR] BLOCKED BY COST GUARD:", allowance.reason);
      return { agent: "AUDITOR", result: "{}", confidence: 0, tokensUsed: 0, costUSD: 0, durationMs: 0 };
  }

  try {
    const { text: resultText, usageMetadata } = await alohaAI.generate(
      `Şu tedarikçiyi denetle ve Trust Score hesapla:\n${JSON.stringify(supplier, null, 2)}`,
      {
        systemInstruction: AUDITOR_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trustScore: { type: Type.NUMBER, description: "0-100 arası güven puanı" },
            explanation: { type: Type.STRING, description: "Açıklanabilir Güven Skoru Raporu (Puanın nedeni)" },
            riskLevel: { type: Type.STRING, description: "LOW, MEDIUM, HIGH, CRITICAL" },
            certificationStatus: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  status: { type: Type.STRING, description: "VALID, EXPIRED, SUSPICIOUS, NOT_FOUND" },
                  note: { type: Type.STRING },
                },
              },
            },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["trustScore", "riskLevel", "certificationStatus"],
        },
        maxOutputTokens: budget.maxTokens,
        temperature: 0.1, // Çok düşük — denetim kararlı olmalı
        complexity: 'routine'
      },
      'auditorAgent.auditSupplier'
    );

    const tokensUsed = usageMetadata?.totalTokenCount || 0;
    const costUSD = (tokensUsed / 1_000_000) * 0.075;

    const output: AgentOutput = {
      agent: "AUDITOR",
      result: resultText,
      confidence: 88,
      tokensUsed,
      costUSD,
      durationMs: Date.now() - startTime,
    };

    CostGuard.logAction({
        node_id: "aipyram-core",
        agentRole: output.agent,
        taskType: "supplier_audit",
        tokensUsed: output.tokensUsed || 0,
        costUSD: output.costUSD || 0,
        durationMs: output.durationMs || 0,
        success: true,
        supplierId: supplier.supplierId
    });

    return output;
  } catch (error: any) {
    console.error("[AUDITOR AGENT] Denetim hatası:", error.message);
    return { agent: "AUDITOR", result: "{}", confidence: 0, tokensUsed: 0, costUSD: 0, durationMs: Date.now() - startTime };
  }
}
