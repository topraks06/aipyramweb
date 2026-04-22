import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import { getTenant } from "@/lib/tenant-config";
import { EventBus } from "@/core/events/eventBus";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-02-24.acacia"
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
    try {
        const payload = await req.text();
        const signature = req.headers.get("stripe-signature") || "";

        let event;
        try {
            event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (err: any) {
            console.error(`[Stripe Webhook] Error: ${err.message}`);
            // In dev environment or mock testing without signature bypass
            if (process.env.NODE_ENV === 'development' || !webhookSecret) {
               event = JSON.parse(payload);
               console.warn("[Stripe Webhook] Running in dev mode, skipping signature validation.");
            } else {
               return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
            }
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const uid = session.metadata?.uid;
            const tenantId = session.metadata?.tenantId;
            const creditsToAdd = parseInt(session.metadata?.credits || "0", 10);
            const planId = session.metadata?.planId;

            if (uid && tenantId && creditsToAdd > 0) {
                const config = getTenant(tenantId);
                if (config.walletCollection) {
                    const walletRef = adminDb.collection(config.walletCollection).doc(uid);
                    await adminDb.runTransaction(async (transaction) => {
                         const doc = await transaction.get(walletRef);
                         if (!doc.exists) {
                             // Should not happen as we init on login, but fallback:
                             transaction.set(walletRef, {
                                 ownerId: uid, tenant: tenantId,
                                 agentCredits: creditsToAdd, renderCredits: 0,
                                 totalSpent: session.amount_total || 0,
                                 tier: planId,
                                 createdAt: new Date().toISOString(),
                                 lastRefillAt: new Date().toISOString()
                             });
                         } else {
                             const data = doc.data();
                             const currentCredits = data?.agentCredits || data?.renderCredits || 0;
                             transaction.update(walletRef, {
                                 agentCredits: currentCredits + creditsToAdd,
                                 totalSpent: (data?.totalSpent || 0) + (session.amount_total || 0),
                                 tier: planId,
                                 lastRefillAt: new Date().toISOString()
                             });
                        }
                    });
                    console.log(`[Stripe Webhook] ${uid} kullanıcısına ${creditsToAdd} kredi eklendi.`);
                }
            } else if (session.metadata?.type === "marketplace_order") {
                const orderId = session.metadata?.orderId;
                if (orderId) {
                    await adminDb.collection("vorhang_orders").doc(orderId).update({
                        status: 'paid',
                        paymentIntentId: session.payment_intent as string,
                        updatedAt: new Date(),
                    });
                    console.log(`[Stripe Webhook] Marketplace siparişi onaylandı: ${orderId}`);
                    
                    // Sinyali yayınla (EventBus)
                    await EventBus.emit({
                        type: "VORHANG_ORDER_PAID",
                        source: "stripe_webhook",
                        tenant_id: "vorhang.ai",
                        payload: {
                            orderId,
                            totalEur: session.amount_total ? session.amount_total / 100 : 0,
                            vendorId: "AIPyram Sovereign Network"
                        }
                    });
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (e: any) {
        console.error("[Stripe Webhook] Critical Error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
