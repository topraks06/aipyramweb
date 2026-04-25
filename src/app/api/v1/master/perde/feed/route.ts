import { NextResponse } from 'next/server';
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import

const CACHE_TTL_MS = 60 * 1000;
let editorialCache: {
  data: any;
  timestamp: number;
} | null = null;

// Removed raw ai client

// 1. RAW DATA MOCK (Perde.ai 3D Rendering & Studio Constraints)
async function getRawData() {
  return {
    rawSignal: 'Increasing rendering requests for minimalist living rooms and light-filtering dual curtain systems. Modern parametric folds in high demand.',
    studioEvents: ['New Fabric Textures Synced', 'Global Render Node Update']
  };
}

// 2. VISIONARY AI KATMANI: Gerçek GenAI Ajanı
async function runVisionary(raw: any, mode: string) {
  if (!process.env.GEMINI_API_KEY) {
    return {
      verifiedTrends: [
        { id: 'p1', topic: 'Parametric Folds', confidence: 0.99 },
        { id: 'p2', topic: 'Smart Tulle', confidence: 0.90 }
      ],
      creativeStyle: 'Parametric Living Space'
    };
  }

  try {
    const prompt = `
      You are AIPYRAM Visionary Editorial Agent for PERDE.AI (3D Rendering Studio).
      Based on this raw signal: ${raw.rawSignal}
      Generate 2 3D rendering design trends for curtains and an overarching aesthetic style.
      Output pure JSON with no markdown: {"verifiedTrends": [{"id": "p1", "topic": "Trend Name", "confidence": 0.99}], "creativeStyle": "Aesthetic Style"}
    `;
    const { text } = await alohaAI.generate(prompt, { 
      responseMimeType: "application/json",
      complexity: 'routine'
    }, 'perde.feed.runVisionary');
    if (text) return JSON.parse(text);
  } catch (error) {
    console.warn("Visionary Agent failed, using fallback:", error);
  }

  return {
    verifiedTrends: [
        { id: 'p1', topic: 'Parametric Folds', confidence: 0.99 },
        { id: 'p2', topic: 'Smart Tulle', confidence: 0.90 }
    ],
    creativeStyle: 'Parametric Living Space'
  };
}

// 3. REALITY FILTER KATMANI
async function runReality(visionary: any) {
  return visionary;
}

// 4. LÜKS FORMATLAYICI (Perde.ai 3D Studio & Render Motoru Uyumluluğu)
function formatForUI(reality: any) {
  return {
    hero: {
      titleTr: ['PERDE.AI', 'OTONOM', 'STÜDYO'],
      titleEn: ['PERDE.AI', 'AUTONOMOUS', 'STUDIO'],
      subtitleTr: `AIPyram Render Bot: "${reality.creativeStyle}" ortamı için sanal numune üretiliyor.`,
      subtitleEn: `AIPyram Render Bot generating virtual samples for "${reality.creativeStyle}" environment.`,
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&q=80'
    },
    trends: {
      headerTr: '3D Render Zekası',
      headerEn: '3D Render Intelligence',
      cards: reality.verifiedTrends.map((t: any, i: number) => ({
        id: t.id,
        nameTr: t.topic === 'Parametric Folds' ? 'Parametrik Pileler' : 'Akıllı Tüller',
        nameEn: t.topic,
        descTr: 'Son 24 saatteki en popüler render formatı.',
        descEn: 'Most popular render format in last 24 hours.',
        img: i === 0 
          ? 'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?w=800&q=80'
          : 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800&q=80',
        score: Math.floor(t.confidence * 100),
        badge: t.confidence > 0.95 ? 'HOT RENDER' : 'POPULAR',
        badgeEn: t.confidence > 0.95 ? 'HOT RENDER' : 'POPULAR',
        reasonTr: 'Global Tasarım Sensörü',
        reasonEn: 'Global Design Sensor'
      }))
    },
    collections: {
      headerTr: 'Hazır Mekanlar',
      headerEn: 'Ready Environments',
      items: [
        {
          id: 'c1',
          name_tr: 'AIPyram Minimalist Salon',
          name_en: 'AIPyram Minimalist Living',
          ai_commentary_tr: 'Render süresi: 4.2 saniye. Çok yüksek satış dönüşüm skoru.',
          ai_commentary_en: 'Render time: 4.2 seconds. Very high conversion score.',
          trend_score: 99,
          is_trending: true,
          cover_image_url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
          style_tags: ['3D READY', 'DAYLIGHT']
        }
      ]
    },
    fairs: [], 
    showrooms: [ 
      { id: 's1', name: 'Render Node Alpha', location: 'Cloud', is_featured: true },
      { id: 's2', name: 'Texture Engine', location: 'Cloud', is_featured: true }
    ]
  };
}

export async function GET(request: Request) {
  // 5. API GUARD
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== "hometex-neural-secure-token-2026" && apiKey !== process.env.AIPYRAM_SECRET_KEY && process.env.NODE_ENV === "production") {
    return NextResponse.json({ success: false, error: 'Unauthorized AIPYRAM Nexus Access' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'editorial';

  // 6. Performans: Cache Hit Check
  if (editorialCache && (Date.now() - editorialCache.timestamp < CACHE_TTL_MS) && mode !== 'fast') {
    return NextResponse.json({
      success: true,
      data: editorialCache.data,
      meta: {
        generated_by: 'AIPyram Visionary Agent',
        mode: mode,
        timestamp: editorialCache.timestamp,
        cached: true
      }
    });
  }

  // ==== PERDE.AI EDITORIAL ENGINE PIPELINE ====
  const raw = await getRawData();
  const visionary = await runVisionary(raw, mode);
  const reality = await runReality(visionary);
  const editorialFormat = formatForUI(reality);
  // ===========================================

  // Update Cache
  editorialCache = {
    data: editorialFormat,
    timestamp: Date.now()
  };

  return NextResponse.json({
    success: true,
    data: editorialFormat,
    meta: {
      generated_by: 'AIPyram Visionary Agent',
      mode: mode,
      timestamp: editorialCache.timestamp,
      cached: false
    }
  });
}
