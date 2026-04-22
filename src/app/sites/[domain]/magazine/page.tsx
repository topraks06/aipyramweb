import HometexNavbar from '@/components/tenant-hometex/HometexNavbar';
import Magazine from '@/components/tenant-hometex/Magazine';

export default async function MagazinePage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <HometexNavbar />

      <main>
        <Magazine />
      </main>
    </div>
  );
}
