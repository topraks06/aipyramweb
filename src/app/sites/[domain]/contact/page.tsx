import Contact from '@/components/tenant-perde/Contact';
import PerdeNavbar from '@/components/tenant-perde/PerdeNavbar';
import PerdeFooter from '@/components/tenant-perde/PerdeFooter';
import TrtexContact from '@/components/trtex/TrtexContact';
import HometexContact from '@/components/tenant-hometex/HometexContact';
import VorhangContact from '@/components/tenant-vorhang/VorhangContact';

export default async function ContactPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const d = decodeURIComponent(domain);

  // TRTEX — kendi navbar/footer'ı bileşen içinde
  if (d.includes('trtex')) {
    return <TrtexContact />;
  }

  if (d.includes('hometex')) return <HometexContact />;
  if (d.includes('vorhang')) return <VorhangContact />;

  // Perde.ai default
  return (
    <div className="min-h-screen bg-[#F9F9F6]">
      <PerdeNavbar theme="light" />
      <main>
        <Contact />
      </main>
      <PerdeFooter />
    </div>
  );
}
