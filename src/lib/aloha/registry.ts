import { adminDb } from '@/lib/firebase-admin';
import { getNode, nodeHasFeature, type SovereignNodeFeatures } from '@/lib/sovereign-config';
import { checkCredits, deductCredit, getAgentCost } from '@/lib/aloha/WalletService';
import { swarmBus } from '@/lib/agents/EventBus';

export type AgentRole = 'news-specialist' | 'vision-expert' | 'stock-manager' | 'analytics-chief' | 'sales-commander';

// Legacy in-memory registry
export const AgentRegistry: Record<AgentRole, any> = {
  'news-specialist': { id: 'agent_trtex_01', name: 'TRTEX Haber Ajanı', targetDomain: 'trtex.com' },
  'vision-expert': { id: 'agent_perde_02', name: 'Perde.ai Görsel İşleme', targetDomain: 'perde.ai' },
  'analytics-chief': { id: 'agent_holding_03', name: 'Holding Analitik Başkanı', targetDomain: 'aipyram.web' },
  'stock-manager': { id: 'agent_hometex_04', name: 'Hometex Stok Ajanı', targetDomain: 'hometex.ai' },
  'sales-commander': { id: 'agent_vorhang_05', name: 'Vorhang Satış Motoru', targetDomain: 'vorhang.ai' }
};

export type AgentType = 
  | 'whatsapp' 
  | 'document' 
  | 'fabric_analysis' 
  | 'render' 
  | 'chat' 
  | 'polyglot' 
  | 'matchmaker' 
  | 'trend_harvester' 
  | 'retention';

export interface AgentInvocation {
  agentType: AgentType;
  SovereignNodeId: string;
  uid?: string;         // Kullanıcının Firebase UID'si
  payload: Record<string, any>;
}

export interface AgentResult {
  success: boolean;
  agentType: AgentType;
  SovereignNodeId: string;
  message: string;
  data?: any;
  creditUsed?: number;
}

const FEATURE_MAP: Partial<Record<AgentType, keyof SovereignNodeFeatures>> = {
  whatsapp: 'whatsapp',
  document: 'documents',
  fabric_analysis: 'fabricAnalysis',
  render: 'visualizer',
  retention: 'retention'
};

/**
 * ALOHA Sovereign Hub - Merkezi Ajan Yöneticisi
 * Tüm ajan çağrıları buradan geçmek zorundadır.
 */
export async function invokeAgent(invocation: AgentInvocation): Promise<AgentResult> {
  const { agentType, SovereignNodeId, uid, payload } = invocation;
  
  // 1. Feature flag kontrolü
  const requiredFeature = FEATURE_MAP[agentType];
  if (requiredFeature && !nodeHasFeature(SovereignNodeId, requiredFeature)) {
    return { success: false, agentType, SovereignNodeId, message: `${SovereignNodeId} için ${agentType} özelliği aktif değil.` };
  }
  
  // 2. Wallet kontrolü
  if (uid) {
    const wallet = await checkCredits(SovereignNodeId, uid, agentType);
    if (!wallet.allowed) {
      return { success: false, agentType, SovereignNodeId, message: `Yetersiz kredi. Kalan: ${wallet.remaining}` };
    }
  }
  
  // 3. Ajana yönlendir
  let result: AgentResult = { success: false, agentType, SovereignNodeId, message: "Ajan yüklenemedi." };
  try {
    switch (agentType) {
      case 'whatsapp': {
        const { sendMessage } = await import('@/lib/agents/WhatsAppAgent');
        const res = await sendMessage(SovereignNodeId, payload.phone, payload.message, payload.orderId);
        result = { success: res.success, agentType, SovereignNodeId, message: res.success ? 'WhatsApp gönderildi.' : 'Gönderim başarısız.' };
        break;
      }
      case 'document': {
        const { generateProforma } = await import('@/lib/agents/DocumentAgent');
        const res = await generateProforma(SovereignNodeId, payload.orderId, payload.data);
        result = { success: true, agentType, SovereignNodeId, message: 'PDF Üretildi.', data: { pdfUrl: res.pdfUrl } };
        break;
      }
      case 'fabric_analysis': {
        const { analyzeFabric } = await import('@/lib/agents/FabricRecognitionAgent');
        const res = await analyzeFabric(payload.imageBase64, SovereignNodeId);
        result = { success: true, agentType, SovereignNodeId, message: 'Kumaş analiz edildi.', data: res };
        break;
      }
      case 'retention': {
        const { checkAbandonedQuotes } = await import('@/lib/agents/RetentionAgent');
        const res = await checkAbandonedQuotes(SovereignNodeId);
        result = { success: true, agentType, SovereignNodeId, message: `Tarama tamamlandı. Bulunan terk: ${res.length}`, data: res };
        break;
      }
      default:
        result = { success: false, agentType, SovereignNodeId, message: `Ajan ${agentType} henüz hazır değil.` };
    }
  } catch (error: any) {
    console.error(`[AgentRegistry] invokeAgent failed for ${agentType}:`, error);
    result = { success: false, agentType, SovereignNodeId, message: `Hata: ${error.message}` };
  }
  
  // 4. Başarılıysa kredi düş
  if (result.success && uid) {
    await deductCredit(SovereignNodeId, uid, agentType);
    result.creditUsed = await getAgentCost(agentType);
  }
  
  // 5. EventBus sinyali fırlat
  swarmBus.emit(`AGENT_COMPLETED_${agentType.toUpperCase()}`, result);
  
  // 6. Firestore'a ajan log kaydı
  try {
     // Güvenli payload stringify
     const safePayload = JSON.stringify(payload, (k, v) => v?.length > 1000 ? '[TRUNCATED_BASE64]' : v);
     await adminDb.collection('aloha_agent_logs').add({
        SovereignNodeId,
        agentType,
        uid: uid || 'anonymous',
        success: result.success,
        creditUsed: result.creditUsed || 0,
        payload: safePayload,
        message: result.message,
        createdAt: new Date().toISOString()
     });
  } catch(e) {
     console.error("Log kaydı başarısız", e);
  }
  
  return result;
}
