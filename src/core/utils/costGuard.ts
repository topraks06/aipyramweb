import { AgentBudget, DEFAULT_BUDGET } from "@/core/agents/types";
import { adminDb } from "@/lib/firebase-admin";

// Global Kill Switch: If set to false, ALL agents stop functioning.
export const AGENTS_ENABLED = process.env.AGENTS_GLOBAL_KILL_SWITCH !== "false";

// Daily Global Budget
const DAILY_MAX_SPEND_USD = parseFloat(process.env.DAILY_MAX_SPEND_USD || "50.0");

export interface AgentActionLog {
  node_id: string;
  agentRole: string;
  taskType: string;
  tokensUsed: number;
  costUSD: number;
  durationMs: number;
  success: boolean;
  rfqId?: string;
  supplierId?: string;
  details?: any;
}

export class CostGuard {
  
  static async checkAllowance(node_id: string, requestedCostUsd: number = 0.5): Promise<{allowed: boolean, reason?: string}> {
    if (!AGENTS_ENABLED) return { allowed: false, reason: "GLOBAL KILL SWITCH IS ACTIVE" };
    
    // In a prod environment this would hit Redis. Here we check Firestore.
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const snap = await adminDb.collection("agent_logs")
         .where("createdAt", ">=", today.getTime())
         .get();

      let totalSpendToday = 0;
      snap.forEach(doc => {
          totalSpendToday += doc.data().costUSD || 0;
      });

      if (totalSpendToday + requestedCostUsd > DAILY_MAX_SPEND_USD) {
          console.warn(`[COST GUARD] LIMIT EXCEEDED. Today: $${totalSpendToday.toFixed(2)}, Limit: $${DAILY_MAX_SPEND_USD}`);
          return { allowed: false, reason: "DAILY SPEND LIMIT EXCEEDED" };
      }
      return { allowed: true };
    } catch (e) {
      console.error("[COST GUARD] Error checking allowance", e);
      // Fail-open for local dev, fail-closed for prod
      return { allowed: process.env.NODE_ENV !== 'production' };
    }
  }

  static async logAction(log: AgentActionLog) {
    try {
      await adminDb.collection("agent_logs").add({
        ...log,
        createdAt: Date.now()
      });
      console.log(`[OBSERVABILITY] ${log.agentRole} ran ${log.taskType} - Cost: $${log.costUSD.toFixed(4)}`);
    } catch (e) {
      console.error("[OBSERVABILITY] Failed to log agent action", e);
    }
  }
}
