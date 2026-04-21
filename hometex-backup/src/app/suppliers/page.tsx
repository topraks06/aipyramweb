
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TRTexBanner } from '@/components/TRTexBanner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Award, MapPin, Package, Star, ArrowRight, Filter, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

interface FairParticipant {
  id: number;
  display_name: string;
  display_slug: string;
  country_code: string;
  region_key: string;
  city?: string;
  price_segment: string;
  hero_image_url?: string;
  booth_theme_color: string;
  is_featured: boolean;
  is_sponsored: boolean;
  is_verified: boolean;
  ai_rank_score: number;
  certifications?: string[];
  total_views: number;
  total_inquiries: number;
  min_order_quantity?: string;
}

const FLAG_MAP: Record<string, string> = {
  TR: '🇹🇷', CN: '🇨🇳', DE: '🇩🇪', JP: '🇯🇵', FR: '🇫🇷',
  IT: '🇮🇹', ES: '🇪🇸', US: '🇺🇸', GB: '🇬🇧', KR: '🇰🇷', IN: '🇮🇳',
};

const FALLBACK_SUPPLIERS: FairParticipant[] = [
  { id: 1, display_name: 'Premium Tekstil A.Ş.', display_slug: 'premium-tekstil-as', country_code: 'TR', region_key: 'turkey', city: 'İstanbul', price_segment: 'premium', hero_image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80', booth_theme_color: '#1E3A5F', is_featured: true, is_sponsored: true, is_verified: true, ai_rank_score: 98, certifications: ['ISO 9001', 'OEKO-TEX'], total_views: 1250, total_inquiries: 48, min_order_quantity: '50m' },
  { id: 2, display_name: 'Global Fabrics Ltd.', display_slug: 'global-fabrics-ltd', country_code: 'TR', region_key: 'turkey', city: 'Denizli', price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', booth_theme_color: '#4A90D9', is_featured: true, is_sponsored: false, is_verified: true, ai_rank_score: 94, certifications: ['ISO 14001', 'GOTS', 'EU Ecolabel'], total_views: 980, total_inquiries: 35, min_order_quantity: '200m' },
  { id: 3, display_name: 'Orient Home Textile Co.', display_slug: 'orient-home-textile', country_code: 'CN', region_key: 'china', city: 'Shanghai', price_segment: 'luxury', hero_image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80', booth_theme_color: '#E05A4E', is_featured: true, is_sponsored: true, is_verified: true, ai_rank_score: 91, certifications: ['ISO 9001', 'OEKO-TEX', 'GOTS'], total_views: 870, total_inquiries: 29, min_order_quantity: '500m' },
  { id: 4, display_name: 'Sunrise Textile Group', display_slug: 'sunrise-textile-group', country_code: 'CN', region_key: 'china', city: 'Nantong', price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80', booth_theme_color: '#E8A030', is_featured: false, is_sponsored: false, is_verified: true, ai_rank_score: 88, certifications: ['ISO 14001', 'GOTS'], total_views: 750, total_inquiries: 22, min_order_quantity: '300m' },
  { id: 5, display_name: 'Zen Living Japan', display_slug: 'zen-living-japan', country_code: 'JP', region_key: 'far_east', city: 'Tokyo', price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80', booth_theme_color: '#7B68EE', is_featured: true, is_sponsored: false, is_verified: true, ai_rank_score: 93, certifications: ['ISO 9001'], total_views: 620, total_inquiries: 18, min_order_quantity: '100 pcs' },
  { id: 6, display_name: 'European Textile House', display_slug: 'european-textile-house', country_code: 'DE', region_key: 'europe', city: 'Berlin', price_segment: 'premium', hero_image_url: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80', booth_theme_color: '#6B7280', is_featured: false, is_sponsored: false, is_verified: true, ai_rank_score: 89, certifications: ['EU Ecolabel', 'GOTS', 'ISO 9001'], total_views: 540, total_inquiries: 15, min_order_quantity: '20m²' },
  { id: 7, display_name: 'Anatolia Craft Textiles', display_slug: 'anatolia-craft-textiles', country_code: 'TR', region_key: 'turkey', city: 'Gaziantep', price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', booth_theme_color: '#F59E0B', is_featured: false, is_sponsored: false, is_verified: true, ai_rank_score: 82, certifications: ['ISO 9001', 'OEKO-TEX'], total_views: 480, total_inquiries: 12, min_order_quantity: '50 pcs' },
  { id: 8, display_name: 'Pacific Bed & Bath Co.', display_slug: 'pacific-bed-bath', country_code: 'CN', region_key: 'china', city: 'Shenzhen', price_segment: 'mid', hero_image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', booth_theme_color: '#EC4899', is_featured: false, is_sponsored: false, is_verified: true, ai_rank_score: 85, certifications: ['ISO 9001', 'OEKO-TEX'], total_views: 410, total_inquiries: 10, min_order_quantity: '200 pcs' },
];

const REGION_FILTERS = [
  { key: 'all', label: { tr: 'Tüm Dünya', en: 'All World', ar: 'العالم', ru: 'Весь мир' } },
  { key: 'turkey', label: { tr: '🇹🇷 Premium Türkiye', en: '🇹🇷 Premium Turkey', ar: '🇹🇷 تركيا', ru: '🇹🇷 Турция' } },
  { key: 'china', label: { tr: '🇨🇳 Yükselen Çin', en: '🇨🇳 Rising China', ar: '🇨🇳 الصين', ru: '🇨🇳 Китай' } },
  { key: 'europe', label: { tr: '🇪🇺 Premium Avrupa', en: '🇪🇺 Premium Europe', ar: '🇪🇺 أوروبا', ru: '🇪🇺 Европа' } },
  { key: 'far_east', label: { tr: '🌏 Uzak Doğu', en: '🌏 Far East', ar: '🌏 الشرق الأقصى', ru: '🌏 Дальний Восток' } },
];

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function SuppliersContent() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const initialRegion = searchParams?.get('region') || 'all';

  const [search, setSearch] = useState('');
  const [region, setRegion] = useState(initialRegion);
  const [certFilter, setCertFilter] = useState('all');
  const [suppliers, setSuppliers] = useState<FairParticipant[]>(FALLBACK_SUPPLIERS);

  const fetchSuppliers = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (region !== 'all') params.region = region;
      const data = await api.get<FairParticipant[]>('/participants', params);
      if (data && data.length > 0) setSuppliers(data);
      else setSuppliers(FALLBACK_SUPPLIERS.filter((s) => region === 'all' || s.region_key === region));
    } catch {
      setSuppliers(FALLBACK_SUPPLIERS.filter((s) => region === 'all' || s.region_key === region));
    }
  }, [region]);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  useEffect(() => {
    const r = searchParams?.get('region');
    if (r) setRegion(r);
  }, [searchParams]);

  const filtered = suppliers.filter((s) => {
    const matchSearch = !search || s.display_name.toLowerCase().includes(search.toLowerCase()) || s.country_code.toLowerCase().includes(search.toLowerCase());
    const matchCert = certFilter === 'all' || (s.certifications || []).some((c) => c.toLowerCase().includes(certFilter.toLowerCase()));
    return matchSearch && matchCert;
  });

  const title =
    language === 'tr' ? 'Tedarikçiler' :
    language === 'ar' ? 'الموردون' :
    language === 'ru' ? 'Поставщики' :
    'Suppliers';

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      <div className="relative py-20 overflow-hidden bg-gradient-to-br from-[#1E3A5F] to-[#2C4F7C]">
        <div className="container mx-auto px-6 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#D4AF5A]/60" />
            <span className="section-label text-[#D4AF5A] flex items-center gap-1.5">
              <Award className="w-3 h-3" />
              {language === 'tr' ? 'Doğrulanmış Tedarikçiler' : 'Verified Suppliers'}
            </span>
            <div className="w-8 h-px bg-[#D4AF5A]/60" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            {title}
          </h1>
          <p className="text-white/60 text-base max-w-2xl mx-auto mb-8 font-light">
            {language === 'tr' ? 'Dünyadan sertifikalı ve doğrulanmış tekstil üreticileri' : 'Certified and verified textile manufacturers from around the world'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-white/60 text-sm">
            {[
              { v: '500+', l: language === 'tr' ? 'Tedarikçi' : 'Suppliers' },
              { v: '50+', l: language === 'tr' ? 'Ülke' : 'Countries' },
              { v: '98%', l: language === 'tr' ? 'Doğrulanmış' : 'Verified' },
              { v: '24/7', l: language === 'tr' ? 'Destek' : 'Support' },
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
        <div className="relative max-w-xl mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={language === 'tr' ? 'Firma adı veya ülke ara...' : 'Search company or country...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A5F]"
          />
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
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

        <div className="flex items-center gap-3 mb-8">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 text-xs">{language === 'tr' ? 'Sertifika:' : 'Certificate:'}</span>
          <Select value={certFilter} onValueChange={setCertFilter}>
            <SelectTrigger className="w-48 bg-white border-slate-200 text-slate-600 text-xs rounded-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'tr' ? 'Tümü' : 'All'}</SelectItem>
              <SelectItem value="ISO">ISO</SelectItem>
              <SelectItem value="OEKO-TEX">OEKO-TEX</SelectItem>
              <SelectItem value="GOTS">GOTS</SelectItem>
              <SelectItem value="EU Ecolabel">EU Ecolabel</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-slate-400 text-xs ml-auto">{filtered.length} {language === 'tr' ? 'tedarikçi' : 'suppliers'}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Award className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>{language === 'tr' ? 'Tedarikçi bulunamadı' : 'No suppliers found'}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white border border-slate-100 hover:border-[#B8922A]/30 rounded-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-slate-200"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={s.hero_image_url || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80'}
                    alt={s.display_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
                  {s.is_sponsored && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-[#B8922A] text-white border-0 text-xs font-bold">
                        <Sparkles className="w-3 h-3 mr-1" /> Sponsor
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-sm px-2 py-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-[#1E3A5F]" />
                      <span className="text-[#1E3A5F] font-bold text-xs">{Math.round(s.ai_rank_score)}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-3 flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-sm flex items-center justify-center font-bold text-sm shadow-sm bg-white"
                      style={{ border: `2px solid ${s.booth_theme_color}40`, color: s.booth_theme_color }}
                    >
                      {getInitials(s.display_name)}
                    </div>
                    <div>
                      <p className="text-[#1E3A5F] font-bold text-sm leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                        {s.display_name}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {FLAG_MAP[s.country_code] || '🌍'} {s.city || s.country_code}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <div className="flex items-center gap-1 text-[#B8922A]">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="font-bold">{(s.ai_rank_score / 20).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Package className="w-3 h-3" />
                      <span>{s.total_inquiries}+</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3 h-3" />
                      <span>{s.country_code}</span>
                    </div>
                  </div>

                  {s.certifications && s.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {s.certifications.slice(0, 2).map((c) => (
                        <span key={c} className="text-xs bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-sm">{c}</span>
                      ))}
                      {s.min_order_quantity && (
                        <span className="text-xs bg-[#B8922A]/5 border border-[#B8922A]/20 text-[#B8922A] px-2 py-0.5 rounded-sm">
                          Min: {s.min_order_quantity}
                        </span>
                      )}
                    </div>
                  )}

                  <Link href={`/showrooms/${s.display_slug}`}>
                    <Button className="w-full btn-navy font-semibold text-xs py-2.5 rounded-sm transition-all">
                      <Award className="mr-1.5 w-3.5 h-3.5" />
                      {language === 'tr' ? 'Standı Görüntüle' : 'View Stand'}
                      <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
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

export default function SuppliersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3A5F]" />
      </div>
    }>
      <SuppliersContent />
    </Suspense>
  );
}
