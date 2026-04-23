import { NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/services/stripeService';
import { swarmBus } from '@/lib/agents/EventBus';

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
        }
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook API] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
