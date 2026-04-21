import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { alohaAI } from '@/core/aloha/aiClient';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 dakika max

const SUPPORTED_LOCALES = ['en', 'de', 'fr', 'es', 'zh', 'ru', 'ar', 'it'] as const;
type Locale = typeof SUPPORTED_LOCALES[number];

const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English', de: 'Deutsch', fr: 'Français', es: 'Español',
  zh: '中文', ru: 'Русский', ar: 'العربية', it: 'Italiano',
};

const BATCH_LIMIT = 5; // Her cron çağrısında max 5 haber

/**
 * GET /api/cron/translation-processor
 * 
 * 🌍 ÇEVİRİ MOTORU — Kuyruktaki haberleri 8 dile çevirir
 * 
 * Cloud Scheduler tarafından her 15 dakikada bir çağrılır.
 * trtex_translation_queue koleksiyonundan pending haberleri alır,
 * Gemini 2.5 Flash ile çevirir, trtex_news dokümanına yazar.
 */
export async function GET(req: Request) {
  const startTime = Date.now();

  // Auth
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    const xCronHeader = req.headers.get('x-cron-secret');
    if (authHeader !== `Bearer ${cronSecret}` && xCronHeader !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  if (!adminDb) {
    return NextResponse.json({ error: 'Firebase Admin yok' }, { status: 500 });
  }

  const result = {
    processed: 0,
    failed: 0,
    skipped: 0,
    errors: [] as string[],
    duration: 0,
  };

  try {
    // Kuyruktaki pending çevirileri çek
    const queueSnap = await adminDb
      .collection('trtex_translation_queue')
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'asc')
      .limit(BATCH_LIMIT)
      .get();

    if (queueSnap.empty) {
      return NextResponse.json({
        success: true,
        message: 'Kuyrukta çeviri yok',
        ...result,
        duration: Date.now() - startTime,
      });
    }

    console.log(`[TRANSLATION] 🌍 ${queueSnap.size} haber çeviriye alınıyor...`);

    const ai = alohaAI.getClient();

    for (const qDoc of queueSnap.docs) {
      const qData = qDoc.data();
      const articleId = qData.articleId || qData.slug || '';
      const project = qData.project || 'trtex';
      const newsCollection = `${project}_news`;

      if (!articleId) {
        await qDoc.ref.update({ status: 'error', error: 'articleId eksik' });
        result.skipped++;
        continue;
      }

      try {
        // Haberi çek
        const articleRef = adminDb.collection(newsCollection).doc(articleId);
        const articleSnap = await articleRef.get();

        if (!articleSnap.exists) {
          await qDoc.ref.update({ status: 'article_not_found' });
          result.skipped++;
          continue;
        }

        const article = articleSnap.data()!;
        const title = article.title || '';
        const summary = article.summary || '';
        const content = article.content || '';

        if (!title || content.length < 50) {
          await qDoc.ref.update({ status: 'insufficient_content' });
          result.skipped++;
          continue;
        }

        // Mevcut çevirileri kontrol et
        const existingTranslations = article.translations || {};
        const missingLocales = SUPPORTED_LOCALES.filter(l => !existingTranslations[l]?.title);

        if (missingLocales.length === 0) {
          await qDoc.ref.update({ status: 'already_translated' });
          result.skipped++;
          continue;
        }

        // Toplu çeviri — tek Gemini çağrısıyla tüm dilleri çevir
        const translations = await translateArticle(ai, title, summary, content, missingLocales);

        if (translations && Object.keys(translations).length > 0) {
          // Mevcut çevirilerle birleştir
          const mergedTranslations = { ...existingTranslations, ...translations };

          // TR orijinali de ekle (yoksa)
          if (!mergedTranslations.TR) {
            mergedTranslations.TR = { title, summary, content };
          }

          await articleRef.update({
            translations: mergedTranslations,
            translation_status: 'completed',
            translated_at: new Date().toISOString(),
            translated_locales: Object.keys(mergedTranslations),
          });

          await qDoc.ref.update({
            status: 'completed',
            completedAt: new Date().toISOString(),
            translatedLocales: Object.keys(translations),
          });

          result.processed++;
          console.log(`[TRANSLATION] ✅ ${articleId}: ${Object.keys(translations).length} dil çevrildi`);
        } else {
          await qDoc.ref.update({
            status: 'translation_failed',
            error: 'Gemini boş sonuç döndü',
            retryCount: (qData.retryCount || 0) + 1,
          });
          result.failed++;
        }

        // Rate limiting — 2s bekleme
        await new Promise(r => setTimeout(r, 2000));

      } catch (articleErr: any) {
        result.errors.push(`${articleId}: ${articleErr.message}`);
        result.failed++;
        await qDoc.ref.update({
          status: 'error',
          error: articleErr.message?.substring(0, 200),
          retryCount: (qData.retryCount || 0) + 1,
        });
      }
    }

  } catch (err: any) {
    result.errors.push(err.message);
    console.error('[TRANSLATION] ❌ Kritik hata:', err.message);
  }

  result.duration = Date.now() - startTime;
  console.log(`[TRANSLATION] 🏁 ${result.processed} çevrildi, ${result.failed} başarısız, ${result.skipped} atlandı (${(result.duration / 1000).toFixed(1)}s)`);

  return NextResponse.json({ success: true, ...result });
}

/**
 * Tek bir haberi eksik dillere çevir (toplu Gemini çağrısı)
 */
async function translateArticle(
  ai: any,
  title: string,
  summary: string,
  content: string,
  locales: readonly Locale[]
): Promise<Record<string, { title: string; summary: string; content: string }> | null> {
  try {
    // İçeriği kısalt (token tasarrufu — çeviri için 2000 karakter yeterli)
    const trimmedContent = content.length > 3000 ? content.substring(0, 3000) + '...' : content;

    const localeList = locales.map(l => `"${l}" (${LOCALE_NAMES[l]})`).join(', ');

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Aşağıdaki Türkçe B2B tekstil haberini belirtilen dillere profesyonelce çevir.

BAŞLIK: ${title}
ÖZET: ${summary}
İÇERİK: ${trimmedContent}

HEDEF DİLLER: ${localeList}

KURALLAR:
1. B2B profesyonel ton koru (gazete/dergi kalitesi)
2. Teknik tekstil terimlerini doğru çevir
3. HTML etiketlerini koru (<h2>, <p>, <strong> vb.)
4. Marka adlarını ÇEVİRME (TRTEX, Hometex vb.)
5. Rakamları ve birimleri koru
6. Her dil için title, summary ve content ayrı ayrı çevir

JSON döndür:
{
  "en": { "title": "...", "summary": "...", "content": "..." },
  "de": { "title": "...", "summary": "...", "content": "..." },
  ...
}
SADECE JSON döndür.`,
      config: { temperature: 0.2 },
    });

    const text = result?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    // Doğrula: her locale için title olmalı
    const validated: Record<string, { title: string; summary: string; content: string }> = {};
    for (const locale of locales) {
      if (parsed[locale]?.title && parsed[locale].title.length > 5) {
        validated[locale] = {
          title: parsed[locale].title,
          summary: parsed[locale].summary || '',
          content: parsed[locale].content || '',
        };
      }
    }

    return Object.keys(validated).length > 0 ? validated : null;
  } catch (err: any) {
    console.warn(`[TRANSLATION] ⚠️ Gemini çeviri hatası:`, err.message);
    return null;
  }
}
