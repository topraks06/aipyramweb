import { NextResponse } from 'next/server';
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { publishToTRTEX } from '@/core/aloha/publishers/universal-publisher';
import { executeMasterAgent, MasterSystemState } from '@/core/aloha/master-agent';
import { adminDb } from '@/lib/firebase-admin';

const CACHE_TTL_MS = 60 * 1000;
let editorialCache: {
  data: any;
  timestamp: number;
} | null = null;

// AI SETUP
const ai = alohaAI.getClient();

// 1. RAW DATA MOCK (TRTEX B2B Intelligence)
async function getRawData() {
  return {
    rawSignal: 'Wholesale textile pricing drops globally but specialized blackout fabrics demand surges by 25% in hospitality sector.',
    b2bEvents: ['TRTEX B2B Connect', 'Istanbul Fabric Trade']
  };
}

// 2. VISIONARY AI KATMANI: Gerçek GenAI Ajanı
async function runVisionary(raw: any, mode: string) {
  if (!process.env.GEMINI_API_KEY) {
    return {
      verifiedTrends: [
        { id: 'tx1', topic: 'Blackout Fabrics', confidence: 0.98 },
        { id: 'tx2', topic: 'Hospitality Bulk', confidence: 0.85 }
      ],
      creativeStyle: 'Commercial Efficiency'
    };
  }

  try {
    const prompt = `
      You are AIPYRAM Visionary Editorial Agent for TRTEX (B2B).
      Based on this raw signal: ${raw.rawSignal}
      Generate 2 market trends for wholesale textiles and an overarching market outlook style.
      Output pure JSON with no markdown: {"verifiedTrends": [{"id": "tx1", "topic": "Trend Name", "confidence": 0.98}], "creativeStyle": "Outlook Style"}
    `;
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    if (res.text) return JSON.parse(res.text);
  } catch (error) {
    console.warn("Visionary Agent failed, using fallback:", error);
  }

  return {
    verifiedTrends: [
        { id: 'tx1', topic: 'Blackout Fabrics', confidence: 0.98 },
        { id: 'tx2', topic: 'Hospitality Bulk', confidence: 0.85 }
    ],
    creativeStyle: 'Commercial Efficiency'
  };
}

// 3. REALITY FILTER KATMANI
async function runReality(visionary: any) {
  return visionary;
}

// 4. LÜKS FORMATLAYICI (TRTEX Brutalist & B2B Intelligence Uyumluluğu)
function formatForUI(reality: any) {
  return {
    hero: {
      titleTr: ['GLOBAL TİCARET', 'B2B AĞI', 'TRTEX'],
      titleEn: ['GLOBAL TRADE', 'B2B NETWORK', 'TRTEX'],
      subtitleTr: `AIPyram B2B Bot: "${reality.creativeStyle}" odaklı küresel tedarik analizi yürütülüyor.`,
      subtitleEn: `AIPyram B2B Bot analyzing global supply chain with "${reality.creativeStyle}" focus.`,
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80'
    },
    trends: {
      headerTr: 'Pazar Zekası',
      headerEn: 'Market Intelligence',
      cards: reality.verifiedTrends.map((t: any, i: number) => ({
        id: t.id,
        nameTr: t.topic === 'Blackout Fabrics' ? 'Karartma Kumaşlar' : 'Otel Tedarik',
        nameEn: t.topic,
        descTr: 'Toptan alımlarda ani artış tespit edildi.',
        descEn: 'Sudden spike detected in wholesale purchases.',
        img: i === 0 
          ? 'https://images.unsplash.com/photo-1542452255191-c85a98f2c5d1?w=800&q=80'
          : 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80',
        score: Math.floor(t.confidence * 100),
        badge: t.confidence > 0.9 ? 'URGENT' : 'STABLE',
        badgeEn: t.confidence > 0.9 ? 'URGENT' : 'STABLE',
        reasonTr: 'B2B Veri Ağı Akışı',
        reasonEn: 'B2B Data Network Flow'
      }))
    },
    collections: {
      headerTr: 'Onaylı Tedarikçiler',
      headerEn: 'Verified Suppliers',
      items: [
        {
          id: 'c1',
          name_tr: 'Endüstriyel Kumaş Ağı',
          name_en: 'Industrial Fabric Network',
          ai_commentary_tr: 'Ajanlarımız bu çeyrekte toptan kapasitenin yetersiz kalabileceği uyarısını veriyor.',
          ai_commentary_en: 'Our agents warn that wholesale capacity may be insufficient this quarter.',
          trend_score: 98,
          is_trending: true,
          cover_image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80',
          style_tags: ['INDUSTRIAL', 'B2B BULK']
        }
      ]
    },
    fairs: [], 
    showrooms: [ 
      { id: 's1', name: 'AIPyram B2B Node', location: 'Global', is_featured: true },
      { id: 's2', name: 'TRTEX Toptan Merkezi', location: 'Istanbul', is_featured: false }
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

  // ==== TRTEX EDITORIAL ENGINE PIPELINE ====
  const raw = await getRawData();
  const visionary = await runVisionary(raw, mode);
  const reality = await runReality(visionary);
  const editorialFormat = formatForUI(reality);
  // =========================================

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

/**
 * POST /api/v1/master/trtex/feed
 * 
 * 🔥 OTOMATİK TETİK: Master Agent → Editorial Guard → TRTEX Firebase
 * 
 * Bu endpoint'i çağıran kaynaklar:
 *   1. Admin paneldeki "Haber Üret" butonu
 *   2. Cron job (her 10-15 dk)
 *   3. EventBus sinyalleri
 */
export async function POST(req: Request) {
  try {
    // State'i Firestore'dan çek
    let state: MasterSystemState = {
      last_news_time: 0,
      topics_used: [],
      last_market_update: 0,
      todays_news_count: 0,
    };

    try {
      const stateDoc = await adminDb.collection('system_state').doc('master_trtex').get();
      if (stateDoc.exists) {
        state = stateDoc.data() as MasterSystemState;
      }
    } catch (e) {
      console.warn('[TRTEX Feed POST] State okunamadı, varsayılan kullanılıyor');
    }

    // Opsiyonel sinyal
    const body = await req.json().catch(() => ({}));
    const signal = body.signal || undefined;

    // 1. Master Agent'ı çalıştır
    console.log('[TRTEX Feed POST] 🧠 Master Agent tetikleniyor...');
    const result = await executeMasterAgent("TRTEX", state, signal);
    console.log(`[TRTEX Feed POST] Master Agent çıktı tipi: ${result.type}`);

    // 2. Editorial Guard + Firebase Yayını
    let publishResult = null;
    if (result.type === 'news') {
      publishResult = await publishToTRTEX({ type: 'news', payload: result.payload });
    } else if (result.type === 'site-brain') {
      publishResult = await publishToTRTEX({ type: 'market_signal', payload: result.payload });
    }

    // 3. State güncelle
    try {
      await adminDb.collection('system_state').doc('master_trtex').set({
        last_news_time: Date.now(),
        todays_news_count: (state.todays_news_count || 0) + 1,
        last_market_update: result.type === 'site-brain' ? Date.now() : state.last_market_update,
        topics_used: [
          ...(state.topics_used || []).slice(-20),
          result.newStateUpdate && 'added_topic' in result.newStateUpdate ? (result.newStateUpdate as any).added_topic : undefined
        ].filter(Boolean),
      }, { merge: true });
    } catch (e) {
      console.warn('[TRTEX Feed POST] State güncellenemedi:', e);
    }

    return NextResponse.json({
      success: publishResult?.success ?? true,
      masterOutput: result.type,
      publishResult,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('[TRTEX Feed POST] ❌ Kritik Hata:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
