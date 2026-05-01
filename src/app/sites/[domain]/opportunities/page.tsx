import { adminDb } from '@/lib/firebase-admin';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import GlobalTicker from '@/components/trtex/GlobalTicker';
import { t } from '@/i18n/labels';
import { Metadata } from 'next';
import { generateHreflang } from '@/lib/utils';

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }: any): Promise<Metadata> {
  const resolvedParams = await params;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const brandName = exactDomain.split('.')[0].toUpperCase();
  return { 
    title: `${brandName} — ${t('tradeOpportunities', 'tr')}`,
    alternates: generateHreflang(exactDomain, '/opportunities')
  };
}

export default async function OpportunitiesPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const lang = (resolvedSearch?.lang || "tr");
  const targetLang = lang.toUpperCase();
  const brandName = exactDomain.split('.')[0].toUpperCase();
  const basePath = `/sites/${exactDomain}`;

  let projectName = 'trtex';
  if (exactDomain.includes('hometex')) projectName = 'hometex';

  let opportunities: any[] = [];
  try {
    const snap = await adminDb.collection(`${projectName}_news`)
      .where("status", "==", "published")
      .where("intent", "==", "ACT")
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();
    opportunities = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("[OPPORTUNITIES] Fetch Error:", err);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <GlobalTicker />
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="trade" theme="light" />
      
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '4rem 2rem' }}>
         <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, fontFamily: "'Playfair Display', serif", color: '#111', textTransform: 'uppercase' }}>
              {t('tradeOpportunities', lang)}
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#6B7280', marginTop: '1rem', maxWidth: '600px', margin: '1rem auto' }}>
              {t('tradeOpportunitiesDesc', lang)}
            </p>
         </div>

         {opportunities.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', background: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📡</div>
              <p style={{ color: '#6B7280', fontWeight: 600, fontSize: '1.1rem' }}>Otonom motor çalışıyor. Veriler yakında burada olacak.</p>
            </div>
         ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#fff', border: '1px solid #E5E7EB', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              {opportunities.map((article: any) => {
                const translatedTitle = article.translations?.[targetLang]?.title || article.title;
                const translatedSummary = article.translations?.[targetLang]?.summary || article.commercial_note;
                return (
                <a key={article.id} href={`${basePath}/news/${article.slug || article.id}?lang=${lang}`} style={{ 
                  display: 'flex', textDecoration: 'none', color: 'inherit', 
                  borderBottom: '1px solid #F3F4F6', paddingBottom: '1.5rem', alignItems: 'center', gap: '2rem', transition: 'all 0.2s'
                }}>
                  <div style={{ width: '150px', height: '100px', flexShrink: 0, overflow: 'hidden', borderRadius: '4px', position: 'relative', background: 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'radial-gradient(#D1D5DB 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
                    {(article.images?.[0] || article.image_url) ? (
                      <img src={article.images?.[0] || article.image_url} alt={translatedTitle} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 20 }} />
                    ) : (
                      <div style={{ position: 'relative', zIndex: 10, width: '30px', height: '3px', background: '#D1D5DB', borderRadius: '2px' }}></div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 5px #10B981' }}></span> ACT (HIGH INTENT)
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>{translatedTitle}</h3>
                    {translatedSummary && <div style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.5 }}>{translatedSummary.substring(0, 150)}...</div>}
                  </div>
                  <div style={{ padding: '1rem 2rem', background: '#FAFAFA', border: '1px solid #E5E7EB', borderRadius: '4px', textAlign: 'center', minWidth: '160px' }}>
                     <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#CC0000', textTransform: 'uppercase' }}>{t('reviewOpp', lang)}</span>
                  </div>
                </a>
                );
              })}
            </div>
         )}
      </main>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
    </div>
  );
}
