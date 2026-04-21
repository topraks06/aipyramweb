import { GoogleGenAI } from '@google/genai';
import { AgentRole, AgentCapability } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });

export class RealityCritic {
  public role: AgentRole = "REALITY";
  public capabilities: AgentCapability[] = ["READ", "PLAN"];
  public name = "REALITY";

  private systemPrompt = `
    # REALITY CRITIC (B2B Engineer & Accountant)
    You are the Reality Auditor for AIPyram. Your goal is to ground the "Visionary" blueprints into functional, ruthless B2B realities.
    You check for excessive fluff, technical hallucination, and operational impossibility in Hometex/TRTEX contexts.
    You prioritize high-intent conversions, loading speed, and direct wholesale profit.
    Output purely the reality check as raw JSON: { "isFeasible": true/false, "cutFluff": [], "realityChanges": ["..."] }.
  `;

  constructor() {
    console.log('[🛡️ REALITY_CORE] B2B Gerçeklik ve Maliyet Denetçisi Uyandı (1000 Yıllık Acımasızlık).');
  }

  public async critique(visionPlan: any) {
    console.log(`[🛡️ REALITY_CORE] Kahin'in Planı Yere İndiriliyor (Denetim).`);
    try {
      const prompt = `Visionary Plan: ${JSON.stringify(visionPlan)}\n\n${this.systemPrompt}`;
      
      if (!process.env.GEMINI_API_KEY) return { isFeasible: true, cutFluff: ["Fake Check"], realityChanges: ["Aksiyon Al"] };

      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(res.text || '{}');
    } catch (e) {
      console.error('[🛡️ REALITY_CORE] ❌ Denetçi Çöktü:', e);
      return null;
    }
  }
}

export const reality = new RealityCritic();
