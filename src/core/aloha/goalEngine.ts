import { CostGuard, AGENTS_ENABLED } from "../utils/costGuard";
import { AgentBudget, AgentOutput } from "../agents/types";

export type GoalPriority = "revenue" | "growth" | "experiment";

export interface GoalDefinition {
  goalId: string;
  node_id: string;
  objective: string;          // e.g. "close_1_deal"
  priority: GoalPriority;
  definitionOfDone: any;      // e.g. { deal_status: "won", payment_received: true }
  
  // Hard Limits per Goal (Runaway Loop Prevention)
  maxIterations: number;      // Default to 5
  maxCostUsd: number;         // Default to $20
  maxTimeSeconds: number;     // Default to 600 (10 mins)
  
  // Profit Guard
  estimatedRoiMultiplier: number; // e.g. expected ratio of profit/cost. Must be > 1 for revenue priority
  
  // Staging
  executionMode: "soft_sandbox" | "hard_sandbox" | "live";
}

export interface GoalResult {
  goalId: string;
  success: boolean;
  attempts: number;
  totalCostUsd: number;
  finalOutput: string;
  errorReason?: string;
}

/**
 * RECURSIVE LOOP ENGINE (Goal Engine V2)
 * Translates abstract goals into continuous execution until Definition of Done is met.
 * Strictly prevents Runaway Loops and guards ROI.
 */
export class GoalEngine {
  
  static async executeGoal(
    goal: GoalDefinition,
    executorFn: (attempt: number, context: string, targetMode: "soft"|"hard"|"live") => Promise<{output: AgentOutput, isDone: boolean}>
  ): Promise<GoalResult> {
    
    // PREDICTIVE REVENUE & COST GUARD (Amazon Stili)
    // Sadece "Çalışmak" yeterli değildir, KÂR MARJI (Profit Margin) korunmalıdır.
    const expectedReturnUSD = goal.maxCostUsd * goal.estimatedRoiMultiplier;
    if (goal.priority === "revenue" && expectedReturnUSD <= goal.maxCostUsd) {
      console.error(`[PREDICTIVE COST GUARD] İŞLEM REDDEDİLDİ. \nTahmini Maliyet: $${goal.maxCostUsd} | Beklenen Getiri (Lead): $${expectedReturnUSD}. \nBu SEO/Operasyon hamlesi harcanan API jetonlarını kâr olarak geri döndürmüyor. Ajan pasife alındı.`);
      return this.abort(goal, 0, 0, "ROI_BELOW_PREDICTIVE_THRESHOLD", "Predictive Guard: Zararına işlem yapılamaz.");
    }

    console.log(`[GOAL ENGINE] Priority: ${goal.priority.toUpperCase()} | Starting Goal [${goal.goalId}]: ${goal.objective}`);
    
    const startTimeStamp = Date.now();
    let attempt = 0;
    let totalCost = 0;
    let previousContext = "";
    
    // Limits & Retry Intelligence (Zero-Mazeret Kuralı)
    const MAX_ITERS = goal.maxIterations || 5;
    const MAX_COST = goal.maxCostUsd || 20;
    const MAX_TIME_MS = (goal.maxTimeSeconds || 600) * 1000;
    const MAX_RETRY_PER_ERROR = 3;
    let consecutiveIdenticalErrors = 0;
    let lastErrorType = "";
    
    // Execution Mode (70% Execute, 20% Optimize, 10% Build - simge tespiti)
    let dynamicLoopAllowed = true;
    if (goal.priority === "experiment" && Math.random() > 0.10) {
      console.warn("[EXECUTION MODE GUARD] Bütçe %10 Build için ayrılmıştır, pas geçiliyor.");
      dynamicLoopAllowed = false;
    } else if (goal.priority === "growth" && Math.random() > 0.30) {
      console.warn("[EXECUTION MODE GUARD] Bütçe %20 Optimize için ayrılmıştır, pas geçiliyor.");
      dynamicLoopAllowed = false;
    }
    
    if (!dynamicLoopAllowed) {
       return this.abort(goal, 0, 0, "EXECUTION_MODE_THROTTLED", "Bütçe kısıtı.");
    }
    
    // Staging Order
    const stagingPhases: Array<"soft" | "hard" | "live"> = [];
    if (goal.executionMode === "soft_sandbox") stagingPhases.push("soft");
    else if (goal.executionMode === "hard_sandbox") stagingPhases.push("soft", "hard");
    else stagingPhases.push("soft", "hard", "live"); // Live requires passing through all tiers.

    for (const phase of stagingPhases) {
      console.log(`[GOAL ENGINE] Transitioning to Phase: ${phase.toUpperCase()}`);
      let phaseComplete = false;
      
      while (attempt < MAX_ITERS) {
        attempt++;
        
        // Time Guard
        if (Date.now() - startTimeStamp > MAX_TIME_MS) {
           return this.triggerFail(goal, attempt, totalCost, "MAX_TIME_EXCEEDED", previousContext);
        }

        // Cost Guard
        if (totalCost > MAX_COST) {
           return this.triggerFail(goal, attempt, totalCost, "MAX_COST_PER_GOAL_EXCEEDED", previousContext);
        }

        if (!AGENTS_ENABLED) {
          return this.abort(goal, attempt, totalCost, "KILL_SWITCH_ACTIVE", previousContext);
        }

        const allowance = await CostGuard.checkAllowance(goal.node_id, 0.1);
        if (!allowance.allowed) {
          return this.triggerFail(goal, attempt, totalCost, `GLOBAL_COST_LIMIT: ${allowance.reason}`, previousContext);
        }

        try {
          // Executor Function provides the implementation detail
          const { output, isDone } = await executorFn(attempt, previousContext, phase);
          
          totalCost += (output.costUSD || 0);
          previousContext += `\n[${phase.toUpperCase()}] Attempt ${attempt} Result: ${output.result}`;

          if (isDone) {
            console.log(`[GOAL ENGINE] Phase ${phase.toUpperCase()} ACHIEVED on attempt ${attempt}.`);
            phaseComplete = true;
            break; // Break the phase loop, move to next phase
          }
        } catch (err: any) {
          const errorMessage = err.message || "Unknown Failure";
          console.error(`[GOAL ENGINE] Attempt ${attempt} error:`, errorMessage);
          previousContext += `\n[${phase.toUpperCase()}] Attempt ${attempt} Error: ${errorMessage}`;
          
          if (lastErrorType === errorMessage) {
            consecutiveIdenticalErrors++;
            if (consecutiveIdenticalErrors >= MAX_RETRY_PER_ERROR) {
              return this.triggerFail(goal, attempt, totalCost, `MAX_RETRY_PER_ERROR_EXCEEDED: ${errorMessage}`, previousContext);
            }
          } else {
             lastErrorType = errorMessage;
             consecutiveIdenticalErrors = 1;
          }
        }
      }

      if (!phaseComplete) {
         return this.triggerFail(goal, attempt, totalCost, `MAX_RETRIES_EXCEEDED_IN_PHASE_${phase.toUpperCase()}`, previousContext);
      }
    }

    // If it survived all phases, the goal is fully achieved!
    console.log(`[GOAL ENGINE] Goal [${goal.goalId}] FULLY ACHIEVED across all staging phases.`);
    return {
      goalId: goal.goalId,
      success: true,
      attempts: attempt,
      totalCostUsd: totalCost,
      finalOutput: previousContext
    };
  }

  private static abort(goal: GoalDefinition, attempts: number, cost: number, reason: string, context: string): GoalResult {
    return {
      goalId: goal.goalId,
      success: false,
      attempts,
      totalCostUsd: cost,
      errorReason: reason,
      finalOutput: context
    };
  }

  private static async triggerFail(goal: GoalDefinition, attempts: number, cost: number, reason: string, context: string): Promise<GoalResult> {
     console.warn(`[GOAL ENGINE] Goal [${goal.goalId}] FAILED. Reason: ${reason}`);
     try {
      const { analyzeFailureTracker } = await import("../agents/postMortemAgent");
      await analyzeFailureTracker({
        node_id: goal.node_id,
        context: `Goal: ${goal.objective}\nHistory: ${context}\nPriority: ${goal.priority}`,
        failureReason: reason,
        costWasted: cost
      });
    } catch(e) {
      console.error("[GOAL ENGINE] Failed to trigger PostMortem:", e);
    }
    return this.abort(goal, attempts, cost, reason, context);
  }
}
