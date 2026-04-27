/**
 * TRTEX 79 Haber → Firebase Migrasyon  
 * Çalıştır: npx tsx src/core/tests/migrate-news.ts
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import * as admin from 'firebase-admin';
import * as fs from 'fs';

// Env'deki SA key'i kullan (Cloud Run'da çalışan key)
const saKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!saKey) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY .env.local içinde bulunamadı');
  process.exit(1);
}

const serviceAccount = JSON.parse(saKey);
console.log(`🔑 SA project: ${serviceAccount.project_id}, email: ${serviceAccount.client_email}`);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

async function main() {
  const jsonPath = 'C:/Users/MSI/Desktop/projeler zip/trtex.com/found_news.json';
  console.log(`\n📦 JSON okunuyor: ${jsonPath}`);
  
  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const articles = rawData.articles || [];
  console.log(`📰 ${articles.length} haber bulundu\n`);

  // Test: read access
  console.log('🧪 Firebase read testi...');
  const testSnap = await db.collection('trtex_news').limit(1).get();
  console.log(`✅ Read OK: ${testSnap.size} doc\n`);

  // Mevcut slug'lar
  const existingDocs = await db.collection('trtex_news').get();
  const existingSlugs = new Set();
  for (const doc of existingDocs.docs) {
    const d = doc.data();
    if (d.slug) existingSlugs.add(d.slug);
  }
  console.log(`🔥 Firebase'de mevcut: ${existingSlugs.size} haber\n`);

  let migrated = 0, skipped = 0, failed = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    if (!article.slug || !article.title) { skipped++; continue; }
    if (existingSlugs.has(article.slug)) {
      skipped++;
      continue;
    }

    try {
      await db.collection('trtex_news').add({
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
      if (migrated % 10 === 0) console.log(`  ✅ ${migrated} haber yazıldı...`);
    } catch (err: any) {
      failed++;
      console.log(`  ❌ ${article.title?.slice(0, 40)}: ${err.message}`);
    }
  }

  console.log(`\n═════════════════════════════════`);
  console.log(`📊 Toplam: ${articles.length} | ✅ ${migrated} | ⏭️ ${skipped} | ❌ ${failed}`);
  console.log(`═════════════════════════════════\n`);
  process.exit(0);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
