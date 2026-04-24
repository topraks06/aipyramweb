import { NextRequest, NextResponse } from "next/server";
import { createMarketplaceCheckout } from "@/services/stripeService";
import { getNode } from "@/lib/sovereign-config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, orderId, SovereignNodeId = 'vorhang' } = body;

    const config = getNode(SovereignNodeId);
    
    const session = await createMarketplaceCheckout({
      orderId: orderId || `VOR-${Date.now()}-${crypto.randomUUID().slice(0,4).toUpperCase()}-DE`,
      lineItems: items,
      successUrl: `https://${config.domain}/checkout/success?order_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `https://${config.domain}/checkout?payment=cancelled`,
    });

    if (!session) {
      throw new Error("Stripe oturumu oluşturulamadı.");
    }

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error("Stripe Marketplace Checkout hatası:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
