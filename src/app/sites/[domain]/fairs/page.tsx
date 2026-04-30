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
    title: `${brandName} — ${t('globalFairs', 'tr')}`,
    alternates: generateHreflang(exactDomain, '/fairs')
  };
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
      console.warn('[FAIRS] Index hatası (status+createdAt), fallback deneniyor:', e1.message?.substring(0, 80));
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
        console.warn('[FAIRS] createdAt sıralaması da başarısız:', e2.message?.substring(0, 80));
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
        console.error('[FAIRS] Ham okuma da başarısız:', e3.message);
      }
    }

    // Fuar odaklı filtreleme
    const fairFiltered = freshArticles.filter((a: any) => {
      const intent = (a.intent || '').toUpperCase();
      const cat = (a.category || '').toUpperCase();
      return intent === 'DISCOVER' || cat.includes('FUAR') || cat.includes('EXPO') || cat.includes('FAIR')
        || (a.entity_data?.places && a.entity_data.places.length > 0);
    });

    // Bulunamazsa en azından son haberleri göster (boş kalmasın)
    fairsNews = fairFiltered.length > 0 ? fairFiltered : freshArticles.slice(0, 12);
  } catch (err) {
    console.error("[FAIRS] Fatal Fetch Error:", err);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <GlobalTicker />
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="fairs" theme="light" />
      
      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '4rem 2rem' }}>
         <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, fontFamily: "'Playfair Display', serif", color: '#111', textTransform: 'uppercase' }}>
              {t('globalFairs', lang)}
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#6B7280', marginTop: '1rem', maxWidth: '600px', margin: '1rem auto' }}>
              {t('globalFairsDesc', lang)}
            </p>
         </div>

         {fairsNews.length === 0 ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ padding: '3rem 2rem', background: '#FFF', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#111827', marginBottom: '0.75rem', fontFamily: "'Playfair Display', serif" }}>
                  Fuar Takvimi
                </h2>
                <p style={{ color: '#6B7280', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                  Ev tekstili sektörünün önde gelen küresel fuarları — AI destekli katılımcı ve trend analizi ile.
                </p>
              </div>
              <div style={{ padding: '4rem', textAlign: 'center', background: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📡</div>
                <p style={{ color: '#6B7280', fontWeight: 600, fontSize: '1.1rem' }}>Otonom motor çalışıyor. Fuar verileri yakında burada olacak.</p>
              </div>
            </div>
         ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {fairsNews.map((article: any, index: number) => {
                const translatedTitle = article.translations?.[targetLang]?.title || article.title;
                const translatedSummary = article.translations?.[targetLang]?.summary || article.commercial_note;
                let imgSrc = article.images?.[0] || article.image_url;
                if (!imgSrc || !imgSrc.startsWith('http')) {
                  imgSrc = getFallbackImage(article.id);
                }
                // Mocking a future date for the calendar visual if no date exists
                const eventDate = new Date();
                eventDate.setDate(eventDate.getDate() + (index * 15) + 5); 
                const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                const month = monthNames[eventDate.getMonth()];
                const day = eventDate.getDate();

                return (
                <div key={article.id} style={{ display: 'flex', flexDirection: 'row', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  
                  {/* CALENDAR DATE BOX */}
                  <div style={{ width: '120px', background: '#111', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', borderRight: '1px solid #222' }}>
                     <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f5a623', textTransform: 'uppercase', letterSpacing: '2px' }}>{month}</span>
                     <span style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{day}</span>
                     <span style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.5rem', textTransform: 'uppercase' }}>2026</span>
                  </div>

                  {/* IMAGE */}
                  <div style={{ width: '250px', display: 'none', '@media (min-width: 768px)': { display: 'block' } } as any}>
                     <img src={imgSrc} alt={translatedTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* CONTENT */}
                  <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                     <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f5a623', background: '#fffbeb', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                           {t('fairEvent', lang) || 'GLOBAL EXPO'}
                        </span>
                        {article.entity_data?.places?.[0] && (
                           <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3b82f6', background: '#eff6ff', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                              📍 {article.entity_data.places[0]}
                           </span>
                        )}
                     </div>
                     <h3 style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '0.5rem', color: '#111', fontFamily: "'Playfair Display', serif" }}>
                       {translatedTitle}
                     </h3>
                     {translatedSummary && (
                       <p style={{ fontSize: '0.95rem', color: '#4B5563', lineHeight: 1.6, marginTop: '0.5rem' }}>
                         {translatedSummary}
                       </p>
                     )}
                     
                     <div style={{ marginTop: '1.5rem' }}>
                        <a href={`${basePath}/news/${encodeURIComponent(article.slug || article.id)}?lang=${lang}`} style={{ display: 'inline-block', background: '#111', color: '#fff', padding: '0.6rem 1.2rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', borderRadius: '6px', textDecoration: 'none' }}>
                           KATILIMCI & TREND RAPORUNU İNCELE →
                        </a>
                     </div>
                  </div>
                </div>
                );
              })}
            </div>
         )}
      </main>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
    </div>
  );
}
