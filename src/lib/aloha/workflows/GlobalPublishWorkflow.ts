import { adminDb } from '@/lib/firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface IngestionPayload {
  imageUrl: string;
  technicalSpecs: string;
  sourceActor: string; // e.g. "Bursa_Kumas_A.S."
}

export class GlobalPublishWorkflow {
  
  /**
   * 1. INGESTION AGENT (Gemini Vision)
   * Kumaş görselini ve teknik veriyi analiz edip JSON'a çevirir.
   */
  static async analyzeFabric(payload: IngestionPayload) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    let parts: any[] = [
      { text: `Sen Sovereign OS 'Ingestion Agent'ısın. 
Verilen teknik metni ve kumaş görselini analiz et.
Kumaşın dokusunu, desen tipini, hakim renklerini ve teknik özelliklerini JSON formatında çıkar.
Sadece JSON döndür. 
Teknik Metin: ${payload.technicalSpecs}` }
    ];

    if (payload.imageUrl && payload.imageUrl.startsWith('data:image')) {
      const base64Data = payload.imageUrl.split(',')[1];
      const mimeType = payload.imageUrl.split(';')[0].split(':')[1];
      parts.push({
        inlineData: { data: base64Data, mimeType }
      });
    }

    const result = await model.generateContent(parts);
    let rawText = result.response.text().replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
    
    return JSON.parse(rawText);
  }

  /**
   * 2. TRTex AGENT (B2B Radar Haber ve İhale)
   */
  static async createTRTexNews(fabricData: any, sourceActor: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
    Sen TRTex.com Otonom Haber Ajanısın.
    Şu kumaş verisiyle küresel B2B tekstil piyasası için profesyonel bir "Yeni Ürün İnovasyon" haberi yaz.
    Veri: ${JSON.stringify(fabricData)}
    Üretici: ${sourceActor}
    Sonuç JSON formatında olmalı: { "title": "...", "content": "...", "targetAudience": "..." }
    `;
    
    const result = await model.generateContent(prompt);
    const news = JSON.parse(result.response.text().replace(/\`\`\`json/g, '').replace(/\`\`\`/g, ''));
    
    // Firestore'a gerçek kayıt (MOCK DEĞİL)
    await adminDb.collection('trtex_news').add({
      ...news,
      fabricData,
      createdAt: new Date(),
      status: 'published'
    });
    
    return news;
  }

  /**
   * 3. HOMETEX AGENT (B2B Sanal Fuar Vitrini)
   */
  static async createHometexListing(fabricData: any) {
    // Heavy Duty kontrolü vb (Rule Engine)
    const isHeavyDuty = fabricData.martindale && fabricData.martindale >= 40000;
    
    const listing = {
      productName: fabricData.name || "Premium Geometric Jacquard",
      certifications: isHeavyDuty ? ["DIN 4102-B1", "Oeko-Tex"] : ["Oeko-Tex"],
      b2bPriceRange: "$12 - $18 / meter",
      fabricData,
      renderPrompt: `16:9 cinematic 3D render of a luxury hotel room featuring curtains made of ${fabricData.colors} geometric patterned fabric. Natural lighting, 8k resolution.`,
      createdAt: new Date(),
      status: 'active'
    };

    await adminDb.collection('hometex_products').add(listing);
    return listing;
  }

  /**
   * 4. VORHANG AGENT (B2C Almanya Perakende Satış)
   */
  static async createVorhangRetail(fabricData: any) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
    Sen Vorhang.ch Otonom Perakende Ajanısın.
    Şu kumaşı Alman son tüketiciye (B2C) satmak için Almanca ürün başlığı ve SEO uyumlu açıklama yaz.
    Veri: ${JSON.stringify(fabricData)}
    Sonuç JSON formatında: { "titleDe": "...", "descriptionDe": "..." }
    `;
    
    const result = await model.generateContent(prompt);
    const deContent = JSON.parse(result.response.text().replace(/\`\`\`json/g, '').replace(/\`\`\`/g, ''));

    const retailListing = {
      ...deContent,
      basePricePerMeterEur: 45.00,
      calculations: {
        pleatMultiplier: 2.5,
        motorSurchargeCm: 15
      },
      fabricData,
      createdAt: new Date()
    };

    await adminDb.collection('vorhang_products').add(retailListing);
    return retailListing;
  }

  /**
   * MASTER ORCHESTRATOR (Ateşleme Noktası)
   */
  static async executeInfiniteLoop(payload: IngestionPayload) {
    console.log("1. INGESTION BAŞLIYOR...");
    const fabricData = await this.analyzeFabric(payload);

    console.log("2. TRTEX HABERİ YAZILIYOR...");
    const trtexNews = await this.createTRTexNews(fabricData, payload.sourceActor);

    console.log("3. HOMETEX VITRINI HAZIRLANIYOR...");
    const hometexListing = await this.createHometexListing(fabricData);

    console.log("4. VORHANG B2C SATIŞA AÇILIYOR...");
    const vorhangListing = await this.createVorhangRetail(fabricData);

    return {
      status: 'SUCCESS',
      trtex: trtexNews,
      hometex: hometexListing,
      vorhang: vorhangListing
    };
  }
}
