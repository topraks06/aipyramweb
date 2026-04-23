import { invokeAgent } from './invokeAgent';
import { alohaAI } from '@/core/aloha/aiClient';

export interface SwarmTask {
  node: string;
  uid?: string;
  goal: string;
  context?: any;
}

export interface SwarmResult {
  success: boolean;
  plan: string[];
  executionDetails: any[];
  finalValidation: string;
  message: string;
}

/**
 * 2. SWARM ORCHESTRATION (Palantir Seviyesi)
 * 1 Ajan -> 1 Aksiyon yerine, görevi planlar, böler, uygular ve doğrular.
 * 
 * Pipeline:
 * [1] PLANNER   : Görevi parçalara böler.
 * [2] EXECUTOR  : Her parçayı sırayla çalıştırır (invokeAgent kullanarak).
 * [3] VALIDATOR : Nihai çıktıyı denetler.
 */
export async function invokeSwarm(task: SwarmTask): Promise<SwarmResult> {
  const { node, uid, goal, context } = task;
  const aiClient = alohaAI.getClient();

  console.log(`[SWARM ORCHESTRATOR] Görev alındı: "${goal}"`);

  // --- [1] PLANNER ---
  console.log(`[SWARM PLANNER] Görev parçalanıyor...`);
  const planPrompt = `Sen bir Swarm Planner'sın.
Hedef: ${goal}
Context: ${JSON.stringify(context || {})}

Bu hedefi başarmak için yapılması gereken alt görevleri (action) sırala.
Yanıtını sadece bir JSON array olarak dön (örn: ["analysis", "opportunity"]).
Kabul edilen eylemler: ["analysis", "opportunity", "compose_article", "chat"]`;

  const planRes = await aiClient.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: planPrompt,
  });

  let plan: string[] = [];
  try {
    const text = planRes?.text?.replace(/```json/g, '').replace(/```/g, '').trim() || '[]';
    plan = JSON.parse(text);
  } catch {
    plan = ['analysis']; // Fallback
  }

  if (plan.length === 0) plan = ['analysis'];

  // --- [2] EXECUTOR ---
  console.log(`[SWARM EXECUTOR] Plan uygulanıyor: ${plan.join(' -> ')}`);
  const executionDetails = [];
  let accumulatedContext = { ...context };

  for (const action of plan) {
    // Burada 1'e 1 ajanları Sovereign Gateway (invokeAgent) üzerinden çağırıyoruz.
    // Bu sayede her alt ajan için wallet, log ve rule injection kuralları tıkır tıkır işler.
    const result = await invokeAgent({
      node,
      action: action,
      uid,
      payload: { query: goal, context: accumulatedContext }
    });

    executionDetails.push({
      action,
      success: result.success,
      data: result.data,
      creditUsed: result.creditUsed
    });

    if (!result.success) {
      return {
        success: false,
        plan,
        executionDetails,
        finalValidation: "ZİNCİR KOPTU",
        message: `Executor hatası: ${action} adımında başarısız oldu.`
      };
    }

    // Bir ajanın çıktısı, sonrakinin girdisi olur.
    accumulatedContext = { ...accumulatedContext, [`${action}Result`]: result.data };
  }

  // --- [3] VALIDATOR ---
  console.log(`[SWARM VALIDATOR] Nihai çıktı denetleniyor...`);
  const validationPrompt = `Sen acımasız bir Validator'sın.
Hedef: ${goal}
Çıktılar: ${JSON.stringify(executionDetails)}

Ajanların çalışması hedefi karşılıyor mu? Başarılı ise "APPROVED", değilse "REJECTED" yazıp nedenini açıkla.`;

  const validationRes = await aiClient.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: validationPrompt,
  });

  const finalValidation = validationRes?.text || 'REJECTED: Validator panikledi.';
  const success = finalValidation.includes('APPROVED');

  return {
    success,
    plan,
    executionDetails,
    finalValidation,
    message: success ? "Swarm görevini başarıyla tamamladı." : "Swarm doğrulama aşamasında takıldı."
  };
}
