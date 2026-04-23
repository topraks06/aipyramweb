import HometexNavbar from '@/components/node-hometex/HometexNavbar';
import Magazine from '@/components/node-hometex/Magazine';
import { adminDb } from '@/lib/firebase-admin';

export default async function MagazinePage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  let articles: any[] = [];
  try {
    const articlesSnap = await adminDb.collection('hometex_articles').orderBy('publishedAt', 'desc').get();
    articles = articlesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    if (articles.length === 0) {
      const demoData = await import('@/lib/hometex-demoData');
      articles = demoData.HOMETEX_MAGAZINE_ARTICLES;
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
    const demoData = await import('@/lib/hometex-demoData');
    articles = demoData.HOMETEX_MAGAZINE_ARTICLES;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <HometexNavbar />

      <main>
        <Magazine articles={articles} />
      </main>
    </div>
  );
}
