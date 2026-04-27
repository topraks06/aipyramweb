import Pricing from '@/components/node-perde/Pricing';
import PerdeNavbar from '@/components/node-perde/PerdeNavbar';
import PerdeFooter from '@/components/node-perde/PerdeFooter';

export default async function PricingPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  // We only show this page for Perde.ai or allow other nodes to use it with dynamic branding later
  return (
    <div className="min-h-screen bg-[#F9F9F6]">
      {/* HEADER / NAVIGATION BAR */}
      <PerdeNavbar theme="light" />

      <main>
        <Pricing />
      </main>

      <PerdeFooter />
    </div>
  );
}
