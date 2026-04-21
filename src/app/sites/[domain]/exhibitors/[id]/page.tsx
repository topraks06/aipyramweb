import ExhibitorDetail from '@/components/tenant-hometex/ExhibitorDetail';
import Link from 'next/link';

export default async function ExhibitorDetailPage({ params }: { params: Promise<{ domain: string, id: string }> }) {
  const { domain, id } = await params;

  return (
    <div className="min-h-screen bg-black">
      <main>
        <ExhibitorDetail />
      </main>
    </div>
  );
}
