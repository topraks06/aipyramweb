
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TRTexBanner } from '@/components/TRTexBanner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Award, Eye, ArrowRight, Store, TrendingUp } from 'lucide-react';
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
  ai_rank_score: number;
  is_featured: boolean;
  is_sponsored: boolean;
  price_segment: string;
  hero_image_url?: string;
  booth_theme_color: string;
  fair_hall?: string;
  fair_booth_number?: string;
  certifications?: string[];
  ai_strengths_en?: string;
  ai_strengths_tr?: string;
}

const FALLBACK_SHOWROOMS: BrandProfile[] = [
  { id: 1, brand_name: 'Premium Tekstil A.Ş.', brand_slug: 'premium-tekstil-as', region: 'turkey', country_code: 'TR', country_name_en: 'Turkey', country_name_tr: 'Türkiye', ai_rank_score: 98, is_featured: true, is_sponsored: true, price_segment: 'premium', hero_image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80', booth_theme_color: '#1E3A5F', fair_hall: 'A', fair_booth_number: 'A-101', certifications: ['ISO 9001', 'OEKO-TEX'], ai_strengths_en: 'Leading Turkish curtain and upholstery manufacturer with 60+ years of experience.', ai_strengths_tr: '60+ yıllık deneyime sahip önde gelen Türk perde ve döşemelik üreticisi.' },
  { id: 2, brand_name: 'Global Fabrics Ltd.', brand_slug: 'global-fabrics-ltd', region: 'turkey', country_code: 'TR', country_name_en: 'Turkey', country_name_tr: 'Türkiye', ai_rank_score: 94, is_featured: true, is_sponsored: false, price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80', booth_theme_color: '#4A90D9', fair_hall: 'A', fair_booth_number: 'A-205', certifications: ['ISO 14001', 'GOTS'], ai_strengths_en: "Turkey's largest upholstery fabric exporter.", ai_strengths_tr: "Türkiye'nin en büyük döşemelik kumaş ihracatçısı." },
  { id: 3, brand_name: 'Orient Home Textile Co.', brand_slug: 'orient-home-textile', region: 'china', country_code: 'CN', country_name_en: 'China', country_name_tr: 'Çin', ai_rank_score: 91, is_featured: true, is_sponsored: true, price_segment: 'luxury', hero_image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80', booth_theme_color: '#E05A4E', fair_hall: 'B', fair_booth_number: 'B-301', certifications: ['ISO 9001', 'OEKO-TEX', 'GOTS'], ai_strengths_en: 'Leading Chinese home textile manufacturer.', ai_strengths_tr: 'Önde gelen Çin ev tekstili üreticisi.' },
  { id: 4, brand_name: 'Sunrise Textile Group', brand_slug: 'sunrise-textile-group', region: 'china', country_code: 'CN', country_name_en: 'China', country_name_tr: 'Çin', ai_rank_score: 88, is_featured: false, is_sponsored: false, price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80', booth_theme_color: '#E8A030', fair_hall: 'B', fair_booth_number: 'B-412', certifications: ['ISO 14001', 'GOTS'], ai_strengths_en: 'Rising Chinese home textile group.', ai_strengths_tr: 'Yükselen Çin ev tekstili grubu.' },
  { id: 5, brand_name: 'Zen Living Japan', brand_slug: 'zen-living-japan', region: 'far_east', country_code: 'JP', country_name_en: 'Japan', country_name_tr: 'Japonya', ai_rank_score: 93, is_featured: true, is_sponsored: false, price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200&q=80', booth_theme_color: '#7B68EE', fair_hall: 'C', fair_booth_number: 'C-101', certifications: ['ISO 9001'], ai_strengths_en: "Japan's leading home decoration brand.", ai_strengths_tr: "Japonya'nın önde gelen ev dekorasyon markası." },
  { id: 6, brand_name: 'European Textile House', brand_slug: 'european-textile-house', region: 'europe', country_code: 'DE', country_name_en: 'Germany', country_name_tr: 'Almanya', ai_rank_score: 89, is_featured: false, is_sponsored: false, price_segment: 'premium', hero_image_url: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=1200&q=80', booth_theme_color: '#6B7280', fair_hall: 'C', fair_booth_number: 'C-301', certifications: ['EU Ecolabel', 'GOTS', 'ISO 9001'], ai_strengths_en: "Europe's premium carpet and upholstery manufacturer.", ai_strengths_tr: "Avrupa'nın premium halı ve döşemelik üreticisi." },
];

const FLAG_MAP: Record<string, string> = {
  TR: '🇹🇷', CN: '🇨🇳', DE: '🇩🇪', JP: '🇯🇵', FR: '🇫🇷',
  IT: '🇮🇹', ES: '🇪🇸', US: '🇺🇸', GB: '🇬🇧', KR: '🇰🇷',
};

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function ShowroomsPage() {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [brands, setBrands] = useState<BrandProfile[]>(FALLBACK_SHOWROOMS);

  useEffect(() => {
    api.get<BrandProfile[]>('/brand-profiles')
      .then((data) => { if (data && data.length > 0) setBrands(data); })
      .catch(() => {});
  }, []);

  const filtered = brands.filter((s) =>
    !search ||
    s.brand_name.toLowerCase().includes(search.toLowerCase()) ||
    (s.country_name_en || '').toLowerCase().includes(search.toLowerCase())
  );

  const title =
    language === 'tr' ? 'Dijital Standlar' :
    language === 'ar' ? 'المعارض الرقمية' :
    language === 'ru' ? 'Цифровые выставки' :
    'Digital Showrooms';

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      <div className="relative py-20 overflow-hidden bg-gradient-to-br from-[#1E3A5F] to-[#2C4F7C]">
        <div className="container mx-auto px-6 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#D4AF5A]/60" />
            <span className="section-label text-[#D4AF5A] flex items-center gap-1.5">
              <Store className="w-3 h-3" />
              {language === 'tr' ? 'Sanal Fuar Standları' : 'Virtual Fair Booths'}
            </span>
            <div className="w-8 h-px bg-[#D4AF5A]/60" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            {title}
          </h1>
          <p className="text-white/60 text-base max-w-2xl mx-auto mb-8 font-light">
            {language === 'tr' ? 'Sanal fuarlarda ürünleri keşfedin ve tedarikçilerle doğrudan iletişime geçin' : 'Discover products at virtual fairs and connect directly with suppliers'}
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={language === 'tr' ? 'Stand veya firma ara...' : 'Search stand or company...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A5F]"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-20 pt-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Store className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>{language === 'tr' ? 'Stand bulunamadı' : 'No showrooms found'}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="group bg-white border border-slate-100 hover:border-[#B8922A]/30 rounded-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-slate-200"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={s.hero_image_url || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80'}
                    alt={s.brand_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
                  {s.is_featured && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-[#1E3A5F] text-white border-0 text-xs font-bold">
                        <Award className="w-3 h-3 mr-1" /> {language === 'tr' ? 'Öne Çıkan' : 'Featured'}
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-sm px-2 py-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-[#1E3A5F]" />
                      <span className="text-[#1E3A5F] font-bold text-xs">{Math.round(s.ai_rank_score)}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-sm flex items-center justify-center font-bold text-sm shadow-sm bg-white"
                      style={{ border: `2px solid ${s.booth_theme_color}40`, color: s.booth_theme_color }}
                    >
                      {getInitials(s.brand_name)}
                    </div>
                    <div>
                      <p className="text-[#1E3A5F] font-bold text-sm leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                        {s.brand_name}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {FLAG_MAP[s.country_code] || '🌍'} {language === 'tr' ? s.country_name_tr : s.country_name_en}
                        {s.fair_hall && ` · ${language === 'tr' ? 'Salon' : 'Hall'} ${s.fair_hall} · ${s.fair_booth_number}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-slate-500 text-sm mb-3 line-clamp-2 font-light">
                    {language === 'tr' ? s.ai_strengths_tr : s.ai_strengths_en}
                  </p>
                  <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{language === 'tr' ? 'Aktif Stand' : 'Active Booth'}</span>
                    </div>
                    <span className="border border-[#B8922A]/20 text-[#B8922A] px-2 py-0.5 rounded-sm text-xs bg-[#B8922A]/5">
                      {s.price_segment}
                    </span>
                  </div>
                  {s.certifications && s.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {s.certifications.slice(0, 3).map((c) => (
                        <span key={c} className="text-xs bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-sm">{c}</span>
                      ))}
                    </div>
                  )}
                  <Link href={`/showrooms/${s.brand_slug}`}>
                    <Button className="w-full btn-navy font-semibold text-sm py-3 rounded-sm transition-all">
                      <Store className="mr-2 w-4 h-4" />
                      {language === 'tr' ? 'Standı Gez' : 'Visit Stand'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <TRTexBanner />
      <Footer />
    </div>
  );
}
