// ═══════════════════════════════════════════════════════════════
// aipyram AGENT REGISTRY V2.0
// Core Brain + B2B Worker Agents
// ═══════════════════════════════════════════════════════════════

// Core Brain Agents (Swarm Orchestration Chain)
import { aloha as ALOHA } from "../agents/aloha";
import { visionary as VISIONARY } from "../agents/visionary";
import { reality as REALITY } from "../agents/reality";
import { apollon as APOLLON } from "../agents/apollon";

// B2B Worker Agent Functions (Revenue-Generating)
import { matchSupplierWithRFQ, generateLiveRFQs } from "../agents/matchmakerAgent";
import { translateContent } from "../agents/polyglotAgent";
import { auditSupplier } from "../agents/auditorAgent";
import { analyzeMarketTrends } from "../agents/trendsetterAgent";
import { handleBuyerInquiry } from "../agents/virtualRepAgent";
import { DomainMasterAgent } from "../agents/domainMasterAgent";

import { Agent, AgentRole, CoreAgentRole } from "../agents/types";

// ═══════════════════════════════════════════════════════════════
// CORE AGENT REGISTRY (Swarm Chain — Prompt Chaining Orchestration)
// ═══════════════════════════════════════════════════════════════
export const coreAgentRegistry: Record<string, any> = {
  ALOHA,
  VISIONARY,
  REALITY,
  APOLLON,
};

// ═══════════════════════════════════════════════════════════════
// B2B WORKER REGISTRY (Doğrudan fonksiyon çağrısı ile çalışırlar)
// ═══════════════════════════════════════════════════════════════
export const workerRegistry = {
  MATCHMAKER: {
    matchSupplierWithRFQ,
    generateLiveRFQs,
  },
  POLYGLOT: {
    translateContent,
  },
  AUDITOR: {
    auditSupplier,
  },
  TRENDSETTER: {
    analyzeMarketTrends,
  },
  VIRTUAL_REP: {
    handleBuyerInquiry,
  },
  DOMAIN_MASTER: {
    spawnDomainIdentity: DomainMasterAgent.spawnDomainIdentity,
  },
};

// ═══════════════════════════════════════════════════════════════
// UNIFIED ACCESS
// ═══════════════════════════════════════════════════════════════

/** Core agent'ı döndürür (Swarm Chain için) */
export function getAgent(role: CoreAgentRole): any {
  return coreAgentRegistry[role];
}

/** Worker agent fonksiyonlarını döndürür */
export function getWorker(role: string): any {
  return (workerRegistry as any)[role];
}

/** Tüm kayıtlı ajanları listeler */
export function listAllAgents(): string[] {
  return [
    ...Object.keys(coreAgentRegistry),
    ...Object.keys(workerRegistry),
  ];
}

/** Bir ajan rolünün kayıtlı olup olmadığını kontrol eder */
export function isAgentRegistered(role: string): boolean {
  return role in coreAgentRegistry || role in workerRegistry;
}
