'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, ArrowRight, Star, Zap, Globe2, ExternalLink } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useTranslatedData, useAutoTranslate } from '@/hooks/useAutoTranslate';

interface Fair {
  name: string;
  dates: string;
  startDate: string; // ISO for countdown
  city: string;
  country: string;
  flag: string;
  hall?: string;
  website: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  tags: string[];
  visitors: string;
  exhibitors: string;
  trtexCoverage: boolean;
  desc: string;
}

const FAIR_CALENDAR: Fair[] = [
  // ── TÜRKİYE ──
  {
    name: 'Hometex Istanbul 2026',
    dates: '19-22 Mayıs 2026',
    startDate: '2026-05-19',
    city: 'İstanbul',
    country: 'Türkiye',
    flag: '🇹🇷',
    hall: 'İstanbul Expo Center',
    website: 'https://hometex.com.tr',
    priority: 'CRITICAL',
    tags: ['Ev Tekstili', 'B2B', 'Sanal Fuar'],
    visitors: '35.000+',
    exhibitors: '800+',
    trtexCoverage: true,
    desc: 'Türkiye\'nin en büyük ev tekstili fuarı. TRTEX haber ajanları tam kapsamlı yayın yapacak. Hometex.AI sanal fuar platformu entegre çalışacak.',
  },
  // ── GÜNEY ASYA ──
  {
    name: 'Texpo Pakistan 2026',
    dates: '16-18 Nisan 2026',
    startDate: '2026-04-16',
    city: 'Karaçi',
    country: 'Pakistan',
    flag: '🇵🇰',
    website: 'https://texpo.tdap.gov.pk',
    priority: 'MEDIUM',
    tags: ['Ev Tekstili', 'Yatak', 'Havlu', 'B2B'],
    visitors: '8.000+',
    exhibitors: '200+',
    trtexCoverage: false,
    desc: 'Pakistan\'ın en büyük tekstil ve deri ihracat fuarı. Yatak tekstili, havlu, dekoratif kumaş. Türk firmaları için alternatif tedarik istihbaratı.',
  },
  // ── AVRUPA ──
  {
    name: 'Proposte 2026',
    dates: '5-7 Mayıs 2026',
    startDate: '2026-05-05',
    city: 'Como (Cernobbio)',
    country: 'İtalya',
    flag: '🇮🇹',
    hall: 'Villa Erba',
    website: 'https://propostefair.it',
    priority: 'HIGH',
    tags: ['Kumaş', 'Tasarım', 'Premium'],
    visitors: '6.000+',
    exhibitors: '100+',
    trtexCoverage: true,
    desc: '33. edisyon — İtalya\'nın prestijli döşemelik kumaş ve dekoratif tekstil fuarı. Perde, duvar kaplama ve passamaneri. Türk firmaları katılıyor.',
  },
  // ── UZAK DOĞU ──
  {
    name: 'Domotex Asia / ChinaFloor 2026',
    dates: '20-22 Mayıs 2026',
    startDate: '2026-05-20',
    city: 'Şangay',
    country: 'Çin',
    flag: '🇨🇳',
    website: 'https://domotexasiachinafloor.com',
    priority: 'MEDIUM',
    tags: ['Halı', 'Zemin Kaplama', 'Asya'],
    visitors: '50.000+',
    exhibitors: '1.500+',
    trtexCoverage: false,
    desc: 'Asya\'nın en büyük zemin kaplama fuarı. Halı, LVT ve ev tekstili sektörleri. Çin pazar istihbaratı için kritik veri kaynağı.',
  },
  // ── ORTA DOĞU ──
  {
    name: 'INDEX Dubai 2026',
    dates: '2-4 Haziran 2026',
    startDate: '2026-06-02',
    city: 'Dubai',
    country: 'BAE',
    flag: '🇦🇪',
    hall: 'Dubai World Trade Centre',
    website: 'https://indexexhibition.com',
    priority: 'HIGH',
    tags: ['Mobilya', 'Ev Tekstili', 'Orta Doğu'],
    visitors: '33.000+',
    exhibitors: '500+',
    trtexCoverage: true,
    desc: 'Orta Doğu\'nun en büyük mobilya ve iç tasarım fuarı. 30+ ülke. Ev tekstili ve kumaş bölümü Türk ihracatçılar için kritik Körfez erişim noktası.',
  },
  // ── AFRİKA ──
  {
    name: 'Decorex Cape Town 2026',
    dates: '25-28 Haziran 2026',
    startDate: '2026-06-25',
    city: 'Cape Town',
    country: 'Güney Afrika',
    flag: '🇿🇦',
    hall: 'CTICC',
    website: 'https://www.decorex.co.za',
    priority: 'MEDIUM',
    tags: ['Dekorasyon', 'Ev Tekstili', 'Afrika'],
    visitors: '15.000+',
    exhibitors: '300+',
    trtexCoverage: false,
    desc: 'Güney Afrika\'nın en prestijli iç mekan tasarım ve ev tekstili fuarı. Afrika kıtasının en büyük dekorasyon etkinliği.',
  },
  // ── HİNDİSTAN ──
  {
    name: 'HGH India 2026',
    dates: '30 Haziran - 3 Temmuz 2026',
    startDate: '2026-06-30',
    city: 'Mumbai',
    country: 'Hindistan',
    flag: '🇮🇳',
    hall: 'Bombay Exhibition Centre',
    website: 'https://hghindia.com',
    priority: 'HIGH',
    tags: ['Ev Tekstili', 'Dekor', 'Hediye'],
    visitors: '25.000+',
    exhibitors: '600+',
    trtexCoverage: false,
    desc: 'Hindistan\'ın en büyük ev tekstili, dekor ve hediyelik eşya fuarı. Hint pamuk ve el dokuması tekstil pazarı için öncü gösterge.',
  },
  // ── AMERİKA ──
  {
    name: 'Texworld New York City — Yaz 2026',
    dates: '29-31 Temmuz 2026',
    startDate: '2026-07-29',
    city: 'New York',
    country: 'ABD',
    flag: '🇺🇸',
    hall: 'Javits Convention Center',
    website: 'https://texworld-usa.us.messefrankfurt.com',
    priority: 'HIGH',
    tags: ['Tekstil', 'ABD Pazarı', 'Sourcing'],
    visitors: '5.000+',
    exhibitors: '300+',
    trtexCoverage: false,
    desc: 'ABD\'nin en büyük tekstil tedarik fuarı. Global üreticiler ve Amerikan alıcılar buluşuyor. Türk firmaları için ABD pazarı erişim noktası.',
  },
  // ── UZAK DOĞU ──
  {
    name: 'Intertextile Shanghai — Sonbahar 2026',
    dates: '18-20 Ağustos 2026',
    startDate: '2026-08-18',
    city: 'Şangay',
    country: 'Çin',
    flag: '🇨🇳',
    hall: 'NECC Shanghai',
    website: 'https://www.intertextilehome.com',
    priority: 'HIGH',
    tags: ['Ev Tekstili', 'Çin', 'Global'],
    visitors: '40.000+',
    exhibitors: '1.200+',
    trtexCoverage: true,
    desc: 'Dünyanın en büyük ev tekstili fuarlarından. Çin ve Asya pazarındaki trendler, fiyat hareketleri ve rekabet analizi.',
  },
  // ── GÜNEY KORE ──
  {
    name: 'Preview in Seoul 2026',
    dates: '19-21 Ağustos 2026',
    startDate: '2026-08-19',
    city: 'Seul',
    country: 'Güney Kore',
    flag: '🇰🇷',
    hall: 'COEX Convention Center',
    website: 'https://previewinseoul.com',
    priority: 'MEDIUM',
    tags: ['Tekstil', 'Moda', 'Kore Pazarı'],
    visitors: '12.000+',
    exhibitors: '400+',
    trtexCoverage: false,
    desc: 'Kore\'nin uluslararası tekstil fuarı. Ev tekstili dahil geniş ürün yelpazesi. K-Design trendi ve Asya pazarı istihbaratı.',
  },
  // ── GÜNEY AMERİKA ──
  {
    name: 'FEBRATEX 2026',
    dates: '18-21 Ağustos 2026',
    startDate: '2026-08-18',
    city: 'Blumenau',
    country: 'Brezilya',
    flag: '🇧🇷',
    hall: 'Parque Vila Germânica',
    website: 'https://febratex.com.br',
    priority: 'MEDIUM',
    tags: ['Tekstil', 'Makine', 'Latin Amerika'],
    visitors: '30.000+',
    exhibitors: '400+',
    trtexCoverage: false,
    desc: 'Latin Amerika\'nın en büyük tekstil fuarı. Ev tekstili, kumaş ve tekstil makinesi. Brezilya\'nın Santa Catarina tekstil bölgesinde düzenleniyor.',
  },
  // ── RUSYA ──
  {
    name: 'Hometextile & Design 2026',
    dates: '22-24 Eylül 2026',
    startDate: '2026-09-22',
    city: 'Moskova',
    country: 'Rusya',
    flag: '🇷🇺',
    hall: 'Crocus Expo',
    website: 'https://hometextile-design.ru',
    priority: 'HIGH',
    tags: ['Ev Tekstili', 'Dekorasyon', 'Rusya'],
    visitors: '18.000+',
    exhibitors: '350+',
    trtexCoverage: true,
    desc: 'Eski adıyla Heimtextil Russia. Rusya ve BDT pazarının en önemli ev tekstili fuarı. Döşemelik, perde, halı ve duvar kaplama.',
  },
  // ── AFRİKA / MISIR ──
  {
    name: 'Egypt Home Tex 2026',
    dates: '22-25 Ekim 2026',
    startDate: '2026-10-22',
    city: 'Kahire',
    country: 'Mısır',
    flag: '🇪🇬',
    hall: 'CICC Cairo',
    website: 'https://egypthometex.com',
    priority: 'MEDIUM',
    tags: ['Ev Tekstili', 'Perde', 'Kuzey Afrika'],
    visitors: '10.000+',
    exhibitors: '200+',
    trtexCoverage: false,
    desc: 'Kuzey Afrika\'nın lider ev tekstili fuarı. Döşemelik kumaş, perde ve ev tekstili. Mısır\'ın büyüyen pamuk endüstrisi vitrine çıkıyor.',
  },
  // ── UZAK DOĞU / TEKNOLOJİ ──
  {
    name: 'ITMA Asia + CITME 2026',
    dates: '20-24 Kasım 2026',
    startDate: '2026-11-20',
    city: 'Şangay',
    country: 'Çin',
    flag: '🇨🇳',
    hall: 'NECC Shanghai',
    website: 'https://itmaasia.com',
    priority: 'MEDIUM',
    tags: ['Tekstil Makinesi', 'Teknoloji', 'İnovasyon'],
    visitors: '100.000+',
    exhibitors: '1.600+',
    trtexCoverage: false,
    desc: 'Asya\'nın en büyük tekstil makinesi fuarı. Dijital baskı, otomasyon ve sürdürülebilir üretim teknolojileri.',
  },
  // ── AVRUPA 2027 ──
  {
    name: 'Heimtextil 2027',
    dates: '12-15 Ocak 2027',
    startDate: '2027-01-12',
    city: 'Frankfurt',
    country: 'Almanya',
    flag: '🇩🇪',
    hall: 'Messe Frankfurt',
    website: 'https://heimtextil.messefrankfurt.com',
    priority: 'HIGH',
    tags: ['Global', 'Trend', 'İnovasyon'],
    visitors: '60.000+',
    exhibitors: '3.100+',
    trtexCoverage: true,
    desc: 'Dünyanın en büyük ev tekstili fuarı. 65 ülkeden 3.100+ katılımcı. Türkiye 200+ firma ile en güçlü katılımcı ülkelerden.',
  },
];

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const PRIORITY_STYLES = {
  CRITICAL: 'bg-red-500 text-white',
  HIGH: 'bg-amber-500 text-white',
  MEDIUM: 'bg-blue-500 text-white',
};

export function FairCalendarSection() {
  const t = useTranslations('fairs');
  const locale = useLocale();
  const baseFairs = useTranslatedData(FAIR_CALENDAR, ['desc', 'dates', 'city', 'country'], 'International textile fair calendar');
  const translate = useAutoTranslate();
  const [fairs, setFairs] = useState<Fair[]>(FAIR_CALENDAR);

  useEffect(() => {
    if (locale === 'tr') { setFairs(FAIR_CALENDAR); return; }
    
    // Collect all unique tags for batch translation
    const allTags = [...new Set(FAIR_CALENDAR.flatMap(f => f.tags))];
    translate(allTags, 'Textile fair category tags').then(translatedTags => {
      const tagMap: Record<string, string> = {};
      allTags.forEach((tag, i) => { tagMap[tag] = translatedTags[i] || tag; });
      
      // Apply everything: use baseFairs for desc/dates/city/country, apply tag map
      const result = baseFairs.map((f, i) => ({
        ...f,
        tags: FAIR_CALENDAR[i].tags.map(tag => tagMap[tag] || tag),
      }));
      setFairs(result);
    });
  }, [locale, baseFairs, translate]);

  return (
    <section className="py-20 bg-[#fafafa] border-t border-border/30">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-10 pb-6 border-b border-border/40">
          <div>
            <span className="font-mono text-[11px] tracking-[0.25em] text-secondary uppercase mb-3 block opacity-70">
              {t('subtitle')}
            </span>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              {t('title')}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              {t('description')}
            </p>
          </div>
          <Link href="/news" className="hidden sm:flex items-center gap-2 text-[11px] font-mono tracking-widest text-muted-foreground hover:text-secondary uppercase transition-colors">
            {t('all_fair_news')} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Fair Cards */}
        <div className="space-y-4">
          {fairs.map((fair: Fair, i: number) => {
            const daysLeft = getDaysUntil(fair.startDate);
            const isPast = daysLeft < 0;
            const isImminent = daysLeft >= 0 && daysLeft <= 30;

            return (
              <motion.div
                key={fair.name}
                className={`group bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 ${
                  fair.priority === 'CRITICAL' ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-200'
                }`}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <div className="flex flex-col md:flex-row">

                  {/* Left: Countdown + Priority */}
                  <div className={`flex-shrink-0 w-full md:w-36 p-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 ${
                    isPast ? 'bg-gray-50' : isImminent ? 'bg-red-50' : 'bg-amber-50/30'
                  }`}>
                    {!isPast ? (
                      <>
                        <span className="text-3xl font-black text-gray-900">{daysLeft}</span>
                        <span className="text-[11px] font-mono text-gray-500 uppercase tracking-wider">{t('days_left')}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-bold text-gray-400">{t('finished')}</span>
                        <span className="text-[10px] text-gray-400">{t('completed')}</span>
                      </>
                    )}
                    <span className={`mt-2 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded ${PRIORITY_STYLES[fair.priority]}`}>
                      {fair.priority === 'CRITICAL' ? `🔴 ${t('critical')}` : fair.priority === 'HIGH' ? `🟡 ${t('high_priority')}` : `🔵 ${t('normal')}`}
                    </span>
                  </div>

                  {/* Middle: Content */}
                  <div className="flex-1 p-5 lg:p-6">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-700 transition-colors flex items-center gap-2">
                          {fair.flag} {fair.name}
                          {fair.trtexCoverage && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">{t('trtex_live')}</span>
                          )}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="w-3.5 h-3.5" /> {fair.dates}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-3.5 h-3.5" /> {fair.city}, {fair.country}
                          </span>
                          <a href={fair.website} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-700 font-semibold transition-colors">
                            <Globe2 className="w-3 h-3" /> {t('official_site')}
                          </a>
                        </div>
                      </div>
                    </div>

                    <p className="text-[13px] text-gray-600 leading-relaxed mb-3 line-clamp-2">{fair.desc}</p>

                    {/* Tags + Stats */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Users className="w-3 h-3" /> {fair.visitors} {t('visitors_label')}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Globe2 className="w-3 h-3" /> {fair.exhibitors} {t('exhibitors_label')}
                      </div>
                      {fair.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Hometex.AI CTA */}
        <div className="mt-10 bg-gradient-to-r from-[#1a1a2e] to-[#2a2a4e] rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{t('cant_attend')}</h3>
              <p className="text-white/60 text-sm mt-0.5">{t('virtual_cta')}</p>
            </div>
          </div>
          <a href="https://hometex.ai" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-lg transition-colors text-sm flex-shrink-0">
            <Star className="w-4 h-4" />
            {t('go_hometex')}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
