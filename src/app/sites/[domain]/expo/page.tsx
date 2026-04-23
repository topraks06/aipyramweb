import HometexNavbar from '@/components/node-hometex/HometexNavbar';
import Expo from '@/components/node-hometex/Expo';
import { adminDb } from '@/lib/firebase-admin';

export default async function ExpoPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  
  let exhibitors: any[] = [];
  try {
    const exhibitorsSnap = await adminDb.collection('exhibitors').get();
    exhibitors = exhibitorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching exhibitors:', error);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <HometexNavbar />

      <main>
        <Expo exhibitors={exhibitors} />
      </main>
    </div>
  );
}
