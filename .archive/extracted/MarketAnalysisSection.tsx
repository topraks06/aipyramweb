'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown, BarChart3, AlertTriangle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useMarketData, useCommodityData } from '@/hooks/useMarketData';
import { useLocale, useTranslations } from 'next-intl';
import { useTranslatedData, useAutoTranslate } from '@/hooks/useAutoTranslate';

// Market data is now fetched from useMarketData hook inside the component

const ANALYSIS_CARDS = [
  {
    category: 'PAZAR ANALİZİ',
    categoryColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    headline: 'Türkiye Ev Tekstili İhracatı 2025: 11,39 Milyar Dolar, Hedef 2026\'da 13 Milyar',
    summary: 'TUİK ve İTKİB verilerine göre Türkiye 2025\'te dünya 4. büyük ev tekstili ihracatçısı konumunu korudu. Perde ve perdeli kumaş segmentinde Avrupa payı %52\'yi aştı.',
    stat: '$11.39Mrd',
    statLabel: '2025 İhracat',
    image: '/images/cotton-market.png',
    date: '17 Mar 2026',
    href: '/news/turkiye-ihracat-analiz-2025',
    icon: TrendingUp,
    highlight: 'up',
  },
  {
    category: 'REKABET',
    categoryColor: 'text-red-600 border-red-500/30 bg-red-500/10',
    headline: 'Çin\'in Polyester Fiyat Savaşı: Türk Üreticiler "Katma Değer" Stratejisine Geçiyor',
    summary: 'Çin\'in agresif polyester kumaş fiyatlandırması Türk üreticileri baskı altına alıyor. Sektörün yanıtı açık: premium jakarlı, sürdürülebilir ve teknik kumaşlara odaklanma.',
    stat: 'KARARLILIK',
    statLabel: 'Sektör Cevabı',
    image: '/images/global-textile-trade.png',
    date: '16 Mar 2026',
    href: '/news/cin-rekabet-turk-strateji',
    icon: AlertTriangle,
    highlight: 'warning',
  },
  {
    category: 'TAHMİN',
    categoryColor: 'text-emerald-600 border-emerald-600/30 bg-emerald-600/10',
    headline: 'CAGR %4.3: Global Ev Tekstili Pazarı 2033\'te 17.2 Milyar Dolar',
    summary: 'Grand View Research raporuna göre global ev tekstili pazarı 2026-2033 arasında yıllık %4.3 büyüyecek. Türkiye\'nin Avrupa ve Körfez\'deki konumu stratejik avantaj sunuyor.',
    stat: '%4.3 CAGR',
    statLabel: '2026–2033',
    image: '/images/curtain-fabric-display.png',
    date: '15 Mar 2026',
    href: '/news/global-pazar-tahmin-2033',
    icon: BarChart3,
    highlight: 'up',
  },
];

export function MarketAnalysisSection() {
  const locale = useLocale();
  const { rates } = useMarketData(locale);
  const commodities = useCommodityData(locale);
  const translatedCards = useTranslatedData(ANALYSIS_CARDS, ['category', 'headline', 'summary', 'statLabel', 'stat'], 'Market analysis cards');
  const translate = useAutoTranslate();
  const t = useTranslations('market');

  const MARKET_DATA = [
    ...rates
      .filter(r => ['USD/TRY', 'EUR/TRY'].includes(r.pair))
      .map(r => ({
        indicator: r.pair,
        value: r.value,
        change: r.change,
        trend: r.trend,
        note: r.pair === 'USD/TRY' ? 'ihracatçı avantajlı' : 'Avrupa ihracatı',
      })),
    { indicator: 'Pamuk (lb)', value: commodities[0]?.value || '$0.84', change: commodities[0]?.change || '+1.8%', trend: 'up' as const, note: 'hammadde baskısı' },
    { indicator: 'PES İplik (kg)', value: commodities[1]?.value || '$1.15', change: commodities[1]?.change || '-0.5%', trend: 'down' as const, note: 'polyester fiyatı' },
  ];
  const translatedMarket = useTranslatedData(MARKET_DATA, ['indicator', 'note'], 'Financial market data');

  return (
    <section className="py-20 bg-background border-t border-border/30">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-10 pb-6 border-b border-border/40">
          <div>
            <span className="font-mono text-[11px] tracking-[0.25em] text-secondary uppercase mb-3 block opacity-70">
              {t('market_analysis')}
            </span>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              {t('data_intelligence').split('&')[0].trim()} & <span className="italic text-secondary">{t('intelligence')}</span>
            </h2>
          </div>
          <Link href="/news?category=analiz" className="hidden sm:flex items-center gap-2 text-[11px] font-mono tracking-widest text-muted-foreground hover:text-secondary uppercase transition-colors">
            {t('all_analyses')} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Market ticker strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/20 mb-px">
          {translatedMarket.map((item) => (
            <div key={item.indicator} className="bg-white px-5 py-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-muted-foreground tracking-widest uppercase block mb-1">{item.indicator}</span>
                <span className="text-lg font-black text-foreground">{item.value}</span>
                <span className="text-[11px] font-mono text-muted-foreground/60 block">{item.note}</span>
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${item.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {item.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {item.change}
              </div>
            </div>
          ))}
        </div>

        {/* Analysis cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
        >
          {translatedCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.headline}
                variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
              >
                <Link href={card.href} className="group flex flex-col bg-white hover:bg-gray-50 transition-colors duration-500 h-full">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <img src={card.image} alt={card.headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale-[0.3] group-hover:grayscale-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117]/70 to-transparent" />
                    <span className={`absolute top-3 left-3 text-[11px] font-black tracking-[0.2em] uppercase border px-2.5 py-1 ${card.categoryColor}`}>
                      {card.category}
                    </span>
                    <div className="absolute bottom-3 right-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        card.highlight === 'up' ? 'bg-emerald-600/20 border border-emerald-600/40' :
                        card.highlight === 'warning' ? 'bg-red-500/20 border border-red-500/40' :
                        'bg-blue-500/20 border border-blue-500/40'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          card.highlight === 'up' ? 'text-emerald-600' :
                          card.highlight === 'warning' ? 'text-red-600' : 'text-blue-400'
                        }`} />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors leading-snug mb-3 line-clamp-3">
                      {card.headline}
                    </h3>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed line-clamp-3 flex-1">{card.summary}</p>
                    <div className="mt-4 pt-4 border-t border-border/20 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-black text-foreground block">{card.stat}</span>
                        <span className="text-[11px] font-mono text-secondary">{card.statLabel}</span>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground">{card.date}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
