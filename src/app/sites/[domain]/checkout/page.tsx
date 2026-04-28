import React from "react";
import { MarketplaceCheckout } from "@/components/node-perde/marketplace/MarketplaceCheckout";
import { CheckoutPage as VorhangCheckout } from "@/components/node-vorhang/CheckoutPage";

export const dynamic = "force-dynamic";

export default function CheckoutRouter({ params }: { params: { domain: string } }) {
  const domain = params.domain;
  
  if (domain === 'perde.ai') {
    return <MarketplaceCheckout basePath={`/sites/${domain}`} />;
  }

  if (domain === 'vorhang.ai') {
    return <VorhangCheckout />;
  }

  return <div>404 Not Found</div>;
}
