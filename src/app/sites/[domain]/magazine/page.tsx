import HometexNavbar from '@/components/node-hometex/HometexNavbar';
import Magazine from '@/components/node-hometex/Magazine';
import { adminDb } from '@/lib/firebase-admin';

export default async function MagazinePage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  
  if (exactDomain.includes('heimtex')) {
    const HeimtexMagazine = (await import('@/components/node-heimtex/HeimtexMagazine')).default;
    return <HeimtexMagazine />;
  }

  let articles: any[] = [];
  try {
    const articlesSnap = await adminDb.collection('hometex_magazine').orderBy('publishedAt', 'desc').get();
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
