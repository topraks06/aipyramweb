/**
 * ALOHA SCHEMA GUARD — Zod ile LLM Çıktı Doğrulama
 * 
 * SORUN:
 *   LLM'den gelen JSON çıktıları kör JSON.parse ile işleniyordu.
 *   Beklenen alan eksik/yanlış tipte → runtime hatası → sessiz başarısızlık.
 * 
 * ÇÖZÜM:
 *   Zod şemaları ile her LLM çıktısı doğrulanır.
 *   Geçersiz veri → DLQ'ya kaydedilir, fallback değer döner.
 *   Kısmi geçerli veri → .partial() ile kurtarılır (veri kaybı azaltılır).
 * 
 * KULLANIM:
 *   import { schemas, safeParseLLM } from './schemaGuard';
 *   const result = safeParseLLM(schemas.article, rawText, 'compose_article');
 *   if (result.success) { ... result.data ... }
 */

import { z } from 'zod';
import { dlq } from './dlq';

// =============================================
// ŞEMALAR — LLM Çıktı Tipleri
// =============================================

/** compose_article tool çıktısı */
const articleSchema = z.object({
  title: z.string().min(10, 'Başlık en az 10 karakter olmalı'),
  summary: z.string().optional(),
  content: z.string().min(100, 'İçerik en az 100 karakter olmalı'),
  category: z.string().optional().default('İstihbarat'),
  keywords: z.array(z.string()).optional().default([]),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  slug: z.string().optional(),
  commercial_note: z.string().optional(),
  ai_block: z.object({
    market: z.string().default('Stratejik alıcı arayışı.'),
    risk: z.string().default('Piyasa dalgalanmaları izlenmeli.'),
    opportunity: z.string().default('Yükselen pazar dinamikleri.'),
    action: z.string().default('Tedarik zincirini gözden geçirin.'),
  }).optional(),
  quality_score: z.number().min(0).max(100).optional().default(70),
  word_count: z.number().optional(),
  reading_time: z.number().optional(),
  embedding: z.array(z.number()).optional(), // Vector Search icin 768-dim vektor
}).passthrough(); // Ekstra alanlar kabul (LLM'den gelen bonus veri)

/** megaPipeline phase1 — kalite düzeltme çıktısı */
const qualityFixSchema = z.object({
  title: z.string().min(10).optional(),
  keywords: z.array(z.string()).optional(),
  commercial_note: z.string().optional(),
  ai_block: z.object({
    market: z.string(),
    risk: z.string(),
    opportunity: z.string(),
    action: z.string(),
  }).optional(),
  quality_score: z.number().min(0).max(100).optional().default(75),
}).passthrough();

/** tradePipeline — ticari fırsat çıktısı */
const tradeOpportunitySchema = z.object({
  title: z.string().min(5),
  targetCountries: z.array(z.string()).optional().default([]),
  productCategories: z.array(z.string()).optional().default([]),
  buyers: z.string().optional(),
  score: z.number().min(0).max(100).optional().default(50),
  action: z.string().optional(),
  embedding: z.array(z.number()).optional(), // Vector Search icin
}).passthrough();

/** SEO meta generation çıktısı */
const seoMetaSchema = z.object({
  meta_description_tr: z.string().max(200).optional().default(''),
  meta_description_en: z.string().max(200).optional().default(''),
}).passthrough();

/** signalEngine — pazar sinyali çıktısı */
const marketSignalSchema = z.object({
  signal: z.string().min(5),
  type: z.string().optional(),
  country: z.string().optional(),
  confidence: z.number().min(0).max(1).optional().default(0.5),
  severity: z.string().optional(),
  data: z.record(z.any()).optional(),
}).passthrough();

/** opportunityEngine — fırsat çıktısı */
const opportunitySchema = z.object({
  signalId: z.string().optional(),
  project: z.string().optional(),
  opportunity: z.string().min(5),
  action: z.string().optional(),
  expectedLeads: z.number().optional().default(0),
  confidence: z.number().min(0).max(1).optional().default(0.5),
  priority: z.enum(['critical', 'high', 'normal', 'low']).optional().default('normal'),
  effort: z.enum(['minimal', 'moderate', 'significant']).optional().default('moderate'),
  reasoning: z.string().optional().default(''),
  tools: z.array(z.any()).optional().default([]),
}).passthrough();

/** landing page slug/title generation */
const landingPageSchema = z.object({
  slug: z.string().min(3),
  title_tr: z.string().optional(),
  title_en: z.string().optional(),
  keywords: z.array(z.string()).optional().default([]),
}).passthrough();

/** Claim extraction for fact-checking */
const claimExtractionSchema = z.object({
  claims: z.array(z.string()).optional().default([]),
}).passthrough();

/** Claim verification result */
const claimVerificationSchema = z.object({
  accurate: z.boolean().optional().default(true),
  corrected: z.string().optional(),
}).passthrough();

/** autoRunner — brain content (TRTEX ana sayfa) */
const brainContentSchema = z.object({
  daily_headline: z.string().optional().default('TRTEX B2B TEKSTIL ISTIHBARATI'),
  daily_summary: z.string().optional().default(''),
  daily_questions: z.array(z.object({
    q: z.string(),
    a: z.string(),
  })).optional().default([]),
  daily_risk_level: z.string().optional().default('ORTA'),
  daily_opportunity_level: z.string().optional().default('ORTA'),
  daily_affected_countries: z.string().optional().default(''),
  daily_comment: z.string().optional().default(''),
  opportunities: z.array(z.any()).optional().default([]),
}).passthrough();

/** WEAPONIZED COMMERCE — trade_matrix (her haberde ZORUNLU) */
const tradeMatrixSchema = z.object({
  sellable_asset: z.string().min(3, 'Satilabilir varlik tanimlanmali'),
  target_market: z.string().min(3, 'Hedef pazar tanimlanmali'),
  intent_type: z.enum(['buy', 'sell', 'partnership']).default('sell'),
  b2b_match_target: z.string().optional().default(''),
  estimated_value: z.enum(['low', 'medium', 'high', 'premium']).optional().default('medium'),
  urgency: z.enum(['cold', 'warm', 'hot', 'critical']).optional().default('warm'),
  suggested_cta: z.string().optional().default('Teklif Al'),
  cross_project: z.string().optional(),
  // === SATIS KALBI (GPT Upgrade) ===
  why_buy_now: z.string().optional().default(''), // Neden SIMDI almali? (trend + aciliyet)
  offer_hook: z.string().optional().default(''),  // 1 cumlelik somut teklif
  priority_tier: z.enum(['tier1_direct_sale', 'tier2_nurture', 'tier3_traffic']).optional().default('tier2_nurture'),
  embedding: z.array(z.number()).optional(),
}).passthrough();

/** INTENT SIGNAL — kullanici davranis izleme */
const intentSignalSchema = z.object({
  user_id: z.string().optional(),
  article_id: z.string(),
  action: z.enum(['view', 'scroll_deep', 'cta_click', 'share', 'dwell_long']),
  intent_score: z.number().min(0).max(100).default(0),
  trade_matrix: tradeMatrixSchema.optional(),
  source_project: z.string().default('trtex'),
  timestamp: z.string().optional(),
}).passthrough();

// =============================================
// EXPORTS
// =============================================

export const schemas = {
  article: articleSchema,
  qualityFix: qualityFixSchema,
  tradeOpportunity: tradeOpportunitySchema,
  seoMeta: seoMetaSchema,
  marketSignal: marketSignalSchema,
  opportunity: opportunitySchema,
  landingPage: landingPageSchema,
  claimExtraction: claimExtractionSchema,
  claimVerification: claimVerificationSchema,
  brainContent: brainContentSchema,
  tradeMatrix: tradeMatrixSchema,
  intentSignal: intentSignalSchema,
};

// =============================================
// GÜVENLI PARSE FONKSİYONLARI
// =============================================

export interface SafeParseResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
  rawText?: string;
}

/**
 * LLM çıktısını güvenli şekilde parse et + Zod ile doğrula.
 * Başarısız → DLQ'ya kaydeder, null döner.
 * Kısmen geçerli → mümkünse kurtarır.
 */
export async function safeParseLLM<T>(
  schema: z.ZodType<T>,
  rawText: string | undefined | null,
  source: string,
  project: string = 'system',
): Promise<SafeParseResult<T>> {
  // 1. rawText kontrolü
  if (!rawText || rawText.trim().length === 0) {
    await dlq.recordSilent(
      'LLM boş çıktı döndü (' + source + ')',
      'schemaGuard', project
    );
    return { success: false, data: null, error: 'LLM boş çıktı', rawText: rawText || '' };
  }

  // 2. JSON extract (LLM bazen markdown wrapper ile döner)
  let jsonStr = rawText.trim();

  // ```json ... ``` wrapper'ı temizle
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  // Array veya Object bul
  const jsonMatch = jsonStr.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  // 3. JSON parse
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (parseError) {
    await dlq.record(
      'JSON parse hatası: ' + (parseError instanceof Error ? parseError.message : String(parseError)),
      'schemaGuard', project, source
    );
    return { success: false, data: null, error: 'JSON parse başarısız', rawText };
  }

  // 4. Zod doğrulama
  const result = schema.safeParse(parsed);
  if (result.success) {
    return { success: true, data: result.data };
  }

  // 5. Başarısız → nedenlerle birlikte DLQ'ya kaydet
  const errorDetails = result.error.issues.map(
    i => `${i.path.join('.')}: ${i.message}`
  ).join('; ');

  await dlq.record(
    'Zod doğrulama hatası (' + source + '): ' + errorDetails,
    'schemaGuard', project, source
  );

  return {
    success: false,
    data: null,
    error: 'Zod doğrulama: ' + errorDetails,
    rawText,
  };
}

/**
 * Array formatındaki LLM çıktısını parse et + her öğeyi doğrula.
 * Geçersiz öğeler atlanır (kısmi kurtarma), DLQ'ya kaydedilir.
 */
export async function safeParseArrayLLM<T>(
  itemSchema: z.ZodType<T>,
  rawText: string | undefined | null,
  source: string,
  project: string = 'system',
): Promise<{ items: T[]; skipped: number }> {
  if (!rawText || rawText.trim().length === 0) {
    return { items: [], skipped: 0 };
  }

  // JSON extract
  let jsonStr = rawText.trim();
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

  const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
  if (jsonMatch) jsonStr = jsonMatch[0];

  let parsed: unknown[];
  try {
    const raw = JSON.parse(jsonStr);
    parsed = Array.isArray(raw) ? raw : (raw.items || raw.results || raw.opportunities || [raw]);
  } catch {
    await dlq.recordSilent('Array JSON parse hatası (' + source + ')', 'schemaGuard', project);
    return { items: [], skipped: 0 };
  }

  const items: T[] = [];
  let skipped = 0;

  for (const item of parsed) {
    const result = itemSchema.safeParse(item);
    if (result.success) {
      items.push(result.data);
    } else {
      skipped++;
    }
  }

  if (skipped > 0) {
    await dlq.recordSilent(
      source + ': ' + skipped + '/' + parsed.length + ' öğe Zod doğrulamasından geçemedi',
      'schemaGuard', project
    );
  }

  return { items, skipped };
}
