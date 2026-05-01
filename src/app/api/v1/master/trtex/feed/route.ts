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

// Removed raw ai client

async function getRealFeedData() {
  try {
    const newsRef = adminDb.collection('trtex_news')
      .where('status', '==', 'published')
      .orderBy('publishedAt', 'desc')
      .limit(5);
    const snap = await newsRef.get();
    
    const docs = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        titleTr: data.translations?.TR?.title || data.title || '',
        titleEn: data.translations?.EN?.title || data.title || '',
        summaryTr: data.translations?.TR?.summary || data.summary || '',
        summaryEn: data.translations?.EN?.summary || data.summary || '',
        category: data.category || 'Haber',
        image: data.image_url || data.cover_image || 'https://images.unsplash.com/photo-1542452255191-c85a98f2c5d1?w=800&q=80',
        confidence: data.confidence || 0.90
      };
    });

    return {
      hero: {
        titleTr: ['GLOBAL TİCARET', 'B2B AĞI', 'TRTEX'],
        titleEn: ['GLOBAL TRADE', 'B2B NETWORK', 'TRTEX'],
        subtitleTr: `aipyram B2B Bot: En güncel ticari veriler sunuluyor.`,
        subtitleEn: `aipyram B2B Bot analyzing latest global supply chain.`,
        image: docs[0]?.image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80'
      },
      trends: {
        headerTr: 'Pazar Zekası',
        headerEn: 'Market Intelligence',
        cards: docs.slice(0, 2).map((d: any, i: number) => ({
          id: d.id,
          nameTr: d.titleTr.substring(0, 30) + '...',
          nameEn: d.titleEn.substring(0, 30) + '...',
          descTr: d.summaryTr.substring(0, 100) + '...',
          descEn: d.summaryEn.substring(0, 100) + '...',
          img: d.image,
          score: Math.floor(d.confidence * 100),
          badge: d.confidence > 0.9 ? 'URGENT' : 'STABLE',
          badgeEn: d.confidence > 0.9 ? 'URGENT' : 'STABLE',
          reasonTr: d.category,
          reasonEn: d.category
        }))
      },
      collections: {
        headerTr: 'Öne Çıkan Gelişmeler',
        headerEn: 'Highlighted Updates',
        items: docs.slice(2, 4).map((d: any) => ({
          id: d.id,
          name_tr: d.titleTr,
          name_en: d.titleEn,
          ai_commentary_tr: d.summaryTr,
          ai_commentary_en: d.summaryEn,
          trend_score: Math.floor(d.confidence * 100),
          is_trending: true,
          cover_image_url: d.image,
          style_tags: [d.category.toUpperCase()]
        }))
      },
      fairs: [], 
      showrooms: []
    };
  } catch (err) {
    console.error("Feed error:", err);
    throw err;
  }
}

export async function GET(request: Request) {
  // 5. API GUARD
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== "hometex-neural-secure-token-2026" && apiKey !== process.env.AIPYRAM_SECRET_KEY && process.env.NODE_ENV === "production") {
    return NextResponse.json({ success: false, error: 'Unauthorized aipyram Nexus Access' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'editorial';

  // 6. Performans: Cache Hit Check
  if (editorialCache && (Date.now() - editorialCache.timestamp < CACHE_TTL_MS) && mode !== 'fast') {
    return NextResponse.json({
      success: true,
      data: editorialCache.data,
      meta: {
        generated_by: 'aipyram Visionary Agent',
        mode: mode,
        timestamp: editorialCache.timestamp,
        cached: true
      }
    });
  }

  // ==== TRTEX EDITORIAL ENGINE PIPELINE ====
  const editorialFormat = await getRealFeedData();
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
      generated_by: 'aipyram Visionary Agent',
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
