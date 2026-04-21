import * as admin from "firebase-admin";

// Ensure admin is initialized using defaults if not already done.
// NOTE: Run this via `npx tsx scripts/seedData.ts` with GOOGLE_APPLICATION_CREDENTIALS set.
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}
const db = admin.firestore();

const suppliers = [
  {
    tenant_id: "trtex",
    companyName: "Karina Perde Sistemleri",
    region: "Turkey",
    products: ["Tüller", "Fon Perde"],
    certifications: ["OEKO-TEX", "TSE"],
    moq: "5000",
    leadTime: "14 Days",
    trustScore: 85,
    riskLevel: "LOW",
    contactEmail: "info@karinaperde.com.tr",
    yearsInBusiness: 12,
    totalDeals: 145,
    successRate: 98,
    createdAt: Date.now()
  },
  {
    tenant_id: "heimtex",
    companyName: "Munich Textiles GmbH",
    region: "Germany",
    products: ["Fire-retardant curtains", "Trevira CS"],
    certifications: ["Trevira CS", "ISO 9001"],
    moq: "1000",
    leadTime: "7 Days",
    trustScore: 92,
    riskLevel: "LOW",
    contactEmail: "sales@munichtextiles.de",
    yearsInBusiness: 24,
    totalDeals: 410,
    successRate: 99,
    createdAt: Date.now()
  }
];

const rfqs = [
  {
    tenant_id: "trtex",
    buyerRegion: "DACH",
    buyerType: "Hotel Chain",
    product: "Yanmaz fon perde, siyah",
    quantity: "20,000 meters",
    requirements: ["Fire-retardant", "Trevira CS"],
    urgency: "High",
    targetPrice: "€12.50/meter",
    status: "open",
    createdAt: Date.now()
  }
];

async function seed() {
  console.log("🌱 Yükleme Başlıyor: Seed Data (Cold Start)");
  
  const supplierRefs: string[] = [];
  for (const s of suppliers) {
    const docRef = await db.collection("suppliers").add(s);
    supplierRefs.push(docRef.id);
    console.log(`✅ Supplier Added: ${s.companyName}`);
  }

  for (const rfq of rfqs) {
    await db.collection("rfqs").add({
      ...rfq,
      // For seed data, let's pretend one matched. Not required.
      matchedSupplierIds: supplierRefs
    });
    console.log(`✅ RFQ Added: ${rfq.product}`);
  }

  console.log("🚀 Bitti: Cold start verisi sisteme yüklendi.");
}

seed().catch(console.error);
