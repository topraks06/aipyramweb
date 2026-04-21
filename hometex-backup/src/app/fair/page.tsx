
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TRTexBanner } from '@/components/TRTexBanner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { Compass, Search, Store, TrendingUp, ArrowRight, Globe2, Sparkles, ExternalLink, Star, Award } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

interface FairParticipant {
  id: number;
  display_name: string;
  display_slug: string;
  country_code: string;
  region_key: string;
  city?: string;
  product_categories?: string[];
  price_segment: string;
  logo_url?: string;
  hero_image_url?: string;
  booth_hall?: string;
  booth_number?: string;
  booth_theme_color: string;
  is_featured: boolean;
  is_sponsored: boolean;
  ai_rank_score: number;
  certifications?: string[];
  total_views: number;
}

const FLAG_MAP: Record<string, string> = {
  TR: '🇹🇷', CN: '🇨🇳', DE: '🇩🇪', JP: '🇯🇵', FR: '🇫🇷',
  IT: '🇮🇹', ES: '🇪🇸', US: '🇺🇸', GB: '🇬🇧', KR: '🇰🇷', IN: '🇮🇳',
};

const FALLBACK_PARTICIPANTS: FairParticipant[] = [
  { id: 1, display_name: 'Premium Tekstil A.Ş.', display_slug: 'premium-tekstil-as', country_code: 'TR', region_key: 'turkey', city: 'İstanbul', price_segment: 'premium', hero_image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80', booth_hall: 'A', booth_number: 'A-101', booth_theme_color: '#1E3A5F', is_featured: true, is_sponsored: true, ai_rank_score: 98, certifications: ['ISO 9001', 'OEKO-TEX'], total_views: 1250 },
  { id: 2, display_name: 'Global Fabrics Ltd.', display_slug: 'global-fabrics-ltd', country_code: 'TR', region_key: 'turkey', city: 'Denizli', price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', booth_hall: 'A', booth_number: 'A-205', booth_theme_color: '#4A90D9', is_featured: true, is_sponsored: false, ai_rank_score: 94, certifications: ['ISO 14001', 'GOTS'], total_views: 980 },
  { id: 3, display_name: 'Orient Home Textile Co.', display_slug: 'orient-home-textile', country_code: 'CN', region_key: 'china', city: 'Shanghai', price_segment: 'luxury', hero_image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80', booth_hall: 'B', booth_number: 'B-301', booth_theme_color: '#E05A4E', is_featured: true, is_sponsored: true, ai_rank_score: 91, certifications: ['ISO 9001', 'OEKO-TEX', 'GOTS'], total_views: 870 },
  { id: 4, display_name: 'Sunrise Textile Group', display_slug: 'sunrise-textile-group', country_code: 'CN', region_key: 'china', city: 'Nantong', price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80', booth_hall: 'B', booth_number: 'B-412', booth_theme_color: '#E8A030', is_featured: false, is_sponsored: false, ai_rank_score: 88, certifications: ['ISO 14001', 'GOTS'], total_views: 750 },
  { id: 5, display_name: 'Zen Living Japan', display_slug: 'zen-living-japan', country_code: 'JP', region_key: 'far_east', city: 'Tokyo', price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80', booth_hall: 'C', booth_number: 'C-101', booth_theme_color: '#7B68EE', is_featured: true, is_sponsored: false, ai_rank_score: 93, certifications: ['ISO 9001'], total_views: 620 },
  { id: 6, display_name: 'European Textile House', display_slug: 'european-textile-house', country_code: 'DE', region_key: 'europe', city: 'Berlin', price_segment: 'premium', hero_image_url: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80', booth_hall: 'C', booth_number: 'C-301', booth_theme_color: '#6B7280', is_featured: false, is_sponsored: false, ai_rank_score: 89, certifications: ['EU Ecolabel', 'GOTS', 'ISO 9001'], total_views: 540 },
  { id: 7, display_name: 'Anatolia Craft Textiles', display_slug: 'anatolia-craft-textiles', country_code: 'TR', region_key: 'turkey', city: 'Gaziantep', price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', booth_hall: 'A', booth_number: 'A-415', booth_theme_color: '#F59E0B', is_featured: false, is_sponsored: false, ai_rank_score: 82, certifications: ['ISO 9001', 'OEKO-TEX'], total_views: 480 },
  { id: 8, display_name: 'Pacific Bed & Bath Co.', display_slug: 'pacific-bed-bath', country_code: 'CN', region_key: 'china', city: 'Shenzhen', price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', booth_hall: 'B', booth_number: 'B-501', booth_theme_color: '#EC4899', is_featured: false, is_sponsored: false, ai_rank_score: 85, certifications: ['ISO 9001', 'OEKO-TEX'], total_views: 410 },
  { id: 9, display_name: 'Nordic Linen House', display_slug: 'nordic-linen-house', country_code: 'DE', region_key: 'europe', city: 'Hamburg', price_segment: 'premium', hero_image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80', booth_hall: 'C', booth_number: 'C-205', booth_theme_color: '#4A90D9', is_featured: false, is_sponsored: false, ai_rank_score: 87, certifications: ['EU Ecolabel', 'GOTS'], total_views: 390 },
  { id: 10, display_name: 'Seoul Home Textiles', display_slug: 'seoul-home-textiles', country_code: 'KR', region_key: 'far_east', city: 'Seoul', price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80', booth_hall: 'C', booth_number: 'C-410', booth_theme_color: '#7B68EE', is_featured: false, is_sponsored: false, ai_rank_score: 84, certifications: ['ISO 9001'], total_views: 360 },
  { id: 11, display_name: 'Mediterranean Fabrics', display_slug: 'mediterranean-fabrics', country_code: 'IT', region_key: 'europe', city: 'Milan', price_segment: 'luxury', hero_image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80', booth_hall: 'D', booth_number: 'D-101', booth_theme_color: '#B8922A', is_featured: false, is_sponsored: false, ai_rank_score: 92, certifications: ['EU Ecolabel', 'ISO 9001'], total_views: 520 },
  { id: 12, display_name: 'Coastal Living Textiles', display_slug: 'coastal-living-textiles', country_code: 'US', region_key: 'europe', city: 'New York', price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80', booth_hall: 'D', booth_number: 'D-205', booth_theme_color: '#4A90D9', is_featured: false, is_sponsored: false, ai_rank_score: 83, certifications: ['ISO 9001'], total_views: 310 },
];

const REGION_FILTERS = [
  { key: 'all', label: { tr: 'Tüm Dünya', en: 'All World', ar: 'العالم كله', ru: 'Весь мир' } },
  { key: 'turkey', label: { tr: '🇹🇷 Premium Türkiye', en: '🇹🇷 Premium Turkey', ar: '🇹🇷 تركيا', ru: '🇹🇷 Турция' } },
  { key: 'china', label: { tr: '🇨🇳 Yükselen Çin', en: '🇨🇳 Rising China', ar: '🇨🇳 الصين', ru: '🇨🇳 Китай' } },
  { key: 'europe', label: { tr: '🇪🇺 Premium Avrupa', en: '🇪🇺 Premium Europe', ar: '🇪🇺 أوروبا', ru: '🇪🇺 Европа' } },
  { key: 'far_east', label: { tr: '🌏 Uzak Doğu', en: '🌏 Far East', ar: '🌏 الشرق الأقصى', ru: '🌏 Дальний Восток' } },
];

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function FairPage() {
  const { language } = useLanguage();
  const [region, setRegion] = useState('all');
  const [search, setSearch] = useState('');
  const [participants, setParticipants] = useState<FairParticipant[]>(FALLBACK_PARTICIPANTS);

  const fetchParticipants = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (region !== 'all') params.region = region;
      const data = await api.get<FairParticipant[]>('/participants', params);
      if (data && data.length > 0) setParticipants(data);
      else setParticipants(FALLBACK_PARTICIPANTS.filter((p) => region === 'all' || p.region_key === region));
    } catch {
      setParticipants(FALLBACK_PARTICIPANTS.filter((p) => region === 'all' || p.region_key === region));
    }
  }, [region]);

  useEffect(() => { fetchParticipants(); }, [fetchParticipants]);

  const filtered = participants.filter((b) =>
    !search || b.display_name.toLowerCase().includes(search.toLowerCase())
  );

  const title =
    language === 'tr' ? 'Sanal Fuarı Gez' :
    language === 'ar' ? 'استكشف المعرض الافتراضي' :
    language === 'ru' ? 'Исследовать виртуальную ярмарку' :
    'Explore Virtual Fair';

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      {/* Hero */}
      <div className="relative py-20 overflow-hidden bg-gradient-to-br from-[#1E3A5F] to-[#2C4F7C]">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1920&q=80" alt="Fair" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-6 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#D4AF5A]/60" />
            <span className="section-label text-[#D4AF5A] flex items-center gap-1.5">
              <Compass className="w-3 h-3" /> Virtual Fair 2025
            </span>
            <div className="w-8 h-px bg-[#D4AF5A]/60" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            {title}
          </h1>
          <p className="text-white/60 text-base max-w-2xl mx-auto mb-8 font-light">
            {language === 'tr' ? '500+ tedarikçi, 50+ ülke — Dünyayı gezer gibi hissedin' : "500+ suppliers, 50+ countries — Feel like you're traveling the world"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 mb-8 text-white/60 text-sm">
            {[
              { v: '8', l: language === 'tr' ? 'Salon' : 'Halls' },
              { v: '500+', l: language === 'tr' ? 'Stand' : 'Booths' },
              { v: '50+', l: language === 'tr' ? 'Ülke' : 'Countries' },
              { v: '24/7', l: language === 'tr' ? 'Açık' : 'Open' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-[#D4AF5A]" style={{ fontFamily: 'var(--font-playfair)' }}>{s.v}</div>
                <div className="text-xs mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-20 pt-10">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={language === 'tr' ? 'Tedarikçi veya kategori ara...' : 'Search supplier or category...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A5F]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {REGION_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setRegion(f.key)}
                className={`px-4 py-2 rounded-sm text-xs font-semibold tracking-wide transition-all ${
                  region === f.key
                    ? 'bg-[#1E3A5F] text-white shadow-md'
                    : 'border border-slate-200 text-slate-500 hover:border-[#1E3A5F]/40 hover:text-[#1E3A5F] bg-white'
                }`}
              >
                {f.label[language as keyof typeof f.label] || f.label.en}
              </button>
            ))}
          </div>
        </div>

        <div className="text-slate-400 text-xs mb-6 tracking-wide">
          {filtered.length} {language === 'tr' ? 'tedarikçi gösteriliyor' : 'suppliers shown'}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group bg-white border border-slate-100 hover:border-[#B8922A]/30 rounded-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-slate-200"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={brand.hero_image_url || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80'}
                  alt={brand.display_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
                {brand.is_sponsored && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-[#B8922A] text-white border-0 text-xs font-bold">
                      <Star className="w-3 h-3 mr-1 fill-current" /> Sponsor
                    </Badge>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-sm px-2 py-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[#1E3A5F]" />
                    <span className="text-[#1E3A5F] font-bold text-xs">{Math.round(brand.ai_rank_score)}</span>
                  </div>
                </div>
                <div className="absolute bottom-2 left-3 flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-sm flex items-center justify-center font-bold text-sm shadow-sm bg-white"
                    style={{ border: `2px solid ${brand.booth_theme_color}40`, color: brand.booth_theme_color }}
                  >
                    {getInitials(brand.display_name)}
                  </div>
                  <div>
                    <p className="text-[#1E3A5F] font-bold text-sm leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                      {brand.display_name}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {FLAG_MAP[brand.country_code] || '🌍'} {brand.city || brand.country_code}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                  <span className="border border-[#B8922A]/20 text-[#B8922A] px-2 py-0.5 rounded-sm bg-[#B8922A]/5">
                    {brand.price_segment}
                  </span>
                  {brand.booth_hall && (
                    <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-sm text-slate-400">
                      {language === 'tr' ? 'Salon' : 'Hall'} {brand.booth_hall} · {brand.booth_number}
                    </span>
                  )}
                </div>
                {brand.certifications && brand.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {brand.certifications.slice(0, 2).map((c) => (
                      <span key={c} className="text-xs bg-slate-50 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded-sm">{c}</span>
                    ))}
                  </div>
                )}
                <Link href={`/showrooms/${brand.display_slug}`}>
                  <Button className="w-full btn-navy font-semibold text-xs py-2.5 rounded-sm transition-all">
                    <Store className="mr-1.5 w-3.5 h-3.5" />
                    {language === 'tr' ? 'Standı Gez' : 'Visit Stand'}
                    <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Globe2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>{language === 'tr' ? 'Tedarikçi bulunamadı' : 'No suppliers found'}</p>
          </div>
        )}
      </div>

      <TRTexBanner />
      <Footer />
    </div>
  );
}
