import Pricing from '@/components/node-perde/Pricing';
import PerdeNavbar from '@/components/node-perde/PerdeNavbar';
import PerdeFooter from '@/components/node-perde/PerdeFooter';
import IcmimarNavbar from '@/components/node-icmimar/IcmimarNavbar';
import IcmimarFooter from '@/components/node-icmimar/IcmimarFooter';

export default async function PricingPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(':')[0];
  const isIcmimar = exactDomain.includes('icmimar');

  if (isIcmimar) {
    return (
      <div className="min-h-screen bg-[#F9F9F6] flex flex-col">
        <IcmimarNavbar theme="light" />
        <main className="min-h-[70vh] w-full">
          <Pricing />
        </main>
        <IcmimarFooter />
      </div>
    );
  }

  // Perde.ai default
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
