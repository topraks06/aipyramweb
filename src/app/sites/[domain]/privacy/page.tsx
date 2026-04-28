import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import GlobalTicker from '@/components/trtex/GlobalTicker';
import PerdeNavbar from '@/components/node-perde/PerdeNavbar';
import PerdeFooter from '@/components/node-perde/PerdeFooter';
import PerdePrivacy from '@/components/node-perde/PerdePrivacy';
import { t } from '@/i18n/labels';
import HometexPrivacy from '@/components/node-hometex/HometexPrivacy';
import VorhangPrivacy from '@/components/node-vorhang/VorhangPrivacy';

export const dynamic = "force-dynamic";

export default async function PrivacyPage({ params, searchParams }: any) {
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
          <PerdePrivacy />
        </main>
        <PerdeFooter />
      </div>
    );
  }

  if (exactDomain.includes('hometex')) {
    return <HometexPrivacy />;
  }

  if (exactDomain.includes('vorhang')) {
    return <VorhangPrivacy />;
  }

  if (exactDomain.includes('curtaindesign')) {
    const CurtaindesignPrivacy = (await import('@/components/node-curtaindesign/CurtaindesignPrivacy')).default;
    return <CurtaindesignPrivacy />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <GlobalTicker />
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="news" theme="light" />
      
      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
         <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}>
           {t('privacyPolicy', lang)}
         </h1>
         <div style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#374151' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              {t('privacyText', lang)}
            </p>
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#111' }}>{t('dataCollected', lang)}</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              {t('dataCollectedText', lang)}
            </p>
         </div>
      </main>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
    </div>
  );
}
