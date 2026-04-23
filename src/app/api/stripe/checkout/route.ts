import { NextResponse } from 'next/server';
import { createMarketplaceCheckout, createCommissionCheckout, createPlanCheckout } from '@/services/stripeService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, payload } = body;

    let checkoutSession;

    if (type === 'commission') {
      checkoutSession = await createCommissionCheckout(payload);
    } else if (type === 'marketplace') {
      checkoutSession = await createMarketplaceCheckout(payload);
    } else if (type === 'plan') {
      const { planId, isYearly, tenantId, uid } = payload;
      
      const planPrices: Record<string, { monthly: number, yearly: number }> = {
        starter: { monthly: 19.90, yearly: 15.90 },
        pro: { monthly: 79.90, yearly: 63.90 },
        enterprise: { monthly: 249.90, yearly: 199.90 }
      };

      const priceSet = planPrices[planId] || planPrices.starter;
      const amountUSD = isYearly ? priceSet.yearly : priceSet.monthly;

      const origin = req.headers.get('origin') || 'http://localhost:3000';
      
      checkoutSession = await createPlanCheckout({
        tenantId,
        planId,
        customerEmail: undefined, // Could add from user later
        amountUSD,
        isYearly,
        successUrl: `${origin}/b2b?payment=success`,
        cancelUrl: `${origin}/pricing?payment=cancelled`
      });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid checkout type' }, { status: 400 });
    }

    if (!checkoutSession) {
      return NextResponse.json({ success: false, error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: checkoutSession.url, sessionId: checkoutSession.sessionId });
  } catch (error: any) {
    console.error('[Stripe Checkout API] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
