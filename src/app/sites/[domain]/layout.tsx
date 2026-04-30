
import { ReactNode } from "react";
import { Metadata } from "next";
import { resolveNodeFromDomain as getNodeConfig } from "@/lib/sovereign-config";

/**
 * Node-aware dynamic metadata.
 * Her node için ayrı SEO title, description ve JSON-LD üretir.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const config = getNodeConfig(domain);

  if (!config) {
    return { title: "aipyram" };
  }

  return {
    title: {
      default: config.name,
      template: `%s | ${config.name}`,
    },
    description: config.name + " B2B Intelligence",
    openGraph: {
      title: config.name,
      description: config.name + " B2B Intelligence",
      siteName: config.name,
      locale: config.locale === "de" ? "de_DE" : config.locale === "tr" ? "tr_TR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: config.name,
      description: config.name + " B2B Intelligence",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Node-aware JSON-LD structured data.
 */
function NodeJsonLd({ domain }: { domain: string }) {
  const config = getNodeConfig(domain);
  const nodeName = config?.shortName || "aipyram";

  if (!config) return null;

  // Organization Schema
  const siteUrl = `https://${Object.keys(require("@/lib/sovereign-config").SOVEREIGN_NODES).find(k => k.includes(nodeName.toLowerCase())) || "aipyram.com"}`;
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: config.name,
    url: siteUrl,
    description: `${config.name} — AI-powered B2B intelligence terminal for the global curtain, home textile and upholstery industry. Real-time tenders, market analysis, and trade matchmaking.`,
    logo: `${siteUrl}/assets/logo.png`,
    sameAs: [],
    parentOrganization: {
      "@type": "Organization",
      name: "AIPyram Technologies",
      url: "https://aipyram.com",
    },
    knowsAbout: ["Home Textile", "Curtain Fabric", "Upholstery", "B2B Trade Intelligence", "Textile Tenders"],
  };

  // WebSite Schema with SearchAction (Google Sitelinks Search Box)
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.name,
    url: siteUrl,
    description: `${config.name} — B2B Intelligence Terminal for the global home textile industry.`,
    inLanguage: config.locale,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/haberler?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}

import PerdeClientWrapper from "@/components/node-perde/PerdeClientWrapper";
import IcmimarClientWrapper from "@/components/node-icmimar/IcmimarClientWrapper";
import ConciergeWidget from "@/components/ConciergeWidget";

export default async function DomainLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const resolvedParams = await params;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  
  const isPerde = exactDomain.includes("perde");
  const isIcmimar = exactDomain.includes("icmimar");
  const isTrtex = exactDomain.includes("trtex");

  return (
    <>
      <NodeJsonLd domain={exactDomain} />
      {children}
      {!isPerde && !isIcmimar && !isTrtex && <ConciergeWidget />}
      {isPerde && <PerdeClientWrapper />}
      {isIcmimar && <IcmimarClientWrapper />}
    </>
  );
}
