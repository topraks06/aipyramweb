import { AgentOutput } from "../agents/types";

export interface HandshakePayload {
  sourceAgent: string;
  targetAgent: string;
  data: any;
  accumulatedConfidence: number;
  history: Array<{ agent: string; confidence: number; action: string }>;
}

/**
 * MULTI-AGENT ORCHESTRATION (MAO) HANDSHAKE PROTOCOL
 * Kurumsal Dev (Salesforce Stili) Agent-to-Agent Güvenlik Kilit Mekanizması.
 */
export class HandshakeProtocol {
  /**
   * İki ajan arasında veri paslarken kümülatif güven şemasını ölçer.
   * Eğer toplam güven skoru belirlenen limiti (örn: %90) aşamıyorsa işlem "Self-Correction"a gönderilir.
   */
  static async transfer(
    currentOutput: AgentOutput,
    targetAgentTask: string,
    existingHandshake?: HandshakePayload
  ): Promise<HandshakePayload> {
    
    const confidence = currentOutput.confidence || 0;
    
    let handshake: HandshakePayload = existingHandshake || {
      sourceAgent: "ALOHA",
      targetAgent: currentOutput.agent,
      data: {},
      accumulatedConfidence: 100, // Baslangic %100
      history: []
    };

    // Accumulated Confidence is a multiplicative probability of successive agent validities,
    // Or we simply average them depending on business logic. 
    // Here we use an averging method for 'total confidence' or strict minimum.
    // Let's use strict minimum: The chain is only as strong as its weakest link.
    const strictConfidence = Math.min(handshake.accumulatedConfidence, confidence);

    handshake.history.push({
      agent: currentOutput.agent,
      confidence: confidence,
      action: targetAgentTask
    });

    handshake.accumulatedConfidence = strictConfidence;
    handshake.sourceAgent = currentOutput.agent;

    console.log(`[🤝 HANDSHAKE] ${currentOutput.agent} -> Output: Güven Skoru: %${confidence}. Kümülatif Sistem Güveni: %${strictConfidence}`);

    // Self-Correction Döngüsü Kırılımı ( %90 Altı İade Şartı )
    if (strictConfidence < 90) {
      console.warn(`[⚠️ HANDSHAKE REJECTED] Zincirleme Güven Oranı Yetersiz! (%${strictConfidence} < %90)`);
      throw new Error(`SelfCorrectionTriggered: İşlem kalitesi kurumsal standartların altında. Ajan (${currentOutput.agent}) yeterli güvene sahip değil. İyileştirme döngüsüne dön!`);
    }

    return handshake;
  }
}
