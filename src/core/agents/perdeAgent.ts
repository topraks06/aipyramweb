import { Schema, Type } from "@google/genai";
import { EventBus } from '../events/eventBus';
import { AIPyramEvent } from '../events/eventTypes';
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { feedCache } from '../cache/feedCache';

const ai = alohaAI.getClient();

const PERDE_BRAND_DNA = {
  tone: "technical, architectural, spatial, sales-driven",
  avoid: ["cheap decor", "vague", "emotional fluff", "non-technical terms"],
  style: "High-end 3D Rendering Engine meets Interior Architectural Firm. Precise fabric specs."
};

class PerdeAgent {
  private isInitialized = false;

  constructor() {
    console.log('[🛋️✨ Perde.ai Agent] 3D Doku ve Render Motoru Otonomisi Başladı.');
  }

  public init() {
    if (this.isInitialized) return;
    EventBus.subscribe('NEW_TREND_DETECTED', this.handleSpatialIntelligence.bind(this));
    this.isInitialized = true;
    console.log('[🛋️✨ Perde.ai Agent] Bayi Satış Ağı (Spatial) EventBus Sinyallerine Bağlandı.');
  }

  private async handleSpatialIntelligence(event: AIPyramEvent) {
    if (event.source === 'agent' || event.source === 'perde') return;
    console.log(`[🛋️✨ Perde] Render Sinyali Analizi: ${event.payload?.trend}`);

    const rawSignal = event.payload?.trend || 'Genel Mekan İhtiyacı';
    
    try {
      // 1. SCENE ARCHITECT (Designs the 3D interior logic)
      console.log('[🛋️✨ Perde] 1/3 Kumaş & Işık Fiziği Hesaplanıyor...');
      let draft = await this.runFabricPhysics(rawSignal);
      
      // 2. SALES EDITOR (Translates tech specs into B2B sales prompts)
      console.log('[🛋️✨ Perde] 2/3 Bayi Satış Kodlaması...');
      let finalContent = await this.runSalesArchitect(draft);
      
      // 3. RENDER GUARD
      console.log('[🛋️✨ Perde] 3/3 Render Guard Denetimi...');
      const isValid = this.validateRenderData(finalContent);

      if (!isValid) {
        console.warn('[🛋️✨ Perde] ⚠️ Render Guard: Hatalı kumaş verisi. Fallback.');
        finalContent = this.getFallbackData(rawSignal);
      }

      // 4. SONUÇ YAYINI (CACHE)
      const formatted = this.formatForPerdeStudio(finalContent);
      await feedCache.setFeed('perde', formatted);
      console.log('[🛋️✨ Perde] perde.ai yayınlandı (Studio Güncellendi).');

    } catch (err: any) {
      console.error('[🛋️✨ Perde] ❌ Render Alarmı:', err);
      const fallback = this.getFallbackData(rawSignal);
      feedCache.setFeed('perde', this.formatForPerdeStudio(fallback));
    }
  }

  private async runFabricPhysics(rawSignal: string) {
    if (!process.env.GEMINI_API_KEY) return this.getFallbackData(rawSignal);
  
    const prompt = `
      You are the Chief Fabric Engineer for Perde.ai (A 3D Curtain Rendering Platform).
      Market Signal: ${rawSignal}.
      Determine the optimum fabric properties for this trend.
      JSON Format strictly:
      {
        "fabricName": "Fabric type",
        "opacity": "10% to 100%",
        "drape": "soft/stiff",
        "bestRoom": "living_room/bedroom"
      }
    `;
    
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(res.text || '{}');
  }

  private async runSalesArchitect(draft: any) {
    if (!process.env.GEMINI_API_KEY) return this.getFallbackData('Spatial Trend');

    const prompt = `
      You are the B2B Studio Sales Architect at Perde.ai.
      Brand DNA: ${PERDE_BRAND_DNA.style}
      Tone: ${PERDE_BRAND_DNA.tone}
      
      Turn these physical properties into a "Ready-to-Render" high-conversion gallery set for textile retailers.
      Physics Data: ${JSON.stringify(draft)}
      
      Strict JSON Schema for Perde Studio UI:
      {
        "studioTitleTr": "Vitrinin Türkçe Adı",
        "studioTitleEn": "Gallery English Name",
        "lightingPreset": "MORNING_SUN | MOODY_EVENING | NEUTRAL_STUDIO",
        "catalogs": [
          { "id": "1", "nameTr": "Katalog 1", "promptTr": "Render istemi (komut)", "promptEn": "Render prompt" },
          { "id": "2", "nameTr": "Katalog 2", "promptTr": "Render istemi", "promptEn": "Render prompt" }
        ],
        "salesPitchTr": "Bayi için satış cümlesi",
        "salesPitchEn": "B2B pitch"
      }
    `;

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(res.text || '{}');
  }

  private validateRenderData(data: any): boolean {
    if (!data.studioTitleTr || !data.studioTitleEn) return false;
    if (!Array.isArray(data.catalogs) || data.catalogs.length === 0) return false;
    if (!data.lightingPreset) return false;
    return true;
  }

  private getFallbackData(signal: string) {
    return {
      studioTitleTr: `Otonom Doku: ${signal}`,
      studioTitleEn: `Autonomous Tex: ${signal}`,
      lightingPreset: "NEUTRAL_STUDIO",
      catalogs: [
        { id: "1", nameTr: "Standart Işık Geçirgen", promptTr: "Modern tül perde, gün ışığı", promptEn: "Modern sheer curtain, daylight" },
        { id: "2", nameTr: "Yoğun Karartma", promptTr: "Siyah blackout, lüks otel", promptEn: "Blackout, luxury hotel room" }
      ],
      salesPitchTr: "AIPyram tarafından otomatik üretilmiş garantili satış senaryosu.",
      salesPitchEn: "AIPyram guaranteed auto-generated sales pitch."
    };
  }

  private formatForPerdeStudio(finalContent: any) {
    return {
      studio: {
        titleTr: finalContent.studioTitleTr,
        titleEn: finalContent.studioTitleEn,
        pitchTr: finalContent.salesPitchTr,
        pitchEn: finalContent.salesPitchEn,
        preset: finalContent.lightingPreset
      },
      renderOptions: finalContent.catalogs.map((c: any) => ({
        id: c.id,
        nameTr: c.nameTr,
        renderCommandTr: c.promptTr,
        renderCommandEn: c.promptEn,
        icon: 'fabric'
      })),
      timestamp: Date.now()
    };
  }
}

export const perdeAgent = new PerdeAgent();
