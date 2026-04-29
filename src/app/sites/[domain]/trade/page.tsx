import { adminDb } from '@/lib/firebase-admin';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import GlobalTicker from '@/components/trtex/GlobalTicker';
import { t } from '@/i18n/labels';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const brandName = exactDomain.split('.')[0].toUpperCase();
  return {
    title: `${brandName} — B2B Ticaret Merkezi`,
    description: `${brandName} Küresel Ticaret Merkezi — İhaleler, sıcak stok fırsatları, boş kapasite bildirimleri ve tedarikçi eşleştirme.`,
  };
}

export default async function TradePage({ params, searchParams }: {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { domain } = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const lang = resolvedSearch?.lang || 'tr';
  const basePath = `/sites/${exactDomain}`;
  const brandName = exactDomain.split('.')[0].toUpperCase();

  let projectName = 'trtex';
  if (exactDomain.includes('hometex')) projectName = 'hometex';

  // İhaleleri çek
  let tenders: any[] = [];
  try {
    const terminalSnap = await adminDb.collection(`${projectName}_terminal`).doc('current').get();
    if (terminalSnap.exists) {
      const data = terminalSnap.data();
      if (data?.activeTenders && Array.isArray(data.activeTenders)) {
        tenders = data.activeTenders;
      }
    }
    if (tenders.length === 0) {
      const snap = await adminDb.collection(`${projectName}_tenders`)
        .orderBy('createdAt', 'desc')
        .limit(30)
        .get();
      tenders = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    }
  } catch { /* sorunsuz */ }

  // Ticaret haberleri
  let tradeNews: any[] = [];
  try {
    const snap = await adminDb.collection(`${projectName}_news`)
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();
    const allNews = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    tradeNews = allNews.filter((a: any) => {
      const cat = (a.category || '').toUpperCase();
      return cat.includes('PAZAR') || cat.includes('MARKET') || cat.includes('FIRSAT') || cat.includes('OPPORTUNITY')
        || (a.routing_signals?.b2b_opportunity || 0) >= 0.4 || (a.business_opportunities?.length > 0);
    });
    if (tradeNews.length < 3) tradeNews = allNews.slice(0, 8);
  } catch { /* sorunsuz */ }

  const targetLang = lang.toUpperCase();
  const getTitle = (a: any) => a?.translations?.[targetLang]?.title || a?.title || '';
  const getImg = (a: any) => a?.images?.[0] || a?.image_url || '';

  const tendersByType = {
    TENDER: tenders.filter((t: any) => t.type === 'TENDER'),
    HOT_STOCK: tenders.filter((t: any) => t.type === 'HOT_STOCK'),
    CAPACITY: tenders.filter((t: any) => t.type === 'CAPACITY'),
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .trade-card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; transition: all 0.2s; }
        .trade-card:hover { border-color: #D1D5DB; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
      `}} />

      <GlobalTicker />
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="trade" theme="light" />

      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Hero Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 800, color: '#CC0000', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>
            🔴 CANLI TİCARET
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, fontFamily: "'Playfair Display', serif", color: '#111', marginBottom: '0.75rem' }}>
            B2B Ticaret Merkezi
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#6B7280', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Küresel ev tekstili sektöründe ihaleler, sıcak stok fırsatları ve boş kapasite ilanları — tek ekrandan.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          {[
            { label: 'İhale', count: tendersByType.TENDER.length, color: '#DC2626', bg: '#FEF2F2' },
            { label: 'Sıcak Stok', count: tendersByType.HOT_STOCK.length, color: '#16A34A', bg: '#F0FDF4' },
            { label: 'Boş Kapasite', count: tendersByType.CAPACITY.length, color: '#EAB308', bg: '#FEFCE8' },
            { label: 'Toplam', count: tenders.length, color: '#111827', bg: '#F3F4F6' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '1rem 1.5rem', background: s.bg, borderRadius: '8px', textAlign: 'center', minWidth: '140px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', fontWeight: 900, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          <a href={`${basePath}/tenders?lang=${lang}`} className="trade-card" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', borderLeft: '4px solid #DC2626' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 800, color: '#DC2626', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>🔴 İHALELER</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Küresel Tekstil İhaleleri</h3>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.6 }}>Otel, hastane ve kamu projelerindeki aktif ihalelere teklif verin.</p>
          </a>
          <a href={`${basePath}/tenders?filter=HOT_STOCK&lang=${lang}`} className="trade-card" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', borderLeft: '4px solid #16A34A' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 800, color: '#16A34A', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>🟢 SICAK STOK</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Hazır Stok Fırsatları</h3>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.6 }}>Depodaki hazır kumaş/ürün lotlarını hemen satın alın.</p>
          </a>
          <a href={`${basePath}/supply?lang=${lang}`} className="trade-card" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', borderLeft: '4px solid #EAB308' }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 800, color: '#EAB308', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>🟡 KAPASİTE</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Boş Kapasite Bildirin</h3>
            <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.6 }}>Dokuma/konfeksiyon kapasitenizi global alıcılara duyurun.</p>
          </a>
        </div>

        {/* Son İhaleler Preview */}
        {tenders.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', borderBottom: '3px solid #111', paddingBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'Playfair Display', serif", color: '#111', margin: 0 }}>Son İhale & Fırsatlar</h2>
              <a href={`${basePath}/tenders?lang=${lang}`} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', fontWeight: 700, color: '#CC0000', textDecoration: 'none' }}>Tümünü Gör →</a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {tenders.slice(0, 6).map((tender: any, i: number) => {
                const typeColor = tender.type === 'TENDER' ? '#DC2626' : tender.type === 'HOT_STOCK' ? '#16A34A' : '#EAB308';
                const typeLabel = tender.type === 'TENDER' ? 'İHALE' : tender.type === 'HOT_STOCK' ? 'STOK' : 'KAPASİTE';
                return (
                  <div key={tender.id || i} className="trade-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 800, color: '#FFF', background: typeColor, padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                        {typeLabel}
                      </span>
                      {tender.score && (
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 800, color: '#374151' }}>
                          SKOR: {tender.score}
                        </span>
                      )}
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.3, color: '#111', marginBottom: '0.5rem' }}>
                      {tender.title || tender.project || 'İhale'}
                    </h4>
                    {tender.estimatedValue && (
                      <div style={{ fontSize: '0.85rem', color: '#16A34A', fontWeight: 700 }}>
                        💰 {tender.estimatedValue}
                      </div>
                    )}
                    {tender.buyerHint && (
                      <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.3rem' }}>
                        📋 {tender.buyerHint}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Ticaret Haberleri */}
        {tradeNews.length > 0 && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', borderBottom: '3px solid #111', paddingBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'Playfair Display', serif", color: '#111', margin: 0 }}>Ticaret İstihbaratı</h2>
              <a href={`${basePath}/news?lang=${lang}`} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', fontWeight: 700, color: '#CC0000', textDecoration: 'none' }}>Tüm Haberler →</a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {tradeNews.slice(0, 4).map((a: any) => (
                <a href={`${basePath}/news/${a.slug || a.id}?lang=${lang}`} key={a.id} className="trade-card" style={{ textDecoration: 'none', color: 'inherit', overflow: 'hidden' }}>
                  {getImg(a) && (
                    <div style={{ width: '100%', height: '160px', overflow: 'hidden', background: '#F3F4F6' }}>
                      <img src={getImg(a)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', fontWeight: 800, color: '#CC0000', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
                      {a.category?.toUpperCase() || 'TİCARET'}
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.3, color: '#111' }}>{getTitle(a)}</h3>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
    </div>
  );
}
