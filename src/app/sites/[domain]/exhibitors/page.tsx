import HometexNavbar from '@/components/tenant-hometex/HometexNavbar';
import Exhibitors from '@/components/tenant-hometex/Exhibitors';
import { adminDb } from '@/lib/firebase-admin';

export default async function ExhibitorsPage({ params }: { params: Promise<{ domain: string }> }) {
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
        <Exhibitors exhibitors={exhibitors} />
      </main>
    </div>
  );
}
