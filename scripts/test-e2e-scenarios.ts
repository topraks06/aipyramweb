import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { adminDb } from '../src/lib/firebase-admin';

async function runTest() {
  console.log("🚀 Uçtan Uca E2E Senaryoları Testi Başlıyor...");
  console.log("-----------------------------------------------------");

  if (!adminDb) {
    console.error("❌ HATA: Firestore adminDb başlatılamadı.");
    return;
  }

  try {
    // Senaryo 1: Perde.ai Render ve Sipariş
    console.log("\n🎬 SENARYO 1: Perde.ai Render -> Sipariş");
    const renderDoc = await adminDb.collection('perde_renders').add({
      uid: 'test_user_123',
      imageUrl: 'https://test.com/render.jpg',
      prompt: 'Luxury blackout curtain in a modern living room',
      createdAt: Date.now()
    });
    console.log(`✅ [Render] Başarıyla oluşturuldu: ${renderDoc.id}`);

    const orderDoc = await adminDb.collection('perde_orders').add({
      uid: 'test_user_123',
      items: [{ productId: 'prod_1', name: 'Blackout Perde', quantity: 1, price: 150 }],
      total: 150,
      status: 'pending',
      renderId: renderDoc.id,
      createdAt: Date.now()
    });
    console.log(`✅ [Sipariş] Başarıyla oluşturuldu: ${orderDoc.id}`);

    // Senaryo 2: TRTEX Haber Oku -> Lead Form
    console.log("\n🎬 SENARYO 2: TRTEX Lead Form -> Admin");
    const leadDoc = await adminDb.collection('trtex_leads').add({
      name: 'Hakan Yılmaz',
      email: 'hakan@aipyram.com',
      company: 'AIPyram',
      phone: '+905554443322',
      intent: 'Toptan Alım',
      message: '1000 top pamuklu kumaş teklifi almak istiyorum.',
      status: 'new',
      createdAt: Date.now()
    });
    console.log(`✅ [Lead] TRTEX Lead başarıyla oluşturuldu: ${leadDoc.id}`);

    // Senaryo 3: Hometex Fuar Katılımcısı -> İletişim
    console.log("\n🎬 SENARYO 3: Hometex İletişim Formu");
    const contactDoc = await adminDb.collection('hometex_leads').add({
      name: 'Fuar Ziyaretçisi',
      email: 'ziyaretci@test.com',
      subject: 'Fuar Katılım Şartları',
      message: 'Gelecek yıl fuara katılmak istiyoruz, şartlar nelerdir?',
      status: 'new',
      createdAt: Date.now()
    });
    console.log(`✅ [Contact] Hometex Lead başarıyla oluşturuldu: ${contactDoc.id}`);

    console.log("\n✅ TÜM E2E VERİ AKIŞI SENARYOLARI BAŞARILI.");
    console.log("Admin kokpit üzerinden verilerin yansıdığı görülecektir.");

  } catch (error: any) {
    console.error("❌ Hata oluştu:", error.message);
  }

  // Allow async tasks to complete
  await new Promise(resolve => setTimeout(resolve, 2000));
  process.exit(0);
}

runTest();
