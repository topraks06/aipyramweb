import { NextRequest, NextResponse } from "next/server";
import { createMarketplaceCheckout } from "@/services/stripeService";
import { getTenant } from "@/lib/tenant-config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, orderId, tenantId = 'vorhang' } = body;

    const config = getTenant(tenantId);
    
    const session = await createMarketplaceCheckout({
      orderId: orderId || `VOR-${Math.floor(1000 + Math.random() * 9000)}-DE`,
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
