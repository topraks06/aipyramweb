import { adminDb } from '@/lib/firebase-admin';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import GlobalTicker from '@/components/trtex/GlobalTicker';
import { t } from '@/i18n/labels';
import { Metadata } from 'next';
import { generateHreflang, getFallbackImage } from '@/lib/utils';

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }: any): Promise<Metadata> {
  const resolvedParams = await params;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const brandName = exactDomain.split('.')[0].toUpperCase();
  return { 
    title: `${brandName} — ${t('industryAcademy', 'tr')}`,
    alternates: generateHreflang(exactDomain, '/academy')
  };
}

export default async function AcademyPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const lang = (resolvedSearch?.lang || "tr");
  const targetLang = lang.toUpperCase();
  const brandName = exactDomain.split('.')[0].toUpperCase();
  const basePath = `/sites/${exactDomain}`;

  let projectName = 'trtex';
  if (exactDomain.includes('hometex')) projectName = 'hometex';

  let academyNews: any[] = [];
  try {
    let freshArticles: any[] = [];
    
    // Deneme 1: status + createdAt
    try {
      const snap = await adminDb.collection(`${projectName}_news`)
        .where('status', '==', 'published')
        .orderBy('createdAt', 'desc')
        .limit(30)
        .get();
      freshArticles = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e1: any) {
      console.warn('[ACADEMY] Index hatası (status+createdAt), fallback deneniyor:', e1.message?.substring(0, 80));
    }

    // Deneme 2: Sadece createdAt
    if (freshArticles.length === 0) {
      try {
        const snap2 = await adminDb.collection(`${projectName}_news`)
          .orderBy('createdAt', 'desc')
          .limit(50)
          .get();
        freshArticles = snap2.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((a: any) => !a.status || a.status === 'published')
          .slice(0, 30);
      } catch (e2: any) {
        console.warn('[ACADEMY] createdAt sıralaması da başarısız:', e2.message?.substring(0, 80));
      }
    }

    // Deneme 3: Ham koleksiyon
    if (freshArticles.length === 0) {
      try {
        const snap3 = await adminDb.collection(`${projectName}_news`).limit(50).get();
        freshArticles = snap3.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((a: any) => !a.status || a.status === 'published')
          .sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''))
          .slice(0, 30);
      } catch (e3: any) {
        console.error('[ACADEMY] Ham okuma da başarısız:', e3.message);
      }
    }

    // Önce akademi/analiz/trend kategorili olanları filtrele
    const academyFiltered = freshArticles.filter((a: any) => {
      const cat = (a.category || '').toUpperCase();
      return ['ANALİZ', 'TREND', 'AKADEMİ', 'ANALYSIS', 'DEKORASYON', 'DECORATION', 'GÜNDEM', 'İSTİHBARAT', 'PAZAR'].includes(cat)
        || (a.routing_signals?.academy_value || 0) >= 0.4;
    });

    // Akademi filtresi boşsa tüm haberleri göster (boş sayfa olmasın)
    academyNews = academyFiltered.length > 0 ? academyFiltered : freshArticles;
  } catch (err) {
    console.error("[ACADEMY] Fatal Fetch Error:", err);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <GlobalTicker />
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="academy" theme="light" />
      
      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '4rem 2rem' }}>
         <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, fontFamily: "'Playfair Display', serif", color: '#111', textTransform: 'uppercase' }}>
              {t('industryAcademy', lang)}
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#6B7280', marginTop: '1rem', maxWidth: '600px', margin: '1rem auto' }}>
              {t('industryAcademyDesc', lang)}
            </p>
         </div>

         {academyNews.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', background: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📡</div>
              <p style={{ color: '#6B7280', fontWeight: 600, fontSize: '1.1rem' }}>Otonom motor çalışıyor. Veriler yakında burada olacak.</p>
            </div>
         ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              {academyNews.map((article: any) => {
                const translatedTitle = article.translations?.[targetLang]?.title || article.title;
                const translatedSummary = article.translations?.[targetLang]?.summary || article.commercial_note;
                return (
                <a key={article.id} href={`${basePath}/news/${encodeURIComponent(article.slug || article.id)}?lang=${lang}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', border: '1px solid #E5E7EB', background: '#fff', overflow: 'hidden', borderRadius: '8px' }}>
                  <div style={{ width: '100%', height: '180px', overflow: 'hidden', backgroundColor: '#F3F4F6' }}>
                    <img src={article.images?.[0] || article.image_url || article.image || getFallbackImage(article.id)} alt={translatedTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                     <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3B82F6', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {t('analysisTrend', lang)}
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
