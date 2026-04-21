'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown, Minus, AlertTriangle, Eye, Globe2, Factory, Ship, DollarSign, BarChart3, Handshake, Target } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { FreshnessIndicator } from '@/components/ui/FreshnessIndicator';
import { useTranslations, useLocale } from 'next-intl';
import { useTranslatedData, useAutoTranslate } from '@/hooks/useAutoTranslate';

/* ────────────────────────────────────────────── */
/*  DATA                                          */
/* ────────────────────────────────────────────── */

const CHINA_MARKET_LABELS: Record<string, Record<string, string>> = {
  'Pamuk (Zhengzhou)': { tr: 'Pamuk (Zhengzhou)', en: 'Cotton (Zhengzhou)', de: 'Baumwolle (Zhengzhou)', zh: '棉花 (Zhengzhou)', ru: 'Хлопок (Zhengzhou)', fr: 'Coton (Zhengzhou)', ar: 'قطن (Zhengzhou)' },
  'Hindistan Pamuk': { tr: 'Hindistan Pamuk', en: 'India Cotton', de: 'Indien Baumwolle', zh: '印度棉花', ru: 'Индийский хлопок', fr: 'Coton Inde', ar: 'قطن هندي' },
  'Nakliye (Asia→TR)': { tr: 'Nakliye (Asia→TR)', en: 'Freight (Asia→TR)', de: 'Fracht (Asien→TR)', zh: '运费 (Asia→TR)', ru: 'Фрахт (Asia→TR)', fr: 'Fret (Asie→TR)', ar: 'شحن (Asia→TR)' },
};

function localizeMarketLabel(label: string, locale: string): string {
  return CHINA_MARKET_LABELS[label]?.[locale] || label;
}

const FE_MARKET_DATA = [
  { label: 'CNY/USD', value: '¥7.25', change: '+0.12%', trend: 'up' as const },
  { label: 'JPY/USD', value: '¥154.8', change: '-0.3%', trend: 'down' as const },
  { label: 'PKR/USD', value: '₨278.5', change: '+0.4%', trend: 'up' as const },
  { label: 'Pamuk (Zhengzhou)', value: '¥15,120', change: '+1.8%', trend: 'up' as const },
  { label: 'Hindistan Pamuk', value: '₹58,200/t', change: '+2.1%', trend: 'up' as const },
  { label: 'Nakliye (Asia→TR)', value: '$2,180', change: '-5.1%', trend: 'down' as const },
];

const FE_COMPANIES = [
  {
    name: 'Sunvim Group',
    ticker: 'SZ:603365',
    country: '🇨🇳',
    iq: 86,
    delta: 0,
    revenue: '¥5.17 Mrd',
    segment: 'Yatak & Banyo',
    risk: 'low' as const,
    news: 'Q3 gelir tahmini aşıldı — %8 büyüme',
  },
  {
    name: 'Nitori Holdings',
    ticker: 'TYO:9843',
    country: '🇯🇵',
    iq: 91,
    delta: 2,
    revenue: '¥948 Mrd',
    segment: 'Ev & Yaşam Perakende',
    risk: 'low' as const,
    news: 'Güneydoğu Asya\'da 120 yeni mağaza planı — ev tekstili odak',
  },
  {
    name: 'Luolai Lifestyle',
    ticker: 'SH:002293',
    country: '🇨🇳',
    iq: 82,
    delta: -1,
    revenue: '¥3.82 Mrd',
    segment: 'Premium Ev Tekstili',
    risk: 'medium' as const,
    news: 'Online satış kanalı %30 büyüdü ama marjlar daraldı',
  },
  {
    name: 'Hyosung TNC',
    ticker: 'KRX:298020',
    country: '🇰🇷',
    iq: 79,
    delta: 1,
    revenue: '₩4.2T',
    segment: 'Spandex & İplik',
    risk: 'low' as const,
    news: 'Creora® spandex ile ev tekstili pazarına giriş — Türkiye dağıtım anlaşması',
  },
  {
    name: 'Welspun India',
    ticker: 'BSE:514162',
    country: '🇮🇳',
    iq: 77,
    delta: -1,
    revenue: '₹95 Mrd',
    segment: 'Havlu & Çarşaf',
    risk: 'medium' as const,
    news: 'ABD pazarında Walmart/Target ile büyüme — Türk üreticilere rakip',
  },
  {
    name: 'Gul Ahmed Textile',
    ticker: 'PSX:GATM',
    country: '🇵🇰',
    iq: 74,
    delta: 2,
    revenue: '₨85 Mrd',
    segment: 'Ev Tekstili & Yatak',
    risk: 'medium' as const,
    news: 'AB ve ABD\'ye ev tekstili ihracatı %12 arttı — yatak çarşafında güçlü',
  },
  {
    name: 'Nishat Mills',
    ticker: 'PSX:NML',
    country: '🇵🇰',
    iq: 72,
    delta: 0,
    revenue: '₨120 Mrd',
    segment: 'İplik & Ev Tekstili',
    risk: 'medium' as const,
    news: 'Dikey entegrasyon avantajı — pamuktan nihai ürüne kadar kontrol',
  },
  {
    name: 'Beximco Textiles',
    ticker: 'DSE:BEXT',
    country: '🇧🇩',
    iq: 68,
    delta: 1,
    revenue: '$320M',
    segment: 'Pamuklu & Ev Tekstili',
    risk: 'high' as const,
    news: 'AB gümrüksüz erişim avantajıyla ihracat %15 büyüme — perde kumaşı yeni odak',
  },
  {
    name: 'TNG Investment',
    ticker: 'HOSE:TNG',
    country: '🇻🇳',
    iq: 70,
    delta: 3,
    revenue: '$280M',
    segment: 'Tekstil & Ev Ürünleri',
    risk: 'low' as const,
    news: 'FTA avantajıyla AB ve ABD\'ye ihracatta %18 büyüme',
  },
];

const FE_ALERTS = [
  {
    type: 'warning' as const,
    title: 'Çin Polyester Fiyat Savaşı Kızışıyor',
    detail: 'Jiangsu bölgesindeki üreticiler ton başına $120 fiyat kırımına gitti. Türk jakarlı üreticiler avantajlı ancak düz kumaş üreticileri baskı altında.',
    impact: 'YÜKSEK',
    date: '18 Mar 2026',
  },
  {
    type: 'info' as const,
    title: 'Japonya İç Pazar Talebi Yükselişte',
    detail: 'Nitori ve MUJI ev tekstili segmentinde %12 büyüme raporladı. Türk perde kumaşı tedarikçileri için Japon pazarı fırsatı.',
    impact: 'ORTA',
    date: '17 Mar 2026',
  },
  {
    type: 'opportunity' as const,
    title: 'Hindistan-AB FTA Müzakereleri Hızlanıyor',
    detail: 'Welspun ve Trident gibi Hint üreticiler AB pazarına gümrüksüz giriş hedefliyor. Türk ev tekstili ihracatçıları için rekabet baskısı artabilir.',
    impact: 'STRATEJİK',
    date: '16 Mar 2026',
  },
];

const FE_COUNTRIES = [
  { flag: '🇻🇳', country: 'Vietnam', trend: 'Yükseliyor', detail: 'FTA ile AB-ABD ihracatı %18 arttı', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { flag: '🇨🇳', country: 'Çin', trend: 'Yavaşlıyor', detail: 'İç talep düşüşte, fiyat kırımı', color: 'text-red-600', bg: 'bg-red-50' },
  { flag: '🇵🇰', country: 'Pakistan', trend: 'Büyüyor', detail: '$1.23B ev tekstili — AB siparişleri güçlü', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { flag: '🇮🇳', country: 'Hindistan', trend: 'Tehdit', detail: 'AB FTA ile gümrüksüz giriş planı', color: 'text-amber-600', bg: 'bg-amber-50' },
  { flag: '🇧🇩', country: 'Bangladeş', trend: 'Stabil', detail: '$511M pazar — AB gümrüksüz erişim', color: 'text-blue-600', bg: 'bg-blue-50' },
  { flag: '🇯🇵', country: 'Japonya', trend: 'Genişliyor', detail: 'Nitori GA Asya hedefi 120 mağaza', color: 'text-cyan-600', bg: 'bg-cyan-50' },
];

const FE_OPPORTUNITIES = [
  {
    flag: '🇨🇳', type: 'HAMMADDE',
    title: 'Çin PES İplik Fiyatları 2026 Dibi Gördü',
    detail: 'Zhejiang borsasında polyester POY fiyatı 6.800 CNY/ton\'a geriledi (2024: 7.900). Jakarlı perde kumaşı hammadde maliyetinde fırsat penceresi açık.',
    action: 'Pazar verisi', color: 'border-l-red-500', href: '/global-news',
  },
  {
    flag: '🇪🇺', type: 'TİCARET',
    title: 'AB-Türkiye Gümrük Birliği Güncelleme Müzakereleri',
    detail: 'AB Komisyonu 2026 gündeminde Gümrük Birliği modernizasyonu var. Ev tekstilinde tarife avantajı korunursa Türk ihracatçılar için kritik.',
    action: 'Analiz oku', color: 'border-l-blue-500', href: '/insights',
  },
  {
    flag: '🇯🇵', type: 'PAZAR',
    title: 'Japonya Perde Kumaşı İthalatı Artıyor',
    detail: 'Japonya\'nın ev tekstili ithalatı 2025\'te %6.2 arttı. Yen\'in zayıflığına rağmen kaliteli jakarlı perde talebi güçlü — Türk üreticiler için büyüyen pazar.',
    action: 'Detaylı rapor', color: 'border-l-purple-500', href: '/insights',
  },
  {
    flag: '🇮🇳', type: 'REKABET',
    title: 'Hindistan Ev Tekstili İhracatında %12 Büyüme',
    detail: 'Hindistan 2025\'te $12.7B ev tekstili ihracatı gerçekleştirdi. Türkiye\'nin avantajları: AB\'ye coğrafi yakınlık, hızlı teslimat ve OEKO-TEX sertifikasyon oranı.',
    action: 'Rekabet analizi', color: 'border-l-amber-500', href: '/global-news',
  },
  {
    flag: '🇻🇳', type: 'FTA',
    title: 'Vietnam-AB Serbest Ticaret Anlaşması Etkisi',
    detail: 'EVFTA kapsamında Vietnam\'dan AB\'ye %0 gümrükle ev tekstili girişi. Türk üreticiler katma değer ve tasarım gücüyle fark yaratabilir.',
    action: 'Strateji notu', color: 'border-l-emerald-500', href: '/insights',
  },
  {
    flag: '🇧🇩', type: 'TREND',
    title: 'Bangladeş Konfeksiyondan Ev Tekstiline Kayıyor',
    detail: 'Bangladeş\'in ev tekstili ihracatı $2.1B\'a ulaştı. Henüz perde ve dekoratif kumaşta zayıf — bu segmentte Türkiye premium konumunu koruyor.',
    action: 'Pazar haritası', color: 'border-l-cyan-500', href: '/global-news',
  },
];

/* ────────────────────────────────────────────── */
/*  HELPERS                                       */
/* ────────────────────────────────────────────── */

function getIQColor(iq: number) {
  if (iq >= 80) return 'text-emerald-600';
  if (iq >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function getRiskBadge(risk: 'low' | 'medium' | 'high', t: any) {
  const map = {
    low: { label: t('low'), cls: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    medium: { label: t('medium'), cls: 'bg-amber-100 text-amber-700 border-amber-300' },
    high: { label: t('high'), cls: 'bg-red-100 text-red-700 border-red-300' },
  };
  return map[risk];
}

function getAlertStyle(type: string) {
  const map: Record<string, { icon: any; border: string; bg: string; badge: string }> = {
    warning: { icon: AlertTriangle, border: 'border-l-red-500', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700' },
    risk: { icon: AlertTriangle, border: 'border-l-red-500', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700' },
    info: { icon: Ship, border: 'border-l-blue-500', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
    opportunity: { icon: DollarSign, border: 'border-l-emerald-500', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
    'fırsat': { icon: DollarSign, border: 'border-l-emerald-500', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
  };
  return map[type] || map.info; // fallback: info stili
}

/* ────────────────────────────────────────────── */
/*  COMPONENT                                     */
/* ────────────────────────────────────────────── */

export function ChinaWatchSection() {
  const t = useTranslations('market');
  const locale = useLocale();

  // Localize market labels immediately (static map, no async)
  const localizedMarketFallback = FE_MARKET_DATA.map(m => ({ ...m, label: localizeMarketLabel(m.label, locale) }));

  const [marketData, setMarketData] = useState(localizedMarketFallback);
  const [companies, setCompanies] = useState(FE_COMPANIES);
  const [alerts, setAlerts] = useState(FE_ALERTS);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(undefined);
  const [trendSummary, setTrendSummary] = useState<string | undefined>(undefined);
  const [ceoSummary, setCeoSummary] = useState<string>('🇨🇳 Çin zayıf · 🇻🇳 Vietnam güçlü · 🇮🇳 Hindistan tehdit · 🇵🇰 Pakistan büyüyor');

  // Auto-translate hardcoded fallback data for non-TR locales
  const translatedMarket = useTranslatedData(FE_MARKET_DATA, ['label'], 'Financial market data labels');
  const translatedCompanies = useTranslatedData(FE_COMPANIES, ['segment', 'news'], 'Home textile company data');
  const translatedAlerts = useTranslatedData(FE_ALERTS, ['title', 'detail', 'impact'], 'Market intelligence alerts');
  const translatedCountries = useTranslatedData(FE_COUNTRIES, ['country', 'trend', 'detail'], 'Country textile market trends');
  const translatedOpportunities = useTranslatedData(FE_OPPORTUNITIES, ['type', 'title', 'detail', 'action'], 'Business opportunity cards');
  const translate = useAutoTranslate();

  useEffect(() => {
    async function fetchRadar() {
      try {
        const res = await fetch(`/api/site-brain?section=far_east_radar&locale=${locale}`);
        if (!res.ok) return;
        const { data } = await res.json();
        if (!data) return;
        if (data.market_data?.length) {
          // Apply static localization to labels (instant, no API)
          data.market_data.forEach((m: any) => { m.label = localizeMarketLabel(m.label, locale); });
          setMarketData(data.market_data);
        } else {
          setMarketData(localizedMarketFallback);
        }
        if (data.companies?.length) {
          // Translate brain-returned companies if non-TR
          if (locale !== 'tr') {
            const texts = data.companies.flatMap((c: any) => [c.segment || '', c.news || '']);
            const tr = await translate(texts, 'Far east company tracking data');
            data.companies.forEach((c: any, i: number) => {
              c.segment = tr[i * 2] || c.segment;
              c.news = tr[i * 2 + 1] || c.news;
            });
          }
          setCompanies(data.companies);
        } else {
          // No brain firms — translate fallback inline
          if (locale !== 'tr') {
            const texts = FE_COMPANIES.flatMap(c => [c.segment, c.news]);
            const tr = await translate(texts, 'Far east company tracking data');
            const translated = FE_COMPANIES.map((c, i) => ({
              ...c,
              segment: tr[i * 2] || c.segment,
              news: tr[i * 2 + 1] || c.news,
            }));
            setCompanies(translated);
          } else {
            setCompanies(FE_COMPANIES);
          }
        }
        if (data.alerts?.length) setAlerts(data.alerts);
        else setAlerts(translatedAlerts);
        if (data.updated_at) setUpdatedAt(data.updated_at);
        if (data.trend_summary) {
          if (locale !== 'tr') {
            const [tr] = await translate([data.trend_summary], 'AI market trend summary');
            setTrendSummary(tr);
          } else {
            setTrendSummary(data.trend_summary);
          }
        }
      } catch { /* fallback */ }
    }
    async function fetchCeo() {
      try {
        const res = await fetch(`/api/site-brain?section=ceo_summary&locale=${locale}`);
        if (!res.ok) return;
        const { data } = await res.json();
        if (data?.summary) {
          if (locale !== 'tr') {
            const [tr] = await translate([data.summary], 'CEO market summary');
            setCeoSummary(tr || data.summary);
          } else {
            setCeoSummary(data.summary);
          }
        }
      } catch { /* fallback */ }
    }
    fetchRadar();
    fetchCeo();
    // Translate ceoSummary default for non-TR
    if (locale !== 'tr') {
      translate([ceoSummary], 'CEO market summary').then((r: string[]) => {
        if (r[0] && r[0] !== ceoSummary) setCeoSummary(r[0]);
      });
    }
  }, [locale]);

  return (
    <section className="py-20 bg-background border-t border-border relative overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">

        {/* ── HEADER ── */}
        <div className="flex items-end justify-between mb-10 pb-6 border-b border-border/40">
          <div>
            <span className="font-mono text-[11px] tracking-[0.3em] text-amber-600 uppercase mb-3 flex items-center gap-2">
              <span className="text-lg">🌏</span> {t('far_east_radar')}
            </span>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              {t('title')}
            </h2>
            <p className="text-gray-500 text-sm font-light mt-2 max-w-md">
              {t('subtitle')}
            </p>
            {/* CEO Özet — 3 saniyede anla */}
            <div className="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 px-4 py-2.5 flex items-center gap-3 max-w-xl">
              <span className="text-[11px] font-black tracking-wider text-amber-700 uppercase flex-shrink-0">{t('today')}</span>
              <span className="text-[12px] text-gray-700 font-medium">
                {ceoSummary}
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 text-[11px] font-mono text-red-600/70 bg-red-50 border border-red-200 px-3 py-1.5 rounded-sm">
              <Globe2 className="w-3 h-3 animate-pulse" />
              {t('global_scan_active')}
            </div>
            <FreshnessIndicator updatedAt={updatedAt} />
            {trendSummary && (
              <span className="text-[11px] font-mono text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-sm">
                📊 {trendSummary}
              </span>
            )}
            <Link href="/global-news" className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-gray-500 hover:text-red-600 uppercase transition-colors">
              {t('global_news')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* ── MARKET TICKER ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-border/20 mb-6">
          {marketData.map((item) => (
            <div key={item.label} className="bg-white px-5 py-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-gray-400 tracking-widest uppercase block mb-1">{item.label}</span>
                <span className="text-lg font-black text-foreground">{item.value}</span>
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${item.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {item.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {item.change}
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID: Companies + Alerts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT: Company Tracker (3 cols) */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-foreground tracking-widest uppercase flex items-center gap-2">
                <Factory className="w-4 h-4 text-gray-400" /> {t('firm_tracking')}
              </h3>
              <span className="text-[11px] font-mono text-gray-400">{t('iq_score')}</span>
            </div>

            <div className="flex flex-col gap-px bg-border/20">
              {companies.map((company, i) => {
                const riskBadge = getRiskBadge(company.risk, t);
                return (
                  <motion.div
                    key={company.ticker}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.4 }}
                  >
                    <div className="bg-white hover:bg-gray-50 transition-colors duration-300 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Company info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-gray-900">{company.country} {company.name}</span>
                          <span className="text-[11px] font-mono text-gray-400">{company.ticker}</span>
                          <span className={`text-[11px] font-black tracking-wider uppercase border px-1.5 py-0.5 ${riskBadge.cls}`}>
                            {t('risk_label')} {riskBadge.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-gray-500 mb-1">
                          <span>{company.segment}</span>
                          <span>·</span>
                          <span>{company.revenue}</span>
                        </div>
                        <p className="text-[12px] text-gray-600 leading-relaxed line-clamp-1">{company.news}</p>
                      </div>

                      {/* IQ Score */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-center">
                          <span className={`text-2xl font-black ${getIQColor(company.iq)}`}>{company.iq}</span>
                          <span className="text-[11px] font-mono text-gray-400 block">IQ™</span>
                        </div>
                        <div className={`flex items-center gap-0.5 text-[11px] font-bold ${
                          company.delta > 0 ? 'text-emerald-600' : company.delta < 0 ? 'text-red-600' : 'text-gray-400'
                        }`}>
                          {company.delta > 0 && <TrendingUp className="w-3 h-3" />}
                          {company.delta < 0 && <TrendingDown className="w-3 h-3" />}
                          {company.delta === 0 && <Minus className="w-3 h-3" />}
                          {company.delta !== 0 && `${company.delta > 0 ? '+' : ''}${company.delta}`}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Risk & Intelligence Alerts (2 cols) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-foreground tracking-widest uppercase flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> {t('intelligence_alerts')}
              </h3>
              <span className="text-[11px] font-mono text-gray-400">{t('last_3_days')}</span>
            </div>

            <div className="flex flex-col gap-3">
              {alerts.map((alert, i) => {
                const style = getAlertStyle(alert.type);
                const Icon = style.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className={`border border-border/40 border-l-4 ${style.border} ${style.bg} p-4`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[11px] font-black tracking-wider uppercase px-1.5 py-0.5 ${style.badge}`}>
                            {alert.impact}
                          </span>
                          <span className="text-[11px] font-mono text-gray-400">{alert.date}</span>
                        </div>
                        <h4 className="text-[13px] font-bold text-gray-900 leading-snug mb-1.5">{alert.title}</h4>
                        <p className="text-[12px] text-gray-600 leading-relaxed line-clamp-2">{alert.detail}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* ── AI TREND YORUMLARI ── */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {translatedCountries.map((t) => (
                <div key={t.country} className={`${t.bg} border border-gray-200 p-3 flex items-center gap-2`}>
                  <span className="text-lg">{t.flag}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-gray-900">{t.country}</span>
                      <span className={`text-[10px] font-black tracking-wider uppercase ${t.color}`}>{t.trend}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">{t.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Summary CTA */}
            <div className="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 p-4 flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[11px] font-black tracking-wider text-amber-700 uppercase">{t('ai_weekly_summary')}</p>
                <p className="text-[12px] text-gray-600 mt-0.5">{t('ai_weekly_desc')}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-red-400" />
            </div>
          </div>
        </div>
        {/* ── İŞ BİRLİĞİ FIRSATLARI ── */}
        <div className="mt-10 pt-8 border-t border-border/40">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-amber-100 border border-amber-300 flex items-center justify-center rounded-lg">
              <Handshake className="w-5 h-5 text-amber-700" />
            </div>
            <div>
            <h3 className="text-sm font-black text-foreground tracking-widest uppercase">{t('opportunities')}</h3>
              <p className="text-[11px] text-gray-500">{t('opportunities_desc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {translatedOpportunities.map((opp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className={`bg-white border border-gray-200 border-l-4 ${opp.color} p-5 hover:shadow-md transition-shadow duration-300 group`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{opp.flag}</span>
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-500 bg-gray-100 px-2 py-0.5">{opp.type}</span>
                </div>
                <h4 className="text-[13px] font-bold text-gray-900 leading-snug mb-2">{opp.title}</h4>
                <p className="text-[12px] text-gray-600 leading-relaxed mb-3 line-clamp-2">{opp.detail}</p>
                <Link
                  href={opp.href}
                  className="flex items-center gap-1.5 text-[11px] font-black tracking-wider text-amber-600 hover:text-amber-500 uppercase transition-colors group-hover:translate-x-0.5"
                >
                  <Target className="w-3 h-3" />
                  {opp.action}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM: Quick insight ── */}
        <div className="mt-6 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4 text-gray-400" />
            <p className="text-[12px] text-gray-500">
              <span className="font-bold text-gray-700">{t('global_scan_agent')}</span> Sunvim, Nitori, Luolai, Hyosung, Welspun — {t('auto_scan_06')}
            </p>
          </div>
          <Link href="/companies" className="flex items-center gap-2 text-[11px] font-black tracking-widest text-amber-600 hover:text-amber-500 uppercase transition-colors">
            {t('all_far_east')} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
