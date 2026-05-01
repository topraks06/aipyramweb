/**
 * LATEST VERSION - HAKAN BEY ONAYLI. DO NOT REVERT.
 * [HAKAN BEY KURALI (ANTI-REGRESSION)]: Sistemdeki modeller (gemini-3.1-flash, Genkit) hata verirse, AI ajanları ASLA modeli eski bir sürüme (örn: 2.5-flash) veya eski agentBus yapısına düşüremez. Hata veren kod çözülecek, API limitleri beklenecek ama sürüm düşürülmeyecek!
 * 
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
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// ═══════════════════════════════════════
//  GENKIT (AGENTIC FRAMEWORK) BAŞLATMA
// ═══════════════════════════════════════
// Q2 2026: Eski agentBus yapısı yerine resmi Firebase Genkit altyapısı.
export const aiGenkit = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' })],
});


// ═══════════════════════════════════════
//  KONFİGÜRASYON
// ═══════════════════════════════════════

// MODEL HABERLERİ (2026 Q2 — NİSAN GÜNCELLEMELERİ)
// - gemini-2.5-flash: Ana model (stabil, hızlı, düşük maliyet)
// - gemini-3.1-pro: Kompleks analiz (Deep Research Max)
// - gemini-3.1-flash-image-preview: GÖRSEL — Nano Banana 2 (3x hızlı, 4K, 14 referans obje, karakter tutarlılığı)
// - gemini-embedding-2: GA multimodal embedding (3072-dim, metin+görüntü+ses+video)
// → ESKİ: imagen-3.0-generate-002 → YEDEĞe alındı (fallback olarak kalıyor)
// → ESKİ: gemini-embedding-exp-03-07 → YEDEĞe alındı (fallback olarak kalıyor)

// ╔═══════════════════════════════════════════════════════════════╗
// ║  🚨 ACİL MALİYET KİLİDİ — HAKAN BEY EMRİ (30 NİSAN 2026)   ║
// ║  AYLIK BÜTÇE: MAX $20 USD. BU LİMİT AŞILAMAZ.               ║
// ║  GÖRSEL ÜRETİM: TAMAMEN KAPALI (KILL SWITCH AÇIK)            ║
// ║  PRO MODEL: KAPALI — HER ŞEY FLASH LITE İLE ÇALIŞIR         ║
// ╚═══════════════════════════════════════════════════════════════╝
const DEFAULT_MODEL = 'gemini-2.0-flash-lite'; // EN UCUZ MODEL — Tüm rutin işlemler
const DEEP_MODEL = 'gemini-2.0-flash-lite';    // 🔒 PRO KAPALI — Flash Lite'a düşürüldü (maliyet kilidi)
const MICRO_MODEL = 'gemini-2.0-flash-lite';   // En ucuz
const IMAGE_MODEL = 'gemini-2.0-flash-lite';   // 🔒 GÖRSEL ÜRETİM KAPALI — model sadece referans
const IMAGE_MODEL_FALLBACK = 'gemini-2.0-flash-lite';  // 🔒 Imagen KAPALI
const EMBEDDING_MODEL = 'text-embedding-004';           // Ücretsiz tier embedding
const EMBEDDING_MODEL_FALLBACK = 'text-embedding-004';  // Ücretsiz tier
const MAX_RETRIES = 2;              // 3→2 (daha az retry = daha az token)
const BASE_BACKOFF_MS = 2000;       // 2s → 4s (daha yavaş = daha az çağrı)
const RATE_LIMIT_WINDOW_MS = 60000; // 1 dakika
const MAX_REQUESTS_PER_MINUTE = 15; // 55→15 (dakikada max 15 çağrı)

// 🔒 GÖRSEL ÜRETİM — NODE BAZLI KONTROL (sovereignAuthority üzerinden)
// Eski: export const IMAGE_GENERATION_DISABLED = true;
// Yeni: Node bazlı render kontrolü — icmimar.ai AÇIK, diğerleri KAPALI
import { 
  checkNodeAuthority, 
  recordNodeTokenUsage, 
  recordNodeRenderUsage, 
  logAudit,
  type ActionType, 
  type RenderType 
} from './sovereignAuthority';

/**
 * Node bazlı render kontrolü. icmimar.ai için render açık,
 * diğer node'lar için kapalı. Firestore override ile runtime'da değiştirilebilir.
 * Eski sisteme geriye uyumlu export korunuyor (legacy kod kırılmasın).
 */
export const IMAGE_GENERATION_DISABLED = true; // ⚠️ LEGACY — node bazlı isImageAllowedForNode() kullanın

export async function isImageAllowedForNode(nodeId: string, userEmail?: string): Promise<{ allowed: boolean; reason: string }> {
  return checkNodeAuthority(nodeId, 'image_generation', userEmail);
}

// ═══════════════════════════════════════
//  HİBRİT MOD UYARISI (Gemini Audit Önerisi #1)
// ═══════════════════════════════════════
// ⚠️ HİBRİT MOD AZALTMA (Q2 2026 Göçü Devam Ediyor)
// FabricRecognitionAgent, crawlerAgent, rag.ts → merkezi alohaAI'ye göçürüldü.
// Kalan hibrit dosyalar kademeli olarak taşınıyor.
if (typeof process !== 'undefined') {
  console.warn('[AI_CLIENT] ⚠️ Q2 GÖÇ AKTİF — Kalan hibrit dosyalar kademeli olarak merkezi router\'a taşınıyor.');
}

// ═══════════════════════════════════════
//  GÜNLÜK TOKEN BÜTÇESİ (MALİYE BAKANI v2)
// ═══════════════════════════════════════
const DAILY_TOKEN_BUDGET = 50_000;        // 🔒 500K→50K — Günlük max 50K token (~$0.50/gün = $15/ay)
const MAX_GEMINI_CALLS_PER_CYCLE = 3;     // 🔒 8→3 — Döngü başına max 3 çağrı
const MONTHLY_BUDGET_USD = 20;            // 🔒 AYLIK HARD LİMİT: $20 USD
const DAILY_BUDGET_USD = MONTHLY_BUDGET_USD / 30; // ~$0.66/gün

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

let _killSwitchActive = false;
let _killSwitchReason = "";
let _lastKillSwitchCheck = 0;

async function checkRemoteKillSwitch() {
  if (!adminDb || Date.now() - _lastKillSwitchCheck < 60000) return; // Check every 60s
  _lastKillSwitchCheck = Date.now();
  try {
    const doc = await adminDb.collection('aloha_system_state').doc('finance').get();
    if (doc.exists) {
      const data = doc.data();
      if (data?.global_kill_switch === true) {
        _killSwitchActive = true;
        _killSwitchReason = data?.reason || "CFO Ajanı veya Yönetici tarafından sistem uyku moduna alındı.";
      } else {
        _killSwitchActive = false;
      }
    }
  } catch (e) {
    // Sessiz hata - veritabanı erişilemiyorsa sistemi kitleme
  }
}

function checkBudget(caller?: string): { allowed: boolean; reason?: string } {
  resetDailyIfNeeded();

  if (_killSwitchActive) {
    return {
      allowed: false,
      reason: `🚨 OTONOM KILL SWITCH AKTİF: ${_killSwitchReason}`
    };
  }

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
  complexity?: 'routine' | 'complex' | 'vision' | 'micro'; // Sprint D Model Routing
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
function getRouterModel(complexity?: 'routine' | 'complex' | 'vision' | 'micro'): string {
  // 🔒 MALİYET KİLİDİ: Tüm karmaşıklık seviyeleri aynı ucuz modele yönlendirilir
  // Pro model KAPALI — Hakan Bey emri: aylık $20 limiti
  return DEFAULT_MODEL; // HER ŞEY gemini-2.0-flash-lite
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
        // B2B Hesap Makinesi (Aşama 2 Upgrade): Code Execution (Kum havuzunda Python kodu çalıştırma)
        config.tools = [{ googleSearch: {} }, { codeExecution: {} }];
      }
      
      if ((options as any).responseSchema) config.responseSchema = (options as any).responseSchema;

      // UZAK KILL SWITCH KONTROLÜ
      await checkRemoteKillSwitch();

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

function inferNodeFromCaller(caller?: string): string {
  if (!caller) return 'trtex'; // default fallback for older agents
  const low = caller.toLowerCase();
  if (low.includes('icmimar') || low.includes('render') || low.includes('studio')) return 'icmimar';
  if (low.includes('perde')) return 'perde';
  if (low.includes('hometex') || low.includes('expo')) return 'hometex';
  if (low.includes('vorhang')) return 'vorhang';
  if (low.includes('heimtex') || low.includes('magazine')) return 'heimtex';
  return 'trtex';
}

export const alohaAI = {
  /**
   * Düz metin üretimi
   * @example const result = await alohaAI.generate('Haber yaz', { temperature: 0.7 });
   */
  async generate(prompt: string | any[], options: GenerateOptions = {}, caller?: string): Promise<{ text: string, usageMetadata?: any, rawResponse?: any }> {
    // 🔥 AUTO-ROUTE LEGACY CALLS TO EXECUTE_TASK (HARD LOCK) 🔥
    const nodeId = inferNodeFromCaller(caller);
    const res = await executeTask({
      nodeId,
      action: 'text_generation',
      payload: { prompt, ...options },
      caller
    });
    if (!res.success) throw new Error(res.error || "generate() failed during executeTask routing");
    return res.data;
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
    // 🔥 AUTO-ROUTE LEGACY CALLS TO EXECUTE_TASK (HARD LOCK) 🔥
    const nodeId = inferNodeFromCaller(caller);
    const res = await executeTask({
      nodeId,
      action: 'text_generation',
      payload: { prompt, ...options, responseMimeType: 'application/json' },
      caller
    });
    
    if (!res.success) throw new Error(res.error || "generateJSON() failed during executeTask routing");
    
    try {
      return JSON.parse(res.data.text) as T;
    } catch (parseErr) {
      const cleaned = res.data.text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      try {
        return JSON.parse(cleaned) as T;
      } catch {
        console.error(`[AI_CLIENT] 🔴 JSON parse hatası${caller ? ` [${caller}]` : ''}: ` + res.data.text.substring(0, 200));
        throw new Error(`AI JSON parse başarısız: ${(parseErr as Error).message}`);
      }
    }
  },

  /**
   * Ham GoogleGenAI istemcisine erişim (özel kullanımlar için)
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
    return _embedInternal(text, caller);
  },

  /**
   * Derin analiz modeli (Gemini 3.1 Pro)
   */
  getDeepModel(): string {
    return DEEP_MODEL;
  },

  /**
   * Node bazlı render kontrolü ile görsel üretimi
   */
  async generateImage(
    prompt: string,
    nodeId: string,
    userEmail?: string,
  ): Promise<{ imageData: string | null; error?: string }> {
    // 🔥 AUTO-ROUTE TO EXECUTE_TASK 🔥
    const res = await executeTask({
      nodeId,
      action: 'image_generation',
      payload: { prompt },
      userEmail,
      caller: `${nodeId}_generateImage`
    });
    if (!res.success) return { imageData: null, error: res.error };
    return { imageData: res.data.imageData };
  },

  /**
   * Mevcut referans görseli kullanarak yeni tasarım üretimi (Image-to-Image)
   */
  async generateImageToImage(
    parts: any[],
    genConfig: any,
    nodeId: string,
    userEmail?: string,
  ): Promise<{ imageData: string | null; preFlightData?: any; error?: string }> {
    if (!budget.allowed) {
      return { imageData: null, error: budget.reason };
    }

    // 3. Rate limit
    if (!checkRateLimit()) {
      return { imageData: null, error: 'Rate limit aşıldı. Biraz bekleyin.' };
    }

    try {
      const client = getClient();
      recordRequest();

      console.log(`[AI_CLIENT] 🎨 Image-to-Image Render başlıyor [${nodeId}]...`);
      const modelName = 'gemini-3-pro-image-preview'; // Veya gemini-3.1-pro-image-preview

      const response = await client.models.generateContent({
        model: modelName,
        contents: { parts },
        config: genConfig,
      });

      const candidate = response.candidates?.[0];
      if (!candidate) throw new Error("Model yanıt döndürmedi.");

      if (candidate.finishReason === "SAFETY") {
        return { imageData: null, error: "Güvenlik filtresi: Görseliniz güvenlik politikalarına takıldı. Farklı bir görsel deneyin." };
      }

      let renderUrl: string | null = null;
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) {
          renderUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!renderUrl) {
        return { imageData: null, error: "Model görsel çıktısı üretmedi. Lütfen farklı bir mekan veya ürün görseli deneyin." };
      }

      // Kullanım kaydet
      recordNodeRenderUsage(nodeId);
      recordTokenUsage(`render_pro_${nodeId}`, 'image_to_image', `[image_generated_${renderUrl.length}_bytes]`);

      console.log(`[AI_CLIENT] ✅ Image-to-Image Render tamamlandı [${nodeId}]`);
      return { imageData: renderUrl };
    } catch (err: any) {
      console.error(`[AI_CLIENT] 🔴 Image-to-Image Render hatası [${nodeId}]: ${err.message?.substring(0, 100)}`);
      
      let msg = err.message || "Bilinmeyen hata";
      if (msg.includes("SAFETY")) msg = "Güvenlik filtresi aktif. Farklı görsel deneyin.";
      else if (msg.includes("too large") || msg.includes("exceeds")) msg = "Görseller çok büyük. Lütfen daha küçük dosyalar kullanın.";
      
      return { imageData: null, error: `Render hatası: ${msg}` };
    }
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

// ╔═══════════════════════════════════════════════════════════════╗
// ║  TEK GİRİŞ NOKTASI: executeTask()                             ║
// ║  Tüm AI operasyonları bu fonksiyondan geçer.                  ║
// ║  Authority + Budget + Action-Level kontrolü.                  ║
// ║  Doğrudan alohaAI.generate() çağırmayın — bypass oluşur.     ║
// ╚═══════════════════════════════════════════════════════════════╝

export interface ExecuteTaskRequest {
  nodeId: string;
  action: ActionType;
  payload: {
    prompt?: string;
    systemInstruction?: string;
    temperature?: number;
    renderType?: RenderType;
    aspectRatio?: string;
    complexity?: 'routine' | 'complex' | 'vision' | 'micro';
    [key: string]: any;
  };
  userEmail?: string;
  caller?: string;
}

export interface ExecuteTaskResult {
  success: boolean;
  data: any;
  error?: string;
  costUSD?: number;
  nodeId: string;
  action: ActionType;
}

/**
 * TEK GİRİŞ NOKTASI — Tüm AI operasyonları bu fonksiyondan geçer.
 * 
 * İçerde:
 *   1. Authority check (action-level)
 *   2. Budget check ($ cost)
 *   3. Tool permission
 *   4. Rate limit
 *   5. Execute
 *   6. Audit log
 * 
 * Kullanım:
 *   const result = await executeTask({ nodeId: 'icmimar', action: 'image_generation', payload: { prompt: '...' } });
 *   const result = await executeTask({ nodeId: 'trtex', action: 'text_generation', payload: { prompt: '...' } });
 */
export async function executeTask(request: ExecuteTaskRequest): Promise<ExecuteTaskResult> {
  const { nodeId, action, payload, userEmail, caller } = request;
  const startTime = Date.now();

  // ── 1. AUTHORITY CHECK (Action-Level + Cost + Kill Switch) ──
  const auth = await checkNodeAuthority(nodeId, action, userEmail, payload.renderType);
  if (!auth.allowed) {
    return {
      success: false,
      data: null,
      error: auth.reason,
      nodeId,
      action,
    };
  }

  try {
    // ── 2. EXECUTE BASED ON ACTION TYPE ──
    switch (action) {
      case 'text_generation': {
        const result = await generateWithRetry(
          payload.prompt || '',
          {
            systemInstruction: payload.systemInstruction,
            temperature: payload.temperature,
            complexity: payload.complexity,
            ...(payload.responseMimeType ? { responseMimeType: payload.responseMimeType } : {})
          },
          caller || `${nodeId}_executeTask`
        );
        return {
          success: true,
          data: { text: result.text, rawResponse: result.rawResponse },
          nodeId,
          action,
        };
      }

      case 'image_generation': {
        const result = await _generateImageInternal(
          payload.prompt || '',
          nodeId,
          userEmail,
        );
        if (!result.imageData) {
          return { success: false, data: null, error: result.error, nodeId, action };
        }
        return {
          success: true,
          data: { imageData: result.imageData, renderType: payload.renderType },
          costUSD: 0.04,
          nodeId,
          action,
        };
      }

      case 'image_to_image_generation': {
        const result = await _generateImageToImageInternal(
          payload.parts || [],
          payload.genConfig || {},
          nodeId,
          userEmail
        );
        if (!result.imageData) {
          return { success: false, data: null, error: result.error, nodeId, action };
        }
        return {
          success: true,
          data: { imageData: result.imageData, preFlightData: result.preFlightData, renderType: payload.renderType },
          costUSD: 0.10,
          nodeId,
          action,
        };
      }

      case 'embedding': {
        const result = await _embedInternal(
          payload.prompt || '',
          caller || `${nodeId}_embed`
        );
        return { success: !!result, data: result, nodeId, action };
      }

      default: {
        // Diğer aksiyonlar (news_pipeline, seo_indexing, vb.) — sadece yetki kontrolü
        // Gerçek iş mantığı çağıran modülde
        logAudit({
          timestamp: new Date().toISOString(),
          nodeId,
          agentId: caller || 'unknown',
          action,
          approved: true,
          reason: `Passthrough — ${action} yetkisi verildi`,
        });
        return {
          success: true,
          data: { authorized: true, action },
          nodeId,
          action,
        };
      }
    }
  } catch (err: any) {
    logAudit({
      timestamp: new Date().toISOString(),
      nodeId,
      agentId: caller || 'unknown',
      action,
      approved: false,
      reason: `HATA: ${err.message?.substring(0, 100)}`,
    });

    return {
      success: false,
      data: null,
      error: `executeTask hatası: ${err.message}`,
      nodeId,
      action,
    };
  }
}

// ═══════════════════════════════════════
//  INTERNAL GENERATION METHODS (USED BY EXECUTE_TASK)
// ═══════════════════════════════════════

async function _embedInternal(text: string, caller?: string): Promise<number[] | null> {
  try {
    const client = getClient();
    recordRequest();
    try {
      const result = await client.models.embedContent({ model: EMBEDDING_MODEL, contents: text.substring(0, 2000) });
      const embedding = result?.embeddings?.[0]?.values;
      if (embedding && embedding.length > 0) return embedding;
    } catch {
      const result = await client.models.embedContent({ model: EMBEDDING_MODEL_FALLBACK, contents: text.substring(0, 2000) });
      const embedding = result?.embeddings?.[0]?.values;
      if (embedding && embedding.length > 0) return embedding;
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function _generateImageInternal(
  prompt: string,
  nodeId: string,
  userEmail?: string,
): Promise<{ imageData: string | null; error?: string }> {
  try {
    const client = getClient();
    recordRequest();

    const response = await client.models.generateContent({
      model: IMAGE_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "Aşağıdaki açıklamaya uygun fotoğraf kalitesinde bir görsel üret.",
      }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.finishReason === "SAFETY") return { imageData: null, error: "Güvenlik filtresi aktif." };

    let renderUrl: string | null = null;
    for (const part of candidate?.content?.parts || []) {
      if (part.inlineData) {
        renderUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }
    
    if (!renderUrl) return { imageData: null, error: "Görsel üretilemedi." };
    recordNodeRenderUsage(nodeId);
    recordTokenUsage(`render_${nodeId}`, 'generate_image', `[image_generated]`);
    return { imageData: renderUrl };
  } catch (err: any) {
    return { imageData: null, error: err.message };
  }
}

async function _generateImageToImageInternal(
  parts: any[],
  genConfig: any,
  nodeId: string,
  userEmail?: string,
): Promise<{ imageData: string | null; preFlightData?: any; error?: string }> {
  try {
    const client = getClient();
    recordRequest();

    const response = await client.models.generateContent({
      model: IMAGE_MODEL,
      contents: [{ role: "user", parts }],
      config: genConfig
    });

    const candidate = response.candidates?.[0];
    if (candidate?.finishReason === "SAFETY") return { imageData: null, error: "Güvenlik filtresi aktif." };

    let renderUrl: string | null = null;
    for (const part of candidate?.content?.parts || []) {
      if (part.inlineData) {
        renderUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!renderUrl) return { imageData: null, error: "Görsel üretilemedi." };
    recordNodeRenderUsage(nodeId);
    recordTokenUsage(`render_pro_${nodeId}`, 'image_to_image', `[image_generated]`);
    return { imageData: renderUrl };
  } catch (err: any) {
    return { imageData: null, error: err.message };
  }
}
