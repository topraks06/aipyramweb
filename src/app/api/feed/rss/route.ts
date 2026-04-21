import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get('lang') || 'en';
    const project = searchParams.get('project') || 'trtex';

    // Firestore'dan son 30 yayındaki haberi çek
    const newsSnap = await adminDb.collection(`${project}_news`)
      .where("status", "==", "published")
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();

    const articles = newsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const rssItems = articles.map((article: any) => {
      // Dil destegi:
      const translatedTitle = article.translations?.[lang.toUpperCase()]?.title || article.title;
      const translatedSummary = article.translations?.[lang.toUpperCase()]?.summary || article.commercial_note || article.title;
      
      return `
        <item>
          <title><![CDATA[${translatedTitle}]]></title>
          <link>https://${project}.com/sites/${project}.com/news/${article.slug || article.id}?lang=${lang}</link>
          <description><![CDATA[${translatedSummary}]]></description>
          <pubDate>${new Date(article.createdAt || Date.now()).toUTCString()}</pubDate>
          <guid>https://${project}.com/sites/${project}.com/news/${article.slug || article.id}?lang=${lang}</guid>
        </item>
      `;
    }).join('');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
        <channel>
          <title>${project.toUpperCase()} B2B Intelligence Feed (${lang.toUpperCase()})</title>
          <link>https://${project}.com</link>
          <description>Global Textile Intelligence, Tenders and Trade Opportunities</description>
          <language>${lang}</language>
          <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
          ${rssItems}
        </channel>
      </rss>`;

    return new NextResponse(rssFeed, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  } catch (error) {
    console.error('[RSS FEED ERROR]', error);
    return new NextResponse('<error>Internal Server Error</error>', { status: 500, headers: { 'Content-Type': 'application/xml' } });
  }
}
