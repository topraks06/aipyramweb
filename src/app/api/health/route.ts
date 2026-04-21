import { NextResponse } from "next/server";
import { MISSION_TARGETS, MISSION_DEADLINE, NEXUS_MAP, AGENT_AUTHORITY_MAP, DECISION_WEIGHTS } from "@/lib/neural-protocol-config";
import { checkFirestoreHealth } from "@/lib/firebase-admin";

// ═══════════════════════════════════════════════════
// GOOGLE-NATIVE: Upstash Redis KALDIRILDI
// Anayasa: Sadece Google altyapısı.
// ═══════════════════════════════════════════════════

export async function GET() {
  const now = new Date();
  const deadline = new Date(MISSION_DEADLINE);
  const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const liveTargets = MISSION_TARGETS.filter(t => t.status === "live").length;
  const avgProgress = Math.round(MISSION_TARGETS.reduce((s, t) => s + t.progress, 0) / MISSION_TARGETS.length);

  // 1. Firebase Check
  const firebaseStatus = await checkFirestoreHealth();

  // 2. Gemini Check (Stateless)
  let geminiStatus = "ok";
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
     geminiStatus = "missing_key";
  }

  const isHealthy = firebaseStatus !== 'DOWN' && geminiStatus === 'ok';

  return NextResponse.json({
    status: isHealthy ? "operational" : "degraded",
    version: "3.0.0-google-native",
    system: "Aipyram Neural Protocol",
    timestamp: now.toISOString(),
    uptime: process.uptime(),

    mission: {
      deadline: MISSION_DEADLINE,
      daysRemaining,
      targetsTotal: MISSION_TARGETS.length,
      targetsLive: liveTargets,
      avgProgress,
    },

    infrastructure: {
      nexusCount: NEXUS_MAP.length,
      agentCount: AGENT_AUTHORITY_MAP.length,
      decisionWeights: DECISION_WEIGHTS.length,
      domainsManaged: 270,
      sectorsActive: 12,
    },

    health: {
      api: "ok",
      firebase: firebaseStatus.toLowerCase(),
      gemini: geminiStatus
    },
  }, { 
      status: isHealthy ? 200 : 503 
  });
}