import HometexNavbar from '@/components/node-hometex/HometexNavbar';
import Trends from '@/components/node-hometex/Trends';

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
