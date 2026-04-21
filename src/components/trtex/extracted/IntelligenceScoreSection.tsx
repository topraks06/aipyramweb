'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ArrowRight, Star, Zap, Brain, Globe2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useTranslatedData, useAutoTranslate } from '@/hooks/useAutoTranslate';
import { FreshnessBadge } from '@/components/ui/FreshnessBadge';

interface Company {
  id: number;
  name: string;
  country: string;
  flag: string;
  region: string;
  category: string;
  sub: string;
  production: number;
  export: number;
  brand: number;
  innovation: number;
  iq_score: number;
  revenue: string;
  employees: number;
  founded: number;
  hq: string;
  note: string;
  risk_flag?: 'low' | 'medium' | 'high';
  trend?: 'rising' | 'stable' | 'declining';
  iq_confidence?: string;
  iq_change?: number;
  iq_last_updated?: string;
  iq_reliability?: number;
  scoring_notes?: string;
  scoring_breakdown?: {
    production_detail?: string;
    export_detail?: string;
    brand_detail?: string;
    innovation_detail?: string;
  };
}

// Frontend sektör etiketleri çeviri map'i (Hakan talimatı: brain'e değil, frontend'e koy)
const SECTOR_TR: Record<string, string> = {
  'Window Covering': 'Pencere Kaplama',
  'All Home': 'Tüm Ev Tekstili',
  'Towel & Bedding': 'Havlu & Yatak',
  'Towel & Sheet': 'Havlu & Çarşaf',
  'Carpet & Rug': 'Halı & Kilim',
  'Carpet & Flooring': 'Halı & Zemin Kaplama',
  'Performance Outdoor Fabric': 'Outdoor Teknik Kumaş',
  'Motorized Curtain': 'Motorlu Perde',
  'Mattress & Pillow': 'Yatak & Yastık',
  'Advanced Fabric': 'İleri Teknoloji Kumaş',
  'Fast Home': 'Hızlı Ev Tekstili',
  'Contract Textile': 'Kontrat Tekstili',
  'Premium Ev Tekstili': 'Premium Ev Tekstili',
  'Yatak Kumaşı Üretim': 'Yatak Kumaşı Üretim',
  'Yatak & Uyku Ürünleri': 'Yatak & Uyku Ürünleri',
  'Spandex & İplik': 'Spandex & İplik',
  'Ev Tekstili & Yatak': 'Ev Tekstili & Yatak',
  'İplik & Ev Tekstili': 'İplik & Ev Tekstili',
  'Pamuklu & Ev Tekstili': 'Pamuklu & Ev Tekstili',
  'Tekstil & Ev Ürünleri': 'Tekstil & Ev Ürünleri',
  'Çarşaf & İhracat': 'Çarşaf & İhracat',
  'Home Textile': 'Ev Tekstili',
  'Bedding': 'Yatak Grubu',
  'Fabric': 'Kumaş',
  'Carpet': 'Halı',
  'Upholstery Fabric': 'Döşemelik Kumaş',
  'Rugs & Flooring': 'Halı & Zemin',
};

function translateSub(sub: string, locale: string): string {
  if (locale === 'tr') return SECTOR_TR[sub] || sub;
  return sub; // Diğer dillerde useAutoTranslate hallediyor
}

// Fallback Top 10 (companies-global.json'dan en yüksek IQ'lu firmalar)
const FALLBACK_TOP10: Company[] = [
  { id:31, name:'IKEA Textile Division', country:'NL', flag:'🇸🇪', region:'Europe', category:'Home Textile', sub:'All Home', production:22, export:25, brand:25, innovation:23, iq_score:95, revenue:'€5B+', employees:50000, founded:1943, hq:'Leiden', note:'Dünyanın en büyük ev tekstili perakendecisi' },
  { id:1, name:'Welspun Living', country:'IN', flag:'🇮🇳', region:'South Asia', category:'Home Textile', sub:'Towel & Bedding', production:24, export:23, brand:22, innovation:21, iq_score:90, revenue:'₹95 Mrd', employees:25000, founded:1985, hq:'Mumbai', note:'Dünyanın en büyük havlu üreticisi' },
  { id:21, name:'Mohawk Industries', country:'US', flag:'🇺🇸', region:'Americas', category:'Rugs & Flooring', sub:'Carpet & Rug', production:24, export:20, brand:23, innovation:22, iq_score:89, revenue:'$11.1B', employees:36000, founded:1878, hq:'Calhoun, GA', note:'Dünyanın en büyük yer kaplama üreticisi' },
  { id:19, name:'Tempur Sealy', country:'US', flag:'🇺🇸', region:'Americas', category:'Bedding', sub:'Mattress & Pillow', production:22, export:19, brand:24, innovation:23, iq_score:88, revenue:'$5.1B', employees:13000, founded:1992, hq:'Lexington, KY', note:'Dünyanın en büyük yatak şirketi' },
  { id:77, name:'Zorlu Textile', country:'TR', flag:'🇹🇷', region:'Turkey', category:'Home Textile', sub:'All Home', production:22, export:21, brand:22, innovation:21, iq_score:86, revenue:'₺20 Mrd', employees:10000, founded:1953, hq:'İstanbul', note:'TAÇ, Linens — en güçlü Türk ev tekstili holdingi' },
  { id:64, name:'Toray Home Textile', country:'JP', flag:'🇯🇵', region:'East Asia', category:'Fabric', sub:'Advanced Fabric', production:22, export:19, brand:20, innovation:25, iq_score:86, revenue:'¥2.5T', employees:48000, founded:1926, hq:'Tokyo', note:'Dünyanın en inovatif tekstil firması' },
  { id:2, name:'Trident Group', country:'IN', flag:'🇮🇳', region:'South Asia', category:'Home Textile', sub:'Towel & Sheet', production:23, export:22, brand:20, innovation:21, iq_score:86, revenue:'₹70 Mrd', employees:18000, founded:1990, hq:'Ludhiana', note:'Hindistan 2. büyük havlu ihracatçısı' },
  { id:33, name:'Zara Home', country:'ES', flag:'🇪🇸', region:'Europe', category:'Home Textile', sub:'Fast Home', production:17, export:23, brand:24, innovation:21, iq_score:85, revenue:'€2B', employees:4000, founded:2003, hq:'A Coruña', note:'Inditex — ev tekstili fast-fashion lideri' },
  { id:22, name:'Shaw Industries', country:'US', flag:'🇺🇸', region:'Americas', category:'Carpet', sub:'Carpet & Flooring', production:23, export:18, brand:22, innovation:21, iq_score:84, revenue:'$6B', employees:22000, founded:1946, hq:'Dalton, GA', note:'Berkshire Hathaway — ABD halı lideri' },
  { id:50, name:'Kvadrat', country:'DK', flag:'🇩🇰', region:'Europe', category:'Upholstery Fabric', sub:'Contract Textile', production:17, export:20, brand:24, innovation:23, iq_score:84, revenue:'€250M', employees:2500, founded:1968, hq:'Ebeltoft', note:'Dünya kontrat döşemelik kumaş lideri' },
];

function ScoreBar({ value, max = 25, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        whileInView={{ width: `${(value / max) * 100}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}

export function IntelligenceScoreSection() {
  const [firms, setFirms] = useState<Company[]>(FALLBACK_TOP10);
  const [totalCount, setTotalCount] = useState(100);
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const t = useTranslations('iq');
  const locale = useLocale();
  const translatedFallback = useTranslatedData(FALLBACK_TOP10, ['note', 'sub'], 'Home textile company IQ scoreboard');
  const translate = useAutoTranslate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`/api/companies-global?locale=${locale}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.companies) && data.companies.length > 0) {
            setTotalCount(data.companies.length);
            const sorted = [...data.companies].sort((a: Company, b: Company) => b.iq_score - a.iq_score);
            const top10 = sorted.slice(0, 10);
            
            // Translate notes and sub for non-TR locales
            if (locale !== 'tr') {
              const textsToTranslate = top10.flatMap((c: Company) => [c.note || '', c.sub || '']);
              const translated = await translate(textsToTranslate, 'Company IQ scoreboard descriptions');
              top10.forEach((c: Company, i: number) => {
                c.note = translated[i * 2] || c.note;
                c.sub = translated[i * 2 + 1] || c.sub;
              });
            }
            setFirms(top10);
          } else {
            setFirms(translatedFallback);
          }
        } else {
          setFirms(translatedFallback);
        }
      } catch { setFirms(translatedFallback); }
    };
    fetchCompanies();
  }, [locale, translate, translatedFallback]);

  const filteredFirms = regionFilter === 'all' 
    ? firms 
    : firms.filter(f => f.region === regionFilter);

  const regions = ['all', ...new Set(firms.map(f => f.region))];
  const regionLabels: Record<string, string> = {
    'all': t('region_all'),
    'South Asia': t('region_south_asia'),
    'East Asia': t('region_east_asia'), 
    'Europe': t('region_europe'),
    'Americas': t('region_americas'),
    'Turkey': t('region_turkey'),
    'Oceania': t('region_oceania'),
    'Southeast Asia': t('region_southeast_asia'),
  };

  return (
    <section className="py-20 bg-background border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[200px] bg-secondary/8 blur-[120px] rounded-full" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">

        {/* Header */}
        <div className="flex items-end justify-between mb-10 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-secondary flex items-center justify-center flex-shrink-0">
                <Star className="w-3 h-3 text-secondary-foreground fill-current" />
              </div>
              <span className="font-mono text-[11px] tracking-[0.3em] text-secondary uppercase opacity-70">
              {t('scoreboard_label')}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              {t('title')} — <span className="italic text-secondary">{t('subtitle')}</span>
            </h2>
            <p className="text-foreground text-sm mt-2 max-w-lg font-light">
              {t('description', { count: totalCount })}
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <span className="text-[11px] font-mono text-foreground tracking-widest uppercase">{t('methodology')}</span>
            <div className="flex gap-2 flex-wrap justify-end">
              {[t('production_criteria'), t('export_criteria'), t('brand_criteria'), t('innovation_criteria')].map((c) => (
                <span key={c} className="text-[11px] font-mono text-foreground border border-border px-2 py-0.5">{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Globe2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegionFilter(r)}
              className={`text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 border transition-all flex-shrink-0 ${
                regionFilter === r
                  ? 'bg-secondary/10 border-secondary/30 text-secondary'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {regionLabels[r] || r}
            </button>
          ))}
        </div>

        {/* Score table */}
        <div className="flex flex-col gap-px bg-muted">
          <div className="bg-background grid grid-cols-[auto_1fr_repeat(4,80px)_100px] gap-4 px-6 py-3 text-[11px] font-black text-foreground tracking-[0.2em] uppercase hidden lg:grid">
            <span>#</span>
            <span>{t('firm_column')}</span>
            <span>{t('production_criteria')}</span>
            <span>{t('export_criteria')}</span>
            <span>{t('brand_criteria')}</span>
            <span>{t('innovation_criteria')}</span>
            <span className="text-right">TRTEX IQ™</span>
          </div>

          {filteredFirms.map((firm, i) => (
            <motion.div
              key={firm.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <div className="group bg-white hover:bg-white transition-colors duration-300 px-6 py-5 grid grid-cols-1 lg:grid-cols-[auto_1fr_repeat(4,80px)_100px] gap-4 items-center">
                <div className="hidden lg:flex w-7 h-7 rounded-full bg-muted items-center justify-center">
                  <span className="text-[11px] font-black text-foreground">{i + 1}</span>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base">{firm.flag}</span>
                    <span className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors truncate">
                      {firm.name}
                    </span>
                    {firm.trend === 'rising' && <TrendingUp className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                    {firm.trend === 'declining' && <TrendingDown className="w-3 h-3 text-red-500 flex-shrink-0" />}
                    {firm.risk_flag === 'high' && <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                    <span className="hidden xl:inline text-[11px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 truncate">
                      {firm.revenue}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-foreground">
                    <span>{firm.hq}</span>
                    <span>·</span>
                    <span>{translateSub(firm.sub, locale)}</span>
                  </div>
                  {firm.note && (
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate hidden xl:block">{firm.note}</p>
                  )}
                </div>

                {([
                  { val: firm.production, color: 'bg-emerald-600' },
                  { val: firm.export, color: 'bg-blue-400' },
                  { val: firm.brand, color: 'bg-purple-400' },
                  { val: firm.innovation, color: 'bg-secondary' },
                ] as { val: number; color: string }[]).map((s, idx) => (
                  <div key={idx} className="hidden lg:flex flex-col gap-1.5">
                    <span className="text-[11px] font-black text-foreground">{s.val}</span>
                    <ScoreBar value={s.val} color={s.color} />
                  </div>
                ))}

                <div className="flex items-center justify-between lg:justify-end gap-3">
                  <div className="flex flex-col items-end">
                    <span 
                      className={`text-2xl font-black cursor-pointer hover:scale-110 transition-transform ${firm.iq_score >= 85 ? 'text-secondary' : 'text-foreground'}`}
                      onClick={() => setExpandedId(expandedId === firm.id ? null : firm.id)}
                      title="Neden bu skor? Tıkla"
                    >
                      {firm.iq_score}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-gray-400">IQ™</span>
                      {firm.iq_confidence && (
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          firm.iq_confidence === 'high' ? 'bg-emerald-500' :
                          firm.iq_confidence === 'medium' ? 'bg-amber-400' :
                          'bg-gray-300'
                        }`} title={`Güven: ${firm.iq_confidence}`} />
                      )}
                    </div>
                    {firm.iq_change !== undefined && firm.iq_change !== 0 && (
                      <span className={`text-[10px] font-black ${firm.iq_change > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {firm.iq_change > 0 ? '+' : ''}{firm.iq_change}
                      </span>
                    )}
                    {firm.iq_last_updated && (
                      <FreshnessBadge updatedAt={firm.iq_last_updated} size="sm" showAge={true} />
                    )}
                  </div>
                </div>
              </div>

              {/* 📊 Neden bu skor? — Expandable explanation */}
              {expandedId === firm.id && firm.scoring_breakdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="col-span-full bg-gray-50 border-t border-gray-100 px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-3"
                >
                  {[
                    { label: '🏭 Üretim', val: firm.production, detail: firm.scoring_breakdown.production_detail, color: 'border-emerald-400' },
                    { label: '📦 İhracat', val: firm.export, detail: firm.scoring_breakdown.export_detail, color: 'border-blue-400' },
                    { label: '🏷️ Marka', val: firm.brand, detail: firm.scoring_breakdown.brand_detail, color: 'border-purple-400' },
                    { label: '💡 İnovasyon', val: firm.innovation, detail: firm.scoring_breakdown.innovation_detail, color: 'border-amber-400' },
                  ].map((item) => (
                    <div key={item.label} className={`bg-white p-3 rounded border-l-2 ${item.color}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-gray-700">{item.label}</span>
                        <span className="text-[12px] font-black text-gray-900">{item.val}/25</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed">{item.detail || 'Veri güncelleniyor...'}</p>
                    </div>
                  ))}
                  {firm.scoring_notes && (
                    <div className="col-span-full text-[10px] text-gray-400 italic mt-1">
                      📊 {firm.scoring_notes}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-6 border-t border-border">
          <div>
            <p className="text-foreground text-sm font-light">
              <span className="text-secondary font-bold">TRTEX IQ™</span> — {t('description', { count: totalCount })}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-mono"><ShieldCheck className="w-3 h-3" />{t('ai_verified')}</span>
              <span className="text-[10px] text-gray-400 font-mono">↳ {t('premium_note')}</span>
            </div>
          </div>
          <Link href="/companies" className="flex items-center gap-2 bg-secondary/10 border border-secondary/30 hover:bg-secondary/20 text-secondary px-5 py-2.5 text-[11px] font-black tracking-[0.15em] uppercase transition-all flex-shrink-0">
            <Zap className="w-3.5 h-3.5" />
            {t('view_all_companies', { count: totalCount })}
          </Link>
        </div>
        <p className="text-[10px] text-gray-400 mt-4 text-center">
          {t('disclaimer')}
        </p>
      </div>
    </section>
  );
}
