import { EventBus } from '../events/eventBus';
import { aipyramEvent } from '../events/eventTypes';
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { feedCache } from '../cache/feedCache';
import { publishToTRTEX } from '../aloha/publishers/universal-publisher';

// Removed raw ai client
const TRTEX_BRAND_DNA = {
  tone: "brutalist, b2b wholesale, hyper-direct, aggressive intelligence",
  avoid: ["fluff", "marketing speak", "emojis", "soft language", "consumer-facing"],
  style: "Bloomberg Terminal for Turkish Textile Wholesale. High-density data, military precision."
};

class TRTEXAgent {
  private isInitialized = false;

  constructor() {
    console.log('[📈 TRTEX Agent] Brutalist Ticari Zeka Motoru Uyandı.');
  }

  public init() {
    if (this.isInitialized) return;
    EventBus.subscribe('NEW_TREND_DETECTED', this.handleMarketSignal.bind(this));
    this.isInitialized = true;
    console.log('[📈 TRTEX Agent] TRTEX Ağı (Toptan Ticaret Hattı) B2B Akışına Bağlandı.');
  }

  private async handleMarketSignal(event: aipyramEvent) {
    if (event.source === 'agent' || event.source === 'trtex') return;
    console.log(`[📈 TRTEX] Pazar Sinyali Analiz Ediliyor: ${event.payload?.trend}`);

    const rawSignal = event.payload?.trend || 'Genel Toptan Tekstil Piyasası';
    
    try {
      // 1. VISIONARY AI (Extracts B2B opportunities)
      console.log('[📈 TRTEX] 1/3 Strateji Kuruluyor...');
      let draft = await this.runStrategy(rawSignal);
      
      // 2. EDITOR AI (Forces Brutalist B2B DNA)
      console.log('[📈 TRTEX] 2/3 B2B DNA Enjeksiyonu...');
      let finalContent = await this.runWholesaleEditor(draft);
      
      // 3. EDITORIAL GUARD (Checks for fluff)
      console.log('[📈 TRTEX] 3/3 Ticari Mantık Denetimi (Guard)...');
      const isValid = this.validateB2BData(finalContent);

      if (!isValid) {
        console.warn('[📈 TRTEX] ⚠️ Terminal Guard: Metin fazla yumuşak/hatalı. Hard Fallback.');
        finalContent = this.getFallbackData(rawSignal);
      }

      // 4. SONUÇ YAYINI (CACHE)
      const formatted = this.formatForB2BTerminal(finalContent);
      await feedCache.setFeed('trtex', formatted);
      console.log('[📈 TRTEX] trtex yayınlandı (Terminal Güncellendi).');

      // 🔥 Firebase'e de yaz (TRTEX projesine sinyal gönder)
      await publishToTRTEX({ type: 'market_signal', payload: formatted }).catch(err => {
        console.warn('[📈 TRTEX] Firebase yayın hatası (kritik değil):', err);
      });

    } catch (err: any) {
      console.error('[📈 TRTEX] ❌ Kırmızı Alarm:', err);
      const fallback = this.getFallbackData(rawSignal);
      feedCache.setFeed('trtex', this.formatForB2BTerminal(fallback));
    }
  }

  private async runStrategy(rawSignal: string) {
    if (!process.env.GEMINI_API_KEY) return this.getFallbackData(rawSignal);
  
    const prompt = `
      You are the Chief Intelligence Officer for TRTEX.com (Turkey's Largest B2B Textile Wholesale Terminal).
      Raw Market Signal: ${rawSignal}.
      Extract hard B2B opportunities, supply chain shifts, and bulk sourcing strategies.
      Return strictly as JSON:
      {
        "headline": "Terminal Alert",
        "marketShift": "What changed in wholesale",
        "actionItem": "What factories should do",
        "pricingForecast": "Up or down forecast",
        "suppliersNeeded": ["Category 1", "Category 2"]
      }
    `;
    
    const { text } = await alohaAI.generate(
      prompt,
      { responseMimeType: "application/json", complexity: 'routine' },
      'trtexAgent.runStrategy'
    );
    return JSON.parse(text || '{}');
  }

  private async runWholesaleEditor(draft: any) {
    if (!process.env.GEMINI_API_KEY) return this.getFallbackData('Market Shift');

    const prompt = `
      You are the brutalist B2B Editor. 
      Brand DNA: Tone: ${TRTEX_BRAND_DNA.tone}. Avoid: ${TRTEX_BRAND_DNA.avoid.join(', ')}. Style: ${TRTEX_BRAND_DNA.style}.
      
      Rewrite the following draft into hard-hitting, extremely direct wholesale B2B intelligence data for the TRTEX UI. No fluff. Just facts and action.
      Draft: ${JSON.stringify(draft)}
      
      Output strictly JSON matching the TRTEX terminal schema:
      {
        "heroAlert": {
          "signal": "CRITICAL / VOLATILE / STEADY",
          "titleTr": "TURKISH B2B TERMINAL TITLE",
          "titleEn": "ENGLISH B2B TERMINAL TITLE",
          "impactMetric": "+24% Bulk Demand"
        },
        "intelligence": [
          { "id": "req-1", "type": "SUPPLY_CHAIN", "descTr": "Tedarik zinciri uyarısı", "descEn": "Supply chain brief", "action": "SOURCING" },
          { "id": "req-2", "type": "PRICING", "descTr": "Fiyat dalgalanması", "descEn": "Pricing brief", "action": "LIQUIDATE" }
        ],
        "topCategories": ["KUMAŞ", "İPLİK", "OTEL TEKSTİLİ"]
      }
    `;

    const { text } = await alohaAI.generate(
      prompt,
      { responseMimeType: "application/json", complexity: 'routine' },
      'trtexAgent.runWholesaleEditor'
    );
    return JSON.parse(text || '{}');
  }

  private validateB2BData(data: any): boolean {
    if (!data.heroAlert?.titleTr || !data.heroAlert?.titleEn) return false;
    if (!Array.isArray(data.intelligence) || data.intelligence.length < 2) return false;
    if (!Array.isArray(data.topCategories)) return false;
    return true;
  }

  private getFallbackData(signal: string) {
    return {
      heroAlert: {
        signal: "SYSTEM CORE",
        titleTr: `HACİM İNDEXİ: ${signal.toUpperCase()}`,
        titleEn: `VOLUME INDEX: ${signal.toUpperCase()}`,
        impactMetric: "DATA STABLE"
      },
      intelligence: [
        { id: "req-1", type: "SUPPLY", descTr: "B2B Tedarik hattı açık.", descEn: "B2B Supply line open.", action: "MONITOR" },
        { id: "req-2", type: "GLOBAL", descTr: "Toptan pazar analizi sürüyor.", descEn: "Wholesale market analysis ongoing.", action: "ANALYZE" }
      ],
      topCategories: ["YARN", "FABRIC", "HOME"]
    };
  }

  private formatForB2BTerminal(finalContent: any) {
    return {
      hero: {
        signal: finalContent.heroAlert?.signal,
        titleTr: finalContent.heroAlert?.titleTr,
        titleEn: finalContent.heroAlert?.titleEn,
        impactMetric: finalContent.heroAlert?.impactMetric
      },
      intelligenceNews: finalContent.intelligence.map((i: any) => ({
        id: i.id,
        type: i.type,
        descTr: i.descTr,
        descEn: i.descEn,
        actionCode: i.action
      })),
      hotCategories: finalContent.topCategories,
      timestamp: Date.now()
    };
  }
}

export const trtexAgent = new TRTEXAgent();
