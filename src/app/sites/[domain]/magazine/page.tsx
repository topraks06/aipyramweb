import { redirect } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';

export default async function MagazinePage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  
  if (exactDomain.includes('heimtex')) {
    const HeimtexMagazine = (await import('@/components/node-heimtex/HeimtexMagazine')).default;
    let articles: any[] = [];
    try {
      const articlesSnap = await adminDb.collection('heimtex_articles').orderBy('publishedAt', 'desc').get();
      articles = articlesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[HEIMTEX] Magazine fetch error:', e);
    }
    return <HeimtexMagazine articles={articles} basePath={`/sites/${exactDomain}`} />;
  }

  if (exactDomain.includes('hometex')) {
    const HometexMagazine = (await import('@/components/node-hometex/HometexMagazine')).default;
    let articles: any[] = [];
    try {
      const articlesSnap = await adminDb.collection('hometex_magazine').orderBy('publishedAt', 'desc').get();
      articles = articlesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[HOMETEX] Magazine fetch error:', e);
    }
    return <HometexMagazine articles={articles} basePath={`/sites/${exactDomain}`} />;
  }

  // Other nodes shouldn't access this page anymore
  redirect(`/sites/${exactDomain}`);
}
