import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { feedCache } from '@/core/cache/feedCache';
import { masterCron } from '@/core/cron/masterCron';
import { hometexAgent } from '@/core/agents/hometexAgent';

export async function GET(request: Request) {
  // Otonom Sistem Tetiklenmesi (Sadece İlk Çağrıda Çalışır, Ardından Cron Devralır)
  // Güvenlik: Build anında değil, çalışma zamanında tetiklenmeli
  hometexAgent.init();
  masterCron.initSystem();
  // 1. API GUARD
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== "hometex-neural-secure-token-2026" && apiKey !== process.env.AIPYRAM_SECRET_KEY && process.env.NODE_ENV === "production") {
    return NextResponse.json({ success: false, error: 'Unauthorized aipyram Nexus Access' }, { status: 401 });
  }

  // 2. Dumb Client Feed: Sadece Cache okur, AI kesinlikle YOKTUR!
  const cacheHit = feedCache.getFeed('hometex');

  if (cacheHit && (Date.now() - cacheHit.timestamp < 60000000)) { // 60sn limit yok sadece veri varlığına bakıyoruz (boş dönmemek için)
    return NextResponse.json({
      success: true,
      data: cacheHit.data,
      meta: {
        generated_by: 'aipyram Brain (Hometex Agent)',
        mode: 'autonomous',
        timestamp: cacheHit.timestamp,
        cached: true
      }
    });
  }

  // 3. CACHE BOŞ İSE: Sadece UI çökmesin diye minimal bir boşluk objesi (Asla AI çağırmaz)
  return NextResponse.json({
    success: true,
    data: {
      hero: {
        titleTr: ['YAPAY ZEKA', 'DESTEKLİ', 'SANAL FUAR'],
        titleEn: ['AI POWERED', 'VIRTUAL', 'EXHIBITION'],
        subtitleTr: `aipyram Zeka Motoru başlatılıyor, ilk cache bekleniyor...`,
        subtitleEn: `aipyram Engine starting, waiting for initial cache...`,
        image: 'https://images.unsplash.com/photo-1558222218-b7b54eede3f3?w=1600&q=80'
      },
      trends: { headerTr: 'Analiz Ediliyor', headerEn: 'Analyzing', cards: [] },
      collections: { headerTr: 'Toplanıyor', headerEn: 'Gathering', items: [] },
      fairs: [],
      showrooms: []
    },
    meta: {
      generated_by: 'aipyram Brain (Fallback)',
      mode: 'fallback',
      timestamp: Date.now(),
      cached: false
    }
  });
}
