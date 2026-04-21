import { executeSystemAction } from "../actions/systemActions";
import { executeLiveNewsSwarm } from "./live-news-swarm";
import { SYSTEM_LAW } from '../aloha/system_law';

/**
 * AIPYRAM NIGHT WATCH (Gece Nöbeti Otonom Döngüsü)
 * Google Cloud'da PM2 (ecosystem.config.cjs) Cron modunda her gece uyanır.
 * 
 * V2: Dinamik Brief Rotasyonu — GLOBAL_RADAR_MATRIX'ten (52 sorgu) 
 * her gece farklı bir brief seçer. İçerik çeşitliliği garanti altında.
 */

// Gün sayısına göre rotasyonlu brief seçimi
function selectNightBrief(): { brief: string; index: number } {
  const matrix = SYSTEM_LAW.GLOBAL_RADAR_MATRIX;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % matrix.length;
  return { brief: matrix[index], index };
}

async function wakeUpSovereign() {
  console.log("==================================================");
  console.log("🦉 [NIGHT WATCH v2] Agent OS Uyanıyor... (Dinamik Rotasyon Modu)");
  console.log("==================================================");

  try {
    // V2: GLOBAL_RADAR_MATRIX'ten dinamik brief seçimi
    const { brief, index } = selectNightBrief();
    console.log(`[Night Watch] 📡 Radar Matrix Brief #${index + 1}/52: "${brief}"`);

    // 2 farklı brief ile 2 haber üret (çeşitlilik)
    const matrix = SYSTEM_LAW.GLOBAL_RADAR_MATRIX;
    const secondIndex = (index + Math.floor(matrix.length / 2)) % matrix.length;
    const briefs = [brief, matrix[secondIndex]];

    let successCount = 0;

    for (let i = 0; i < briefs.length; i++) {
      const currentBrief = briefs[i];
      console.log(`\n[Night Watch] 🎯 Swarm Çevrimi ${i + 1}/2: "${currentBrief.substring(0, 60)}..."`);

      const swarmResult = await executeLiveNewsSwarm(
        `B2B Intelligence Brief: "${currentBrief}". ` +
        `Produce a high-quality B2B home textile industry intelligence report. ` +
        `Include real data points, exact numbers, company names, and actionable trade recommendations. ` +
        `Minimum 800 words. Bloomberg terminal tone.`
      );

      if (swarmResult) {
        successCount++;
        const title = swarmResult.intelligence?.translations?.TR?.title || 'Başlık yok';
        console.log(`✅ [Night Watch] Haber ${i + 1} üretildi: ${title.substring(0, 60)}`);
      } else {
        console.warn(`⚠️ [Night Watch] Haber ${i + 1} üretilemedi (Reality Guard izin vermedi).`);
      }

      // Rate limiting: haberler arası 3 saniye bekle
      if (i < briefs.length - 1) await new Promise(r => setTimeout(r, 3000));
    }

    console.log("\n==================================================");
    console.log(`🧠 [GECE EĞİTİMİ] ${successCount}/${briefs.length} haber başarıyla üretildi.`);

    // Sistem bakımı
    console.log("\n🧹 [Night Watch] Sistem bakımı yapılıyor...");
    try {
      const sysResult = await executeSystemAction({ command: "git status", reasoning: "Gece rutin güvenlik kontrolü." });
      if (sysResult.success && typeof sysResult.stdout === 'string') {
        console.log(sysResult.stdout.includes("nothing to commit")
          ? "[Night Watch] Çalışma dizini temiz."
          : "[Night Watch] Uyarı: İzlenmeyen veya değişmiş dosyalar var.");
      }
    } catch { /* git check non-blocking */ }

    console.log("==================================================");
    console.log("💤 [NIGHT WATCH v2] Otonom döngü tamamlandı. Uyku moduna dönülüyor.");
    console.log("==================================================");

  } catch (error: any) {
    console.error("❌ [Night Watch] Kritik Sistem Hatası:", error.message);
  }
}

wakeUpSovereign();
