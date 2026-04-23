import HometexNavbar from '@/components/node-hometex/HometexNavbar';
import Magazine from '@/components/node-hometex/Magazine';
import { adminDb } from '@/lib/firebase-admin';

export default async function MagazinePage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  let articles: any[] = [];
  try {
    const articlesSnap = await adminDb.collection('articles').orderBy('publishedAt', 'desc').get();
    articles = articlesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching articles:', error);
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
