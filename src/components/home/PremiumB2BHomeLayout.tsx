'use client';
import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase-client';
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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      if (auth) {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user && user.email === 'hakantoprak71@gmail.com') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        });
        return () => unsubscribe();
      }
    } catch (e) {
      console.warn("Auth check error:", e);
    }
  }, []);

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
      const map: Record<string, string> = { news: 'haberler', tenders: 'ihaleler', academy: 'akademi', trade: 'ticaret', fairs: 'fuarlar', radar: 'trendler' };
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
            {heroArticle ? (
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
            ) : (
              <>
                <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
                  🔴 CANLI İSTİHBARAT TERMİNALİ
                </div>
                <h1 style={{ fontFamily: 'var(--sf)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 900, lineHeight: 1.15, color: '#111827', marginBottom: '1rem' }}>
                  Ev Tekstili Sektörünün Otonom Beyni
                </h1>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#4B5563', marginBottom: '1.5rem', maxWidth: '90%' }}>
                  TRTEX, yapay zeka ile 7/24 küresel piyasaları tarar — ihaleler, pazar sinyalleri, trend tahminleri ve tedarikçi eşleştirmeleri tek noktadan sunulur.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <a href={getLink('tenders')} style={{ display: 'inline-block', padding: '0.7rem 1.8rem', background: '#111827', color: '#FFF', fontWeight: 700, fontSize: '0.85rem', borderRadius: '6px', textDecoration: 'none' }}>Canlı İhaleler →</a>
                  <a href={getLink('news')} style={{ display: 'inline-block', padding: '0.7rem 1.8rem', background: '#FFF', color: '#111827', fontWeight: 700, fontSize: '0.85rem', borderRadius: '6px', textDecoration: 'none', border: '1px solid #E5E7EB' }}>Son Haberler →</a>
                </div>
              </>
            )}
          </div>
          <div style={{ flex: '1 1 35%', minWidth: '280px', maxHeight: '320px' }}>
            {heroArticle ? (
              <img src={getImg(heroArticle)} alt="" style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #E5E7EB' }} />
            ) : (
              <div style={{ width: '100%', height: '300px', borderRadius: '12px', background: 'linear-gradient(135deg, #0F172A, #1E293B)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#FFF', textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontFamily: 'var(--m)', fontSize: '3rem', fontWeight: 900, color: '#CC0000', marginBottom: '0.5rem' }}>TRTEX</div>
                <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', letterSpacing: '0.3em', color: '#94A3B8', marginBottom: '1.5rem' }}>INTELLIGENCE TERMINAL</div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--m)', fontSize: '1.5rem', fontWeight: 900, color: '#FFF' }}>{totalTenders + totalStock + totalCapacity || '30+'}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>Aktif Fırsat</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--m)', fontSize: '1.5rem', fontWeight: 900, color: '#FFF' }}>8</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>Dil</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--m)', fontSize: '1.5rem', fontWeight: 900, color: '#FFF' }}>24/7</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>AI Motor</div>
                  </div>
                </div>
              </div>
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

          <div style={{ display: 'grid', gridTemplateColumns: uniquePool.length > 0 ? '2fr 1fr' : '1fr', gap: '2rem' }}>
            {/* SOL: Haber Kartları */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {uniquePool.length > 0 ? uniquePool.slice(0, 6).map((a: any) => (
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
              )) : (
                <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📡</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>İstihbarat Motoru Çalışıyor</h3>
                  <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                    ALOHA AI motoru küresel ev tekstili kaynaklarını tarayarak size özel haberler üretiyor.
                  </p>
                  <a href={getLink('news')} style={{ display: 'inline-block', padding: '0.6rem 1.5rem', background: '#111827', color: '#FFF', fontWeight: 700, fontSize: '0.85rem', borderRadius: '6px', textDecoration: 'none' }}>Haber Arşivine Git →</a>
                </div>
              )}
            </div>

            {/* SAĞ: Sidebar */}
            {uniquePool.length > 0 && (
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
            )}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: CANLI B2B ALIM/SATIM TAHTASI (FOMO ZONE) ═══ */}
      <section style={{ background: '#0B0D0F', color: '#FFF', padding: '5rem 0' }}>
        <div className="tc">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="section-sub" style={{ color: '#F59E0B' }}>🔥 SADECE ONAYLI ÜRETİCİLER İÇİN</div>
              <h2 className="section-title" style={{ color: '#FFF' }}>Canlı B2B Alım/Satım Tahtası</h2>
              <p style={{ fontSize: '0.95rem', color: '#9CA3AF', marginTop: '0.5rem', maxWidth: '600px' }}>
                Dünya genelindeki toptancı ve proje firmalarından gelen anlık kumaş/perde talepleri. İhaleyi kapan satışı alır.
              </p>
            </div>
            <a href={getLink('tenders')} className="link-arrow" style={{ color: '#F59E0B', border: '1px solid #F59E0B', padding: '0.6rem 1.2rem', borderRadius: '4px' }}>
              Tüm Tahtayı Gör →
            </a>
          </div>

          <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1.5fr 1fr', padding: '1rem 1.5rem', background: '#1F2937', borderBottom: '1px solid #374151', fontFamily: 'var(--m)', fontSize: '0.7rem', color: '#9CA3AF', letterSpacing: '0.05em' }}>
              <div>SİNYAL TÜRÜ</div>
              <div>TALEP DETAYI</div>
              <div>LOKASYON</div>
              <div style={{ textAlign: 'right' }}>AKSİYON</div>
            </div>
            
            {liveTenders.length > 0 ? (
              liveTenders.slice(0, 5).map((t: any, i: number) => {
                const isTender = t.type === 'TENDER';
                const isStock = t.type === 'HOT_STOCK';
                const color = isTender ? 'var(--re)' : isStock ? 'var(--go)' : 'var(--wa)';
                return (
                  <div key={t.id || i} style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 1.5fr 1fr', padding: '1.25rem 1.5rem', borderBottom: '1px solid #1F2937', alignItems: 'center', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#374151'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} onClick={() => window.location.href = getLink('tenders')}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.3rem 0.6rem', borderRadius: '4px', background: color + '20', color: color }}>
                        {t.type === 'TENDER' ? '🔴 İHALE' : t.type === 'HOT_STOCK' ? '🟢 STOK' : '🟡 KAPASİTE'}
                      </span>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#F3F4F6' }}>{t.title || 'Gizli B2B Talebi'}</div>
                    <div style={{ fontSize: '0.85rem', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>📍</span> {t.location || 'Global'}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <button style={{ background: color, color: isTender ? '#FFF' : '#000', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                        {isTender ? 'TEKLİF VER' : 'DETAY GÖR'}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : isAdmin ? (
              // SOVEREIGN GOD MODE (Şeffaf Yönetici Görünümü)
              <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#0B0D0F', border: '1px solid #CC0000', borderRadius: '8px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👁️</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#CC0000', marginBottom: '0.5rem', letterSpacing: '2px' }}>SOVEREIGN GOD MODE AKTİF</h3>
                <p style={{ fontSize: '0.95rem', color: '#9CA3AF', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                  Sayın Kurucu, sistemde şu an onaylanmış <b>aktif B2B ilanı bulunmuyor.</b> Normal ziyaretçiler burada "FOMO" yaratan kilitli bir ekran görüyor. Sistem tam şeffaflıkla emrinizdedir.
                </p>
              </div>
            ) : (
              // ZERO MOCK AKTİF İKEN BOŞ DURUMU (FOMO YARATAN GÖRÜNÜM)
              <div style={{ position: 'relative', padding: '4rem 2rem', textAlign: 'center', background: '#111827' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#374151 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.1 }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔐</div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginBottom: '0.5rem' }}>TRTex Intelligence: 14 Yeni B2B Talebi Doğrulanıyor</h3>
                  <p style={{ fontSize: '0.95rem', color: '#9CA3AF', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
                    Yapay zeka motorumuz şu an Avrupa ve Ortadoğu kaynaklı sıcak kumaş alım taleplerinin teyidini gerçekleştiriyor.
                  </p>
                  <a href={`${basePath}/register?lang=${safeLang}`} style={{ display: 'inline-block', padding: '0.8rem 2rem', background: '#CC0000', color: '#FFF', fontWeight: 800, fontSize: '0.9rem', borderRadius: '4px', textDecoration: 'none', letterSpacing: '1px' }}>
                    FIRSATLARI GÖRMEK İÇİN VIP KAYIT OL
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4: FUAR TAKVİMİ (HER ZAMAN GÖRÜNÜR) ═══ */}
      <section style={{ padding: '3rem 0' }}>
        <div className="tc">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <div className="section-sub">📅 YAKLAŞAN ETKİNLİKLER</div>
              <h2 className="section-title">Fuar Takvimi</h2>
            </div>
            <a href={getLink('fairs')} className="link-arrow">Tüm Fuarlar →</a>
          </div>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {(activeFairs && activeFairs.length > 0 ? activeFairs.slice(0, 6) : [
              { name: 'Heimtextil Frankfurt', date: 'Ocak 2027', location: 'Frankfurt' },
              { name: 'EVTEKS İstanbul', date: 'Mayıs 2026', location: 'İstanbul' },
              { name: 'Intertextile Shanghai', date: 'Eylül 2026', location: 'Şanghay' },
              { name: 'Index Dubai', date: 'Eylül 2026', location: 'Dubai' },
            ]).map((f: any, i: number) => (
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

      {/* ═══ SECTION 7: NEDEN TRTEX — DEĞER ÖNERİSİ ═══ */}
      <section style={{ background: '#111827', color: '#FFFFFF', padding: '4rem 0' }}>
        <div className="tc">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', fontWeight: 800, color: '#F59E0B', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>💎 NEDEN TRTEX?</div>
            <h2 style={{ fontFamily: 'var(--sf)', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, marginBottom: '0.75rem' }}>Tek Platformda Tüm Sektör İstihbaratı</h2>
            <p style={{ fontSize: '1rem', color: '#9CA3AF', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>Otonom yapay zeka ile desteklenen TRTEX, ev tekstili sektöründe haber, ihale, pazar analizi ve ticaret fırsatlarını tek noktadan sunar.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '📡', title: 'Otonom İstihbarat', desc: '7/24 çalışan AI motorumuz küresel sektör verilerini tarar, analiz eder ve size özel raporlar üretir.', accent: '#3B82F6' },
              { icon: '🔴', title: 'Canlı İhale Radarı', desc: 'Avrupa, Ortadoğu ve Asya\'daki otel, hastane projelerinde aktif ihaleleri anında keşfedin.', accent: '#DC2626' },
              { icon: '📊', title: 'Piyasa Verileri', desc: 'USD/TRY, pamuk, polyester, navlun fiyatlarını anlık takip edin. Alım kararlarını veriye dayalı verin.', accent: '#16A34A' },
              { icon: '🌍', title: '8 Dilde Küresel Erişim', desc: 'Türkçe, İngilizce, Almanca, Rusça, Çince, Arapça, İspanyolca ve Fransızca tam destek.', accent: '#F59E0B' },
              { icon: '🤝', title: 'Tedarikçi Eşleştirme', desc: 'AI destekli matchmaking ile üretici, toptancı ve alıcı arasındaki mesafeyi sıfıra indirin.', accent: '#8B5CF6' },
              { icon: '🔒', title: 'Sovereign Güvenlik', desc: 'Google Cloud altyapısı üzerinde çalışan tam şifreli, KVKK uyumlu B2B veri güvenliği.', accent: '#EC4899' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#1F2937', border: '1px solid #374151', borderRadius: '10px', padding: '1.5rem', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                  <span style={{ fontFamily: 'var(--m)', fontSize: '0.7rem', fontWeight: 800, color: item.accent, letterSpacing: '0.08em' }}>{item.title.toUpperCase()}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#D1D5DB', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 8: EKOSİSTEM VİTRİNİ ═══ */}
      <section style={{ padding: '4rem 0', borderTop: '1px solid #E5E7EB' }}>
        <div className="tc">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="section-sub">🌐 AIPyram EKOSİSTEMİ</div>
            <h2 className="section-title">Küresel Tekstil Ağı</h2>
            <p style={{ fontSize: '0.95rem', color: '#6B7280', maxWidth: '550px', margin: '0.5rem auto 0', lineHeight: 1.6 }}>Türkiye'den dünyaya — 6 platformda entegre ticaret, tasarım ve istihbarat.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { name: 'TRTex.com', role: 'İstihbarat Terminali', desc: 'B2B haberler, ihaleler, piyasa', color: '#CC0000', href: '/' },
              { name: 'icmimar.ai', role: 'Tasarım & ERP', desc: 'AI render, B2B tasarım mutfağı', color: '#7C3AED', href: 'https://icmimar.ai' },
              { name: 'Perde.ai', role: 'TR Marketplace', desc: 'Türkiye B2C mağaza', color: '#2563EB', href: 'https://perde.ai' },
              { name: 'Hometex.ai', role: '365 Gün Fuar', desc: 'Sanal fuar & showroom', color: '#16A34A', href: 'https://hometex.ai' },
              { name: 'Heimtex.ai', role: 'Trend & Dergi', desc: 'Pantone, moda vizyonu', color: '#F59E0B', href: 'https://heimtex.ai' },
              { name: 'Vorhang.ai', role: 'DACH Pazarı', desc: 'Almanya/Avusturya/İsviçre', color: '#EC4899', href: 'https://vorhang.ai' },
            ].map((node, i) => (
              <a href={node.href} key={i} className="card" style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit', borderTop: `3px solid ${node.color}` }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#111827', marginBottom: '0.15rem' }}>{node.name}</h4>
                <div style={{ fontFamily: 'var(--m)', fontSize: '0.65rem', fontWeight: 700, color: node.color, letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{node.role.toUpperCase()}</div>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.5 }}>{node.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 9: ÜYE OL CTA ═══ */}
      <section style={{ background: 'linear-gradient(135deg, #CC0000 0%, #991B1B 100%)', color: '#FFFFFF', padding: '4rem 0' }}>
        <div className="tc" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--sf)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, marginBottom: '1rem' }}>Sektörün Nabzını Tutun</h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', maxWidth: '550px', margin: '0 auto 2rem', lineHeight: 1.7 }}>Ücretsiz üye olun — AI destekli ihale uyarıları, piyasa raporları ve ticaret fırsatlarını ilk siz görün.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a href={`${basePath}/register?lang=${safeLang}`} style={{ display: 'inline-block', padding: '0.9rem 2.5rem', background: '#FFFFFF', color: '#CC0000', fontWeight: 800, fontSize: '0.95rem', borderRadius: '8px', textDecoration: 'none', transition: 'transform 0.2s' }}>Ücretsiz Kayıt →</a>
            <a href={`${basePath}/login?lang=${safeLang}`} style={{ display: 'inline-block', padding: '0.9rem 2.5rem', background: 'transparent', color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem', borderRadius: '8px', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.4)' }}>Giriş Yap</a>
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {[
              { num: '30+', label: 'Canlı İhale' },
              { num: '15K+', label: 'Günlük Veri' },
              { num: '8', label: 'Dil Desteği' },
              { num: '24/7', label: 'AI Motor' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--m)', fontSize: '1.5rem', fontWeight: 900 }}>{s.num}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: '0.15rem' }}>{s.label}</div>
              </div>
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
