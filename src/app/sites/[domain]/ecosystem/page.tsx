import Ecosystem from '@/components/tenant-perde/Ecosystem';
import PerdeNavbar from '@/components/tenant-perde/PerdeNavbar';
import B2BGatekeeper from '@/components/auth/B2BGatekeeper';

export default async function EcosystemPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  return (
    <B2BGatekeeper>
      <div className="min-h-screen bg-black">
        <PerdeNavbar theme="light" />

      <main>
        <Ecosystem />
        </main>
      </div>
    </B2BGatekeeper>
  );
}
