import { Schema, Type } from "@google/genai";
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
    return { title: "AIPyram" };
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
  const nodeName = config?.shortName || "AIPyram";

  if (!config) return null;

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: config.name,
    url: `https://${Object.keys(require("@/lib/sovereign-config").SOVEREIGN_NODES).find(k => k.includes(nodeName.toLowerCase())) || "aipyram.com"}`,
    description: config.name + " B2B Intelligence",
    logo: "",
    parentOrganization: {
      "@type": "Organization",
      name: "AIPyram Technologies",
      url: "https://aipyram.com",
    },
  };

  // WebSite Schema with SearchAction
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.name,
    url: `https://${Object.keys(require("@/lib/sovereign-config").SOVEREIGN_NODES).find(k => k.includes(nodeName.toLowerCase())) || "aipyram.com"}`,
    description: config.name + " B2B Intelligence",
    inLanguage: config.locale,
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

export default async function DomainLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const resolvedParams = await params;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  
  return (
    <>
      <NodeJsonLd domain={exactDomain} />
      {children}
    </>
  );
}
