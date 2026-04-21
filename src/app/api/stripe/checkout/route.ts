import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getTenant } from "@/lib/tenant-config";
import { admin } from "@/lib/firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-02-24.acacia" // latest valid api version typical for stripe modules, ignore TS error if exact version changes
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { planId, tenantId = 'perde', isYearly } = body;

        // Verify Authentication
        const sessionCookie = req.cookies.get('session');
        let uid = null;
        if (sessionCookie?.value) {
            try {
                const decodedToken = await admin.auth().verifySessionCookie(sessionCookie.value, true);
                uid = decodedToken.uid;
            } catch (authErr) {
               return NextResponse.json({ error: "Oturum geçersiz." }, { status: 401 });
            }
        } else {
            return NextResponse.json({ error: "Giriş yapmanız gerekmektedir." }, { status: 401 });
        }

        const config = getTenant(tenantId);
        
        // Define credit packages
        let amount = 0;
        let credits = 0;
        let name = "Paket";
        
        switch (planId) {
            case 'starter':
                amount = isYearly ? 1590 * 12 : 1990;
                credits = 100;
                name = "Başlangıç Paketi (Starter)";
                break;
            case 'pro':
                amount = isYearly ? 6390 * 12 : 7990;
                credits = 500;
                name = "Profesyonel Paket (Pro)";
                break;
            case 'enterprise':
                amount = isYearly ? 19990 * 12 : 24900;
                credits = 2500;
                name = "Kurumsal Sistem (Enterprise)";
                break;
            default:
                return NextResponse.json({ error: "Geçersiz paket." }, { status: 400 });
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment", // using one-time payment for credits for simplicity
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `${config.shortName} - ${name} (${credits} Kredi)`,
                        },
                        unit_amount: amount, // amount in cents
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                uid: uid,
                tenantId: tenantId,
                credits: credits.toString(),
                planId: planId
            },
            success_url: `https://${config.domain}/studio?payment=success`,
            cancel_url: `https://${config.domain}/pricing?payment=cancelled`,
        });

        return NextResponse.json({ url: session.url });
    } catch (e: any) {
        console.error("Stripe Checkout hatası:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
