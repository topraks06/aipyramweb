import { Schema, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { runSwarm } from "@/core/aloha/orchestrator";
import { getAgent } from "@/core/registry/agentRegistry";
import { AgentInput, AgentOutput } from "@/core/agents/types";
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { pushToQueue } from "@/core/aloha/queue";

// Security Key (In production, load from Firestore)
const VALID_API_KEYS = [
  process.env.AIPYRAM_GLOBAL_API_KEY || "sk_aipyram_master_71",
  "sk_test_perde",
  "sk_test_trtex"
];

// removed aiClient

export async function POST(req: Request) {
  try {
    // 1. SECURITY & AUTHENTICATION GUARD
    const apiKey = req.headers.get("x-api-key");
    const project = req.headers.get("x-project");

    if (!apiKey || !VALID_API_KEYS.includes(apiKey)) {
      console.warn(`[API Gateway Security] Unauthorized access attempt with key: ${apiKey?.substring(0, 5)}...`);
      return NextResponse.json({ error: "Unauthorized. Invalid or missing x-api-key." }, { status: 401 });
    }

    if (!project) {
      return NextResponse.json({ error: "Bad Request. Missing x-project header." }, { status: 400 });
    }

    const body = await req.json();
    const { task, userId, mode = "fast", context = {} } = body;

    if (!task) {
      return NextResponse.json({ error: "Task payload is required." }, { status: 400 });
    }

    console.log(`\n[API Gateway] Routing Request: Project [${project}] | Mode [${mode}] | User [${userId || 'Anonymous'}]`);

    // 2. PROJECT-SPECIFIC CONTEXT ROUTING (Domain-Awareness)
    // Beyin (OS) 270 siteyi yönettiği için, gelen projeye göre zemin (context) hazırlar.
    let domainContext = `Sensory Input from Domain: ${project.toUpperCase()}.\nKullanıcı ID: ${userId || 'Unknown'}\n`;
    let headAgentId = "ALOHA"; // Default fallback

    switch (project.toLowerCase()) {
      case "perde":
      case "perde.ai":
        domainContext += "Bağlam: Perakende perde, akıllı ev sistemleri ve 3D tasarım.\n";
        headAgentId = "PerdeAiHeadAgent";
        break;
      case "trtex":
      case "trtex.com":
        domainContext += "Bağlam: Global B2B kumaş ticareti, toptan alım, fabrika üretimi.\n";
        headAgentId = "TrtexHeadAgent";
        break;
      case "hometex":
      case "hometex.ai":
        domainContext += "Bağlam: Sanal Fuar, Ev Tekstili, B2B Eşleştirme.\n";
        headAgentId = "HometexHeadAgent";
        break;
      default:
        domainContext += "Bağlam: Genel Aipyram Ekosistemi.\n";
        break;
    }

    const mergedContext = { ...context, domainInstruction: domainContext };

    // 3. EXECUTION MODES (Çekirdek Zeka Ayrımı)
    
    // MODE A: FAST (Tek Ajan - Düşük Gecikme)
    // Sadece Head Agent'a (veya Aloha'ya) doğrudan sorar, prompt chaining yapmaz.
    if (mode === "fast") {
      console.log(`[API Gateway] Fast Execution triggered for ${project}...`);
      
      const jsonResult = await alohaAI.generateJSON(task, {
        systemInstruction: `${getAgent("ALOHA")?.systemPrompt}\n${domainContext}\n\nHızlı ve doğrudan cevap ver. Swarm (Sürü) toplama.`,
        complexity: 'routine'
      }, 'trigger.fastMode');

      return NextResponse.json({
        success: true,
        mode: "fast",
        project,
        data: {
          finalDecision: {
            agent: headAgentId,
            result: JSON.stringify(jsonResult),
            confidence: 0.95
          }
        }
      });
    }

    if (mode === "deep") {
      console.log(`[API Gateway] Deep Swarm Execution triggered for ${project}... (STREAMING)`);
      
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const sendLog = (msg: string, agent: string, status: string) => {
            const data = JSON.stringify({ type: 'log', message: msg, agent, status });
            controller.enqueue(encoder.encode(data + "\n"));
          };

          try {
            sendLog("Deep Swarm Execution triggered. Master Core active.", "MASTER_CORE", "info");
            
            const swarmResult = await runSwarm({
              task: task,
              context: mergedContext
            }, sendLog);

            controller.enqueue(encoder.encode(JSON.stringify({ type: 'finish', data: swarmResult }) + "\n"));
          } catch(e:any) {
             controller.enqueue(encoder.encode(JSON.stringify({ type: 'log', message: 'CRITICAL FAILURE: ' + e.message, agent: 'ERROR', status: 'error' }) + "\n"));
          } finally {
            controller.close();
          }
        }
      });
      return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" } });
    }

    // MODE C: AUTONOMOUS (Background Queue + Worker)
    // Uzun süren devasa vizyon işlerini arka plana (Firestore Queue) yollar.
    if (mode === "autonomous") {
      console.log(`[API Gateway] Autonomous Queue triggered for ${project}...`);
      
      const jobId = `job_${Date.now()}_${crypto.randomUUID().slice(0, 9)}`;
      
      // Firestore Queue'ya iş emri (Google-Native).
      await pushToQueue({ jobId, project, task, context: mergedContext });

      return NextResponse.json({
        success: true,
        mode: "autonomous",
        project,
        message: "Devasa görev otonom iş kuyruğuna (Queue) alındı. Beyin arka planda çalışıyor.",
        jobId: jobId,
        statusUrl: `/api/brain/v1/jobs/${jobId}`
      }, { status: 202 }); // 202 Accepted
    }

    // Invalid mode
    return NextResponse.json({ error: `Invalid mode: ${mode}. Use 'fast', 'deep', or 'autonomous'.` }, { status: 400 });

  } catch (error: any) {
    console.error(`[API Gateway Error]:`, error.message);
    return NextResponse.json({ success: false, error: "Brain OS Gateway Hatası: " + error.message }, { status: 500 });
  }
}
