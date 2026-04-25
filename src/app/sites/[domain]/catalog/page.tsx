import Catalog from '@/components/node-perde/Catalog';
import PerdeNavbar from '@/components/node-perde/PerdeNavbar';
import B2BGatekeeper from '@/components/auth/B2BGatekeeper';

export const dynamic = "force-dynamic";

export default async function CatalogPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  return (
    <B2BGatekeeper>
      <div className="min-h-screen bg-black">
        <PerdeNavbar theme="light" />

      <main className="pt-24">
        <Catalog />
        </main>
      </div>
    </B2BGatekeeper>
  );
}
