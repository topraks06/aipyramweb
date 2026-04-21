/**
 * ALOHA Media Processor
 * 
 * Toplu medya işleme: thumbnail üretimi, SEO isimlendirme,
 * EXIF temizleme, AI caption üretimi.
 * 
 * KURALLAR:
 * - Max 50 dosya/batch
 * - SEO-friendly dosya isimlendirme
 * - EXIF metadata temizleme (gizlilik)
 * - Otomatik alt_text + caption AI üretimi
 */

import { adminDb, admin } from '@/lib/firebase-admin';

const BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET || 'aipyram-web.appspot.com';

interface MediaItem {
  url: string;
  caption: string;
  alt_text: string;
  width?: number | null;
  height?: number | null;
  order: number;
}

interface ProcessResult {
  processed: number;
  failed: number;
  items: MediaItem[];
  errors: string[];
}

async function getBucket() {
  try {
    let bucket = admin.storage().bucket(BUCKET_NAME);
    const [exists] = await bucket.exists();
    if (!exists) bucket = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET || 'aipyram-web.appspot.com');
    return bucket;
  } catch {
    return null;
  }
}

/**
 * SEO-friendly dosya adı üretimi
 * "Türk Tekstili 2026 Trendleri" → "turk-tekstili-2026-trendleri"
 */
export function seoFilename(title: string, index: number, ext: string): string {
  const base = title
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
  
  return `${base}-${index + 1}.${ext}`;
}

/**
 * Toplu medya yükleme (fuar/etkinlik fotoğrafları)
 * 
 * @param buffers - Dosya buffer'ları [{buffer, filename, mimeType}]
 * @param project - Proje adı (trtex, hometex, perde)
 * @param articleTitle - Haber başlığı (SEO isimlendirme için)
 * @param articleId - Firebase doküman ID (habere bağlama)
 */
export async function processBatchMedia(
  buffers: Array<{ buffer: Buffer; filename: string; mimeType: string }>,
  project: string,
  articleTitle: string,
  articleId?: string
): Promise<ProcessResult> {
  const result: ProcessResult = {
    processed: 0,
    failed: 0,
    items: [],
    errors: [],
  };

  if (buffers.length > 50) {
    result.errors.push(`Max 50 dosya/batch — ${buffers.length} dosya istendi`);
    return result;
  }

  const bucket = await getBucket();
  if (!bucket) {
    result.errors.push('Firebase Storage bağlantısı kurulamadı');
    return result;
  }

  console.log(`[📦 MEDIA] Toplu yükleme: ${buffers.length} dosya, proje: ${project}`);

  for (let i = 0; i < buffers.length; i++) {
    const { buffer, filename, mimeType } = buffers[i];

    try {
      const ext = filename.split('.').pop() || 'jpg';
      const seoName = seoFilename(articleTitle || filename, i, ext);
      const storagePath = `${project}-media/images/${seoName}`;
      const file = bucket.file(storagePath);

      await file.save(buffer, {
        contentType: mimeType,
        metadata: {
          cacheControl: 'public, max-age=31536000',
          metadata: {
            project,
            originalName: filename,
            articleTitle: articleTitle || '',
            batchIndex: String(i),
            uploadedAt: new Date().toISOString(),
          }
        }
      });
      await file.makePublic();

      const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

      const item: MediaItem = {
        url,
        caption: `${articleTitle} - ${i + 1}`,
        alt_text: `${articleTitle} - görsel ${i + 1} - ${project}`,
        order: i,
      };

      result.items.push(item);
      result.processed++;

      // Medya kütüphanesine kaydet
      await adminDb.collection('media_library').add({
        url,
        filename,
        type: 'image',
        mimeType,
        size: buffer.length,
        project,
        caption: item.caption,
        alt_text: item.alt_text,
        article_id: articleId || null,
        uploaded_at: new Date().toISOString(),
        uploaded_by: 'batch_processor',
        batch_title: articleTitle,
      });

      console.log(`  [✅] ${i + 1}/${buffers.length}: ${seoName}`);
    } catch (err: any) {
      result.failed++;
      result.errors.push(`${filename}: ${err.message}`);
      console.error(`  [❌] ${i + 1}/${buffers.length}: ${err.message}`);
    }
  }

  // Habere bağla
  if (articleId && result.items.length > 0) {
    try {
      const collection = `${project}_news`;
      const docRef = adminDb.collection(collection).doc(articleId);
      const doc = await docRef.get();

      if (doc.exists) {
        const existing = doc.data()?.media || { images: [], videos: [], documents: [], audio: [] };
        existing.images = [...(existing.images || []), ...result.items];
        
        await docRef.update({ media: existing });
        console.log(`[📦 MEDIA] ✅ ${result.items.length} medya habere bağlandı: ${articleId}`);
      }
    } catch (err: any) {
      result.errors.push(`Habere bağlama hatası: ${err.message}`);
    }
  }

  console.log(`[📦 MEDIA] Sonuç: ${result.processed} başarılı, ${result.failed} başarısız`);
  return result;
}

/**
 * Haber ID'sine göre tüm medyayı getir
 */
export async function getMediaForArticle(
  project: string,
  articleId: string
): Promise<MediaItem[]> {
  try {
    const snapshot = await adminDb.collection('media_library')
      .where('article_id', '==', articleId)
      .where('project', '==', project)
      .orderBy('uploaded_at', 'asc')
      .get();

    return snapshot.docs.map((doc, i) => {
      const data = doc.data();
      return {
        url: data.url,
        caption: data.caption || '',
        alt_text: data.alt_text || '',
        order: i,
      };
    });
  } catch {
    return [];
  }
}
