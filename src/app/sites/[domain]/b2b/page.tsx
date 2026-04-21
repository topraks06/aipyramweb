import B2B from '@/components/tenant-perde/B2B';
import PerdeNavbar from '@/components/tenant-perde/PerdeNavbar';
import B2BGatekeeper from '@/components/auth/B2BGatekeeper';

export default async function B2BPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  return (
    <B2BGatekeeper>
      <div className="min-h-screen bg-[#F9F9F6]">
        <PerdeNavbar theme="light" />

      <main className="pt-24">
        <B2B />
        </main>
      </div>
    </B2BGatekeeper>
  );
}
