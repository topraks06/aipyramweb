import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SellerRegisterPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const basePath = `/sites/${exactDomain}`;

  if (exactDomain.includes('vorhang')) {
    const VorhangSellerOnboarding = (await import("@/components/node-vorhang/SellerOnboarding")).default;
    return <VorhangSellerOnboarding basePath={basePath} />;
  } else if (exactDomain.includes('perde')) {
    const MarketplaceSellerOnboarding = (await import("@/components/node-perde/marketplace/MarketplaceSellerOnboarding")).default;
    return <MarketplaceSellerOnboarding basePath={basePath} />;
  }

  return notFound();
}
