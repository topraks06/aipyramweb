require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log("Triggering Aloha V4.1 with specific subject...");
  const call = {
    name: "compose_article",
    args: {
        topic: "hometex istanbul fuarı + tetsiad fuar organize eden + katılımcılar + ziyaretçiler + tarihi ve önemini anlatan güncel ve doğru haber olması için",
        project: "trtex",
        category: "Fuar & Etkinlik",
        language: "tr",
        wordCount: 800
    }
  };
  
  try {
    const { executeToolCall } = await import('../src/core/aloha/engine');
    const res = await executeToolCall(call);
    console.log("SUCCESS:", res);
  } catch (e) {
    console.error("FAIL:", e);
  }
}

main();
