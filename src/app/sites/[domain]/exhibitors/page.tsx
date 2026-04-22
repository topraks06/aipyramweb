import HometexNavbar from '@/components/tenant-hometex/HometexNavbar';
import Exhibitors from '@/components/tenant-hometex/Exhibitors';

export default async function ExhibitorsPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <HometexNavbar />

      <main>
        <Exhibitors />
      </main>
    </div>
  );
}
