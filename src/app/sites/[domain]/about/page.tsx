import AboutEnterprise from '@/components/node-perde/AboutEnterprise';
import PerdeNavbar from '@/components/node-perde/PerdeNavbar';
import PerdeFooter from '@/components/node-perde/PerdeFooter';
import TrtexAbout from '@/components/trtex/TrtexAbout';
import HometexAbout from '@/components/node-hometex/HometexAbout';
import VorhangAbout from '@/components/node-vorhang/VorhangAbout';

export default async function AboutPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const d = decodeURIComponent(domain);

  // TRTEX — kendi navbar/footer'ı bileşen içinde
  if (d.includes('trtex')) {
    return <TrtexAbout />;
  }

  if (d.includes('hometex')) return <HometexAbout />;
  if (d.includes('vorhang')) return <VorhangAbout />;

  // Perde.ai default
  return (
    <div className="min-h-screen bg-[#F9F9F6]">
      <PerdeNavbar theme="light" />
      <main>
        <AboutEnterprise />
      </main>
      <PerdeFooter />
    </div>
  );
}
