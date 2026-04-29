'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AipyramAuthProvider';

// ═══ DİL SEÇENEKLERİ ═══
const LANG_OPTIONS = [
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
];

// ═══ NAV ETİKETLERİ (8 DİL) ═══
const navLabels: Record<string, { news: string; tenders: string; trade: string; academy: string; register: string; about: string; trends: string; fairs: string }> = {
  TR: { news: 'HABERLER', tenders: 'İHALELER', trade: 'TİCARET', academy: 'AKADEMİ', register: 'Ücretsiz Kayıt', about: 'HAKKIMIZDA', trends: 'TRENDLER', fairs: 'FUAR TAKVİMİ' },
  EN: { news: 'NEWS', tenders: 'TENDERS', trade: 'TRADE', academy: 'ACADEMY', register: 'Free Sign Up', about: 'ABOUT US', trends: 'TRENDS', fairs: 'FAIR CALENDAR' },
  DE: { news: 'NACHRICHTEN', tenders: 'AUSSCHREIBUNGEN', trade: 'HANDEL', academy: 'AKADEMIE', register: 'Kostenlos Registrieren', about: 'ÜBER UNS', trends: 'TRENDS', fairs: 'MESSEKALENDER' },
  RU: { news: 'НОВОСТИ', tenders: 'ТЕНДЕРЫ', trade: 'ТОРГОВЛЯ', academy: 'АКАДЕМИЯ', register: 'Регистрация', about: 'О НАС', trends: 'ТРЕНДЫ', fairs: 'КАЛЕНДАРЬ ВЫСТАВОК' },
  ZH: { news: '新闻', tenders: '招标', trade: '贸易', academy: '学院', register: '免费注册', about: '关于我们', trends: '趋势', fairs: '展会日历' },
  AR: { news: 'أخبار', tenders: 'مناقصات', trade: 'تجارة', academy: 'أكاديمية', register: 'تسجيل مجاني', about: 'من نحن', trends: 'اتجاهات', fairs: 'تقويم المعارض' },
  ES: { news: 'NOTICIAS', tenders: 'LICITACIONES', trade: 'COMERCIO', academy: 'ACADEMIA', register: 'Registro Gratis', about: 'SOBRE NOSOTROS', trends: 'TENDENCIAS', fairs: 'CALENDARIO DE FERIAS' },
  FR: { news: 'ACTUALITÉS', tenders: 'APPELS D\'OFFRES', trade: 'COMMERCE', academy: 'ACADÉMIE', register: 'Inscription Gratuite', about: 'À PROPOS', trends: 'TENDANCES', fairs: 'CALENDRIER DES SALONS' },
};

interface TrtexNavbarProps {
  basePath: string;
  brandName?: string;
  lang?: string;
  activePage?: string;
  theme?: 'light' | 'dark';
}

/**
 * TRTEX Ortak Navbar — Tüm sayfalar bu bileşeni kullanır.
 * REFERANS: /ihaleler sayfasının karakter rengi ve stili.
 * Tüm sayfalarda BİREBİR AYNI görünür. Sıfırdan yazıldı.
 */
export default function TrtexNavbar({ basePath, brandName = 'TRTEX', lang = 'tr', activePage, theme = 'light' }: TrtexNavbarProps) {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const safeLang = lang || 'tr';
  const targetLang = safeLang.toUpperCase();
  const L = navLabels[targetLang] || navLabels.TR;
  const currentLangObj = LANG_OPTIONS.find(l => l.code === safeLang) || LANG_OPTIONS[0];

  const getUrl = (key: string) => {
    const bp = basePath || '';
    if (safeLang === 'tr') {
      const map: Record<string, string> = { news: 'haberler', tenders: 'ihaleler', trends: 'radar', academy: 'akademi', fairs: 'fuar-takvimi', trade: 'ticaret', about: 'hakkimizda' };
      return `${bp}/${map[key] || key}`;
    }
    return `${bp}/${key}?lang=${safeLang}`;
  };

  const menuItems = [
    { key: 'news',        label: L.news },
    { key: 'tenders',     label: L.tenders },
    { key: 'trade',       label: L.trade },
    { key: 'trends',      label: L.trends },
    { key: 'fairs',       label: L.fairs },
    { key: 'academy',     label: L.academy },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700;800&display=swap');
        .trtex-nav { position: sticky; top: 0; z-index: 100; width: 100%; background: #FFFFFF; border-bottom: 1px solid #E5E7EB; transition: box-shadow 0.3s; }
        .trtex-nav.scrolled { box-shadow: 0 4px 20px -5px rgba(0,0,0,0.06); }
        .trtex-nav-inner { max-width: 1400px; margin: 0 auto; padding: 0 2rem; display: flex; justify-content: space-between; align-items: center; height: 72px; }
        .trtex-logo { font-family: 'Playfair Display', Georgia, serif; font-size: 1.6rem; font-weight: 900; color: #111827; text-decoration: none; letter-spacing: -0.02em; }
        .trtex-logo .dot { color: #CC0000; }
        .trtex-menu { display: none; align-items: center; gap: 0; }
        @media (min-width: 1024px) { .trtex-menu { display: flex; } }
        .trtex-menu-link { font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 500; color: #4B5563; text-decoration: none; padding: 0 1rem; height: 72px; display: flex; align-items: center; transition: color 0.2s; letter-spacing: 0.02em; border-bottom: 2px solid transparent; }
        .trtex-menu-link:hover { color: #111827; }
        .trtex-menu-link.active { color: #111827; font-weight: 700; border-bottom-color: #CC0000; }
        .trtex-lang-wrap { position: relative; cursor: pointer; }
        .trtex-lang-btn { font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600; color: #4B5563; padding: 0 0.75rem; height: 72px; display: flex; align-items: center; gap: 4px; background: none; border: none; cursor: pointer; }
        .trtex-lang-btn:hover { color: #111827; }
        .trtex-lang-dd { display: none; position: absolute; right: 0; top: 100%; min-width: 200px; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 12px 40px -10px rgba(0,0,0,0.12); z-index: 200; overflow: hidden; padding: 0.5rem 0; }
        .trtex-lang-wrap:hover .trtex-lang-dd { display: block; }
        .trtex-lang-dd a { display: flex; align-items: center; gap: 10px; padding: 0.65rem 1.25rem; font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 500; color: #374151; text-decoration: none; transition: background 0.15s; }
        .trtex-lang-dd a:hover { background: #F3F4F6; }
        .trtex-lang-dd a.selected { background: #CC0000; color: #FFFFFF; font-weight: 700; }
        .trtex-register { font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 700; color: #FFFFFF; background: #CC0000; padding: 0.6rem 1.5rem; border-radius: 8px; text-decoration: none; margin-left: 1rem; transition: all 0.2s; border: none; cursor: pointer; white-space: nowrap; }
        .trtex-register:hover { background: #B91C1C; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(204,0,0,0.3); }
        .trtex-user-wrap { position: relative; cursor: pointer; margin-left: 1rem; }
        .trtex-user-btn { font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 600; color: #374151; padding: 0.5rem 1rem; display: flex; align-items: center; gap: 6px; background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 8px; cursor: pointer; }
        .trtex-user-btn:hover { background: #E5E7EB; }
        .trtex-user-dd { display: none; position: absolute; right: 0; top: calc(100% + 8px); min-width: 220px; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 12px 40px -10px rgba(0,0,0,0.12); z-index: 200; overflow: hidden; }
        .trtex-user-wrap:hover .trtex-user-dd { display: block; }
        .trtex-hamburger { display: flex; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 8px; }
        @media (min-width: 1024px) { .trtex-hamburger { display: none; } }
        .trtex-hamburger span { display: block; width: 22px; height: 2px; background: #374151; transition: all 0.3s; }
        .trtex-mobile { position: fixed; inset: 0; z-index: 150; background: #FFFFFF; padding-top: 80px; overflow-y: auto; }
        .trtex-mobile-link { display: block; padding: 1rem 2rem; font-family: 'Inter', sans-serif; font-size: 1rem; font-weight: 600; color: #374151; text-decoration: none; border-bottom: 1px solid #F3F4F6; }
        .trtex-mobile-link:hover, .trtex-mobile-link.active { color: #CC0000; background: #FEF2F2; }
      `}} />

      <nav className={`trtex-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="trtex-nav-inner">
          {/* LOGO */}
          <a href={basePath} className="trtex-logo">
            Trtex<span className="dot">.</span>com
          </a>

          {/* DESKTOP MENU */}
          <div className="trtex-menu">
            {menuItems.map(item => (
              <a
                key={item.key}
                href={getUrl(item.key)}
                className={`trtex-menu-link ${activePage === item.key ? 'active' : ''}`}
              >
                {item.label}
              </a>
            ))}

            {/* DİL SEÇİCİ */}
            <div className="trtex-lang-wrap">
              <button className="trtex-lang-btn">
                {currentLangObj.flag} {currentLangObj.code.toUpperCase()} <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>▾</span>
              </button>
              <div className="trtex-lang-dd">
                {LANG_OPTIONS.map(opt => (
                  <a
                    key={opt.code}
                    href={`${basePath || ''}?lang=${opt.code}`}
                    className={opt.code === lang ? 'selected' : ''}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{opt.flag}</span>
                    <span>{opt.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* SSO / ÜYELİK */}
            {user ? (
              <div className="trtex-user-wrap">
                <button className="trtex-user-btn">
                  {user.displayName?.split(' ')[0] || 'ÜYE'} <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>▾</span>
                </button>
                <div className="trtex-user-dd">
                  <div style={{ padding: '0.75rem 1.25rem', fontSize: '0.8rem', color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>
                    {user.email}
                  </div>
                  <a href={`${basePath}/dashboard?lang=${lang}`} style={{ display: 'block', padding: '0.75rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, color: '#374151', textDecoration: 'none' }}>
                    Terminal Dashboard
                  </a>
                  <button onClick={logout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, color: '#DC2626', background: 'none', border: 'none', borderTop: '1px solid #F3F4F6', cursor: 'pointer' }}>
                    Çıkış Yap
                  </button>
                </div>
              </div>
            ) : (
              <a href={`${basePath}/login?lang=${lang}`} className="trtex-register">
                {L.register}
              </a>
            )}
          </div>

          {/* MOBILE HAMBURGER */}
          <button className="trtex-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
            <span style={mobileMenuOpen ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}} />
            <span style={mobileMenuOpen ? { opacity: 0 } : {}} />
            <span style={mobileMenuOpen ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}} />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="trtex-mobile">
          {menuItems.map(item => (
            <a key={item.key} href={getUrl(item.key)} className={`trtex-mobile-link ${activePage === item.key ? 'active' : ''}`}>
              {item.label}
            </a>
          ))}
          <div style={{ padding: '1rem 2rem', borderTop: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>🌐 DİL / LANGUAGE</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {LANG_OPTIONS.map(opt => (
                <a
                  key={opt.code}
                  href={`${basePath}?lang=${opt.code}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem',
                    background: opt.code === lang ? '#CC0000' : '#F9FAFB',
                    color: opt.code === lang ? '#FFFFFF' : '#374151',
                    border: '1px solid ' + (opt.code === lang ? '#CC0000' : '#E5E7EB'),
                    borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
                  }}
                >
                  {opt.flag} {opt.name}
                </a>
              ))}
            </div>
          </div>
          <div style={{ padding: '1rem 2rem' }}>
            {user ? (
              <>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#CC0000', marginBottom: '0.5rem' }}>{user.displayName || 'ÜYE'}</div>
                <a href={`${basePath}/dashboard?lang=${lang}`} style={{ display: 'block', padding: '0.75rem', textAlign: 'center', border: '1px solid #E5E7EB', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#374151', textDecoration: 'none' }}>Terminal Dashboard</a>
                <button onClick={logout} style={{ display: 'block', width: '100%', padding: '0.75rem', textAlign: 'center', border: '1px solid #DC2626', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#DC2626', background: 'none', cursor: 'pointer' }}>Çıkış Yap</button>
              </>
            ) : (
              <a href={`${basePath}/login?lang=${lang}`} style={{ display: 'block', padding: '0.75rem', textAlign: 'center', background: '#CC0000', color: '#FFFFFF', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
                {L.register}
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
