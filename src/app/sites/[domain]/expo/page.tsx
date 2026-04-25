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
  } catch (error) {
    console.error('Error fetching data:', error);
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
