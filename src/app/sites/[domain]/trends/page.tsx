import { redirect } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';

export default async function TrendsPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  
  if (exactDomain.includes('heimtex')) {
    const HeimtexTrends = (await import('@/components/node-heimtex/HeimtexTrends')).default;
    let trends: any[] = [];
    try {
      const trendsSnap = await adminDb.collection('heimtex_trends').get();
      trends = trendsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[HEIMTEX] Trends fetch error:', e);
    }
    return <HeimtexTrends trends={trends} basePath={`/sites/${exactDomain}`} />;
  }

  // Hometex or other nodes shouldn't access this page anymore
  redirect(`/sites/${exactDomain}`);
}
