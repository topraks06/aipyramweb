import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  // 🔴 KRİTİK: firebase-admin native Node modülleri (grpc, protobuf) Webpack bundling'de bozuluyor.
  // Bu satır olmadan .collection().limit() gibi chain method'lar tree-shaking ile siliniyor.
  serverExternalPackages: ['firebase-admin', '@google-cloud/firestore'],
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400",
          },
        ],
      },
      // ANAYASA: Zero-Cache — Tenant (Dumb Client) sayfaları asla cache'lenmez
      {
        source: "/sites/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Surrogate-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      // SEO Localized Routes (TR)
      { source: '/sites/:domain/haberler', destination: '/sites/:domain/news?lang=tr' },
      { source: '/sites/:domain/haberler/:slug*', destination: '/sites/:domain/news/:slug*?lang=tr' },
      { source: '/sites/:domain/ihaleler', destination: '/sites/:domain/tenders?lang=tr' },
      { source: '/sites/:domain/akademi', destination: '/sites/:domain/academy?lang=tr' },
      { source: '/sites/:domain/fuar-takvimi', destination: '/sites/:domain/fairs?lang=tr' },
      { source: '/sites/:domain/koleksiyonlar', destination: '/sites/:domain/collections?lang=tr' },
      { source: '/sites/:domain/hakkimizda', destination: '/sites/:domain/about?lang=tr' },
      { source: '/sites/:domain/ticaret', destination: '/sites/:domain/trade?lang=tr' },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: "storage.googleapis.com",
      },
      {
        hostname: "images.unsplash.com",
      },
      {
        hostname: "*.firebasestorage.app",
      },
      {
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Prevent server crashes due to continuous Fast Refresh triggers
      // when our API routes write to local log files.
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/logs/**', '**/*.log', '**/.aloha_memory.md', '**/node_modules/**'],
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
