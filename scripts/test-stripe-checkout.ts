import * as dotenv from 'dotenv';
// Load environment variables before any other imports
dotenv.config({ path: '.env.local' });

import { createMarketplaceCheckout } from '../src/services/stripeService';

async function runTest() {
  console.log("🚀 Vorhang Pazar Yeri - Escrow Sipariş Testi Başlıyor...");
  console.log("-----------------------------------------------------");

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("❌ HATA: STRIPE_SECRET_KEY .env.local dosyasında bulunamadı!");
    return;
  }

  console.log("✅ Stripe Secret Key algılandı.");
  
  const mockParams = {
    orderId: `VORHANG-TEST-${Date.now()}`,
    customerEmail: "hakan@aipyram.com",
    lineItems: [
      {
        name: "Lüks Otel Tipi Blackout Perde (5000 Metre)",
        description: "B2B Toptan Sipariş - Escrow Ödemesi",
        amountEur: 5000, // $5000 instead of EUR, but the function uses EUR
        quantity: 1
      }
    ],
    successUrl: "http://localhost:3000/admin?stripe=success",
    cancelUrl: "http://localhost:3000/admin?stripe=cancel"
  };

  try {
    const result = await createMarketplaceCheckout(mockParams);
    if (result) {
      console.log("\n✅ BAŞARILI! Yemeksepeti Modeli (Escrow) Linki Üretildi:");
      console.log("🔗 Session ID:", result.sessionId);
      console.log("🔗 Checkout URL:", result.url);
      console.log("\nBu URL'ye giderek sahte kart bilgileri (4242 4242 4242 4242) ile $5000 ödemesini test edebilirsiniz.");
    } else {
      console.error("\n❌ Başarısız: Stripe Checkout oluşturulamadı.");
    }
  } catch (err: any) {
    console.error("\n❌ Hata oluştu:", err.message);
  }
}

runTest();
