/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  ALOHA CENTRALIZED AI CLIENT                                  ║
 * ║  Tek Google GenAI istemcisi — Tüm sistem buradan kullanır     ║
 * ╚═══════════════════════════════════════════════════════════════╝
 * 
 * ÖNCEKİ DURUM:
 *   11 ayrı dosyada `new GoogleGenAI()` oluşturuluyordu.
 *   'dummy' fallback'lerle boş API key ile istek atılıyordu.
 *   Rate limit koordinasyonu SIFIR'dı.
 * 
 * YENİ MİMARİ:
 *   - Singleton pattern — tek istemci, tek connection pool
 *   - API key yoksa AÇIK HATA (sessiz geçiş yok)
 *   - Built-in retry (3 deneme) + exponential backoff
 *   - Rate limit tracking
 *   - Yapılandırılmış hata kaydı (DLQ entegrasyonu)
 * 
 * KULLANIM:
 *   import { alohaAI } from './aiClient';
 *   const result = await alohaAI.generate('prompt', { temperature: 0.3 });
 *   const json = await alohaAI.generateJSON<MyType>('prompt');
 */

import { GoogleGenAI } from '@google/genai';
import { adminDb } from '@/lib/firebase-admin';

// ═══════════════════════════════════════
//  KONFİGÜRASYON
// ═══════════════════════════════════════

// MODEL HABERLERİ (2026 Q1-Q2 GOOGLE GÜNCELLEMELERİ)
// - gemini-2.5-flash: Mevcut ana model (stabil, hızlı)
// - imagen-3.0-generate-002: Mevcut görsel üretim (stabil)
// → YENİ: imagen-4.0-generate-001 (Subject Identity, 4K, 2-into-1 birleştirme)
// → YENİ: gemini-embedding-exp-03-07 (multimodal embeddings — metin+görüntü+video)
// → NOT: gemini-3.x henüz mevcut değil. Güncel stabil modeller:
// → gemini-2.5-flash (agentic, hızlı, düşük maliyet)
// → gemini-2.5-pro (derin analiz, complex workflows)

// MALİYET SAVUNMASI (CFO GUARD):
// Günlük 100.000 işlem yapan ALOHA için 'routine' işlemlerde 
// en düşük maliyetli model (Flash) zorunludur. Pro sadece 'complex' onaylı işlerde çalışır.
const DEFAULT_MODEL = 'gemini-2.5-flash'; // (Flash / Yüksek Hız, Düşük Maliyet)
const DEEP_MODEL = 'gemini-3.1-pro'; // (Pro / Kompleks İşlemler - Deep Research Max)
const IMAGE_MODEL = 'imagen-3.0-generate-002';     // Default for generateImages (stabil)
const IMAGE_MODEL_FALLBACK = 'imagen-3.0-generate-002';  // Fallback for generateImages
const EMBEDDING_MODEL = 'gemini-embedding-exp-03-07';  // Multimodal embedding model
const EMBEDDING_MODEL_FALLBACK = 'text-embedding-004'; // Fallback
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;       // 1s → 2s → 4s
const RATE_LIMIT_WINDOW_MS = 60000; // 1 dakika
const MAX_REQUESTS_PER_MINUTE = 55; // Google API limiti 60, güvenli alan

// ═══════════════════════════════════════
//  HİBRİT MOD UYARISI (Gemini Audit Önerisi #1)
// ═══════════════════════════════════════
// ⚠️ UYARI: Sistemde hâlâ ~50 dosya doğrudan ai.models.generateContent() kullanıyor.
// Bu dosyalar merkezi router'ı (getRouterModel) atlayarak eski modellere hardcoded bağlı.
// Tam göç tamamlanana kadar "Hibrit Mod" aktiftir — bazı ajanlar yeni modelle,
// bazıları eski modelle çalışabilir. Bu, "Zekâ Tutarsızlığı" riski taşır.
if (typeof process !== 'undefined') {
  console.warn('[AI_CLIENT] ⚠️ HİBRİT MOD AKTİF — ~50 dosya hâlâ doğrudan API çağrısı yapıyor. Faz 2 göçü devam ediyor.');
}

// ═══════════════════════════════════════
//  GÜNLÜK TOKEN BÜTÇESİ (MALİYE BAKANI v2)
// ═══════════════════════════════════════
const DAILY_TOKEN_BUDGET = 100_000;       // Günlük max 100K token (~3.3 CHF/gün ≈ 100 CHF/ay)
const MAX_GEMINI_CALLS_PER_CYCLE = 8;    // Döngü başına max 8 API çağrısı

interface TokenUsageEntry {
  caller: string;
  tokens: number;
  timestamp: number;
}

let _dailyTokensUsed = 0;
let _dailyCallCount = 0;
let _lastResetDate = new Date().toISOString().split('T')[0];
let _cycleCallCount = 0;
const _agentUsage: Record<string, { calls: number; estimatedTokens: number }> = {};
const _usageLog: TokenUsageEntry[] = [];

function resetDailyIfNeeded(): void {
  const today = new Date().toISOString().split('T')[0];
  if (today !== _lastResetDate) {
    console.log(`[AI_CLIENT] 📊 Günlük token sıfırlama: ${_lastResetDate} → ${today} (Dünkü kullanım: ${_dailyTokensUsed} token, ${_dailyCallCount} çağrı)`);
    _dailyTokensUsed = 0;
    _dailyCallCount = 0;
    _lastResetDate = today;
    // Agent usage'ı sıfırlama — kümülatif takip devam etsin
  }
}

function estimateTokens(prompt: string | any[], responseText: string): number {
  // Yaklaşık: 1 token ≈ 4 karakter (Türkçe/İngilizce karışık)
  const promptStr = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
  const inputTokens = Math.ceil(promptStr.length / 4);
  const outputTokens = Math.ceil(responseText.length / 4);
  return inputTokens + outputTokens;
}

function recordTokenUsage(caller: string, prompt: string | any[], responseText: string): void {
  const tokens = estimateTokens(prompt, responseText);
  _dailyTokensUsed += tokens;
  _dailyCallCount++;
  _cycleCallCount++;

  if (!_agentUsage[caller]) {
    _agentUsage[caller] = { calls: 0, estimatedTokens: 0 };
  }
  _agentUsage[caller].calls++;
  _agentUsage[caller].estimatedTokens += tokens;

  _usageLog.push({ caller: caller || 'unknown', tokens, timestamp: Date.now() });
  // Log sadece son 100 entry tut (bellek koruması)
  if (_usageLog.length > 100) _usageLog.splice(0, _usageLog.length - 100);

  // CFO Ajan Güçlendirme: Maliyetleri Firestore'a asenkron yaz
  // Yerel geliştirmede (Windows gRPC kilitlenmeleri sebebiyle) devre dışı bırakıldı.
  if (adminDb && process.env.NODE_ENV !== 'development') {
    const estimatedCost = (tokens / 1000) * 0.00003; // Yaklaşık maliyet (gemini-3.1-flash)
    adminDb.collection('aloha_costs').add({
      node: caller.includes('trtex') ? 'trtex' : caller.includes('perde') ? 'perde' : caller.includes('hometex') ? 'hometex' : caller.includes('vorhang') ? 'vorhang' : 'global',
      agent: caller,
      action: 'generateContent',
      tokenCount: tokens,
      estimatedCost,
      timestamp: new Date()
    }).catch(e => console.error('[AI_CLIENT] CFO Log hatası:', e));
  }
}

function checkBudget(caller?: string): { allowed: boolean; reason?: string } {
  resetDailyIfNeeded();

  if (_dailyTokensUsed >= DAILY_TOKEN_BUDGET) {
    return {
      allowed: false,
      reason: `🚨 GÜNLÜK TOKEN BÜTÇESİ DOLDU: ${_dailyTokensUsed}/${DAILY_TOKEN_BUDGET} token kullanıldı. Yarın sıfırlanacak.`
    };
  }

  if (_cycleCallCount >= MAX_GEMINI_CALLS_PER_CYCLE) {
    // Sadece uyarı ver, sistemi tamamen kilitleme (Eskiden return false idi ve tüm ALOHA'yı kilitliyordu)
    console.warn(`[AI_CLIENT] ⚠️ DÖNGÜ ÇAĞRI LİMİTİ UYARISI: Bu döngüde ${_cycleCallCount}/${MAX_GEMINI_CALLS_PER_CYCLE} çağrı yapıldı.`);
  }

  return { allowed: true };
}

export function resetAiCycle(): void {
  _cycleCallCount = 0;
  console.log('[AI_CLIENT] 🔄 Cycle call count sıfırlandı.');
}

// ═══════════════════════════════════════
//  SİNGLETON İSTEMCİ
// ═══════════════════════════════════════

let _instance: GoogleGenAI | null = null;
let _apiKeyValid = false;

function getClient(): GoogleGenAI {
  if (_instance && _apiKeyValid) return _instance;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'dummy' || apiKey.trim() === '') {
    throw new Error(
      '[AI_CLIENT] 🔴 GEMINI_API_KEY tanımlı değil veya geçersiz! ' +
      'AI işlemleri çalışamaz. .env dosyasına geçerli API key ekleyin.'
    );
  }

  _instance = new GoogleGenAI({ apiKey });
  _apiKeyValid = true;
  console.log('[AI_CLIENT] ✅ Google GenAI istemcisi oluşturuldu (singleton)');
  return _instance;
}

// ═══════════════════════════════════════
//  RATE LIMITER
// ═══════════════════════════════════════

const _requestTimestamps: number[] = [];

function checkRateLimit(): boolean {
  const now = Date.now();
  // Eski kayıtları temizle
  while (_requestTimestamps.length > 0 && _requestTimestamps[0] < now - RATE_LIMIT_WINDOW_MS) {
    _requestTimestamps.shift();
  }
  return _requestTimestamps.length < MAX_REQUESTS_PER_MINUTE;
}

function recordRequest(): void {
  _requestTimestamps.push(Date.now());
}

// ═══════════════════════════════════════
//  RETRY VE BACKOFF MOTORU
// ═══════════════════════════════════════

interface GenerateOptions {
  model?: string;
  temperature?: number;
  systemInstruction?: string;
  responseMimeType?: string;
  maxOutputTokens?: number;
  tools?: any[];
  responseSchema?: any;  // Structured output schema (Google GenAI Schema)
  complexity?: 'routine' | 'complex' | 'vision'; // Sprint D Model Routing
}

interface AICallResult {
  text: string;
  retries: number;
  durationMs: number;
  rawResponse?: any;
}

/**
 * Sprint D: Model Yönlendirici (Router)
 * Karmaşıklığa göre en uygun/ucuz modeli seçer.
 */
function getRouterModel(complexity?: 'routine' | 'complex' | 'vision'): string {
  switch (complexity) {
    case 'complex':
      return DEEP_MODEL; // gemini-3.1-pro
    case 'vision':
      return DEFAULT_MODEL; // gemini-2.5-flash handles vision natively
    case 'routine':
    default:
      return DEFAULT_MODEL; // gemini-3.1-flash (cost saving)
  }
}

/**
 * Metin üretimi — retry + backoff dahil
 */
async function generateWithRetry(
  prompt: string | any[],
  options: GenerateOptions = {},
  caller?: string
): Promise<AICallResult> {
  const startTime = Date.now();
  // Model verilmişse onu kullan, verilmemişse karmaşıklığa göre seç
  const model = options.model || getRouterModel(options.complexity);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // Rate limit kontrolü
    if (!checkRateLimit()) {
      const waitMs = RATE_LIMIT_WINDOW_MS - (Date.now() - _requestTimestamps[0]);
      console.warn(`[AI_CLIENT] ⏳ Rate limit — ${Math.ceil(waitMs / 1000)}s bekleniyor...`);
      await sleep(waitMs);
    }

    try {
      const client = getClient();

      const config: Record<string, unknown> = {};
      if (options.temperature !== undefined) config.temperature = options.temperature;
      if (options.systemInstruction) config.systemInstruction = options.systemInstruction;
      if (options.responseMimeType) config.responseMimeType = options.responseMimeType;
      if (options.maxOutputTokens) config.maxOutputTokens = options.maxOutputTokens;
      if (options.tools) {
        config.tools = options.tools;
      } else if (options.complexity === 'complex') {
        // Deep Research Max (Aşama 1 Upgrade): Kompleks işlemlerde otonom Google Search yetkisi ver
        config.tools = [{ googleSearch: {} }];
      }
      
      if ((options as any).responseSchema) config.responseSchema = (options as any).responseSchema;

      // BÜTÇE KONTROLÜ — Maliye Bakanı v2
      const budgetCheck = checkBudget(caller);
      if (!budgetCheck.allowed) {
        console.warn(`[AI_CLIENT] 🛑 ${budgetCheck.reason} [çağıran: ${caller || 'unknown'}]`);
        throw new Error(budgetCheck.reason);
      }

      recordRequest();

      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      const text = response.text || '';

      if (!text.trim()) {
        throw new Error('Gemini boş yanıt döndürdü');
      }

      // TOKEN KULLANIMI KAYDET
      recordTokenUsage(caller || 'unknown', typeof prompt === 'string' ? prompt : JSON.stringify(prompt), text);

      return { 
        text, 
        retries: attempt, 
        durationMs: Date.now() - startTime,
        rawResponse: response
      };
    } catch (err: any) {
      lastError = err;
      const status = err.status || err.code || 0;
      const isRetryable = status === 429 || status === 503 || status === 500
        || err.message?.includes('429')
        || err.message?.includes('RESOURCE_EXHAUSTED')
        || err.message?.includes('overloaded');

      if (attempt < MAX_RETRIES && isRetryable) {
        const backoffMs = BASE_BACKOFF_MS * Math.pow(2, attempt) + Math.random() * 500;
        console.warn(
          `[AI_CLIENT] ⚠️ Retry ${attempt + 1}/${MAX_RETRIES} ` +
          `(${status || err.message?.substring(0, 50)}) — ${Math.ceil(backoffMs / 1000)}s bekleniyor...` +
          (caller ? ` [çağıran: ${caller}]` : '')
        );
        await sleep(backoffMs);
        continue;
      }

      // Retryable değil veya max retry aşıldı
      break;
    }
  }

  // Tüm denemeler başarısız
  const errorMsg = lastError?.message || 'Bilinmeyen AI hatası';
  console.error(`[AI_CLIENT] 🔴 AI çağrısı tamamen başarısız (${MAX_RETRIES} deneme)${caller ? ` [${caller}]` : ''}: ${errorMsg}`);
  throw lastError || new Error(errorMsg);
}

// ═══════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════

export const alohaAI = {
  /**
   * Düz metin üretimi
   * @example const result = await alohaAI.generate('Haber yaz', { temperature: 0.7 });
   */
  async generate(prompt: string | any[], options: GenerateOptions = {}, caller?: string): Promise<{ text: string, usageMetadata?: any, rawResponse?: any }> {
    const result = await generateWithRetry(prompt, options, caller);
    if (result.retries > 0) {
      console.log(`[AI_CLIENT] 📊 Başarılı — ${result.retries} retry sonrası, ${result.durationMs}ms`);
    }
    return { text: result.text, rawResponse: result.rawResponse };
  },

  /**
   * JSON üretimi — otomatik parse + hata kontrolü
   * @example const data = await alohaAI.generateJSON<MyType>('JSON ver');
   */
  async generateJSON<T = any>(
    prompt: string | any[],
    options: GenerateOptions = {},
    caller?: string
  ): Promise<T> {
    const result = await generateWithRetry(
      prompt,
      { ...options, responseMimeType: 'application/json' },
      caller
    );

    try {
      return JSON.parse(result.text) as T;
    } catch (parseErr) {
      // JSON parse başarısız — markdown fence temizleme dene
      const cleaned = result.text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      try {
        return JSON.parse(cleaned) as T;
      } catch {
        console.error(
          `[AI_CLIENT] 🔴 JSON parse hatası${caller ? ` [${caller}]` : ''}: ` +
          result.text.substring(0, 200)
        );
        throw new Error(`AI JSON parse başarısız: ${(parseErr as Error).message}`);
      }
    }
  },


  /**
   * Ham GoogleGenAI istemcisine erişim (özel kullanımlar için)
   * Mümkünse generate() veya generateJSON() kullanın.
   */
  getClient(): GoogleGenAI {
    return getClient();
  },

  /**
   * Merkezi görsel model sabiti — imageAgent, newsEngine, vb. buradan çeker
   */
  getImageModel(): string {
    return IMAGE_MODEL;
  },

  /**
   * API key durumunu kontrol et
   */
  isAvailable(): boolean {
    try {
      getClient();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Rate limit durumu
   */
  getRateLimitStatus(): { remaining: number; windowMs: number } {
    const now = Date.now();
    const recentRequests = _requestTimestamps.filter(t => t > now - RATE_LIMIT_WINDOW_MS).length;
    return {
      remaining: MAX_REQUESTS_PER_MINUTE - recentRequests,
      windowMs: RATE_LIMIT_WINDOW_MS,
    };
  },

  /**
   * Günlük token kullanım raporu — Dashboard ve costGuard için
   */
  getTokenUsage(): {
    dailyTokensUsed: number;
    dailyBudget: number;
    dailyCallCount: number;
    cycleCallCount: number;
    budgetPercentage: number;
    agentBreakdown: Record<string, { calls: number; estimatedTokens: number }>;
    isOverBudget: boolean;
  } {
    resetDailyIfNeeded();
    return {
      dailyTokensUsed: _dailyTokensUsed,
      dailyBudget: DAILY_TOKEN_BUDGET,
      dailyCallCount: _dailyCallCount,
      cycleCallCount: _cycleCallCount,
      budgetPercentage: Math.round((_dailyTokensUsed / DAILY_TOKEN_BUDGET) * 100),
      agentBreakdown: { ..._agentUsage },
      isOverBudget: _dailyTokensUsed >= DAILY_TOKEN_BUDGET,
    };
  },

  /**
   * Döngü başlangıcında çağır — döngü call sayacını sıfırla
   */
  resetCycleCounter(): void {
    _cycleCallCount = 0;
  },

  // ═══ CONTEXT CACHING ═══

  /**
   * Sistem komutlarını (knowledge.md) cache'e al.
   * 1 saat TTL ile saklanır. Aynı cache varsa tekrar oluşturmaz.
   * Cache yoksa veya expire olduysa otomatik yeniler.
   * 
   * @returns Cache name (cachedContents/xxx) veya null (fallback: cache'siz çalış)
   */
  async getOrCreateCache(systemInstruction: string, displayName: string = 'aloha-knowledge'): Promise<string | null> {
    try {
      const client = getClient();

      // Mevcut cache'i kontrol et
      if (_cachedContentName && _cacheExpiry && Date.now() < _cacheExpiry) {
        return _cachedContentName;
      }

      // Mevcut cache listesinde ara (displayName ile)
      const existing = await client.caches.list({ config: { pageSize: 10 } });
      for await (const cached of existing) {
        if (cached.displayName === displayName && cached.name) {
          const expireTime = cached.expireTime ? new Date(cached.expireTime).getTime() : 0;
          if (expireTime > Date.now()) {
            _cachedContentName = cached.name;
            _cacheExpiry = expireTime;
            console.log(`[AI_CLIENT] ♻️ Mevcut cache bulundu: ${cached.name} (${Math.round((expireTime - Date.now()) / 60000)}dk kaldi)`);
            return cached.name;
          }
        }
      }

      // Yeni cache oluştur (1 saat TTL)
      const result = await client.caches.create({
        model: DEFAULT_MODEL,
        config: {
          contents: [{ role: 'user', parts: [{ text: systemInstruction }] }],
          displayName,
          systemInstruction: 'Sen aipyram ekosisteminin otonom AI CTO\'susun. Bu bilgi tabanini referans olarak kullan.',
          ttl: '3600s',
        }
      });

      if (result.name) {
        _cachedContentName = result.name;
        _cacheExpiry = Date.now() + 3600000; // 1 saat
        console.log(`[AI_CLIENT] ✅ Yeni cache oluşturuldu: ${result.name}`);
        return result.name;
      }

      return null;
    } catch (err: any) {
      // Cache desteklenmiyor veya hata — graceful fallback
      console.warn(`[AI_CLIENT] ⚠️ Context caching kullanılamadı: ${err.message?.substring(0, 100)} — cache'siz devam`);
      return null;
    }
  },

  // ═══ EMBEDDING ÜRETİMİ ═══

  /**
   * Metin için embedding vektörü üret (vector search için)
   * Önce multimodal embedding (gemini-embedding-exp-03-07) dener,
   * başarısızsa text-embedding-004'e fallback yapar.
   * 
   * @returns number[] (768 boyutlu vektör) veya null
   */
  async generateEmbedding(text: string, caller?: string): Promise<number[] | null> {
    try {
      const client = getClient();
      recordRequest();

      // Önce yeni multimodal embedding modelini dene
      try {
        const result = await client.models.embedContent({
          model: EMBEDDING_MODEL,
          contents: text.substring(0, 2000),
        });
        const embedding = result?.embeddings?.[0]?.values;
        if (embedding && embedding.length > 0) return embedding;
      } catch {
        // Fallback: eski text-embedding modeli
        const result = await client.models.embedContent({
          model: EMBEDDING_MODEL_FALLBACK,
          contents: text.substring(0, 2000),
        });
        const embedding = result?.embeddings?.[0]?.values;
        if (embedding && embedding.length > 0) return embedding;
      }

      console.warn(`[AI_CLIENT] ⚠️ Embedding boş döndü${caller ? ` [${caller}]` : ''}`);
      return null;
    } catch (err: any) {
      console.error(`[AI_CLIENT] 🔴 Embedding hatası${caller ? ` [${caller}]` : ''}: ${err.message?.substring(0, 100)}`);
      return null;
    }
  },


  /**
   * Derin analiz modeli (Gemini 3.1 Pro)
   */
  getDeepModel(): string {
    return DEEP_MODEL;
  },
};

// ═══════════════════════════════════════
//  CONTEXT CACHE STATE
// ═══════════════════════════════════════

let _cachedContentName: string | null = null;
let _cacheExpiry: number | null = null;

// ═══════════════════════════════════════
//  YARDIMCI
// ═══════════════════════════════════════

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
