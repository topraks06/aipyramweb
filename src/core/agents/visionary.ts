import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { AgentRole, AgentCapability } from './types';

const ai = alohaAI.getClient();

export class VisionaryOracle {
  public role: AgentRole = "VISIONARY";
  public capabilities: AgentCapability[] = ["PLAN"];
  public name = "VISIONARY";

  private systemPrompt = `
    # VISIONARY ORACLE (1000-Year Strategic Brain)
    You are the Master Strategic Oracle for AIPyram. Your only goal is to draft boundary-pushing, ultra-luxury, high-conversion B2B blueprints.
    You ignore current technical limitations. You think in "Generations".
    Output purely the visionary blueprint as raw JSON: { "strategicPillars": [], "disruptiveIdea": "" }.
  `;

  constructor() {
    console.log('[🔮 VISIONARY_CORE] 1000 Yıllık Kahin Uyandı. Strateji Motoru Devrede.');
  }

  public async think(task: string, context?: any) {
    console.log(`[🔮 VISIONARY_CORE] Düşünme Başlıyor. Pazar Sinyali: ${task}`);
    try {
      const prompt = `Task: ${task}\nCurrent Context: ${JSON.stringify(context || {})}\n\n${this.systemPrompt}`;
      
      if (!process.env.GEMINI_API_KEY) return { strategicPillars: ["Test Strat"], disruptiveIdea: "Offline Mode" };

      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(res.text || '{}');
    } catch (e) {
      console.error('[🔮 VISIONARY_CORE] ❌ Kahin Çöktü:', e);
      return null;
    }
  }
}

export const visionary = new VisionaryOracle();
