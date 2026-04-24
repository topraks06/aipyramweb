import { targetAgent } from './targetAgent';
import { adminDb } from '@/lib/firebase-admin';


/**
 * TRTEX haberi eklendiğinde asenkron olarak Lead Generation sürecini başlatır.
 */
export async function triggerLeadEngineFromNews(title: string, content: string, category: string) {
  // Çok düşük seviye veya önemsiz haberleri atla
  const skipKeywords = ['günlük', 'haftalık', 'özet', 'kısa'];
  if (skipKeywords.some(k => title.toLowerCase().includes(k))) return;

  console.log(`[LEAD ENGINE] 🚀 TRTEX Haberi algılandı: "${title}". Lead Target tetiği çalıştırılıyor...`);

  // Güçlü kelimeler içeriyorsa (ihale, otel projesi, yeni koleksiyon) lead ara
  const triggerKeywords = ['otel', 'ihale', 'konut', 'projesi', 'tesis', 'yeni yatırım', 'fuar'];
  const contentStr = (title + ' ' + content).toLowerCase();
  
  if (triggerKeywords.some(keyword => contentStr.includes(keyword))) {
    try {
      // Bağlamı hedef ajana yolla (arka planda çalışır)
      const mockCountry = 'Birleşik Arap Emirlikleri'; // Normalde NLP ile haberden çekilir
      
      const leads = await targetAgent.findLeadsForTrtexContext(
        `Yeni Haber: ${title} - Kategori: ${category}`,
        mockCountry
      );

      if (leads && leads.length > 0) {
        await targetAgent.saveLeads(leads);
        console.log(`[LEAD ENGINE] ✅ Haber tetiklemesi ile ${leads.length} yeni potansiyel firma bulundu ve DB'ye eklendi.`);
        
        // --- TENDER ROUTING (Otonom İhale Dağıtımı) ---
        // TRTEX'ten gelen istihbarat, tüm ekosistem için global "Fırsat" olarak açılır
        try {
          const CATEGORY_VOLUME: Record<string, number> = {
            'ihale': 500000, 'otel': 300000, 'konut': 250000,
            'fuar': 150000, 'yatırım': 400000, 'tesis': 350000, 'default': 200000
          };
          const estimatedVolume = CATEGORY_VOLUME[category.toLowerCase()] ?? CATEGORY_VOLUME.default;

          await adminDb.collection('b2b_opportunities').add({
            title: `[TRTEX Fırsat] ${title}`,
            customerName: 'AIPyram Sovereign',
            items: [`İstihbarat: ${category}`],
            grandTotal: estimatedVolume, // Deterministik tahmini hacim
            status: 'opportunity',
            createdAt: new Date(),
            source: 'trtex_news_trigger'
          });
          console.log(`[TENDER ROUTER] 🚀 Fırsat B2B panele başarıyla yönlendirildi!`);
        } catch (e: any) {
          console.error(`[TENDER ROUTER] Hata: ${e.message}`);
        }

      } else {
        console.log(`[LEAD ENGINE] ℹ️ Haber tetiklemesi çalıştı ancak uygun firma bulunamadı.`);
      }
    } catch (err: any) {
      console.error(`[LEAD ENGINE] 🔴 Tetikleme sırasında hata: ${err.message}`);
    }
  }
}
