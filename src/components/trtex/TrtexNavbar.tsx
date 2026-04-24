'use client';
import React, { useState } from 'react';
import SearchInput from '@/components/search/SearchInput';

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
const navLabels: Record<string, { news: string; tenders: string; trade: string; academy: string; register: string }> = {
  TR: { news: 'HABERLER', tenders: 'İHALELER', trade: 'TİCARET', academy: 'AKADEMİ', register: 'Ücretsiz Kayıt' },
  EN: { news: 'NEWS', tenders: 'TENDERS', trade: 'TRADE', academy: 'ACADEMY', register: 'Free Sign Up' },
  DE: { news: 'NACHRICHTEN', tenders: 'AUSSCHREIBUNGEN', trade: 'HANDEL', academy: 'AKADEMIE', register: 'Kostenlos Registrieren' },
  RU: { news: 'НОВОСТИ', tenders: 'ТЕНДЕРЫ', trade: 'ТОРГОВЛЯ', academy: 'АКАДЕМИЯ', register: 'Регистрация' },
  ZH: { news: '新闻', tenders: '招标', trade: '贸易', academy: '学院', register: '免费注册' },
  AR: { news: 'أخبار', tenders: 'مناقصات', trade: 'تجارة', academy: 'أكاديمية', register: 'تسجيل مجاني' },
  ES: { news: 'NOTICIAS', tenders: 'LICITACIONES', trade: 'COMERCIO', academy: 'ACADEMIA', register: 'Registro Gratis' },
  FR: { news: 'ACTUALITÉS', tenders: 'APPELS D\'OFFRES', trade: 'COMMERCE', academy: 'ACADÉMIE', register: 'Inscription Gratuite' },
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
  const [langOpen, setLangOpen] = useState(false);
  const targetLang = lang.toUpperCase();
  const labels = navLabels[targetLang] || navLabels.TR;
  const subs = subLabels[targetLang] || subLabels.TR;

  // SABİT KURUMSAL TEMA (Sayfadan sayfaya değişmemesi için hardcode ettik)
  const bgColor = '#0B0D0F';
  const textColor = '#EEEEEE';
  const activeColor = '#CC0000';
  const borderColor = '#222222';
  const dropBg = '#111111';
  const dropBorder = '#333333';
  const dropHover = '#1A1D24';

  // ═══ MENÜ YAPIISI — Sadece gerçek içeriği olan sayfalar ═══
  const menuItems = [
    {
      key: 'news', label: labels.news, href: `${basePath}/news?lang=${lang}`,
      subs: [
        { label: subs.latest, href: `${basePath}/news?lang=${lang}` },
        { label: subs.analysis, href: `${basePath}/news?lang=${lang}#news-grid` },
      ]
    },
    {
      key: 'tenders', label: labels.tenders, href: `${basePath}/tenders?lang=${lang}`, accent: true,
      subs: [
        { label: subs.live, href: `${basePath}/tenders?lang=${lang}` },
        { label: subs.stock, href: `${basePath}/tenders?lang=${lang}&filter=HOT_STOCK` },
        { label: subs.capacity, href: `${basePath}/tenders?lang=${lang}&filter=CAPACITY` },
      ]
    },
    {
      key: 'academy', label: labels.academy, href: `${basePath}/academy?lang=${lang}`,
      subs: [
        { label: subs.fairs, href: `${basePath}/fairs?lang=${lang}` },
        { label: subs.training, href: `${basePath}/academy?lang=${lang}` },
      ]
    },
  ];

  const currentLangObj = LANG_OPTIONS.find(l => l.code === lang) || LANG_OPTIONS[0];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [langDropOpen, setLangDropOpen] = useState(false);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .trtex-menu-group:hover .trtex-dropdown { display: block !important; }
        .trtex-dropdown a:hover { background: ${dropHover} !important; color: #fff !important; }
        .trtex-lang-drop { display: none; position: absolute; right: 0; top: 100%; min-width: 180px; background: ${dropBg}; border: 1px solid ${dropBorder}; box-shadow: 0 10px 30px rgba(0,0,0,0.4); z-index: 100; }
        .trtex-lang-trigger:hover .trtex-lang-drop, .trtex-lang-drop:hover { display: block !important; }
        .trtex-lang-drop a:hover { background: ${dropHover} !important; }
      `}} />
      <nav 
        className="relative z-50 w-full" 
        style={{ background: bgColor, borderBottom: `1px solid ${borderColor}` }}
      >
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center h-[70px] lg:h-[80px]">
          {/* LOGO */}
          <a href={basePath} className="no-underline font-serif text-xl lg:text-2xl font-black tracking-tight" style={{ color: '#fff' }}>
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
                    className="no-underline font-mono text-[0.85rem] uppercase flex items-center gap-1 transition-all px-4"
                    style={{
                      fontWeight: isActive ? 900 : 700,
                      letterSpacing: '1.5px',
                      color: isActive ? activeColor : (item as any).accent ? activeColor : textColor,
                      borderBottom: isActive ? `3px solid ${activeColor}` : '3px solid transparent',
                      height: '100%',
                    }}
                  >
                    {item.label}
                    <span className="text-[0.6rem] opacity-60 ml-1">▾</span>
                  </a>

                  {/* DESKTOP DROPDOWN */}
                  <div className="trtex-dropdown hidden absolute left-0 top-full shadow-xl z-[100] pt-2" style={{ background: dropBg, border: `1px solid ${dropBorder}` }}>
                    {item.subs.map((sub, idx) => (
                      <a
                        key={idx}
                        href={sub.href}
                        className="block px-4 py-3 font-mono text-[0.7rem] font-semibold no-underline transition-colors"
                        style={{ color: '#ccc', borderBottom: `1px solid #222` }}
                      >
                        {sub.label}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* ARAMA MOTORU */}
            <div className="ml-4 flex items-center">
              <SearchInput lang={lang} />
            </div>

            {/* TEK DİL SEÇİCİ — 8 Dil Dropdown */}
            <div className="trtex-lang-trigger relative flex items-center ml-4" style={{ cursor: 'pointer' }}>
              <div
                className="flex items-center gap-2 px-3 py-2 font-mono text-[0.8rem] font-bold transition-colors"
                style={{ border: `1px solid ${borderColor}`, color: textColor }}
              >
                <span>{currentLangObj.flag}</span>
                <span>{currentLangObj.code.toUpperCase()}</span>
                <span className="text-[0.6rem] opacity-60 ml-1">▾</span>
              </div>
              <div className="trtex-lang-drop">
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

            {/* AIPYRAM CONCIERGE (DESKTOP) */}
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open_perde_ai_assistant', { detail: { action: 'concierge' } }))}
              className="ml-4 px-4 py-2 font-mono text-[0.75rem] font-bold uppercase tracking-widest transition-all"
              style={{ background: '#D4AF37', color: '#000', border: 'none', cursor: 'pointer' }}
            >
              AIPyram Concierge
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

            {/* AIPYRAM CONCIERGE (MOBILE) */}
            <div className="mt-6">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('open_perde_ai_assistant', { detail: { action: 'concierge' } }));
                }}
                className="w-full p-4 font-mono text-sm font-bold uppercase tracking-widest text-center"
                style={{ background: '#D4AF37', color: '#000', border: 'none', cursor: 'pointer' }}
              >
                AIPyram Concierge
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
