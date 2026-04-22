import ExhibitorDetail from '@/components/tenant-hometex/ExhibitorDetail';
import HometexNavbar from '@/components/tenant-hometex/HometexNavbar';
import { adminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';

export default async function ExhibitorDetailPage({ params }: { params: Promise<{ domain: string, id: string }> }) {
  const { domain, id } = await params;

  let exhibitor = null;
  let products = [];

  try {
    const exhibitorDoc = await adminDb.collection('exhibitors').doc(id).get();
    if (exhibitorDoc.exists) {
      exhibitor = { id: exhibitorDoc.id, ...exhibitorDoc.data() };
      
      const productsSnap = await adminDb.collection('products').where('exhibitorId', '==', id).get();
      products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (error) {
    console.error('Error fetching exhibitor detail:', error);
  }

  if (!exhibitor) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      <HometexNavbar />
      <main>
        <ExhibitorDetail exhibitor={exhibitor} products={products} />
      </main>
    </div>
  );
}
