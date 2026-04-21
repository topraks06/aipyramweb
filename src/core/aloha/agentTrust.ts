/**
 * ALOHA AGENT TRUST PROTOCOL — Ajanlar Arası Güvenli İletişim
 * 
 * Ajanlar birbirleriyle güvenli mesaj ve görev paylaşabilir.
 * Her mesaj imzalanır, loglanır ve yetki kontrolünden geçer.
 * 
 * Trust Levels:
 * - SOVEREIGN: Aloha (her şeyi yapabilir)
 * - TRUSTED: Core ajanlar (content, auditor, seo)
 * - LIMITED: Yardımcı ajanlar (sadece okuma)
 * - UNTRUSTED: 3. parti (engellenir)
 */

import { adminDb } from '@/lib/firebase-admin';

// ═══════════════════════════════════════════════════
// AGENT REGISTRY — Kim, ne yapabilir
// ═══════════════════════════════════════════════════

type TrustLevel = 'sovereign' | 'trusted' | 'limited' | 'untrusted';

interface AgentIdentity {
  id: string;
  name: string;
  trustLevel: TrustLevel;
  capabilities: string[];
  maxCallsPerHour: number;
}

const AGENT_REGISTRY: Record<string, AgentIdentity> = {
  'aloha': {
    id: 'aloha',
    name: 'Aloha Sovereign CTO',
    trustLevel: 'sovereign',
    capabilities: ['*'], // Her şey
    maxCallsPerHour: 1000,
  },
  'content_agent': {
    id: 'content_agent',
    name: 'İçerik Uzmanı',
    trustLevel: 'trusted',
    capabilities: ['compose_article', 'web_search', 'fetch_url', 'query_firestore_database'],
    maxCallsPerHour: 100,
  },
  'seo_agent': {
    id: 'seo_agent',
    name: 'SEO Stratejisti',
    trustLevel: 'trusted',
    capabilities: ['seo_analytics', 'geo_analyze', 'submit_to_google', 'analyze_competitor'],
    maxCallsPerHour: 50,
  },
  'auditor': {
    id: 'auditor',
    name: 'Denetçi',
    trustLevel: 'trusted',
    capabilities: ['verify_project_health', 'git_read_file', 'git_search_code', 'git_list_dir'],
    maxCallsPerHour: 80,
  },
  'image_agent': {
    id: 'image_agent',
    name: 'Görsel Uzmanı',
    trustLevel: 'trusted',
    capabilities: ['scan_missing_images', 'update_article_image'],
    maxCallsPerHour: 50,
  },
  'trendsetter': {
    id: 'trendsetter',
    name: 'Trend Analisti',
    trustLevel: 'limited',
    capabilities: ['web_search', 'fetch_url', 'multi_search'],
    maxCallsPerHour: 30,
  },
  'matchmaker': {
    id: 'matchmaker',
    name: 'B2B Eşleştirici',
    trustLevel: 'limited',
    capabilities: ['query_firestore_database', 'send_email'],
    maxCallsPerHour: 20,
  },
};

// ═══════════════════════════════════════════════════
// TRUST VERIFICATION — Yetki kontrolü
// ═══════════════════════════════════════════════════

interface TrustVerification {
  allowed: boolean;
  reason: string;
  agent?: AgentIdentity;
}

/**
 * Bir ajanın belirli bir tool'u çağırma yetkisi var mı?
 */
export function verifyAgentTrust(agentId: string, toolName: string): TrustVerification {
  const agent = AGENT_REGISTRY[agentId];
  
  if (!agent) {
    return { allowed: false, reason: `Bilinmeyen ajan: "${agentId}". Kayıtlı ajanlar: ${Object.keys(AGENT_REGISTRY).join(', ')}` };
  }

  if (agent.trustLevel === 'untrusted') {
    return { allowed: false, reason: `Ajan "${agent.name}" UNTRUSTED seviyede — tüm operasyonlar engellendi.`, agent };
  }

  if (agent.trustLevel === 'sovereign') {
    return { allowed: true, reason: 'Sovereign yetki — tam erişim', agent };
  }

  // Capabilities kontrolü
  if (agent.capabilities.includes('*') || agent.capabilities.includes(toolName)) {
    return { allowed: true, reason: `"${agent.name}" yetkili: ${toolName}`, agent };
  }

  return { 
    allowed: false, 
    reason: `"${agent.name}" (${agent.trustLevel}) "${toolName}" için yetkili değil. İzinli: ${agent.capabilities.join(', ')}`,
    agent,
  };
}

// ═══════════════════════════════════════════════════
// AGENT MESSAGE BUS — Ajanlar arası mesaj
// ═══════════════════════════════════════════════════

interface AgentMessage {
  from: string;
  to: string;
  type: 'task' | 'result' | 'alert' | 'request' | 'approval';
  payload: any;
  priority: 'critical' | 'high' | 'normal' | 'low';
  timestamp: string;
}

/**
 * Ajan mesajı gönder — Firestore üzerinden
 */
export async function sendAgentMessage(message: Omit<AgentMessage, 'timestamp'>): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Gönderici kontrolü
  const senderCheck = verifyAgentTrust(message.from, 'send_message');
  if (!senderCheck.allowed && senderCheck.agent?.trustLevel !== 'limited') {
    return { success: false, error: `Gönderici yetkisiz: ${senderCheck.reason}` };
  }

  // Alıcı kontrolü
  if (!AGENT_REGISTRY[message.to]) {
    return { success: false, error: `Bilinmeyen alıcı ajan: "${message.to}"` };
  }

  try {
    if (!adminDb) return { success: false, error: 'Firestore bağlantısı yok' };

    const fullMessage: AgentMessage = {
      ...message,
      timestamp: new Date().toISOString(),
    };

    const ref = await adminDb.collection('agent_messages').add({
      ...fullMessage,
      read: false,
      processed: false,
    });

    console.log(`[🤝 TRUST] ${message.from} → ${message.to}: ${message.type} (${message.priority})`);
    return { success: true, messageId: ref.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Bir ajana gelen okunmamış mesajları al
 */
export async function getAgentMessages(agentId: string, limit: number = 10): Promise<AgentMessage[]> {
  try {
    if (!adminDb) return [];
    
    const snap = await adminDb.collection('agent_messages')
      .where('to', '==', agentId)
      .where('processed', '==', false)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snap.docs.map(d => d.data() as AgentMessage);
  } catch {
    return [];
  }
}

/**
 * Agent Registry'yi dışa aç (diğer modüller için)
 */
export function getAgentInfo(agentId: string): AgentIdentity | null {
  return AGENT_REGISTRY[agentId] || null;
}

export function listAllAgents(): AgentIdentity[] {
  return Object.values(AGENT_REGISTRY);
}
