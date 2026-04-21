import MagazineDetail from '@/components/tenant-hometex/MagazineDetail';
import Link from 'next/link';

export default async function MagazineDetailPage({ params }: { params: Promise<{ domain: string, id: string }> }) {
  const { domain, id } = await params;

  return (
    <div className="min-h-screen bg-black">
      <main>
        <MagazineDetail />
      </main>
    </div>
  );
}
