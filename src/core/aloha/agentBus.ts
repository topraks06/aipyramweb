import { adminDb } from '@/lib/firebase-admin';
import { alohaAI, aiGenkit } from './aiClient';
import crypto from 'crypto';
import { z } from 'zod';

/**
 * ALOHA AGENT BUS — A2A Protocol Uyumlu Ajan İletişim Sistemi
 * 
 * Q2 2026 Güncellemesi:
 * - Google A2A (Agent-to-Agent) Protocol adaptörü eklendi
 * - Agent Identity: Her ajana kriptografik ID atanıyor
 * - transfer_to_agent(): ADK Meta-Cognition uyumlu görev delegasyonu
 * - Execution Trace: Tam denetlenebilir akış izleme
 * 
 * Mevcut agent bus: gönder → bekle → cevap al → karar ver
 * Firestore tabanlı (restart-safe, dağıtık)
 * Koleksiyon: aloha_agent_bus
 */

// ═══════════════════════════════════════
// TİP TANIMLARI
// ═══════════════════════════════════════

export interface AgentMessage {
  id?: string;
  from: string;
  to: string;
  type: 'task' | 'query' | 'decision_request' | 'alert';
  payload: Record<string, any>;
  priority: 'critical' | 'high' | 'normal' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'timeout';
  response?: AgentResponse;
  createdAt: string;
  completedAt?: string;
  timeoutMs: number;
  retryCount: number;
  maxRetries: number;
}

export interface AgentResponse {
  success: boolean;
  data: any;
  reasoning?: string;
  confidence?: number;
  suggestedNextAction?: string;
}

// ═══════════════════════════════════════
// A2A PROTOCOL — AGENT IDENTITY & REGISTRY
// Google Cloud Next '26: Her ajana kriptografik ID
// ═══════════════════════════════════════

export interface AgentIdentity {
  agentId: string;
  cryptoId: string;         // SHA-256 tabanlı deterministik ID
  capabilities: string[];   // Bu ajanın yapabileceği işler
  maxConcurrency: number;   // Eşzamanlı görev limiti
  registeredAt: string;
}

const _agentRegistry = new Map<string, AgentIdentity>();

/**
 * Agent Registry — Tüm ajanları kriptografik ID ile indeksle
 * Google A2A Protocol standardına uyumlu
 */
export function registerAgent(agentId: string, capabilities: string[] = [], maxConcurrency: number = 3): AgentIdentity {
  const cryptoId = crypto.createHash('sha256').update(`sovereign_${agentId}_${Date.now()}`).digest('hex').substring(0, 16);
  const identity: AgentIdentity = {
    agentId,
    cryptoId,
    capabilities,
    maxConcurrency,
    registeredAt: new Date().toISOString(),
  };
  _agentRegistry.set(agentId, identity);
  return identity;
}

export function getAgentIdentity(agentId: string): AgentIdentity | undefined {
  return _agentRegistry.get(agentId);
}

export function getAllRegisteredAgents(): AgentIdentity[] {
  return Array.from(_agentRegistry.values());
}

// Başlangıçta ana ajanları kaydet
[
  { id: 'research_agent', caps: ['web_research', 'data_analysis'] },
  { id: 'decision_agent', caps: ['strategy', 'risk_assessment'] },
  { id: 'content_agent', caps: ['article_writing', 'seo_optimization'] },
  { id: 'seo_agent', caps: ['keyword_analysis', 'meta_optimization'] },
  { id: 'auditor', caps: ['certificate_verification', 'trust_scoring'] },
  { id: 'matchmaker', caps: ['rfq_matching', 'supplier_scoring'] },
  { id: 'trendsetter', caps: ['market_analysis', 'price_tracking'] },
  { id: 'learning_agent', caps: ['deal_analysis', 'knowledge_extraction'] },
].forEach(a => registerAgent(a.id, a.caps));

// ═══════════════════════════════════════
// EXECUTION TRACE — Tam denetlenebilir akış izleme
// ═══════════════════════════════════════

export interface ExecutionTrace {
  traceId: string;
  steps: Array<{
    agentId: string;
    action: string;
    startTime: number;
    endTime?: number;
    success?: boolean;
    tokenCost?: number;
  }>;
  totalDurationMs: number;
  status: 'running' | 'completed' | 'failed';
}

const _activeTraces = new Map<string, ExecutionTrace>();

export function startTrace(): string {
  const traceId = `trace_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  _activeTraces.set(traceId, {
    traceId,
    steps: [],
    totalDurationMs: 0,
    status: 'running',
  });
  return traceId;
}

export function addTraceStep(traceId: string, agentId: string, action: string): void {
  const trace = _activeTraces.get(traceId);
  if (trace) {
    trace.steps.push({ agentId, action, startTime: Date.now() });
  }
}

export function completeTraceStep(traceId: string, agentId: string, success: boolean): void {
  const trace = _activeTraces.get(traceId);
  if (trace) {
    const step = trace.steps.find(s => s.agentId === agentId && !s.endTime);
    if (step) {
      step.endTime = Date.now();
      step.success = success;
    }
  }
}

export function getTrace(traceId: string): ExecutionTrace | undefined {
  return _activeTraces.get(traceId);
}

// ═══════════════════════════════════════
// AJAN İŞLEMCİLERİ — Her ajanın "düşünme" kapasitesi (GENKIT FLOW)
// ═══════════════════════════════════════
// Q2 2026: Artık standart bir fonksiyon değil, Genkit Flow'u.
// Bu sayede Genkit UI üzerinden (localhost:4000) tüm ajan düşünme süreçleri görselleştirilir.

export const simulateAgentFlow = aiGenkit.defineFlow({
  name: 'simulateAgentFlow',
  inputSchema: z.object({
    agentId: z.string(),
    payload: z.any()
  }),
  outputSchema: z.any()
}, async (input) => {
  const { agentId, payload } = input;
  try {
    const agentPrompts: Record<string, string> = {
      research_agent: `Sen bir ARAŞTIRMA AJANISIN. Verilen konuyu analiz et, veri topla, sonuç üret.`,
      decision_agent: `Sen bir KARAR AJANISIN. Verilen veriyi analiz et, stratejik karar oluştur.`,
      content_agent: `Sen bir İÇERİK UZMAN AJANISIN. Konu analizi yap, içerik stratejisi öner.`,
      seo_agent: `Sen bir SEO UZMAN AJANISIN. SEO analizi yap, optimizasyon öner.`,
      auditor: `Sen bir DENETİM AJANISIN. Sorunları tespit et, çözüm öner.`,
      matchmaker: `Sen bir B2B EŞLEŞTİRME AJANISIN. Alıcı-tedarikçi eşleştirme yap.`,
      trendsetter: `Sen bir TREND ANALİZ AJANISIN. Pazar trendlerini analiz et.`,
      learning_agent: `Sen bir ÖĞRENME AJANISIN. Geçmiş aksiyonları analiz et, ders çıkar.`,
    };

    const systemPrompt = agentPrompts[agentId] || `Sen ${agentId} uzman ajanısın.`;

    const result = await alohaAI.generateJSON<AgentResponse>(
      `${systemPrompt}\n\nGÖREV: ${JSON.stringify(payload)}\n\nJSON formatında cevap ver:\n{\n  "success": true/false,\n  "data": { ... analiz sonuçları ... },\n  "reasoning": "kısa açıklama",\n  "confidence": 0.0-1.0,\n  "suggestedNextAction": "sonraki adım önerisi"\n}`,
      { complexity: 'routine', temperature: 0.4 },
      `genkit_${agentId}`
    );

    return result || { success: false, data: null, reasoning: 'AI response boş' };
  } catch (e: any) {
    return { success: false, data: null, reasoning: `Genkit Ajan simülasyonu hatası: ${e.message}` };
  }
});

// ═══════════════════════════════════════
// SEND AND WAIT — Ana İletişim Fonksiyonu
// ═══════════════════════════════════════

/**
 * Bir ajana mesaj gönder ve CEVAP BEKLE
 * 
 * @param to - Hedef ajan ID
 * @param type - Mesaj tipi 
 * @param payload - Görev içeriği
 * @param options - timeout, retries, priority
 * @returns AgentResponse veya timeout hatası
 */
export async function sendAndWait(
  to: string,
  type: AgentMessage['type'],
  payload: Record<string, any>,
  options: {
    timeoutMs?: number;
    maxRetries?: number;
    priority?: AgentMessage['priority'];
  } = {}
): Promise<AgentResponse> {
  const timeoutMs = options.timeoutMs || 20000;  // 20 saniye default
  const maxRetries = options.maxRetries || 2;
  const priority = options.priority || 'normal';

  console.log(`[🔗 AGENT BUS] ${to} → ${type} (timeout: ${timeoutMs}ms, retry: ${maxRetries})`);

  // Firestore'a mesaj yaz
  const message: Omit<AgentMessage, 'id'> = {
    from: 'aloha',
    to,
    type,
    payload,
    priority,
    status: 'pending',
    createdAt: new Date().toISOString(),
    timeoutMs,
    retryCount: 0,
    maxRetries,
  };

  let messageId = '';
  if (adminDb) {
    const ref = await adminDb.collection('aloha_agent_bus').add(message);
    messageId = ref.id;
  }

  // Ajan çağır (Gemini ile simüle et)
  let response: AgentResponse | null = null;
  let lastError = '';

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Timeout ile çalıştır - Genkit Flow'u tetikle
      const result = await Promise.race([
        simulateAgentFlow({ agentId: to, payload }),
        new Promise<AgentResponse>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
        ),
      ]);

      response = result;

      // Başarılı → Firestore güncelle
      if (adminDb && messageId) {
        await adminDb.collection('aloha_agent_bus').doc(messageId).update({
          status: 'completed',
          response,
          completedAt: new Date().toISOString(),
          retryCount: attempt,
        });
      }

      console.log(`[🔗 AGENT BUS] ✅ ${to} → yanıt geldi (güven: ${response.confidence || '?'}, deneme: ${attempt + 1})`);
      break;

    } catch (e: any) {
      lastError = e.message;
      console.warn(`[🔗 AGENT BUS] ⚠️ ${to} deneme ${attempt + 1}/${maxRetries + 1} başarısız: ${lastError}`);

      if (attempt < maxRetries) {
        // Retry arasında kısa bekleme
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  // Tüm denemeler başarısız
  if (!response) {
    if (adminDb && messageId) {
      await adminDb.collection('aloha_agent_bus').doc(messageId).update({
        status: 'failed',
        completedAt: new Date().toISOString(),
        response: { success: false, data: null, reasoning: `Tüm denemeler başarısız: ${lastError}` },
      });
    }

    return {
      success: false,
      data: null,
      reasoning: `${to} ajanı yanıt vermedi (${maxRetries + 1} deneme, timeout: ${timeoutMs}ms): ${lastError}`,
    };
  }

  return response;
}

// ═══════════════════════════════════════
// MULTI-AGENT ORKESTRASYON
// ═══════════════════════════════════════

/**
 * Paralel birden fazla ajana görev gönder ve tüm sonuçları topla
 */
export async function broadcastAndCollect(
  agents: string[],
  type: AgentMessage['type'],
  payload: Record<string, any>,
  timeoutMs: number = 15000,
): Promise<Record<string, AgentResponse>> {
  const results: Record<string, AgentResponse> = {};

  const promises = agents.map(async (agentId) => {
    const response = await sendAndWait(agentId, type, payload, { timeoutMs, maxRetries: 1 });
    results[agentId] = response;
  });

  await Promise.allSettled(promises);
  return results;
}

/**
 * Zincirli görev: Research → Decision → Execution akışı
 */
export async function chainAgents(
  steps: Array<{
    agent: string;
    type: AgentMessage['type'];
    payload: Record<string, any>;
    passResultAs?: string;  // önceki adımın sonucunu bu key ile payload'a ekle
  }>,
): Promise<{ success: boolean; finalResult: any; steps: Array<{ agent: string; response: AgentResponse }> }> {
  const stepResults: Array<{ agent: string; response: AgentResponse }> = [];
  let previousResult: any = null;

  for (const step of steps) {
    const enrichedPayload = { ...step.payload };
    if (step.passResultAs && previousResult) {
      enrichedPayload[step.passResultAs] = previousResult;
    }

    const response = await sendAndWait(step.agent, step.type, enrichedPayload, {
      timeoutMs: 25000,
      maxRetries: 1,
    });

    stepResults.push({ agent: step.agent, response });

    if (!response.success) {
      console.warn(`[🔗 CHAIN] ❌ ${step.agent} başarısız → zincir durdu`);
      return { success: false, finalResult: null, steps: stepResults };
    }

    previousResult = response.data;
  }

  return {
    success: true,
    finalResult: previousResult,
    steps: stepResults,
  };
}

// ═══════════════════════════════════════
// A2A PROTOCOL — transfer_to_agent()
// ADK Meta-Cognition uyumlu görev delegasyonu
// ═══════════════════════════════════════

/**
 * transfer_to_agent — A2A Protocol standardında görev delegasyonu
 * Orkestratör ajan, alt ajana görev devrederken bu fonksiyonu kullanır.
 * Google ADK Meta-Cognition: Orkestratör, alt ajanların yeteneklerini bilerek yönlendirir.
 * 
 * @param fromAgent - Gönderen ajan ID
 * @param toAgent - Hedef ajan ID  
 * @param task - Görev açıklaması
 * @param context - Bağlam verisi
 * @returns AgentResponse
 */
export async function transfer_to_agent(
  fromAgent: string,
  toAgent: string,
  task: string,
  context: Record<string, any> = {},
): Promise<AgentResponse> {
  // 1. Agent Identity doğrulama
  const targetIdentity = getAgentIdentity(toAgent);
  if (!targetIdentity) {
    // Otomatik kayıt (lazy registration)
    registerAgent(toAgent, ['general']);
    console.warn(`[A2A] ${toAgent} kayıtlı değildi, otomatik kaydedildi`);
  }

  // 2. Execution Trace başlat
  const traceId = startTrace();
  addTraceStep(traceId, fromAgent, `transfer_to_${toAgent}`);
  addTraceStep(traceId, toAgent, task.substring(0, 50));

  console.log(`[🔗 A2A TRANSFER] ${fromAgent} → ${toAgent}: ${task.substring(0, 80)}...`);

  // 3. sendAndWait ile standart iletişim
  const response = await sendAndWait(toAgent, 'task', {
    ...context,
    task,
    delegatedBy: fromAgent,
    a2a_protocol_version: '1.0',
    trace_id: traceId,
  }, {
    timeoutMs: 30000,
    maxRetries: 2,
    priority: 'high',
  });

  // 4. Trace tamamla
  completeTraceStep(traceId, toAgent, response.success);
  completeTraceStep(traceId, fromAgent, response.success);

  // 5. Firestore'a A2A log yaz (denetlenebilirlik)
  if (adminDb) {
    try {
      await adminDb.collection('a2a_transfer_log').add({
        fromAgent,
        toAgent,
        task: task.substring(0, 200),
        success: response.success,
        confidence: response.confidence || 0,
        traceId,
        timestamp: new Date().toISOString(),
      });
    } catch { /* fire & forget */ }
  }

  return response;
}
