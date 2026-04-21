
'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const REGIONS = [
  { key: 'turkey', flag: '🇹🇷', name: { tr: 'Premium Türkiye', en: 'Premium Turkey', ar: 'تركيا المتميزة', ru: 'Премиум Турция' }, highlight: { tr: 'İhracat Liderleri', en: 'Export Leaders', ar: 'رواد التصدير', ru: 'Лидеры экспорта' }, desc: { tr: "Dünyanın en büyük ev tekstili ihracatçılarından. Kalite ve fiyat dengesi.", en: "One of the world's largest home textile exporters. Quality-price balance.", ar: 'من أكبر مصدري المنسوجات المنزلية في العالم.', ru: 'Один из крупнейших экспортеров домашнего текстиля в мире.' }, image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80', brands: 180, trending: { tr: 'Kadife & Keten', en: 'Velvet & Linen' }, accentColor: '#1E3A5F', filter: 'turkey' },
  { key: 'china', flag: '🇨🇳', name: { tr: 'Yükselen Çin', en: 'Rising China', ar: 'الصين الصاعدة', ru: 'Восходящий Китай' }, highlight: { tr: 'Hızlı Büyüme', en: 'Fast Growth', ar: 'نمو سريع', ru: 'Быстрый рост' }, desc: { tr: "Dünyanın en büyük tekstil üreticisi. Hızlı büyüme ve inovasyon.", en: "World's largest textile manufacturer. Fast growth and innovation.", ar: 'أكبر منتج للمنسوجات في العالم.', ru: 'Крупнейший производитель текстиля в мире.' }, image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80', brands: 220, trending: { tr: 'Sunvim, Luolai, Fuanna', en: 'Sunvim, Luolai, Fuanna' }, accentColor: '#E8A030', filter: 'china' },
  { key: 'europe', flag: '🇪🇺', name: { tr: 'Premium Avrupa', en: 'Premium Europe', ar: 'أوروبا المتميزة', ru: 'Премиум Европа' }, highlight: { tr: 'Lüks & Sürdürülebilir', en: 'Luxury & Sustainable', ar: 'فاخر ومستدام', ru: 'Роскошь и устойчивость' }, desc: { tr: 'Lüks ve sürdürülebilir tekstil. Avrupa kalite standartları.', en: 'Luxury and sustainable textiles. European quality standards.', ar: 'المنسوجات الفاخرة والمستدامة.', ru: 'Роскошный и устойчивый текстиль.' }, image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80', brands: 95, trending: { tr: 'EU Ecolabel, GOTS', en: 'EU Ecolabel, GOTS' }, accentColor: '#4A90D9', filter: 'europe' },
  { key: 'far_east', flag: '🌏', name: { tr: 'Uzak Doğu', en: 'Far East', ar: 'الشرق الأقصى', ru: 'Дальний Восток' }, highlight: { tr: 'Minimalist Tasarım', en: 'Minimalist Design', ar: 'تصميم بسيط', ru: 'Минималистский дизайн' }, desc: { tr: "Japonya, Kore ve Güneydoğu Asya'nın minimalist tasarım anlayışı.", en: "Japan, Korea and Southeast Asia's minimalist design philosophy.", ar: 'فلسفة التصميم البسيط في اليابان وكوريا.', ru: 'Минималистская философия дизайна Японии и Кореи.' }, image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80', brands: 65, trending: { tr: 'Nitori, Muji tarzı', en: 'Nitori, Muji style' }, accentColor: '#7B68EE', filter: 'far_east' },
];

export function RegionSection() {
  const { language } = useLanguage();
  const title = language === 'tr' ? 'Global Fuar Haritası' : language === 'ar' ? 'خريطة المعرض العالمي' : language === 'ru' ? 'Глобальная карта ярмарки' : 'Global Fair Map';

  return (
    <section className="py-16 bg-[#FAFAF8] border-b border-slate-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-8 h-px bg-[#B8922A]/50" />
            <span className="section-label">Global Structure</span>
            <div className="w-8 h-px bg-[#B8922A]/50" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
            {title}
          </h2>
          <p className="text-slate-400 font-light text-sm">
            {language === 'tr' ? 'Dünyayı gezer gibi hissedin' : "Feel like you're traveling the world"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {REGIONS.map((region, i) => (
            <motion.div
              key={region.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <Link href={`/suppliers?region=${region.filter}`}>
                <div className="group relative bg-white border border-slate-200 hover:border-[#B8922A]/30 rounded-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-slate-200">
                  <div className="relative h-44 overflow-hidden">
                    <img src={region.image} alt={region.name.en} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/30 to-transparent" />
                    <div className="absolute top-3 left-3 text-2xl">{region.flag}</div>
                    <div className="absolute top-3 right-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-sm border bg-white/90 backdrop-blur-sm shadow-sm" style={{ color: region.accentColor, borderColor: region.accentColor + '40' }}>
                        {region.highlight[language as 'tr' | 'en'] || region.highlight.en}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-sm px-2 py-0.5 shadow-sm">
                        <span className="text-slate-500 text-xs">{region.brands}+ {language === 'tr' ? 'marka' : 'brands'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-[#1E3A5F] font-bold text-base mb-1 group-hover:text-[#B8922A] transition-colors leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                      {region.name[language as keyof typeof region.name] || region.name.en}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-2 font-light">
                      {region.desc[language as keyof typeof region.desc] || region.desc.en}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: region.accentColor }}>
                      <TrendingUp className="w-3 h-3" />
                      <span className="font-medium">{region.trending[language as 'tr' | 'en'] || region.trending.en}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs group-hover:text-[#B8922A] transition-colors">
                      {language === 'tr' ? 'Keşfet' : 'Explore'}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${region.accentColor}, transparent)` }} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
