import { adminDb } from '@/lib/firebase-admin';

/**
 * aipyram MERKEZ KÜTÜPHANE (SOVEREIGN MEDIA LIBRARY)
 * 
 * Tüm projelerdeki (TRTEX, Perde.ai, Hometex.ai) görseller ve haberler
 * burada merkezi olarak kaydedilir. HİÇBİR ŞEY SİLİNMEZ.
 * 
 * Koleksiyonlar:
 * - aipyram_media_library: Tüm görseller (URL, metadata, proje, kategori)
 * - aipyram_news_archive: Tüm haberler (asla silinmez, sadece arşivlenir)
 * 
 * Kullanım:
 * - TRTEX haber görseli üretildiğinde → registerMedia()
 * - Perde.ai model görseli üretildiğinde → registerMedia()
 * - Hometex.ai fuar görseli üretildiğinde → registerMedia()
 * - Eski haber "silinecek" olduğunda → archiveNews() (silmez, arşivler)
 * - Uygun görsel aranırken → searchMedia() (projeler arası paylaşım)
 */

// ═══════════════════════════════════════
// GÖRSEL KAYIT (Asla Kaybolmaz)
// ═══════════════════════════════════════

export interface MediaAsset {
  id?: string;
  url: string;                  // GCS URL
  project: string;              // 'trtex' | 'perde' | 'hometex' | 'didimemlak'
  type: string;                 // 'news_hero' | 'news_mid' | 'news_macro' | 'product' | 'fair' | 'model'
  category: string;             // 'perde', 'ev_tekstili', 'dosemelik', 'hammadde', 'fuar'
  keywords: string[];           // Arama için anahtar kelimeler
  title: string;                // Orijinal haber/ürün başlığı
  width?: number;
  height?: number;
  sizeBytes?: number;
  generatedBy: string;          // 'imagen_3' | 'imagen_4' | 'vertex_ai' | 'manual'
  createdAt: string;
  articleId?: string;           // Bağlı haber ID (varsa)
  reusable: boolean;            // Başka projelerde kullanılabilir mi?
  usageCount: number;           // Kaç kez kullanıldı
  lastUsedAt?: string;
  tags?: string[];              // Ek etiketler
}

export async function registerMedia(asset: Omit<MediaAsset, 'usageCount' | 'createdAt'>): Promise<string | null> {
  if (!adminDb) {
    console.warn('[MEDIA LIBRARY] Firestore bağlantısı yok, kayıt atlandı.');
    return null;
  }

  try {
    const docRef = adminDb.collection('aipyram_media_library').doc();
    const fullAsset: MediaAsset = {
      ...asset,
      id: docRef.id,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      reusable: asset.reusable ?? true,
    };

    await docRef.set(fullAsset);
    console.log(`📸 [MEDIA LIBRARY] Görsel kaydedildi: ${asset.title?.substring(0, 40)} (${asset.project}/${asset.type})`);
    return docRef.id;
  } catch (e: any) {
    console.warn(`⚠️ [MEDIA LIBRARY] Kayıt hatası:`, e.message);
    return null;
  }
}

// ═══════════════════════════════════════
// GÖRSEL ARAMA (Projeler Arası Paylaşım)
// ═══════════════════════════════════════

export async function searchMedia(opts: {
  project?: string;
  category?: string;
  keywords?: string[];
  type?: string;
  limit?: number;
}): Promise<MediaAsset[]> {
  if (!adminDb) return [];

  try {
    let query: any = adminDb.collection('aipyram_media_library')
      .where('reusable', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(opts.limit || 20);

    if (opts.project) {
      query = adminDb.collection('aipyram_media_library')
        .where('project', '==', opts.project)
        .orderBy('createdAt', 'desc')
        .limit(opts.limit || 20);
    }

    const snap = await query.get();
    let results = snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as MediaAsset));

    // Client-side filtering (Firestore compound query limitleri nedeniyle)
    if (opts.category) {
      results = results.filter((r: MediaAsset) => r.category === opts.category);
    }
    if (opts.type) {
      results = results.filter((r: MediaAsset) => r.type === opts.type);
    }
    if (opts.keywords && opts.keywords.length > 0) {
      results = results.filter((r: MediaAsset) => 
        opts.keywords!.some(kw => 
          r.keywords?.some(rk => rk.toLowerCase().includes(kw.toLowerCase())) ||
          r.title?.toLowerCase().includes(kw.toLowerCase())
        )
      );
    }

    return results;
  } catch (e: any) {
    console.warn(`⚠️ [MEDIA LIBRARY] Arama hatası:`, e.message);
    return [];
  }
}

// ═══════════════════════════════════════
// KULLANIM SAYACI (Reuse Tracking)
// ═══════════════════════════════════════

export async function trackMediaUsage(mediaId: string): Promise<void> {
  if (!adminDb) return;
  try {
    const ref = adminDb.collection('aipyram_media_library').doc(mediaId);
    const doc = await ref.get();
    if (doc.exists) {
      await ref.update({
        usageCount: (doc.data()?.usageCount || 0) + 1,
        lastUsedAt: new Date().toISOString(),
      });
    }
  } catch (e) {
    // Non-blocking
  }
}

// ═══════════════════════════════════════
// HABER ARŞİVİ (Asla Silinmez)
// ═══════════════════════════════════════

export async function archiveNews(project: string, articleId: string): Promise<boolean> {
  if (!adminDb) return false;

  try {
    const sourceRef = adminDb.collection(`${project}_news`).doc(articleId);
    const doc = await sourceRef.get();
    
    if (!doc.exists) {
      console.warn(`[ARCHIVE] Haber bulunamadı: ${project}/${articleId}`);
      return false;
    }

    const data = doc.data();

    // Arşive kopyala (asla silinmez)
    await adminDb.collection('aipyram_news_archive').doc(articleId).set({
      ...data,
      _archived_from: `${project}_news`,
      _archived_at: new Date().toISOString(),
      _archive_reason: 'lifecycle',
    });

    // Görselleri de kütüphaneye kaydet
    if (data?.image_url) {
      await registerMedia({
        url: data.image_url,
        project,
        type: 'news_hero',
        category: data.category || 'genel',
        keywords: data.seo_matrix?.core_keys || [data.category || 'tekstil'],
        title: data.title || data.translations?.TR?.title || '',
        generatedBy: 'imagen_3',
        articleId,
        reusable: true,
      });
    }

    // Ek görselleri de kaydet
    if (data?.images && Array.isArray(data.images)) {
      for (let i = 0; i < data.images.length; i++) {
        if (data.images[i] && data.images[i] !== data.image_url) {
          await registerMedia({
            url: data.images[i],
            project,
            type: i === 0 ? 'news_mid' : 'news_macro',
            category: data.category || 'genel',
            keywords: data.seo_matrix?.core_keys || [data.category || 'tekstil'],
            title: data.title || '',
            generatedBy: 'imagen_3',
            articleId,
            reusable: true,
          });
        }
      }
    }

    // Orijinali "archived" olarak işaretle (SİLME!)
    await sourceRef.update({ 
      status: 'archived',
      _archived_at: new Date().toISOString() 
    });

    console.log(`📦 [ARCHIVE] Haber arşivlendi (silinmedi): ${data?.title?.substring(0, 50)}`);
    return true;
  } catch (e: any) {
    console.error(`❌ [ARCHIVE] Arşivleme hatası:`, e.message);
    return false;
  }
}

// ═══════════════════════════════════════
// MEVCUT GÖRSELLERİ TOPLU KAYDET 
// (İlk kurulumda mevcut tüm haberlerin görsellerini kütüphaneye al)
// ═══════════════════════════════════════

export async function bulkRegisterExistingMedia(project: string): Promise<number> {
  if (!adminDb) return 0;

  let registered = 0;
  try {
    const snap = await adminDb.collection(`${project}_news`)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    for (const doc of snap.docs) {
      const data = doc.data();
      if (data.image_url) {
        const existing = await adminDb.collection('aipyram_media_library')
          .where('url', '==', data.image_url)
          .limit(1)
          .get();

        if (existing.empty) {
          await registerMedia({
            url: data.image_url,
            project,
            type: 'news_hero',
            category: data.category || 'genel',
            keywords: data.seo_matrix?.core_keys || [data.category || 'tekstil'],
            title: data.title || data.translations?.TR?.title || '',
            generatedBy: 'imagen_3',
            articleId: doc.id,
            reusable: true,
          });
          registered++;
        }
      }
    }

    console.log(`📸 [MEDIA LIBRARY] ${project}: ${registered} mevcut görsel kütüphaneye kaydedildi.`);
    return registered;
  } catch (e: any) {
    console.error(`❌ [MEDIA LIBRARY] Toplu kayıt hatası:`, e.message);
    return registered;
  }
}
