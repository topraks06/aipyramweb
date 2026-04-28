import React from "react";
import PerdeNavbar from "@/components/node-perde/PerdeNavbar";
import PerdeFooter from "@/components/node-perde/PerdeFooter";
import MarketplaceProductGrid from "@/components/node-perde/marketplace/MarketplaceProductGrid";

export const dynamic = "force-dynamic";

export default async function PerdeCollectionsPage({ params }: { params: { domain: string } }) {
  const domain = params.domain;
  
  // Sadece perde.ai'de çalışsın
  if (domain !== 'perde.ai') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        404 Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-zinc-900 flex flex-col font-sans selection:bg-[#8B7355] selection:text-white">
      <PerdeNavbar theme="light" />
      
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow w-full">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[1px] w-8 bg-[#8B7355]"></div>
            <span className="text-[#8B7355] uppercase tracking-[0.3em] text-[10px] font-semibold">TÜRKİYE'NİN EV TEKSTİLİ MAĞAZASI</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif mb-4 text-zinc-900 tracking-tight">Özel Koleksiyonlar</h1>
          <p className="text-zinc-500 text-base md:text-lg max-w-2xl font-light">
            Yapay zeka ile evinizde deneyebileceğiniz perde, döşemelik ve ev tekstili ürünlerini keşfedin.
          </p>
        </div>

        <MarketplaceProductGrid basePath={`/sites/${domain}`} />
      </main>

      <PerdeFooter />
    </div>
  );
}
