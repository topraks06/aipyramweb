import { config } from 'dotenv';
config({ path: '.env.local' });
import { executeMasterAgent, MasterSystemState } from "../aloha/master-agent";
import { adminDb } from "../../lib/firebase-admin";

async function fireLiveNews() {
  console.log("==================================================");
  console.log("🔥 [AIPYRAM INC] LIVE TEST INITIATED");
  console.log("==================================================");

  const systemState: MasterSystemState = {
    last_news_time: Date.now() - (8 * 60 * 60 * 1000), 
    topics_used: [],
    last_market_update: Date.now() - (15 * 60 * 60 * 1000),
    todays_news_count: 0
  };

  try {
    console.log("🤖 Master Agent (Aloha) uyandırılıyor...");
    const payload = await executeMasterAgent("trtex", systemState, "Avrupa Yeşil Mutabakatı ve Türkiye tekstil sektörüne yeni karbon vergisi maliyetleri hakkında çarpıcı analiz.");
    
    console.log("✅ ÜRETİM BAŞARILI. Sektörel Kategori: " + payload.payload.category);
    console.log(`CEO Etiketleri: ${payload.payload.tags?.join(", ")}`);
    console.log(`CEO Önceliği: ${payload.payload.ceo_priority_level}`);
    console.log(`Başlık: ${payload.payload.translations.TR.title}`);

    // Insert to database directly!
    const newsDoc = {
      title: payload.payload.translations.TR.title,
      summary: payload.payload.translations.TR.summary,
      content: payload.payload.translations.TR.content,
      category: payload.payload.category,
      tags: payload.payload.tags,
      ceo_priority_level: payload.payload.ceo_priority_level,
      image_url: payload.payload.image_url,
      images: [payload.payload.image_url],
      slug: payload.payload.slug || "live-test-" + Date.now(),
      status: "published",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ai_ceo_block: {
         priority_level: payload.payload.ceo_priority_level,
         impact_score: 9,
         executive_summary: [
           "Bu bir ALOHA LIVE TEST haberidir.",
           "Matris Mimarisi otonom olarak devrededir."
         ]
      },
      quality_score: 100
    };

    console.log("📡 Firestore 'trtex_news' koleksiyonuna basılıyor...");
    const docRef = await adminDb.collection("trtex_news").add(newsDoc);
    console.log(`🎉 BAŞARI: Döküman ID: ${docRef.id}`);
    console.log("\nSiteye gidip 'Haberler' veya ilgili kategori sayfasına ve Intelligence Ticker'a bakabilirsiniz.");

  } catch (err: any) {
    console.error("❌ SISTEM HATASI:", err.message);
  }
}

fireLiveNews();
