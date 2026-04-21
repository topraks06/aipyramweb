/**
 * TRTEX Haber Migrasyon Scripti
 * 
 * found_news.json → Firebase trtex_news koleksiyonuna
 * 79 haberi yükler (duplicate korumalı)
 */

import { adminDb } from '@/lib/firebase-admin';

interface Article {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  image_url: string;
  images?: string[];
  tags: string[];
  translations?: Record<string, any>;
  published_at?: string;
  created_at?: string;
  status?: string;
  seo?: Record<string, any>;
  ai_insight?: string;
  source?: string;
  quality_score?: number;
  [key: string]: any;
}

export async function migrateNewsToFirebase(): Promise<{
  total: number;
  migrated: number;
  skipped: number;
  failed: number;
  details: string[];
}> {
  const result = {
    total: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    details: [] as string[],
  };

  console.log('\n[📦 MIGRATION] ═══════════════════════════════════');
  console.log('[📦 MIGRATION] found_news.json → Firebase trtex_news');
  console.log('[📦 MIGRATION] ═══════════════════════════════════\n');

  try {
    // JSON dosyasını oku
    const fs = require('fs');
    const jsonPath = 'C:/Users/MSI/Desktop/projeler zip/trtex.com/found_news.json';
    
    if (!fs.existsSync(jsonPath)) {
      return { ...result, details: ['❌ found_news.json bulunamadı'] };
    }

    const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const articles: Article[] = rawData.articles || [];
    result.total = articles.length;

    console.log(`[📦 MIGRATION] ${articles.length} haber bulundu\n`);

    // Mevcut slug'ları al (duplicate koruması)
    const existingDocs = await adminDb.collection('trtex_news').get();
    const existingSlugs = new Set<string>();
    for (const doc of existingDocs.docs) {
      const data = doc.data();
      if (data.slug) existingSlugs.add(data.slug);
    }
    console.log(`[📦 MIGRATION] Firestored mevcut: ${existingSlugs.size} haber\n`);

    // Batch yazım (500'lük parçalar halinde)
    const batch = adminDb.batch();
    let batchCount = 0;

    for (const article of articles) {
      if (!article.slug || !article.title) {
        result.skipped++;
        continue;
      }

      // Duplicate kontrolü
      if (existingSlugs.has(article.slug)) {
        result.skipped++;
        result.details.push(`⏭️ ${article.title.slice(0, 50)} (zaten var)`);
        continue;
      }

      try {
        const docRef = adminDb.collection('trtex_news').doc();
        
        const docData: Record<string, any> = {
          title: article.title,
          slug: article.slug,
          summary: article.summary || '',
          content: article.content || '',
          category: article.category || 'İstihbarat',
          tags: article.tags || [],
          status: 'published',
          source: article.source || 'migration',
          
          // Görsel — lokal path'i temizle, boş bırak (scanner dolduracak)
          image_url: '', // Scanner ile otonom üretilecek
          image_generated: false,
          
          // Tarihler
          publishedAt: article.published_at || article.created_at || new Date().toISOString(),
          createdAt: article.created_at || new Date().toISOString(),
          migratedAt: new Date().toISOString(),
          
          // SEO
          seo: article.seo || {},
          
          // AI
          ai_insight: article.ai_insight || '',
          quality_score: article.quality_score || 0,
          
          // Çeviriler
          translations: article.translations || { TR: { title: article.title, summary: article.summary } },
        };

        batch.set(docRef, docData);
        batchCount++;
        existingSlugs.add(article.slug);
        result.migrated++;
        result.details.push(`✅ ${article.title.slice(0, 50)}`);

        // Firestore batch limit: 500
        if (batchCount >= 450) {
          await batch.commit();
          console.log(`[📦 MIGRATION] Batch commit: ${batchCount} haber yazıldı`);
          batchCount = 0;
        }
      } catch (err: any) {
        result.failed++;
        result.details.push(`❌ ${article.title?.slice(0, 50)}: ${err.message}`);
      }
    }

    // Son batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`[📦 MIGRATION] Final batch commit: ${batchCount} haber yazıldı`);
    }

  } catch (err: any) {
    result.details.push(`❌ Migration hatası: ${err.message}`);
  }

  console.log(`\n[📦 MIGRATION] ═══════════════════════════════════`);
  console.log(`[📦 MIGRATION] SONUÇ:`);
  console.log(`  Toplam: ${result.total}`);
  console.log(`  Migrate: ${result.migrated}`);
  console.log(`  Atlanan: ${result.skipped}`);
  console.log(`  Başarısız: ${result.failed}`);
  console.log(`[📦 MIGRATION] ═══════════════════════════════════\n`);

  return result;
}
