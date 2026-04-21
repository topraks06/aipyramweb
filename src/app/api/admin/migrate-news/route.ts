import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/migrate-news
 * 
 * Body: { articles: Article[], dryRun?: boolean }
 * 
 * 79 haberi Firebase'e yükler (Cloud Run ortamında izinler çalışır)
 */
export async function POST(req: Request) {
  try {
    const { articles, dryRun = false } = await req.json();

    if (!Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ error: 'articles array gerekli' }, { status: 400 });
    }

    // Mevcut slug'lar (duplicate koruması)
    const existingDocs = await adminDb.collection('trtex_news').get();
    const existingSlugs = new Set<string>();
    for (const doc of existingDocs.docs) {
      const d = doc.data();
      if (d.slug) existingSlugs.add(d.slug);
    }

    let migrated = 0, skipped = 0, failed = 0;
    const details: string[] = [];

    for (const article of articles) {
      if (!article.slug || !article.title) { skipped++; continue; }
      if (existingSlugs.has(article.slug)) { skipped++; continue; }

      if (dryRun) {
        migrated++;
        details.push(`[DRY] ${article.title.slice(0, 60)}`);
        continue;
      }

      try {
        await adminDb.collection('trtex_news').add({
          title: article.title,
          slug: article.slug,
          summary: article.summary || '',
          content: article.content || '',
          category: article.category || 'İstihbarat',
          tags: article.tags || [],
          status: 'published',
          source: article.source || 'newsroom-pipeline',
          image_url: '',
          image_generated: false,
          publishedAt: article.published_at || article.created_at || new Date().toISOString(),
          createdAt: article.created_at || new Date().toISOString(),
          migratedAt: new Date().toISOString(),
          seo: article.seo || {},
          ai_insight: article.ai_insight || '',
          quality_score: article.quality_score || 0,
          translations: article.translations || {},
        });
        existingSlugs.add(article.slug);
        migrated++;
      } catch (err: any) {
        failed++;
        details.push(`❌ ${article.title?.slice(0, 40)}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      total: articles.length,
      migrated,
      skipped,
      failed,
      existing: existingSlugs.size,
      details: details.slice(0, 20),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
