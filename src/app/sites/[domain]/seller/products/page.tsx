import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SellerProductsPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const basePath = `/sites/${exactDomain}`;

  if (exactDomain.includes('perde')) {
    const MarketplaceProductManager = (await import("@/components/node-perde/marketplace/MarketplaceProductManager")).default;
    return <MarketplaceProductManager basePath={basePath} />;
  }

  // Vorhang için ayrı bir Product Manager sayfası eklenebilir. Şu an sadece Perde destekleniyor.
  return notFound();
}
