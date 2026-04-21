
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Compass, TrendingUp, Search, ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const HERO_SLIDES = [
  { image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=95', label: 'Hotel Luxury' },
  { image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=95', label: 'Dark Velvet' },
  { image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=1920&q=95', label: 'Natural Linen' },
];

const ENTRIES = [
  {
    icon: Compass, key: 'fair', href: '/fair',
    labelTr: 'Fuarı Gez', labelEn: 'Explore Fair', labelAr: 'استكشف المعرض', labelRu: 'Ярмарка',
    descTr: 'Markalar & Koleksiyonlar', descEn: 'Brands & Collections',
  },
  {
    icon: TrendingUp, key: 'collections', href: '/collections',
    labelTr: 'Stil Keşfet', labelEn: 'Discover Style', labelAr: 'اكتشف الأنماط', labelRu: 'Стили',
    descTr: 'Trend & Sezon & Koleksiyon', descEn: 'Trend & Season & Collection',
  },
  {
    icon: Search, key: 'suppliers', href: '/suppliers',
    labelTr: 'Marka Ara', labelEn: 'Search Brand', labelAr: 'ابحث عن علامة', labelRu: 'Найти бренд',
    descTr: 'Global Tedarikçiler', descEn: 'Global Suppliers',
  },
];

function getLabel(entry: typeof ENTRIES[0], language: string) {
  if (language === 'tr') return entry.labelTr;
  if (language === 'ar') return entry.labelAr;
  if (language === 'ru') return entry.labelRu;
  return entry.labelEn;
}

function getDesc(entry: typeof ENTRIES[0], language: string) {
  return language === 'tr' ? entry.descTr : entry.descEn;
}

export function HeroSection() {
  const { language } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveSlide((p) => (p + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const headline = language === 'tr' ? 'Global Textile Fair' : language === 'ar' ? 'معرض النسيج العالمي' : language === 'ru' ? 'Глобальная Ярмарка' : 'Global Textile Fair';
  const subline = language === 'tr' ? 'AI Destekli Canlı Sanal Fuar' : language === 'ar' ? 'معرض افتراضي حي مدعوم بالذكاء الاصطناعي' : language === 'ru' ? 'Живая виртуальная ярмарка на базе ИИ' : 'AI-Powered Living Virtual Fair';
  const desc = language === 'tr' ? 'Dünyanın ilk canlı, sürekli değişen dijital tekstil fuarı' : language === 'ar' ? 'أول معرض نسيج رقمي حي ومتطور باستمرار في العالم' : language === 'ru' ? 'Первая в мире живая цифровая текстильная ярмарка' : "The world's first living, continuously evolving digital textile fair";

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img src={HERO_SLIDES[activeSlide].image} alt="Hometex Virtual Fair" className="w-full h-full object-cover" />
        </motion.div>
      </AnimatePresence>

      {/* Light overlay — white from left, transparent right */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/65 to-white/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/30" />

      <div className="relative container mx-auto px-6 pt-28 pb-0">
        <div className="max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#B8922A]" />
            <span className="section-label">{subline}</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-tight mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
              <span className="text-navy-gradient">Hometex</span>
              <span className="text-[#B8922A]">.ai</span>
            </h1>
            <p className="text-2xl md:text-3xl font-light text-[#1E3A5F]/70 mt-3 mb-2 tracking-wide" style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}>
              {headline}
            </p>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-base md:text-lg text-slate-500 mb-8 max-w-xl leading-relaxed font-light">
            {desc}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="flex flex-col sm:flex-row gap-3 mb-10">
            {ENTRIES.map((entry) => (
              <Link key={entry.key} href={entry.href} className="flex-1">
                <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="group relative border border-[#1E3A5F]/15 hover:border-[#B8922A]/50 bg-white/80 backdrop-blur-sm rounded-sm p-4 cursor-pointer transition-all duration-300 hover:bg-white hover:shadow-md hover:shadow-[#1E3A5F]/10">
                  <div className="flex items-start justify-between mb-2">
                    <entry.icon className="w-5 h-5 text-[#1E3A5F]" />
                    <ArrowRight className="w-4 h-4 text-[#B8922A]/30 group-hover:text-[#B8922A] group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-[#1E3A5F] font-semibold text-sm mb-0.5 tracking-wide">{getLabel(entry, language)}</h3>
                  <p className="text-slate-400 text-xs font-light">{getDesc(entry, language)}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#B8922A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-sm" />
                </motion.div>
              </Link>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.7 }} className="flex items-center gap-10">
            {[
              { v: '500+', l: language === 'tr' ? 'Marka' : 'Brands' },
              { v: '50+', l: language === 'tr' ? 'Ülke' : 'Countries' },
              { v: '10K+', l: language === 'tr' ? 'Koleksiyon' : 'Collections' },
              { v: '24/7', l: language === 'tr' ? 'Canlı' : 'Live' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'var(--font-playfair)' }}>{s.v}</div>
                <div className="text-[10px] text-slate-400 tracking-[0.15em] uppercase mt-0.5">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setActiveSlide(i)} className={`transition-all duration-300 rounded-full ${i === activeSlide ? 'w-1 h-8 bg-[#1E3A5F]' : 'w-1 h-3 bg-[#1E3A5F]/20 hover:bg-[#1E3A5F]/40'}`} />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <span className="section-label text-slate-400/60 text-[10px]">Scroll</span>
        <ChevronDown className="w-4 h-4 text-[#B8922A]/50 scroll-indicator" />
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FAFAF8] to-transparent" />
    </section>
  );
}
