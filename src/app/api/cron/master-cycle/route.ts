import { NextResponse } from 'next/server';
import { buildTerminalPayload } from '@/core/aloha/terminalPayloadBuilder';
import { refreshTickerData } from '@/core/aloha/tickerDataFetcher';
import { adminDb } from '@/lib/firebase-admin';
import { executeTask } from '@/core/aloha/aiClient';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 dakika max

/**
 * GET /api/cron/master-cycle
 * 
 * ═══════════════════════════════════════
 * ALOHA MASTER CYCLE — TEK BEYİN, TEK DÖNGÜ
 * ═══════════════════════════════════════
 * 
 * Tüm otonom pipeline bu TEK endpoint'ten geçer.
 * Dağınık cron/trigger yapısı öldürüldü.
 * 
 * AKIŞ (sıralı):
 *   1. image-queue işle → görselleri üret, published yap
 *   2. ticker refresh → piyasa verileri güncelle
 *   3. terminal payload build → frontend için tek çıktı
 * 
 * NOT: Haber toplama işi tamamen GTI'a devredilmiştir. Master Cycle sadece görüntü işleme ve veri paketleme yapar.
 * TETİKLEYİCİ:
 *   - Google Cloud Scheduler: her 4 saatte bir
 *   - Lokal: PM2 cron veya manuel
 *   - Admin panel: tek tıkla tetikleme
 * 
 * GÜVENLİK:
 *   - CRON_SECRET ile auth (production)
 *   - localhost bypass (development)
 *   - 4dk timeout guard
 */
export async function GET(req: Request) {
  const startTime = Date.now();
  const cycleId = `mc_${Date.now()}`;
  
  // ─── AUTH ───
  const cronSecret = process.env.CRON_SECRET;
  const isLocalDev = req.headers.get('host')?.includes('localhost') || process.env.NODE_ENV === 'development';
  if (!isLocalDev) {
    if (!cronSecret) {
      console.warn("⚠️ CRON_SECRET is not set in environment! Production endpoint blocked for security.");
      return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 });
    }
    const authHeader = req.headers.get('authorization');
    const xCronHeader = req.headers.get('x-cron-secret');
    if (authHeader !== `Bearer ${cronSecret}` && xCronHeader !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const results: Record<string, any> = {
    cycleId,
    startedAt: new Date().toISOString(),
    steps: {},
  };

  // 4dk TIMEOUT GUARD
  const TIMEOUT_MS = 4 * 60 * 1000;
  const isTimedOut = () => (Date.now() - startTime) > TIMEOUT_MS;

  try {
    console.log(`\n${'═'.repeat(55)}`);
    console.log(`  ALOHA MASTER CYCLE — TEK BEYİN, TEK DÖNGÜ`);
    console.log(`  ${cycleId}`);
    console.log(`${'═'.repeat(55)}\n`);

    // 0. AUTHORITY CHECK (ExecuteTask üzerinden)
    const auth = await executeTask({
      nodeId: 'trtex',
      action: 'news_pipeline',
      payload: { task: 'master_cycle' },
      caller: 'cron_master_cycle',
    });

    if (!auth.success) {
      console.warn(`[MASTER CYCLE] 🚫 Otonom pipeline engellendi: ${auth.error}`);
      return NextResponse.json({ blocked: true, reason: auth.error }, { status: 403 });
    }

    // 0.1 RESET CIRCUIT BREAKER / METRICS
    if (adminDb) {
      try {
        await adminDb.collection('trtex_system_metrics').doc('current').set({
          image_errors_24h: 0,
          api_errors_24h: 0,
          core_errors_24h: 0,
          last_reset: new Date().toISOString()
        }, { merge: true });
        console.log(`[MASTER 0/5] 🛡️ Circuit breaker (hata sayaçları) sıfırlandı.`);
      } catch (err: any) {
        // non-blocking
      }
    }

    // ═══ ADIM 1: IMAGE QUEUE İŞLEME ═══
    console.log('\n[MASTER 1/3] 📸 Image Queue işleniyor...');
    try {
      const imageResult = await processImageQueue();
      results.steps.images = imageResult;
      console.log(`  → ${imageResult.processed} işlendi, ${imageResult.published} yayınlandı`);
    } catch (err: any) {
      results.steps.images = { error: err.message };
      console.error(`  ❌ Image hatası: ${err.message}`);
    }

    if (isTimedOut()) throw new Error('TIMEOUT: Adım 2 sonrası');

    // ═══ ADIM 2: TICKER REFRESH ═══
    console.log('\n[MASTER 2/3] 📊 Ticker verileri güncelleniyor...');
    try {
      const tickerResult = await refreshTickerData();
      results.steps.ticker = { result: tickerResult };
      console.log(`  → ${tickerResult}`);
    } catch (err: any) {
      results.steps.ticker = { error: err.message };
      console.error(`  ❌ Ticker hatası: ${err.message}`);
    }

    if (isTimedOut()) throw new Error('TIMEOUT: Adım 3 sonrası');

    // ═══ ADIM 3: TERMINAL PAYLOAD BUILD ═══
    console.log('\n[MASTER 3/3] 📦 Terminal Payload inşa ediliyor...');
    try {
      const payload = await buildTerminalPayload();
      results.steps.payload = {
        version: payload.version,
        iq: payload.intelligenceScore,
        hero: payload.heroArticle?.title?.substring(0, 50) || 'YOK',
        grid: payload.gridArticles.length,
        ticker: payload.tickerItems.length,
      };
      console.log(`  → v${payload.version} | IQ: ${payload.intelligenceScore}/100 | ${payload.gridArticles.length} haber`);
    } catch (err: any) {
      results.steps.payload = { error: err.message };
      console.error(`  ❌ Payload hatası: ${err.message}`);
    }

    // ═══ DÖNGÜ SONU: CYCLE LOG KAYDET ═══
    console.log('\n[MASTER END] 📝 Cycle log kaydediliyor...');
    const duration = Date.now() - startTime;
    results.duration_ms = duration;
    results.completedAt = new Date().toISOString();

    if (adminDb) {
      try {
        await adminDb.collection('aloha_master_cycles').doc(cycleId).set({
          ...results,
          success: true,
        });
      } catch { /* non-blocking */ }
    }

    console.log(`\n${'═'.repeat(55)}`);
    console.log(`  MASTER CYCLE TAMAMLANDI: ${(duration / 1000).toFixed(1)}s`);
    console.log(`${'═'.repeat(55)}\n`);

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (err: any) {
    const duration = Date.now() - startTime;
    const isTimeout = err.message?.includes('TIMEOUT');
    
    console.error(`[MASTER CYCLE] ${isTimeout ? '⏰' : '❌'} ${err.message}`);
    
    return NextResponse.json({
      success: false,
      error: err.message,
      duration_ms: duration,
      partial: isTimeout,
      steps: results.steps,
    }, { status: isTimeout ? 200 : 500 });
  }
}

// ═══════════════════════════════════════
// IMAGE QUEUE PROCESSOR (inline — tek pipeline)
// ═══════════════════════════════════════

async function processImageQueue(): Promise<{
  processed: number;
  published: number;
  failed: number;
  skipped: number;
}> {
  const result = { processed: 0, published: 0, failed: 0, skipped: 0 };
  
  if (!adminDb) return result;

  try {
    // Pending queue items çek
    const queueSnap = await adminDb.collection('trtex_image_queue')
      .where('status', '==', 'pending')
      .limit(10)
      .get();

    if (queueSnap.empty) {
      console.log('  → Kuyruk boş — yapacak iş yok');
      return result;
    }

    console.log(`  → ${queueSnap.size} haber kuyruktda`);

    // Lazy import — sadece ihtiyaç olduğunda yükle
    const { processMultipleImages } = await import('@/core/aloha/imageAgent');

    for (const qDoc of queueSnap.docs) {
      const qData = qDoc.data();
      const articleId = qData.articleId || qDoc.id;
      const retryCount = qData.retryCount || 0;
      const project: string = qData.project || 'trtex';
      const newsCollection = `${project}_news`;

      // Max 3 retry
      if (retryCount >= 3) {
        await qDoc.ref.update({ status: 'failed_permanent' });
        result.skipped++;
        continue;
      }

      // Haber var mı kontrol
      const articleRef = adminDb.collection(newsCollection).doc(articleId);
      const articleSnap = await articleRef.get();
      if (!articleSnap.exists) {
        await qDoc.ref.update({ status: 'article_not_found' });
        result.skipped++;
        continue;
      }

      const articleData = articleSnap.data()!;
      const title = articleData.translations?.TR?.title || articleData.title || '';
      const category = articleData.category || 'İstihbarat';

      if (!title) {
        result.skipped++;
        continue;
      }

      try {
        console.log(`  [GEN] 📸 3'lü set: "${title.slice(0, 45)}..." (1 Yeni, 2 Arşiv)`);

        // 3'lü görsel setini TEK seferde çağırıyoruz. 
        // processMultipleImages içeride 1 resim üretecek, diğerlerini (2 ve 3) arşivden çekecek.
        const allImages = await processMultipleImages(category, title, title, 3);
        const primaryImage = allImages[0] || '';

        if (primaryImage) {
          // Haberi güncelle: image + status → published
          await articleRef.update({
            image_url: primaryImage,
            images: allImages,
            image_generated: true,
            image_generated_at: new Date().toISOString(),
            image_count: allImages.length,
            image_status: 'ready',
            needs_image: false,
            status: 'published',
            publishedAt: articleData.publishedAt || new Date().toISOString(),
          });

          // Queue'yu tamamla
          await qDoc.ref.update({ status: 'completed', completedAt: new Date().toISOString() });
          
          result.processed++;
          result.published++;
          console.log(`  [✅] ${allImages.length}x görsel → published`);
        } else {
          result.failed++;
          await qDoc.ref.update({
            retryCount: retryCount + 1,
            lastAttempt: new Date().toISOString(),
          });
        }

        // Rate limit: 3s
        await new Promise(r => setTimeout(r, 3000));

      } catch (err: any) {
        result.failed++;
        await qDoc.ref.update({
          retryCount: retryCount + 1,
          lastAttempt: new Date().toISOString(),
          lastError: err.message?.substring(0, 200),
        });
        console.error(`  [❌] ${title.slice(0, 40)}: ${err.message?.substring(0, 60)}`);

        // Rate limit → DUR
        if (err.message?.includes('429') || err.message?.includes('quota')) {
          console.warn('  ⛔ Rate limit — durduruluyor');
          break;
        }
      }
    }
  } catch (err: any) {
    console.error(`  ❌ Queue tarama hatası: ${err.message}`);
  }

  // 1.4: Eğer yeni resim üretilip yayınlandıysa (published > 0), payload'u guncelle
  if (result.published > 0) {
    try {
      console.log(`  [MASTER] 📸 Yeni görseller yüklendiği için Terminal Payload tekrar oluşturuluyor...`);
      const { buildTerminalPayload } = await import('@/core/aloha/terminalPayloadBuilder');
      await buildTerminalPayload();
      console.log(`  [MASTER] ✅ Görsel sonrası Terminal Payload güncellendi.`);
    } catch (e: any) {
      console.error(`  ❌ Payload update hatası: ${e.message}`);
    }
  }

  return result;
}
