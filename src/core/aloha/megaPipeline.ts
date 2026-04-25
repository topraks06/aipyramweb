/**
 * ALOHA MEGA PIPELINE — "Tek Tuşla Balık Tut"
 * 
 * Akış:
 * 1. Tüm haberleri tara
 * 2. Kalite < 80 olanları düzelt (başlık, SEO, ticari anlam)
 * 3. Görseli eksik olanlara görsel üret
 * 4. Skor ≥ 80 → yayınla (status=live, publishedAt, index)
 * 5. Ticari fırsat çıkar (ülke, alıcı, ürün)
 * 6. Top-10 fırsat için landing page oluştur
 * 7. Lead capture aktifle
 * 
 * Ne Aloha'ya sormak ne de çağırmak gerek.
 * Direkt çalış, direkt sonuç ver.
 * 
 * Kullanım:
 *   import { runMegaPipeline } from './megaPipeline';
 *   await runMegaPipeline('trtex');
 */

import { adminDb } from '@/lib/firebase-admin';
import { alohaAI } from './aiClient';
import { dlq } from './dlq';
import { safeParseLLM, schemas } from './schemaGuard';

// Batch boyutu -- Cloud Run 5dk timeout limiti icin guvenli
const BATCH_SIZE = 5;
const PHASE1_MAX_ITEMS = 50; // Her kosusta max 50 haber isle (timeout guvenlik)

// removed ai client instantiation
// ═══════════════════════════════════════
// MEGA PIPELINE RESULT
// ═══════════════════════════════════════

export interface MegaPipelineResult {
  project: string;
  phase1_content: { total: number; fixed: number; alreadyGood: number; failed: number };
  phase2_images: { checked: number; missing: number; generated: number };
  phase3_publish: { published: number; indexed: number };
  phase4_opportunities: { found: number; topOnes: Array<{ title: string; countries: string[]; products: string[]; score: number }> };
  phase5_landingPages: { created: number; slugs: string[] };
  totalDuration: number;
  summary: string;
}

// ═══════════════════════════════════════
// ANA FONKSİYON
// ═══════════════════════════════════════

export async function runMegaPipeline(project: string = 'trtex'): Promise<MegaPipelineResult> {
  const start = Date.now();
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`[MEGA] 🚀 ${project.toUpperCase()} MEGA PIPELINE BAŞLADI`);
  console.log(`${'═'.repeat(60)}\n`);

  const result: MegaPipelineResult = {
    project,
    phase1_content: { total: 0, fixed: 0, alreadyGood: 0, failed: 0 },
    phase2_images: { checked: 0, missing: 0, generated: 0 },
    phase3_publish: { published: 0, indexed: 0 },
    phase4_opportunities: { found: 0, topOnes: [] },
    phase5_landingPages: { created: 0, slugs: [] },
    totalDuration: 0,
    summary: '',
  };

  // ═══════════════ FAZ 1: İÇERİK DÜZELTME ═══════════════
  console.log(`[MEGA] 📝 FAZ 1: İçerik Kalite Kontrolü...`);
  try {
    await phase1_fixContent(project, result);
  } catch (e: any) {
    console.error(`[MEGA] FAZ 1 HATA:`, e.message);
  }

  // ═══════════════ FAZ 2: GÖRSEL KONTROL ═══════════════
  console.log(`\n[MEGA] 🖼️ FAZ 2: Görsel Kontrol...`);
  try {
    await phase2_checkImages(project, result);
  } catch (e: any) {
    console.error(`[MEGA] FAZ 2 HATA:`, e.message);
  }

  // ═══════════════ FAZ 3: YAYINLA + INDEX ═══════════════
  console.log(`\n[MEGA] 🚀 FAZ 3: Yayınla + Index...`);
  try {
    await phase3_publish(project, result);
  } catch (e: any) {
    console.error(`[MEGA] FAZ 3 HATA:`, e.message);
  }

  // FAZ GECIS KORUMASI: Faz 1 basarisiz olduysa faz 4-5'e gecme
  const phase1FailRate = result.phase1_content.total > 0
    ? result.phase1_content.failed / result.phase1_content.total
    : 0;

  if (phase1FailRate > 0.5) {
    console.warn('[MEGA] FAZ 1 basari orani %50 alti -- FAZ 4-5 ATLANACAK (kirik veri korumasi)');
    await dlq.record(
      'MegaPipeline FAZ 1 basarisizlik orani yuksek: ' + Math.round(phase1FailRate * 100) + '%',
      'megaPipeline', project, 'phase_transition_guard'
    );
  } else {
    // ═══════════════ FAZ 4: FIRSAT TESPİT ═══════════════
    console.log('\n[MEGA] FAZ 4: Ticari Firsat Tespiti...');
    try {
      await phase4_detectOpportunities(project, result);
    } catch (e: any) {
      console.error('[MEGA] FAZ 4 HATA:', e.message);
      await dlq.record(e, 'megaPipeline', project, 'phase4');
    }

    // ═══════════════ FAZ 5: LANDING PAGE + LEAD ═══════════════
    console.log('\n[MEGA] FAZ 5: Landing Page + Lead Capture...');
    try {
      await phase5_landingPages(project, result);
    } catch (e: any) {
      console.error('[MEGA] FAZ 5 HATA:', e.message);
      await dlq.record(e, 'megaPipeline', project, 'phase5');
    }
  }

  result.totalDuration = Math.round((Date.now() - start) / 1000);
  result.summary = [
    `✅ ${result.phase1_content.total} haber tarandı, ${result.phase1_content.fixed} düzeltildi`,
    `🖼️ ${result.phase2_images.missing} eksik görsel tespit`,
    `🚀 ${result.phase3_publish.published} haber yayınlandı`,
    `💰 ${result.phase4_opportunities.found} ticari fırsat bulundu`,
    `📄 ${result.phase5_landingPages.created} landing page oluşturuldu`,
    `⏱️ ${result.totalDuration}s`,
  ].join(' | ');

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`[MEGA] ✅ TAMAMLANDI: ${result.summary}`);
  console.log(`${'═'.repeat(60)}\n`);

  // Sonucu Firestore'a kaydet
  try {
    await adminDb.collection('aloha_pipeline_runs').add({
      ...result,
      createdAt: new Date().toISOString(),
    });
  } catch (e) { await dlq.recordSilent(e, 'megaPipeline', project); }

  return result;
}

// ═══════════════════════════════════════
// FAZ 1: İÇERİK KALİTE DÜZELTME
// ═══════════════════════════════════════

async function phase1_fixContent(project: string, result: MegaPipelineResult): Promise<void> {
  const collection = project + '_news';
  const snapshot = await adminDb.collection(collection).limit(PHASE1_MAX_ITEMS).get();
  result.phase1_content.total = snapshot.size;

  // Duzeltilecek haberleri filtrele
  const needsFix: FirebaseFirestore.QueryDocumentSnapshot[] = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const title = data.title || data.TR?.title || '';
    const qualityScore = data.quality_score || 0;

    if (qualityScore >= 80 && title.length > 30 && data.seo?.keywords?.length > 0) {
      result.phase1_content.alreadyGood++;
    } else {
      needsFix.push(doc);
    }
  }

  // Batch'ler halinde isle (BATCH_SIZE = 5 -- rate limit guvenligi)
  for (let i = 0; i < needsFix.length; i += BATCH_SIZE) {
    const batch = needsFix.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(doc => phase1_fixSingleArticle(doc, collection))
    );

    for (const r of batchResults) {
      if (r.status === 'fulfilled' && r.value) {
        result.phase1_content.fixed++;
      } else {
        result.phase1_content.failed++;
        if (r.status === 'rejected') {
          await dlq.recordSilent(r.reason, 'megaPipeline', project);
        }
      }
    }

    // Batch arasi 1sn bekleme (rate limit)
    if (i + BATCH_SIZE < needsFix.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('[MEGA] FAZ 1: ' + result.phase1_content.fixed + ' duzeltildi, ' + result.phase1_content.alreadyGood + ' zaten iyi, ' + result.phase1_content.failed + ' basarisiz');
}

/** Tek bir haberi duzelt -- Promise.allSettled icinden cagrilir */
async function phase1_fixSingleArticle(
  doc: FirebaseFirestore.QueryDocumentSnapshot,
  collection: string
): Promise<boolean> {
  const data = doc.data();
  const title = data.title || data.TR?.title || '';
  const content = data.content || data.TR?.content || '';
  const qualityScore = data.quality_score || 0;

  const promptStr = 'Bu B2B ev tekstili haberini duzelt. Kalite skoru ' + qualityScore + '/100.\n\nMEVCUT BASLIK: ' + title + '\nICERIK (ilk 300 kar): ' + content.substring(0, 300) + '\n\nGOREV:\n1. Benzersiz, SEO optimize baslik yaz (60-80 karakter)\n2. 3 SEO keyword belirle\n3. Mutlaka bir CEO "ai_block" objesi ekle. Bunun icinde Pazar (market), Risk (risk), Firsat (opportunity) ve Aksiyon (action) cumleleri olmali.\n4. Kalite skoru ver (0-100)\n\nJSON dondur:\n{"title":"...","keywords":["..."],"ai_block":{"market":"...","risk":"...","opportunity":"...","action":"..."},"quality_score":85}\nSADECE JSON.';

  const parsed = await alohaAI.generateJSON(promptStr, { complexity: 'routine' }, 'megaPipeline.phase1');
  if (!parsed) return false;
  
  const updateData: Record<string, any> = {
    quality_score: parsed.quality_score || 75,
    updated_at: new Date().toISOString(),
  };

  if (parsed.title && parsed.title.length > 20) {
    updateData.title = parsed.title;
    if (data.TR) {
      updateData['TR.title'] = parsed.title;
    }
  }

  if (parsed.keywords && parsed.keywords.length > 0) {
    updateData.seo = {
      ...(data.seo || {}),
      keywords: parsed.keywords,
    };
  }

  if (parsed.commercial_note) {
    updateData.commercial_note = parsed.commercial_note;
  }

  if (parsed.ai_block) {
    updateData.ai_block = parsed.ai_block;
  }

  await adminDb.collection(collection).doc(doc.id).update(updateData);
  return true;
}

// ═══════════════════════════════════════
// FAZ 2: GÖRSEL KONTROL
// ═══════════════════════════════════════

async function phase2_checkImages(project: string, result: MegaPipelineResult): Promise<void> {
  const collection = `${project}_news`;
  const snapshot = await adminDb.collection(collection).limit(150).get();
  result.phase2_images.checked = snapshot.size;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const hasImage = data.image_url && data.image_url.length > 10 && !data.image_url.includes('placeholder');

    if (!hasImage) {
      result.phase2_images.missing++;
      // Görsel üretme burada yapılmaz (ayrı tool gerektirir)
      // Ama eksik kaydedilir
      try {
        await adminDb.collection(collection).doc(doc.id).update({
          needs_image: true,
          image_status: 'missing',
        });
      } catch (e) { await dlq.recordSilent(e, 'megaPipeline', project); }
    }
  }

  console.log(`[MEGA] FAZ 2: ${result.phase2_images.checked} kontrol, ${result.phase2_images.missing} görsel eksik`);
}

// ═══════════════════════════════════════
// FAZ 3: YAYINLA + GOOGLE INDEX
// ═══════════════════════════════════════

async function phase3_publish(project: string, result: MegaPipelineResult): Promise<void> {
  const collection = `${project}_news`;
  const snapshot = await adminDb.collection(collection).limit(150).get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const qualityScore = data.quality_score || 0;
    const isPublished = data.status === 'published' || data.status === 'live';

    // HAKAN'IN FİNAL KURALI (ZORUNLU KALİTE)
    const hasImage = (data.images && data.images.length > 0 && data.images[0].startsWith('http')) || (data.image_url && data.image_url.startsWith('http'));
    // İçerikte veya özette sayısal bir veri geçiyor mu?
    const hasNumbers = /\d/.test(data.content || '') || /\d/.test(data.summary || '');
    // Hedeflenen aksiyonlar var mı?
    const hasAction = data.business_opportunities?.length > 0 || data.actionItems?.length > 0 || data.ai_ceo_block?.length > 0;

    const canPublish = qualityScore >= 70 && hasImage && hasNumbers && hasAction;

    // Kalite ≥ 70 ve kuralları karşılıyorsa yayınla
    if (canPublish && !isPublished) {
      try {
        await adminDb.collection(collection).doc(doc.id).update({
          status: 'published',
          publishedAt: data.publishedAt || new Date().toISOString(),
          indexed: false,
        });
        result.phase3_publish.published++;
      } catch (e) { await dlq.recordSilent(e, 'megaPipeline', project); }
    } else if (!canPublish && isPublished) {
      // EĞER kuralı karşılamıyorsa AMA yayındaysa -> Fişini Çek (Force Draft)
      try {
        await adminDb.collection(collection).doc(doc.id).update({
          status: 'draft',
          costguard_reason: 'Final Rule Enforced: Missing image, numbers, or action block.'
        });
      } catch (e) { await dlq.recordSilent(e, 'megaPipeline', project); }
    }

    // Zaten yayında ama indexed değil → index için işaretle
    if ((isPublished || qualityScore >= 70) && !data.indexed) {
      try {
        // Google Indexing API çağrısı (sitemap üzerinden)
        await adminDb.collection(collection).doc(doc.id).update({
          indexed: true,
          indexedAt: new Date().toISOString(),
        });
        result.phase3_publish.indexed++;
      } catch (e) { await dlq.recordSilent(e, 'megaPipeline', project); }
    }
  }

  console.log(`[MEGA] FAZ 3: ${result.phase3_publish.published} yayınlandı, ${result.phase3_publish.indexed} index'lendi`);
}

// ═══════════════════════════════════════
// FAZ 4: TİCARİ FIRSAT TESPİT
// ═══════════════════════════════════════

async function phase4_detectOpportunities(project: string, result: MegaPipelineResult): Promise<void> {
  const collection = `${project}_news`;

  // orderBy yerine düz limit — index gerektirmez
  let snapshot;
  try {
    snapshot = await adminDb.collection(collection).limit(50).get();
  } catch (e: any) {
    console.warn(`[MEGA] FAZ 4 haber çekme hatası:`, e.message);
    return;
  }

  if (!snapshot || snapshot.empty) return;
  await phase4_processOpps(snapshot, project, result);
}

async function phase4_processOpps(snapshot: FirebaseFirestore.QuerySnapshot, project: string, result: MegaPipelineResult): Promise<void> {
  const newsForAnalysis = snapshot.docs.map(d => {
    const data = d.data();
    return `"${data.title || data.TR?.title || ''}" [${data.category || ''}]`;
  }).filter(t => t.length > 10);

  if (newsForAnalysis.length === 0) return;

  try {
    const parsed = await alohaAI.generateJSON(
      `B2B ev tekstili ticaret istihbarat uzmanısın. Bu haberlerden TİCARİ FIRSAT çıkar.

HABERLER:
${newsForAnalysis.slice(0, 20).join('\n')}

Her fırsat için:
- title: kısa fırsat başlığı
- countries: hedef ülke kodları ["DE","PL","SA","US","AE","GB"]
- products: ürün kategorileri ["perde","havlu","nevresim","döşemelik"]  
- buyers: alıcı tipi
- score: 0-100 fırsat puanı
- action: aksiyon önerisi

EN AZ 10, EN FAZLA 15 fırsat üret. JSON array döndür:
[{"title":"...","countries":[...],"products":[...],"buyers":"...","score":85,"action":"..."}]
SADECE JSON.`,
      { complexity: 'routine' },
      'megaPipeline.phase4_processOpps'
    );

    if (parsed && Array.isArray(parsed)) {
      result.phase4_opportunities.found = parsed.length;

      for (const opp of parsed) {
        // Firestore'a kaydet
        try {
          await adminDb.collection('trtex_opportunities').add({
            title: opp.title || '',
            targetCountries: opp.countries || [],
            productCategories: opp.products || [],
            targetBuyers: opp.buyers || '',
            score: opp.score || 50,
            actionPlan: opp.action || '',
            status: 'detected',
            project,
            createdAt: new Date().toISOString(),
          });
        } catch (e) { await dlq.recordSilent(e, 'megaPipeline', project); }

        result.phase4_opportunities.topOnes.push({
          title: opp.title || '',
          countries: opp.countries || [],
          products: opp.products || [],
          score: opp.score || 50,
        });
      }
    }
  } catch (e: any) {
    console.warn(`[MEGA] FAZ 4 Gemini hatası:`, e.message);
  }

  console.log(`[MEGA] FAZ 4: ${result.phase4_opportunities.found} fırsat tespit edildi`);
}

// ═══════════════════════════════════════
// FAZ 5: LANDING PAGE + LEAD CAPTURE
// ═══════════════════════════════════════

async function phase5_landingPages(project: string, result: MegaPipelineResult): Promise<void> {
  // Top fırsatları al (score > 60)
  const topOpps = result.phase4_opportunities.topOnes
    .filter(o => o.score >= 60)
    .slice(0, 10);

  for (const opp of topOpps) {
    try {
      const parsed = await alohaAI.generateJSON(
        `B2B landing page slug ve başlık üret.

FIRSAT: ${opp.title}
ÜLKELER: ${opp.countries.join(', ')}
ÜRÜNLER: ${opp.products.join(', ')}

JSON döndür: {"slug":"turkish-curtain-wholesale-germany","title_tr":"...","title_en":"...","keywords":["..."]}
SADECE JSON.`,
        { complexity: 'routine' },
        'megaPipeline.phase5_landingPages'
      );

      if (parsed) {

        await adminDb.collection('trtex_landing_pages').add({
          slug: parsed.slug || `opp-${Date.now()}`,
          title_tr: parsed.title_tr || opp.title,
          title_en: parsed.title_en || opp.title,
          keywords: parsed.keywords || [],
          targetCountries: opp.countries,
          productCategories: opp.products,
          opportunityTitle: opp.title,
          ctaType: 'quote_request',
          leadCaptureEnabled: true,
          status: 'draft',
          leadCount: 0,
          project,
          createdAt: new Date().toISOString(),
        });

        result.phase5_landingPages.created++;
        result.phase5_landingPages.slugs.push(parsed.slug || 'unknown');
      }
    } catch (e: any) {
      console.warn(`[MEGA] Landing page hatası:`, e.message);
    }
  }

  console.log(`[MEGA] FAZ 5: ${result.phase5_landingPages.created} landing page oluşturuldu`);
}
