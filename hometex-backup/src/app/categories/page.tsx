
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TRTexBanner } from '@/components/TRTexBanner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Grid3x3, ArrowRight, Package, Sparkles, ExternalLink, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  {
    id: 1, slug: 'curtains',
    name: { tr: 'Perdeler', en: 'Curtains', ar: 'الستائر', ru: 'Шторы' },
    desc: { tr: 'Her tarza uygun premium perde kumaşları ve hazır perdeler', en: 'Premium curtain fabrics and ready-made curtains for every style', ar: 'أقمشة ستائر فاخرة لكل أسلوب', ru: 'Премиальные ткани для штор для любого стиля' },
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
    count: '1,200+', trendScore: 97,
    tags: { tr: ['Kadife', 'Tül', 'Blackout', 'Keten'], en: ['Velvet', 'Tulle', 'Blackout', 'Linen'] },
    perdeAiPrompt: 'premium curtains collection modern interior',
    accent: '#1E3A5F',
  },
  {
    id: 2, slug: 'upholstery',
    name: { tr: 'Döşemelik Kumaşlar', en: 'Upholstery Fabrics', ar: 'أقمشة التنجيد', ru: 'Обивочные ткани' },
    desc: { tr: 'Mobilya için dayanıklı ve şık döşemelik kumaşlar', en: 'Durable and stylish upholstery fabrics for furniture', ar: 'أقمشة تنجيد متينة وأنيقة للأثاث', ru: 'Прочные и стильные обивочные ткани для мебели' },
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    count: '850+', trendScore: 89,
    tags: { tr: ['Kadife', 'Keten', 'Jakar', 'Suni Deri'], en: ['Velvet', 'Linen', 'Jacquard', 'Faux Leather'] },
    perdeAiPrompt: 'upholstery fabric modern furniture interior',
    accent: '#4A90D9',
  },
  {
    id: 3, slug: 'carpets',
    name: { tr: 'Halılar', en: 'Carpets & Rugs', ar: 'السجاد', ru: 'Ковры' },
    desc: { tr: 'Dünyadan el dokuması ve makine halıları', en: 'Handmade and machine-made carpets from around the world', ar: 'سجاد مصنوع يدوياً وآلياً من حول العالم', ru: 'Ручные и машинные ковры со всего мира' },
    image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&q=80',
    count: '620+', trendScore: 78,
    tags: { tr: ['El Dokuma', 'Yün', 'Bambu', 'Sisal'], en: ['Handmade', 'Wool', 'Bamboo', 'Sisal'] },
    perdeAiPrompt: 'carpet rug handmade wool interior design',
    accent: '#2E7D52',
  },
  {
    id: 4, slug: 'accessories',
    name: { tr: 'Ev Aksesuarları', en: 'Home Accessories', ar: 'إكسسوارات المنزل', ru: 'Домашние аксессуары' },
    desc: { tr: 'Dekoratif yastıklar, örtüler, runner ve daha fazlası', en: 'Decorative pillows, throws, runners and more', ar: 'وسائد زخرفية ومفارش وسجادات وأكثر', ru: 'Декоративные подушки, пледы, дорожки и многое другое' },
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
    count: '430+', trendScore: 85,
    tags: { tr: ['Yastık', 'Runner', 'Masa Örtüsü', 'Battaniye'], en: ['Pillow', 'Runner', 'Tablecloth', 'Blanket'] },
    perdeAiPrompt: 'home accessories decorative pillow runner interior',
    accent: '#7B5EA7',
  },
];

export default function CategoriesPage() {
  const { language } = useLanguage();

  const title =
    language === 'tr' ? 'Ürün Kategorileri' :
    language === 'ar' ? 'فئات المنتجات' :
    language === 'ru' ? 'Категории продуктов' :
    'Product Categories';

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      <div className="relative py-20 overflow-hidden bg-gradient-to-br from-[#1E3A5F] to-[#2C4F7C]">
        <div className="container mx-auto px-6 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#D4AF5A]/60" />
            <span className="section-label text-[#D4AF5A] flex items-center gap-1.5">
              <Grid3x3 className="w-3 h-3" />
              {language === 'tr' ? 'Tüm Kategoriler' : 'All Categories'}
            </span>
            <div className="w-8 h-px bg-[#D4AF5A]/60" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            {title}
          </h1>
          <p className="text-white/60 text-base max-w-2xl mx-auto font-light">
            {language === 'tr'
              ? 'Geniş ürün yelpazesi ve rekabetçi fiyatlarla tekstil ihtiyaçlarınızı karşılayın'
              : 'Meet your textile needs with a wide product range and competitive prices'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-20 pt-10">
        <div className="grid md:grid-cols-2 gap-6">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white border border-slate-200 hover:border-[#B8922A]/30 rounded-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-slate-200"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name.en}
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/30 to-transparent" />
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-sm px-3 py-1.5 flex items-center gap-2 shadow-sm">
                    <TrendingUp className="w-3 h-3 text-[#1E3A5F]" />
                    <span className="text-[#1E3A5F] font-bold text-sm">{cat.trendScore}</span>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-[#1E3A5F] font-bold text-2xl mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {cat.name[language as keyof typeof cat.name] || cat.name.en}
                  </h3>
                  <p className="text-slate-500 text-sm font-light">
                    {cat.desc[language as keyof typeof cat.desc] || cat.desc.en}
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Package className="w-4 h-4 text-[#B8922A]" />
                    <span>{cat.count} {language === 'tr' ? 'ürün' : 'products'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {(cat.tags[language as 'tr' | 'en'] || cat.tags.en).map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-slate-50 border border-slate-200 text-slate-500 px-3 py-1 rounded-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/categories/${cat.slug}`}>
                    <Button className="w-full btn-navy font-semibold text-sm py-3 rounded-sm transition-all">
                      {language === 'tr' ? 'Ürünleri Gör' : 'View Products'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <a
                    href={`https://perde.ai?style=${encodeURIComponent(cat.perdeAiPrompt)}&utm_source=hometex&utm_medium=category`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-[#B8922A]/30 text-[#B8922A] hover:bg-[#B8922A]/5 hover:border-[#B8922A]/50 text-sm py-3 rounded-sm"
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" /> perde.ai
                      <ExternalLink className="w-3 h-3 ml-1.5 opacity-60" />
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <TRTexBanner />
      <Footer />
    </div>
  );
}
