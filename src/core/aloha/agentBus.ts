import { adminDb } from '@/lib/firebase-admin';
import { alohaAI } from './aiClient';

/**
 * ALOHA AGENT BUS — Çift Yönlü Ajan İletişim Sistemi
 * 
 * Mevcut agent_message: tek yönlü (gönder → unut)
 * Yeni agent bus: gönder → bekle → cevap al → karar ver
 * 
 * Firestore tabanlı (restart-safe, dağıtık)
 * Koleksiyon: aloha_agent_bus
 * 
 * Akış:
 * 1. Aloha bir ajana görev gönderir (send_and_wait)
 * 2. Ajan görevi işler (veya Gemini simüle eder)
 * 3. Sonuç Firestore'a yazılır
 * 4. Aloha sonucu okur → kararına dahil eder
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
// AJAN İŞLEMCİLERİ — Her ajanın "düşünme" kapasitesi
// ═══════════════════════════════════════

type AgentHandler = (payload: Record<string, any>) => Promise<AgentResponse>;

async function simulateAgentWithGemini(agentId: string, payload: Record<string, any>): Promise<AgentResponse> {
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
      `agentbus_${agentId}`
    );

    return result || { success: false, data: null, reasoning: 'AI response boş' };
  } catch (e: any) {
    return { success: false, data: null, reasoning: `Ajan simülasyonu hatası: ${e.message}` };
  }
}

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
      // Timeout ile çalıştır
      const result = await Promise.race([
        simulateAgentWithGemini(to, payload),
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
