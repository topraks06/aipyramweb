import MagazineDetail from '@/components/node-hometex/MagazineDetail';
import HometexNavbar from '@/components/node-hometex/HometexNavbar';
import { adminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';

export default async function MagazineDetailPage({ params }: { params: Promise<{ domain: string, id: string }> }) {
  const { domain, id } = await params;

  let article = null;

  try {
    const articleDoc = await adminDb.collection('hometex_articles').doc(id).get();
    if (articleDoc.exists) {
      article = { id: articleDoc.id, ...articleDoc.data() };
    } else {
      const demoData = await import('@/lib/hometex-demoData');
      article = demoData.HOMETEX_MAGAZINE_ARTICLES.find(a => a.id === id) || null;
    }
  } catch (error) {
    console.error('Error fetching article detail:', error);
    const demoData = await import('@/lib/hometex-demoData');
    article = demoData.HOMETEX_MAGAZINE_ARTICLES.find(a => a.id === id) || null;
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
