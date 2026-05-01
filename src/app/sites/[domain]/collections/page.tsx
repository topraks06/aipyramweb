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
  return { title: `${brandName} — ${t('collections', 'tr') || 'Koleksiyonlar'}` };
}

export default async function CollectionsPage({ params, searchParams }: any) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const lang = (resolvedSearch?.lang || "tr");
  const targetLang = lang.toUpperCase();
  const brandName = exactDomain.split('.')[0].toUpperCase();
  const basePath = `/sites/${exactDomain}`;

  let projectName = 'trtex';
  if (exactDomain.includes('hometex')) projectName = 'hometex';

  let collectionsList: any[] = [];
  try {
    const snap = await adminDb.collection(`${projectName}_news`)
      .where("status", "==", "published")
      .where("intent", "==", "TREND") // Koleksiyonlar genelde trend veya ürün odaklıdır
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();
    collectionsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("[COLLECTIONS] Fetch Error:", err);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <GlobalTicker />
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="index" theme="light" />
      
      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '4rem 2rem' }}>
         <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, fontFamily: "'Playfair Display', serif", color: '#111827', textTransform: 'uppercase' }}>
              {t('collections', lang) || 'Global Koleksiyonlar'}
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#6B7280', marginTop: '1rem', maxWidth: '600px', margin: '1rem auto', lineHeight: 1.6 }}>
              En son ev tekstili trendleri, 2026/2027 lansmanları ve sektör lideri üreticilerin global piyasaya sunduğu yeni sezon kumaş koleksiyonları.
            </p>
         </div>

         {collectionsList.length === 0 ? (
            <div style={{ padding: '6rem 2rem', textAlign: 'center', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
               <div style={{ width: '64px', height: '64px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
                     <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                     <path d="m3 15 2 2 4-4" />
                  </svg>
               </div>
               <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>Veriler Analiz Ediliyor</h3>
               <p style={{ color: '#6B7280', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>TRTEX Otonom Sinyal Motoru şu anda global üreticilerin güncel koleksiyon lansmanlarını işliyor. Sayfa kısa süre içinde güncellenecektir.</p>
            </div>
         ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
              {collectionsList.map((article: any, index: number) => {
                const translatedTitle = article.translations?.[targetLang]?.title || article.title;
                const translatedSummary = article.translations?.[targetLang]?.summary || article.commercial_note || article.summary;
                
                // SOVEREIGN VISUAL VAULT
                const fallbacks = [
                  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=800&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1550133730-695473e544be?q=80&w=800&auto=format&fit=crop'
                ];
                let imgSrc = article.images?.[0] || article.image_url;
                if (!imgSrc || !imgSrc.startsWith('http')) {
                  const sum = String(article.id || article.title || 'fallback').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  imgSrc = fallbacks[sum % fallbacks.length];
                }
                
                return (
                <div key={article.id} style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <div style={{ width: '100%', height: '240px', position: 'relative' }}>
                     <img src={imgSrc} alt={translatedTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#DC2626', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>
                        YENİ SEZON
                     </div>
                  </div>

                  <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                     <h3 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '0.75rem', color: '#111827', fontFamily: "'Playfair Display', serif" }}>
                       {translatedTitle}
                     </h3>
                     {translatedSummary && (
                       <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                         {translatedSummary.length > 150 ? translatedSummary.substring(0, 150) + '...' : translatedSummary}
                       </p>
                     )}
                     
                     <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #F3F4F6' }}>
                        <a href={`${basePath}/news/${article.slug || article.id}?lang=${lang}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#111827', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', textDecoration: 'none' }}>
                           Koleksiyonu İncele
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12h14M12 5l7 7-7 7"/>
                           </svg>
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
