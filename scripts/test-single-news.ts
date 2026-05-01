import { runNewsPipeline } from '../src/core/aloha/newsEngine';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  console.log("ALOHA Agent: Dünyadaki en önemli güncel B2B ev tekstili haberini araştırıyor...");
  
  const brief = "Şu anda dünya ev tekstili, perde veya iplik sektöründeki en önemli, en taze, uluslararası B2B gelişmesini bul. Fiyat dalgalanması, yeni bir teknoloji, bir fuar gelişmesi veya ticaret anlasması olabilir. Tek bir güçlü haber üret.";
  
  try {
    const result = await runNewsPipeline(brief);
    if (result.success) {
      console.log(`\n✅ Başarılı! Haber ID: ${result.articleId}`);
      console.log(`Haber Başlığı: ${result.title}`);
    } else {
      console.error(`\n❌ Başarısız: ${result.error}`);
    }
  } catch (e) {
    console.error("Agent failed:", e);
  }
  process.exit(0);
}

run();
