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
  if (d.includes('curtaindesign')) {
    const CurtaindesignAbout = (await import('@/components/node-curtaindesign/CurtaindesignAbout')).default;
    return <CurtaindesignAbout basePath={`/sites/${d.split(':')[0]}`} />;
  }
  if (d.includes('icmimar')) {
    const IcmimarNavbar = (await import('@/components/node-icmimar/IcmimarNavbar')).default;
    const IcmimarFooter = (await import('@/components/node-icmimar/IcmimarFooter')).default;
    return (
      <div className="min-h-screen bg-[#F9F9F6] flex flex-col">
        <IcmimarNavbar theme="light" />
        <main className="flex-1 pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto w-full text-center">
          <h1 className="font-serif text-5xl text-zinc-900 mb-6">Master Design Engine</h1>
          <p className="text-zinc-500 text-lg leading-relaxed mb-8">
            İcmimar.ai, 7 kıtada hizmet veren B2B ev tekstili ekosisteminin tasarım ve üretim merkezidir.
            Perde, döşemelik ve ev tekstilinde Image-to-Image teknolojisi ile profesyonellere anında
            tasarım, 3D görselleştirme ve sipariş/ERP yönetimi sunar.
          </p>
          <div className="bg-zinc-900 text-white p-12 rounded-2xl">
             <h2 className="text-3xl font-serif mb-4">aipyram Bilişim</h2>
             <p className="text-zinc-400">Türkiye'den Dünyaya Açılan Otonom Yapay Zeka Ağı.</p>
          </div>
        </main>
        <IcmimarFooter />
      </div>
    );
  }

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
