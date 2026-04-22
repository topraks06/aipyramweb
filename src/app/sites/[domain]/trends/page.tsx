import HometexNavbar from '@/components/tenant-hometex/HometexNavbar';
import Trends from '@/components/tenant-hometex/Trends';

export default async function TrendsPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <HometexNavbar />

      <main>
        <Trends />
      </main>
    </div>
  );
}
