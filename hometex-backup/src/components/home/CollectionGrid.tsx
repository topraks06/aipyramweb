
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, ExternalLink, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

interface Collection {
  id: number;
  name: string;
  name_tr?: string;
  name_en?: string;
  name_ar?: string;
  name_ru?: string;
  cover_image_url?: string;
  trend_score: number;
  is_trending: boolean;
  is_featured: boolean;
  style_tags?: string[];
  perde_ai_style_prompt?: string;
  ai_commentary_tr?: string;
  ai_commentary_en?: string;
  showroom_id: number;
}

const FALLBACK_COLLECTIONS: Collection[] = [
  { id: 1, name: 'Velvet Noir', name_en: 'Velvet Noir', name_tr: 'Velvet Noir', cover_image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=90', trend_score: 97, is_trending: true, is_featured: true, style_tags: ['Luxury', 'Dark', 'Hotel'], ai_commentary_en: 'Velvet texture and deep black tones are the strongest trend of 2025.', ai_commentary_tr: "Kadife doku ve derin siyah tonlar 2025'in en güçlü trendi.", perde_ai_style_prompt: 'velvet noir luxury dark curtains modern interior 2025', showroom_id: 1 },
  { id: 2, name: 'Silk Road', name_en: 'Silk Road', name_tr: 'İpek Yolu', cover_image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=90', trend_score: 91, is_trending: true, is_featured: true, style_tags: ['Oriental', 'Luxury'], ai_commentary_en: 'Silk Road aesthetics are booming in the luxury segment.', ai_commentary_tr: 'İpek yolu estetiği lüks segmentte patlama yapıyor.', perde_ai_style_prompt: 'silk road oriental luxury exotic carpet palace hotel', showroom_id: 2 },
  { id: 3, name: 'Soft Linen 2026', name_en: 'Soft Linen 2026', name_tr: 'Yumuşak Keten 2026', cover_image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=90', trend_score: 89, is_trending: true, is_featured: false, style_tags: ['Minimal', 'Natural'], ai_commentary_en: 'Natural linen texture leads the sustainability trend.', ai_commentary_tr: 'Doğal keten dokusu sürdürülebilirlik trendinin öncüsü.', perde_ai_style_prompt: 'soft linen natural minimal scandinavian curtains light', showroom_id: 3 },
  { id: 4, name: 'Golden Hour', name_en: 'Golden Hour', name_tr: 'Altın Saat', cover_image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=700&q=90', trend_score: 85, is_trending: false, is_featured: false, style_tags: ['Warm', 'Boho'], ai_commentary_en: 'Golden yellow and earth tones support the rise of Boho-Chic style.', ai_commentary_tr: 'Altın sarısı ve toprak tonları Boho-Chic stilinin yükselişini destekliyor.', perde_ai_style_prompt: 'golden hour warm boho artisan curtains earth tones', showroom_id: 4 },
  { id: 5, name: 'Heritage Wool', name_en: 'Heritage Wool', name_tr: 'Miras Yünü', cover_image_url: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=700&q=90', trend_score: 78, is_trending: false, is_featured: false, style_tags: ['Classic', 'Heritage'], ai_commentary_en: 'Traditional wool weaving is being rediscovered.', ai_commentary_tr: 'Geleneksel yün dokuma yeniden keşfediliyor.', perde_ai_style_prompt: 'heritage wool classic warm traditional carpet interior', showroom_id: 5 },
  { id: 6, name: 'Sakura Dreams', name_en: 'Sakura Dreams', name_tr: 'Sakura Rüyaları', cover_image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&q=90', trend_score: 88, is_trending: true, is_featured: false, style_tags: ['Japanese', 'Zen'], ai_commentary_en: 'Japanese minimalism and zen aesthetics are peaking.', ai_commentary_tr: 'Japon minimalizmi ve zen estetiği zirveye çıkıyor.', perde_ai_style_prompt: 'sakura japanese minimal zen curtains soft pink white', showroom_id: 6 },
];

const DIRECTION_CONFIG: Record<string, { label: string; color: string }> = {
  viral: { label: '🔥 Viral', color: 'text-red-600 border-red-200 bg-red-50' },
  rising: { label: '↑ Rising', color: 'text-emerald-600 border-emerald-200 bg-emerald-50' },
  stable: { label: '→ Stable', color: 'text-sky-600 border-sky-200 bg-sky-50' },
  breakout: { label: '⚡ Breakout', color: 'text-violet-600 border-violet-200 bg-violet-50' },
};

function getDirection(score: number, isTrending: boolean): string {
  if (score >= 95) return 'viral';
  if (isTrending && score >= 85) return 'rising';
  if (score >= 80) return 'breakout';
  return 'stable';
}

function getCollectionName(col: Collection, language: string) {
  if (language === 'tr') return col.name_tr || col.name_en || col.name;
  if (language === 'ar') return col.name_ar || col.name_en || col.name;
  if (language === 'ru') return col.name_ru || col.name_en || col.name;
  return col.name_en || col.name;
}

function getAiComment(col: Collection, language: string) {
  if (language === 'tr') return col.ai_commentary_tr || col.ai_commentary_en || '';
  return col.ai_commentary_en || '';
}

function CollectionCard({ col, large = false }: { col: Collection; large?: boolean }) {
  const { language } = useLanguage();
  const direction = getDirection(col.trend_score, col.is_trending);
  const dirConf = DIRECTION_CONFIG[direction];
  const buildPerdeLink = (prompt: string) =>
    `https://perde.ai?style=${encodeURIComponent(prompt)}&utm_source=hometex&utm_medium=collection_grid`;
  const designCta =
    language === 'tr' ? 'Bu stili kendi odanda dene' :
    language === 'ar' ? 'جرّب هذا الأسلوب في غرفتك' :
    language === 'ru' ? 'Примени стиль в своей комнате' :
    'Try this style in your space';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white border border-slate-100 hover:border-[#B8922A]/30 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-200"
    >
      <div className={`relative overflow-hidden ${large ? 'h-72' : 'h-52'}`}>
        <img
          src={col.cover_image_url || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=700&q=80'}
          alt={getCollectionName(col, language)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />

        <div className="absolute top-3 left-3">
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-sm px-2 py-1 flex items-center gap-1.5 shadow-sm">
            <div className="w-1.5 h-1.5 bg-[#B8922A] rounded-full animate-pulse" />
            <span className="text-[#1E3A5F] font-bold text-xs">{Math.round(col.trend_score)}</span>
          </div>
        </div>

        {col.is_featured && (
          <div className="absolute top-3 right-3">
            <span className="bg-[#B8922A] text-white text-xs font-bold px-2 py-0.5 rounded-sm flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Featured
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className={`text-[#1E3A5F] font-bold ${large ? 'text-2xl' : 'text-lg'} leading-tight`} style={{ fontFamily: 'var(--font-playfair)' }}>
            {getCollectionName(col, language)}
          </h3>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm border ${dirConf.color}`}>{dirConf.label}</span>
          {col.style_tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs text-slate-500 border border-slate-200 bg-slate-50 px-2 py-0.5 rounded-sm">{tag}</span>
          ))}
        </div>

        <p className="text-slate-500 text-sm leading-relaxed mb-3 line-clamp-2 font-light">
          {getAiComment(col, language)}
        </p>

        {col.perde_ai_style_prompt && (
          <a
            href={buildPerdeLink(col.perde_ai_style_prompt)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full btn-gold px-3 py-2.5 rounded-sm text-xs font-semibold tracking-wide mb-1.5"
          >
            <span className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" />{designCta}</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        )}

        <Link href="/showrooms">
          <button className="w-full text-slate-400 hover:text-[#B8922A] text-xs py-1.5 flex items-center justify-center gap-1 transition-colors">
            {language === 'tr' ? 'Standları Keşfet' : 'Explore Showrooms'}<ArrowRight className="w-3 h-3" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

export function CollectionGrid() {
  const { language } = useLanguage();
  const [collections, setCollections] = useState<Collection[]>(FALLBACK_COLLECTIONS);

  useEffect(() => {
    api.get<Collection[]>('/collections', { trending: 'true', limit: '6' })
      .then((data) => { if (data && data.length > 0) setCollections(data); })
      .catch(() => {});
  }, []);

  const title =
    language === 'tr' ? 'Koleksiyon Keşfet' :
    language === 'ar' ? 'اكتشف المجموعات' :
    language === 'ru' ? 'Открыть коллекции' :
    'Discover Collections';

  return (
    <section className="py-16 bg-[#FAFAF8] border-b border-slate-100">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-px bg-[#B8922A]" />
              <span className="section-label">AI Curated</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
              {title}
            </h2>
          </div>
          <Link href="/collections" className="hidden md:flex items-center gap-2 text-sm text-slate-400 hover:text-[#B8922A] transition-colors font-medium">
            {language === 'tr' ? 'Tümünü Gör' : 'View All'}<ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 lg:row-span-2">
            <CollectionCard col={collections[0]} large />
          </div>
          {collections.slice(1, 3).map((col) => <CollectionCard key={col.id} col={col} />)}
          {collections.slice(3, 6).map((col) => <CollectionCard key={col.id} col={col} />)}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 relative overflow-hidden rounded-sm border border-[#B8922A]/20 bg-gradient-to-r from-[#1E3A5F] to-[#2C4F7C]"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF5A]/40 to-transparent" />
          <div className="relative p-8 md:p-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-px bg-[#D4AF5A]/50" />
              <span className="section-label text-[#D4AF5A]">perde.ai</span>
              <div className="w-8 h-px bg-[#D4AF5A]/50" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
              {language === 'tr' ? 'Beğendiğin stili odana uygula' : language === 'ar' ? 'طبّق الأسلوب الذي أعجبك في غرفتك' : language === 'ru' ? 'Примени понравившийся стиль в своей комнате' : 'Apply your favorite style to your room'}
            </h3>
            <p className="text-white/60 mb-6 max-w-xl mx-auto font-light text-sm">
              {language === 'tr' ? 'Perde.ai ile yapay zeka destekli oda tasarımı yapın. Koleksiyonları sanal olarak deneyin.' : 'Design your room with AI-powered perde.ai. Try collections virtually.'}
            </p>
            <a href="https://perde.ai?utm_source=hometex&utm_medium=collection_banner" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 btn-gold px-8 py-3.5 rounded-sm text-sm font-semibold tracking-widest uppercase">
              <Sparkles className="w-4 h-4" />
              {language === 'tr' ? "Perde.ai'de Tasarla" : 'Design in Perde.ai'}
              <ExternalLink className="w-4 h-4 opacity-70" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
