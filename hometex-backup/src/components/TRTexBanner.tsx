
'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { ExternalLink, Newspaper, TrendingUp, Globe, Zap, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export function TRTexBanner() {
  const { language } = useLanguage();

  return (
    <section className="py-12 bg-[#FAFAF8] border-b border-slate-100">
      <div className="container mx-auto px-6">
        <a href="https://trtex.com" target="_blank" rel="noopener noreferrer" className="block group">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden border border-slate-200 group-hover:border-[#B8922A]/40 rounded-sm transition-all duration-300 group-hover:shadow-lg hover:shadow-slate-200 bg-white"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B8922A]/30 to-transparent" />

            <div className="relative p-8 md:p-12">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                    <div className="w-6 h-px bg-[#B8922A]" />
                    <span className="section-label">{language === 'tr' ? "Türkiye'nin #1 Ev Tekstil Portalı" : "Turkey's #1 Home Textile Portal"}</span>
                  </div>

                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1E3A5F] mb-2 group-hover:text-[#B8922A] transition-colors duration-300" style={{ fontFamily: 'var(--font-playfair)' }}>
                    TRTex<span className="text-[#B8922A]">.com</span>
                  </h2>

                  <p className="text-lg text-slate-500 mb-1 font-light">{language === 'tr' ? 'Türkiye Ev Tekstil Portalı' : 'Turkey Home Textile Portal'}</p>
                  <p className="text-sm text-slate-400 mb-6 max-w-xl font-light leading-relaxed">
                    {language === 'tr' ? 'Sektörün en güncel haberleri, piyasa analizleri, fuar takibi ve ihracat verileri tek platformda.' : 'Latest industry news, market analysis, fair tracking and export data on one platform.'}
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {[
                      { icon: TrendingUp, label: language === 'tr' ? 'Güncel Haberler' : 'Latest News' },
                      { icon: BarChart3, label: language === 'tr' ? 'Piyasa Analizleri' : 'Market Analysis' },
                      { icon: Globe, label: language === 'tr' ? 'Fuar Haberleri' : 'Fair News' },
                      { icon: Zap, label: language === 'tr' ? 'İhracat Verileri' : 'Export Data' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 border border-slate-200 bg-slate-50 rounded-sm px-3 py-1.5">
                        <item.icon className="w-3 h-3 text-[#B8922A]" />
                        <span className="text-slate-500 text-xs font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0 text-center">
                  <div className="w-28 h-28 border border-slate-200 group-hover:border-[#B8922A]/50 rounded-sm flex items-center justify-center mb-4 mx-auto transition-all group-hover:scale-105 bg-[#FAFAF8]">
                    <div className="text-center">
                      <Newspaper className="w-8 h-8 text-[#B8922A] mx-auto mb-1" />
                      <span className="text-[#1E3A5F] font-bold text-sm" style={{ fontFamily: 'var(--font-playfair)' }}>TRTex</span>
                    </div>
                  </div>
                  <button className="btn-gold px-8 py-3 rounded-sm text-xs font-semibold tracking-widest uppercase flex items-center gap-2 mx-auto group-hover:scale-105 transition-transform">
                    {language === 'tr' ? "trtex.com'u Ziyaret Et" : 'Visit trtex.com'}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-slate-400 text-xs mt-2 tracking-wide">{language === 'tr' ? 'Ücretsiz · Reklamsız · Bağımsız' : 'Free · Ad-free · Independent'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </a>
      </div>
    </section>
  );
}
