import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import GlobalTicker from '@/components/trtex/GlobalTicker';
import { t } from '@/i18n/labels';

export const dynamic = "force-dynamic";

export default async function SupplyPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const lang = resolvedSearch?.lang || "tr";
  const brandName = exactDomain.split('.')[0].toUpperCase();
  const basePath = `/sites/${exactDomain}`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <GlobalTicker />
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="trade" theme="light" />
      
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '4rem 2rem' }}>
         <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, fontFamily: "'Playfair Display', serif", color: '#111', textTransform: 'uppercase' }}>
              {t('supplyDirectory', lang)}
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#6B7280', marginTop: '1rem', maxWidth: '600px', margin: '1rem auto' }}>
              {t('supplyDesc', lang)}
            </p>
         </div>

         <div style={{ padding: '6rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(204, 0, 0, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '2.5rem' }}>🏭</span>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#111', marginBottom: '1rem', letterSpacing: '-1px' }}>
              {t('supplierDbIndexing', lang)}
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#4B5563', maxWidth: '500px', lineHeight: 1.6, marginBottom: '3rem' }}>
              {t('supplierDbDesc', lang)}
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: '#FAFAFA', border: '1px solid #E5E7EB', padding: '1rem 2rem', borderRadius: '4px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981', animation: 'tickerPulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111', letterSpacing: '1px' }}>
                {t('awaitingData', lang)}
              </span>
            </div>
         </div>
      </main>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
    </div>
  );
}
