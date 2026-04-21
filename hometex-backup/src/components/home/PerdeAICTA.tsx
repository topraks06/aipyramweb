
'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, ExternalLink, Palette, Zap, Eye, Heart, ArrowRight } from 'lucide-react';

export function PerdeAICTA() {
  const { language } = useLanguage();

  const title = language === 'tr' ? 'Beğendiğin stili odana uygula' : language === 'ar' ? 'طبّق الأسلوب الذي أعجبك في غرفتك' : language === 'ru' ? 'Примени понравившийся стиль в своей комнате' : 'Apply your favorite style to your room';
  const subtitle = language === 'tr' ? "Hometex'te gördüğün koleksiyonları perde.ai'de sanal olarak dene. Yapay zeka ile oda tasarımı yap." : language === 'ar' ? 'جرّب المجموعات التي رأيتها في Hometex افتراضياً في perde.ai.' : language === 'ru' ? 'Примерь коллекции, увиденные на Hometex, виртуально в perde.ai.' : 'Try collections you saw on Hometex virtually in perde.ai. Design your room with AI.';

  const steps = [
    { icon: Eye, label: language === 'tr' ? 'Koleksiyonu Gör' : 'See Collection' },
    { icon: Heart, label: language === 'tr' ? 'Beğen' : 'Like It' },
    { icon: Palette, label: language === 'tr' ? 'Odanda Dene' : 'Try in Room' },
    { icon: Zap, label: language === 'tr' ? 'Satın Al' : 'Buy It' },
  ];

  return (
    <section className="py-16 bg-[#FAFAF8] border-b border-slate-100">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-sm px-3 py-2 shadow-sm">
                  <step.icon className="w-3.5 h-3.5 text-[#B8922A]" />
                  <span className="text-slate-500 text-xs font-medium">{step.label}</span>
                </div>
                {i < steps.length - 1 && <ArrowRight className="w-3 h-3 text-[#B8922A]/40" />}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#B8922A]/50" />
            <span className="section-label">perde.ai Integration</span>
            <div className="w-8 h-px bg-[#B8922A]/50" />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-[#1E3A5F] mb-4 leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
            {title}
          </h2>
          <p className="text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed font-light text-sm">
            {subtitle}
          </p>

          <a
            href="https://perde.ai?utm_source=hometex&utm_medium=main_cta&utm_campaign=homepage"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 btn-gold px-10 py-4 rounded-sm text-sm font-semibold tracking-widest uppercase"
          >
            <Sparkles className="w-4 h-4" />
            {language === 'tr' ? "Perde.ai'de Tasarla" : language === 'ar' ? 'صمّم في Perde.ai' : language === 'ru' ? 'Дизайн в Perde.ai' : 'Design in Perde.ai'}
            <ExternalLink className="w-4 h-4 opacity-70" />
          </a>

          <p className="text-slate-400 text-xs mt-4 tracking-wide">
            {language === 'tr' ? '✓ Ücretsiz · ✓ Kayıt gerektirmez · ✓ AI destekli' : '✓ Free · ✓ No registration · ✓ AI-powered'}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
