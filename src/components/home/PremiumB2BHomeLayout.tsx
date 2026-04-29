'use client';
import React, { useState } from 'react';
import TrtexNavbar from '@/components/trtex/TrtexNavbar';
import IntelligenceTicker from '@/components/trtex/IntelligenceTicker';
import TrtexFooter from '@/components/trtex/TrtexFooter';
import LeadCaptureModal from '@/components/trtex/LeadCaptureModal';
import SovereignLiveConcierge from '@/components/home/SovereignLiveConcierge';

// Zero-Mock: Sahte tender verileri KALDIRILDI (Hakan Bey kuralı)
// Firestore'da veri yoksa bilgilendirme mesajı gösterilecek.

export default function PremiumB2BHomeLayout({ 
  payload, lang, exactDomain, basePath, brandName, L, 
  uzakDoguRadari, priorityEngine, fairsWithCountdown, ui 
}: any) {
  const { 
    heroArticle, gridArticles = [], tickerItems = [], haftaninFirsatlari = [],
    academyArticles = [], activeTenders: rawTenders = [], radarStream
  } = payload || {};
  
  const [leadModal, setLeadModal] = useState<{ open: boolean; context: any }>({ open: false, context: { type: 'GENERAL' as const } });
  const activeFairs = fairsWithCountdown || payload?.fairsWithCountdown || [];
  const liveTenders = Array.isArray(rawTenders) ? rawTenders : [];
  const hasTenders = liveTenders.length > 0;
  const safeLang = lang || 'tr';
  const targetLang = safeLang.toUpperCase();
  
  const pool = [...(Array.isArray(haftaninFirsatlari)?haftaninFirsatlari:[]), ...(Array.isArray(gridArticles)?gridArticles:[])];
  const uniquePool = Array.from(new Map(pool.filter(item => item && item.id).map(item => [item.id, item])).values());

  const getLink = (path: string, slug?: string) => {
    const bp = basePath || '';
    if (safeLang === 'tr') {
      const map: Record<string, string> = { news: 'haberler', tenders: 'ihaleler', academy: 'akademi', trade: 'ticaret', fairs: 'fuar-takvimi', radar: 'radar' };
      return `${bp}/${map[path] || path}${slug ? `/${slug}` : ''}`;
    }
    return `${bp}/${path}${slug ? `/${slug}` : ''}?lang=${safeLang}`;
  };

  const getImg = (a: any) => a?.images?.[0] || a?.image_url || 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=400&auto=format&fit=crop';
  const getTitle = (a: any) => a?.translations?.[targetLang]?.title || a?.title || '';

  const totalTenders = liveTenders.filter((t:any) => t.type === 'TENDER').length;
  const totalStock = liveTenders.filter((t:any) => t.type === 'HOT_STOCK').length;
  const totalCapacity = liveTenders.filter((t:any) => t.type === 'CAPACITY').length;

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', color: '#111827', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root { --sf: 'Playfair Display',Georgia,serif; --s: 'Inter',-apple-system,sans-serif; --m: 'JetBrains Mono',monospace; --re: #DC2626; --go: #16A34A; --wa: #EAB308; --accent: #CC0000; }
        .tc { max-width: 1400px; margin: 0 auto; padding: 0 2rem; }
        .section-title { font-family: var(--sf); font-size: clamp(1.4rem, 2.5vw, 2rem); font-weight: 900; color: #111827; margin-bottom: 0.25rem; }
        .section-sub { font-family: var(--m); font-size: 0.7rem; color: #9CA3AF; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.5rem; }
        .card { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; transition: all 0.2s; }
        .card:hover { border-color: #D1D5DB; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
        .link-arrow { font-family: var(--m); font-size: 0.8rem; font-weight: 700; color: var(--accent); text-decoration: none; }
        .link-arrow:hover { text-decoration: underline; }
        .stat-badge { font-family: var(--m); font-size: 0.75rem; font-weight: 800; padding: 0.4rem 0.8rem; color: #FFF; border-radius: 6px; }
      `}} />

      {/* TICKER */}
      {tickerItems && tickerItems.length > 0 && <IntelligenceTicker items={tickerItems} />}

      {/* NAVBAR */}
      <TrtexNavbar basePath={basePath} brandName={brandName} lang={lang} activePage="home" />

      {/* ═══ SECTION 1: FEATURED STORY (Kompakt Manşet) ═══ */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <div className="tc" style={{ padding: '3rem 2rem', display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 55%', minWidth: '300px' }}>
            {heroArticle && (
              <>
                <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
                  🔴 {heroArticle.category?.toUpperCase() || 'SON DAKİKA'}
                </div>
                <h1 style={{ fontFamily: 'var(--sf)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 900, lineHeight: 1.15, color: '#111827', marginBottom: '1rem' }}>
                  {getTitle(heroArticle)}
                </h1>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#4B5563', marginBottom: '1.5rem', maxWidth: '90%' }}>
                  {heroArticle.summary}
                </p>
                <a href={getLink('news', heroArticle.slug || heroArticle.id)} style={{ display: 'inline-block', padding: '0.7rem 1.8rem', background: '#111827', color: '#FFF', fontWeight: 700, fontSize: '0.85rem', borderRadius: '6px', textDecoration: 'none' }}>
                  {safeLang === 'tr' ? 'Haberi Oku →' : 'Read Article →'}
                </a>
              </>
            )}
          </div>
          <div style={{ flex: '1 1 35%', minWidth: '280px', maxHeight: '320px' }}>
            {heroArticle && (
              <img src={getImg(heroArticle)} alt="" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #E5E7EB' }} />
            )}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: HABERLER GRID + SIDEBAR ═══ */}
      <section style={{ padding: '3rem 0' }}>
        <div className="tc">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <div className="section-sub">📰 GÜNCEL İSTİHBARAT</div>
              <h2 className="section-title">Son Haberler</h2>
            </div>
            <a href={getLink('news')} className="link-arrow">Tüm Haberler →</a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            {/* SOL: Haber Kartları */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {uniquePool.slice(0, 6).map((a: any) => (
                <a href={getLink('news', a.slug || a.id)} key={a.id} className="card" style={{ display: 'flex', gap: '1rem', padding: '1rem', textDecoration: 'none', color: 'inherit' }}>
                  <img src={getImg(a)} alt="" style={{ width: '140px', height: '100px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--m)', fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.3rem' }}>
                      {a.category?.toUpperCase() || 'SEKTÖREL'}
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '0.3rem', color: '#111827' }}>{getTitle(a)}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{a.summary}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* SAĞ: Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Piyasa Verileri */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.1em', marginBottom: '1rem' }}>📊 PİYASA VERİLERİ</div>
                {tickerItems.length > 0 ? tickerItems.filter((t: any) => !t.isBreaking && !t.isCountdown).slice(0, 4).map((t: any, i: number) => {
                  const dirColor = t.direction === 'up' ? 'var(--go)' : t.direction === 'down' ? 'var(--re)' : 'var(--wa)';
                  const arrow = t.direction === 'up' ? '△' : t.direction === 'down' ? '▽' : '–';
                  return (
                    <div key={t.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < 3 ? '1px solid #F3F4F6' : 'none' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>{t.label}</span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontFamily: 'var(--m)' }}>
                        {t.change !== undefined && <span style={{ fontSize: '0.7rem', color: dirColor }}>{arrow}{Math.abs(t.change).toFixed(1)}%</span>}
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827' }}>{typeof t.value === 'number' ? t.value.toLocaleString('en-US') : t.value}{t.unit ? ` ${t.unit}` : ''}</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div style={{ fontSize: '0.8rem', color: '#9CA3AF', textAlign: 'center', padding: '1rem 0' }}>Piyasa verileri yükleniyor...</div>
                )}
              </div>

              {/* Trend Haberler */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.1em', marginBottom: '1rem' }}>🔥 TREND</div>
                {uniquePool.slice(6, 11).map((a: any, i: number) => (
                  <a href={getLink('news', a.slug || a.id)} key={a.id} style={{ display: 'block', padding: '0.5rem 0', borderBottom: i < 4 ? '1px solid #F3F4F6' : 'none', textDecoration: 'none' }}>
                    <span style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', color: '#D1D5DB', marginRight: '0.5rem' }}>0{i+1}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', lineHeight: 1.4 }}>{getTitle(a)}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: İHALE & TİCARET ═══ */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', padding: '3rem 0' }}>
        <div className="tc">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <div className="section-sub">🔴 CANLI TİCARET FIRSATLARI</div>
              <h2 className="section-title">İhaleler & Ticaret</h2>
            </div>
            <a href={getLink('tenders')} className="link-arrow">Tüm İhaleler →</a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* İhaleler */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="stat-badge" style={{ background: 'var(--re)' }}>🔴 {totalTenders} İHALE</span>
                <span style={{ fontFamily: 'var(--m)', fontSize: '0.65rem', color: '#9CA3AF' }}>CANLI</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Küresel İhaleler</h3>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>Avrupa, Ortadoğu ve Asya'daki otel, hastane projelerine anında teklif verin.</p>
              <a href={getLink('tenders')} style={{ display: 'block', textAlign: 'center', padding: '0.7rem', border: '1px solid #E5E7EB', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', color: '#111827', textDecoration: 'none' }}>İhaleleri Görüntüle →</a>
            </div>

            {/* Sıcak Stok */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="stat-badge" style={{ background: 'var(--go)' }}>🟢 {totalStock} STOK</span>
                <span style={{ fontFamily: 'var(--m)', fontSize: '0.65rem', color: '#9CA3AF' }}>GÜNCEL</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Sıcak Stok Fırsatları</h3>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>Depodaki hazır kumaş ve ürün lotlarını hemen satın alın veya fiyat isteyin.</p>
              <a href={getLink('tenders')} style={{ display: 'block', textAlign: 'center', padding: '0.7rem', border: '1px solid #E5E7EB', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', color: '#111827', textDecoration: 'none' }}>Stokları İncele →</a>
            </div>

            {/* Boş Kapasite */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="stat-badge" style={{ background: 'var(--wa)', color: '#000' }}>🟡 {totalCapacity} KAPASİTE</span>
                <span style={{ fontFamily: 'var(--m)', fontSize: '0.65rem', color: '#9CA3AF' }}>AÇIK</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Boş Kapasite Bildirin</h3>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>Dokuma veya konfeksiyon boşluklarınızı global alıcılara anonim duyurun.</p>
              <button onClick={() => setLeadModal({ open: true, context: { type: 'CAPACITY' } })} style={{ display: 'block', width: '100%', textAlign: 'center', padding: '0.7rem', background: 'var(--wa)', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', color: '#000', cursor: 'pointer' }}>Hemen İlan Ver →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4: FUAR TAKVİMİ ═══ */}
      {activeFairs && activeFairs.length > 0 && (
        <section style={{ padding: '3rem 0' }}>
          <div className="tc">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
              <div>
                <div className="section-sub">📅 YAKLAŞAN ETKINLIKLER</div>
                <h2 className="section-title">Fuar Takvimi</h2>
              </div>
              <a href={getLink('fairs')} className="link-arrow">Tüm Fuarlar →</a>
            </div>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {activeFairs.slice(0, 6).map((f: any, i: number) => (
                <div key={i} className="card" style={{ minWidth: '250px', padding: '1.25rem', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--m)', fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 800, marginBottom: '0.5rem' }}>{f.date || f.startDate || '2026'}</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.3rem', lineHeight: 1.3 }}>{f.name || f.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{f.location || f.city || ''}</p>
                  {f.daysLeft != null && <div style={{ fontFamily: 'var(--m)', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, marginTop: '0.5rem' }}>{f.daysLeft} gün kaldı</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ SECTION 5: DÜNYA RADARI ═══ */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E5E7EB', padding: '3rem 0' }}>
        <div className="tc">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <div className="section-sub">🌍 KÜRESEL İSTİHBARAT</div>
              <h2 className="section-title">Dünya Radarı</h2>
            </div>
            <a href={getLink('radar')} className="link-arrow">Tüm Sinyaller →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '⚠️', label: 'RİSK ANALİZİ', desc: radarStream?.risk ? (getTitle(radarStream.risk) || radarStream.risk.summary || 'Hammadde fiyat dalgalanmaları ve tedarik zinciri riskleri') : 'Hammadde fiyat dalgalanmaları ve tedarik zinciri riskleri', color: '#DC2626', link: radarStream?.risk?.slug },
              { icon: '💡', label: 'FIRSAT RADARI', desc: radarStream?.opportunity ? (getTitle(radarStream.opportunity) || radarStream.opportunity.summary || 'Yeni pazarlar ve büyüyen segmentler') : 'Yeni pazarlar ve büyüyen segmentler', color: '#16A34A', link: radarStream?.opportunity?.slug },
              { icon: '📡', label: 'PİYASA SİNYALLERİ', desc: radarStream?.signal ? (getTitle(radarStream.signal) || radarStream.signal.summary || 'Küresel pazarlardan canlı ticari sinyaller') : 'Küresel pazarlardan canlı ticari sinyaller', color: '#2563EB', link: radarStream?.signal?.slug },
              { icon: '📈', label: 'TREND TAHMİNLERİ', desc: uzakDoguRadari ? (getTitle(uzakDoguRadari) || uzakDoguRadari.summary || '2026/2027 sezon trendleri ve tüketici davranışı analizi') : '2026/2027 sezon trendleri ve tüketici davranışı analizi', color: '#7C3AED', link: uzakDoguRadari?.slug },
            ].map((item, i) => (
              <a href={item.link ? getLink('news', item.link) : getLink('radar')} key={i} className="card" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', borderLeft: `3px solid ${item.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                  <span style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', fontWeight: 800, color: item.color, letterSpacing: '0.1em' }}>{item.label}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.6 }}>{typeof item.desc === 'string' && item.desc.length > 120 ? item.desc.substring(0, 120) + '…' : item.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 6: AKADEMİ ═══ */}
      <section style={{ padding: '3rem 0', borderTop: '1px solid #E5E7EB' }}>
        <div className="tc">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <div className="section-sub">🎓 SEKTÖR EĞİTİMİ</div>
              <h2 className="section-title">Akademi</h2>
            </div>
            <a href={getLink('academy')} className="link-arrow">Akademi'ye Git →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {(academyArticles.length > 0 ? academyArticles : uniquePool.slice(0, 4)).map((a: any) => (
              <a href={getLink('news', a.slug || a.id)} key={a.id} className="card" style={{ display: 'flex', gap: '1rem', padding: '1rem', textDecoration: 'none', color: 'inherit' }}>
                <img src={getImg(a)} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: 'var(--m)', fontSize: '0.6rem', color: 'var(--go)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.25rem' }}>EĞİTİM</div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.3, color: '#111827' }}>{getTitle(a)}</h4>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <LeadCaptureModal isOpen={leadModal.open} onClose={() => setLeadModal({ open: false, context: { type: 'GENERAL' } })} context={leadModal.context} brandName={brandName} />
      <TrtexFooter basePath={basePath} brandName={brandName} lang={lang} />
      <SovereignLiveConcierge />
    </div>
  );
}
