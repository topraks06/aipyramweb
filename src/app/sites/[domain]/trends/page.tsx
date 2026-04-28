import HometexNavbar from '@/components/node-hometex/HometexNavbar';
import Trends from '@/components/node-hometex/Trends';
import { adminDb } from '@/lib/firebase-admin';

export default async function TrendsPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  
  if (exactDomain.includes('heimtex')) {
    const HeimtexTrends = (await import('@/components/node-heimtex/HeimtexTrends')).default;
    return <HeimtexTrends />;
  }

  let trends: any[] = [];
  try {
    const trendsSnap = await adminDb.collection('trtex_news')
      .where('category', 'in', ['Trend', 'Tasarım', 'Design', 'Trend Radarı', 'Teknoloji'])
      .limit(6).get();
    
    if (!trendsSnap.empty) {
      trends = trendsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (error) {
    console.error('Error fetching TRTEX trends:', error);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <HometexNavbar />

      <main>
        <Trends trends={trends} />
      </main>
    </div>
  );
}
