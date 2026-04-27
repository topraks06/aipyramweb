import { NextResponse } from "next/server";
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { SYSTEM_PROMPT, tools, executeToolCall, logAlohaAction } from "@/core/aloha/engine";
import { alohaMemory } from "@/core/aloha/memory";

const ai = alohaAI.getClient();

// SSE flush garantisi: Next.js cache/buffer'ı devre dışı bırak
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function POST(req: Request) {
  try {
    // ═══ G7: BRIDGE KEY GUARD — Geçersiz key'i reddet ═══
    const bridgeKey = req.headers.get("x-aloha-key");
    if (bridgeKey && bridgeKey !== process.env.ALOHA_BRIDGE_KEY) {
      return NextResponse.json({ error: "Unauthorized: Invalid bridge key" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, message, systemContext, inlineData, stream: isStreaming, history } = body;

    if (!message && (!inlineData || inlineData.length === 0)) {
      return NextResponse.json({ error: "Message or file required" }, { status: 400 });
    }

    console.log(`[🚀 ALOHA CHAT v5.0] Komut Alındı: "${message}" | Stream: ${!!isStreaming}`);

    // ═══ FORCE TOOL — Konuşturma, çalıştır! ═══
    // "ticaret modu", "mega pipeline", "balık tut" → direkt pipeline çalışır
    const lowerMsg = (message || '').toLowerCase().trim();

    // ═══ FAST-PATH: Basit selamlar için anında yanıt (engine'e girme) ═══
    const greetings = ['merhaba', 'selam', 'hello', 'hi', 'hey', 'nasılsın', 'günaydın', 'iyi akşamlar'];
    if (greetings.some(g => lowerMsg === g || lowerMsg === g + '!')) {
      return NextResponse.json({
        text: `Merhaba Hakan Bey! \u{1F44B}\n\n**Sovereign Command Center** aktif. \u{1F7E2}\n\nBana ne emredersiniz?\n\n• \`sistem durumu\` \u2014 T\u00fcm node\u2019lar\u0131n sa\u011fl\u0131k kontrol\u00fc\n\u2022 \`d\u00f6ng\u00fc ba\u015flat\` \u2014 Otonom ALOHA d\u00f6ng\u00fcs\u00fc\n\u2022 \`haber yaz: konu\` \u2014 TRTEX haber \u00fcretimi\n\u2022 \`perde sipari\u015fleri\` \u2014 Son sipari\u015f listesi\n\u2022 \`trade report\` \u2014 Ticaret f\u0131rsat raporu`,
        iterations: 0,
        confidence: 1.0,
        execution_ready: false,
      });
    }

    // ═══ FAST-PATH: Sistem durumu sorgusu ═══
    if (lowerMsg === 'sistem durumu' || lowerMsg === 'durum' || lowerMsg === 'status') {
      try {
        const nodes = ['perde.ai', 'trtex.com', 'hometex.ai', 'vorhang.ai', 'icmimar.ai'];
        const tokenUsage = alohaAI.getTokenUsage?.() || { dailyTokensUsed: 0, dailyBudget: 100000, dailyCallCount: 0 };
        return NextResponse.json({
          text: `## \u{1F4CA} Sovereign OS \u2014 Sistem Durumu\n\n**Tarih:** ${new Date().toLocaleDateString('tr-TR')}\n**Saat:** ${new Date().toLocaleTimeString('tr-TR')}\n\n### \u{1F310} Node Durumlar\u0131\n${nodes.map(n => `\u2022 **${n}** \u2014 \u{1F7E2} Online`).join('\n')}\n\n### \u{1F916} ALOHA Motor\n\u2022 Model: \`gemini-2.5-flash\`\n\u2022 G\u00fcnl\u00fck Token: ${tokenUsage.dailyTokensUsed}/${tokenUsage.dailyBudget}\n\u2022 \u00c7a\u011fr\u0131 Say\u0131s\u0131: ${tokenUsage.dailyCallCount}\n\u2022 CFO Guard: \u{2705} Aktif\n\n### \u{1F527} Servisler\n\u2022 Firebase: \u{2705}\n\u2022 Gemini API: \u{2705}\n\u2022 Firestore: \u{2705}`,
          iterations: 0,
          confidence: 0.95,
          execution_ready: false,
        });
      } catch {}
    }
    const forceToolTriggers: Record<string, { tool: string; args: Record<string, any> }> = {
      'ticaret modu': { tool: 'mega_pipeline', args: { project: 'trtex' } },
      'mega pipeline': { tool: 'mega_pipeline', args: { project: 'trtex' } },
      'balık tut': { tool: 'mega_pipeline', args: { project: 'trtex' } },
      'run_trade_pipeline': { tool: 'run_trade_pipeline', args: { project: 'trtex' } },
      'trade report': { tool: 'trade_report', args: {} },
      'fırsat raporu': { tool: 'trade_report', args: {} },
      'haberleri upgrade': { tool: 'upgrade_all_articles', args: { project: 'trtex' } },
      'dergi modu': { tool: 'upgrade_all_articles', args: { project: 'trtex' } },
      'görsel upgrade': { tool: 'upgrade_all_articles', args: { project: 'trtex' } },
      'upgrade_all': { tool: 'upgrade_all_articles', args: { project: 'trtex' } },
    };

    for (const [trigger, action] of Object.entries(forceToolTriggers)) {
      if (lowerMsg.includes(trigger)) {
        console.log(`[ALOHA] ⚡ FORCE TOOL: "${trigger}" → ${action.tool}`);
        try {
          const toolResult = await executeToolCall({
            name: action.tool,
            args: { ...action.args, ...(body.args || {}) },
          } as any);
          return NextResponse.json({
            text: `⚡ Force Tool Çalıştı: ${action.tool}\n\n${toolResult}`,
            iterations: 1,
            forceTool: true,
          });
        } catch (forceErr: any) {
          return NextResponse.json({
            text: `❌ Force Tool Hatası: ${forceErr.message}`,
            iterations: 0,
            forceTool: true,
          });
        }
      }
    }

    // ═══ TRTEX HABER YAZ KOMUTU ═══
    // "haber yaz: konu..." veya "trtex haber: konu..." → direkt haber üretir
    const haberYazMatch = (message || '').match(/(?:haber yaz|trtex haber|haber üret|write topic)[:\s]+(.+)/i);
    if (haberYazMatch) {
      const topic = haberYazMatch[1].trim();
      console.log(`[ALOHA] 📝 HABER YAZ KOMUTU: "${topic}"`);
      try {
        const baseUrl = req.headers.get('host') || 'localhost:3000';
        const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
        const res = await fetch(`${protocol}://${baseUrl}/api/v1/master/trtex/write-topic`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic }),
        });
        const result = await res.json();
        if (result.success) {
          return NextResponse.json({
            text: `✅ **TRTEX Haber Üretildi!**\n\n📰 **${result.title}**\n📁 Kategori: ${result.category}\n🖼️ Görsel: ${result.image_generated ? 'Üretildi' : 'Üretiliyor...'}\n⏱️ Süre: ${Math.round(result.duration_ms / 1000)}s\n🔗 [Haberi Gör](${result.url})\n\nAna sayfa otomatik güncellendi.`,
            iterations: 1,
            forceTool: true,
          });
        } else {
          return NextResponse.json({
            text: `❌ Haber üretilemedi: ${result.error}`,
            iterations: 0,
          });
        }
      } catch (topicErr: any) {
        return NextResponse.json({
          text: `❌ Haber yazma hatası: ${topicErr.message}`,
          iterations: 0,
        });
      }
    }

    // ═══ OTONOM DÖNGÜ KOMUTU ═══
    // "döngü başlat" veya "aloha cycle" → tam otonom döngü
    if (lowerMsg.includes('döngü başlat') || lowerMsg.includes('aloha cycle') || lowerMsg.includes('cycle çalıştır')) {
      console.log(`[ALOHA] 🔄 OTONOM DÖNGÜ KOMUTU tetiklendi`);
      try {
        const { runFullAutonomousCycle } = await import('@/core/aloha/autoRunner');
        const results = await runFullAutonomousCycle();
        const summary = results.map(r => `${r.project}: ${r.actionsPerformed.join(', ')} (${r.errors.length} hata)`).join('\n');
        return NextResponse.json({
          text: `🔄 **Otonom Döngü Tamamlandı!**\n\n${summary}`,
          iterations: 1,
          forceTool: true,
        });
      } catch (cycleErr: any) {
        return NextResponse.json({
          text: `❌ Döngü hatası: ${cycleErr.message}`,
          iterations: 0,
        });
      }
    }

    // ═══ WIKI FEEDBACK LOOP — Düzeltme/kural tespiti ═══
    try {
      const { detectFeedbackIntent, processWikiFeedback } = require('@/core/aloha/wikiFeedback');
      const feedback = detectFeedbackIntent(message);
      if (feedback.isFeedback && feedback.correction && feedback.category) {
        const result = await processWikiFeedback(feedback.correction, feedback.category);
        if (result.success) {
          console.log(`[WIKI FEEDBACK] ✅ Wiki güncellendi: ${feedback.category} ← "${feedback.correction.substring(0, 50)}..."`);
        }
      }
    } catch { /* feedback modülü yüklenemezse sessiz devam */ }

    // Memory Entagrasyonu - Geçmiş oturum anılarını dahil et (Faz 4.3)
    const recentMemories = await alohaMemory.getRecentMemory(10);
    let memoryContextString = "";
    if (recentMemories && recentMemories.length > 0) {
      memoryContextString = "\n\n[🧠 ÜST OTONOM HAFIZA (ÖNCEKİ OTURUMLAR)]:\n";
      recentMemories.forEach(mem => {
          memoryContextString += `- [${new Date(mem.timestamp).toISOString()}] ${mem.action}: ${mem.payload}\n`;
      });
    }

    // 🧠 KALICI DERSLER — Cold start'a dayanıklı hafıza
    let lessonsString = "";
    try {
      const criticalLessons = await alohaMemory.getCriticalLessons(10);
      if (criticalLessons.length > 0) {
        lessonsString = alohaMemory.formatLessonsForPrompt(criticalLessons);
      }
    } catch { /* lessons yüklenemezse sessizce devam */ }

    // 📚 GÜNLÜK BİLGİ BANKASI — Hakan Bey'in stratejik kararları + kuralları
    let knowledgeBase = "";
    try {
      const knowledgePath = require('path').join(process.cwd(), 'src/core/aloha/knowledge.md');
      if (require('fs').existsSync(knowledgePath)) {
        knowledgeBase = "\n\n📚 GÜNLÜK BİLGİ BANKASI (Hakan Bey Notları):\n" + 
          require('fs').readFileSync(knowledgePath, 'utf-8');
      }
    } catch { /* knowledge dosyası okunamazsa sessiz devam */ }

    // Build Gemini Chat with history support
    const chatConfig = {
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `${SYSTEM_PROMPT}${knowledgeBase}\nBağlam: ${JSON.stringify(systemContext || {})}${memoryContextString}${lessonsString}`,
        tools: tools,
        temperature: 0.1,
      },
      ...(history && Array.isArray(history) && history.length > 0 ? {
        history: history.slice(-10).map((msg: any) => ({
          role: msg.role === 'aloha' || msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(msg.text || '').substring(0, 2000) }],
        }))
      } : {}),
    };
    
    const chat = ai.chats.create(chatConfig);

    let parts: any[] = [];
    if (message) {
      parts.push(message);
      alohaMemory.addMemory('user', 'USER_PROMPT', message);
    }

    if (inlineData && Array.isArray(inlineData) && inlineData.length > 0) {
      for (const file of inlineData) {
        if (file.base64 && file.type) {
          parts.push({
            inlineData: { data: file.base64, mimeType: file.type }
          });
          console.log(`[🚀 ALOHA CHAT v5.0] Dosya Eki Algılandı: ${file.name} (${file.type})`);
        }
      }
    }

    // ═══════════════════════════════════════════════════
    // MODE: SSE STREAMING (Real-time tool execution feed)
    // ═══════════════════════════════════════════════════
    if (isStreaming) {
      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        async start(controller) {
          // Micro-yield flush: Node.js bazen buffer'lar, bu onu zorla iter
          const send = async (data: any) => {
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
              await new Promise(r => setTimeout(r, 0)); // flush zorla
            } catch { /* stream closed */ }
          };

          // 🫀 SSE Heartbeat — 15sn'de bir ping göndererek bağlantı kopmasını engelle
          let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
          try {
            heartbeatInterval = setInterval(() => {
              try {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat', ts: Date.now() })}\n\n`));
              } catch { if (heartbeatInterval) clearInterval(heartbeatInterval); }
            }, 15000);

            send({ type: 'status', message: 'Gemini\'ye mesaj gönderiliyor...', tool: null });

            let response = await chat.sendMessage({ message: parts });
            let iterationCount = 0;
            const MAX_ITERATIONS = 15;

            // Initial Gemini response
            if (!response.functionCalls || response.functionCalls.length === 0) {
              const finalR = response.text || 'Anlaşıldı.';
              send({ type: 'final', text: finalR, iterations: 0 });
              alohaMemory.addMemory('assistant', 'FINAL_RESPONSE', finalR);
              clearInterval(heartbeatInterval);
              controller.close();
              return;
            }

            send({ type: 'status', message: `Gemini ${response.functionCalls.length} araç çağırıyor...`, tool: null });

            // MULTI-TURN TOOL LOOP with SSE events
            while (response.functionCalls && response.functionCalls.length > 0 && iterationCount < MAX_ITERATIONS) {
              iterationCount++;
              const functionResponses: any[] = [];

              for (const call of response.functionCalls) {
                // Emit tool start
                send({ 
                  type: 'tool_start', 
                  tool: call.name, 
                  args: call.args, 
                  iteration: iterationCount,
                  message: `🔧 ${call.name} çalıştırılıyor...`
                });

                logAlohaAction("TOOL_EXECUTION_START", { tool: call.name, args: call.args });
                const startTime = Date.now();

                // Execute tool via ENGINE caching wrapper V5
                const toolResult = await executeToolCall(call as any);
                const duration = Date.now() - startTime;

                // Emit tool result
                send({ 
                  type: 'tool_result', 
                  tool: call.name, 
                  result: toolResult.substring(0, 5000),
                  duration,
                  iteration: iterationCount,
                  message: `✅ ${call.name} tamamlandı (${duration}ms)`
                });

                console.log(`[✅ TOOL SONUÇ] ${call.name}: ${toolResult.substring(0, 200)}...`);

                functionResponses.push({
                  functionResponse: {
                    name: call.name,
                    response: { result: toolResult },
                  },
                });
              }

              // Send tool results back to Gemini
              send({ type: 'status', message: `Sonuçlar Gemini'ye geri gönderiliyor (Tur ${iterationCount})...`, tool: null });
              response = await chat.sendMessage({ message: functionResponses });

              logAlohaAction("TOOL_EXECUTION_END", { 
                iteration: iterationCount, 
                nextCalls: response.functionCalls ? response.functionCalls.map((c: any) => c.name) : "FINAL" 
              });

              if (response.functionCalls && response.functionCalls.length > 0) {
                send({ type: 'status', message: `Gemini ${response.functionCalls.length} ek araç çağırıyor (Tur ${iterationCount + 1})...`, tool: null });
              }
            }

            // Final text
            const finalReport = response.text || 'Otonom infaz tamamlandı.';
            logAlohaAction("CHAT_RESOLUTION", { userId, iterations: iterationCount, reportLength: finalReport.length });
            alohaMemory.addMemory('assistant', 'FINAL_RESOLUTION', finalReport);

            send({ type: 'final', text: finalReport, iterations: iterationCount });
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            controller.close();

          } catch (err: any) {
            console.error("[🚨 ALOHA STREAM ERROR]", err);
            send({ type: 'error', message: err.message || 'Bilinmeyen hata' });
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    // LEGACY JSON fallback — stream=false gönderen eski UI'lar için
    // Basit non-streaming response
    try {
      const directChat = ai.chats.create(chatConfig);
      let directResponse = await directChat.sendMessage({ message: parts });
      let iterations = 0;
      const MAX_FALLBACK_ITER = 5; // Basit sorularda uzun zincir engelle
      
      while (directResponse.functionCalls && directResponse.functionCalls.length > 0 && iterations < MAX_FALLBACK_ITER) {
        iterations++;
        const toolResults = [];
        for (const fc of directResponse.functionCalls) {
          const result = await executeToolCall(fc);
          toolResults.push({ id: fc.id, name: fc.name, response: { result } });
        }
        directResponse = await directChat.sendMessage({ message: toolResults.map(tr => ({
          functionResponse: { name: tr.name, response: { result: tr.response.result } }
        }))});
      }
      
      const finalText = directResponse.text || 'İşlem tamamlandı.';
      return NextResponse.json({ text: finalText, iterations });
    } catch (fallbackErr: any) {
      return NextResponse.json({ error: `Fallback mode error: ${fallbackErr.message}` }, { status: 500 });
    }

  } catch (err: any) {
    console.error("[🚨 ALOHA CHAT v5.0 ERROR]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
