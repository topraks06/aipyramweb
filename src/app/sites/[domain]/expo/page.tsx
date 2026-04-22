import HometexNavbar from '@/components/tenant-hometex/HometexNavbar';
import Expo from '@/components/tenant-hometex/Expo';

export default async function ExpoPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  return (
    <div className="min-h-screen bg-black text-white">
      <HometexNavbar />

      <main>
        <Expo />
      </main>
    </div>
  );
}
