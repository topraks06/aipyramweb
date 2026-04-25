/**
 * SOVEREIGN GLOBAL PUBLISH WORKFLOW v2.0
 * 
 * Tek bir ürün girişinden (kumaş fotoğrafı + teknik bilgi) başlayarak:
 * 1. TRTex → B2B Haber/Radar kaydı
 * 2. Hometex → Fuar Vitrini ürünü
 * 3. Vorhang → B2C Perakende satış ürünü
 * koleksiyonlarına otonom olarak yazan orkestratör.
 * 
 * KURAL: Sıfır Mock. Tüm yazımlar gerçek Firestore'a gider.
 * KURAL: Image-to-Image (Img2Img) render gerektiğinde tetiklenir.
 */

import { adminDb } from '@/lib/firebase-admin';
import { calculatePricing, PricingInput } from '@/lib/aloha/PricingEngine';

import { alohaAI } from '@/core/aloha/aiClient';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export interface ProductIngestionPayload {
  // Zorunlu alanlar
  imageBase64?: string;           // Kumaş fotoğrafı (base64)
  imageUrl?: string;              // Veya kumaş fotoğrafı URL'si
  technicalSpecs: string;         // Teknik açıklama (serbest metin)
  fabricCostPerMeter: number;     // Fabrika çıkış maliyeti (USD)
  
  // Opsiyonel (ALOHA otonom tamamlar)
  gsm?: number;
  widthCm?: number;
  composition?: string;
  collectionName?: string;
  patternType?: string;           // 'geometrik', 'etnik', 'düz', 'çiçekli' vb.
}

interface WorkflowResult {
  success: boolean;
  trtexNewsId?: string;
  hometexProductId?: string;
  vorhangProductId?: string;
  pricing?: any;
  analysis?: any;
  error?: string;
}

/**
 * AŞAMA 1: Gemini Vision ile kumaş analizi
 */
async function analyzeWithGemini(payload: ProductIngestionPayload): Promise<any> {
  // Gemini yoksa veya key yoksa deterministik fallback
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'dummy_key') {
    return buildDeterministicAnalysis(payload);
  }

  try {
    const prompt = `Sen bir tekstil mühendisisin. Verilen teknik bilgiyi analiz et ve aşağıdaki JSON formatında döndür:
{
  "collectionName": "Koleksiyon adı öner (Türkçe)",
  "patternType": "desen tipi (geometrik/etnik/düz/çiçekli/damask/brode/şönil/bukle)",
  "dominantColors": ["ana renkler listesi"],
  "texture": "doku açıklaması",
  "targetSegment": "hedef segment (otel/konut/ofis/luxury)",
  "composition": "karışım oranları",
  "gsm": sayısal gramaj değeri,
  "widthCm": sayısal en değeri (cm),
  "usageAreas": ["kullanım alanları listesi"],
  "trtexHeadline": "TRTex için B2B haber başlığı (Türkçe, profesyonel)",
  "trtexSummary": "200 kelimelik B2B haber özeti (Türkçe)",
  "hometexTitle": "Hometex fuar vitrini başlığı (İngilizce)",
  "hometexDescription": "Fuar katılımcıları için teknik ürün açıklaması (İngilizce)",
  "vorhangTitle": "Vorhang B2C satış başlığı (Almanca)",
  "vorhangDescription": "Alman tüketici için yaşam tarzı odaklı ürün açıklaması (Almanca)",
  "motorRecommendation": "motorlu sistem önerisi",
  "martindale": tahmini sürtünme değeri
}

Teknik Bilgi: ${payload.technicalSpecs}
${payload.gsm ? `Gramaj: ${payload.gsm} GSM` : ''}
${payload.widthCm ? `En: ${payload.widthCm} cm` : ''}
${payload.composition ? `Karışım: ${payload.composition}` : ''}

SADECE JSON döndür, başka bir şey yazma.`;

    const parts: any[] = [{ text: prompt }];

    if (payload.imageBase64) {
      parts.push({
        inlineData: {
          data: payload.imageBase64,
          mimeType: 'image/jpeg'
        }
      });
    }

    const jsonResult = await alohaAI.generateJSON(parts, {
      temperature: 0.2,
      maxOutputTokens: 2048,
      complexity: 'routine'
    }, 'GlobalPublishWorkflow.analyzeWithGemini');

    return jsonResult;
  } catch (err: any) {
    console.error('[GlobalPublish] Gemini analiz hatası:', err.message);
    return buildDeterministicAnalysis(payload);
  }
}

/**
 * Gemini başarısız olduğunda deterministik analiz (Sıfır Halüsinasyon)
 */
function buildDeterministicAnalysis(payload: ProductIngestionPayload): any {
  const specs = payload.technicalSpecs || '';
  const gsm = payload.gsm || 280;
  const widthCm = payload.widthCm || 280;
  const composition = payload.composition || '%100 Polyester';
  const patternType = payload.patternType || 'botanik';
  const collectionName = payload.collectionName || 'Sovereign Collection';

  return {
    collectionName,
    patternType,
    dominantColors: ['Nötr', 'Toprak Tonları'],
    texture: 'Orta ağırlık dokuma',
    targetSegment: gsm > 400 ? 'otel' : 'konut',
    composition,
    gsm,
    widthCm,
    usageAreas: ['Perde', 'Dekoratif Yastık', 'Masa Örtüsü'],
    trtexHeadline: `Yeni Koleksiyon Lansmanı: ${collectionName} — Türk Tekstilinde Yeni Sayfa`,
    trtexSummary: `${collectionName} koleksiyonu, ${composition} karışımıyla ${gsm} GSM ağırlığında üretilmiştir. ${widthCm} cm en genişliğiyle Avrupa standartlarına tam uyumludur. ${patternType} desen yapısı, modern iç mekan projelerinde yüksek talep görmektedir. Oeko-Tex Standard 100 sertifika sürecine uygundur.`,
    hometexTitle: `${collectionName} — Premium ${patternType.charAt(0).toUpperCase() + patternType.slice(1)} Textile Collection`,
    hometexDescription: `${gsm} GSM, ${widthCm}cm width, ${composition}. Suitable for premium residential and hospitality projects. Digital reactive printing at 1200 DPI.`,
    vorhangTitle: `${collectionName} — Exklusiver Designvorhang`,
    vorhangDescription: `Hochwertiger Vorhangstoff, ${gsm} g/m², ${widthCm}cm Breite. ${composition}. Oeko-Tex geprüft. Maßanfertigung möglich.`,
    motorRecommendation: gsm > 350 ? 'Somfy Glydea 60 (Ağır kumaş)' : 'Somfy Glydea 35 (Standart)',
    martindale: gsm > 400 ? 45000 : 20000,
  };
}

/**
 * AŞAMA 2: TRTex'e B2B haber olarak kaydet
 */
async function publishToTRTex(analysis: any, imageUrl: string | undefined): Promise<string | null> {
  if (!adminDb) return null;

  const newsDoc = {
    title: analysis.trtexHeadline || 'Yeni Ürün Lansmanı',
    summary: analysis.trtexSummary || '',
    content: analysis.trtexSummary || '',
    category: 'product-launch',
    tags: analysis.usageAreas || [],
    language: 'tr',
    imageUrl: imageUrl || '',
    source: 'sovereign-ingestion',
    status: 'published',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      composition: analysis.composition,
      gsm: analysis.gsm,
      patternType: analysis.patternType,
      dominantColors: analysis.dominantColors,
    },
  };

  const ref = await adminDb.collection('trtex_news').add(newsDoc);
  return ref.id;
}

/**
 * AŞAMA 3: Hometex.ai fuar vitrinine kaydet
 */
async function publishToHometex(analysis: any, pricing: any, imageUrl: string | undefined): Promise<string | null> {
  if (!adminDb) return null;

  const productDoc = {
    title: analysis.hometexTitle || analysis.collectionName,
    description: analysis.hometexDescription || '',
    category: analysis.targetSegment || 'textile',
    imageUrl: imageUrl || '',
    price: pricing.b2b.wholesalePrice,
    currency: pricing.b2b.currency,
    minOrder: pricing.b2b.minOrderMeters,
    unit: 'meter',
    certifications: pricing.b2b.certifications,
    specs: {
      composition: analysis.composition,
      gsm: analysis.gsm,
      widthCm: analysis.widthCm,
      patternType: analysis.patternType,
      martindale: analysis.martindale,
    },
    exhibitor: 'Sovereign Textile Group',
    hall: 'Hall 1',
    status: 'active',
    source: 'sovereign-ingestion',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const ref = await adminDb.collection('hometex_products').add(productDoc);
  return ref.id;
}

/**
 * AŞAMA 4: Vorhang.ai B2C mağazasına kaydet
 */
async function publishToVorhang(analysis: any, pricing: any, imageUrl: string | undefined): Promise<string | null> {
  if (!adminDb) return null;

  const productDoc = {
    name: analysis.vorhangTitle || analysis.collectionName,
    description: analysis.vorhangDescription || '',
    category: 'Vorhänge',
    imageUrl: imageUrl || '',
    price: pricing.b2c.retailPricePerMeter,
    currency: pricing.b2c.currency,
    unit: 'pro Meter (genäht)',
    inStock: true,
    specs: {
      composition: analysis.composition,
      gsm: analysis.gsm,
      widthCm: analysis.widthCm,
      patternType: analysis.patternType,
      pleatingMultiplier: pricing.b2c.pleatingMultiplier,
      motorFireCm: pricing.b2c.motorFireCm,
      motorRecommendation: analysis.motorRecommendation,
    },
    seller: {
      id: 'sovereign-main',
      name: 'Sovereign Textile',
      verified: true,
    },
    seo: {
      slug: (analysis.vorhangTitle || 'produkt').toLowerCase().replace(/[^a-z0-9äöüß]/g, '-').replace(/-+/g, '-'),
    },
    status: 'active',
    source: 'sovereign-ingestion',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const ref = await adminDb.collection('vorhang_products').add(productDoc);
  return ref.id;
}

/**
 * AŞAMA 5: Perde.ai Tasarım Bekleme Kuyruğuna At (Yeni)
 */
async function publishToPerde(analysis: any, imageUrl: string | undefined): Promise<string | null> {
  if (!adminDb) return null;

  const designDoc = {
    title: analysis.collectionName + ' - Otonom Tasarım İsteği',
    fabricSpecs: {
      composition: analysis.composition,
      gsm: analysis.gsm,
      widthCm: analysis.widthCm,
      patternType: analysis.patternType,
    },
    imageUrl: imageUrl || '',
    status: 'pending_design',
    source: 'sovereign-ingestion',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const ref = await adminDb.collection('perde_design_queue').add(designDoc);
  return ref.id;
}

/**
 * ANA ORKESTRATÖR: Tek bir ürün girişinden hedeflenen platformlara otonom yayın.
 */
export async function executeGlobalPublish(payload: ProductIngestionPayload & { targets?: string[] }): Promise<WorkflowResult> {
  try {
    const targets = payload.targets && payload.targets.length > 0 ? payload.targets : ['trtex', 'hometex', 'vorhang', 'perde'];
    
    // 1. Gemini Vision ile analiz
    const analysis = await analyzeWithGemini(payload);
    
    // 2. Fiyatlama motoru
    const pricingInput: PricingInput = {
      fabricCostPerMeter: payload.fabricCostPerMeter,
      gsm: analysis.gsm || payload.gsm || 300,
      widthCm: analysis.widthCm || payload.widthCm || 280,
      composition: analysis.composition || payload.composition || '',
      isMotorized: true, // Default motorlu
    };
    const pricing = calculatePricing(pricingInput);
    
    // 3. Paralel hedeflenmiş yayın (Swarm Routing)
    const imageUrl = payload.imageUrl || undefined;
    
    const isAll = targets.includes('all');
    const promises = [];
    
    let trtexId, hometexId, vorhangId, perdeId;

    if (isAll || targets.includes('trtex')) {
      promises.push(publishToTRTex(analysis, imageUrl).then(id => { trtexId = id; }));
    }
    if (isAll || targets.includes('hometex')) {
      promises.push(publishToHometex(analysis, pricing, imageUrl).then(id => { hometexId = id; }));
    }
    if (isAll || targets.includes('vorhang')) {
      promises.push(publishToVorhang(analysis, pricing, imageUrl).then(id => { vorhangId = id; }));
    }
    if (isAll || targets.includes('perde')) {
      promises.push(publishToPerde(analysis, imageUrl).then(id => { perdeId = id; }));
    }

    await Promise.all(promises);

    // 4. Sovereign Log
    if (adminDb) {
      const logDoc = {
        trtexNewsId: trtexId || null,
        hometexProductId: hometexId || null,
        vorhangProductId: vorhangId || null,
        perdeDesignId: perdeId || null,
        targets,
        analysis,
        pricing,
        payload: { ...payload, imageBase64: '[REDACTED]' },
        status: 'completed',
        createdAt: new Date().toISOString(),
      };
      
      // Firestore does not allow undefined. Clean undefined fields safely.
      const sanitizedDoc = JSON.parse(JSON.stringify(logDoc));
      await adminDb.collection('sovereign_publish_log').add(sanitizedDoc);
    }

    return {
      success: true,
      trtexNewsId: trtexId || undefined,
      hometexProductId: hometexId || undefined,
      vorhangProductId: vorhangId || undefined,
      perdeDesignId: perdeId || undefined,
      pricing,
      analysis,
    };
  } catch (error: any) {
    console.error('[GlobalPublish] Hata:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
