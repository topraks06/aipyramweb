import { alohaAI } from './aiClient';
import { adminDb } from '@/lib/firebase-admin';
import { TerminalArticle } from './terminalPayloadBuilder';

// Interfaces for Think Layer outputs
export interface CausalityStep {
  step: string;
  impact: string;
  delay: string; 
}

export interface Scenario {
  name: 'Bull' | 'Base' | 'Bear';
  probability: number;
  description: string;
}

export interface TradeSignal {
  action: 'WAIT' | 'BUY' | 'SELL' | 'SHIFT' | 'DELAY_BUY';
  asset: string;
  confidence: number;
  reasoning: string;
}

export interface TimeHorizon {
  immediate: string;
  tactical: string;
  strategic: string;
}

export interface DecisionEngineOutput {
  causality_chain: CausalityStep[];
  scenarios: Scenario[];
  trade_signal: TradeSignal;
  time_horizon: TimeHorizon;
}

/**
 * THINK LAYER: Causality & Decision Engine
 * Veriyi anlamlandırır ve B2B karar mekanizmasına dönüştürür.
 */
export async function generateDecisions(heroArticle: TerminalArticle | null, tickerData: any): Promise<DecisionEngineOutput> {
  const defaultOutput: DecisionEngineOutput = {
    causality_chain: [
      { step: 'Data Stable', impact: 'Market Stable', delay: '0-7 days' }
    ],
    scenarios: [
      { name: 'Base', probability: 0.6, description: 'Market continues current trajectory' }
    ],
    trade_signal: { action: 'WAIT', asset: 'general', confidence: 50, reasoning: 'Insufficient data for strong signal' },
    time_horizon: { immediate: 'Monitor', tactical: 'Hold inventory', strategic: 'Review next quarter' }
  };

  if (!heroArticle) return defaultOutput;

  try {
    console.log(`[THINK LAYER] 🧠 Causality & Decision Engine çalışıyor...`);
    const ai = alohaAI.getClient();
    const prompt = `
    Sen dünyanın en ileri düzey B2B Tekstil ve Emtia Karar Motorusun (Causality & Decision Engine).
    Görevin verilen piyasa haberi ve canlı verilerden 'Neden-Sonuç' zinciri kurmak ve trading aksiyonu öngörmektir.
    
    HABER İÇERİĞİ:
    Başlık: ${heroArticle.title}
    Özet: ${heroArticle.summary || heroArticle.content?.substring(0, 500) || ''}
    Görüş: ${heroArticle.commercial_note || ''}
    
    AŞAĞIDAKİ JSON FORMATINDA TAM OLARAK DÖNDÜR:
    {
      "causality_chain": [
        { "step": "Olay (örn: Cotton ↑)", "impact": "Sonuç (örn: Cost ↑)", "delay": "Tahmini Gecikme (örn: 0-7 days)" }
      ],
      "scenarios": [
        { "name": "Bull", "probability": 0.3, "description": "İyimser senaryo" },
        { "name": "Base", "probability": 0.5, "description": "Ana senaryo" },
        { "name": "Bear", "probability": 0.2, "description": "Kötümser senaryo" }
      ],
      "trade_signal": {
        "action": "WAIT | BUY | SELL | SHIFT | DELAY_BUY",
        "asset": "Etkilenen ana emtia veya ürün (örn: cotton, polyester)",
        "confidence": 0-100,
        "reasoning": "Tek cümlelik gerekçe"
      },
      "time_horizon": {
        "immediate": "0-7 gün için tek cümle",
        "tactical": "7-60 gün için tek cümle",
        "strategic": "60-180 gün için tek cümle"
      }
    }
    SADECE GEÇERLİ JSON DÖNDÜR. (Causality chain min 3 adım olmalı)
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.2 },
    });

    const jsonText = result.text || '{}';
    const parsed = JSON.parse(jsonText);
    
    // Asenkron olarak prediction'ı kaydet (Feedback loop için)
    await recordPrediction(parsed.trade_signal, heroArticle.id);

    console.log(`[THINK LAYER] ✅ Decision Engine kararı: ${parsed.trade_signal?.action} (${parsed.trade_signal?.asset})`);
    
    return parsed as DecisionEngineOutput;
  } catch (err) {
    console.error('[THINK LAYER] ❌ Hata:', err);
    return defaultOutput;
  }
}

async function recordPrediction(signal: TradeSignal, contextualArticleId: string) {
  if (!adminDb || !signal) return;
  try {
    await adminDb.collection('aloha_predictions').add({
      asset: signal.asset || 'general',
      predicted_action: signal.action || 'WAIT',
      confidence: signal.confidence || 50,
      reasoning: signal.reasoning || '',
      context_article_id: contextualArticleId,
      status: 'pending', // ileride "correct" veya "wrong" olarak güncellenecek
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    // Session tracking fire & forget
  }
}
