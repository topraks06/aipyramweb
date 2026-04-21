import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import GlobalTicker from '@/components/trtex/GlobalTicker';
import { t } from '@/i18n/labels';

export const dynamic = "force-dynamic";

export default async function KvkkPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const lang = resolvedSearch?.lang || "tr";
  const brandName = exactDomain.split('.')[0].toUpperCase();
  const basePath = `/sites/${exactDomain}`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <GlobalTicker />
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="news" theme="light" />
      
      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
         <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}>
           KVKK / GDPR
         </h1>
         <div style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#374151' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              {t('kvkkText', lang)}
            </p>
            <p style={{ marginBottom: '1.5rem', padding: '2rem', background: '#F3F4F6', borderRadius: '4px' }}>
              {t('kvkkMatchmaking', lang)}
            </p>
         </div>
      </main>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
    </div>
  );
}
