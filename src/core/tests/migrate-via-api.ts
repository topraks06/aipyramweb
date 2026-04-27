/**
 * Lokal JSON → Cloud Run API ile Firebase'e migrasyon
 * Çalıştır: npx tsx src/core/tests/migrate-via-api.ts
 * 
 * Lokal'de JSON okur, Cloud Run endpoint'e POST eder
 * (Cloud Run'da Firebase izinleri çalışır)
 */
import * as fs from 'fs';

// ⚠️ ESKİ URL (pasif — referans için saklanıyor): https://aipyram-447227868528.europe-west1.run.app/api/admin/migrate-news
const API_URL = 'https://aipyram-web-994786407721.europe-west1.run.app/api/admin/migrate-news';
const JSON_PATH = 'C:/Users/MSI/Desktop/projeler zip/trtex.com/found_news.json';
const BATCH_SIZE = 5; // Küçük batch (timeout koruması)

async function main() {
  console.log(`\n📦 JSON okunuyor...`);
  const rawData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
  // Gereksiz ağır alanları çıkar (payload küçültme)
  const articles = (rawData.articles || []).map((a: any) => ({
    title: a.title,
    slug: a.slug,
    summary: a.summary || '',
    content: (a.content || '').substring(0, 10000), // Max 10K karakter
    category: a.category,
    tags: a.tags || [],
    source: a.source,
    published_at: a.published_at,
    created_at: a.created_at,
    seo: a.seo || {},
    ai_insight: (a.ai_insight || '').substring(0, 500),
    quality_score: a.quality_score,
    translations: a.translations ? {
      TR: a.translations.TR ? { title: a.translations.TR.title, summary: a.translations.TR.summary } : undefined,
      EN: a.translations.EN ? { title: a.translations.EN.title, summary: a.translations.EN.summary } : undefined,
      DE: a.translations.DE ? { title: a.translations.DE.title, summary: a.translations.DE.summary } : undefined,
    } : {},
  }));
  console.log(`📰 ${articles.length} haber bulundu\n`);

  let totalMigrated = 0, totalSkipped = 0, totalFailed = 0;

  // Batch'ler halinde gönder
  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(articles.length / BATCH_SIZE);

    console.log(`\n🚀 Batch ${batchNum}/${totalBatches} (${batch.length} haber)...`);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: batch }),
      });

      const data = await res.json();

      if (data.success) {
        totalMigrated += data.migrated;
        totalSkipped += data.skipped;
        totalFailed += data.failed;
        console.log(`  ✅ Migrated: ${data.migrated} | Skipped: ${data.skipped} | Failed: ${data.failed} | Firebase Total: ${data.existing}`);
      } else {
        console.log(`  ❌ API Hatası: ${data.error}`);
        totalFailed += batch.length;
      }

      // Rate limiting
      if (i + BATCH_SIZE < articles.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (err: any) {
      console.log(`  ❌ Network: ${err.message}`);
      totalFailed += batch.length;
    }
  }

  console.log(`\n═════════════════════════════════════`);
  console.log(`📊 TOPLAM SONUÇ:`);
  console.log(`  📰 Toplam: ${articles.length}`);
  console.log(`  ✅ Migrate: ${totalMigrated}`);
  console.log(`  ⏭️ Atlanan: ${totalSkipped}`);
  console.log(`  ❌ Hata: ${totalFailed}`);
  console.log(`═════════════════════════════════════\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
