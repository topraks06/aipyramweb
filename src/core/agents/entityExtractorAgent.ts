import { alohaAI } from '@/core/aloha/aiClient';
import { Schema, Type } from "@google/genai";

export interface SemanticEntityData {
  companies: string[];
  products: string[];
  countries: string[];
  intent: "procurement" | "supply" | "information";
}

/**
 * 🕸️ SEMANTIC ENTITY EXTRACTOR AGENT
 * Extracted entities form the basis of the Knowledge Graph (RAG 2.0).
 * Instead of embedding text, we extract exact nodes and edges.
 */
export class EntityExtractorAgent {
  private aiClient: any;

  constructor() {
    this.aiClient = alohaAI.getClient();
  }

  async extractEntities(text: string): Promise<SemanticEntityData | null> {
    console.log("🕸️ [ENTITY EXTRACTOR] Metinden semantik düğümler (nodes) çıkartılıyor...");

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        companies: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Şirket adları, marka adları veya kurumsal organizasyonlar."
        },
        products: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Tekstil ürünleri, hammaddeler veya hizmetler (örn: Blackout perde, FR İplik)."
        },
        countries: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Bahsedilen ülkeler veya pazar bölgeleri (örn: Almanya, EU, MENA)."
        },
        intent: {
          type: Type.STRING,
          enum: ["procurement", "supply", "information"],
          description: "Bu metnin amacı nedir? Mal alımı mı (procurement), satışı mı (supply), salt bilgi mi (information)?"
        }
      },
      required: ["companies", "products", "countries", "intent"]
    };

    try {
      const response = await this.aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Lütfen aşağıdaki B2B ticaret metninden kesin ve spesifik varlıkları (Entity) çıkart.\n\nMETİN:\n${text}`,
        config: {
          systemInstruction: "Sen bir Semantic Knowledge Graph (Bilgi Ağı) düğüm çıkarıcı (Entity Extractor) ajanısın. Metinden tam şirket adlarını, kesin ürün türlerini ve ülkeleri bulmalısın. Genel geçer terimleri (örn: 'kumaş') reddet, spesifik olanları (örn: 'FR döşemelik kumaş') al.",
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.1 // Deterministik sonuç
        }
      });

      if (!response.text) return null;
      return JSON.parse(response.text) as SemanticEntityData;
    } catch (error: any) {
      console.error("[EntityExtractorAgent] Error:", error.message);
      return null;
    }
  }
}

export const entityExtractorAgent = new EntityExtractorAgent();
