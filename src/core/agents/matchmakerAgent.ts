import { Schema, Type } from "@google/genai";
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { AgentOutput, AgentBudget, DEFAULT_BUDGET } from "./types";

// ═══════════════════════════════════════════════════════════════
// MATCHMAKER AGENT — RFQ → Tedarikçi Eşleştirme → Komisyon
// AIPYRAM Revenue Engine #1
// ═══════════════════════════════════════════════════════════════

// Removed raw ai client
const MATCHMAKER_PROMPT = `Sen AIPYRAM ekosisteminin Matchmaker Ajanısın — global ev tekstili B2B ticaretinin 30 yıllık sektör deneyimine sahip dijital eşleştirme zekası.

🎯 GÖREVİN:
Gelen RFQ verilerini analiz et, tedarikçi kütüphanesini tara ve eşleştir.

🧠 ZORUNLU EŞLEŞTİRME MATEMATİĞİ (Kritik):
Final "matchScore" hesaplanırken ŞU FORMÜLÜ BİREBİR KULLANACAKSIN:
match_score = (product_and_price_fit_score * 0.4) + (supplier_trust_score * 0.6)

Adımlar:
1. Sadece product/fiyat/lojiğinge bakarak 0-100 arası bir "Fit Score" belirle.
2. Tedarikçinin sistemdeki "trustScore" değerini al (Eğer 50'nin altındaysa DİREKT REDDET, listeye alma).
3. Yukarıdaki formüle göre final match_score değerini hesapla.

🚫 KURALLAR:
- ASLA sahte/uydurma tedarikçi UYDURMA
- Eşleşme bulunamazsa "NO_MATCH" döndür
- Trust Score'u 50'nin altındaki tedarikçileri önerme
- Türkçe yanıt ver, teknik terimleri İngilizce bırak

📊 ÇIKTI: Her zaman yapılandırılmış JSON döndür.`;

export interface RFQData {
  id: string;
  buyerRegion: string;
  buyerType: string;
  product: string;
  quantity: string;
  requirements: string[];
  urgency: "High" | "Medium" | "Low";
  targetPrice?: string;
  leadScore?: number;
  buyerIntent?: string;
}

export interface SupplierData {
  id: string;
  companyName: string;
  region: string;
  products: string[];
  certifications: string[];
  moq: string;
  leadTime: string;
  trustScore: number;
}

export interface MatchResult {
  supplierId: string;
  companyName: string;
  matchScore: number;
  reasons: string[];
  estimatedPrice?: string;
  deliveryEstimate?: string;
}

/**
 * RFQ ile tedarikçileri eşleştirir.
 * Cost Control: maxTokens ve maxCostUSD limitleri uygulanır.
 */
export async function matchSupplierWithRFQ(
  rfq: RFQData,
  suppliers: SupplierData[],
  budget: AgentBudget = { ...DEFAULT_BUDGET }
): Promise<AgentOutput> {
  const startTime = Date.now();

  // KILL SWITCH CHECK
  if (budget.killSwitch) {
    return {
      agent: "MATCHMAKER",
      result: JSON.stringify({ error: "KILL_SWITCH_ACTIVE", matches: [] }),
      confidence: 0,
      tokensUsed: 0,
      costUSD: 0,
      durationMs: 0,
    };
  }

  // STEP LIMIT CHECK
  if (budget.currentSteps >= budget.maxSteps) {
    return {
      agent: "MATCHMAKER",
      result: JSON.stringify({ error: "MAX_STEPS_EXCEEDED", matches: [] }),
      confidence: 0,
      tokensUsed: 0,
      costUSD: 0,
      durationMs: Date.now() - startTime,
    };
  }

  try {
    const prompt = `
      Alıcı RFQ (Alım Talebi):
      ${JSON.stringify(rfq, null, 2)}

      Mevcut Tedarikçiler:
      ${suppliers.length > 0 ? JSON.stringify(suppliers, null, 2) : "Henüz kayıtlı tedarikçi yok. Genel bir analiz yap ve ideal tedarikçi profilini çıkar."}

      Görevi yerine getir: En uygun 3 tedarikçiyi bul ve puanla.
      Eğer hiç uygun tedarikçi yoksa, NO_MATCH döndür ve neden uygun bulunamadığını açıkla.
    `;

    const { text: resultText, usageMetadata } = await alohaAI.generate(
      prompt,
      {
        systemInstruction: MATCHMAKER_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: "MATCHED veya NO_MATCH" },
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  supplierId: { type: Type.STRING },
                  companyName: { type: Type.STRING },
                  matchScore: { type: Type.NUMBER, description: "0-100 arası" },
                  reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
                  estimatedPrice: { type: Type.STRING },
                  deliveryEstimate: { type: Type.STRING },
                },
              },
            },
            idealProfile: { type: Type.STRING, description: "Eşleşme bulunamazsa ideal tedarikçi profili" },
            marketInsight: { type: Type.STRING, description: "Piyasa değerlendirmesi" },
          },
          required: ["status", "matches"],
        },
        maxOutputTokens: budget.maxTokens,
        temperature: 0.3, // Düşük — eşleştirme kararlı olmalı
        complexity: 'routine'
      },
      'matchmakerAgent.matchSupplierWithRFQ'
    );

    const tokensUsed = usageMetadata?.totalTokenCount || 0;
    // Gemini Flash yaklaşık maliyet: $0.075 / 1M token
    const costUSD = (tokensUsed / 1_000_000) * 0.075;

    return {
      agent: "MATCHMAKER",
      result: resultText,
      confidence: 85,
      tokensUsed,
      costUSD,
      durationMs: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error("[MATCHMAKER AGENT] Eşleştirme hatası:", error.message);
    return {
      agent: "MATCHMAKER",
      result: JSON.stringify({ error: error.message, matches: [] }),
      confidence: 0,
      tokensUsed: 0,
      costUSD: 0,
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Canlı RFQ'lar üretir (demo / pazar simülasyonu).
 * Production'da bu Firestore'dan gelecek.
 */
export async function generateLiveRFQs(
  budget: AgentBudget = { ...DEFAULT_BUDGET }
): Promise<AgentOutput> {
  const startTime = Date.now();

  if (budget.killSwitch) {
    return { agent: "MATCHMAKER", result: "[]", confidence: 0, tokensUsed: 0, costUSD: 0, durationMs: 0 };
  }

  try {
    const prompt = `
      Sen global ev tekstili B2B piyasasının nabzını tutan bir istihbarat ajanısın.
      Gerçekçi, detaylı ve GÜNCEL 4 adet RFQ (Alım Talebi) üret.
      
      Kurallar:
      - Gerçekçi alıcı profilleri (otel zinciri, perakendeci, toptancı, butik)
      - Teknik gereksinimler (OEKO-TEX, Trevira CS, Martindale, GSM)
      - Avrupa, Ortadoğu, Kuzey Amerika, İskandinavya bölgelerinden
      - İçerik TÜRKÇE olmalı
      - Tarih: Nisan 2026
    `;

    const { text: resultText, usageMetadata } = await alohaAI.generate(
      prompt,
      {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              buyerRegion: { type: Type.STRING },
              buyerType: { type: Type.STRING },
              product: { type: Type.STRING },
              quantity: { type: Type.STRING },
              requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              urgency: { type: Type.STRING },
              targetPrice: { type: Type.STRING },
              postedMinutesAgo: { type: Type.NUMBER },
              leadScore: { type: Type.NUMBER, description: "0-100 arası kurumsal potansiyel tahmini" },
              buyerIntent: { type: Type.STRING, description: "TEST, LOW_INTENT, HIGH_INTENT, VERIFIED" },
            },
          },
        },
        maxOutputTokens: budget.maxTokens,
        temperature: 0.7,
        complexity: 'routine'
      },
      'matchmakerAgent.generateLiveRFQs'
    );

    const tokensUsed = usageMetadata?.totalTokenCount || 0;
    const costUSD = (tokensUsed / 1_000_000) * 0.075;

    return {
      agent: "MATCHMAKER",
      result: resultText,
      confidence: 90,
      tokensUsed,
      costUSD,
      durationMs: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error("[MATCHMAKER] RFQ üretim hatası:", error.message);
    return { agent: "MATCHMAKER", result: "[]", confidence: 0, tokensUsed: 0, costUSD: 0, durationMs: Date.now() - startTime };
  }
}
