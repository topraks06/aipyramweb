import { adminDb } from '../src/lib/firebase-admin';

async function seed() {
  if (!adminDb) {
    console.error("Firebase admin is not initialized. Check your environment variables.");
    process.exit(1);
  }

  try {
    console.log("Seeding aloha_system_state/global...");
    await adminDb.collection('aloha_system_state').doc('global').set({
      lockdown: false,
      global_kill_switch: false,
      reason: "",
      lastUpdated: new Date().toISOString()
    });

    console.log("Seeding aloha_system_state/finance...");
    await adminDb.collection('aloha_system_state').doc('finance').set({
      global_kill_switch: false,
      monthly_budget_usd: 20,
      reason: "",
      lastUpdated: new Date().toISOString()
    });

    console.log("Seeding sovereign_agent_authority/icmimar...");
    await adminDb.collection('sovereign_agent_authority').doc('icmimar').set({
      renderEnabled: true,
      dailyRenderBudget: 10,
      dailyCostLimitUSD: 2.0,
      allowedActions: ["image_generation", "text_generation", "embedding", "data_write"]
    });

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding kill switches:", error);
    process.exit(1);
  }
}

seed();
