/**
 * ═══════════════════════════════════════════════════════
 * AIPYRAM MULTI-TENANT GA4 ANALYTICS
 * ═══════════════════════════════════════════════════════
 * 
 * Merkezi izleme bileşeni — tüm tenant siteleri otomatik tanır.
 * 
 * Kullanım:
 *   <GoogleAnalytics />   (root layout'a bir kez ekle, gerisini halleder)
 * 
 * ENV:
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 * 
 * Mimari:
 *   - Tenant hostname otomatik detect edilir
 *   - Cross-domain tracking tüm AIPYRAM domainleri arası aktif
 *   - Tek GA4 mülkü, tenant_id ile filtreleme
 */
'use client';

import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

// AIPYRAM ekosistem domainleri (yeni tenant eklenince buraya ekle)
const ECOSYSTEM_DOMAINS = [
  'trtex.com',
  'perde.ai',
  'hometex.ai',
  'dedimemlak.ai',
  'aipyram.com',
];

export default function GoogleAnalytics() {
  // GA ID yoksa hiçbir şey render etme
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="aipyram-ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // Tenant otomatik tespit
            var currentTenant = window.location.hostname;

            gtag('config', '${GA_MEASUREMENT_ID}', {
              send_page_view: true,
              site_speed_sample_rate: 100,
              user_properties: {
                tenant_id: currentTenant,
                ecosystem: 'AIPYRAM'
              },
              linker: {
                domains: ${JSON.stringify(ECOSYSTEM_DOMAINS)},
                accept_incoming: true
              }
            });

            // AIPYRAM Merkezi Olay Takip Fonksiyonu
            window.trackTenantEvent = function(eventName, params) {
              gtag('event', eventName, Object.assign({
                event_category: 'Tenant_Action',
                tenant_source: currentTenant,
                ecosystem: 'AIPYRAM'
              }, params || {}));
            };
          `,
        }}
      />
    </>
  );
}
