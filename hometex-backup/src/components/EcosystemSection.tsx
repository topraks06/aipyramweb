
'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/i18n';
import { ExternalLink, Newspaper, Palette, Globe, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function EcosystemSection() {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);

  const platforms = [
    { name: 'TRTex.com', subtitle: t('ecosystem.trtex'), description: t('ecosystem.trtexDesc'), url: 'https://trtex.com', icon: Newspaper, accentColor: '#E8A030', badge: '🇹🇷 Türkiye', features: [language === 'tr' ? 'Güncel Haberler' : 'Latest News', language === 'tr' ? 'Piyasa Analizleri' : 'Market Analysis', language === 'tr' ? 'Fuar Takibi' : 'Fair Tracking'] },
    { name: 'Perde.ai', subtitle: t('ecosystem.perdeai'), description: t('ecosystem.perdeaiDesc'), url: 'https://perde.ai', icon: Palette, accentColor: '#7B68EE', badge: '🤖 AI Powered', features: [language === 'tr' ? 'Oda Tasarımı' : 'Room Design', language === 'tr' ? 'Sanal Deneme' : 'Virtual Try-on', language === 'tr' ? 'AI Öneriler' : 'AI Suggestions'] },
    { name: 'Heimtex.ai', subtitle: t('ecosystem.heimtex'), description: t('ecosystem.heimtexDesc'), url: 'https://heimtex.ai', icon: Globe, accentColor: '#4A90D9', badge: '🇩🇪 Almanya', features: [language === 'tr' ? 'Almanca Platform' : 'German Platform', language === 'tr' ? 'Alman Pazarı' : 'German Market', language === 'tr' ? 'Avrupa Tedarikçileri' : 'European Suppliers'] },
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-8 h-px bg-[#B8922A]/50" />
            <span className="section-label flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              {language === 'tr' ? 'Bağlı Ekosistem' : 'Connected Ecosystem'}
            </span>
            <div className="w-8 h-px bg-[#B8922A]/50" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
            {language === 'tr' ? 'Güçlü Platform Ağı' : language === 'ar' ? 'شبكة المنصات القوية' : language === 'ru' ? 'Мощная сеть платформ' : 'Powerful Platform Network'}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto font-light text-sm">
            {language === 'tr' ? 'Hometex.ai, TRTex.com ve Perde.ai sinir ağlarıyla birbirine bağlı çalışır' : 'Hometex.ai works interconnected with TRTex.com and Perde.ai through neural networks'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {platforms.map((platform, i) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <a href={platform.url} target="_blank" rel="noopener noreferrer" className="group block h-full">
                <div className="h-full bg-white border border-slate-200 hover:border-[#B8922A]/30 rounded-sm p-6 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-sm flex items-center justify-center" style={{ backgroundColor: platform.accentColor + '12', border: `1px solid ${platform.accentColor}25` }}>
                      <platform.icon className="w-5 h-5" style={{ color: platform.accentColor }} />
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#B8922A] transition-colors mt-1" />
                  </div>

                  <span className="text-xs border border-slate-200 text-slate-500 bg-slate-50 px-2 py-0.5 rounded-sm mb-3 inline-block">{platform.badge}</span>

                  <h3 className="text-lg font-bold text-[#1E3A5F] mb-0.5 group-hover:text-[#B8922A] transition-colors" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {platform.name}
                  </h3>
                  <p className="text-sm text-slate-600 font-medium mb-2">{platform.subtitle}</p>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed font-light">{platform.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {platform.features.map((f) => (
                      <span key={f} className="text-xs border border-slate-200 text-slate-500 bg-slate-50 px-2 py-0.5 rounded-sm">{f}</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: platform.accentColor }}>
                    {language === 'tr' ? 'Ziyaret Et' : 'Visit'}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
