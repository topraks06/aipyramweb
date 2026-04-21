import { EventBus } from '../events/eventBus';
import { AIPyramEvent } from '../events/eventTypes';
import { GoogleGenAI } from '@google/genai';
import { feedCache } from '../cache/feedCache';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });

const BRAND_DNA = {
  tone: "luxury, minimal, editorial, visionary",
  avoid: ["cheap", "discount", "fast fashion", "sale", "clickbait", "emoji", "exclamation marks"],
  style: "Maison & Objet meets Bloomberg Intelligence. High-end architectural vocabulary."
};

class HometexAgent {
  private isInitialized = false;

  constructor() {
    console.log('[🛋️ Hometex Agent] Otonom Tasarım ve Sergileme Zekası Uyanıyor.');
  }

  public init() {
    if (this.isInitialized) return;
    EventBus.subscribe('NEW_TREND_DETECTED', this.handleNewTrend.bind(this));
    this.isInitialized = true;
    console.log('[🛋️ Hometex Agent] EventBus bağlandı. Brand DNA Yüklendi.');
  }

  private async handleNewTrend(event: AIPyramEvent) {
    if (event.source === 'agent' || event.source === 'hometex') return;
    console.log(`[AGENT] Hometex Pipeline Tetiklendi. Konu: ${event.payload?.trend}`);

    const rawSignal = event.payload?.trend || 'Genel Tekstil Kapsamı';
    
    try {
      // 1. VISIONARY AI (Creates raw concepts)
      console.log('[AGENT] 1/3 Visionary Düşünüyor...');
      let visionaryDraft = await this.runVisionary(rawSignal);
      
      // 2. EDITOR AI (Refines tone to Brand DNA)
      console.log('[AGENT] 2/3 Editor Düzeltiyor...');
      let finalContent = await this.runEditor(visionaryDraft);
      
      // 3. EDITORIAL GUARD (Structural Validation)
      console.log('[AGENT] 3/3 Editorial Guard Kontrol Ediyor...');
      const isValid = this.validateEditorial(finalContent);

      if (!isValid) {
        console.warn('[AGENT] ⚠️ Guard Reddedildi. Fallback İçerik Yükleniyor.');
        finalContent = this.getFallbackData(rawSignal);
      }

      // 4. SONUÇ YAYINI (CACHE)
      const formatted = this.formatForLuxuryUI(finalContent);
      feedCache.setFeed('hometex', formatted);
      console.log('[AGENT] hometex güncellendi');
      console.log('[CACHE] updated');

    } catch (err: any) {
      console.error('[AGENT] ❌ Kırmızı Alarm:', err);
      const fallback = this.getFallbackData(rawSignal);
      feedCache.setFeed('hometex', this.formatForLuxuryUI(fallback));
    }
  }

  private async runVisionary(rawSignal: string) {
    if (!process.env.GEMINI_API_KEY) return this.getFallbackData(rawSignal);
  
    const prompt = `
      You are the Visionary Director for a Virtual Exhibition Platform.
      Theme: ${rawSignal}.
      Generate a conceptual draft in JSON format:
      {
        "heroTitleEn": ["WORD1", "WORD2", "WORD3"],
        "heroTitleTr": ["KELİME1", "KELİME2", "KELİME3"],
        "heroSubtitle": "Concept sentence.",
        "conceptName": "Trend Name",
        "trend1": "First trend detail",
        "trend2": "Second trend detail"
      }
    `;
    
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(res.text || '{}');
  }

  private async runEditor(draft: any) {
    if (!process.env.GEMINI_API_KEY) return this.getFallbackData('Drafting');

    const prompt = `
      You are the Strict Editor-in-Chief.
      Brand DNA: Tone: ${BRAND_DNA.tone}. Avoid: ${BRAND_DNA.avoid.join(', ')}. Style: ${BRAND_DNA.style}.
      
      Refine this draft into architectural, high-end editorial copy in both English and Turkish:
      ${JSON.stringify(draft)}
      
      Output strictly matching this JSON schema:
      {
        "hero": {
          "titleTr": ["LÜKS", "FÜTÜRİST", "SERGİ"],
          "titleEn": ["LUXURY", "FUTURE", "EXHIBITION"],
          "subtitleTr": "...",
          "subtitleEn": "..."
        },
        "trends": [
          { "id": "t1", "topicTr": "...", "topicEn": "...", "descTr": "...", "descEn": "..." },
          { "id": "t2", "topictTr": "...", "topicEn": "...", "descTr": "...", "descEn": "..." }
        ],
        "collection": {
          "nameTr": "...",
          "nameEn": "...",
          "commentaryTr": "...",
          "commentaryEn": "...",
          "tags": ["...", "..."]
        }
      }
    `;

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(res.text || '{}');
  }

  private validateEditorial(data: any): boolean {
    if (!data.hero?.titleTr || !data.hero?.titleEn) return false;
    if (data.hero.titleTr.length < 2) return false;
    
    // Alt başlık çok uzun veya saçmaysa
    if (data.hero.subtitleTr && data.hero.subtitleTr.length > 150) return false;
    
    // Trend dizisi bozuksa
    if (!Array.isArray(data.trends) || data.trends.length < 2) return false;
    
    // Boş içerik kontrolü
    if (!data.trends[0].topicTr || data.trends[0].topicTr.length < 3) return false;

    return true;
  }

  private getFallbackData(signal: string) {
    return {
      hero: {
        titleTr: ['YAPAY ZEKA', 'OTONOM', 'FUAR'],
        titleEn: ['AI DRIVEN', 'AUTONOMOUS', 'FAIR'],
        subtitleTr: `AIPyram Editorial Bot: Lüks pazar standartlarında "${signal}" teması işleniyor.`,
        subtitleEn: `AIPyram Editorial Bot curating the "${signal}" theme for luxury markets.`
      },
      trends: [
        { id: 't1', topicTr: 'Minimalizm', topicEn: 'Minimalism', descTr: 'Mekansal arınma.', descEn: 'Spatial purification.' },
        { id: 't2', topicTr: 'Organik Doku', topicEn: 'Organic Texture', descTr: 'Doğal bağlantılar.', descEn: 'Natural connections.' }
      ],
      collection: {
        nameTr: 'Otonom Küratör Seçkisi',
        nameEn: 'Autonomous Curator Selection',
        commentaryTr: 'Sektörel analiz metrikleri.',
        commentaryEn: 'Industry analysis metrics.',
        tags: ['LUXURY', 'ARCHITECTURAL']
      }
    };
  }

  private formatForLuxuryUI(finalContent: any) {
    return {
      hero: {
        titleTr: finalContent.hero?.titleTr,
        titleEn: finalContent.hero?.titleEn,
        subtitleTr: finalContent.hero?.subtitleTr,
        subtitleEn: finalContent.hero?.subtitleEn,
        image: 'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?w=1600&q=80'
      },
      trends: {
        headerTr: 'Haftanın Moda Zekası',
        headerEn: 'AI Fashion Trends',
        cards: finalContent.trends.map((t: any, i: number) => ({
          id: t.id || "trend-" + i,
          nameTr: t.topicTr || t.topictTr,
          nameEn: t.topicEn,
          descTr: t.descTr,
          descEn: t.descEn,
          img: i === 0 
            ? 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800&q=80'
            : 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&q=80',
          score: 98 - i*3,
          badge: i === 0 ? 'VİRAL' : 'PREMİUM',
          badgeEn: i === 0 ? 'VIRAL' : 'PREMIUM',
          reasonTr: 'Global Pazar Analizi',
          reasonEn: 'Global Market Analysis'
        }))
      },
      collections: {
        headerTr: 'Özel Zeka Seçkisi',
        headerEn: 'Exclusive AI Curation',
        items: [
          {
            id: 'c1',
            name_tr: finalContent.collection?.nameTr,
            name_en: finalContent.collection?.nameEn,
            ai_commentary_tr: finalContent.collection?.commentaryTr,
            ai_commentary_en: finalContent.collection?.commentaryEn,
            trend_score: 99,
            is_trending: true,
            cover_image_url: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=800&q=80',
            style_tags: finalContent.collection?.tags
          }
        ]
      },
      fairs: [],
      showrooms: [ 
        { id: 's1', name: 'AIPyram SuperNode', location: 'Virtual Hub', is_featured: true },
        { id: 's2', name: 'Zeka Düğümleri', location: 'Digital', is_featured: false }
      ]
    };
  }
}

export const hometexAgent = new HometexAgent();
