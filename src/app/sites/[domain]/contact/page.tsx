import Contact from '@/components/node-perde/Contact';
import PerdeNavbar from '@/components/node-perde/PerdeNavbar';
import PerdeFooter from '@/components/node-perde/PerdeFooter';
import TrtexContact from '@/components/trtex/TrtexContact';
import HometexContact from '@/components/node-hometex/HometexContact';
import VorhangContact from '@/components/node-vorhang/VorhangContact';
import { Metadata } from 'next';

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { domain } = await params;
  const d = decodeURIComponent(domain).split(':')[0];
  const brand = d.split('.')[0].toUpperCase();
  return {
    title: `İletişim — ${brand} | B2B Ev Tekstili İstihbarat Platformu`,
    description: `${brand} ile iletişime geçin. B2B ihale sorguları, sponsorluk, reklam, teknik destek ve ticari ortaklık talepleri için bize ulaşın.`,
    openGraph: {
      title: `Contact — ${brand} | B2B Textile Intelligence`,
      description: `Get in touch with ${brand} for B2B inquiries, partnerships, and trade intelligence support.`,
      type: 'website',
    },
    alternates: { canonical: `https://${d}/iletisim` },
  };
}

export default async function ContactPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const domain = resolvedParams.domain;
  const d = decodeURIComponent(domain);
  const lang = resolvedSearch?.lang || 'tr';
  const basePath = `/sites/${d.split(':')[0]}`;

  // TRTEX — kendi navbar/footer'ı bileşen içinde
  if (d.includes('trtex')) {
    return <TrtexContact lang={lang} basePath={basePath} />;
  }

  if (d.includes('hometex')) return <HometexContact />;
  if (d.includes('vorhang')) return <VorhangContact />;
  if (d.includes('heimtex')) {
    const HeimtexContact = (await import('@/components/node-heimtex/HeimtexContact')).default;
    return <HeimtexContact basePath={`/sites/${d.split(':')[0]}`} />;
  }
  if (d.includes('curtaindesign')) {
    const CurtaindesignContact = (await import('@/components/node-curtaindesign/CurtaindesignContact')).default;
    return <CurtaindesignContact basePath={`/sites/${d.split(':')[0]}`} />;
  }
  if (d.includes('icmimar')) {
    const IcmimarNavbar = (await import('@/components/node-icmimar/IcmimarNavbar')).default;
    const IcmimarFooter = (await import('@/components/node-icmimar/IcmimarFooter')).default;
    return (
      <div className="min-h-screen bg-[#F9F9F6] flex flex-col">
        <IcmimarNavbar theme="light" />
        <main className="flex-1 pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto w-full">
          <h1 className="font-serif text-5xl text-zinc-900 mb-6">İletişim</h1>
          <p className="text-zinc-500 mb-12">aipyram B2B Master Design Engine hakkında bilgi almak için bizimle iletişime geçin.</p>
          <div className="bg-white p-8 rounded-2xl border border-zinc-200">
             <form className="flex flex-col gap-6">
                <input type="text" placeholder="Adınız Soyadınız" className="p-4 border border-zinc-200 rounded-md" />
                <input type="email" placeholder="E-Posta Adresiniz" className="p-4 border border-zinc-200 rounded-md" />
                <textarea placeholder="Mesajınız" rows={4} className="p-4 border border-zinc-200 rounded-md"></textarea>
                <button type="button" className="w-full bg-[#8B7355] text-white py-4 rounded-md uppercase tracking-widest text-[10px] font-bold">Gönder</button>
             </form>
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
        <Contact />
      </main>
      <PerdeFooter />
    </div>
  );
}
