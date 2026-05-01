import { NextResponse } from 'next/server';
import { runGTIEngine } from '@/core/aloha/gti/engine';
import { adminDb } from '@/lib/firebase-admin';
import { FinanceMinister } from '@/core/aloha/financeMinister';
import { executeTask } from '@/core/aloha/aiClient';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 mins because of AI parsing

/**
 * Kıtalararası IndexNow Ping (Yandex, Bing, Seznam vb.)
 */
async function pingIndexNow(urls: string[]) {
  if (!urls || urls.length === 0) return;
  const key = process.env.INDEXNOW_KEY || 'trtex-indexnow-2026';
  const host = 'trtex.com';
  try {
    const payload = { host, key, keyLocation: `https://${host}/${key}.txt`, urlList: urls };
    fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(res => {
       console.log(`[INDEXNOW PING] 🚀 ${urls.length} Yeni Haber Asya/Rusya/Global Botlarına İletildi. (Status: ${res.status})`);
    }).catch(() => {});
  } catch (e) {}
}

/**
 * GET /api/cron/gti-cycle
 * 
 * 7 Kıtadan haber toplayan, filtreleyen ve analiz eden 3 katmanlı Huni Motoru.
 * Günde 4 kez çalışır (Cloud Scheduler).
 */
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET || 'aloha-cron-sovereign-2026';
  
  // 1. Yetkilendirme (Manuel tetikleme veya Cloud Scheduler)
  const authHeader = req.headers.get('authorization');
  const xCronSecret = req.headers.get('x-cron-secret');
  
  const isAuthorized = 
    (authHeader === `Bearer ${cronSecret}`) || 
    (xCronSecret === cronSecret) || 
    (process.env.NODE_ENV === 'development');

  if (!isAuthorized) {
    console.warn('[GTI CRON] ❌ Yetkisiz erişim denemesi');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const url = new URL(req.url);
    // Gece Vardiyası: 02:00 - 05:00 UTC arası (Türkiye saatiyle sabaha karşı)
    const isNightShift = new Date().getUTCHours() >= 2 && new Date().getUTCHours() <= 5;
    const isBatchMode = url.searchParams.get('batch') === 'true' || isNightShift;

    console.log(`\n[GTI CRON] 🌍 Global Textile Intelligence (GTI) Huni Motoru Başlatılıyor... ${isBatchMode ? '[🌙 GECE VARDİYASI / BATCH MODE - %50 İNDİRİM]' : ''}`);
    
    // AUTHORITY CHECK
    const auth = await executeTask({
      nodeId: 'trtex',
      action: 'news_pipeline',
      payload: { task: 'gti-cycle', batch: isBatchMode },
      caller: 'cron_gti_cycle',
    });

    if (!auth.success) {
      console.warn(`[GTI CRON] 🚫 Otonom pipeline engellendi: ${auth.error}`);
      return NextResponse.json({ blocked: true, reason: auth.error }, { status: 403 });
    }

    // 2. Budget Guard (Finance Minister)
    const quotas = await FinanceMinister.getDailyQuotas();
    
    if (quotas.mode === 'LOCKED') {
      console.warn(`[GTI CRON] 🚨 Sistem KİLİTLİ (Hard Limit). Motor çalıştırılmayacak.`);
      return NextResponse.json({ success: false, reason: 'LOCKED_BY_FINANCE_MINISTER' });
    }

    // 3. Engine'i Çalıştır (Bütçe hesabı engine içinde)
    const articles = await runGTIEngine();

    // 4. Tahmini Maliyeti Yaz
    // GTI'da 1 haber = Flash score ($0.01) + Pro Analysis ($0.02) + Çeviri ($0.01) = ~$0.04
    if (articles.length > 0) {
       let costPerArticle = quotas.useProModel ? 0.04 : 0.02;
       
       // Hakan Bey'in Vizyonu: Gece Vardiyası Batch API %50 İndirim
       if (isBatchMode) {
         costPerArticle = costPerArticle * 0.5; 
       }
       
       const estimatedCost = articles.length * costPerArticle;
       await FinanceMinister.recordActualSpend(estimatedCost, `GTI Engine (${articles.length} news) ${isBatchMode ? '[BATCH_NIGHT_SHIFT]' : ''}`);

       // 5. GLOBAL SEO: IndexNow ile Asya ve Rusya'ya anında Ping at
       const urlsToPing = articles.map((a: any) => `https://trtex.com/news/${a.slug || a.id}`);
       pingIndexNow(urlsToPing);
    }

    return NextResponse.json({
      success: true,
      articles_generated: articles.length,
      budget_mode: quotas.mode,
      batch_mode: isBatchMode
    });

  } catch (err: any) {
    console.error('[GTI CRON] 💥 Kritik Hata:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
