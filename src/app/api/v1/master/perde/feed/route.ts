import { NextResponse } from 'next/server';
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import

const CACHE_TTL_MS = 60 * 1000;
let editorialCache: {
  data: any;
  timestamp: number;
} | null = null;

// Removed raw ai client

async function getRealFeedData() {
  try {
    const adminDb = (await import('@/lib/firebase-admin')).adminDb;
    const newsRef = adminDb.collection('perde_content')
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
        category: data.category || 'Render',
        image: data.image_url || data.cover_image || 'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?w=800&q=80',
        confidence: data.confidence || 0.90
      };
    });

    return {
      hero: {
        titleTr: ['PERDE.AI', 'OTONOM', 'STÜDYO'],
        titleEn: ['PERDE.AI', 'AUTONOMOUS', 'STUDIO'],
        subtitleTr: `aipyram Render Bot: Sanal numune üretiliyor.`,
        subtitleEn: `aipyram Render Bot generating virtual samples.`,
        image: docs[0]?.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&q=80'
      },
      trends: {
        headerTr: '3D Render Zekası',
        headerEn: '3D Render Intelligence',
        cards: docs.slice(0, 2).map((d: any, i: number) => ({
          id: d.id,
          nameTr: d.titleTr.substring(0, 30) + '...',
          nameEn: d.titleEn.substring(0, 30) + '...',
          descTr: d.summaryTr.substring(0, 100) + '...',
          descEn: d.summaryEn.substring(0, 100) + '...',
          img: d.image,
          score: Math.floor(d.confidence * 100),
          badge: d.confidence > 0.95 ? 'HOT RENDER' : 'POPULAR',
          badgeEn: d.confidence > 0.95 ? 'HOT RENDER' : 'POPULAR',
          reasonTr: d.category,
          reasonEn: d.category
        }))
      },
      collections: {
        headerTr: 'Hazır Mekanlar',
        headerEn: 'Ready Environments',
        items: docs.slice(2, 4).map((d: any) => ({
          id: d.id,
          name_tr: d.titleTr,
          name_en: d.titleEn,
          ai_commentary_tr: d.summaryTr,
          ai_commentary_en: d.summaryEn,
          trend_score: Math.floor(d.confidence * 100),
          is_trending: true,
          cover_image_url: d.image,
          style_tags: ['3D READY', d.category.toUpperCase()]
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

  // ==== PERDE.AI EDITORIAL ENGINE PIPELINE ====
  const editorialFormat = await getRealFeedData();
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
      generated_by: 'aipyram Visionary Agent',
      mode: mode,
      timestamp: editorialCache.timestamp,
      cached: false
    }
  });
}
