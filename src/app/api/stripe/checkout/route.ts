import { NextResponse } from 'next/server';
import { createMarketplaceCheckout, createCommissionCheckout } from '@/services/stripeService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, payload } = body;

    let checkoutSession;

    if (type === 'commission') {
      checkoutSession = await createCommissionCheckout(payload);
    } else if (type === 'marketplace') {
      checkoutSession = await createMarketplaceCheckout(payload);
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
