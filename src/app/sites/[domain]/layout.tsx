import { ReactNode } from "react";
import { Metadata } from "next";
import PerdeClientWrapper from "@/components/tenant-perde/PerdeClientWrapper";
import { getTenantConfig, getTenantName } from "@/config/tenants";

/**
 * Tenant-aware dynamic metadata.
 * Her tenant için ayrı SEO title, description ve JSON-LD üretir.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const config = getTenantConfig(domain);

  if (!config) {
    return { title: "AIPyram" };
  }

  return {
    title: {
      default: config.seo.title,
      template: `%s | ${config.brand}`,
    },
    description: config.seo.description,
    openGraph: {
      title: config.seo.title,
      description: config.seo.description,
      siteName: config.brand,
      locale: config.locale === "de" ? "de_DE" : config.locale === "tr" ? "tr_TR" : "en_US",
      type: "website",
      ...(config.seo.ogImage && { images: [{ url: config.seo.ogImage, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: config.seo.title,
      description: config.seo.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Tenant-aware JSON-LD structured data.
 */
function TenantJsonLd({ domain }: { domain: string }) {
  const config = getTenantConfig(domain);
  const tenantName = getTenantName(domain);

  if (!config) return null;

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: config.brand,
    url: `https://${Object.keys(require("@/config/tenants").TENANT_CONFIG).find(k => k.includes(tenantName)) || "aipyram.com"}`,
    description: config.seo.description,
    logo: config.seo.ogImage,
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
    name: config.brand,
    url: `https://${Object.keys(require("@/config/tenants").TENANT_CONFIG).find(k => k.includes(tenantName)) || "aipyram.com"}`,
    description: config.seo.description,
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
      <TenantJsonLd domain={exactDomain} />
      {children}
      {exactDomain.includes('perde') && <PerdeClientWrapper />}
    </>
  );
}
