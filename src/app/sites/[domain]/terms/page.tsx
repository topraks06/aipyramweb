import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import GlobalTicker from '@/components/trtex/GlobalTicker';
import PerdeNavbar from '@/components/node-perde/PerdeNavbar';
import PerdeFooter from '@/components/node-perde/PerdeFooter';
import PerdeTerms from '@/components/node-perde/PerdeTerms';
import { t } from '@/i18n/labels';
import HometexTerms from '@/components/node-hometex/HometexTerms';
import VorhangTerms from '@/components/node-vorhang/VorhangTerms';

export const dynamic = "force-dynamic";

export default async function TermsPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const lang = resolvedSearch?.lang || "tr";
  const brandName = exactDomain.split('.')[0].toUpperCase();
  const basePath = `/sites/${exactDomain}`;

  if (exactDomain.includes('perde')) {
    return (
      <div className="min-h-screen bg-[#F9F9F6]">
        <PerdeNavbar theme="light" />
        <main>
          <PerdeTerms />
        </main>
        <PerdeFooter />
      </div>
    );
  }

  if (exactDomain.includes('hometex')) {
    return <HometexTerms />;
  }

  if (exactDomain.includes('vorhang')) {
    return <VorhangTerms />;
  }

  if (exactDomain.includes('curtaindesign')) {
    const CurtaindesignTerms = (await import('@/components/node-curtaindesign/CurtaindesignTerms')).default;
    return <CurtaindesignTerms />;
  }

  if (exactDomain.includes('icmimar')) {
    const IcmimarNavbar = (await import('@/components/node-icmimar/IcmimarNavbar')).default;
    const IcmimarFooter = (await import('@/components/node-icmimar/IcmimarFooter')).default;
    return (
      <div className="min-h-screen bg-[#F9F9F6] flex flex-col">
        <IcmimarNavbar theme="light" />
        <main className="flex-1 pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto w-full">
          <h1 className="font-serif text-5xl text-zinc-900 mb-6">Kullanım Koşulları</h1>
          <div className="text-zinc-600 space-y-6">
             <p>İcmimar.ai B2B Master Design Engine kullanım koşulları aşağıda belirtilmiştir.</p>
             <h2 className="font-bold text-lg text-black mt-8">1. Hizmet Kapsamı</h2>
             <p>Platformumuz üzerinden sağlanan tasarım araçları (Visualizer) ve ERP özellikleri, yalnızca kurumsal üyelere ve ticari amaçlarla sunulmaktadır.</p>
             <h2 className="font-bold text-lg text-black mt-8">2. Lisans ve Fikri Mülkiyet</h2>
             <p>Oluşturulan 3D renderlar ve tasarımlar, sistemimize yüklenen doku verileri üzerinden üretilir. Kullanıcılar yükledikleri içeriklerin lisansından kendileri sorumludur.</p>
          </div>
        </main>
        <IcmimarFooter />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <GlobalTicker />
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="news" theme="light" />
      
      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
         <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}>
           {t('termsOfUse', lang)}
         </h1>
         <div style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#374151' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              {t('termsText', lang)}
            </p>
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#111' }}>{t('disclaimer', lang)}</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              {t('disclaimerText', lang)}
            </p>
         </div>
      </main>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
    </div>
  );
}
