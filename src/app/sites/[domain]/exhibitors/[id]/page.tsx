import ExhibitorDetail from '@/components/node-hometex/ExhibitorDetail';
import HometexNavbar from '@/components/node-hometex/HometexNavbar';
import { adminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';

export default async function ExhibitorDetailPage({ params }: { params: Promise<{ domain: string, id: string }> }) {
  const { domain, id } = await params;

  let exhibitor = null;
  let products: any[] = [];

  try {
    const exhibitorDoc = await adminDb.collection('hometex_exhibitors').doc(id).get();
    if (exhibitorDoc.exists) {
      exhibitor = { id: exhibitorDoc.id, ...exhibitorDoc.data() };
      
      const productsSnap = await adminDb.collection('hometex_products').where('exhibitorId', '==', id).get();
      products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
      const demoData = await import('@/lib/hometex-demoData');
      exhibitor = demoData.HOMETEX_EXHIBITORS.find(e => e.id === id) || null;
      products = []; // Demo products can be added if needed
    }
  } catch (error) {
    console.error('Error fetching exhibitor detail:', error);
    const demoData = await import('@/lib/hometex-demoData');
    exhibitor = demoData.HOMETEX_EXHIBITORS.find(e => e.id === id) || null;
    products = [];
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
