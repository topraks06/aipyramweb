
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, ArrowRight, ExternalLink, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

interface TrendCard {
  id: number;
  trend_name_tr: string;
  trend_name_en: string;
  trend_name_ar?: string;
  trend_name_ru?: string;
  trend_description_tr?: string;
  trend_description_en?: string;
  trend_description_ar?: string;
  trend_description_ru?: string;
  cover_image_url: string;
  accent_color: string;
  trend_score: number;
  trend_direction: string;
  perde_ai_style_prompt?: string;
  editorial_subtitle_tr?: string;
  editorial_subtitle_en?: string;
}

const FALLBACK_CARDS: TrendCard[] = [
  { id: 1, trend_name_en: 'Soft Minimal', trend_name_tr: 'Soft Minimal', trend_description_en: 'Clean lines, natural textures, peaceful atmosphere', trend_description_tr: 'Sade çizgiler, doğal dokular, huzur veren atmosfer', cover_image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=90', accent_color: '#4CAF7D', trend_score: 89, trend_direction: 'rising', perde_ai_style_prompt: 'soft minimal natural linen curtains scandinavian interior', editorial_subtitle_en: '↑ Rising', editorial_subtitle_tr: '↑ Yükselen' },
  { id: 2, trend_name_en: 'Hotel Luxury', trend_name_tr: 'Hotel Luxury', trend_description_en: 'Velvet, gold details, five-star hotel aesthetics', trend_description_tr: 'Kadife, altın detaylar, beş yıldızlı otel estetiği', cover_image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=90', accent_color: '#B8922A', trend_score: 97, trend_direction: 'viral', perde_ai_style_prompt: 'hotel luxury velvet gold curtains five star interior', editorial_subtitle_en: '🔥 Viral', editorial_subtitle_tr: '🔥 Viral' },
  { id: 3, trend_name_en: 'Natural Linen', trend_name_tr: 'Natural Linen', trend_description_en: 'Sustainable linen, organic textures, harmony with nature', trend_description_tr: 'Sürdürülebilir keten, organik dokular, doğa ile uyum', cover_image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=90', accent_color: '#7B68EE', trend_score: 85, trend_direction: 'breakout', perde_ai_style_prompt: 'natural linen organic sustainable curtains earth tones', editorial_subtitle_en: '⚡ Breakout', editorial_subtitle_tr: '⚡ Breakout' },
  { id: 4, trend_name_en: 'Dark Velvet', trend_name_tr: 'Dark Velvet', trend_description_en: 'Deep tones, dramatic effect, luxurious dark aesthetics', trend_description_tr: 'Derin tonlar, dramatik etki, lüks karanlık estetik', cover_image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=90', accent_color: '#4CAF7D', trend_score: 91, trend_direction: 'rising', perde_ai_style_prompt: 'dark velvet luxury deep purple curtains dramatic interior', editorial_subtitle_en: '↑ Rising', editorial_subtitle_tr: '↑ Yükselen' },
];

function getTrendName(card: TrendCard, language: string) {
  if (language === 'tr') return card.trend_name_tr || card.trend_name_en;
  if (language === 'ar') return card.trend_name_ar || card.trend_name_en;
  if (language === 'ru') return card.trend_name_ru || card.trend_name_en;
  return card.trend_name_en;
}

function getTrendDesc(card: TrendCard, language: string) {
  if (language === 'tr') return card.trend_description_tr || card.trend_description_en || '';
  if (language === 'ar') return card.trend_description_ar || card.trend_description_en || '';
  if (language === 'ru') return card.trend_description_ru || card.trend_description_en || '';
  return card.trend_description_en || '';
}

function getTagStyle(direction: string) {
  const map: Record<string, string> = {
    viral: 'text-red-600 border-red-200 bg-red-50',
    rising: 'text-emerald-600 border-emerald-200 bg-emerald-50',
    breakout: 'text-violet-600 border-violet-200 bg-violet-50',
    stable: 'text-sky-600 border-sky-200 bg-sky-50',
  };
  return map[direction] || map.stable;
}

function getTagLabel(card: TrendCard, language: string) {
  const sub = language === 'tr' ? card.editorial_subtitle_tr : card.editorial_subtitle_en;
  return sub || (card.trend_direction === 'viral' ? '🔥 Viral' : card.trend_direction === 'rising' ? '↑ Rising' : card.trend_direction === 'breakout' ? '⚡ Breakout' : '→ Stable');
}

export function TrendBlock() {
  const { language } = useLanguage();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [cards, setCards] = useState<TrendCard[]>(FALLBACK_CARDS);

  useEffect(() => {
    api.get<TrendCard[]>('/trend-cards', { domain: 'hometex', limit: '4' })
      .then((data) => { if (data && data.length > 0) setCards(data); })
      .catch(() => {});
  }, []);

  const title =
    language === 'tr' ? 'Bu Hafta Öne Çıkanlar' :
    language === 'ar' ? 'أبرز ما في هذا الأسبوع' :
    language === 'ru' ? 'Лучшее этой недели' :
    "This Week's Highlights";

  const buildPerdeLink = (prompt: string) =>
    `https://perde.ai?style=${encodeURIComponent(prompt)}&utm_source=hometex&utm_medium=trend_block`;

  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-px bg-[#B8922A]" />
              <span className="section-label">AI Trend Agent</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
              {title}
            </h2>
          </div>
          <Link href="/collections" className="hidden md:flex items-center gap-2 text-sm text-slate-400 hover:text-[#B8922A] transition-colors font-medium tracking-wide">
            {language === 'tr' ? 'Tüm Koleksiyonlar' : 'All Collections'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              onMouseEnter={() => setHoveredId(card.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative overflow-hidden rounded-sm cursor-pointer border border-slate-200 hover:border-[#B8922A]/40 transition-all hover:shadow-lg hover:shadow-slate-200 bg-white"
            >
              <div className="relative h-56 overflow-hidden">
                <motion.img
                  src={card.cover_image_url}
                  alt={card.trend_name_en}
                  className="w-full h-full object-cover"
                  animate={{ scale: hoveredId === card.id ? 1.06 : 1 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />

                <div className="absolute top-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-sm px-2 py-1 flex items-center gap-1.5 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-[#B8922A] rounded-full animate-pulse" />
                    <span className="text-[#1E3A5F] font-bold text-xs">{Math.round(card.trend_score)}</span>
                  </div>
                </div>

                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm border ${getTagStyle(card.trend_direction)}`}>
                    {getTagLabel(card, language)}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-[#1E3A5F] font-bold text-lg mb-0.5 leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {getTrendName(card, language)}
                  </h3>
                  <p className="text-slate-500 text-xs font-light leading-relaxed">{getTrendDesc(card, language)}</p>
                </div>
              </div>

              <div className="bg-white border-t border-slate-100 p-3 space-y-1.5">
                {card.perde_ai_style_prompt && (
                  <a
                    href={buildPerdeLink(card.perde_ai_style_prompt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-between w-full btn-gold px-3 py-2 rounded-sm text-xs font-semibold tracking-wide"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {language === 'tr' ? 'Bu tarzı odanda dene' : language === 'ar' ? 'جرّب هذا الأسلوب' : language === 'ru' ? 'Примерить стиль' : 'Try this style'}
                    </span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
                <Link href="/collections">
                  <button className="w-full text-slate-400 hover:text-[#B8922A] text-xs py-1 flex items-center justify-center gap-1 transition-colors">
                    {language === 'tr' ? 'Koleksiyonu Gör' : 'View Collection'}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
