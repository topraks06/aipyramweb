import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { processMultipleImages } from '@/core/aloha/imageAgent';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 dakika max

/**
 * GET /api/cron/image-processor
 * 
 * 🖼️ IMAGE QUEUE WORKER — Kuyruktaki görselleri üretir
 * 
 * Cloud Scheduler tarafından her 10 dakikada bir çağrılır.
 * trtex_image_queue koleksiyonundan pending görselleri alır,
 * Master Photographer (imageAgent) ile üretip haberi günceller.
 */

export async function GET(req: Request) {
  const startTime = Date.now();
  
  // Auth
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    const xCronHeader = req.headers.get('x-cron-secret');
    if (authHeader !== `Bearer ${cronSecret}` && xCronHeader !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const result = {
    processed: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    details: [] as Array<{ id: string; status: string }>,
  };

  try {
    console.log('[IMAGE-PROCESSOR] 🖼️ Kuyruk işleme başladı (Master Photographer Modu)');

    // Pending görselleri çek (son 5 haber max, 5 dk limite takılmasın)
    const queueSnap = await adminDb.collection('trtex_image_queue')
      .where('status', '==', 'pending')
      .limit(5)
      .get();

    if (queueSnap.empty) {
      console.log('[IMAGE-PROCESSOR] ✅ Kuyruk boş — yapacak iş yok');
      return NextResponse.json({ success: true, message: 'queue_empty', stats: result });
    }

    console.log(`[IMAGE-PROCESSOR] 📊 ${queueSnap.size} haber kuyrukta`);

    // Master Photographer oldukça yavaş çalıştığı için (deneme aralıkları vd.) sayıyı düşük tutalım
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

      // Mevcut haberi kontrol et
      const articleRef = adminDb.collection(newsCollection).doc(articleId);
      const articleSnap = await articleRef.get();
      if (!articleSnap.exists) {
        await qDoc.ref.update({ status: 'article_not_found' });
        result.skipped++;
        continue;
      }

      const articleData = articleSnap.data()!;
      
      const hasHero = articleData.image_url && !articleData.image_url.includes('placeholder');
      const hasMid = articleData.mid_image_url && !articleData.mid_image_url.includes('placeholder');
      const hasDetail = articleData.detail_image_url && !articleData.detail_image_url.includes('placeholder');

      if (hasHero && hasMid && hasDetail) {
        await qDoc.ref.update({ status: 'completed', completedAt: new Date().toISOString() });
        result.skipped++;
        result.details.push({ id: articleId, status: 'already_exists' });
        continue;
      }

      try {
        console.log(`[IMAGE-PROCESSOR] 🎨 Master Photographer çağrılıyor: ${articleId}`);
        const category = articleData.category || 'MARKET';
        const title = articleData.title || '';
        const content = articleData.content || articleData.summary || '';

        // Master Photographer (imageAgent) a devret (Otonom açılar, 3 görsel)
        const generatedUrls = await processMultipleImages(category, title, content, 3);

        if (generatedUrls && generatedUrls.length > 0) {
          const updateFields: Record<string, any> = {};
          
          if (!hasHero && generatedUrls[0]) {
             updateFields['image_url'] = generatedUrls[0];
             updateFields['imageUrl'] = generatedUrls[0];
          }
          if (!hasMid && generatedUrls[1]) {
             updateFields['mid_image_url'] = generatedUrls[1];
          }
          if (!hasDetail && generatedUrls[2]) {
             updateFields['detail_image_url'] = generatedUrls[2];
          }

          // Resimler varsa haberi yayınla
          updateFields['image_status'] = 'ready';
          updateFields['needs_image'] = false;
          updateFields['status'] = 'published';
          updateFields['publishedAt'] = articleData.publishedAt || new Date().toISOString();

          await articleRef.update(updateFields);
          await qDoc.ref.update({ status: 'completed', completedAt: new Date().toISOString() });
          
          result.success++;
          result.details.push({ id: articleId, status: 'generated' });
        } else {
          throw new Error('ImageAgent boş array döndürdü, üretilemedi.');
        }

      } catch (imgErr: any) {
        result.failed++;
        result.details.push({ id: articleId, status: `error: ${imgErr.message?.substring(0, 50)}` });
        console.warn(`[IMAGE-PROCESSOR] ❌ Hata (${articleId}): ${imgErr.message?.substring(0, 60)}`);
        
        await qDoc.ref.update({
          retryCount: retryCount + 1,
          lastAttempt: new Date().toISOString(),
        });
      }

      result.processed++;
    }

    const duration = Date.now() - startTime;
    console.log(`[IMAGE-PROCESSOR] 🏁 Tamamlandı: ${result.success} üretildi, ${result.failed} hata, ${duration}ms`);

    return NextResponse.json({
      success: true,
      duration_ms: duration,
      stats: result,
    });
  } catch (err: any) {
    console.error('[IMAGE-PROCESSOR] ❌ Hata:', err.message);
    return NextResponse.json({
      success: false,
      error: err.message,
      stats: result,
    }, { status: 500 });
  }
}

