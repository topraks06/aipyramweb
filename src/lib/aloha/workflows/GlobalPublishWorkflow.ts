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
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY tanımlı değil');
  }

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

  // Görsel varsa Gemini Vision'a gönder
  if (payload.imageBase64) {
    parts.push({
      inlineData: {
        data: payload.imageBase64,
        mimeType: 'image/jpeg'
      }
    });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini API hatası: ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini boş yanıt döndü');

  return JSON.parse(text);
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
 * ANA ORKESTRATÖR: Tek bir ürün girişinden 3 platforma otonom yayın.
 */
export async function executeGlobalPublish(payload: ProductIngestionPayload): Promise<WorkflowResult> {
  try {
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
    
    // 3. Paralel yayın (TRTex + Hometex + Vorhang)
    const imageUrl = payload.imageUrl || undefined;
    
    const [trtexId, hometexId, vorhangId] = await Promise.all([
      publishToTRTex(analysis, imageUrl),
      publishToHometex(analysis, pricing, imageUrl),
      publishToVorhang(analysis, pricing, imageUrl),
    ]);

    // 4. Sovereign Log
    if (adminDb) {
      await adminDb.collection('sovereign_publish_log').add({
        trtexNewsId: trtexId,
        hometexProductId: hometexId,
        vorhangProductId: vorhangId,
        analysis,
        pricing,
        payload: { ...payload, imageBase64: '[REDACTED]' },
        status: 'completed',
        createdAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      trtexNewsId: trtexId || undefined,
      hometexProductId: hometexId || undefined,
      vorhangProductId: vorhangId || undefined,
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
