import { executeMasterAgent, MasterSystemState } from "../aloha/master-agent";

/**
 * MASTER AGENT (NEWS-GUARD) SİMÜLASYONU
 * Aipyramweb'de otonom olarak çalışır, haberi oluşturur ve (simüle olarak) TRTEX'e yollar.
 */

async function runMasterNightWatch() {
  console.log("==================================================");
  console.log("🌌 [CORE BRAIN] MASTER AGENT UYANIYOR...");
  console.log("==================================================");

  // Sahte State (Gerçekte veritabanından, RAG / Firebase'den okuyacak)
  // TRTEX'e en son haber 8 saat önce girilmiş (6 saat limitini aşmış)
  const systemState: MasterSystemState = {
    last_news_time: Date.now() - (8 * 60 * 60 * 1000), 
    topics_used: ["Yapay Zeka Tasarım", "Pamuk İhracatı", "Heimtextil Fuarı"],
    last_market_update: Date.now() - (15 * 60 * 60 * 1000), // 12 saati aşmış
    todays_news_count: 2 // 5'ten az
  };

  console.log("[State Analizi] Haber Zaman Aşımı Tespit Edildi (LIMIT: 6 Saat, MEVCUT: 8 Saat).");
  console.log("[State Analizi] Günlük Haber Kotası Dolmamış (MEVCUT: 2/5).");
  console.log("⏱️ NEWS-GUARD AGENT ÇAĞRILIYOR... Trend Üretimi ve 7 Dilde Çeviri Bekleniyor...\n");

  try {
    const payload = await executeMasterAgent("trtex", systemState, "TRTEX ve Perde.ai için bariyerli/çevresel kumaş trendleriyle ilgili acil bir SEO odaklı haber geç.");
    
    console.log("🚀 [MASTER AGENT] ÜRETİM BAŞARILI:");
    console.log(`TYPE: ${payload.type} | ACTION: ${payload.action}`);
    console.log(`METADATA: Güven Skoru %${(payload.meta.confidence * 100).toFixed(0)} | Kaynak: ${payload.meta.source}`);
    console.log(`KATEGORİ: ${payload.payload.category}`);
    console.log(`ETİKETLER: ${payload.payload.tags?.join(", ")}`);
    console.log(`GÖRSEL URL (Image Agent): ${payload.payload.image_url}`);
    
    console.log("\n--- TÜRKÇE (TR) ---");
    console.log("BAŞLIK:", payload.payload.translations.TR.title);
    console.log("ÖZET:", payload.payload.translations.TR.summary);
    
    console.log("\n--- İNGİLİZCE (EN) ---");
    console.log("TİTLE:", payload.payload.translations.EN.title);

    console.log("\n--- ALMANCA (DE) ---");
    console.log("TİTEL:", payload.payload.translations.DE.title);

    console.log("\nSTATE GÜNCELLEMESİ (Topic Used):", (payload.newStateUpdate as any).added_topic);

    console.log("\n==================================================");
    console.log("📡 [WEBHOOK SİMÜLASYONU] TRTEX ve Perde.ai API'sine JSON fırlatılıyor...");
    console.log("POST https://trtex.com/api/aipyram -> BAŞARILI!");
    console.log("POST https://perde.ai/api/signals -> BAŞARILI!");
    console.log("==================================================");

  } catch (error: any) {
    console.error("❌ SISTEM HATASI:", error.message);
  }
}

runMasterNightWatch();
