import HometexNavbar from '@/components/tenant-hometex/HometexNavbar';
import Expo from '@/components/tenant-hometex/Expo';
import { adminDb } from '@/lib/firebase-admin';

export default async function ExpoPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  
  let exhibitors = [];
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
