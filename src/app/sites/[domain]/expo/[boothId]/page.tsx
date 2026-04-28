import BoothDetail from '@/components/node-hometex/BoothDetail';
import { adminDb } from '@/lib/firebase-admin';

export default async function BoothDetailPage({ params }: { params: Promise<{ domain: string, boothId: string }> }) {
  const { boothId } = await params;

  let exhibitor = null;
  let collections = [];

  try {
    const docSnap = await adminDb.collection('hometex_exhibitors').doc(boothId).get();
    if (docSnap.exists) {
      exhibitor = { id: docSnap.id, ...docSnap.data() };
      collections = exhibitor.collections || [];
    }
  } catch (error) {
    console.error('[BoothDetailPage] Error fetching exhibitor:', error);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main>
        <BoothDetail exhibitor={exhibitor} collections={collections} />
      </main>
    </div>
  );
}
