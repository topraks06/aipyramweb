import { adminDb } from '@/lib/firebase-admin';
import { getTenant } from '@/lib/tenant-config';

// Define agent credit costs (Sovereign Economics)
const AGENT_COSTS: Record<string, number> = {
  render: 1,
  document: 0.5,
  whatsapp: 0.1,
  fabric_analysis: 0.5,
  chat: 0, // Concierge is free
  polyglot: 0.2,
  matchmaker: 1,
  trend_harvester: 2,
  retention: 0.1
};

export async function getAgentCost(agentType: string): Promise<number> {
  return AGENT_COSTS[agentType] || 0;
}

export async function checkCredits(tenantId: string, uid: string, agentType: string): Promise<{allowed: boolean, remaining: number}> {
  const cost = await getAgentCost(agentType);
  if (cost === 0) return { allowed: true, remaining: 999 };

  const config = getTenant(tenantId);
  const prefix = config.name.toLowerCase().split('.')[0];
  const walletCollection = `${prefix}_members`;

  try {
    const walletDoc = await adminDb.collection(walletCollection).doc(uid).get();
    if (!walletDoc.exists) {
      return { allowed: false, remaining: 0 };
    }
    
    const data = walletDoc.data();
    
    // Fallback logic for legacy 'renderCredits' vs new global 'agentCredits'
    let currentCredits = data?.agentCredits;
    
    // For backwards compatibility with the existing Perde.ai structure
    if (currentCredits === undefined && agentType === 'render') {
      currentCredits = data?.renderCredits || 0;
    } else if (currentCredits === undefined) {
      currentCredits = data?.renderCredits || 0; // Use renderCredits as general balance temporarily
    }

    return { 
      allowed: currentCredits >= cost, 
      remaining: currentCredits 
    };
  } catch (error) {
    console.error(`[WalletService] checkCredits error for ${uid} on ${tenantId}:`, error);
    return { allowed: false, remaining: 0 };
  }
}

export async function deductCredit(tenantId: string, uid: string, agentType: string, customAmount?: number): Promise<void> {
  const cost = customAmount !== undefined ? customAmount : await getAgentCost(agentType);
  if (cost <= 0) return;

  const config = getTenant(tenantId);
  const prefix = config.name.toLowerCase().split('.')[0];
  const walletCollection = `${prefix}_members`;
  const walletRef = adminDb.collection(walletCollection).doc(uid);

  try {
    await adminDb.runTransaction(async (t) => {
      const doc = await t.get(walletRef);
      if (doc.exists) {
        const data = doc.data();
        let currentAgentCredits = data?.agentCredits;
        let currentRenderCredits = data?.renderCredits;

        const updateData: any = {};
        
        // Prefer deducting from agentCredits if it exists, otherwise renderCredits
        if (currentAgentCredits !== undefined) {
           updateData.agentCredits = Math.max(0, currentAgentCredits - cost);
        } else if (currentRenderCredits !== undefined) {
           updateData.renderCredits = Math.max(0, currentRenderCredits - cost);
        }

        if (Object.keys(updateData).length > 0) {
            t.update(walletRef, updateData);
        }
      }
    });
    console.log(`[WalletService] Deducted ${cost} credits from ${uid} for ${agentType} on ${tenantId}`);
  } catch (error) {
    console.error(`[WalletService] Failed to deduct credits for ${uid}:`, error);
  }
}
