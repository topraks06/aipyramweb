/**
 * ALOHA Self-Healing: Broken Image Detector
 * 
 * Firebase'deki haberlerin görsellerini kontrol eder.
 * 404 dönen görselleri tespit edip yeniden üretir.
 * 
 * KURALLAR:
 * - HEAD request ile hızlı kontrol
 * - 404/403/500 → kırık görsel
 * - Max 30 haber/run
 * - Kırık görsel → processImageForContent ile yeniden üret
 */

import { adminDb } from '@/lib/firebase-admin';
import { processImageForContent } from './imageAgent';

interface HealthCheckResult {
  checked: number;
  healthy: number;
  broken: number;
  fixed: number;
  details: Array<{
    id: string;
    title: string;
    image_url: string;
    status: number;
    action: 'ok' | 'broken' | 'fixed' | 'fix_failed';
    new_url?: string;
  }>;
}

const MAX_PER_RUN = 30;

/**
 * Tüm haberlerin görsel URL'lerini kontrol et
 */
export async function checkImageHealth(
  collection = 'trtex_news',
  limit = MAX_PER_RUN,
  autoFix = false
): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    checked: 0,
    healthy: 0,
    broken: 0,
    fixed: 0,
    details: [],
  };

  try {
    const snapshot = await adminDb.collection(collection)
      .orderBy('publishedAt', 'desc')
      .limit(Math.min(limit, MAX_PER_RUN))
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const imageUrl = data.image_url || '';
      const title = data.translations?.TR?.title || data.title || '';

      if (!imageUrl || imageUrl.trim() === '') {
        result.broken++;
        result.details.push({
          id: doc.id, title, image_url: '(boş)', status: 0, action: 'broken'
        });
        result.checked++;
        continue;
      }

      // HEAD request ile kontrol (hızlı)
      try {
        const response = await fetch(imageUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        result.checked++;

        if (response.ok) {
          result.healthy++;
          result.details.push({
            id: doc.id, title, image_url: imageUrl, status: response.status, action: 'ok'
          });
        } else {
          result.broken++;

          if (autoFix) {
            try {
              const category = data.category || 'İstihbarat';
              const newUrl = await processImageForContent('news', category, title);
              
              await adminDb.collection(collection).doc(doc.id).update({
                image_url: newUrl,
                image_generated: true,
                image_generated_at: new Date().toISOString(),
                _image_fixed_from: imageUrl,
              });

              result.fixed++;
              result.details.push({
                id: doc.id, title, image_url: imageUrl, status: response.status, action: 'fixed', new_url: newUrl
              });
            } catch {
              result.details.push({
                id: doc.id, title, image_url: imageUrl, status: response.status, action: 'fix_failed'
              });
            }
          } else {
            result.details.push({
              id: doc.id, title, image_url: imageUrl, status: response.status, action: 'broken'
            });
          }
        }
      } catch {
        result.checked++;
        result.broken++;
        result.details.push({
          id: doc.id, title, image_url: imageUrl, status: 0, action: 'broken'
        });
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, 200));
    }
  } catch (err: any) {
    console.error(`[HEALTH] ❌ ${err.message}`);
  }

  return result;
}
