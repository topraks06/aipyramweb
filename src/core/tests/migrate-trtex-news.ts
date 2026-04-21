/**
 * TRTEX Haber Migration Script
 * 
 * Eski data/published/ dizinindeki JSON haberlerini
 * Firebase trtex_news koleksiyonuna aktarır.
 * 
 * Kurallar:
 * - Aynı slug varsa → atla (duplicate koruması)
 * - image_url boşsa → boş olarak yükle (Aloha sonra ekler)
 * - İçerik, çeviriler, kategori korunur
 * 
 * Kullanım:
 *   Set-Location "c:\Users\MSI\Desktop\aipyramweb"
 *   npx tsx src/core/tests/migrate-trtex-news.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { adminDb } from '../../lib/firebase-admin';
import fs from 'fs';
import path from 'path';

const PUBLISHED_DIR = 'c:/Users/MSI/Desktop/projeler zip/trtex.com/data/published';
const COLLECTION = 'trtex_news';

async function migrate() {
  console.log('═'.repeat(60));
  console.log('🔄 TRTEX Haber Migration — data/published → Firebase');
  console.log('═'.repeat(60));

  if (!fs.existsSync(PUBLISHED_DIR)) {
    console.error('❌ Dizin bulunamadı:', PUBLISHED_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(PUBLISHED_DIR).filter(f => f.endsWith('.json'));
  console.log(`📂 ${files.length} JSON dosyası bulundu\n`);

  // Mevcut Firebase haberleri al (duplicate kontrolü)
  const existingSnapshot = await adminDb.collection(COLLECTION).get();
  const existingSlugs = new Set<string>();
  const existingTitles = new Set<string>();
  
  existingSnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.slug) existingSlugs.add(data.slug);
    if (data.title) existingTitles.add(data.title.toLowerCase().trim());
  });

  console.log(`📊 Firebase'de mevcut: ${existingSnapshot.size} haber`);
  console.log(`🔍 Duplicate kontrolü: ${existingSlugs.size} slug kayıtlı\n`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    try {
      let raw = fs.readFileSync(path.join(PUBLISHED_DIR, file), 'utf-8');
      // BOM temizliği
      if (raw.charCodeAt(0) === 0xFEFF) raw = raw.substring(1);

      const data = JSON.parse(raw);
      const slug = data.slug || file.replace('.json', '');
      const title = (data.title || '').toLowerCase().trim();

      // Duplicate kontrolü
      if (existingSlugs.has(slug) || existingTitles.has(title)) {
        console.log(`  ⏭️  ATLA (zaten var): ${slug.slice(0, 50)}...`);
        skipped++;
        continue;
      }

      // Firebase'e yaz
      const doc = {
        title: data.title || '',
        slug: slug,
        content: data.content || '',
        summary: data.summary || '',
        category: data.category || 'İstihbarat',
        image_url: data.image_url || data.cover_image || '', // Boş olabilir — Aloha düzeltecek
        publishedAt: data.published_at || data.created_at || new Date().toISOString(),
        createdAt: data.created_at || data.published_at || new Date().toISOString(),
        tags: Array.isArray(data.tags) ? data.tags : [],
        source: data.source || '',
        source_urls: data.source_urls || [],
        qualityScore: data.quality_score || data.opportunity_score || 0,
        urgency: data.urgency || 'normal',
        terminal_comment: data.ai_insight || data.terminal_comment || '',
        ai_action: data.ai_action || '',
        related_company: data.related_company || '',
        trust_score: data.trust_score || data.confidence || 0,
        commercial_score: data.commercial_score || data.opportunity_score || 0,
        reading_time: data.reading_time || Math.max(3, Math.ceil((data.content?.split(' ')?.length || 100) / 200)),
        translations: data.translations || {},
        target_audience: data.target_audience || {},
        sector_action: data.sector_action || '',
        images: data.images || [],
        videos: data.videos || [],
        status: 'published',
        _migrated_from: 'data/published',
        _migrated_at: new Date().toISOString(),
        _original_file: file,
      };

      await adminDb.collection(COLLECTION).add(doc);
      imported++;
      
      const hasImage = doc.image_url && doc.image_url.trim() !== '';
      const imageIcon = hasImage ? '🖼️' : '⚠️';
      console.log(`  ✅ ${imageIcon} İMPORT: ${slug.slice(0, 60)}...`);

    } catch (err: any) {
      console.error(`  ❌ HATA [${file}]: ${err.message}`);
      errors++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 MİGRASYON SONUCU:');
  console.log(`  ✅ İmport edildi: ${imported}`);
  console.log(`  ⏭️  Atlandı (duplicate): ${skipped}`);
  console.log(`  ❌ Hata: ${errors}`);
  console.log(`  📂 Toplam dosya: ${files.length}`);
  console.log(`  🔥 Firebase toplam: ${existingSnapshot.size + imported} haber`);
  
  if (imported > 0) {
    console.log(`\n⚠️ ${imported} haberin görselleri kontrol edilmeli.`);
    console.log('👉 Aloha resimsiz haberlere otomatik görsel ekleyecek.');
  }
  console.log('═'.repeat(60));
}

migrate().catch(err => {
  console.error('💀 Migration hatası:', err);
  process.exit(1);
});
