import { NextRequest, NextResponse } from 'next/server';
import { adminDb, admin } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Max 50MB dosya
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_BATCH_SIZE = 500 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
};

function getMediaType(mimeType: string): string {
  for (const [type, mimes] of Object.entries(ALLOWED_TYPES)) {
    if (mimes.includes(mimeType)) return type;
  }
  return 'unknown';
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

/**
 * POST /api/v1/media/upload
 * 
 * Multipart form-data ile dosya yükleme.
 * 
 * Form fields:
 * - file: Dosya (zorunlu)
 * - project: Proje adı (trtex, hometex, perde — varsayılan: trtex)
 * - caption: Açıklama (opsiyonel)
 * - alt_text: SEO alt text (opsiyonel)
 * - article_id: Bağlı haber ID (opsiyonel)
 * 
 * Desteklenen formatlar: jpg, png, webp, gif, mp4, webm, mp3, wav, pdf, doc, xlsx
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const project = (formData.get('project') as string) || 'trtex';
    const caption = (formData.get('caption') as string) || '';
    const altText = (formData.get('alt_text') as string) || '';
    const articleId = (formData.get('article_id') as string) || '';

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'Dosya bulunamadı' }, { status: 400 });
    }

    // Toplam boyut kontrolü
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_BATCH_SIZE) {
      return NextResponse.json({
        success: false,
        error: `Toplam dosya boyutu çok büyük: ${(totalSize / 1024 / 1024).toFixed(1)}MB (max ${MAX_BATCH_SIZE / 1024 / 1024}MB)`
      }, { status: 413 });
    }

    const BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET || 'aipyram-web.appspot.com';
    let bucket;
    try {
      bucket = admin.storage().bucket(BUCKET_NAME);
      const [exists] = await bucket.exists();
      if (!exists) bucket = admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET || 'aipyram-web.appspot.com');
    } catch {
      return NextResponse.json({ success: false, error: 'Storage bağlantısı kurulamadı' }, { status: 500 });
    }

    const results: Array<{
      filename: string;
      url: string;
      type: string;
      size: number;
      caption: string;
      alt_text: string;
    }> = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Boyut kontrolü
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Dosya çok büyük (${(file.size / 1024 / 1024).toFixed(1)}MB, max 50MB)`);
        continue;
      }

      // Tip kontrolü
      const mediaType = getMediaType(file.type);
      if (mediaType === 'unknown') {
        errors.push(`${file.name}: Desteklenmeyen dosya türü (${file.type})`);
        continue;
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.name.split('.').pop() || 'bin';
        const safeName = sanitizeFilename(file.name.replace(`.${ext}`, ''));
        const filename = `${project}-media/${mediaType}/${safeName}-${Date.now()}-${i}.${ext}`;
        const gcsFile = bucket.file(filename);

        await gcsFile.save(buffer, {
          contentType: file.type,
          metadata: {
            cacheControl: 'public, max-age=31536000',
            metadata: {
              project,
              uploadedAt: new Date().toISOString(),
              originalName: file.name,
              caption: caption || '',
              altText: altText || '',
            }
          }
        });
        await gcsFile.makePublic();

        const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;

        results.push({
          filename: file.name,
          url,
          type: mediaType,
          size: file.size,
          caption: caption || file.name,
          alt_text: altText || `${project} ${mediaType} - ${safeName}`,
        });

        // Firebase'e medya kaydı
        await adminDb.collection('media_library').add({
          url,
          filename: file.name,
          type: mediaType,
          mimeType: file.type,
          size: file.size,
          project,
          caption: caption || '',
          alt_text: altText || '',
          article_id: articleId || null,
          uploaded_at: new Date().toISOString(),
          uploaded_by: 'admin',
        });

      } catch (err: any) {
        errors.push(`${file.name}: Yükleme hatası — ${err.message}`);
      }
    }

    // Eğer article_id varsa, haberin media alanını güncelle
    if (articleId && results.length > 0) {
      try {
        const articleRef = adminDb.collection(`${project}_news`).doc(articleId);
        const articleDoc = await articleRef.get();
        
        if (articleDoc.exists) {
          const existing = articleDoc.data()?.media || { images: [], videos: [], documents: [], audio: [] };
          
          for (const r of results) {
            const mediaItem = { url: r.url, caption: r.caption, alt_text: r.alt_text, order: existing[`${r.type}s`]?.length || 0 };
            
            if (r.type === 'image') {
              existing.images = [...(existing.images || []), { ...mediaItem, width: null, height: null }];
            } else if (r.type === 'video') {
              existing.videos = [...(existing.videos || []), { ...mediaItem, duration: null, thumbnail: null }];
            } else if (r.type === 'document') {
              existing.documents = [...(existing.documents || []), { url: r.url, name: r.filename, type: r.type, size: r.size }];
            } else if (r.type === 'audio') {
              existing.audio = [...(existing.audio || []), { ...mediaItem, duration: null, title: r.caption }];
            }
          }

          await articleRef.update({ media: existing });
        }
      } catch (linkErr: any) {
        errors.push(`Habere bağlama hatası: ${linkErr.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      uploaded: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error('[MEDIA UPLOAD] ❌', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/v1/media/upload
 * Medya kütüphanesini listele
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project') || '';
    const type = searchParams.get('type') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    let query: any = adminDb.collection('media_library').orderBy('uploaded_at', 'desc');
    
    if (project) query = query.where('project', '==', project);
    if (type) query = query.where('type', '==', type);
    
    const snapshot = await query.limit(Math.min(limit, 200)).get();

    const media = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      total: media.length,
      data: media,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
