import { adminDb } from '@/lib/firebase-admin';

export interface SemanticMemoryLog {
  tenant: string;
  action: string;
  uid?: string;
  payload: any;
  outcome: boolean;
  message: string;
  data: any;
  createdAt: string;
}

/**
 * 1. Admin Training Injection
 * Fetches active rules from `aloha_knowledge` and injects them into the agent's context.
 */
export async function injectKnowledgeContext(tenant: string, action: string): Promise<string> {
  if (!adminDb) return "";

  try {
    // Only fetch active knowledge rules
    const snapshot = await adminDb.collection('aloha_knowledge')
                                  .where('active', '==', true)
                                  .get();
                                  
    if (snapshot.empty) return "";

    const rules = snapshot.docs.map(doc => doc.data());
    
    // Combine rules into a single system string
    const systemRules = rules.map(r => `[KURAL - ${r.topic}]: ${r.content}`).join('\n');
    
    return `\n\n--- SOVEREIGN ADMIN KURALLARI ---\n${systemRules}\n---------------------------------\n`;
  } catch (err) {
    console.error("[Aloha Memory] Error fetching knowledge context:", err);
    return "";
  }
}

/**
 * 2. Memory Write Loop (RLHF)
 * Logs the semantic outcome of the agent so the system learns over time.
 */
export async function writeSemanticMemory(log: SemanticMemoryLog) {
  if (!adminDb) return;

  try {
    // Extract a "lesson learned" if this is a failure, or a "success pattern" if it succeeded
    let memoryType = log.outcome ? "success_pattern" : "failure_lesson";
    
    const memoryRef = adminDb.collection('aloha_memory_logs').doc();
    
    await memoryRef.set({
      id: memoryRef.id,
      tenant: log.tenant,
      action: log.action,
      uid: log.uid || "system",
      memoryType,
      context: JSON.stringify(log.payload),
      resultMessage: log.message,
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    });

    // In a real advanced RLHF, we would also update the `learningMatrix` cache immediately.
    const { learningMatrix } = await import('@/core/cache/learningMatrix');
    if (!log.outcome) {
       learningMatrix.recordMistake(log.action, log.message);
    }

  } catch (err) {
    console.error("[Aloha Memory] Error writing semantic memory:", err);
  }
}
