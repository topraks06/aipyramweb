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
const navLabels: Record<string, { news: string; tenders: string; trade: string; academy: string; register: string; about: string; collections: string }> = {
  TR: { news: 'HABERLER', tenders: 'İHALELER', trade: 'TİCARET', academy: 'AKADEMİ', register: 'Ücretsiz Kayıt', about: 'HAKKIMIZDA', collections: 'KOLEKSİYONLAR' },
  EN: { news: 'NEWS', tenders: 'TENDERS', trade: 'TRADE', academy: 'ACADEMY', register: 'Free Sign Up', about: 'ABOUT US', collections: 'COLLECTIONS' },
  DE: { news: 'NACHRICHTEN', tenders: 'AUSSCHREIBUNGEN', trade: 'HANDEL', academy: 'AKADEMIE', register: 'Kostenlos Registrieren', about: 'ÜBER UNS', collections: 'KOLLEKTIONEN' },
  RU: { news: 'НОВОСТИ', tenders: 'ТЕНДЕРЫ', trade: 'ТОРГОВЛЯ', academy: 'АКАДЕМИЯ', register: 'Регистрация', about: 'О НАС', collections: 'КОЛЛЕКЦИИ' },
  ZH: { news: '新闻', tenders: '招标', trade: '贸易', academy: '学院', register: '免费注册', about: '关于我们', collections: '系列' },
  AR: { news: 'أخبار', tenders: 'مناقصات', trade: 'تجارة', academy: 'أكاديمية', register: 'تسجيل مجاني', about: 'من نحن', collections: 'مجموعات' },
  ES: { news: 'NOTICIAS', tenders: 'LICITACIONES', trade: 'COMERCIO', academy: 'ACADEMIA', register: 'Registro Gratis', about: 'SOBRE NOSOTROS', collections: 'COLECCIONES' },
  FR: { news: 'ACTUALITÉS', tenders: 'APPELS D\'OFFRES', trade: 'COMMERCE', academy: 'ACADÉMIE', register: 'Inscription Gratuite', about: 'À PROPOS', collections: 'COLLECTIONS' },
};

// ═══ ALT MENÜ ETİKETLERİ (8 DİL) ═══
const subLabels: Record<string, Record<string, string>> = {
  TR: { latest: 'Son Haberler', radar: 'Dünya Radarı', analysis: 'Pazar Analizi', live: 'Canlı İhaleler', stock: 'Stok Fırsatları', capacity: 'Boş Kapasite', opportunities: 'Ticari Fırsatlar', supply: 'Tedarik Rehberi', training: 'Sektör Eğitimi', fairs: 'Fuar Takvimi' },
  EN: { latest: 'Latest News', radar: 'World Radar', analysis: 'Market Analysis', live: 'Live Tenders', stock: 'Stock Deals', capacity: 'Available Capacity', opportunities: 'Trade Opportunities', supply: 'Supplier Guide', training: 'Industry Training', fairs: 'Fair Calendar' },
  DE: { latest: 'Aktuelle Nachrichten', radar: 'Welt-Radar', analysis: 'Marktanalyse', live: 'Aktive Ausschreibungen', stock: 'Lagerangebote', capacity: 'Freie Kapazitäten', opportunities: 'Handelschancen', supply: 'Lieferantenführer', training: 'Branchenausbildung', fairs: 'Messekalender' },
  RU: { latest: 'Последние Новости', radar: 'Мировой Радар', analysis: 'Анализ Рынка', live: 'Активные Тендеры', stock: 'Складские Предложения', capacity: 'Свободные Мощности', opportunities: 'Торговые Возможности', supply: 'Справочник Поставщиков', training: 'Отраслевое Обучение', fairs: 'Календарь Выставок' },
  ZH: { latest: '最新新闻', radar: '世界雷达', analysis: '市场分析', live: '活跃招标', stock: '库存优惠', capacity: '闲置产能', opportunities: '贸易机会', supply: '供应商指南', training: '行业培训', fairs: '展会日历' },
  AR: { latest: 'آخر الأخبار', radar: 'رادار عالمي', analysis: 'تحليل السوق', live: 'مناقصات نشطة', stock: 'عروض المخزون', capacity: 'طاقة متاحة', opportunities: 'فرص تجارية', supply: 'دليل الموردين', training: 'تدريب القطاع', fairs: 'تقويم المعارض' },
  ES: { latest: 'Últimas Noticias', radar: 'Radar Mundial', analysis: 'Análisis de Mercado', live: 'Licitaciones Activas', stock: 'Ofertas de Stock', capacity: 'Capacidad Disponible', opportunities: 'Oportunidades', supply: 'Guía de Proveedores', training: 'Formación Sectorial', fairs: 'Calendario de Ferias' },
  FR: { latest: 'Dernières Nouvelles', radar: 'Radar Mondial', analysis: 'Analyse de Marché', live: 'Appels Actifs', stock: 'Offres de Stock', capacity: 'Capacité Disponible', opportunities: 'Opportunités', supply: 'Guide Fournisseurs', training: 'Formation Sectorielle', fairs: 'Calendrier des Salons' },
};

type NavTheme = 'light' | 'dark';

interface TrtexNavbarProps {
  basePath: string;
  brandName?: string;
  lang?: string;
  activePage?: 'home' | 'news' | 'tenders' | 'trade' | 'academy' | 'fairs' | 'index';
  theme?: NavTheme;
}

/**
 * TRTEX Ortak Navbar — Tüm sayfalar bu bileşeni kullanır.
 * Menü sırası: HABERLER ▾ | İHALELER ▾ | TİCARET ▾ | AKADEMİ ▾ | 🌐 DİL | ÜCRETSİZ KAYIT
 * Her menü kendi sayfasına gider + hover dropdown alt menüler.
 */
export default function TrtexNavbar({ basePath, brandName = 'TRTEX', lang = 'tr', activePage, theme = 'light' }: TrtexNavbarProps) {
  const { user, logout } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const targetLang = lang.toUpperCase();
  const labels = navLabels[targetLang] || navLabels.TR;
  const subs = subLabels[targetLang] || subLabels.TR;

  // SABİT KURUMSAL TEMA (Aydınlık B2B)
  const bgColor = '#FFFFFF';
  const textColor = '#111827';
  const activeColor = '#CC0000';
  const borderColor = '#E5E7EB';
  const dropBg = '#FFFFFF';
  const dropBorder = '#E5E7EB';
  const dropHover = '#F3F4F6';

  const getUrl = (key: string, hash: string = '', query: string = '') => {
    if (lang === 'tr') {
      const map: Record<string, string> = {
        about: 'hakkimizda',
        news: 'haberler',
        tenders: 'ihaleler',
        collections: 'koleksiyonlar',
        academy: 'akademi',
        fairs: 'fuar-takvimi',
        trade: 'ticaret'
      };
      return `${basePath}/${map[key] || key}${query ? `?${query}` : ''}${hash}`;
    }
    return `${basePath}/${key}?lang=${lang}${query ? `&${query}` : ''}${hash}`;
  };

  // ═══ MENÜ YAPIISI — Sadece gerçek içeriği olan sayfalar ═══
  const menuItems = [
    {
      key: 'about', label: labels.about, href: getUrl('about'), subs: []
    },
    {
      key: 'news', label: labels.news, href: getUrl('news'),
      subs: [
        { label: subs.latest, href: getUrl('news') },
        { label: subs.analysis, href: getUrl('news', '#news-grid') },
      ]
    },
    {
      key: 'tenders', label: labels.tenders, href: getUrl('tenders'), accent: true,
      subs: [
        { label: subs.live, href: getUrl('tenders') },
        { label: subs.stock, href: getUrl('tenders', '', 'filter=HOT_STOCK') },
        { label: subs.capacity, href: getUrl('tenders', '', 'filter=CAPACITY') },
      ]
    },
    {
      key: 'collections', label: labels.collections, href: getUrl('collections'), subs: []
    },
    {
      key: 'academy', label: labels.academy, href: getUrl('academy'),
      subs: [
        { label: subs.fairs, href: getUrl('fairs') },
        { label: subs.training, href: getUrl('academy') },
      ]
    },
  ];

  const currentLangObj = LANG_OPTIONS.find(l => l.code === lang) || LANG_OPTIONS[0];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [langDropOpen, setLangDropOpen] = useState(false);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .trtex-nav-link { position: relative; }
        .trtex-nav-link::after { content: ''; position: absolute; bottom: 0; left: 50%; width: 0; height: 2px; background: ${activeColor}; transition: all 0.3s ease; transform: translateX(-50%); }
        .trtex-menu-group:hover .trtex-nav-link::after { width: 100%; }
        .trtex-menu-group:hover .trtex-dropdown { opacity: 1 !important; visibility: visible !important; transform: translateY(0) !important; }
        .trtex-dropdown { opacity: 0; visibility: hidden; transform: translateY(10px); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .trtex-dropdown a:hover { background: #F8FAFC !important; color: #020617 !important; padding-left: 1.25rem !important; }
        .trtex-lang-drop { display: none; position: absolute; right: 0; top: 100%; min-width: 180px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border: 1px solid #E2E8F0; border-radius: 12px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1); z-index: 100; overflow:hidden;}
        .trtex-lang-trigger:hover .trtex-lang-drop, .trtex-lang-drop:hover { display: block !important; }
        .trtex-lang-drop a:hover { background: #F8FAFC !important; }
      `}} />
      <nav 
        className="sticky top-0 z-[100] w-full transition-all duration-300" 
        style={{ 
          background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent', 
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid ' + borderColor : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 20px -5px rgba(0,0,0,0.05)' : 'none'
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center h-[70px] lg:h-[80px]">
          {/* LOGO */}
          <a href={basePath} className="no-underline font-serif text-xl lg:text-2xl font-black tracking-tight" style={{ color: '#111' }}>
            {brandName === 'TRTEX' ? (
              <>Trtex<span style={{ color: activeColor }}>.</span>com</>
            ) : (
              <>{brandName}<span style={{ color: activeColor }}>.</span>com</>
            )}
          </a>

          {/* DESKTOP MENU */}
          <div className="hidden lg:flex items-center gap-2">
            {menuItems.map(item => {
              const isActive = activePage === item.key;
              return (
                <div key={item.key} className="trtex-menu-group relative pb-2 pt-2 h-[80px] flex items-center">
                  <a
                    href={item.href}
                    className="trtex-nav-link no-underline font-sans text-[0.85rem] flex items-center gap-1 transition-all px-4"
                    style={{
                      fontWeight: isActive ? 800 : 600,
                      letterSpacing: '0.5px',
                      color: isActive ? activeColor : (item as any).accent ? activeColor : '#334155',
                      height: '100%',
                    }}
                  >
                    {item.label}
                    {item.subs.length > 0 && <span className="text-[0.6rem] opacity-40 ml-1 mt-[2px]">▾</span>}
                  </a>

                  {/* DESKTOP DROPDOWN (Mega Menu Style) */}
                  {item.subs.length > 0 && (
                    <div className="trtex-dropdown absolute left-0 top-full pt-4 pb-2 z-[100] w-64">
                      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden" style={{boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)'}}>
                        {item.subs.map((sub, idx) => (
                          <a
                            key={idx}
                            href={sub.href}
                            className="block px-5 py-3 font-sans text-[0.8rem] font-semibold no-underline transition-all duration-200"
                            style={{ color: '#475569', borderBottom: idx !== item.subs.length -1 ? '1px solid #F1F5F9' : 'none' }}
                          >
                            {sub.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* TEK DİL SEÇİCİ — 8 Dil Dropdown */}
            <div className="trtex-lang-trigger relative flex items-center ml-4" style={{ cursor: 'pointer' }}>
              <div
                className="flex items-center gap-2 px-3 py-1.5 font-sans text-[0.85rem] font-bold transition-colors rounded-full"
                style={{ border: '1px solid #E2E8F0', color: '#334155', background: scrolled ? '#F8FAFC' : '#FFFFFF' }}
              >
                <span className="text-[1.1rem]">{currentLangObj.flag}</span>
                <span>{currentLangObj.code.toUpperCase()}</span>
                <span className="text-[0.6rem] opacity-40 ml-1">▾</span>
              </div>
              <div className="trtex-lang-drop mt-2">
                {LANG_OPTIONS.map(opt => (
                  <a
                    key={opt.code}
                    href={`${basePath}?lang=${opt.code}`}
                    className="flex items-center gap-3 px-4 py-3 font-mono text-[0.75rem] font-semibold no-underline transition-colors"
                    style={{
                      color: opt.code === lang ? '#fff' : '#ccc',
                      background: opt.code === lang ? activeColor : 'transparent',
                      borderBottom: `1px solid #222`,
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>{opt.flag}</span>
                    <span>{opt.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* SSO / KULLANICI PROFİLİ */}
            {user ? (
              <div className="trtex-lang-trigger relative flex items-center ml-4 cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-1.5 font-sans text-[0.85rem] font-bold transition-colors rounded-full" style={{ border: `1px solid #BFDBFE`, color: '#1D4ED8', background: '#EFF6FF' }}>
                  <span>{user.displayName?.split(' ')[0] || 'ÜYE'}</span>
                  <span className="text-[0.6rem] opacity-40 ml-1 mt-[2px]">▾</span>
                </div>
                <div className="trtex-lang-drop mt-2" style={{minWidth:'200px'}}>
                  <div className="px-5 py-3 font-sans text-[0.75rem] text-slate-500 border-b border-slate-100 font-medium">
                    {user.email}
                  </div>
                  <a href={`${basePath}/dashboard?lang=${lang}`} className="block px-5 py-3 font-sans text-[0.8rem] font-bold text-slate-700 hover:text-blue-600 no-underline transition-colors">
                    Terminal Dashboard
                  </a>
                  <button onClick={logout} className="w-full text-left px-5 py-3 font-sans text-[0.8rem] font-bold text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100">
                    Çıkış Yap
                  </button>
                </div>
              </div>
            ) : (
              <a href={`${basePath}/login?lang=${lang}`} className="ml-4 px-5 py-2 font-sans text-[0.85rem] font-bold transition-all no-underline rounded-full hover:-translate-y-[1px]" style={{ background: '#0F172A', color: '#FFFFFF', boxShadow:'0 4px 10px rgba(0,0,0,0.1)' }}>
                {labels.register}
              </a>
            )}

            {/* aipyram CONCIERGE (DESKTOP) */}
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open_perde_ai_assistant', { detail: { action: 'concierge' } }))}
              className="ml-4 px-4 py-2 font-mono text-[0.75rem] font-bold uppercase tracking-widest transition-all"
              style={{ background: '#D4AF37', color: '#000', border: 'none', cursor: 'pointer' }}
            >
              aipyram Concierge
            </button>
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 flex flex-col justify-center items-center gap-1 cursor-pointer bg-transparent border-0"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className={`block w-6 h-[2px] transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} style={{ background: textColor }} />
              <span className={`block w-6 h-[2px] transition-opacity ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} style={{ background: textColor }} />
              <span className={`block w-6 h-[2px] transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} style={{ background: textColor }} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE FULLSCREEN MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] pt-[100px] overflow-y-auto" style={{ background: bgColor }}>
          <div className="flex flex-col px-6 pb-20">
            {menuItems.map(item => (
              <div key={item.key} className="mb-6">
                <div className="font-mono text-sm font-extrabold uppercase tracking-widest mb-3" style={{ color: activeColor }}>
                  {item.label}
                </div>
                <div className="flex flex-col gap-3 pl-4 border-l-2" style={{ borderColor: borderColor }}>
                  {item.subs.map((sub, idx) => (
                    <a
                      key={idx}
                      href={sub.href}
                      className="font-mono text-xs font-semibold no-underline py-1"
                      style={{ color: textColor }}
                    >
                      {sub.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            
            {/* MOBILE 8-DİL SEÇİCİ */}
            <div className="mt-8 pt-8 border-t" style={{ borderColor: borderColor }}>
              <div className="font-mono text-sm font-extrabold uppercase tracking-widest mb-3" style={{ color: '#888' }}>🌐 DİL / LANGUAGE</div>
              <div className="grid grid-cols-2 gap-2">
                {LANG_OPTIONS.map(opt => (
                  <a
                    key={opt.code}
                    href={`${basePath}?lang=${opt.code}`}
                    className="flex items-center gap-2 p-3 font-mono text-sm font-bold no-underline"
                    style={{
                      background: opt.code === lang ? activeColor : 'transparent',
                      color: opt.code === lang ? '#fff' : textColor,
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <span>{opt.flag}</span> {opt.name}
                  </a>
                ))}
              </div>
            </div>

            {/* MOBILE SSO / KULLANICI PROFİLİ */}
            <div className="mt-6">
              {user ? (
                <>
                  <div className="font-mono text-sm font-extrabold uppercase tracking-widest mb-3" style={{ color: activeColor }}>{user.displayName || 'ÜYE'}</div>
                  <a href={`${basePath}/dashboard?lang=${lang}`} className="block w-full p-4 mb-2 font-mono text-sm font-bold text-center border no-underline" style={{ borderColor: borderColor, color: textColor }}>Terminal Dashboard</a>
                  <button onClick={logout} className="w-full p-4 font-mono text-sm font-bold text-center border" style={{ borderColor: '#CC0000', color: '#CC0000', background: 'transparent' }}>Çıkış Yap</button>
                </>
              ) : (
                <a href={`${basePath}/login?lang=${lang}`} className="block w-full p-4 font-mono text-sm font-bold uppercase tracking-widest text-center border no-underline" style={{ borderColor: activeColor, color: activeColor }}>
                  {labels.register}
                </a>
              )}
            </div>

            {/* aipyram CONCIERGE (MOBILE) */}
            <div className="mt-6">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('open_perde_ai_assistant', { detail: { action: 'concierge' } }));
                }}
                className="w-full p-4 font-mono text-sm font-bold uppercase tracking-widest text-center"
                style={{ background: '#D4AF37', color: '#000', border: 'none', cursor: 'pointer' }}
              >
                aipyram Concierge
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
