import { runSwarm } from "../aloha/orchestrator";

async function main() {
  console.log("============= AIPYRAM AGENT OS TEST STARTED =============");
  console.log("Checking environment...");
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY is missing in .env.local");
    return;
  }
  console.log("✅ GEMINI_API_KEY detected.");

  console.log("\n🚀 Initiating Deep Swarm Chaining (Mode: DEEP)...");
  
  try {
    const result = await runSwarm({
      task: "Perde.ai perakende pazarı için maliyetsiz satış artırma ve dijital görünürlük stratejisi üret.",
      context: {
        domainInstruction: "Sensory Input from Domain: PERDE.AI\nBağlam: Perakende perde, akıllı ev sistemleri ve 3D tasarım."
      }
    });

    console.log("\n============= 🧠 SWARM EXECUTION RESULTS =============");
    result.chain.forEach((output, index) => {
      console.log(`\n[${index + 1}] 🤖 AGENT: ${output.agent}`);
      console.log(`> Raw JSON Answer: ${output.result}`);
    });

    console.log(`\n👑 FINAL DECISION (ALOHA OVERRIDE):`);
    console.log(`> Raw JSON Answer: ${result.finalDecision?.result}`);
    console.log("\n============= TEST FINISHED SUCCESSFULLY =============");
  } catch (err: any) {
    console.error("\n❌ FATAL ORCHESTRATOR ERROR:", err.message);
  }
}

main();
