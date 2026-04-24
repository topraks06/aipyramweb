import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve('./firebase-sa-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}
const db = admin.firestore();

import { ecosystemBus } from '../src/core/events/ecosystemBus';
import { runAlohaCycle } from '../src/core/aloha/autoRunner';

async function runWarfare() {
  console.log("🔥 LOKAL SAVAŞ SİMÜLASYONU BAŞLIYOR (ALOHA DEEP AUDIT) 🔥");
  console.log("----------------------------------------------------------");

  // 1. TRTEX'ten bir sinyal fırlat
  console.log("\n[1/3] TRTEX -> Perde.ai Otonom Sinyal Ateşlemesi");
  await ecosystemBus.emit({
    type: 'TRADE_INTENT_DETECTED',
    source_node: 'trtex',
    target_node: 'perde_ai',
    priority: 'high',
    payload: {
      category: 'Otel Projesi Perde Alımı',
      intent: 'B2B RFQ (Lüks)',
      quantity: 1200,
      description: 'Lüks otel projesi için karartma blackout perde ve dijital baskılı tüller aranıyor. Bütçe esnek.'
    }
  });
  console.log("✅ Sinyal gönderildi.");

  // 2. Aloha Pipeline'ı Perde.ai için manuel tetikle
  console.log("\n[2/3] ALOHA Orkestratörü Uyandırılıyor (Perde.ai)");
  const perdeResult = await runAlohaCycle('perde');
  console.log("✅ Perde.ai Pipeline Sonucu:");
  console.dir(perdeResult, { depth: null, colors: true });

  // 3. Aloha Pipeline'ı TRTEX için manuel tetikle (CEO directive)
  console.log("\n[3/3] ALOHA CEO Devreye Giriyor (TRTEX)");
  const trtexResult = await runAlohaCycle('trtex');
  console.log("✅ TRTEX Pipeline Sonucu:");
  console.dir(trtexResult, { depth: null, colors: true });

  console.log("\n🎉 SİMÜLASYON TAMAMLANDI: Otonom sistemler başarıyla etkileşime girdi.");
  process.exit(0);
}

runWarfare().catch(e => {
  console.error("❌ Savaş Simülasyonu Hatası:", e);
  process.exit(1);
});
