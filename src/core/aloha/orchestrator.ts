import { Schema, Type } from "@google/genai";
import { getAgent } from "../registry/agentRegistry";
import { AgentInput, AgentOutput, SwarmResult, AgentRole, CoreAgentRole, Agent } from "../agents/types";
import { alohaAI } from '@/core/aloha/aiClient';
// removed GoogleGenAI import
import { queryMemoryBase } from "../memory/rag";
import { AccountingAgent } from "./accountingAgent";

const aiClient = alohaAI.getClient();

// Real AI Prompt Chaining Orchestrator
export async function runSwarm(input: AgentInput, onProgress?: (msg: string, agent: string, status: 'info' | 'success' | 'warning' | 'error') => void): Promise<SwarmResult> {
  const chain: AgentOutput[] = [];

  // PHASE 1: VISIONARY (STRATEJİ)
  onProgress?.("Kapsamlı vizyon planlaması başlatılıyor...", "VISIONARY", "info");
  const visionaryOutput = await runAgent(getAgent("VISIONARY"), {
    task: input.task,
    context: input.context,
    previousThoughts: []
  }, {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, description: "PLAN" },
      summary: { type: Type.STRING, description: "Detailed strategic blueprint." },
      risk_tolerance: { type: Type.STRING, description: "HIGH, MEDIUM, LOW" }
    },
    required: ["action", "summary"]
  });
  
  let valParse = visionaryOutput.result;
  try { const p = JSON.parse(visionaryOutput.result); valParse = p.summary || p.action; } catch(e){}
  onProgress?.(`Strateji Kararı: ${valParse}`, "VISIONARY", "success");

  chain.push(visionaryOutput);

  // PHASE 2: REALITY (FİZİBİLİTE DENETİMİ)
  onProgress?.("Visionary planı gerçek dünya verileriyle denetleniyor...", "REALITY", "info");
  let realityOutput = await runAgent(getAgent("REALITY"), {
    task: `Aşağıdaki Visionary planını denetle. Mantıklıyken ONAYLA (APPROVED), uçuk/halüsinasyon ise REDDET (REJECTED). Plan: ${visionaryOutput.result}`,
    context: input.context,
    previousThoughts: chain
  }, {
    type: Type.OBJECT,
    properties: {
      status: { type: Type.STRING, description: "APPROVED or REJECTED" },
      reasoning: { type: Type.STRING, description: "Neden onaylandığı veya reddedildiği." },
      risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Olası riskler" }
    },
    required: ["status", "reasoning", "risks"]
  });

  try { 
      const p = JSON.parse(realityOutput.result); 
      onProgress?.(`Fizibilite Sonucu: [${p.status}] ${p.reasoning}`, "REALITY", p.status === 'APPROVED' ? "success" : "warning"); 
  } catch(e){}

  // FALLBACK LOOP (Hata Kurtarma / Düzeltme)
  let retryCount = 0;
  while (realityOutput.result.includes('"status":"REJECTED"') && retryCount < 2) {
    console.warn(`[Orchestrator] Reality Checker planı reddetti. Visionary düzeltiyor... (Deneme ${retryCount + 1})`);
    onProgress?.(`Reality Checker planı reddetti. Revize plan üretiliyor... (Deneme ${retryCount + 1})`, "MASTER_CORE", "warning");
    
    // Revize task gönderiliyor
    const revisedVisionary = await runAgent(getAgent("VISIONARY"), {
      task: `GERİ BİLDİRİM: Planın Reality Checker tarafından şu sebeplerle reddedildi: ${realityOutput.result}. Lütfen daha ayakları yere basan ve mantıklı bir plan üret.`,
      context: input.context,
      previousThoughts: chain
    }, {
      type: Type.OBJECT,
      properties: { action: { type: Type.STRING }, summary: { type: Type.STRING } },
      required: ["action", "summary"]
    });
    
    chain.push(revisedVisionary);
    
    // Reality Checker tekrar denetler
    realityOutput = await runAgent(getAgent("REALITY"), {
      task: `Revize planı tekrar denetle: ${revisedVisionary.result}`,
      context: input.context,
      previousThoughts: chain
    }, {
      type: Type.OBJECT,
      properties: { status: { type: Type.STRING }, reasoning: { type: Type.STRING }, risks: { type: Type.ARRAY, items: { type: Type.STRING } } },
      required: ["status", "reasoning"]
    });
    
    chain.push(realityOutput);
    retryCount++;
    
    try { 
      const p = JSON.parse(realityOutput.result); 
      onProgress?.(`Revize Fizibilite Sonucu: [${p.status}] ${p.reasoning}`, "REALITY", p.status === 'APPROVED' ? "success" : "warning"); 
    } catch(e){}
  }

  // PHASE 3: APOLLON (HAFIZA & GEÇMİŞ DENETİMİ)
  onProgress?.("Kurumsal RAG hafızası sorgulanıyor. Geçmiş verilerden öğreniliyor...", "APOLLON", "info");
  
  // Get RAG Context
  const ragDocs = await queryMemoryBase("APOLLON");
  const memoryContext = ragDocs.map(d => `[RAG - ${d.source}]: ${d.text}`).join("\n");

  const apollonOutput = await runAgent(getAgent("APOLLON"), {
    task: `Visionary'nin son planını ve Reality'nin onayını Kurumsal Hafıza (Aşağıdaki RAG verisi) ile kontrol et. Geçmiş hatalar yapılmış mı?\n\n[HAFIZA]:\n${memoryContext}`,
    context: input.context,
    previousThoughts: chain
  }, {
    type: Type.OBJECT,
    properties: {
      judgment: { type: Type.STRING, description: "PASS or FAIL" },
      historical_context: { type: Type.STRING, description: "Geçmiş verilere dayanarak yapılan analiz." }
    },
    required: ["judgment", "historical_context"]
  });
  
  try { 
      const p = JSON.parse(apollonOutput.result); 
      onProgress?.(`Hafıza Çıkarımı: [${p.judgment}] ${p.historical_context.substring(0, 100)}...`, "APOLLON", p.judgment === 'PASS' ? "success" : "warning"); 
  } catch(e){}
  
  chain.push(apollonOutput);

  // PHASE 4: ALOHA (NİHAİ EYLEM & OVERRIDE)
  onProgress?.("Tüm bulgular Aloha Motoruna aktarılıyor. Sentez başlatıldı...", "ALOHA", "info");
  const alohaOutput = await runAgent(getAgent("ALOHA"), {
    task: `Sen Aloha'sın. Tüm raporları sentezle ve Hakan'a sunacağın nihai eylemi/cevabı Türkçe, net ve vizyoner bir patron diliyle yaz. Kullanıcı ilk başta şunu istemişti: "${input.task}"`,
    context: input.context,
    previousThoughts: chain
  }, {
    type: Type.OBJECT,
    properties: {
      finalAction: { type: Type.STRING, description: "Kullanıcıya/Patrona gösterilecek nihai yanıt ve eylem adımı." },
      overrideUsed: { type: Type.BOOLEAN, description: "Apollon veya Reality kararı ezildi mi?" },
      confidence: { type: Type.NUMBER, description: "0-100 arası" }
    },
    required: ["finalAction", "overrideUsed", "confidence"]
  });

  onProgress?.("Sentez tamamlandı. Çıktı aktarılıyor.", "ALOHA", "success");

  return {
    chain,
    finalDecision: alohaOutput
  };
}

// REAL AI INTEGRATION LAYER
async function runAgent(agent: Agent, input: AgentInput, outputSchema: any): Promise<AgentOutput> {
  console.log(`[Swarm] Running ${agent.name}...`);
  
  try {
    const chainHistory = input.previousThoughts?.map(p => `[${p.agent}]: ${p.result}`).join("\n") || "İlk adım.";
    
    // Inject the chain history to give perfect conversational & decisional context.
    const dynamicSystemInstruction = `
      ${agent.systemPrompt}
      
      -------------------------
      [SWARM HISTORY / ZİNCİR ÖZETİ]
      Aşağıda senden önceki ajanların vardığı kararlar var. Bunları Oku ve Görevini (Task) yerine getir:
      ${chainHistory}
    `;

    // 🛡️ THE FISCAL GUARDIAN INTERLOCK (Maliyet Zırhı)
    const ctxString = typeof input.context === 'string' ? input.context.toLowerCase() : JSON.stringify(input.context).toLowerCase();
    const targetProject = ctxString.includes("trtex") ? "trtex" : 
                          ctxString.includes("perde") ? "perde" : "CORE";
    
    // Her bir ajan tetiklemesi tahmini B2B/API maliyeti (Örn: $0.05)
    const estimatedCost = 0.05; 
    
    const budgetCheck = await AccountingAgent.requestBudgetApproval(targetProject, estimatedCost);
    if (!budgetCheck.approved) {
        console.error(`[🛑 THE FISCAL GUARDIAN] Bütçe onayı verilmedi: ${budgetCheck.reason}`);
        return {
            agent: agent.name,
            result: `{"error": "SUSPENDED_LOW_FUNDS", "reason": "${budgetCheck.reason}"}`,
            confidence: 0
        };
    }

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: input.task,
      config: {
        systemInstruction: dynamicSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: outputSchema,
      }
    });

    const resultText = response.text || "{}";

    return {
      agent: agent.name,
      result: resultText,
      confidence: 1 // TODO: implement tracking extraction if needed
    };
  } catch (err: any) {
    console.error(`[AI Error - ${agent.name}]:`, err.message);
    return {
      agent: agent.name,
      result: `{"error": "Agent execution failed due to API limitations. ${err.message}"}`,
      confidence: 0
    };
  }
}
