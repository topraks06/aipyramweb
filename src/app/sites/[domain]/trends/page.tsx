import HometexNavbar from '@/components/node-hometex/HometexNavbar';
import Trends from '@/components/node-hometex/Trends';
import { adminDb } from '@/lib/firebase-admin';

export default async function TrendsPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  let trends: any[] = [];
  try {
    const trendsSnap = await adminDb.collection('trtex_news')
      .where('category', 'in', ['Trend', 'Tasarım', 'Design', 'Trend Radarı', 'Teknoloji'])
      .limit(6).get();
    
    if (!trendsSnap.empty) {
      trends = trendsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
      // TRTEX news is empty or no trends, use fallback
      const demoData = await import('@/lib/hometex-demoData');
      trends = demoData.HOMETEX_TRENDS;
    }
  } catch (error) {
    console.error('Error fetching TRTEX trends:', error);
    const demoData = await import('@/lib/hometex-demoData');
    trends = demoData.HOMETEX_TRENDS;
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
