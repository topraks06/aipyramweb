import { adminDb } from '../src/lib/firebase-admin';

async function seedGhostEngine() {
  console.log("🔥 THE GHOST ENGINE SEEDING STARTED 🔥");

  const timestamp = new Date();

  // 1. TRTEX Otonom İhale Fırsatı
  console.log("1. Injecting TRTEX Intelligence Opportunity...");
  await adminDb.collection('b2b_opportunities').add({
    title: "[TRTEX İSTİHBARAT] Dubai Jumeirah Yeni Otel Projesi",
    customerName: "AIPyram Sovereign Target",
    items: ["İstihbarat: Otel Projesi", "Blackout Perde İhtiyacı", "Lüks Keten Runner"],
    grandTotal: 450000, 
    status: "opportunity",
    createdAt: timestamp,
    source: "trtex_news_trigger",
    ai_confidence: 94
  });

  // 2. Vorhang Avrupa Siparişi (Final Bridge)
  // Perde.ai panelinde görünsün diye üretici UID'si olarak genelde login olan user'ı seçmek lazım ama 
  // şimdilik test UID'si kullanacağız. Orada "perde_default_vendor" demiştik.
  // Gerçek panel "authorId == user.uid" ile arıyor.
  // aipyram-web'deki lokal dev için user UID genellikle 'hakan_test' veya Firebase'de neyse odur.
  // Tüm projelere ulaşabilmesi için geçici bir global "b2b_admin" mantığı varsa, şimdilik sabit authorId kullanalım.
  console.log("2. Injecting Vorhang European Order...");
  await adminDb.collection('perde_projects').add({
    title: "[VORHANG İHRACAT] Premium Verdunkelungsvorhang",
    customerName: "Muster GmbH",
    country: "DE",
    items: [
       { name: "Premium Blackout", quantity: 2, unitPriceEur: 184.66 }
    ],
    amount: 13460.50, // TRY (36.45 kur)
    grandTotal: 13460.50,
    currency: "TRY",
    exportCurrency: "EUR",
    exportTotal: 369.32,
    status: "s2", // Üretimde / Onaylandı
    source: "vorhang_bridge",
    vorhangOrderId: "VOR-8849-DE",
    authorId: "perde_default_vendor", // Gerekirse UI'da bu UID'ye override yapacağız
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  // 3. Hometex Otonom Katalog Kaydı
  console.log("3. Injecting Hometex Global Products...");
  const hometexProducts = [
    {
      slug: "luxury-linen-beige-001",
      title_en: "Luxury Beige Linen Fabric",
      description_en: "Premium 100% natural linen fabric ideal for curtains and upholstery. Fire retardant and durable.",
      material: "%100 Keten",
      color: "Bej",
      color_hex: "#E5E4E2",
      pattern: "Düz",
      image_url: "/assets/perde.ai/perde.ai (9).jpg",
      tags: ["linen", "curtain", "luxury", "hotel"],
      status: "published",
      createdAt: timestamp.toISOString()
    },
    {
      slug: "jacquard-damask-gold-002",
      title_en: "Classic Jacquard Damask Gold",
      description_en: "Heavyweight jacquard fabric with classic damask patterns. Perfect for luxury hotels and VIP residences.",
      material: "Jakarlı Polyester",
      color: "Altın",
      color_hex: "#D4AF37",
      pattern: "Damask",
      image_url: "/assets/perde.ai/perde.ai (6).jpg",
      tags: ["jacquard", "classic", "gold", "vip"],
      status: "published",
      createdAt: timestamp.toISOString()
    },
    {
      slug: "blackout-hotel-grey-003",
      title_en: "100% Blackout Hotel Standard",
      description_en: "Ultimate light blocking technology with sound dampening properties. Essential for hospitality.",
      material: "Blackout Akrilik",
      color: "Antrasit",
      color_hex: "#383E42",
      pattern: "Düz",
      image_url: "/assets/perde.ai/perde.ai (2).jpg",
      tags: ["blackout", "hotel", "fr-certified"],
      status: "published",
      createdAt: timestamp.toISOString()
    }
  ];

  for (const p of hometexProducts) {
    await adminDb.collection('hometex_products').doc(p.slug).set(p);
  }

  console.log("✅ THE GHOST ENGINE SEEDING COMPLETED ✅");
}

seedGhostEngine().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
