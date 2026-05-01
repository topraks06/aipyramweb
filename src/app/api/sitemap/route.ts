import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

const LANGUAGES = ['tr', 'en', 'de', 'ru', 'zh', 'ar', 'es', 'fr'];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const host = request.headers.get('host') || 'trtex.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    // Domain'e göre projeyi belirle
    let projectName = 'trtex';
    if (host.includes('hometex')) projectName = 'hometex';
    if (host.includes('perde')) projectName = 'perde';
    if (host.includes('vorhang')) projectName = 'vorhang';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

    // 1. Ana sayfalar ve Statik Rotalar (Her dil için)
    const staticRoutes = ['', '/news', '/tenders', '/academy', '/trade', '/fairs', '/trends', '/about', '/manufacturers'];
    
    for (const route of staticRoutes) {
      for (const lang of LANGUAGES) {
        const pageUrl = `${baseUrl}${route}?lang=${lang}`;
        xml += `  <url>
    <loc>${pageUrl}</loc>
    <changefreq>${route === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '' ? '1.0' : '0.9'}</priority>
`;
        // hreflang
        for (const altLang of LANGUAGES) {
          const altUrl = `${baseUrl}${route}?lang=${altLang}`;
          xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}" />\n`;
        }
        xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${route}?lang=tr" />\n`;
        xml += `  </url>\n`;
      }
    }

    // 2. Haberler (Eğer varsa)
    try {
      const newsSnap = await adminDb.collection(`${projectName}_news`).where("status", "==", "published").limit(500).get();
      
      newsSnap.docs.forEach(doc => {
        const data = doc.data();
        const slug = data.slug || doc.id;
        const lastMod = data.updatedAt || data.publishedAt || data.createdAt || new Date().toISOString();
        const dateStr = new Date(lastMod).toISOString();

        for (const lang of LANGUAGES) {
          const pageUrl = `${baseUrl}/news/${slug}?lang=${lang}`;
          
          xml += `  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
`;
          for (const altLang of LANGUAGES) {
            const altUrl = `${baseUrl}/news/${slug}?lang=${altLang}`;
            xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}" />\n`;
          }
          xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/news/${slug}?lang=tr" />\n`;
          xml += `  </url>\n`;
        }
      });
    } catch (e) {
      console.warn(`Sitemap: ${projectName}_news okunamadı`, e);
    }

    xml += `</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
