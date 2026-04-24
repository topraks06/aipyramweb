import HometexNavbar from '@/components/node-hometex/HometexNavbar';
import Expo from '@/components/node-hometex/Expo';
import { adminDb } from '@/lib/firebase-admin';

export default async function ExpoPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  
  let exhibitors: any[] = [];
  let halls: any[] = [];
  try {
    const exhibitorsSnap = await adminDb.collection('hometex_exhibitors').get();
    const hallsSnap = await adminDb.collection('hometex_halls').get();
    exhibitors = exhibitorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    halls = hallsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    if (exhibitors.length === 0 || halls.length === 0) {
      const demoData = await import('@/lib/hometex-demoData');
      if (exhibitors.length === 0) exhibitors = demoData.HOMETEX_EXHIBITORS;
      if (halls.length === 0) halls = demoData.HOMETEX_HALLS;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    const demoData = await import('@/lib/hometex-demoData');
    exhibitors = demoData.HOMETEX_EXHIBITORS;
    halls = demoData.HOMETEX_HALLS;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <HometexNavbar />

      <main>
        <Expo exhibitors={exhibitors} halls={halls} />
      </main>
    </div>
  );
}
