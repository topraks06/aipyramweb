import Pricing from '@/components/tenant-perde/Pricing';
import PerdeNavbar from '@/components/tenant-perde/PerdeNavbar';

export default async function PricingPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  // We only show this page for Perde.ai or allow other tenants to use it with dynamic branding later
  return (
    <div className="min-h-screen bg-[#F9F9F6]">
      {/* HEADER / NAVIGATION BAR */}
      <PerdeNavbar theme="light" />

      <main>
        <Pricing />
      </main>
    </div>
  );
}
