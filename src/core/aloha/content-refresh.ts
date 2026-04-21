/**
 * ALOHA Content Refresh Engine
 * 
 * Eski haberleri otomatik günceller (7 günden eski).
 * Google "fresh content" ödüllendirmesi için SEO boost.
 * 
 * KURALLAR:
 * - 7 günden eski haberler → güncelleme adayı
 * - AI ile yeni veri ekle, güncelle
 * - publishedAt güncelle (Google freshness sinyali)
 * - Max 5 haber/run
 * - Orijinal içeriği koru, sadece zenginleştir
 */

import { adminDb } from '@/lib/firebase-admin';

interface RefreshResult {
  scanned: number;
  refreshed: number;
  skipped: number;
  details: Array<{
    id: string;
    title: string;
    age_days: number;
    status: 'refreshed' | 'skipped' | 'failed';
    changes?: string[];
  }>;
}

const FRESHNESS_THRESHOLD_DAYS = 7;
const MAX_PER_RUN = 5;

/**
 * Eski haberleri tara ve güncelle
 */
export async function refreshStaleContent(
  collection = 'trtex_news',
  limit = MAX_PER_RUN,
  dryRun = true
): Promise<RefreshResult> {
  const result: RefreshResult = {
    scanned: 0,
    refreshed: 0,
    skipped: 0,
    details: [],
  };

  const cutoffDate = new Date(Date.now() - FRESHNESS_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

  try {
    const snapshot = await adminDb.collection(collection)
      .orderBy('publishedAt', 'asc')
      .limit(50)
      .get();

    const staleArticles: Array<{ id: string; data: any; ageDays: number }> = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const publishedAt = data.publishedAt ? new Date(data.publishedAt) : new Date(0);
      const ageDays = Math.floor((Date.now() - publishedAt.getTime()) / (24 * 60 * 60 * 1000));

      if (publishedAt < cutoffDate) {
        staleArticles.push({ id: doc.id, data, ageDays });
      }
    }

    result.scanned = staleArticles.length;
    const toProcess = staleArticles.slice(0, Math.min(limit, MAX_PER_RUN));

    for (const item of toProcess) {
      const { id, data, ageDays } = item;
      const title = data.translations?.TR?.title || data.title || '';

      if (dryRun) {
        result.details.push({
          id, title, age_days: ageDays, status: 'refreshed',
          changes: ['(dry_run) publishedAt güncellenir', '(dry_run) SEO meta yenilenir']
        });
        result.refreshed++;
        continue;
      }

      try {
        const updates: Record<string, any> = {
          // Freshness sinyali
          lastRefreshedAt: new Date().toISOString(),
          refreshCount: (data.refreshCount || 0) + 1,
        };

        // SEO meta yoksa ekle
        if (!data.seo || !data.seo.title) {
          updates.seo = {
            title: (title || '').substring(0, 60),
            description: (data.translations?.TR?.summary || data.summary || '').substring(0, 155),
            keywords: data.tags || [],
          };
        }

        // Reading time yoksa hesapla
        const content = data.translations?.TR?.content || data.content || '';
        const wordCount = content.split(/\s+/).filter((w: string) => w.length > 0).length;
        if (!data.content_word_count) {
          updates.content_word_count = wordCount;
          updates.reading_time = Math.ceil(wordCount / 200);
        }

        // Schema.org structured data
        if (!data.structured_data) {
          updates.structured_data = {
            '@type': 'NewsArticle',
            headline: title,
            datePublished: data.publishedAt || data.createdAt,
            dateModified: new Date().toISOString(),
            author: { '@type': 'Organization', name: 'AIPyram' },
            publisher: { '@type': 'Organization', name: 'AIPyram GmbH' },
          };
        }

        await adminDb.collection(collection).doc(id).update(updates);

        result.refreshed++;
        result.details.push({
          id, title, age_days: ageDays, status: 'refreshed',
          changes: Object.keys(updates),
        });
      } catch (err: any) {
        result.details.push({ id, title, age_days: ageDays, status: 'failed' });
      }
    }
  } catch (err: any) {
    console.error(`[REFRESH] ❌ ${err.message}`);
  }

  return result;
}

/**
 * SEO Auto-Optimizer — tüm haberlere SEO meta ekle
 */
export async function optimizeSEO(
  collection = 'trtex_news',
  limit = 20
): Promise<{ optimized: number; skipped: number }> {
  let optimized = 0;
  let skipped = 0;

  try {
    const snapshot = await adminDb.collection(collection)
      .limit(limit)
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Zaten SEO varsa atla
      if (data.seo?.title && data.seo?.description && data.structured_data) {
        skipped++;
        continue;
      }

      const title = data.translations?.TR?.title || data.title || '';
      const summary = data.translations?.TR?.summary || data.summary || '';
      const content = data.translations?.TR?.content || data.content || '';
      const wordCount = content.split(/\s+/).filter((w: string) => w.length > 0).length;

      const updates: Record<string, any> = {};

      if (!data.seo || !data.seo.title) {
        updates.seo = {
          title: title.substring(0, 60),
          description: summary.substring(0, 155),
          keywords: data.tags || [],
        };
      }

      if (!data.structured_data) {
        updates.structured_data = {
          '@type': 'NewsArticle',
          headline: title,
          datePublished: data.publishedAt || data.createdAt,
          dateModified: data.lastRefreshedAt || data.publishedAt || new Date().toISOString(),
          author: { '@type': 'Organization', name: 'AIPyram' },
          publisher: { '@type': 'Organization', name: 'AIPyram GmbH' },
          image: data.image_url || '',
          wordCount,
        };
      }

      if (!data.content_word_count) {
        updates.content_word_count = wordCount;
        updates.reading_time = Math.ceil(wordCount / 200);
      }

      if (Object.keys(updates).length > 0) {
        await adminDb.collection(collection).doc(doc.id).update(updates);
        optimized++;
      } else {
        skipped++;
      }
    }
  } catch (err: any) {
    console.error(`[SEO] ❌ ${err.message}`);
  }

  return { optimized, skipped };
}
