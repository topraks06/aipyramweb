import Catalog from '@/components/tenant-perde/Catalog';
import PerdeNavbar from '@/components/tenant-perde/PerdeNavbar';
import B2BGatekeeper from '@/components/auth/B2BGatekeeper';

import GlobalCatalog from '@/components/hometex/catalog/GlobalCatalog';

export default async function CatalogPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  if (domain === 'hometex') {
    return (
      <div className="min-h-screen bg-zinc-50">
        <main className="pt-24">
          <GlobalCatalog />
        </main>
      </div>
    );
  }

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
