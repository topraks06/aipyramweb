import 'dotenv/config';
import { runGlobalTenderCycle } from '../aloha/trtex-live-indexer.js';

async function main() {
  try {
    console.log("🚀 [MANUAL TRIGGER] TRTEX Live-Indexer başlatılıyor...");
    const indexed = await runGlobalTenderCycle();
    console.log(`✅ İşlem tamamlandı. SSOT üzerine yazılan ilan sayısı: ${indexed}`);
  } catch (e) {
    console.error("❌ Hata:", e);
  }
}

main();
