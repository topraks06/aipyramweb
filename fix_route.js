const fs = require('fs');
const routePath = 'c:/Users/MSI/Desktop/aipyramweb/src/app/api/aloha/chat/route.ts';

const newRoute = `import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, tools, executeToolCall, logAlohaAction } from "@/core/aloha/engine";
import { alohaMemory } from "@/core/aloha/memory";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// SSE flush garantisi: Next.js cache/buffer'ı devre dışı bırak
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, message, systemContext, inlineData, stream: isStreaming, history } = body;

    if (!message && (!inlineData || inlineData.length === 0)) {
      return NextResponse.json({ error: "Message or file required" }, { status: 400 });
    }

    console.log(\`[🚀 ALOHA CHAT v5.0] Komut Alındı: "\${message}" | Stream: \${!!isStreaming}\`);

    // Memory Entagrasyonu - Geçmiş oturum anılarını dahil et (Faz 4.3)
    const recentMemories = await alohaMemory.getRecentMemory(10);
    let memoryContextString = "";
    if (recentMemories && recentMemories.length > 0) {
      memoryContextString = "\\n\\n[🧠 ÜST OTONOM HAFIZA (ÖNCEKİ OTURUMLAR)]:\\n";
      recentMemories.forEach(mem => {
          memoryContextString += \`- [\${new Date(mem.timestamp).toISOString()}] \${mem.action}: \${mem.payload}\\n\`;
      });
    }

    // Build Gemini Chat with history support
    const chatConfig = {
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: \`\${SYSTEM_PROMPT}\\nBağlam: \${JSON.stringify(systemContext || {})}\${memoryContextString}\`,
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
          console.log(\`[🚀 ALOHA CHAT v5.0] Dosya Eki Algılandı: \${file.name} (\${file.type})\`);
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
              controller.enqueue(encoder.encode(\`data: \${JSON.stringify(data)}\\n\\n\`));
              await new Promise(r => setTimeout(r, 0)); // flush zorla
            } catch { /* stream closed */ }
          };

          try {
            send({ type: 'status', message: 'Gemini\\'ye mesaj gönderiliyor...', tool: null });

            let response = await chat.sendMessage({ message: parts });
            let iterationCount = 0;
            const MAX_ITERATIONS = 8;

            // Initial Gemini response
            if (!response.functionCalls || response.functionCalls.length === 0) {
              const finalR = response.text || 'Anlaşıldı.';
              send({ type: 'final', text: finalR, iterations: 0 });
              alohaMemory.addMemory('assistant', 'FINAL_RESPONSE', finalR);
              controller.close();
              return;
            }

            send({ type: 'status', message: \`Gemini \${response.functionCalls.length} araç çağırıyor...\`, tool: null });

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
                  message: \`🔧 \${call.name} çalıştırılıyor...\`
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
                  result: toolResult.substring(0, 3000),
                  duration,
                  iteration: iterationCount,
                  message: \`✅ \${call.name} tamamlandı (\${duration}ms)\`
                });

                console.log(\`[✅ TOOL SONUÇ] \${call.name}: \${toolResult.substring(0, 200)}...\`);

                functionResponses.push({
                  functionResponse: {
                    name: call.name,
                    response: { result: toolResult },
                  },
                });
              }

              // Send tool results back to Gemini
              send({ type: 'status', message: \`Sonuçlar Gemini'ye geri gönderiliyor (Tur \${iterationCount})...\`, tool: null });
              response = await chat.sendMessage({ message: functionResponses });

              logAlohaAction("TOOL_EXECUTION_END", { 
                iteration: iterationCount, 
                nextCalls: response.functionCalls ? response.functionCalls.map((c: any) => c.name) : "FINAL" 
              });

              if (response.functionCalls && response.functionCalls.length > 0) {
                send({ type: 'status', message: \`Gemini \${response.functionCalls.length} ek araç çağırıyor (Tur \${iterationCount + 1})...\`, tool: null });
              }
            }

            // Final text
            const finalReport = response.text || 'Otonom infaz tamamlandı.';
            logAlohaAction("CHAT_RESOLUTION", { userId, iterations: iterationCount, reportLength: finalReport.length });
            alohaMemory.addMemory('assistant', 'FINAL_RESOLUTION', finalReport);

            send({ type: 'final', text: finalReport, iterations: iterationCount });
            controller.close();

          } catch (err: any) {
            console.error("[🚨 ALOHA STREAM ERROR]", err);
            send({ type: 'error', message: err.message || 'Bilinmeyen hata' });
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

    // LEGACY JSON kapalı / minimal. Sadece fallback.
    return NextResponse.json({ error: "Legacy JSON mode unsupported in V5 Engine. Please stream = true" }, { status: 400 });

  } catch (err: any) {
    console.error("[🚨 ALOHA CHAT v5.0 ERROR]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`;

fs.writeFileSync(routePath, newRoute, 'utf8');
console.log('route.ts has been simplified to ~200 lines according to Phase 4 master plan.');
