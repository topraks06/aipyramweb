
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TRTexBanner } from '@/components/TRTexBanner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Search, Sparkles, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api-client';

interface Collection {
  id: number;
  name: string;
  name_tr?: string;
  name_en?: string;
  cover_image_url?: string;
  trend_score: number;
  is_trending: boolean;
  is_featured: boolean;
  style_tags?: string[];
  usage_contexts?: string[];
  perde_ai_style_prompt?: string;
  ai_commentary_tr?: string;
  ai_commentary_en?: string;
  season?: string;
}

const FALLBACK_COLLECTIONS: Collection[] = [
  { id: 1, name: 'Velvet Noir', name_en: 'Velvet Noir', name_tr: 'Velvet Noir', cover_image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80', trend_score: 97, is_trending: true, is_featured: true, style_tags: ['Luxury', 'Dark', 'Modern'], usage_contexts: ['Hotel', 'Yacht'], season: '2025 S/S', perde_ai_style_prompt: 'velvet noir luxury dark curtains modern interior', ai_commentary_en: 'Velvet texture and deep black tones are the strongest trend of 2025.', ai_commentary_tr: 'Kadife doku ve derin siyah tonlar 2025\'in en güçlü trendi.' },
  { id: 2, name: 'Soft Linen 2026', name_en: 'Soft Linen 2026', name_tr: 'Yumuşak Keten 2026', cover_image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', trend_score: 89, is_trending: true, is_featured: false, style_tags: ['Minimal', 'Natural', 'Scandinavian'], usage_contexts: ['Home', 'Office'], season: '2025 A/W', perde_ai_style_prompt: 'soft linen natural minimal scandinavian curtains', ai_commentary_en: 'Natural linen texture leads the sustainability trend.', ai_commentary_tr: 'Doğal keten dokusu sürdürülebilirlik trendinin öncüsü.' },
  { id: 3, name: 'Golden Hour', name_en: 'Golden Hour', name_tr: 'Altın Saat', cover_image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80', trend_score: 85, is_trending: true, is_featured: false, style_tags: ['Warm', 'Boho', 'Artisan'], usage_contexts: ['Home', 'Cafe'], season: '2025 S/S', perde_ai_style_prompt: 'golden hour warm boho artisan curtains earth tones', ai_commentary_en: 'Golden yellow and earth tones support the rise of Boho-Chic style.', ai_commentary_tr: 'Altın sarısı ve toprak tonları Boho-Chic stilinin yükselişini destekliyor.' },
  { id: 4, name: 'Ocean Breeze', name_en: 'Ocean Breeze', name_tr: 'Okyanus Esintisi', cover_image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', trend_score: 82, is_trending: false, is_featured: false, style_tags: ['Fresh', 'Coastal', 'Light'], usage_contexts: ['Coastal Home', 'Resort'], season: '2025 S/S', perde_ai_style_prompt: 'ocean breeze coastal blue white light sheer curtains', ai_commentary_en: 'Blue-white tones are indispensable for coastal home and resort projects.', ai_commentary_tr: 'Kıyı evi ve resort projeleri için mavi-beyaz tonlar vazgeçilmez.' },
  { id: 5, name: 'Heritage Wool', name_en: 'Heritage Wool', name_tr: 'Miras Yünü', cover_image_url: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&q=80', trend_score: 78, is_trending: false, is_featured: false, style_tags: ['Classic', 'Heritage', 'Warm'], usage_contexts: ['Classic Home', 'Library'], season: '2025 A/W', perde_ai_style_prompt: 'heritage wool classic warm traditional carpet interior', ai_commentary_en: 'Traditional wool weaving is being rediscovered.', ai_commentary_tr: 'Geleneksel yün dokuma yeniden keşfediliyor.' },
  { id: 6, name: 'Silk Road', name_en: 'Silk Road', name_tr: 'İpek Yolu', cover_image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', trend_score: 91, is_trending: true, is_featured: true, style_tags: ['Oriental', 'Luxury', 'Exotic'], usage_contexts: ['Luxury Home', 'Palace Hotel'], season: '2025 S/S', perde_ai_style_prompt: 'silk road oriental luxury exotic carpet palace hotel', ai_commentary_en: 'Silk Road aesthetics are booming in the luxury segment.', ai_commentary_tr: 'İpek yolu estetiği lüks segmentte patlama yapıyor.' },
  { id: 7, name: 'Urban Concrete', name_en: 'Urban Concrete', name_tr: 'Kentsel Beton', cover_image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80', trend_score: 76, is_trending: false, is_featured: false, style_tags: ['Industrial', 'Urban', 'Raw'], usage_contexts: ['Loft', 'Office', 'Studio'], season: '2025 A/W', perde_ai_style_prompt: 'urban concrete industrial modern loft curtains grey', ai_commentary_en: 'Industrial loft aesthetics are rising in office and studio projects.', ai_commentary_tr: 'Endüstriyel loft estetiği ofis ve stüdyo projelerinde yükseliyor.' },
  { id: 8, name: 'Sakura Dreams', name_en: 'Sakura Dreams', name_tr: 'Sakura Rüyaları', cover_image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80', trend_score: 88, is_trending: true, is_featured: false, style_tags: ['Japanese', 'Minimal', 'Zen'], usage_contexts: ['Spa', 'Wellness', 'Boutique Hotel'], season: '2025 S/S', perde_ai_style_prompt: 'sakura japanese minimal zen curtains soft pink white', ai_commentary_en: 'Japanese minimalism is peaking in spa and boutique hotel projects.', ai_commentary_tr: 'Japon minimalizmi spa ve butik otel projelerinde zirveye çıkıyor.' },
  { id: 9, name: 'Moroccan Nights', name_en: 'Moroccan Nights', name_tr: 'Fas Geceleri', cover_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', trend_score: 83, is_trending: false, is_featured: false, style_tags: ['Moroccan', 'Exotic', 'Colorful'], usage_contexts: ['Riad', 'Boutique Hotel', 'Home'], season: '2025 S/S', perde_ai_style_prompt: 'moroccan nights exotic colorful pattern curtains riad', ai_commentary_en: 'Moroccan aesthetics are indispensable in boutique hotel and riad projects.', ai_commentary_tr: 'Fas estetiği butik otel ve riad projelerinde vazgeçilmez.' },
];

const STYLE_CATEGORIES = [
  { key: 'all', label: { tr: 'Tümü', en: 'All', ar: 'الكل', ru: 'Все' } },
  { key: 'luxury', label: { tr: 'Lüks', en: 'Luxury', ar: 'فاخر', ru: 'Люкс' } },
  { key: 'minimal', label: { tr: 'Minimal', en: 'Minimal', ar: 'بسيط', ru: 'Минимал' } },
  { key: 'classic', label: { tr: 'Klasik', en: 'Classic', ar: 'كلاسيكي', ru: 'Классика' } },
  { key: 'modern', label: { tr: 'Modern', en: 'Modern', ar: 'عصري', ru: 'Современный' } },
];

const DIRECTION_COLORS: Record<string, string> = {
  viral: 'bg-red-50 text-red-600 border-red-200',
  rising: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  stable: 'bg-sky-50 text-sky-600 border-sky-200',
  breakout: 'bg-violet-50 text-violet-600 border-violet-200',
};

function getDirection(score: number, isTrending: boolean) {
  if (score >= 95) return 'viral';
  if (isTrending && score >= 85) return 'rising';
  if (score >= 80) return 'breakout';
  return 'stable';
}

function getDirectionLabel(direction: string) {
  const map: Record<string, string> = { viral: '🔥 Viral', rising: '↑ Rising', breakout: '⚡ Breakout', stable: '→ Stable' };
  return map[direction] || '→ Stable';
}

function getCollectionName(col: Collection, language: string) {
  if (language === 'tr') return col.name_tr || col.name_en || col.name;
  return col.name_en || col.name;
}

function getAiComment(col: Collection, language: string) {
  if (language === 'tr') return col.ai_commentary_tr || col.ai_commentary_en || '';
  return col.ai_commentary_en || '';
}

function matchesCategory(col: Collection, category: string) {
  if (category === 'all') return true;
  const tags = (col.style_tags || []).map((t) => t.toLowerCase());
  const catMap: Record<string, string[]> = {
    luxury: ['luxury', 'premium', 'hotel', 'oriental'],
    minimal: ['minimal', 'scandinavian', 'natural', 'zen', 'japanese'],
    classic: ['classic', 'heritage', 'traditional', 'moroccan'],
    modern: ['modern', 'industrial', 'urban', 'coastal', 'fresh'],
  };
  return (catMap[category] || []).some((k) => tags.includes(k));
}

export default function CollectionsPage() {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [collections, setCollections] = useState<Collection[]>(FALLBACK_COLLECTIONS);

  useEffect(() => {
    api.get<Collection[]>('/collections', { limit: '20' })
      .then((data) => { if (data && data.length > 0) setCollections(data); })
      .catch(() => {});
  }, []);

  const filtered = collections
    .filter((c) => matchesCategory(c, activeCategory))
    .filter((c) => !search || getCollectionName(c, language).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.trend_score - a.trend_score);

  const buildPerdeAiLink = (prompt: string) =>
    `https://perde.ai?style=${encodeURIComponent(prompt)}&utm_source=hometex&utm_medium=collection_cta`;

  const title =
    language === 'tr' ? 'Koleksiyon Keşfet' :
    language === 'ar' ? 'اكتشف المجموعات' :
    language === 'ru' ? 'Открыть коллекции' :
    'Discover Collections';

  const designCta =
    language === 'tr' ? "Bu tarzı perde.ai'de tasarla" :
    language === 'ar' ? 'صمم هذا الأسلوب في perde.ai' :
    language === 'ru' ? 'Дизайн в perde.ai' :
    'Design this style in perde.ai';

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      <div className="relative py-20 overflow-hidden bg-gradient-to-br from-[#1E3A5F] to-[#2C4F7C]">
        <div className="container mx-auto px-6 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#D4AF5A]/60" />
            <span className="section-label text-[#D4AF5A] flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" /> AI Trend Agent
            </span>
            <div className="w-8 h-px bg-[#D4AF5A]/60" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            {title}
          </h1>
          <p className="text-white/60 text-base max-w-2xl mx-auto font-light">
            {language === 'tr' ? "Trend bazlı koleksiyonları keşfet ve perde.ai'de tasarımını yap" : 'Discover trend-based collections and design in perde.ai'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-20 pt-10">
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={language === 'tr' ? 'Koleksiyon ara...' : 'Search collection...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A5F]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STYLE_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-sm text-xs font-semibold tracking-wide transition-all ${
                  activeCategory === cat.key
                    ? 'bg-[#1E3A5F] text-white shadow-md'
                    : 'border border-slate-200 text-slate-500 hover:border-[#1E3A5F]/40 hover:text-[#1E3A5F] bg-white'
                }`}
              >
                {cat.label[language as keyof typeof cat.label] || cat.label.en}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((col, i) => {
            const direction = getDirection(col.trend_score, col.is_trending);
            return (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="group bg-white border border-slate-100 hover:border-[#B8922A]/30 rounded-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-slate-200"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={col.cover_image_url || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80'}
                    alt={getCollectionName(col, language)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-sm px-3 py-1.5 flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#B8922A] rounded-full animate-pulse" />
                      <span className="text-[#1E3A5F] font-bold text-sm">{Math.round(col.trend_score)}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-[#1E3A5F] font-bold text-xl" style={{ fontFamily: 'var(--font-playfair)' }}>
                      {getCollectionName(col, language)}
                    </h3>
                    {col.season && <p className="text-slate-400 text-xs mt-0.5 font-light">{col.season}</p>}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <Badge className={`${DIRECTION_COLORS[direction]} text-xs border`}>
                      {getDirectionLabel(direction)}
                    </Badge>
                    {col.style_tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} className="bg-slate-50 text-slate-500 border-slate-200 text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed mb-3 line-clamp-2 font-light">
                    {getAiComment(col, language)}
                  </p>
                  {col.usage_contexts && col.usage_contexts.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {col.usage_contexts.map((ctx) => (
                        <span key={ctx} className="text-xs bg-slate-50 text-slate-400 border border-slate-200 px-2 py-0.5 rounded-sm">{ctx}</span>
                      ))}
                    </div>
                  )}
                  {col.perde_ai_style_prompt && (
                    <a href={buildPerdeAiLink(col.perde_ai_style_prompt)} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full btn-gold text-white font-bold text-sm py-3 rounded-sm shadow-md">
                        <Sparkles className="mr-2 w-4 h-4" />
                        {designCta}
                        <ExternalLink className="ml-2 w-3 h-3 opacity-60" />
                      </Button>
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>{language === 'tr' ? 'Koleksiyon bulunamadı' : 'No collections found'}</p>
          </div>
        )}
      </div>

      <TRTexBanner />
      <Footer />
    </div>
  );
}
