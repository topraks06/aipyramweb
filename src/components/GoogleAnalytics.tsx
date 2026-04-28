/**
 * ═══════════════════════════════════════════════════════
 * aipyram MULTI-NODE GA4 ANALYTICS
 * ═══════════════════════════════════════════════════════
 * 
 * Merkezi izleme bileşeni — tüm node siteleri otomatik tanır.
 * 
 * Kullanım:
 *   <GoogleAnalytics />   (root layout'a bir kez ekle, gerisini halleder)
 * 
 * ENV:
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 * 
 * Mimari:
 *   - Node hostname otomatik detect edilir
 *   - Cross-domain tracking tüm aipyram domainleri arası aktif
 *   - Tek GA4 mülkü, node_id ile filtreleme
 */
'use client';

import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

// aipyram ekosistem domainleri (yeni node eklenince buraya ekle)
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

            // Node otomatik tespit
            var currentNode = window.location.hostname;

            gtag('config', '${GA_MEASUREMENT_ID}', {
              send_page_view: true,
              site_speed_sample_rate: 100,
              user_properties: {
                node_id: currentNode,
                ecosystem: 'aipyram'
              },
              linker: {
                domains: ${JSON.stringify(ECOSYSTEM_DOMAINS)},
                accept_incoming: true
              }
            });

            // aipyram Merkezi Olay Takip Fonksiyonu
            window.trackNodeEvent = function(eventName, params) {
              gtag('event', eventName, Object.assign({
                event_category: 'Node_Action',
                node_source: currentNode,
                ecosystem: 'aipyram'
              }, params || {}));
            };
          `,
        }}
      />
    </>
  );
}
