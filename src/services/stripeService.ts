import Stripe from "stripe";

// ═══════════════════════════════════════════════════════════════
// AIPYRAM STRIPE SERVİSİ — Komisyon & Ödeme Altyapısı
// Test Mode → Production geçiş Hakan Bey onayıyla yapılır
// ═══════════════════════════════════════════════════════════════

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn("⚠️ STRIPE_SECRET_KEY eksik. Ödeme sistemi devre dışı.");
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2025-12-18.acacia" as any })
  : null;

// ═══════════════════════════════════════════════════════════════
// KOMİSYON ORANI — Sektöre göre dinamik
// ═══════════════════════════════════════════════════════════════
export const COMMISSION_RATES: Record<string, number> = {
  "ev-tekstili": 0.03,   // %3
  "perde": 0.03,          // %3
  "default": 0.025,       // %2.5
};

export function getCommissionRate(sector: string): number {
  return COMMISSION_RATES[sector] || COMMISSION_RATES["default"];
}

export function calculateCommission(dealValueUSD: number, sector: string): number {
  const rate = getCommissionRate(sector);
  return Math.round(dealValueUSD * rate * 100) / 100; // 2 ondalık
}

// ═══════════════════════════════════════════════════════════════
// STRIPE CHECKOUT — Komisyon ödemesi için ödeme sayfası
// ═══════════════════════════════════════════════════════════════

export interface CreateCheckoutParams {
  dealId: string;
  supplierEmail: string;
  commissionAmountUSD: number;
  description: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PlanCheckoutParams {
  tenantId: string;
  planId: string;
  uid: string;
  customerEmail?: string;
  amountUSD: number;
  isYearly: boolean;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Stripe Checkout Session oluşturur.
 * Tedarikçi komisyonunu ödemesi için bir ödeme sayfası döner.
 */
export async function createCommissionCheckout(
  params: CreateCheckoutParams
): Promise<{ sessionId: string; url: string } | null> {
  if (!stripe) {
    console.error("[STRIPE] Stripe bağlantısı yok. STRIPE_SECRET_KEY kontrol edin.");
    return null;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: params.supplierEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `AIPYRAM Ticaret Komisyonu`,
              description: params.description,
              metadata: {
                dealId: params.dealId,
                platform: "aipyram",
              },
            },
            unit_amount: Math.round(params.commissionAmountUSD * 100), // Cent
          },
          quantity: 1,
        },
      ],
      metadata: {
        dealId: params.dealId,
        platform: "aipyram",
        type: "commission",
      },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });

    console.log(`[STRIPE] Checkout oluşturuldu: ${session.id} — $${params.commissionAmountUSD}`);

    return {
      sessionId: session.id,
      url: session.url || "",
    };
  } catch (error: any) {
    console.error("[STRIPE] Checkout hatası:", error.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// STRIPE MARKETPLACE CHECKOUT — Vorhang.ai vb. için Sepet Ödemesi
// ═══════════════════════════════════════════════════════════════

export interface MarketplaceCheckoutParams {
  orderId: string;
  customerEmail?: string;
  lineItems: {
    name: string;
    description?: string;
    amountEur: number; // Euro (not cents)
    quantity: number;
    images?: string[];
  }[];
  successUrl: string;
  cancelUrl: string;
}

/**
 * Vorhang.ai gibi pazar yerleri için standart sepet ödeme sayfası oluşturur.
 */
export async function createMarketplaceCheckout(
  params: MarketplaceCheckoutParams
): Promise<{ sessionId: string; url: string } | null> {
  if (!stripe) {
    console.error("[STRIPE] Stripe bağlantısı yok. STRIPE_SECRET_KEY kontrol edin.");
    return null;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: params.customerEmail,
      line_items: params.lineItems.map(item => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
            description: item.description,
            images: item.images,
          },
          unit_amount: Math.round(item.amountEur * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      metadata: {
        orderId: params.orderId,
        platform: "vorhang",
        type: "marketplace_order",
      },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });

    console.log(`[STRIPE] Marketplace Checkout oluşturuldu: ${session.id} für Order ${params.orderId}`);

    return {
      sessionId: session.id,
      url: session.url || "",
    };
  } catch (error: any) {
    console.error("[STRIPE] Marketplace Checkout hatası:", error.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// STRIPE PLAN CHECKOUT — Sovereign SaaS Abonelik Ödemeleri
// ═══════════════════════════════════════════════════════════════

export async function createPlanCheckout(
  params: PlanCheckoutParams
): Promise<{ sessionId: string; url: string } | null> {
  if (!stripe) {
    console.error("[STRIPE] Stripe bağlantısı yok. STRIPE_SECRET_KEY kontrol edin.");
    return null;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment", // Tek seferlik kredi yükleme gibi çalışıyor şimdilik
      payment_method_types: ["card"],
      customer_email: params.customerEmail,
      client_reference_id: params.uid,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `AIPyram ${params.planId.toUpperCase()} Plan (${params.isYearly ? 'Yıllık' : 'Aylık'})`,
              description: `${params.tenantId.toUpperCase()} için Sovereign lisans ve kredi.`,
              metadata: {
                tenantId: params.tenantId,
                planId: params.planId,
              },
            },
            unit_amount: Math.round(params.amountUSD * 100), // Cent
          },
          quantity: 1,
        },
      ],
      metadata: {
        tenantId: params.tenantId,
        planId: params.planId,
        type: "plan",
      },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });

    console.log(`[STRIPE] Plan Checkout oluşturuldu: ${session.id} — $${params.amountUSD}`);

    return {
      sessionId: session.id,
      url: session.url || "",
    };
  } catch (error: any) {
    console.error("[STRIPE] Plan Checkout hatası:", error.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// STRIPE WEBHOOK — Ödeme doğrulama (POST /api/stripe/webhook)
// ═══════════════════════════════════════════════════════════════

/**
 * Stripe webhook event'ini doğrular.
 */
export function constructWebhookEvent(
  body: string | Buffer,
  signature: string
): Stripe.Event | null {
  if (!stripe) return null;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[STRIPE] STRIPE_WEBHOOK_SECRET eksik.");
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error("[STRIPE] Webhook doğrulama hatası:", error.message);
    return null;
  }
}

/**
 * Stripe bağlantı kontrolü
 */
export function isStripeReady(): boolean {
  return stripe !== null;
}

export { stripe };
