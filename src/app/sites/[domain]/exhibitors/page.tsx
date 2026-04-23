import HometexNavbar from '@/components/node-hometex/HometexNavbar';
import Exhibitors from '@/components/node-hometex/Exhibitors';
import { adminDb } from '@/lib/firebase-admin';

export default async function ExhibitorsPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  let exhibitors: any[] = [];
  try {
    const exhibitorsSnap = await adminDb.collection('hometex_exhibitors').get();
    exhibitors = exhibitorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    if (exhibitors.length === 0) {
      const demoData = await import('@/lib/hometex-demoData');
      exhibitors = demoData.HOMETEX_EXHIBITORS;
    }
  } catch (error) {
    console.error('Error fetching exhibitors:', error);
    const demoData = await import('@/lib/hometex-demoData');
    exhibitors = demoData.HOMETEX_EXHIBITORS;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <HometexNavbar />

      <main>
        <Exhibitors exhibitors={exhibitors} />
      </main>
    </div>
  );
}
