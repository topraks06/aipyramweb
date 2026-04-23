import BoothDetail from '@/components/node-hometex/BoothDetail';
import Link from 'next/link';

export default async function BoothDetailPage({ params }: { params: Promise<{ domain: string, boothId: string }> }) {
  const { domain, boothId } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <main>
        <BoothDetail />
      </main>
    </div>
  );
}
