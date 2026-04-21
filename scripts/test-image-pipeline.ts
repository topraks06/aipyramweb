import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { processMultipleImages } from '../src/core/aloha/imageAgent';
import { admin, adminDb } from '../src/lib/firebase-admin';

async function testPipeline() {
  console.log("=== TRTEX GÖRSEL PIPELINE TESTİ BAŞLIYOR (ASPECT RATIO 80% KURALI) ===");
  try {
    const baslik = "2026 İlkbahar Yaz Ev Tekstili Trendleri Belirlendi";
    const icerik = "Sektördeki yenilikler bu sene doğal tonlara kayıyor. Perde ve nevresim takımlarında yüksek kalite lüks detaylar öne çıkacak.";
    const kategori = "bedding_set";
    
    // Deneme yapıyoruz
    const urls = await processMultipleImages(kategori, baslik, icerik, 3);
    
    console.log("\n✅ ÜRETİLEN GÖRSELLER (ÖN İZLEME):");
    urls.forEach((url, i) => {
      console.log(`[Resim ${i + 1}]: ${url}`);
    });

  } catch (err: any) {
    console.error("❌ Hata:", err.message);
  }
}

testPipeline().then(() => process.exit(0));
