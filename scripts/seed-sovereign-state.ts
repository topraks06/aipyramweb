import { adminDb } from '../src/lib/firebase-admin';

async function seed() {
  if (!adminDb) {
    console.error("Firebase Admin DB is not initialized.");
    process.exit(1);
  }

  try {
    // 1. aloha_system_state/global
    await adminDb.collection('aloha_system_state').doc('global').set({
      lockdown: false,
      global_kill_switch: false,
      reason: "",
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    console.log("Seeded aloha_system_state/global");

    // 2. aloha_system_state/finance
    await adminDb.collection('aloha_system_state').doc('finance').set({
      global_kill_switch: false,
      monthly_budget_usd: 20,
      reason: ""
    }, { merge: true });
    console.log("Seeded aloha_system_state/finance");

    // 3. sovereign_agent_authority/icmimar
    await adminDb.collection('sovereign_agent_authority').doc('icmimar').set({
      renderEnabled: true,
      dailyRenderBudget: 10,
      dailyCostLimitUSD: 2.0,
      allowedActions: ["image_generation", "image_to_image_generation", "text_generation", "embedding", "data_write"]
    }, { merge: true });
    console.log("Seeded sovereign_agent_authority/icmimar");

    // 4. sovereign_agent_authority/trtex
    await adminDb.collection('sovereign_agent_authority').doc('trtex').set({
      renderEnabled: false, // Hakan Bey requested images for TRTex manually if needed, but let's keep false default
      dailyCostLimitUSD: 5.0,
      allowedActions: ["news_pipeline", "data_write", "text_generation", "image_generation"]
    }, { merge: true });
    console.log("Seeded sovereign_agent_authority/trtex");

    console.log("Seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
}

seed();
