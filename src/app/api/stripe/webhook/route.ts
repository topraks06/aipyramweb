import { NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/services/stripeService';
import { swarmBus } from '@/lib/agents/EventBus';
import { adminDb } from '@aipyram/firebase';
import { addCredit, PLAN_CREDITS, checkIdempotency, saveIdempotency } from '@aipyram/aloha-sdk';
import { getNode } from '@/lib/sovereign-config';

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ success: false, error: 'Missing stripe-signature' }, { status: 400 });
    }

    const event = constructWebhookEvent(bodyText, signature);
    
    if (!event) {
      return NextResponse.json({ success: false, error: 'Invalid webhook signature' }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session: any = event.data.object;
      const metadata = session.metadata;

      if (metadata) {
        if (metadata.type === 'commission') {
          console.log(`[Stripe Webhook] Commission paid for deal: ${metadata.dealId}`);
          swarmBus.emit('COMMISSION_PAID', { dealId: metadata.dealId });
        } else if (metadata.type === 'marketplace_order') {
          console.log(`[Stripe Webhook] Marketplace order paid: ${metadata.orderId}`);
          swarmBus.emit('VORHANG_ORDER_PAID', { orderId: metadata.orderId });
        } else if (metadata.type === 'plan') {
          const SovereignNodeId = metadata.SovereignNodeId;
          const planId = metadata.planId;
          const uid = session.client_reference_id;

          console.log(`[Stripe Webhook] Plan paid for node: ${SovereignNodeId}, user: ${uid}, plan: ${planId}`);

          if (uid && SovereignNodeId) {
            const idempotencyKey = `stripe_${event.id}`;
            const existing = await checkIdempotency(idempotencyKey);
            
            if (!existing) {
              const credits = PLAN_CREDITS[planId] || PLAN_CREDITS.starter;
              
              // 1. Cüzdana kredi ekle
              await addCredit(SovereignNodeId, uid, credits);
              
              // 2. Kullanıcı lisansını aktif yap ve Tier Yükselt (Faz 8)
              if (adminDb) {
                const SovereignNodeConfig = getNode(SovereignNodeId);
                const memberRef = adminDb.collection(SovereignNodeConfig.memberCollection).doc(uid);
                await memberRef.set({ license: 'active' }, { merge: true });

                // SOVEREIGN TIER UPGRADE
                const userRef = adminDb.collection('sovereign_users').doc(uid);
                const userDoc = await userRef.get();
                if (userDoc.exists) {
                  const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
                  const currentSpend = userDoc.data()?.totalSpend || 0;
                  const newSpend = currentSpend + amountTotal;
                  
                  let newTier = userDoc.data()?.tier || 'free';
                  if (newSpend >= 2000) newTier = 'platinum';
                  else if (newSpend >= 500) newTier = 'gold';
                  else if (newSpend >= 100) newTier = 'silver';
                  else if (newSpend > 0) newTier = 'bronze';

                  await userRef.set({
                    totalSpend: newSpend,
                    tier: newTier,
                    lastPaymentAt: new Date().toISOString()
                  }, { merge: true });
                  console.log(`[Stripe Webhook] User ${uid} upgraded to tier: ${newTier} (Total Spend: $${newSpend})`);
                }
              }

              // 3. Idempotency kaydet
              await saveIdempotency(idempotencyKey, { type: 'plan_activation', SovereignNodeId, uid });
            } else {
               console.log(`[Stripe Webhook] Duplicate webhook engellendi: ${idempotencyKey}`);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook API] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
