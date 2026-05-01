/**
 * ALOHA Missing Image Scanner
 * 
 * Firebase'de görselsiz haberleri tarar ve otomatik görsel üretir.
 * 
 * KURALLAR:
 * - Max 20 haber/run (kredi koruması)
 * - image_generated === true → atla (duplicate koruması)
 * - Kategori-spesifik stil
 * - 2K çözünürlük (TRTEX)
 * - Her haber = unique image
 */

import { adminDb } from '@/lib/firebase-admin';
import { processImageForContent } from './imageAgent';
import { buildVisualSEOPackage } from './visualSeoEngine';

interface ScanResult {
  scanned: number;
  generated: number;
  failed: number;
  skipped: number;
  details: Array<{
    id: string;
    title: string;
    status: 'generated' | 'failed' | 'skipped';
    image_url?: string;
    error?: string;
  }>;
}

const MAX_PER_RUN = 20;

/**
 * Görselsiz haberleri tarar ve görsel üretir
 */
export async function scanAndGenerateImages(
  collection = 'trtex_news',
  limit = MAX_PER_RUN,
  dryRun = false
): Promise<ScanResult> {
  // 🔒 KILL SWITCH — Hakan Bey emri (30/04/2026)
  const { IMAGE_GENERATION_DISABLED } = await import('./aiClient');
  if (IMAGE_GENERATION_DISABLED) {
    console.log('[📸 IMAGE SCANNER] 🔒 GÖRSEL ÜRETİM KAPALI (maliyet kilidi). İşlem yapılmadı.');
    return { scanned: 0, generated: 0, failed: 0, skipped: 0, details: [] };
  }

  const result: ScanResult = {
    scanned: 0,
    generated: 0,
    failed: 0,
    skipped: 0,
    details: [],
  };

  console.log(`\n[📸 IMAGE SCANNER] ═══════════════════════════════`);
  console.log(`[📸 IMAGE SCANNER] Koleksiyon: ${collection}`);
  console.log(`[📸 IMAGE SCANNER] Mod: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`[📸 IMAGE SCANNER] Limit: ${Math.min(limit, MAX_PER_RUN)}`);
  console.log(`[📸 IMAGE SCANNER] ═══════════════════════════════\n`);

  try {
    // Tüm haberleri çek — publishedAt alanı eksik olabilir, orderBy kullanma!
    const snapshot = await adminDb.collection(collection)
      .limit(500)
      .get();

    const needsImage: Array<{ id: string; data: any }> = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const imageUrl = data.image_url || '';
      const alreadyGenerated = data.image_generated === true;

      const isValidGCS = imageUrl.trim() !== '' && imageUrl.startsWith('https://storage.googleapis.com/');

      // Geçerli bir görsel var mı?
      if (isValidGCS) {
        continue; // Geçerli GCS görseli var, geç
      }
      
      // Eğer görsel YOKSA (boşsa) ama alreadyGenerated TRUE ise, demek ki daha önce denenip başarısız olmuş.
      // Bu durumu "skipped" saymak yerine TEKRAR denemeliyiz. Sadece url tamamen doluysa ama GCS değilse atlayabiliriz,
      // ama emin olmak için her görselsiz makalenin havuza düşmesine izin verelim.
      if (alreadyGenerated && imageUrl.trim() !== '') {
        result.skipped++;
        continue; // Başka bir formattaki görsel zaten üretilmiş diyebiliriz.
      }

      // Queue'ya ekle
      try {
        await adminDb.collection('trtex_image_queue').doc(doc.id).set({
          articleId: doc.id,
          project: collection,
          status: 'pending',
          createdAt: new Date().toISOString()
        }, { merge: true });
      } catch(e) {}

      needsImage.push({ id: doc.id, data });
    }

    result.scanned = needsImage.length;
    console.log(`[📸 IMAGE SCANNER] ${needsImage.length} haber görselsiz bulundu (toplam ${snapshot.size})\n`);

    // Limitle
    const toProcess = needsImage.slice(0, Math.min(limit, MAX_PER_RUN));

    for (const item of toProcess) {
      const { id, data } = item;
      const title = data.translations?.TR?.title || data.title || '';
      const category = data.category || 'İstihbarat';

      if (!title || title.trim() === '') {
        result.skipped++;
        result.details.push({ id, title: '(boş başlık)', status: 'skipped' });
        continue;
      }

      if (dryRun) {
        console.log(`  [DRY] 🖼️ Üretilecek (3x): "${title.slice(0, 60)}..." [${category}]`);
        result.details.push({ id, title, status: 'generated', image_url: '(dry_run_3x)' });
        result.generated++;
        continue;
      }

      try {
        console.log(`  [GEN] 📸 3'lü görsel seti üretiliyor: "${title.slice(0, 50)}..." [${category}]`);
        
        // ═══ 3'LÜ GÖRSEL SETİ ═══
        // 1. HERO: Geniş açı editorial (ana sayfa + haber üstü)
        // 2. MID: Ticari detay (haber içi 1. görsel)
        // 3. DETAIL: Makro/doku yakın çekim (haber içi 2. görsel)
        
        const heroUrl = await processImageForContent('news', category, title, undefined, 'wide');
        let midUrl = '';
        let detailUrl = '';
        
        // Mid ve Detail görselleri IPTAL EDİLDİ (Hakan Bey'in talebi - bütçe koruması)
        /*
        // Mid görsel: orta çekim ticari detay (50mm)
        try {
          midUrl = await processImageForContent('news', category, title, undefined, 'medium');
          await new Promise(r => setTimeout(r, 1500)); // Rate limit
        } catch (midErr: any) {
          console.warn(`  [⚠️] Mid görsel atlandı: ${midErr.message}`);
        }
        
        // Detail görsel: makro yakın çekim doku (100mm)
        try {
          detailUrl = await processImageForContent('news', category, title, undefined, 'macro');
          await new Promise(r => setTimeout(r, 1500)); // Rate limit
        } catch (detailErr: any) {
          console.warn(`  [⚠️] Detail görsel atlandı: ${detailErr.message}`);
        }
        */
        
        const allGeneratedImages = [heroUrl, midUrl, detailUrl].filter(Boolean);
        const primaryImage = allGeneratedImages[0] || '';
        const isGCS = primaryImage.startsWith('https://storage.googleapis.com/');
        
        if (primaryImage) {
          // Visual SEO metadata üret
          let seoMeta: any = {};
          try {
            const seoPackage = await buildVisualSEOPackage(title, data.translations?.TR?.content || '', 0);
            seoMeta = {
              image_alt_text_tr: seoPackage.alt_text_tr,
              image_alt_text_en: seoPackage.alt_text_en,
              image_caption_tr: seoPackage.caption_tr,
              image_caption_en: seoPackage.caption_en,
              image_seo_filename: seoPackage.filename,
              image_category: seoPackage.detected_category,
            };
          } catch { /* SEO metadata opsiyonel */ }

          // Firebase'i güncelle — images[] array + image_url (back-compat)
          // + STATUS: draft → published (görselsiz haber yayınlanmaz kuralı tamamlandı)
          await adminDb.collection(collection).doc(id).update({
            image_url: primaryImage,
            images: allGeneratedImages,
            image_generated: true,
            image_generated_at: new Date().toISOString(),
            image_count: allGeneratedImages.length,
            _image_is_fallback: !isGCS,
            status: 'published',
            image_status: 'ready',
            needs_image: false,
            ...seoMeta,
          });

          result.generated++;
          result.details.push({ id, title, status: 'generated', image_url: `${allGeneratedImages.length}x: ${primaryImage.slice(-40)}` });
          console.log(`  [✅] ${allGeneratedImages.length} görsel üretildi: hero=${isGCS ? 'GCS' : 'fallback'} mid=${midUrl ? '✓' : '✗'} detail=${detailUrl ? '✓' : '✗'}`);
        } else {
          result.failed++;
          result.details.push({ id, title, status: 'failed', error: 'Hiç görsel üretilemedi' });
          console.error(`  [❌] Tüm görseller başarısız, Admin Paneli (Manual Queue) için işaretleniyor`);
          
          // Yapay zeka tamamen çökerse Admin Panel'e düşür (Manuel Yükleme Bekliyor)
          await adminDb.collection(collection).doc(id).update({
             needs_manual_image: true,
             image_status: 'failed',
             failed_at: new Date().toISOString()
          });
        }

        // Rate limiting: görseller arası 3s bekle (kredi koruması — 3x üretim)
        await new Promise(r => setTimeout(r, 3000));

      } catch (err: any) {
        result.failed++;
        result.details.push({ id, title, status: 'failed', error: err.message });
        console.error(`  [❌] Hata: ${err.message}`);
      }
    }

  } catch (err: any) {
    console.error(`[📸 IMAGE SCANNER] ❌ Tarama hatası: ${err.message}`);
  }

  console.log(`\n[📸 IMAGE SCANNER] ═══════════════════════════════`);
  console.log(`[📸 IMAGE SCANNER] SONUÇ:`);
  console.log(`  Taranan: ${result.scanned}`);
  console.log(`  Üretilen: ${result.generated}`);
  console.log(`  Başarısız: ${result.failed}`);
  console.log(`  Atlanan: ${result.skipped}`);
  console.log(`[📸 IMAGE SCANNER] ═══════════════════════════════\n`);

  return result;
}

/**
 * Tek bir haberin görselini yeniden üretir
 */
export async function regenerateImage(
  collection: string,
  docId: string
): Promise<{ success: boolean; image_url?: string; error?: string }> {
  try {
    const doc = await adminDb.collection(collection).doc(docId).get();
    if (!doc.exists) return { success: false, error: 'Doküman bulunamadı' };

    const data = doc.data()!;
    const title = data.translations?.TR?.title || data.title || '';
    const category = data.category || 'İstihbarat';

    const imageUrl = await processImageForContent('news', category, title);

    await adminDb.collection(collection).doc(docId).update({
      image_url: imageUrl,
      image_generated: true,
      image_generated_at: new Date().toISOString(),
      _image_is_fallback: !imageUrl?.startsWith('https://storage.googleapis.com/'),
    });

    return { success: true, image_url: imageUrl };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
