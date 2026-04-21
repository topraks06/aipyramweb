import fs from 'fs';
import path from 'path';
import { adminDb } from '../src/lib/firebase-admin';
import { processImageForContent } from '../src/core/swarm/imageAgent';

const TRTEX_DATA_DIR = 'C:/Users/MSI/Desktop/projeler zip/trtex.com/data/published';

async function main() {
  console.log('[🚀 GÖÇ BAŞLIYOR] TRTEX yerel JSON dosyaları taranıyor...');
  
  if (!fs.existsSync(TRTEX_DATA_DIR)) {
    console.error(`[🚨 HATA] TRTEX veri dizini bulunamadı: ${TRTEX_DATA_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(TRTEX_DATA_DIR).filter(f => f.endsWith('.json'));
  console.log(`[🔍 BİLGİ] Toplam ${files.length} lokal json dosyası bulundu.`);

  let migratedCount = 0;
  const batchList: Promise<void>[] = [];

  for (const filename of files) {
    try {
      const raw = fs.readFileSync(path.join(TRTEX_DATA_DIR, filename), 'utf8');
      const data = JSON.parse(raw.trim());

      const currentUrl = data.image_url || data.imageUrl;
      const title = data.translations?.TR?.title || data.title || filename;
      const category = data.category || "Haber";
      
      const isBroken = !currentUrl || 
        currentUrl.includes('example.com') ||
        currentUrl.includes('<mock>') ||
        currentUrl.includes('supabase') ||
        currentUrl === 'undefined' ||
        currentUrl === 'null' ||
        currentUrl === '';

      let finalImageUrl = currentUrl;

      // Kırık ise AI imageAgent üzerinden atama yap
      if (isBroken) {
        finalImageUrl = await processImageForContent('news', category, title);
        console.log(`[🔧 GÖRSEL ONARILDI] ${title.substring(0,30)}... -> Yeni URL: ${finalImageUrl.substring(0, 30)}...`);
      }

      const docId = data.id || filename.replace('.json', '');

      // Firebase Migration Document Mapping
      const firebaseNews = {
        id: docId,
        title: title,
        summary: data.summary || data.description || '',
        content: data.content || data.body || '',
        category: category,
        slug: data.slug || docId,
        image_url: finalImageUrl,
        published_at: data.published_at || data.createdAt || new Date().toISOString(),
        created_at: data.created_at || new Date().toISOString(),
        tags: data.tags || [],
        status: data.status || 'published',
        ai_insight: data.ai_insight || null,
        translations: data.translations || null,
        _migrated_from_json: true
      };

      const docRef = adminDb.collection('trtex_news').doc(docId);
      
      const p = docRef.set(firebaseNews, { merge: true }).then(() => {
        migratedCount++;
        if (migratedCount % 10 === 0) {
          console.log(`   ✅ ${migratedCount} haber taşındı...`);
        }
      });
      batchList.push(p);

    } catch (e) {
      console.error(`[🚨 HATA] Dosya atlandı: ${filename}`, e);
    }
  }

  if (batchList.length > 0) {
    console.log(`[⏳ BEKLE] ${batchList.length} haber asenkron olarak Firebase'e yükleniyor...`);
    await Promise.all(batchList);
    console.log(`[🎉 BİTTİ] ${migratedCount} JSON haberi MÜKEMMEL görsellerle Firebase trtex_news koleksiyonuna kopyalandı!`);
  }

  process.exit(0);
}

main();
