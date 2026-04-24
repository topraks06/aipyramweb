import * as admin from 'firebase-admin';
import * as path from 'path';

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve('./firebase-sa-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}
const db = admin.firestore();

const featureFlags = [
  { id: 'aloha_deep_audit', name: 'ALOHA Deep Audit', status: 'live', trafficPercentage: 100 },
  { id: 'vorhang_auto_pricing', name: 'Vorhang Otonom Fiyatlandırma', status: 'canary', trafficPercentage: 20 },
  { id: 'hometex_agent_mode', name: 'Hometex Otonom Tasarım', status: 'shadow', trafficPercentage: 10 },
  { id: 'trtex_news_automation', name: 'TRTEX Haber Otonomasyonu', status: 'live', trafficPercentage: 100 }
];

const trtexNews = [
  {
    slug: 'avrupa-tekstil-pazarinda-sifir-karbon-hareketi-2026',
    title: 'Avrupa Tekstil Pazarında Sıfır Karbon Hareketi (2026)',
    excerpt: 'AB yeni tekstil regülasyonları ile polyester ürünlerde %30 ek vergi uygulamasına geçiyor.',
    content: 'Avrupa Birliği komisyonu tekstil tedarik zincirinde devrim niteliğinde kararlar aldı...',
    category: 'Sürdürülebilirlik',
    author: 'TRTEX Intelligence',
    tags: ['AB', 'Karbon', 'Regülasyon'],
    status: 'published',
    language: 'tr',
    isAiGenerated: true,
    publishedAt: new Date(),
    createdAt: new Date(),
    domain: 'trtex'
  }
];

const perdeProducts = [
  {
    id: 'perde_fire_retardant_1',
    name: 'Trevira CS Yanmaz Otel Fonu',
    category: 'Fon Perde',
    price: 45,
    unit: 'Metre',
    specs: { material: 'Trevira CS', fireRetardant: true, weight: '320gsm' },
    stock: 5000,
    supplierId: 'sup_karina_1',
    status: 'active'
  }
];

const vorhangProducts = [
  {
    id: 'vorhang_smart_blind_1',
    name: 'Otonom Stor Perde - Somfy Motorlu',
    category: 'Akıllı Perde',
    price: 150,
    currency: 'EUR',
    stock: 200,
    sellerId: 'seller_munich_1',
    status: 'published'
  }
];

async function seed() {
  console.log('🌱 Kapsamlı Seed Başlıyor...');

  // Feature Flags
  for (const flag of featureFlags) {
    await db.collection('feature_flags').doc(flag.id).set(flag);
  }
  console.log('✅ Feature Flags yüklendi.');

  // TRTEX News
  for (const news of trtexNews) {
    await db.collection('trtex_news').doc(news.slug).set(news);
  }
  console.log('✅ TRTEX Haberleri yüklendi.');

  // Perde Products
  for (const prod of perdeProducts) {
    await db.collection('perde_products').doc(prod.id).set(prod);
  }
  console.log('✅ Perde.ai ürünleri yüklendi.');

  // Vorhang Products
  for (const prod of vorhangProducts) {
    await db.collection('vorhang_products').doc(prod.id).set(prod);
  }
  console.log('✅ Vorhang ürünleri yüklendi.');

  console.log('🚀 Seed Tamamlandı.');
}

seed().catch(console.error);
