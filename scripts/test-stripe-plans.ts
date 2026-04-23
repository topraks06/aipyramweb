import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createPlanCheckout } from '../src/services/stripeService';

async function runTest() {
  console.log("🚀 Stripe Abonelik Planları Testi Başlıyor...");
  console.log("-----------------------------------------------------");

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("❌ HATA: STRIPE_SECRET_KEY .env.local dosyasında bulunamadı!");
    return;
  }

  const plans = [
    { id: 'starter', name: 'Keşfet Planı', amountUSD: 19.90 },
    { id: 'pro', name: 'Pro Planı', amountUSD: 79.90 },
    { id: 'enterprise', name: 'Enterprise Planı', amountUSD: 249.90 }
  ];

  for (const plan of plans) {
    try {
      console.log(`\n📦 ${plan.name} (${plan.id}) test ediliyor...`);
      const result = await createPlanCheckout({
        SovereignNodeId: 'perde_ai',
        uid: 'test_user_123',
        planId: plan.id,
        customerEmail: 'test@aipyram.com',
        amountUSD: plan.amountUSD,
        isYearly: false,
        successUrl: "http://localhost:3000/b2b?payment=success",
        cancelUrl: "http://localhost:3000/pricing?payment=cancelled"
      });

      if (result) {
        console.log(`✅ BAŞARILI! Session ID: ${result.sessionId}`);
        console.log(`🔗 Checkout URL: ${result.url}`);
      } else {
        console.error(`❌ Başarısız: Checkout oluşturulamadı.`);
      }
    } catch (err: any) {
      console.error(`❌ Hata oluştu:`, err.message);
    }
  }
}

runTest();
