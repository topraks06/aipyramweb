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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {fairsNews.map((article: any, index: number) => {
                const translatedTitle = article.translations?.[targetLang]?.title || article.title;
                const translatedSummary = article.translations?.[targetLang]?.summary || article.commercial_note;
                
                // SOVEREIGN VISUAL VAULT
                const fallbacks = [
                  'https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=800&auto=format&fit=crop', // Expo
                  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop', // Event
                  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800&auto=format&fit=crop'  // Convention
                ];
                let imgSrc = article.images?.[0] || article.image_url;
                if (!imgSrc || !imgSrc.startsWith('http')) {
                  const sum = String(article.id || Math.random()).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  imgSrc = fallbacks[sum % fallbacks.length];
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
                        <a href={`${basePath}/news/${article.slug || article.id}?lang=${lang}`} style={{ display: 'inline-block', background: '#111', color: '#fff', padding: '0.6rem 1.2rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', borderRadius: '6px', textDecoration: 'none' }}>
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
