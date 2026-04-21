
import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import GlobalClientEffects from "@/components/GlobalClientEffects";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { AipyramAuthProvider } from "@/components/auth/AipyramAuthProvider";
import ConciergeWidget from "@/components/ConciergeWidget";
import PerdeClientWrapper from "@/components/tenant-perde/PerdeClientWrapper";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aipyram GmbH — Sektorale AI-Plattform",
  description: "Schweizer AI-Technologieunternehmen. AI-gestützte digitale Transformationslösungen in 15 Branchenvertikalen. 252+ strategische digitale Assets.",
  keywords: "Aipyram, AI, Künstliche Intelligenz, Schweiz, Technologie, Digitale Transformation, Maschinelles Lernen, Sektorale AI",
  authors: [{ name: "Aipyram GmbH" }],
  creator: "Aipyram GmbH",
  publisher: "Aipyram GmbH",
  metadataBase: new URL("https://aipyram.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://aipyram.com",
    title: "Aipyram GmbH — Sektorale AI-Plattform",
    description: "Schweizer AI-Technologieunternehmen. Unterstützt durch 50+ autonome AI-Agenten in 15 Branchenvertikalen.",
    siteName: "Aipyram GmbH",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Aipyram GmbH — AI-Ökosystem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aipyram GmbH — Sektorale AI-Plattform",
    description: "Schweizer AI-Technologieunternehmen. Unterstützt in 15 Branchenvertikalen.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { headers } = await import("next/headers");
  const headersList = await headers();
  const locale = headersList.get("x-next-intl-locale") || "de";
  const host = headersList.get("host") || "";
  const isPerde = host.includes("perde") || host.includes("perde.localhost");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://aipyram.com/#organization",
        name: "Aipyram GmbH",
        url: "https://aipyram.com",
        logo: {
          "@type": "ImageObject",
          url: "https://aipyram.com/og-image.png",
        },
        description: "Swiss AI technology company. AI-powered digital transformation solutions across 15 industry verticals.",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Heimstrasse 10",
          addressLocality: "Dietikon",
          addressRegion: "Zürich",
          postalCode: "8953",
          addressCountry: "CH",
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            email: "info@aipyram.com",
            telephone: "+41-44-500-82-80",
            contactType: "Corporate Communications",
            areaServed: "CH",
          },
          {
            "@type": "ContactPoint",
            telephone: "+90-555-333-05-11",
            contactType: "Corporate Communications",
            areaServed: "TR",
          },
        ],
        sameAs: [
          "https://linkedin.com/company/aipyram",
        ],
        knowsAbout: [
          "Artificial Intelligence",
          "Machine Learning",
          "Digital Transformation",
          "AI Integration",
          "Sectoral Technology Solutions",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://aipyram.com/#website",
        url: "https://aipyram.com",
        name: "Aipyram GmbH",
        description: "Sectoral AI Ecosystem",
        publisher: {
          "@id": "https://aipyram.com/#organization",
        },
        inLanguage: ["de", "en", "tr"],
        availableLanguage: ["German", "English", "Turkish"],
      },
    ],
  };

  return (
    <html lang={locale} className={`${inter.variable} ${roboto.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#C41E3A" />
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-background text-foreground">
        <AipyramAuthProvider>
          {children}
          {!isPerde && <ConciergeWidget />}
          {isPerde && <PerdeClientWrapper />}
          <Toaster />
          <GlobalClientEffects />
        </AipyramAuthProvider>
      </body>
    </html>
  );
}
