import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Env dosyasını en baştan yükle
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Credentials fallback (local key ise)
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(process.cwd(), 'firebase-sa-key.json');
}

async function massGenerate() {
  const { executeLiveNewsSwarm } = await import('../src/core/swarm/live-news-swarm');
  
  console.log("🚀 [MASS GENERATOR] TRTEX Otonom Doldurma Modu Başlıyor...");
  console.log("🚀 Hedef: 12 adet yüksek kaliteli, tam görselli Canlı Haber!");
  
  for (let i = 1; i <= 12; i++) {
    console.log(`\n==============================================`);
    console.log(`⏳ ÜRETİM DÖNGÜSÜ ${i}/12 BAŞLADI`);
    console.log(`==============================================\n`);
    try {
      await executeLiveNewsSwarm(true); // force run
      console.log(`✅ Döngü ${i} Tamamlandı. Soğuma süresi bekleniyor (15sn)...`);
      await new Promise(r => setTimeout(r, 15000));
    } catch (err: any) {
      console.error(`❌ Döngü ${i} Hatalı: ${err.message}`);
    }
  }
  
  console.log("\n✅ [MASS GENERATOR] Tüm üretimler tamamlandı! TRTEX Terminali dolu.");
  process.exit(0);
}

massGenerate();
