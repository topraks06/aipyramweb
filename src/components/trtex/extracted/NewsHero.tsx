'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Brain, Globe, TrendingUp, Calendar, Eye, Dot, ChevronRight, Search } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';

interface NewsItem {
  id: number;
  title: string;
  summary?: string;
  category?: string;
  image_url?: string;
  published_at?: string;
  slug?: string;
  views?: number;
}

const FALLBACK_NEWS: NewsItem[] = [
  {
    id: 0,
    title: 'Brillant, 2026 Sezonuna Antalya\'da "Merhaba" Diyor: Sektörün Dev Buluşması 12-15 Mayıs\'ta!',
    summary: 'Türkiye\'nin en büyük perde markası Brillant, 12-15 Mayıs 2026\'da Starlight Resort Hotel\'de 500+ bayiyle dev lansman etkinliği düzenliyor. Smart Curtain tanıtımı, 2026 Kesim Koleksiyonu ve Togg T10F, Umre, iPhone 17 çekilişleriyle dolu görkemli buluşma.',
    category: 'ETKİNLİK',
    image_url: '/images/brillant-antalya-2026-hero.jpg',
    published_at: '2026-03-20',
    slug: 'brillant-antalya-2026-lansman',
    views: 18500,
  },
  {
    id: 1,
    title: 'Heimtextil 2026: 3.100 Katılımcı, 65 Ülke — Türkiye Rekor Katılımla Sahne Aldı',
    summary: '13-16 Ocak 2026 tarihlerinde Frankfurt\'ta düzenlenen Heimtextil fuarına Türkiye\'den 200\'den fazla firma katıldı. "Lead the Change" temasıyla düzenlenen fuarda AI destekli inovasyonlar ve sürdürülebilir tekstil ön plana çıktı.',
    category: 'FUAR',
    image_url: '/images/hometex-fair-2026.jpg',
    published_at: '2026-01-16',
    slug: 'heimtextil-2026-turkiye-rekor-katilim',
    views: 34200,
  },
  {
    id: 2,
    title: 'Denizli İhracatı 4.7 Milyar Dolara Ulaştı: Ev Tekstili Lokomotif',
    category: 'İHRACAT',
    image_url: '/images/textile-factory.png',
    published_at: '2026-02-20',
    slug: 'denizli-ihracat-47-milyar',
  },
  {
    id: 3,
    title: 'Elvin Tekstil, Heimtextil 2026\'da Dekoratif Kumaş Koleksiyonuyla Sahne Aldı',
    category: 'FUAR',
    image_url: '/images/curtain-showroom.png',
    published_at: '2026-03-10',
    slug: 'elvin-proposte-heimtextil',
  },
  {
    id: 4,
    title: 'Menderes Tekstil: 307 Milyon TL Net Kâr ile Zarardan Çıkış',
    category: 'ANALİZ',
    image_url: '/images/cotton-market.png',
    published_at: '2026-03-05',
    slug: 'menderes-307m-kar-donus',
  },
  {
    id: 5,
    title: 'Hometex.AI: Ev Tekstilinin İlk AI Destekli Sanal Fuar Platformu Yayında',
    summary: 'AIPYRAM ekosisteminin fuar bacağı Hometex.AI, 500\'den fazla firmanın dijital showroom\'unu 7/24 açık tutuyor. Yapay zekâ ile alıcı-tedarikçi eşleştirmesi, sanal stant kurulumu ve Hometex Istanbul 2026 fuarına entegre çalışan platform, ev tekstili sektöründe B2B dijital dönüşümün öncüsü olmayı hedefliyor.',
    category: 'FUAR',
    image_url: '/images/hometex-ai-sanal-fuar.jpg',
    published_at: '2026-03-15',
    slug: 'hometex-ai-sanal-fuar-platformu',
    views: 12400,
  },
  {
    id: 6,
    title: 'Türk Tekstilinde "Near-Shoring 2.0": Avrupa Markalarının Yeni Tedarik Stratejisi',
    category: 'TREND',
    image_url: '/images/curtain-showroom.png',
    published_at: '2026-03-12',
    slug: 'near-shoring-avrupa-turk-tedarikciler',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  FUAR: 'bg-blue-100 text-blue-700 border-blue-300',
  BÜYÜME: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  PAZAR: 'bg-purple-100 text-purple-700 border-purple-300',
  TEKNOLOJİ: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  TREND: 'bg-amber-100 text-amber-700 border-amber-300',
  ANALİZ: 'bg-orange-100 text-orange-700 border-orange-300',
  ETKİNLİK: 'bg-rose-100 text-rose-700 border-rose-300',
  İHRACAT: 'bg-teal-100 text-teal-700 border-teal-300',
};

const CATEGORY_TRANSLATIONS: Record<string, Record<string, string>> = {
  FUAR: { tr: 'FUAR', en: 'FAIR', de: 'MESSE', zh: '展会', ru: 'ВЫСТАВКА', fr: 'SALON', ar: 'معرض' },
  BÜYÜME: { tr: 'BÜYÜME', en: 'GROWTH', de: 'WACHSTUM', zh: '增长', ru: 'РОСТ', fr: 'CROISSANCE', ar: 'نمو' },
  PAZAR: { tr: 'PAZAR', en: 'MARKET', de: 'MARKT', zh: '市场', ru: 'РЫНОК', fr: 'MARCHÉ', ar: 'سوق' },
  TEKNOLOJİ: { tr: 'TEKNOLOJİ', en: 'TECH', de: 'TECHNIK', zh: '科技', ru: 'ТЕХНОЛОГИИ', fr: 'TECH', ar: 'تقنية' },
  TREND: { tr: 'TREND', en: 'TREND', de: 'TREND', zh: '趋势', ru: 'ТРЕНД', fr: 'TENDANCE', ar: 'اتجاه' },
  ANALİZ: { tr: 'ANALİZ', en: 'ANALYSIS', de: 'ANALYSE', zh: '分析', ru: 'АНАЛИЗ', fr: 'ANALYSE', ar: 'تحليل' },
  ETKİNLİK: { tr: 'ETKİNLİK', en: 'EVENT', de: 'VERANSTALTUNG', zh: '活动', ru: 'СОБЫТИЕ', fr: 'ÉVÉNEMENT', ar: 'حدث' },
  İHRACAT: { tr: 'İHRACAT', en: 'EXPORT', de: 'EXPORT', zh: '出口', ru: 'ЭКСПОРТ', fr: 'EXPORT', ar: 'تصدير' },
  HABER: { tr: 'HABER', en: 'NEWS', de: 'NACHRICHTEN', zh: '新闻', ru: 'НОВОСТИ', fr: 'ACTUALITÉS', ar: 'أخبار' },
};

const LOCALE_MAP: Record<string, string> = {
  tr: 'tr-TR', en: 'en-US', de: 'de-DE', zh: 'zh-CN', ru: 'ru-RU', fr: 'fr-FR', ar: 'ar-SA',
};

function formatDate(dateStr?: string, locale?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(LOCALE_MAP[locale || 'tr'] || 'tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatViews(v?: number) {
  if (!v) return null;
  return v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toString();
}

// Ticker items
const TICKER = [
  '★ Brillant — 5-8 Mayıs Antalya\'da 2026 Koleksiyon Lansmanı',
  '★ Heimtextil 2026 — Türkiye 200+ Firma ile Katılım Rekoru',
  'Pamuk: $0.84/lb ↑ +1.8%',
  'EUR/TRY: 50.99 ↓',
  '★ TETSİAD — ABD\'de Yerel Satış ve Operasyon Üssü Planı',
  'USD/TRY: 44.21 ↑',
  '★ Denizli — 183 Ülkeye 4.7 Milyar $ Ev Tekstili İhracatı',
  '★ Elvin Tekstil — Heimtextil 2026 Dekoratif Kumaş Koleksiyonu',
  'Polyester: ₺148/kg ↑ +4.3%',
  '★ Menderes — 307M TL Net Kâr Dönüşümü',
  '★ HOMETEX İstanbul — 19-22 Mayıs 2026',
];

export function NewsHero() {
  const [news, setNews] = useState<NewsItem[]>(FALLBACK_NEWS);
  const [tickerItems, setTickerItems] = useState<string[]>(TICKER);
  const [brainComment, setBrainComment] = useState<string>('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const locale = useLocale();

  const translate = useAutoTranslate();

  const PLACEHOLDERS = [
    'Türkiye\'de havlu üreticileri bul...',
    'Son 24 saat tekstil haberleri...',
    'Vietnam tekstil ihracatı...',
    'Heimtextil 2026 katılımcıları...',
    'Pamuk fiyat trendi...',
    'Persan Tekstil IQ skoru...',
  ];
  const [translatedPlaceholders, setTranslatedPlaceholders] = useState<string[]>(PLACEHOLDERS);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % translatedPlaceholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tickerPos = 0;

  useEffect(() => {
    // 1. Site Brain'den hero haberlerini çek
    const fetchBrain = async () => {
      try {
        const res = await fetch(`/api/site-brain?section=hero_news&locale=${locale}`);
        if (res.ok) {
          const { data, comment } = await res.json();
          if (Array.isArray(data) && data.length >= 3) {
            const sorted = [...data].sort((a, b) => {
              if (a.pinned && !b.pinned) return -1;
              if (!a.pinned && b.pinned) return 1;
              return (a.position || 99) - (b.position || 99);
            });
            setNews(sorted);
            if (comment) setBrainComment(comment);
            return; // site-brain doluysa burada dur
          }
        }
      } catch { /* fallthrough to API */ }

      // 2. Site Brain boşsa → API'den yayınlanan haberleri çek
      try {
        const res = await fetch(`/api/news?status=published&locale=${locale}`);
        if (res.ok) {
          const data = await res.json();
          const articles = (data.articles || []).slice(0, 7).map((a: any, i: number) => ({
            id: i,
            title: a.title,
            summary: a.summary,
            category: (a.category || 'HABER').toUpperCase(),
            image_url: a.image_url || '/images/curtain-fabric-display.png',
            published_at: a.published_at || a.created_at,
            slug: a.slug,
            views: Math.floor(Math.random() * 5000) + 1000,
          }));
          if (articles.length >= 3) {
            setNews(articles);
            return;
          }
        }
      } catch { /* use hardcoded fallback */ }
    };

    // 3. Ticker verilerini çek
    const fetchTicker = async () => {
      try {
        const res = await fetch(`/api/site-brain?section=ticker&locale=${locale}`);
        if (res.ok) {
          const { data } = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTickerItems(data);
          }
        }
      } catch { /* use fallback */ }
    };

    fetchBrain();
    fetchTicker();

    // Translate fallback ticker and placeholders for non-TR
    if (locale !== 'tr') {
      translate(TICKER, 'News ticker headlines').then(r => setTickerItems(r));
      translate(PLACEHOLDERS, 'Search bar placeholders').then(r => setTranslatedPlaceholders(r));
    }
  }, [locale]);

  const featured = news[0];
  const secondaries = news.slice(1, 7);

  const catClass = (cat?: string) =>
    cat && CATEGORY_COLORS[cat] ? CATEGORY_COLORS[cat] : 'bg-gray-100 text-gray-700 border-gray-300';

  return (
    <section className="relative w-full bg-white overflow-hidden">

      {/* === BREAKING NEWS TICKER === */}
      <div className="relative bg-[#1a1a2e] border-b border-[#2a2a3e] overflow-hidden h-9 flex items-center">
        <div className="flex items-center gap-3 px-4 flex-shrink-0 border-r border-white/10 h-full bg-white/5 z-10">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[11px] font-black tracking-[0.25em] text-white uppercase">CANLI</span>
        </div>
        <div className="overflow-hidden flex-1 relative">
          <motion.div
            className="flex gap-12 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          >
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={`ticker-${i}`} className="text-[11px] font-mono text-white/80 tracking-wide">{item}</span>
            ))}
          </motion.div>
        </div>
        {/* Datetime */}
        <div className="flex-shrink-0 px-4 border-l border-white/10 h-full flex items-center">
          <span className="text-[11px] font-mono text-white/70 tracking-widest">
            {new Date().toLocaleDateString(LOCALE_MAP[locale] || 'en-US', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
          </span>
        </div>
      </div>

      {/* === AI AGENT INDICATOR BAR === */}
      <div className="bg-gray-50 border-b border-border px-4 lg:px-8 py-2 flex items-center gap-6 overflow-x-auto">
        {[
          { icon: Brain, label: 'İçerik Ajanı', status: 'CANLI', color: 'text-amber-600' },
          { icon: Globe, label: 'Global Tarayıcı', status: 'AKTIF', color: 'text-emerald-600' },
          { icon: TrendingUp, label: 'Pazar Analizi', status: 'ANLIK', color: 'text-blue-600' },
          { icon: Zap, label: 'Haber Sınıflandırıcı', status: 'CANLI', color: 'text-purple-600' },
        ].map((agent) => (
          <div key={agent.label} className="flex items-center gap-2 flex-shrink-0">
            <agent.icon className={`w-3 h-3 ${agent.color}`} />
            <span className="text-[11px] font-medium text-gray-600 tracking-wider">{agent.label}</span>
            <span className={`text-[11px] font-bold tracking-wider uppercase ${agent.color}`}>{agent.status}</span>
          </div>
        ))}
        <div className="ml-auto flex-shrink-0 text-[11px] font-medium text-gray-500 tracking-wider">
          TRTEX AI NETWORK v2.6
        </div>
      </div>

      {/* === AI SEARCH BAR === */}
      <div className="bg-white border-b border-border px-4 lg:px-8 py-3">
        <div className="container mx-auto max-w-3xl">
          <div className={`flex items-center gap-3 bg-gray-50 border-2 ${
            searchFocus ? 'border-amber-400 shadow-lg shadow-amber-100' : 'border-gray-200'
          } rounded-xl px-5 py-3.5 transition-all duration-300`}>
            <Search className={`w-5 h-5 flex-shrink-0 transition-colors ${
              searchFocus ? 'text-amber-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value;
                  if (val) window.location.href = `/news?q=${encodeURIComponent(val)}`;
                }
              }}
              placeholder={translatedPlaceholders[placeholderIdx]}
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium"
            />
            <div className="flex-shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
              <Brain className="w-3 h-3" />
              AI
            </div>
          </div>
        </div>
      </div>

      {/* === PREMIUM NEWS GRID === */}
      <div className="bg-gray-100">
        {/* Row 1: Hero (55%) + Editorial Cards (45%) */}
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_3fr] min-h-[520px] gap-[3px]">

          {/* LEFT — Featured Hero */}
          <motion.div
            className="relative overflow-hidden group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute inset-0 bg-[#0d1117]">
              <img
                src={featured.image_url || '/images/curtain-fabric-display.png'}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[3s]"
                onError={(e) => { const t = e.target as HTMLImageElement; if (featured.slug && !t.src.includes('/api/news-image/')) { t.src = `/api/news-image/${featured.slug}`; } else if (!t.src.includes('curtain-fabric-display')) { t.src = '/images/curtain-fabric-display.png'; } }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117]/95 via-[#0d1117]/50 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full min-h-[520px] p-8 md:p-10 lg:p-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-black tracking-[0.25em] uppercase border px-3 py-1.5 ${catClass(featured.category)}`}>
                    {CATEGORY_TRANSLATIONS[featured.category?.toUpperCase() || 'HABER']?.[locale] || featured.category || 'HABER'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[11px] font-mono text-white/80">{CATEGORY_TRANSLATIONS['HABER']?.[locale] || 'ÖZEL HABER'}</span>
                </div>
                {featured.views && (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-white/70">
                    <Eye className="w-2.5 h-2.5" /> {formatViews(featured.views)}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-gradient-to-r from-amber-400/60 to-transparent" />
                  <span className="text-[11px] font-black tracking-[0.3em] text-amber-400 uppercase">MANŞET</span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-black text-white leading-[1.1] mb-5 tracking-tight max-w-2xl">
                  {featured.title}
                </h1>

                {featured.summary && (
                  <p className="text-white/80 text-base leading-relaxed max-w-xl line-clamp-2 mb-8 font-light">
                    {featured.summary}
                  </p>
                )}

                <div className="flex items-center gap-6">
                  <Link
                    href={`/news/${featured.slug}`}
                    className="flex items-center gap-3 bg-amber-500 text-white px-6 py-3 text-[11px] font-black tracking-[0.15em] uppercase hover:bg-amber-400 transition-colors duration-300 group/btn"
                  >
                    Haberin Tamamı
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-white/60">
                    <Calendar className="w-3 h-3" />
                    {formatDate(featured.published_at)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — 2 Stacked Editorial Cards (white/clean, contrasting with dark hero) */}
          <div className="flex flex-col border-l-2 border-amber-400/40 bg-white">
            {secondaries.slice(0, 2).map((item, i) => (
              <motion.div
                key={item.id}
                className={`group flex-1 ${i === 0 ? 'border-b-2 border-gray-100' : ''}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.6 }}
              >
                <Link href={`/news/${item.slug}`} className="flex h-full overflow-hidden hover:bg-amber-50/30 transition-colors duration-300">
                  {/* Image — constrained, not full-bleed */}
                  <div className="relative w-[45%] flex-shrink-0 overflow-hidden">
                    <img
                      src={item.image_url || '/images/curtain-fabric-display.png'}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => { const t = e.target as HTMLImageElement; if (item.slug && !t.src.includes('/api/news-image/')) { t.src = `/api/news-image/${item.slug}`; } else if (!t.src.includes('curtain-fabric-display')) { t.src = '/images/curtain-fabric-display.png'; } }}
                    />
                  </div>

                  {/* Text — clean white editorial */}
                  <div className="flex flex-col justify-center px-5 lg:px-6 py-4 flex-1">
                    <span className={`text-[10px] font-black tracking-[0.25em] uppercase border px-2 py-0.5 w-fit mb-2 rounded ${catClass(item.category)}`}>
                      {CATEGORY_TRANSLATIONS[item.category?.toUpperCase() || 'HABER']?.[locale] || item.category}
                    </span>
                    <h2 className="text-base lg:text-lg font-bold text-gray-900 group-hover:text-amber-700 leading-snug line-clamp-2 transition-colors mb-2">
                      {item.title}
                    </h2>
                    {item.summary && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2 hidden lg:block">{item.summary}</p>
                    )}
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-[11px] font-mono text-gray-400">{formatDate(item.published_at, locale)}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Row 2: 3 Cards — with gap and shadows for separation */}
        <div className="bg-gray-50 border-t-4 border-amber-400/30">
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {secondaries.slice(2, 5).map((item, i) => (
                <motion.div
                  key={item.id}
                  className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                >
                  <Link href={`/news/${item.slug}`} className="block">
                    {/* Image */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={item.image_url || '/images/curtain-fabric-display.png'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => { const t = e.target as HTMLImageElement; if (item.slug && !t.src.includes('/api/news-image/')) { t.src = `/api/news-image/${item.slug}`; } else if (!t.src.includes('curtain-fabric-display')) { t.src = '/images/curtain-fabric-display.png'; } }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <span className={`absolute top-3 left-3 text-[10px] font-black tracking-[0.2em] uppercase border px-2.5 py-1 rounded ${catClass(item.category)}`}>
                        {CATEGORY_TRANSLATIONS[item.category?.toUpperCase() || 'HABER']?.[locale] || item.category}
                      </span>
                    </div>

                    {/* Text */}
                    <div className="p-5 lg:p-6">
                      <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-amber-700 leading-snug line-clamp-2 transition-colors mb-3">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-[11px] font-mono text-gray-500">
                          {formatDate(item.published_at, locale)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === Bottom strip: section categories === */}
      <div className="border-t border-border bg-muted/50 backdrop-blur-sm px-4 lg:px-8 py-3 flex items-center gap-1 overflow-x-auto">
        {['Şirket Haberleri', 'Koleksiyonlar', 'Küresel Pazar', 'Pazar Analizi', 'Teknoloji', 'Sürdürülebilirlik', 'Fuarlar', 'Kariyer'].map((label) => (
          <Link key={label} href={`/news?category=${label.toLowerCase()}`}
            className="flex-shrink-0 text-[11px] font-mono tracking-widest text-foreground hover:text-secondary uppercase px-3 py-1 border border-transparent hover:border-border transition-all duration-200"
          >
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
