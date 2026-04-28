import { redirect } from 'next/navigation';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';

export default async function PremiumReportPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const lang = resolvedSearch?.lang || 'tr';
  const brandName = exactDomain.split('.')[0].toUpperCase();
  const basePath = `/sites/${exactDomain}`;

  const IS_TR = lang.toUpperCase() === 'TR';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', color: '#111', fontFamily: "'Inter', 'Helvetica', sans-serif" }}>
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage={"premium" as any} theme="light" />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 2rem', flex: 1, width: '100%' }}>
        <div style={{ border: '4px solid #111', padding: '3rem', background: '#FFF', position: 'relative', overflow: 'hidden' }}>
           <div style={{ position: 'absolute', top: 0, right: 0, background: '#CC0000', color: '#FFF', padding: '0.5rem 1.5rem', fontWeight: 900, letterSpacing: '2px', fontSize: '0.8rem' }}>
             CONFIDENTIAL
           </div>
           
           <h1 style={{ fontSize: '3rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '-1px' }}>
             {IS_TR ? 'ALOHA PREMİUM İSTİHBARAT' : 'ALOHA PREMIUM INTELLIGENCE'}
           </h1>
           <p style={{ fontSize: '1.2rem', color: '#4B5563', fontWeight: 500, marginBottom: '3rem', maxWidth: '800px' }}>
             {IS_TR 
               ? 'Global tekstil pazarına yön veren gizli veriler, yüksek riskli pazar uyarıları ve özel ticaret fırsatları. Sadece yetkili B2B üyelerine açıktır.'
               : 'Confidential data driving the global textile market, high-risk market alerts, and exclusive trade opportunities. Restricted to authorized B2B members.'}
           </p>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
             {/* Locked items */}
             <div style={{ border: '1px solid #E5E7EB', padding: '2rem', background: '#F9FAFB', filter: 'grayscale(100%)', opacity: 0.7 }}>
               <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
                 🔒 {IS_TR ? 'Q3 ASYA KAPASİTE RAPORU' : 'Q3 ASIA CAPACITY REPORT'}
               </h3>
               <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '1.5rem' }}>
                 {IS_TR 
                   ? 'Çin ve Hindistan üretim kapasitelerindeki gizli daralma ve fiyat etkileri.'
                   : 'Hidden contractions in China and India production capacities and price impacts.'}
               </p>
               <button style={{ background: '#111', color: '#FFF', border: 'none', padding: '0.8rem 1.5rem', fontWeight: 700, width: '100%', cursor: 'not-allowed' }}>
                 {IS_TR ? 'ERİŞİM İZNİ GEREKLİ' : 'ACCESS DENIED'}
               </button>
             </div>
             
             <div style={{ border: '1px solid #E5E7EB', padding: '2rem', background: '#F9FAFB', filter: 'grayscale(100%)', opacity: 0.7 }}>
               <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
                 🔒 {IS_TR ? 'BÜYÜK ALICI İHALELERİ' : 'MAJOR BUYER TENDERS'}
               </h3>
               <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '1.5rem' }}>
                 {IS_TR 
                   ? 'Avrupalı dev zincirlerin henüz yayınlanmamış 2026 tedarik şartnameleri.'
                   : 'Unpublished 2026 supply specifications from major European retail chains.'}
               </p>
               <button style={{ background: '#111', color: '#FFF', border: 'none', padding: '0.8rem 1.5rem', fontWeight: 700, width: '100%', cursor: 'not-allowed' }}>
                 {IS_TR ? 'ERİŞİM İZNİ GEREKLİ' : 'ACCESS DENIED'}
               </button>
             </div>

             <div style={{ border: '1px solid #E5E7EB', padding: '2rem', background: '#F9FAFB', filter: 'grayscale(100%)', opacity: 0.7 }}>
               <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
                 🔒 {IS_TR ? 'SCFI RİSK ANALİZİ' : 'SCFI RISK ANALYSIS'}
               </h3>
               <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '1.5rem' }}>
                 {IS_TR 
                   ? 'Önümüzdeki 6 ay için navlun krizi simülasyonları ve alternatif rotalar.'
                   : 'Freight crisis simulations and alternative routes for the next 6 months.'}
               </p>
               <button style={{ background: '#111', color: '#FFF', border: 'none', padding: '0.8rem 1.5rem', fontWeight: 700, width: '100%', cursor: 'not-allowed' }}>
                 {IS_TR ? 'ERİŞİM İZNİ GEREKLİ' : 'ACCESS DENIED'}
               </button>
             </div>
           </div>

           <div style={{ marginTop: '4rem', padding: '2rem', background: '#111', color: '#FFF', textAlign: 'center' }}>
             <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>
               {IS_TR ? 'PREMİUM ÜYELİĞE GEÇİN' : 'UPGRADE TO PREMIUM'}
             </h2>
             <p style={{ fontSize: '1.1rem', color: '#9CA3AF', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
               {IS_TR 
                 ? 'aipyram B2B Intelligence ağına katılarak rakiplerinizden önce bilgi sahibi olun.'
                 : 'Join the aipyram B2B Intelligence network and stay ahead of your competitors.'}
             </p>
             <a href={`${basePath}/pricing?lang=${lang}`} style={{ display: 'inline-block', background: '#CC0000', color: '#FFF', padding: '1rem 3rem', fontWeight: 900, textDecoration: 'none', letterSpacing: '1px' }}>
               {IS_TR ? 'PLANLARI İNCELE →' : 'VIEW PLANS →'}
             </a>
           </div>
        </div>
      </main>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
    </div>
  );
}
