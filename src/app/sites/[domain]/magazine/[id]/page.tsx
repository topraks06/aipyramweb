import MagazineDetail from '@/components/tenant-hometex/MagazineDetail';
import HometexNavbar from '@/components/tenant-hometex/HometexNavbar';
import { adminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';

export default async function MagazineDetailPage({ params }: { params: Promise<{ domain: string, id: string }> }) {
  const { domain, id } = await params;

  let article = null;

  try {
    const articleDoc = await adminDb.collection('articles').doc(id).get();
    if (articleDoc.exists) {
      article = { id: articleDoc.id, ...articleDoc.data() };
    }
  } catch (error) {
    console.error('Error fetching article detail:', error);
  }

  if (!article) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      <HometexNavbar />
      <main>
        <MagazineDetail article={article} />
      </main>
    </div>
  );
}
