
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Sparkles, ArrowRight, ExternalLink, Flame, Star } from 'lucide-react';
import Link from 'next/link';

const COLLECTIONS = [
  {
    id: 1,
    name: 'Velvet Noir',
    brand: 'Premium Tekstil A.Ş.',
    brandSlug: 'premium-tekstil',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=90',
    trendScore: 97,
    direction: 'viral',
    styleTags: ['Luxury', 'Dark', 'Modern'],
    usageContext: ['Hotel', 'Yacht', 'Premium Home'],
    aiCommentary: {
      tr: 'Kadife doku ve derin siyah tonlar 2025\'in en güçlü trendi. Lüks otel projelerinde talep patlaması yaşanıyor.',
      en: 'Velvet texture and deep black tones are the strongest trend of 2025. Demand explosion in luxury hotel projects.',
      ar: 'الملمس المخملي والنغمات السوداء العميقة هي الاتجاه الأقوى لعام 2025.',
      ru: 'Бархатная текстура и глубокие черные тона — самый сильный тренд 2025 года.',
    },
    perdeAiPrompt: 'velvet noir luxury dark curtains modern interior',
    season: '2025 S/S',
    featured: true,
  },
  {
    id: 2,
    name: 'Soft Linen 2026',
    brand: 'Nordic Linen House',
    brandSlug: 'nordic-linen',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=90',
    trendScore: 89,
    direction: 'rising',
    styleTags: ['Minimal', 'Natural', 'Scandinavian'],
    usageContext: ['Home', 'Office', 'Boutique Hotel'],
    aiCommentary: {
      tr: 'Doğal keten dokusu sürdürülebilirlik trendinin öncüsü. Minimalist tasarım severler için ideal.',
      en: 'Natural linen texture leads the sustainability trend. Ideal for minimalist design lovers.',
      ar: 'ملمس الكتان الطبيعي يقود اتجاه الاستدامة.',
      ru: 'Натуральная льняная текстура возглавляет тренд устойчивости.',
    },
    perdeAiPrompt: 'soft linen natural minimal scandinavian curtains light',
    season: '2025 A/W',
    featured: false,
  },
  {
    id: 3,
    name: 'Golden Hour',
    brand: 'Anatolia Home Tekstil',
    brandSlug: 'anatolia-home',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=90',
    trendScore: 85,
    direction: 'rising',
    styleTags: ['Warm', 'Boho', 'Artisan'],
    usageContext: ['Home', 'Cafe', 'Boutique'],
    aiCommentary: {
      tr: 'Altın sarısı ve toprak tonları Boho-Chic stilinin yükselişini destekliyor. El yapımı doku değer katıyor.',
      en: 'Golden yellow and earth tones support the rise of Boho-Chic style. Handmade texture adds value.',
      ar: 'الأصفر الذهبي والنغمات الترابية تدعم صعود أسلوب بوهو شيك.',
      ru: 'Золотисто-желтые и земляные тона поддерживают рост стиля Бохо-Шик.',
    },
    perdeAiPrompt: 'golden hour warm boho artisan handmade curtains earth tones',
    season: '2025 S/S',
    featured: false,
  },
  {
    id: 4,
    name: 'Ocean Breeze',
    brand: 'Global Fabrics Ltd.',
    brandSlug: 'global-fabrics',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=90',
    trendScore: 82,
    direction: 'stable',
    styleTags: ['Fresh', 'Coastal', 'Light'],
    usageContext: ['Coastal Home', 'Resort', 'Spa'],
    aiCommentary: {
      tr: 'Kıyı evi ve resort projeleri için mavi-beyaz tonlar vazgeçilmez. Hafif kumaşlar rüzgar etkisi yaratıyor.',
      en: 'Blue-white tones are indispensable for coastal home and resort projects. Light fabrics create a breeze effect.',
      ar: 'الألوان الزرقاء والبيضاء لا غنى عنها لمشاريع المنازل الساحلية.',
      ru: 'Сине-белые тона незаменимы для прибрежных домов и курортных проектов.',
    },
    perdeAiPrompt: 'ocean breeze coastal blue white light sheer curtains resort',
    season: '2025 S/S',
    featured: false,
  },
  {
    id: 5,
    name: 'Heritage Wool',
    brand: 'Euro Textiles GmbH',
    brandSlug: 'euro-textiles',
    image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&q=90',
    trendScore: 78,
    direction: 'breakout',
    styleTags: ['Classic', 'Heritage', 'Warm'],
    usageContext: ['Classic Home', 'Library', 'Study'],
    aiCommentary: {
      tr: 'Geleneksel yün dokuma yeniden keşfediliyor. Klasik iç mekan tasarımında güçlü geri dönüş.',
      en: 'Traditional wool weaving is being rediscovered. Strong comeback in classic interior design.',
      ar: 'يتم إعادة اكتشاف نسيج الصوف التقليدي.',
      ru: 'Традиционное шерстяное ткачество переживает возрождение.',
    },
    perdeAiPrompt: 'heritage wool classic warm traditional carpet interior',
    season: '2025 A/W',
    featured: false,
  },
  {
    id: 6,
    name: 'Silk Road',
    brand: 'Orient Carpet Co.',
    brandSlug: 'orient-carpet',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=90',
    trendScore: 91,
    direction: 'rising',
    styleTags: ['Oriental', 'Luxury', 'Exotic'],
    usageContext: ['Luxury Home', 'Palace Hotel', 'VIP Lounge'],
    aiCommentary: {
      tr: 'İpek yolu estetiği lüks segmentte patlama yapıyor. Orta Doğu ve Körfez pazarında rekor talep.',
      en: 'Silk Road aesthetics are booming in the luxury segment. Record demand in Middle East and Gulf markets.',
      ar: 'جماليات طريق الحرير تشهد ازدهاراً في قطاع الفخامة.',
      ru: 'Эстетика Шелкового пути переживает бум в люксовом сегменте.',
    },
    perdeAiPrompt: 'silk road oriental luxury exotic carpet palace hotel',
    season: '2025 S/S',
    featured: true,
  },
];

const DIRECTION_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  viral: { label: 'Viral 🔥', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Flame },
  rising: { label: 'Yükselen ↑', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: TrendingUp },
  stable: { label: 'Stabil →', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Star },
  breakout: { label: 'Breakout ⚡', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Sparkles },
};

export function TrendingCollections() {
  const { language } = useLanguage();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const getAiCommentary = (col: typeof COLLECTIONS[0]) => {
    return col.aiCommentary[language as keyof typeof col.aiCommentary] || col.aiCommentary.en;
  };

  const buildPerdeAiLink = (prompt: string) => {
    return `https://perde.ai?style=${encodeURIComponent(prompt)}&utm_source=hometex&utm_medium=collection_cta`;
  };

  const title = language === 'tr' ? 'Bu Hafta Trend' : language === 'ar' ? 'الأكثر رواجاً هذا الأسبوع' : language === 'ru' ? 'В тренде на этой неделе' : 'Trending This Week';
  const subtitle = language === 'tr' ? 'AI Trend Ajanı tarafından seçildi' : 'Curated by AI Trend Agent';
  const designCta = language === 'tr' ? 'Bu tarzı kendi odana uygula' : language === 'ar' ? 'طبّق هذا الأسلوب في غرفتك' : language === 'ru' ? 'Примени этот стиль в своей комнате' : 'Apply this style in your space';

  return (
    <section className="py-24 bg-[#0a0a0f]">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <Badge className="mb-3 bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30 px-4 py-1.5 text-xs font-semibold">
              <TrendingUp className="w-3 h-3 mr-1.5" /> AI Trend Agent
            </Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white">{title}</h2>
            <p className="text-white/40 mt-2">{subtitle}</p>
          </div>
          <Link href="/collections">
            <Button variant="outline" className="border-white/20 text-white/60 hover:text-white hover:border-white/40 hidden md:flex">
              {language === 'tr' ? 'Tümünü Gör' : 'View All'} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COLLECTIONS.map((col, i) => {
            const dirConf = DIRECTION_CONFIG[col.direction];
            return (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onMouseEnter={() => setHoveredId(col.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 rounded-2xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-[#D4AF37]/10"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={col.image}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />

                  {/* Trend score */}
                  <div className="absolute top-3 left-3">
                    <div className="bg-[#0a0a0f]/80 backdrop-blur-sm border border-[#D4AF37]/30 rounded-xl px-3 py-1.5 flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
                      <span className="text-[#D4AF37] font-bold text-sm">{col.trendScore}</span>
                      <span className="text-white/40 text-xs">trend</span>
                    </div>
                  </div>

                  {col.featured && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-[#D4AF37] text-black border-0 text-xs font-bold">
                        <Sparkles className="w-3 h-3 mr-1" /> Featured
                      </Badge>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-extrabold text-xl">{col.name}</h3>
                    <p className="text-white/60 text-xs mt-0.5">{col.brand} · {col.season}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge className={`${dirConf.color} text-xs font-semibold border`}>
                      {dirConf.label}
                    </Badge>
                    {col.styleTags.slice(0, 2).map(tag => (
                      <Badge key={tag} className="bg-white/5 text-white/50 border-white/10 text-xs">{tag}</Badge>
                    ))}
                  </div>

                  <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">
                    {getAiCommentary(col)}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {col.usageContext.map(ctx => (
                      <span key={ctx} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full">{ctx}</span>
                    ))}
                  </div>

                  {/* CTA - perde.ai */}
                  <a
                    href={buildPerdeAiLink(col.perdeAiPrompt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C5A028] hover:from-[#C5A028] hover:to-[#B8941F] text-black font-bold text-sm py-3 rounded-xl shadow-lg shadow-[#D4AF37]/20 group/btn">
                      <Sparkles className="mr-2 w-4 h-4" />
                      {designCta}
                      <ExternalLink className="ml-2 w-3 h-3 opacity-60 group-hover/btn:opacity-100" />
                    </Button>
                  </a>

                  <Link href={`/showrooms/${col.brandSlug}`}>
                    <Button variant="ghost" className="w-full mt-2 text-white/40 hover:text-white text-xs py-2">
                      {language === 'tr' ? 'Markayı Gör' : 'View Brand'} <ArrowRight className="ml-1 w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
