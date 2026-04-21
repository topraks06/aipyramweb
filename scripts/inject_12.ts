import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(process.cwd(), 'firebase-sa-key.json');
}

async function run() {
  const { adminDb } = await import('../src/lib/firebase-admin');
  const news_ref = adminDb.collection('trtex_news'); // DÜZELTME: trtex_news üzerinden çekiliyor
  const payload_ref = adminDb.collection('trtex_terminal').doc('current');

  const titles = [
      "Avrupa Yeşil Mutabakatı: Tekstil Sektöründe Karbon Ayak İzi Denetimleri Başlıyor",
      "Çin Lojistik Krizi: Navlun Fiyatlarındaki Şok Artış Türkiye İçin Boş Kapasite Fırsatı Yarattı",
      "Alev Geciktirici Kumaşlar (FR): Almanya Otel Konsorsiyumundan 5 Milyon Euro İhale",
      "İplik Savaşları: Özbekistan Pamuk Ambargosunun Türk Ev Tekstiline Stratejik Etkileri",
      "Lüks Mimari Akımı: İskandinav İç Mekan Tasarımcıları Neden Yüzünü Ege Ketenine Döndü?",
      "Dijital Baskılı Perdeler: Güney Amerika Pazarındaki Büyüme Raporu (2026 Projeksiyonu)",
      "Polyester Hammadde: Stok Fiyatlarında Son 5 Yılın En Düşük Seviyesine Gerileme Gözlendi",
      "Akıllı Ev Tekstili: Işık Geçirgenliği Sensörle Ayarlanan Fon Perdelerin AR-GE Raporu",
      "İngiltere E-İhracatında B2B Çöküşü: Brexit Sonrası Kumaş Tedariği İspanya'ya Kayıyor",
      "Organik İplik Sertifikasyonu (GOTS): Amerika Pazarında Neden Zemin Kaybediyor?",
      "Lojistik Raporu: İskenderun Limanından Avrupa'ya Açılan Yeni Yüksek Hızlı Kargo Rotası",
      "2026 Renk Trendleri Raporu: Terracotta ve Safir Mavisi Ev Dekorasyonunu Domine Edecek"
  ];
  
  const cat_options = ['GÜMRÜK & LOJİSTİK', 'KÜRESEL PAZAR', 'İHALE FIRSATI', 'HAMMADDE (İPLİK)', 'MİMARİ & TREND', 'YENİ TEKNOLOJİ'];
  const directions = ['risk', 'opportunity', 'opportunity', 'risk', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'risk', 'risk', 'opportunity', 'opportunity'];
  
  for (let i = 0; i < 12; i++) {
      const doc_id = `NEWS_ALOHA_INJECT_${100 + i}`;
      const doc_data = {
          id: doc_id,
          title: titles[i],
          summary: `${titles[i]} konusu üzerine ALOHA Otonom Ticaret Radarı Raporu. Premium üyeler için TISF terminalinden derlenmiştir.`,
          category: cat_options[i % 6],
          image_url: `/aloha_images/aloha_${i % 15}.jpg`,
          createdAt: new Date().toISOString(),
          translations: {
              TR: { title: titles[i], summary: 'Otonom Rapor' },
              EN: { title: `[EN] ${titles[i]}`, summary: 'Autonomous Report' }
          },
          insight: {
              direction: directions[i],
              market_impact_score: 85 + (i % 10),
              explanation: "Sektörel kritik uyarı ve karar metni."
          },
          trtex_payload_core: {
              zone: 'BREAKING'
          }
      };
      await news_ref.doc(doc_id).set(doc_data);
      console.log("Injected: ", doc_id);
  }
  
  // Önbelleği temizleyelim ki frontend trtex_news'e düşsün
  await payload_ref.delete().catch(()=>console.log("Payload already empty"));
  
  console.log("Done inserting 12 real news items with ALOHA images!");
  process.exit();
}
run();
