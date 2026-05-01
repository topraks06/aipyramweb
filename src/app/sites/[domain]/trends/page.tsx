import { redirect } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import GlobalTicker from '@/components/trtex/GlobalTicker';
import { t } from '@/i18n/labels';
import { Metadata } from 'next';
import { generateHreflang } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const brandName = exactDomain.split('.')[0].toUpperCase();
  return {
    title: `${brandName} — Dünya Radarı & Trend Analizi`,
    description: `${brandName} B2B Intelligence Terminal — Küresel risk analizi, fırsat radarı ve piyasa sinyalleri.`,
    alternates: generateHreflang(exactDomain, '/trends')
  };
}

export default async function TrendsPage({ params, searchParams }: {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { domain } = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const lang = resolvedSearch?.lang || 'tr';
  const targetLang = lang.toUpperCase();

  // Heimtex → kendi trends sayfası
  if (exactDomain.includes('heimtex')) {
    const HeimtexTrends = (await import('@/components/node-heimtex/HeimtexTrends')).default;
    let trends: any[] = [];
    try {
      const trendsSnap = await adminDb.collection('heimtex_trends').get();
      trends = trendsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[HEIMTEX] Trends fetch error:', e);
    }
    
    if (trends.length === 0) {
      trends = [
        { id: '1', title: 'Minimalist Naturals', description: 'Raw linen and unbleached cotton dominating the European market.', season: 'Spring', pantone: 'PANTONE 11-0103', colorCode: '#F4F0EA', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800' },
        { id: '2', title: 'Deep Ocean Velvet', description: 'Rich velvet textures for luxury upholstery and blackout curtains.', season: 'Winter', pantone: 'PANTONE 19-4035', colorCode: '#1A2B4C', imageUrl: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=800' },
        { id: '3', title: 'Terracotta Warmth', description: 'Earthy tones bringing Mediterranean warmth to modern spaces.', season: 'Fall', pantone: 'PANTONE 16-1330', colorCode: '#C86B49', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800' },
        { id: '4', title: 'Sustainable Sheers', description: 'Recycled PET based sheer curtains gaining major traction.', season: 'Summer', pantone: 'PANTONE 13-0905', colorCode: '#E6E1D3', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=800' }
      ];
    }
    
    return <HeimtexTrends trends={trends} basePath={`/sites/${exactDomain}`} />;
  }

  // ═══ TRTEX DÜNYA RADARI ═══
  let projectName = 'trtex';
  if (exactDomain.includes('hometex')) projectName = 'hometex';
  const basePath = `/sites/${exactDomain}`;
  const brandName = exactDomain.split('.')[0].toUpperCase();

  // Tüm haberleri çek, radar/risk/fırsat kategorilerine ayır
  let allArticles: any[] = [];
  try {
    const snap = await adminDb.collection(`${projectName}_news`)
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(40)
      .get();
    allArticles = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch {
    try {
      const snap2 = await adminDb.collection(`${projectName}_news`)
        .orderBy('createdAt', 'desc')
        .limit(40)
        .get();
      allArticles = snap2.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((a: any) => !a.status || a.status === 'published');
    } catch { /* fallback empty */ }
  }

  // Akıllı kategorileme
  const riskArticles = allArticles.filter((a: any) => {
    const cat = (a.category || '').toUpperCase();
    return cat.includes('RISK') || cat.includes('HAMMADDE') || cat.includes('İPLİK') ||
      (a.routing_signals?.world_radar || 0) >= 0.6 || a.ai_block?.risk;
  });

  const opportunityArticles = allArticles.filter((a: any) => {
    const cat = (a.category || '').toUpperCase();
    return cat.includes('FIRSAT') || cat.includes('OPPORTUNITY') || cat.includes('PAZAR') || cat.includes('MARKET') ||
      (a.routing_signals?.b2b_opportunity || 0) >= 0.6 || (a.business_opportunities?.length > 0);
  });

  const trendArticles = allArticles.filter((a: any) => {
    const cat = (a.category || '').toUpperCase();
    return cat.includes('TREND') || cat.includes('DEKORASYON') || cat.includes('MİMARİ') ||
      (a.routing_signals?.academy_value || 0) >= 0.5;
  });

  // Fallback: Hiçbir kategori dolmazsa genel haberleri dağıt
  const safeRisk = riskArticles.length > 0 ? riskArticles : allArticles.slice(0, 4);
  const safeOpp = opportunityArticles.length > 0 ? opportunityArticles : allArticles.slice(4, 8);
  const safeTrend = trendArticles.length > 0 ? trendArticles : allArticles.slice(8, 12);

  const getImg = (a: any) => a?.images?.[0] || a?.image_url || 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=400&auto=format&fit=crop';
  const getTitle = (a: any) => a?.translations?.[targetLang]?.title || a?.title || '';

  const sections = [
    { key: 'risk', icon: '⚠️', title: 'Risk Analizi', subtitle: 'KÜRESEL RİSK SİNYALLERİ', color: '#DC2626', borderColor: '#FEE2E2', articles: safeRisk.slice(0, 6) },
    { key: 'opportunity', icon: '💡', title: 'Fırsat Radarı', subtitle: 'B2B TİCARET FIRSATLARI', color: '#16A34A', borderColor: '#DCFCE7', articles: safeOpp.slice(0, 6) },
    { key: 'trend', icon: '📈', title: 'Trend & Tahminler', subtitle: '2026/2027 SEZON ANALİZLERİ', color: '#7C3AED', borderColor: '#EDE9FE', articles: safeTrend.slice(0, 6) },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .radar-card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; transition: all 0.2s; text-decoration: none; color: inherit; display: block; overflow: hidden; }
        .radar-card:hover { border-color: #D1D5DB; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
      `}} />

      <GlobalTicker />
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="trends" theme="light" />

      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Hero Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 800, color: '#CC0000', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>
            🌍 TRTEX KÜRESEL İSTİHBARAT
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, fontFamily: "'Playfair Display', serif", color: '#111', marginBottom: '0.75rem' }}>
            Dünya Radarı
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#6B7280', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Küresel ev tekstili pazarındaki risk sinyalleri, ticaret fırsatları ve trend tahminleri — yapay zeka destekli otonom analiz.
          </p>
        </div>

        {/* Radar Stats Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Risk Sinyali', count: safeRisk.length, color: '#DC2626', bg: '#FEF2F2' },
            { label: 'Fırsat', count: safeOpp.length, color: '#16A34A', bg: '#F0FDF4' },
            { label: 'Trend', count: safeTrend.length, color: '#7C3AED', bg: '#F5F3FF' },
            { label: 'Toplam Sinyal', count: allArticles.length, color: '#111827', bg: '#F3F4F6' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '1rem 1.5rem', background: s.bg, borderRadius: '8px', textAlign: 'center', minWidth: '140px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', fontWeight: 900, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Radar Sections */}
        {sections.map((section) => (
          <section key={section.key} style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: `3px solid ${section.color}`, paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.4rem' }}>{section.icon}</span>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'Playfair Display', serif", color: '#111', margin: 0 }}>{section.title}</h2>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.15em' }}>{section.subtitle}</div>
              </div>
            </div>

            {section.articles.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', background: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📡</div>
                <p style={{ color: '#6B7280', fontWeight: 600, fontSize: '1.1rem' }}>Otonom motor çalışıyor. Veriler yakında burada olacak.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {section.articles.map((a: any) => (
                  <a href={`${basePath}/news/${a.slug || a.id}?lang=${lang}`} key={a.id} className="radar-card">
                    <div style={{ width: '100%', height: '180px', overflow: 'hidden', background: '#F3F4F6' }}>
                      <img src={getImg(a)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '1.25rem', borderLeft: `3px solid ${section.color}` }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', fontWeight: 800, color: section.color, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                        {a.category?.toUpperCase() || section.subtitle}
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.3, color: '#111', marginBottom: '0.5rem' }}>
                        {getTitle(a)}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                        {a.summary || a.commercial_note || ''}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>
        ))}
      </main>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
    </div>
  );
}
