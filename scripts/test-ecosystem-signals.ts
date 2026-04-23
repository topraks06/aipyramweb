import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { ecosystemBus } from '../src/core/events/ecosystemBus';
import { matchSupplierWithRFQ } from '../src/lib/agents/MatchmakerAgent';
import { EcosystemSignal } from '../src/core/events/signalTypes';

async function runTest() {
  console.log("🚀 Sinyal & Eşleştirme Testi Başlıyor...");
  console.log("-----------------------------------------------------");

  if (!process.env.GOOGLE_GENAI_API_KEY) {
    console.warn("⚠️ UYARI: GOOGLE_GENAI_API_KEY bulunamadı! Matchmaker testi çalışmayabilir.");
  }

  // 1. EcosystemBus Test: TRTEX Haber -> Perde.ai Bridge
  console.log("\n📡 TEST 1: EcosystemBus Sinyali Gönderimi (TRTEX -> Perde.ai)");
  
  // Abone oluşturuyoruz
  ecosystemBus.subscribe('perde_ai', ['TRADE_INTENT_DETECTED'], async (signal: EcosystemSignal) => {
    console.log(`✅ [ABONE] Perde.ai sinyali aldı: ${signal.type}`);
    console.log(`✅ [ABONE] Payload:`, signal.payload);
  });

  // TRTEX'den sinyal yayınlıyoruz
  await ecosystemBus.emit({
    type: 'TRADE_INTENT_DETECTED',
    source_node: 'trtex',
    target_node: 'perde_ai',
    priority: 'high',
    payload: {
      category: 'Toptan Perde',
      intent: 'Alım Talebi (RFQ)',
      quantity: 500,
      description: 'Lüks otel projesi için karartma blackout perde aranıyor.'
    }
  });

  console.log("✅ Sinyal Firestore'a yazıldı (veya local execute edildi).");

  // 2. Matchmaker Agent Test
  console.log("\n🤖 TEST 2: MatchmakerAgent (invokeAgent) Testi");

  const rfqDetails = {
    buyerId: "BUYER-100",
    fabricType: "Blackout, %100 Polyester",
    moq: 500,
    certifications: ["OEKO-TEX"],
    budget_usd_per_meter: 8
  };

  const suppliers = [
    { id: "SUP-A", name: "Alpha Textile", specs: ["Blackout", "OEKO-TEX"], moq: 100, price: 6 },
    { id: "SUP-B", name: "Beta Fabrics", specs: ["Tulle", "Cotton"], moq: 500, price: 4 },
    { id: "SUP-C", name: "Gamma Weaving", specs: ["Blackout", "FR-Certified", "OEKO-TEX"], moq: 1000, price: 9 }
  ];

  try {
    const matches = await matchSupplierWithRFQ(rfqDetails, suppliers);
    console.log("✅ Matchmaker Sonucu:");
    console.dir(matches, { depth: null, colors: true });
  } catch (e: any) {
    console.error("❌ Matchmaker Hatası:", e.message);
  }

  // Allow time for async tasks to finish
  await new Promise(resolve => setTimeout(resolve, 2000));
  process.exit(0);
}

runTest();
