import React from "react";
import { MarketplaceCart } from "@/components/node-perde/marketplace/MarketplaceCart";
// Vorhang doesn't have a dedicated cart page right now, it uses CartSidebar
import PerdeNavbar from "@/components/node-perde/PerdeNavbar";
import PerdeFooter from "@/components/node-perde/PerdeFooter";

export const dynamic = "force-dynamic";

export default function CartRouter({ params }: { params: { domain: string } }) {
  const domain = params.domain;
  
  if (domain === 'perde.ai') {
    return (
      <div className="min-h-screen bg-[#F9F9F6] text-zinc-900 flex flex-col font-sans">
        <PerdeNavbar theme="light" />
        <main className="pt-24 pb-16 flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-serif mb-4">Sepetiniz</h1>
            <p className="text-zinc-500 mb-8">Alışverişinize devam etmek için sağ üstteki sepet ikonunu kullanabilirsiniz.</p>
            {/* The actual cart is a sidebar, so we just render a placeholder page */}
          </div>
        </main>
        <PerdeFooter />
        <MarketplaceCart basePath={`/sites/${domain}`} />
      </div>
    );
  }

  return <div>404 Not Found</div>;
}
