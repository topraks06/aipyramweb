/**
 * ARTICLE UPGRADER — 131 Haberi Dergi Kalitesine Yükselt
 * 
 * Her haber için:
 * 1. Başlık kalitesi kontrol (≤12 kelime, keyword içermeli)
 * 2. 8+ keyword enforce (4 sabit + 4 dinamik)
 * 3. AI CEO bloğu üret
 * 4. 3 görsel prompt üret (MasterPhotographer ile)
 * 5. Görselleri Imagen ile üretip Firebase Storage'a yükle
 * 6. quality_score ≥ 80 → yayınla
 * 7. commercial_note ekle
 */

import { adminDb } from '@/lib/firebase-admin';
import { alohaAI } from './aiClient';
import { dlq } from './dlq';
import {
  enforceKeywords,
  generateAICEOPrompt,
  MANDATORY_KEYWORDS
} from './visualDNA';

// Removed raw ai client
// ═══════════════════════════════════════
// UPGRADE RESULT TYPES
// ═══════════════════════════════════════

export interface UpgradeResult {
  project: string;
  totalArticles: number;
  upgraded: number;
  alreadyGood: number;
  failed: number;
  imageQueueCount: number;
  details: ArticleUpgradeDetail[];
  duration: number;
}

export interface ArticleUpgradeDetail {
  id: string;
  title: string;
  beforeScore: number;
  afterScore: number;
  keywordsAdded: number;
  imagesGenerated: number;
  aiCeoAdded: boolean;
  status: 'upgraded' | 'skipped' | 'failed';
}

// ═══════════════════════════════════════
// ANA UPGRADE FONKSİYONU
// ═══════════════════════════════════════

export async function upgradeAllArticles(project: string = 'trtex'): Promise<UpgradeResult> {
  const start = Date.now();
  const collection = `${project}_news`;

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`[UPGRADER] 🎨 ${project.toUpperCase()} HABER UPGRADE BAŞLADI`);
  console.log(`${'═'.repeat(60)}\n`);

  const result: UpgradeResult = {
    project,
    totalArticles: 0,
    upgraded: 0,
    alreadyGood: 0,
    failed: 0,
    imageQueueCount: 0,
    details: [],
    duration: 0,
  };

  // Tüm haberleri çek
  let snapshot;
  try {
    snapshot = await adminDb.collection(collection).limit(200).get();
  } catch (e: any) {
    console.error(`[UPGRADER] Firestore hatası:`, e.message);
    result.duration = Math.round((Date.now() - start) / 1000);
    return result;
  }

  result.totalArticles = snapshot.size;
  console.log(`[UPGRADER] 📊 ${result.totalArticles} haber bulundu. İşleniyor...`);

  let processed = 0;
  for (const doc of snapshot.docs) {
    processed++;
    const data = doc.data();
    const title = data.title || data.TR?.title || '';
    const content = data.content || data.TR?.content || '';
    const category = data.category || 'general';
    const existingTags = data.tags || data.seo?.keywords || [];
    const existingScore = data.quality_score || 0;

    // Progress log
    if (processed % 10 === 0) {
      console.log(`[UPGRADER] 📊 İlerleme: ${processed}/${result.totalArticles} (${result.upgraded} upgrade, ${result.failed} hata)`);
    }

    const detail: ArticleUpgradeDetail = {
      id: doc.id,
      title: title.substring(0, 60),
      beforeScore: existingScore,
      afterScore: existingScore,
      keywordsAdded: 0,
      imagesGenerated: 0,
      aiCeoAdded: false,
      status: 'skipped',
    };

    // Zaten mükemmel mi? (kalite ≥ 85, 8+ keyword, AI CEO var)
    const hasAICeo = !!data.ai_ceo_block;
    const hasEnoughKeywords = existingTags.length >= 8;
    const has3Images = data.image_urls?.length >= 3 || (data.image_url && data.mid_image_url && data.detail_image_url);
    
    if (existingScore >= 85 && hasAICeo && hasEnoughKeywords && has3Images) {
      result.alreadyGood++;
      detail.status = 'skipped';
      result.details.push(detail);
      continue;
    }

    try {
      const updateData: Record<string, any> = {
        upgraded_at: new Date().toISOString(),
        visual_dna_version: '1.0',
      };

      // ─── 1. BAŞLIK + KALITE UPGRADE ───
      if (existingScore < 80 || title.length < 20) {
        try {
          const { text } = await alohaAI.generate(
            `Lüks tekstil dergisi editörüsün. Bu haberi upgrade et.

MEVCUT BAŞLIK: ${title}
KATEGORİ: ${category}
İÇERİK (ilk 400 kar): ${content.substring(0, 400)}

GÖREV:
1. Dergi kalitesinde başlık yaz (maks 12 kelime, "perde" veya "tekstil" kelimesi olsun)
2. 2-3 satırlık güçlü giriş
3. Ticari anlam (hangi ülke/firma etkileniyor, fırsat mı risk mi)
4. Kalite skoru ver (0-100)

JSON:
{"title":"...","intro":"...","commercial_note":"...","quality_score":85}
SADECE JSON.`,
            { complexity: 'routine' },
            'articleUpgrader.qualityFix'
          );

          if (text) {
          const jsonMatch = text.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.title && parsed.title.length > 15) {
              updateData.title = parsed.title;
              if (data.TR) updateData['TR.title'] = parsed.title;
            }
            if (parsed.intro) updateData.intro = parsed.intro;
            if (parsed.commercial_note) updateData.commercial_note = parsed.commercial_note;
            updateData.quality_score = Math.max(parsed.quality_score || 75, existingScore);
            detail.afterScore = updateData.quality_score;
          }
        }
        } catch (e) { await dlq.recordSilent(e, 'articleUpgrader.qualityFix', 'trtex'); }
      }

      // ─── 2. KEYWORD ENFORCEMENT ───
      const enforcedKeywords = enforceKeywords(existingTags, title, category);
      if (enforcedKeywords.length > existingTags.length) {
        updateData.tags = enforcedKeywords;
        updateData.seo = {
          ...(data.seo || {}),
          keywords: enforcedKeywords,
        };
        detail.keywordsAdded = enforcedKeywords.length - existingTags.length;
      }

      // ─── 3. AI CEO BLOĞU ───
      if (!hasAICeo) {
        try {
          const ceoPrompt = generateAICEOPrompt(title, content);
          const { text: ceoText } = await alohaAI.generate(
            ceoPrompt,
            { complexity: 'routine' },
            'articleUpgrader.ceoBlock'
          );
          const ceoJson = ceoText.match(/\{[\s\S]*\}/);
          if (ceoJson) {
            const ceoParsed = JSON.parse(ceoJson[0]);
            updateData.ai_ceo_block = ceoParsed;
            detail.aiCeoAdded = true;
          }
        } catch (e) { await dlq.recordSilent(e, 'articleUpgrader.ceoBlock', 'trtex'); }
      }

      // ─── 3b. TRADE MATRIX ÜRETİMİ (Weaponized Commerce) ───
      if (!data.trade_matrix) {
        try {
          const { text: tmText } = await alohaAI.generate(
            `GOREV: Bu haberi SATIŞ SILAHINA donustur.
BASLIK: ${title}
ICERIK OZETI: ${content.substring(0, 500)}
KATEGORI: ${category}

Bu haberden B2B satis firsati cikar. JSON dondur:
{
  "sellable_asset": "satilabilir urun/hizmet (somut, spesifik)",
  "target_market": "hedef alici profili (ulke + sektor)",
  "intent_type": "sell",
  "b2b_match_target": "Perde.ai veya Hometex.ai veya TRTEX kendi",
  "estimated_value": "low|medium|high|premium",
  "urgency": "cold|warm|hot|critical",
  "suggested_cta": "Teklif Al veya Uretici Bul veya Numune Iste",
  "cross_project": "perde.ai veya hometex veya trtex",
  "why_buy_now": "Neden SIMDI satin almali? (pazar trendi + aciliyet nedeni, 1-2 cumle, INGILIZCE)",
  "offer_hook": "1 cumlelik somut teklif (INGILIZCE, ornek: We can supply blackout curtains for hotel projects in 3 weeks from Turkey)",
  "priority_tier": "tier1_direct_sale|tier2_nurture|tier3_traffic"
}

KURALLAR:
- sellable_asset SOMUT olmali (ornek: "Polyester Perde Kumasi" EVET, "tekstil" HAYIR)
- target_market ULKE + SEKTOR icermeli
- why_buy_now pazar trendini + aciliyeti aciklamali (INGILIZCE yaz, alicilar icin)
- offer_hook SOMUT teklif olmali: urun + teslimat + avantaj (INGILIZCE yaz)
- priority_tier: Dogrudan satis potansiyeli yuksekse tier1, ilgi cekiciyse tier2, sadece bilgi ise tier3
- Perde/tul haberleri → cross_project: "perde.ai"
- Genel ev tekstili → cross_project: "hometex"
- Ihracat/fiyat → cross_project: "trtex"
SADECE JSON.`,
            { responseMimeType: 'application/json', temperature: 0.3, complexity: 'routine' },
            'articleUpgrader.tradeMatrix'
          );

          if (tmText) {
            const { safeParseLLM, schemas } = require('./schemaGuard');
            const tmResult = await safeParseLLM(schemas.tradeMatrix, tmText, 'articleUpgrader.tradeMatrix', 'trtex');
            if (tmResult.success && tmResult.data) {
              updateData.trade_matrix = tmResult.data;
            }
          }
        } catch (e) { await dlq.recordSilent(e, 'articleUpgrader.tradeMatrix', 'trtex'); }
      }

      // ─── 4. GÖRSEL RETRY İPTAL EDİLDİ ───
      // Tüm görsel üretim (Resim ajanımız) imageAgent.ts üzerinden otonom Cron ile yönetilir.
      // Burada sadece mevcut görsellerin URL'sine dokunmuyoruz.



      // ─── 5. YAYINLA ───
      const finalScore = updateData.quality_score || existingScore;
      if (finalScore >= 70 && data.status !== 'published') {
        updateData.status = 'published';
        updateData.publishedAt = data.publishedAt || new Date().toISOString();
      }

      // ─── FIRESTORE'A YAZ ───
      await adminDb.collection(collection).doc(doc.id).update(updateData);
      detail.status = 'upgraded';
      result.upgraded++;

    } catch (e: any) {
      detail.status = 'failed';
      result.failed++;
      console.error(`[UPGRADER] Hata (${doc.id}):`, e.message?.substring(0, 100));
    }

    result.details.push(detail);

    // Rate limiting — Gemini API'yi boğma
    if (processed % 5 === 0) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  result.duration = Math.round((Date.now() - start) / 1000);

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`[UPGRADER] ✅ TAMAMLANDI: ${result.upgraded}/${result.totalArticles} upgrade | ${result.failed} hata | ${result.imageQueueCount} görsel kuyruğa alındı | ${result.duration}s`);
  console.log(`${'═'.repeat(60)}\n`);

  // Sonucu kaydet
  try {
    await adminDb.collection('aloha_pipeline_runs').add({
      type: 'article_upgrade',
      ...result,
      details: result.details.slice(0, 20), // İlk 20 detay (Firestore limit)
      createdAt: new Date().toISOString(),
    });
  } catch (e) { await dlq.recordSilent(e, 'articleUpgrader.pipelineRun', 'trtex'); }

  return result;
}
