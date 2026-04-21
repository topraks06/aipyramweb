
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Store, Star, TrendingUp, ArrowRight, Sparkles, Globe2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

interface BrandProfile {
  id: number;
  brand_name: string;
  brand_slug: string;
  region: string;
  country_code: string;
  country_name_en?: string;
  country_name_tr?: string;
  ai_strengths_en?: string;
  ai_strengths_tr?: string;
  ai_market_position_en?: string;
  ai_market_position_tr?: string;
  price_segment: string;
  hero_image_url?: string;
  booth_theme_color: string;
  ai_rank_score: number;
  is_featured: boolean;
  is_sponsored: boolean;
  certifications?: string[];
  fair_hall?: string;
  fair_booth_number?: string;
  editorial_tagline_en?: string;
  editorial_tagline_tr?: string;
  trtex_brand_slug?: string;
}

const FALLBACK_BRANDS: BrandProfile[] = [
  { id: 1, brand_name: 'Premium Tekstil A.Ş.', brand_slug: 'premium-tekstil-as', region: 'turkey', country_code: 'TR', country_name_en: 'Turkey', country_name_tr: 'Türkiye', ai_strengths_en: 'Leading Turkish curtain and upholstery manufacturer with 60+ years of experience.', ai_strengths_tr: '60+ yıllık deneyime sahip önde gelen Türk perde ve döşemelik üreticisi.', ai_market_position_en: 'Premium segment leader', ai_market_position_tr: 'Premium segment lider', price_segment: 'premium', hero_image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80', booth_theme_color: '#1E3A5F', ai_rank_score: 98, is_featured: true, is_sponsored: true, certifications: ['ISO 9001', 'OEKO-TEX'], fair_hall: 'A', fair_booth_number: 'A-101', editorial_tagline_en: 'Crafting Excellence Since 1960', editorial_tagline_tr: "1960'dan Beri Mükemmellik" },
  { id: 2, brand_name: 'Global Fabrics Ltd.', brand_slug: 'global-fabrics-ltd', region: 'turkey', country_code: 'TR', country_name_en: 'Turkey', country_name_tr: 'Türkiye', ai_strengths_en: "Turkey's largest upholstery fabric exporter.", ai_strengths_tr: "Türkiye'nin en büyük döşemelik kumaş ihracatçısı.", ai_market_position_en: 'Export leader', ai_market_position_tr: 'İhracat lideri', price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', booth_theme_color: '#4A90D9', ai_rank_score: 94, is_featured: true, is_sponsored: false, certifications: ['ISO 14001', 'GOTS'], fair_hall: 'A', fair_booth_number: 'A-205' },
  { id: 3, brand_name: 'Orient Home Textile Co.', brand_slug: 'orient-home-textile', region: 'china', country_code: 'CN', country_name_en: 'China', country_name_tr: 'Çin', ai_strengths_en: 'Leading Chinese home textile manufacturer.', ai_strengths_tr: 'Önde gelen Çin ev tekstili üreticisi.', ai_market_position_en: 'China market leader', ai_market_position_tr: 'Çin pazarı lideri', price_segment: 'luxury', hero_image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80', booth_theme_color: '#E05A4E', ai_rank_score: 91, is_featured: true, is_sponsored: true, certifications: ['ISO 9001', 'OEKO-TEX', 'GOTS'], fair_hall: 'B', fair_booth_number: 'B-301' },
  { id: 4, brand_name: 'Sunrise Textile Group', brand_slug: 'sunrise-textile-group', region: 'china', country_code: 'CN', country_name_en: 'China', country_name_tr: 'Çin', ai_strengths_en: 'Rising Chinese home textile group.', ai_strengths_tr: 'Yükselen Çin ev tekstili grubu.', ai_market_position_en: 'Rising China segment', ai_market_position_tr: 'Yükselen Çin segmenti', price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80', booth_theme_color: '#E8A030', ai_rank_score: 88, is_featured: false, is_sponsored: false, certifications: ['ISO 14001', 'GOTS'], fair_hall: 'B', fair_booth_number: 'B-412' },
  { id: 5, brand_name: 'Zen Living Japan', brand_slug: 'zen-living-japan', region: 'far_east', country_code: 'JP', country_name_en: 'Japan', country_name_tr: 'Japonya', ai_strengths_en: "Japan's leading home decoration brand.", ai_strengths_tr: "Japonya'nın önde gelen ev dekorasyon markası.", ai_market_position_en: 'Far East leader', ai_market_position_tr: 'Uzak Doğu lideri', price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80', booth_theme_color: '#7B68EE', ai_rank_score: 93, is_featured: true, is_sponsored: false, certifications: ['ISO 9001'], fair_hall: 'C', fair_booth_number: 'C-101' },
  { id: 6, brand_name: 'European Textile House', brand_slug: 'european-textile-house', region: 'europe', country_code: 'DE', country_name_en: 'Germany', country_name_tr: 'Almanya', ai_strengths_en: "Europe's premium carpet and upholstery manufacturer.", ai_strengths_tr: "Avrupa'nın premium halı ve döşemelik üreticisi.", ai_market_position_en: 'Premium Europe', ai_market_position_tr: 'Premium Avrupa', price_segment: 'premium', hero_image_url: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80', booth_theme_color: '#6B7280', ai_rank_score: 89, is_featured: false, is_sponsored: false, certifications: ['EU Ecolabel', 'GOTS', 'ISO 9001'], fair_hall: 'C', fair_booth_number: 'C-301' },
];

const PRICE_LABELS: Record<string, string> = { budget: 'Budget', mid: 'Mid-Range', premium: 'Premium', luxury: 'Luxury' };

const REGION_FILTERS = [
  { key: 'all', label: { tr: 'Tümü', en: 'All', ar: 'الكل', ru: 'Все' } },
  { key: 'turkey', label: { tr: '🇹🇷 Premium Türkiye', en: '🇹🇷 Premium Turkey', ar: '🇹🇷 تركيا', ru: '🇹🇷 Турция' } },
  { key: 'china', label: { tr: '🇨🇳 Yükselen Çin', en: '🇨🇳 Rising China', ar: '🇨🇳 الصين', ru: '🇨🇳 Китай' } },
  { key: 'europe', label: { tr: '🇪🇺 Premium Avrupa', en: '🇪🇺 Premium Europe', ar: '🇪🇺 أوروبا', ru: '🇪🇺 Европа' } },
  { key: 'far_east', label: { tr: '🌏 Uzak Doğu', en: '🌏 Far East', ar: '🌏 الشرق الأقصى', ru: '🌏 Дальний Восток' } },
];

const FLAG_MAP: Record<string, string> = { TR: '🇹🇷', CN: '🇨🇳', DE: '🇩🇪', JP: '🇯🇵', FR: '🇫🇷', IT: '🇮🇹', ES: '🇪🇸', US: '🇺🇸', GB: '🇬🇧', KR: '🇰🇷' };

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export function FeaturedBrands() {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<string>('all');
  const [brands, setBrands] = useState<BrandProfile[]>(FALLBACK_BRANDS);

  const fetchBrands = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (filter !== 'all') params.region = filter;
      const data = await api.get<BrandProfile[]>('/brand-profiles', params);
      if (data && data.length > 0) setBrands(data);
      else setBrands(FALLBACK_BRANDS.filter((b) => filter === 'all' || b.region === filter));
    } catch {
      setBrands(FALLBACK_BRANDS.filter((b) => filter === 'all' || b.region === filter));
    }
  }, [filter]);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const title = language === 'tr' ? 'Öne Çıkan Tedarikçiler' : language === 'ar' ? 'الموردون المميزون' : language === 'ru' ? 'Избранные поставщики' : 'Featured Suppliers';

  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-px bg-[#B8922A]" />
              <span className="section-label">AI Fair Agent</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
              {title}
            </h2>
          </div>
          <Link href="/suppliers" className="hidden md:flex items-center gap-2 text-sm text-slate-400 hover:text-[#B8922A] transition-colors font-medium">
            {language === 'tr' ? 'Tüm Tedarikçiler' : 'All Suppliers'}<ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {REGION_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-sm text-xs font-semibold tracking-wide transition-all duration-200 ${filter === f.key ? 'bg-[#1E3A5F] text-white shadow-md' : 'border border-slate-200 text-slate-500 hover:border-[#1E3A5F]/40 hover:text-[#1E3A5F] bg-white'}`}
            >
              {f.label[language as keyof typeof f.label] || f.label.en}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.slice(0, 6).map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              className="group relative bg-white border border-slate-100 hover:border-[#B8922A]/30 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-200"
            >
              {brand.is_sponsored && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-[#B8922A] text-white text-xs font-bold px-2 py-0.5 rounded-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Sponsored
                  </span>
                </div>
              )}

              <div className="relative h-40 overflow-hidden">
                <img
                  src={brand.hero_image_url || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80'}
                  alt={brand.brand_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />

                <div className="absolute top-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-sm px-2 py-1 flex items-center gap-1.5 shadow-sm">
                    <TrendingUp className="w-3 h-3 text-[#1E3A5F]" />
                    <span className="text-[#1E3A5F] font-bold text-xs">{Math.round(brand.ai_rank_score)}</span>
                  </div>
                </div>

                <div className="absolute bottom-3 left-4 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-sm flex items-center justify-center font-bold text-sm shadow-sm bg-white"
                    style={{ border: `2px solid ${brand.booth_theme_color}40`, color: brand.booth_theme_color }}
                  >
                    {getInitials(brand.brand_name)}
                  </div>
                  <div>
                    <h3 className="text-[#1E3A5F] font-bold text-sm leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                      {brand.brand_name}
                    </h3>
                    <span className="text-slate-400 text-xs">
                      {FLAG_MAP[brand.country_code] || '🌍'} {language === 'tr' ? brand.country_name_tr : brand.country_name_en}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="border border-[#B8922A]/15 bg-[#B8922A]/5 rounded-sm p-3 mb-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3 h-3 text-[#B8922A]" />
                    <span className="section-label">{language === 'tr' ? 'AI Analiz' : 'AI Analysis'}</span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed font-light line-clamp-2">
                    {language === 'tr' ? brand.ai_strengths_tr : brand.ai_strengths_en}
                  </p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="text-xs border border-[#B8922A]/20 text-[#B8922A] px-2 py-0.5 rounded-sm bg-[#B8922A]/5">
                      {PRICE_LABELS[brand.price_segment] || brand.price_segment}
                    </span>
                  </div>
                </div>

                {brand.fair_hall && (
                  <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Globe2 className="w-3 h-3" />
                      {language === 'tr' ? 'Salon' : 'Hall'} {brand.fair_hall} · {brand.fair_booth_number}
                    </span>
                    {brand.certifications && brand.certifications.length > 0 && (
                      <div className="flex gap-1">
                        {brand.certifications.slice(0, 2).map((c) => (
                          <span key={c} className="border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded-sm bg-slate-50">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Link href={`/showrooms/${brand.brand_slug}`}>
                  <button className="w-full btn-navy font-semibold text-xs py-2.5 rounded-sm transition-all flex items-center justify-center gap-2">
                    <Store className="w-3.5 h-3.5" />
                    {language === 'tr' ? 'Standı Gez' : language === 'ar' ? 'زيارة الجناح' : language === 'ru' ? 'Посетить стенд' : 'Visit Stand'}
                    <ArrowRight className="w-3.5 h-3.5" />
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
