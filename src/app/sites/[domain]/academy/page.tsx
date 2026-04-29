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
  return { title: `${brandName} — ${t('industryAcademy', 'tr')}` };
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
    // Geniş kategori filtresi — Akademi sayfası boş kalmasın
    const snap = await adminDb.collection(`${projectName}_news`)
      .where("status", "==", "published")
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();
    // Önce akademi/analiz/trend kategorili olanları filtrele
    const allNews = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const academyFiltered = allNews.filter((a: any) => {
      const cat = (a.category || '').toUpperCase();
      return ['ANALİZ', 'TREND', 'AKADEMİ', 'ANALYSIS', 'DEKORASYON', 'DECORATION', 'GÜNDEM', 'İSTİHBARAT', 'PAZAR'].includes(cat)
        || (a.routing_signals?.academy_value || 0) >= 0.4;
    });
    // Akademi filtresi boşsa tüm haberleri göster (boş sayfa olmasın)
    academyNews = academyFiltered.length > 0 ? academyFiltered : allNews;
  } catch (err) {
    console.error("[ACADEMY] Fetch Error:", err);
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
            <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#FFF', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#111827', marginBottom: '0.75rem', fontFamily: "'Playfair Display', serif" }}>
                Akademi İçerikleri Hazırlanıyor
              </h2>
              <p style={{ color: '#6B7280', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                Sektör profesyonelleri için derinlemesine pazar analizleri, trend raporları ve ticari eğitim dokümanları çok yakında bu ekranda yerini alacak.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: '700px', margin: '0 auto' }}>
                {[
                  { icon: '📊', title: 'Pazar Analizi', desc: 'Küresel ev tekstili pazar trendleri' },
                  { icon: '🧵', title: 'Hammadde Rehberi', desc: 'İplik, kumaş ve aksesuar bilgi bankası' },
                  { icon: '📈', title: 'Trend Raporları', desc: '2026/2027 sezon öngörüleri' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '1.25rem', border: '1px solid #E5E7EB', borderRadius: '8px', textAlign: 'left' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111', marginBottom: '0.25rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
         ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              {academyNews.map((article: any) => {
                const translatedTitle = article.translations?.[targetLang]?.title || article.title;
                const translatedSummary = article.translations?.[targetLang]?.summary || article.commercial_note;
                return (
                <a key={article.id} href={`${basePath}/news/${article.slug || article.id}?lang=${lang}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', border: '1px solid #E5E7EB', background: '#fff', overflow: 'hidden', borderRadius: '8px' }}>
                  {(article.images?.[0] || article.image_url || article.image) ? (
                    <div style={{ width: '100%', height: '180px', overflow: 'hidden', backgroundColor: '#F3F4F6' }}>
                      <img src={article.images?.[0] || article.image_url || article.image} alt={translatedTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: '180px', background: 'linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'radial-gradient(#D1D5DB 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
                      <div style={{ position: 'relative', zIndex: 10, width: '40px', height: '4px', background: '#D1D5DB', borderRadius: '2px' }}></div>
                    </div>
                  )}
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
