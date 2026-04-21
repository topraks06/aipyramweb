import { adminDb } from '@/lib/firebase-admin';
import { TEDScraper } from './tedScraper';
import { TenderAgent } from './tenderAgent';

/**
 * TRTEX LIVE INDEXER — SINGLE SOURCE OF TRUTH (SSOT)
 */
export async function runGlobalTenderCycle() {
  console.log("==================================================");
  console.log("🌍 [LIVE INDEXER] GLOBAL TENDER CYCLE BAŞLATILIYOR");
  console.log("==================================================");

  let allTenders: any[] = [];

  // 1. KAMU İHALELERİ (TED EU API)
  try {
    const tedCount = await TEDScraper.execute();
    console.log(`[LIVE INDEXER] TED Scraper başarıyla ${tedCount} ihale kaydetti (trtex_tenders).`);
  } catch (e: any) {
    console.error(`[LIVE INDEXER] TED Scraper Hatası: ${e.message}`);
  }

  // 2. ÖZEL VE KARANLIK İHALELER (GOOGLE GROUNDED AI)
  try {
    const agentCount = await TenderAgent.executeGlobalHunt();
    console.log(`[LIVE INDEXER] TenderAgent başarıyla ${agentCount} fırsat kaydetti (trtex_tenders).`);
  } catch (e: any) {
    console.error(`[LIVE INDEXER] TenderAgent Hatası: ${e.message}`);
  }

  // 3. TOPLAMA MERKEZİ (SSOT BASIMI)
  console.log("[LIVE INDEXER] Toplanan tüm taze veriler ssot (trtex_terminal) için derleniyor...");
  
  if (!adminDb) {
    throw new Error('Firebase Admin DB bağlantısı yok!');
  }

  try {
    // Son 48 saat içindeki en iyi 50 ihaleyi çek
    const twoDaysAgo = Date.now() - (48 * 60 * 60 * 1000);
    const snap = await adminDb.collection('trtex_tenders')
      .where('createdAt', '>=', twoDaysAgo)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
      
    snap.forEach(doc => {
      const data = doc.data();
      // Yüksek risk / düşük fırsat (Score < 60) çöpe at (Quarantine mantığı)
      if (data.status === 'LIVE' && data.score >= 60) {
        allTenders.push({ id: doc.id, ...data });
      }
    });

    // Puanına göre büyükten küçüğe diz
    allTenders.sort((a, b) => b.score - a.score);

    // En iyi 50 ihaleyi sisteme zımbala
    const topTenders = allTenders.slice(0, 50);

    await adminDb.collection('trtex_terminal').doc('current').set({
      activeTenders: topTenders,
      lastTenderUpdate: new Date().toISOString()
    }, { merge: true });

    console.log(`[LIVE INDEXER] ✅ SSOT BAŞARILI: ${topTenders.length} adet Canlı Veri trtex_terminal/current üzerine zımbalandı!`);
    console.log("==================================================");
    
    return topTenders.length;

  } catch (err: any) {
    console.error("[LIVE INDEXER] ❌ Veritabanı Birleştirme Hatası:", err.message);
    throw err;
  }
}
