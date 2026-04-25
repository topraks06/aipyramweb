import { Schema, Type } from "@google/genai";
import { EventBus } from "../events/eventBus";
import { addKnowledge } from "./rag";
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import

/**
 * APEX NOTIFICATION & INTELLIGENCE ENGINE (V8.4 - FLYWHEEL EDITION)
 * Faz 4.3 / Kendi Kendini Eğiten Yapı
 * Özellikler: Dual-Signal (Success/Fail) Listening, Vector Memory, Cross-Node Intelligence
 */

const ai = alohaAI.getClient();

const FLYWHEEL_PROMPT = `Sen 15 B2B sektörüne (Örn: Tekstil, Gayrimenkul) hakim bir "Stratejist Dehası" ve İş Zekası (BI) ajanısın.
GÖREV:
Aşağıdaki Otonom B2B operasyonunun (Başarı veya Başarısızlık) röntgenini çek. Anlaşmanın anatomisini çıkararak Matchmaker ajanı için gelecekteki işlemlerde kullanılmak üzere pragmatik bir "Gelişim Filtresi" üret.

KURALLAR:
1. Müşteri psikolojisi, fiyat hassasiyeti ve operasyonel hatalar (varsa) açısından değerlendir.
2. Bu işlem tek bir sektörden gelse de, çıkarılan stratejinin diğer 15 sektöre (Emlak vb.) uygulanabilir olup olmadığını (isGlobal) "true/false" olarak belirt.
3. Öğrenilen stratejiyi en fazla 3 maddelik, hedef odaklı, Brutalist B2B diliyle özetle. (Satış personeline verilen katı askeri direktifler gibi).
4. Asla genel geçer cümleler kurma; spesifik parametrelere dayalı somut kurallar koy.

JSON formatında dön. { "category": "market_insight" | "supplier_strength" | "pricing_strategy" | "fatal_error", "insight": "Öğrenilen ders paragrafı (3 madde)", "isGlobal": boolean }
`;

export class KnowledgeFlywheel {
  static initialize() {
    console.log("[🧠 FLYWHEEL] V8.4 Zeka Çarkı Kuruldu. Başarı ve Başarısızlıktan (Dual-Signal) Ders Çıkarılacak.");

    // DUAL-SIGNAL LISTENING: Başarı durumları
    EventBus.subscribe("DEAL_COMPLETED", async (event) => this.analyzeDeal(event, "SUCCESS"));

    // DUAL-SIGNAL LISTENING: Hata / Red durumları (Negative Learning)
    EventBus.subscribe("DEAL_FAILED", async (event) => this.analyzeDeal(event, "FAIL"));
    EventBus.subscribe("QUOTATION_REJECTED", async (event) => this.analyzeDeal(event, "REJECTED"));
  }

  private static async analyzeDeal(event: any, outcome: "SUCCESS" | "FAIL" | "REJECTED") {
     const payload = event.payload;
     const node = event.node_id || "aipyram-core";
     const id = payload?.rfqId || payload?.dealId || "unknown";

     console.log(`[🧠 FLYWHEEL] Tecrübe Madenciliği Başladı (Sonuç: ${outcome}) | ID: ${id}`);

     try {
       const docText = `
       İŞLEM SONUCU: ${outcome}
       ALICI TALEBİ (RFQ): ${JSON.stringify(payload?.rfqData || payload?.rfq || {})}
       HEDEFLENEN TEDARİKÇİ: ${payload?.companyName || "Bilinmiyor"}
       GÜVEN SKORU: ${payload?.trustScore || "Bilinmiyor"}
       TAHMİNİ DEĞER: ${payload?.estimatedPrice || payload?.estimatedValue || "Belirsiz"}
       EK DETAYLAR (Eğer başarısızsa hata sebebi): ${payload?.reason || payload?.errorMessage || "Reddedilme veya iptal"}
       `;

       // 1. STRATEGIC SYNTHESIS (Gemini Zekası)
       const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: docText,
          config: {
            systemInstruction: FLYWHEEL_PROMPT,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                insight: { type: Type.STRING },
                isGlobal: { type: Type.BOOLEAN, description: "Tüm AIPyram domainlerinde geçerli genel ticari refleks mi?" }
              },
              required: ["category", "insight", "isGlobal"]
            },
            temperature: 0.1
          }
       });

       const raw = response.text;
       if (!raw) return;

       const parsed = JSON.parse(raw);

       // 2. VECTOR MEMORY (Semantic Embedding Oluşturulması)
       console.log(`[🧠 FLYWHEEL] Ders çıkarıldı: ${parsed.category}. Semantic Vector Embedding (Vertex AI) üretiliyor...`);
       
       let vectorEmbedding: number[] = [];
       try {
           const embedding = await alohaAI.generateEmbedding(parsed.insight, 'flywheel_memory');
           if (embedding) vectorEmbedding = embedding;
       } catch (embedError) {
           console.warn(`[🧠 FLYWHEEL UYARI] Vektör üretilemedi. Düz metin olarak mühürleniyor.`, embedError);
       }

       // 3. RAG / FIRESTORE MÜHÜRLEME (Cross-Node Intelligence)
       await addKnowledge(
         node, 
         parsed.category || (outcome === "SUCCESS" ? "successful_tactic" : "fatal_error"), 
         parsed.insight, 
         id,
         vectorEmbedding,
         parsed.isGlobal
       );

       const logPrefix = parsed.isGlobal ? "[GLOBAL STRATEGY]" : `[${node.toUpperCase()} SPECIFIC]`;
       console.log(`[🧠 FLYWHEEL] ${logPrefix} Yeni Sektörel İstihbarat Düğümü Firestore'a Mühürlendi.`);

     } catch (err) {
       console.error(`[🚨 FLYWHEEL ERROR] Akıl Çıkarma İşlemi Çöktü:`, err);
     }
  }
}

/**
 * recordMemory — Dış modüller (postMortemAgent, deals/feedback, suppliers/audit) tarafından kullanılır.
 * KnowledgeFlywheel'ın RAG katmanına doğrudan veri yazar.
 */
export async function recordMemory(params: {
  node_id: string;
  source: string;
  text: string;
  agentId: string;
  metadata?: any;
}) {
  try {
    await addKnowledge(
      params.node_id,
      params.source,
      params.text,
      params.agentId,
      [],
      false
    );
    console.log(`[🧠 MEMORY] ${params.source} kaydedildi (${params.node_id})`);
  } catch (e) {
    console.warn(`[🧠 MEMORY] Kayıt başarısız:`, e);
  }
}
