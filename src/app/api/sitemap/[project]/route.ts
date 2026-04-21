import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 saat önbellek

export async function GET(
  req: Request,
  { params }: { params: Promise<{ project: string }> }
) {
  const resolvedParams = await params;
  const project = resolvedParams.project || 'trtex'; // trtex, hometex, perde
  
  try {
    // Tüm yayınlanmış haberleri çek
    const snapshot = await adminDb.collection(`${project}_news`)
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .get();
      
    const baseUrl = req.headers.get('host')?.includes('localhost') 
      ? `http://${req.headers.get('host')}` 
      : `https://${project}.com`;

    // Ana Sayfa statik URL'i
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
`;

    // Haberler için dinamik URL'ler
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const slug = data.slug || doc.id;
      // Timestamp fallback
      const lastModDate = data.updatedAt || data.publishedAt || data.createdAt || new Date().toISOString(); 
      let formattedDate = '';
      try {
        formattedDate = new Date(lastModDate).toISOString();
      } catch (e) {
        formattedDate = new Date().toISOString();
      }

      xml += `  <url>
    <loc>${baseUrl}/news/${slug}</loc>
    <lastmod>${formattedDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    });

    xml += `</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });

  } catch (error) {
    console.error(`[SITEMAP ERROR] ${project}:`, error);
    return NextResponse.json({ error: 'Sitemap generation failed' }, { status: 500 });
  }
}
