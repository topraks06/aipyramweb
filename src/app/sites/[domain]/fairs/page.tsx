import { adminDb } from '@/lib/firebase-admin';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import GlobalTicker from '@/components/trtex/GlobalTicker';
import { t } from '@/i18n/labels';
import { Metadata } from 'next';

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }: any): Promise<Metadata> {
  const resolvedParams = await params;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const brandName = exactDomain.split('.')[0].toUpperCase();
  return { title: `${brandName} — ${t('globalFairs', 'tr')}` };
}

export default async function FairsPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const lang = (resolvedSearch?.lang || "tr");
  const targetLang = lang.toUpperCase();
  const brandName = exactDomain.split('.')[0].toUpperCase();
  const basePath = `/sites/${exactDomain}`;

  let projectName = 'trtex';
  if (exactDomain.includes('hometex')) projectName = 'hometex';

  let fairsNews: any[] = [];
  try {
    const snap = await adminDb.collection(`${projectName}_news`)
      .where("status", "==", "published")
      .where("intent", "==", "DISCOVER")
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();
    fairsNews = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("[FAIRS] Fetch Error:", err);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <GlobalTicker />
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="fairs" theme="light" />
      
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '4rem 2rem' }}>
         <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, fontFamily: "'Playfair Display', serif", color: '#111', textTransform: 'uppercase' }}>
              {t('globalFairs', lang)}
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#6B7280', marginTop: '1rem', maxWidth: '600px', margin: '1rem auto' }}>
              {t('globalFairsDesc', lang)}
            </p>
         </div>

         {fairsNews.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>{t('noFairContent', lang)}</div>
         ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              {fairsNews.map((article: any) => {
                const translatedTitle = article.translations?.[targetLang]?.title || article.title;
                const translatedSummary = article.translations?.[targetLang]?.summary || article.commercial_note;
                return (
                <a key={article.id} href={`${basePath}/news/${article.slug || article.id}?lang=${lang}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', border: '1px solid #E5E7EB', background: '#fff', overflow: 'hidden', borderRadius: '8px' }}>
                  {(article.images?.[0] || article.image_url) ? (
                    <div style={{ width: '100%', height: '180px', overflow: 'hidden', backgroundColor: '#F3F4F6' }}>
                      <img src={article.images?.[0] || article.image_url} alt={translatedTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '180px', background: 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'radial-gradient(#D1D5DB 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
                      <div style={{ position: 'relative', zIndex: 10, width: '40px', height: '4px', background: '#D1D5DB', borderRadius: '2px' }}></div>
                    </div>
                  )}
                  <div style={{ padding: '1.5rem' }}>
                     <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#eab308', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {t('fairEvent', lang)}
                     </div>
                     <h3 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '0.5rem', color: '#111' }}>
                       {translatedTitle}
                     </h3>
                     {translatedSummary && (
                       <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5, marginTop: '1rem' }}>
                         {translatedSummary.substring(0, 100)}...
                       </p>
                     )}
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
