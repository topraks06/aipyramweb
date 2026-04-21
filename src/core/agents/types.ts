// ═══════════════════════════════════════════════════════════════
// AIPYRAM AGENT TYPE SYSTEM — V2.0 (Revenue-First Architecture)
// ═══════════════════════════════════════════════════════════════

// Core Brain Agents (Swarm Orchestration Chain)
export type CoreAgentRole = "ALOHA" | "VISIONARY" | "REALITY" | "APOLLON";

// B2B Worker Agents (Revenue-Generating)
export type WorkerAgentRole =
  | "MATCHMAKER"      // RFQ → Tedarikçi eşleştirme → Komisyon
  | "POLYGLOT"        // 8 dile çeviri (TR, EN, DE, FR, ES, AR, RU, ZH)
  | "TRENDSETTER"     // Pazar trendi analizi
  | "AUDITOR"         // Sertifika doğrulama + Trust Score
  | "VIRTUAL_REP"     // 7/24 AI stand görevlisi
  | "DOMAIN_MASTER";  // Domain yönetici ajanı

// Combined type
export type AgentRole = CoreAgentRole | WorkerAgentRole;

export type AgentCapability = "READ" | "PLAN" | "ACT" | "OVERRIDE" | "TRADE" | "TRANSLATE" | "VERIFY";

// ═══════════════════════════════════════════════════════════════
// COST CONTROL — Token Spirali Önleme (Kritik)
// ═══════════════════════════════════════════════════════════════
export interface AgentBudget {
  maxTokens: number;        // Tek çağrı token limiti
  maxSteps: number;         // Zincir adım limiti
  maxCostUSD: number;       // USD maliyet limiti
  currentSteps: number;     // Anlık adım sayısı
  totalTokensUsed: number;  // Toplam harcanan token
  killSwitch: boolean;      // Acil durdurma
}

export const DEFAULT_BUDGET: AgentBudget = {
  maxTokens: 8192,
  maxSteps: 5,
  maxCostUSD: 0.50,
  currentSteps: 0,
  totalTokensUsed: 0,
  killSwitch: false,
};

// ═══════════════════════════════════════════════════════════════
// HITL — Human-in-the-Loop ($10K+ zorunlu onay)
// ═══════════════════════════════════════════════════════════════
export interface HITLConfig {
  requireApprovalAboveUSD: number;  // Bu tutarın üstünde manuel onay
  autoApproveBelow: boolean;        // Altında otomatik mi?
  require2FA: boolean;              // 2FA zorunlu mu?
}

export const DEFAULT_HITL: HITLConfig = {
  requireApprovalAboveUSD: 10000,
  autoApproveBelow: true,
  require2FA: false,
};

// ═══════════════════════════════════════════════════════════════
// AGENT REPUTATION — Ajan Performans Takibi
// ═══════════════════════════════════════════════════════════════
export interface AgentReputation {
  agentRole: AgentRole;
  successRate: number;        // 0-100 (%)
  totalTasks: number;
  failedTasks: number;
  avgResponseTimeMs: number;
  lastUpdated: number;        // Unix timestamp
}

// ═══════════════════════════════════════════════════════════════
// CORE INTERFACES
// ═══════════════════════════════════════════════════════════════
export interface Agent {
  name: AgentRole;
  description: string;
  capabilities: AgentCapability[];
  systemPrompt: string;
  budget?: AgentBudget;
}

export interface AgentInput {
  task: string;
  context?: any;
  previousThoughts?: AgentOutput[];
  budget?: AgentBudget;
}

export interface AgentOutput {
  agent: AgentRole;
  result: string;
  confidence: number;
  tokensUsed?: number;
  costUSD?: number;
  durationMs?: number;
}

export interface SwarmResult {
  chain: AgentOutput[];
  finalDecision: AgentOutput | undefined;
  totalCostUSD?: number;
  totalTokens?: number;
}
