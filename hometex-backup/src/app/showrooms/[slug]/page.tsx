
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TRTexBanner } from '@/components/TRTexBanner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Store, Star, Award, ArrowLeft, Sparkles, ExternalLink,
  TrendingUp, Globe2, Newspaper, Building2, Users, Calendar,
} from 'lucide-react';
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
  ai_commentary_en?: string;
  ai_commentary_tr?: string;
  price_segment: string;
  hero_image_url?: string;
  cover_image_url?: string;
  fair_hall?: string;
  fair_booth_number?: string;
  booth_theme_color: string;
  ai_rank_score: number;
  is_featured: boolean;
  is_sponsored: boolean;
  certifications?: string[];
  founding_year?: number;
  employee_count?: string;
  website_url?: string;
  trtex_brand_slug?: string;
  editorial_tagline_en?: string;
  editorial_tagline_tr?: string;
  style_tags?: string[];
}

interface Collection {
  id: number;
  name: string;
  name_tr?: string;
  name_en?: string;
  cover_image_url?: string;
  trend_score: number;
  is_trending: boolean;
  style_tags?: string[];
  perde_ai_style_prompt?: string;
  ai_commentary_tr?: string;
  ai_commentary_en?: string;
}

const FLAG_MAP: Record<string, string> = {
  TR: '🇹🇷', CN: '🇨🇳', DE: '🇩🇪', JP: '🇯🇵', FR: '🇫🇷',
  IT: '🇮🇹', ES: '🇪🇸', US: '🇺🇸', GB: '🇬🇧', KR: '🇰🇷',
};

const PRICE_LABELS: Record<string, string> = {
  budget: 'Budget', mid: 'Mid-Range', premium: 'Premium', luxury: 'Luxury',
};

const FALLBACK_BRAND: BrandProfile = {
  id: 0, brand_name: 'Textile Showroom', brand_slug: '',
  region: 'turkey', country_code: 'TR', country_name_en: 'Turkey', country_name_tr: 'Türkiye',
  ai_strengths_en: 'A leading textile manufacturer with international certifications and strong export network.',
  ai_strengths_tr: 'Uluslararası sertifikalara ve güçlü ihracat ağına sahip önde gelen tekstil üreticisi.',
  ai_market_position_en: 'Premium segment leader in regional markets.',
  ai_market_position_tr: 'Bölgesel pazarlarda premium segment lideri.',
  ai_commentary_en: 'This supplier combines quality craftsmanship with modern production techniques.',
  ai_commentary_tr: 'Bu tedarikçi, kaliteli işçiliği modern üretim teknikleriyle birleştiriyor.',
  price_segment: 'premium',
  hero_image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=90',
  booth_theme_color: '#1E3A5F', ai_rank_score: 90,
  is_featured: true, is_sponsored: false,
  certifications: ['ISO 9001', 'OEKO-TEX'],
  fair_hall: 'A', fair_booth_number: 'A-101',
  editorial_tagline_en: 'Quality Craftsmanship, Global Reach',
  editorial_tagline_tr: 'Kaliteli İşçilik, Global Erişim',
};

const FALLBACK_COLLECTIONS: Collection[] = [
  {
    id: 1, name: 'Signature Collection', name_en: 'Signature Collection', name_tr: 'İmza Koleksiyonu',
    cover_image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
    trend_score: 92, is_trending: true, style_tags: ['Luxury', 'Modern'],
    perde_ai_style_prompt: 'signature luxury modern curtains premium interior',
    ai_commentary_en: "The flagship collection showcasing the brand's finest craftsmanship.",
    ai_commentary_tr: 'Markanın en iyi işçiliğini sergileyen amiral gemisi koleksiyonu.',
  },
  {
    id: 2, name: 'Natural Series', name_en: 'Natural Series', name_tr: 'Doğal Seri',
    cover_image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
    trend_score: 85, is_trending: true, style_tags: ['Natural', 'Minimal'],
    perde_ai_style_prompt: 'natural series organic minimal curtains earth tones',
    ai_commentary_en: 'Sustainable materials meet contemporary design in this eco-conscious collection.',
    ai_commentary_tr: 'Sürdürülebilir malzemeler çağdaş tasarımla buluşuyor.',
  },
  {
    id: 3, name: 'Heritage Line', name_en: 'Heritage Line', name_tr: 'Miras Serisi',
    cover_image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    trend_score: 78, is_trending: false, style_tags: ['Classic', 'Heritage'],
    perde_ai_style_prompt: 'heritage classic traditional curtains warm interior',
    ai_commentary_en: 'Timeless designs inspired by traditional craftsmanship.',
    ai_commentary_tr: 'Geleneksel işçilikten ilham alan zamansız tasarımlar.',
  },
];

function getCollectionName(col: Collection, language: string) {
  if (language === 'tr') return col.name_tr || col.name_en || col.name;
  return col.name_en || col.name;
}

function getAiComment(col: Collection, language: string) {
  if (language === 'tr') return col.ai_commentary_tr || col.ai_commentary_en || '';
  return col.ai_commentary_en || '';
}

export default function ShowroomDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'collections' | 'about' | 'contact'>('collections');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [quoteSent, setQuoteSent] = useState(false);
  const [brand, setBrand] = useState<BrandProfile>(FALLBACK_BRAND);
  const [collections] = useState<Collection[]>(FALLBACK_COLLECTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get<BrandProfile[]>('/brand-profiles', { slug })
      .then((data) => { if (data && data.length > 0) setBrand(data[0]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const buildPerdeAiLink = (prompt: string) =>
    `https://perde.ai?style=${encodeURIComponent(prompt)}&utm_source=hometex&utm_medium=showroom_cta`;

  const handleSendQuote = () => {
    if (quoteMessage.trim()) {
      setQuoteSent(true);
      setTimeout(() => { setQuoteSent(false); setQuoteMessage(''); }, 3000);
    }
  };

  const getCountry = () => language === 'tr' ? brand.country_name_tr || brand.country_code : brand.country_name_en || brand.country_code;
  const getStrengths = () => language === 'tr' ? brand.ai_strengths_tr || brand.ai_strengths_en || '' : brand.ai_strengths_en || '';
  const getMarketPos = () => language === 'tr' ? brand.ai_market_position_tr || brand.ai_market_position_en || '' : brand.ai_market_position_en || '';
  const getCommentary = () => language === 'tr' ? brand.ai_commentary_tr || brand.ai_commentary_en || '' : brand.ai_commentary_en || '';
  const getTagline = () => language === 'tr' ? brand.editorial_tagline_tr || brand.editorial_tagline_en || '' : brand.editorial_tagline_en || '';

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      {/* Hero */}
      <div className="relative h-80 md:h-[420px] overflow-hidden">
        <img
          src={brand.hero_image_url || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=90'}
          alt={brand.brand_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1E3A5F]/40 via-transparent to-white" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <Link href="/showrooms" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1E3A5F] text-sm mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> {language === 'tr' ? 'Standlara Dön' : 'Back to Showrooms'}
            </Link>
            <div className="flex items-end gap-5">
              <div
                className="w-20 h-20 rounded-sm flex items-center justify-center shadow-lg font-black text-2xl flex-shrink-0 bg-white border-2"
                style={{ borderColor: brand.booth_theme_color + '60', color: brand.booth_theme_color }}
              >
                {brand.brand_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  {brand.is_sponsored && (
                    <Badge className="bg-[#B8922A] text-white border-0 text-xs font-bold">
                      <Star className="w-3 h-3 mr-1 fill-current" /> Sponsored
                    </Badge>
                  )}
                  <Badge className="bg-white/90 text-slate-600 border-slate-200 text-xs shadow-sm">
                    {FLAG_MAP[brand.country_code] || '🌍'} {getCountry()}
                  </Badge>
                  {brand.fair_hall && (
                    <Badge className="bg-white/90 text-slate-600 border-slate-200 text-xs shadow-sm">
                      {language === 'tr' ? 'Salon' : 'Hall'} {brand.fair_hall} · {brand.fair_booth_number}
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {brand.brand_name}
                </h1>
                {getTagline() && (
                  <p className="text-slate-500 mt-1 font-light italic">{getTagline()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* AI Analysis Card */}
        <div className="bg-[#B8922A]/5 border border-[#B8922A]/20 rounded-sm p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#B8922A]/15 rounded-sm flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#B8922A]" />
            </div>
            <h3 className="text-[#1E3A5F] font-bold">{language === 'tr' ? 'AI Tedarikçi Analizi' : 'AI Supplier Analysis'}</h3>
            <div className="ml-auto flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#B8922A]" />
              <span className="text-[#B8922A] font-bold">{Math.round(brand.ai_rank_score)}/100</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: language === 'tr' ? 'Güçlü Taraf' : 'Strengths', value: getStrengths() },
              { label: language === 'tr' ? 'Pazar Durumu' : 'Market Position', value: getMarketPos() },
              { label: language === 'tr' ? 'AI Yorum' : 'AI Commentary', value: getCommentary() },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-slate-600 text-sm leading-relaxed font-light">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dual CTA */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {brand.trtex_brand_slug && (
            <a href={`https://trtex.com/brand/${brand.trtex_brand_slug}`} target="_blank" rel="noopener noreferrer">
              <div className="group bg-orange-50 border border-orange-200 hover:border-orange-400 rounded-sm p-5 flex items-center gap-4 transition-all cursor-pointer shadow-sm">
                <div className="w-12 h-12 bg-orange-100 rounded-sm flex items-center justify-center flex-shrink-0">
                  <Newspaper className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="text-[#1E3A5F] font-bold text-sm">
                    {language === 'tr' ? "Bu tedarikçiyi TRTex'te incele" : 'Explore this supplier on TRTex'}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">trtex.com</p>
                </div>
                <ExternalLink className="w-4 h-4 text-orange-400/50 group-hover:text-orange-500 transition-colors" />
              </div>
            </a>
          )}
          <a
            href={buildPerdeAiLink(brand.style_tags?.join(' ') || brand.brand_name)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="group bg-[#B8922A]/5 border border-[#B8922A]/20 hover:border-[#B8922A]/50 rounded-sm p-5 flex items-center gap-4 transition-all cursor-pointer shadow-sm">
              <div className="w-12 h-12 bg-[#B8922A]/15 rounded-sm flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-[#B8922A]" />
              </div>
              <div className="flex-1">
                <p className="text-[#1E3A5F] font-bold text-sm">
                  {language === 'tr' ? "Bu tarzı perde.ai'de uygula" : 'Apply this style in perde.ai'}
                </p>
                <p className="text-slate-400 text-xs mt-0.5">perde.ai</p>
              </div>
              <ExternalLink className="w-4 h-4 text-[#B8922A]/40 group-hover:text-[#B8922A] transition-colors" />
            </div>
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200 pb-0">
          {[
            { key: 'collections', label: language === 'tr' ? 'Koleksiyonlar' : 'Collections' },
            { key: 'about', label: language === 'tr' ? 'Hakkında' : 'About' },
            { key: 'contact', label: language === 'tr' ? 'AI Teklif' : 'AI Quote' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'collections' | 'about' | 'contact')}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
                activeTab === tab.key
                  ? 'border-[#B8922A] text-[#B8922A]'
                  : 'border-transparent text-slate-400 hover:text-[#1E3A5F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Collections Tab */}
        {activeTab === 'collections' && (
          <div className="grid md:grid-cols-3 gap-6">
            {collections.map((col, i) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white border border-slate-100 hover:border-[#B8922A]/30 rounded-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-slate-200"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={col.cover_image_url || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80'}
                    alt={getCollectionName(col, language)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-sm px-3 py-1.5 flex items-center gap-2 shadow-sm">
                      <div className="w-2 h-2 bg-[#B8922A] rounded-full animate-pulse" />
                      <span className="text-[#1E3A5F] font-bold text-sm">{Math.round(col.trend_score)}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-[#1E3A5F] font-bold text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>
                      {getCollectionName(col, language)}
                    </h3>
                    <div className="flex gap-1 mt-1">
                      {col.style_tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs bg-white/80 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-sm">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-slate-500 text-xs mb-3 line-clamp-2 font-light">{getAiComment(col, language)}</p>
                  {col.perde_ai_style_prompt && (
                    <a href={buildPerdeAiLink(col.perde_ai_style_prompt)} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full btn-gold text-white font-bold text-sm py-3 rounded-sm shadow-sm">
                        <Sparkles className="mr-2 w-4 h-4" />
                        {language === 'tr' ? "Bu tarzı perde.ai'de tasarla" : 'Design in perde.ai'}
                        <ExternalLink className="ml-2 w-3 h-3 opacity-60" />
                      </Button>
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
              <h3 className="text-[#1E3A5F] font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                {language === 'tr' ? 'Firma Bilgileri' : 'Company Info'}
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { icon: Globe2, label: language === 'tr' ? 'Ülke' : 'Country', value: `${FLAG_MAP[brand.country_code] || '🌍'} ${getCountry()}` },
                  { icon: Building2, label: language === 'tr' ? 'Fiyat Segmenti' : 'Price Segment', value: PRICE_LABELS[brand.price_segment] || brand.price_segment },
                  ...(brand.founding_year ? [{ icon: Calendar, label: language === 'tr' ? 'Kuruluş Yılı' : 'Founded', value: String(brand.founding_year) }] : []),
                  ...(brand.employee_count ? [{ icon: Users, label: language === 'tr' ? 'Çalışan Sayısı' : 'Employees', value: brand.employee_count }] : []),
                  ...(brand.fair_hall ? [{ icon: Store, label: language === 'tr' ? 'Fuar Stantı' : 'Fair Booth', value: `${language === 'tr' ? 'Salon' : 'Hall'} ${brand.fair_hall} · ${brand.fair_booth_number}` }] : []),
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-400 flex items-center gap-2">
                      <item.icon className="w-3.5 h-3.5" /> {item.label}
                    </span>
                    <span className="text-[#1E3A5F] font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
              <h3 className="text-[#1E3A5F] font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                {language === 'tr' ? 'Sertifikalar' : 'Certifications'}
              </h3>
              {brand.certifications && brand.certifications.length > 0 ? (
                <div className="flex flex-wrap gap-3 mb-6">
                  {brand.certifications.map((cert) => (
                    <div key={cert} className="flex items-center gap-2 bg-[#B8922A]/8 border border-[#B8922A]/20 rounded-sm px-4 py-2">
                      <Award className="w-4 h-4 text-[#B8922A]" />
                      <span className="text-[#1E3A5F] font-semibold text-sm">{cert}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm font-light mb-6">
                  {language === 'tr' ? 'Sertifika bilgisi mevcut değil.' : 'No certification information available.'}
                </p>
              )}
              {brand.website_url && (
                <a href={brand.website_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-slate-200 text-slate-500 hover:text-[#1E3A5F] hover:border-[#1E3A5F]/30 w-full rounded-sm">
                    <Globe2 className="mr-2 w-4 h-4" />
                    {language === 'tr' ? 'Web Sitesini Ziyaret Et' : 'Visit Website'}
                    <ExternalLink className="ml-2 w-3 h-3" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        )}

        {/* AI Quote Tab */}
        {activeTab === 'contact' && (
          <div className="max-w-2xl">
            <div className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#B8922A]/15 border border-[#B8922A]/20 rounded-sm flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#B8922A]" />
                </div>
                <div>
                  <h3 className="text-[#1E3A5F] font-bold text-xl" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {language === 'tr' ? 'AI Teklif Al' : 'Get AI Quote'}
                  </h3>
                  <p className="text-slate-400 text-sm">{brand.brand_name}</p>
                </div>
              </div>
              {quoteSent ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-6 text-center">
                  <div className="text-emerald-500 text-4xl mb-3">✓</div>
                  <p className="text-emerald-600 font-bold">{language === 'tr' ? 'Talebiniz alındı!' : 'Your request received!'}</p>
                  <p className="text-slate-400 text-sm mt-1">{language === 'tr' ? '24 saat içinde yanıt alacaksınız.' : 'You will receive a response within 24 hours.'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-500 text-sm font-light">
                    {language === 'tr'
                      ? 'Ürün türü, miktar, bütçe ve teslimat sürenizi yazın. AI destekli sistem en uygun teklifi hazırlayacak.'
                      : 'Write your product type, quantity, budget and delivery timeline. AI-powered system will prepare the best quote.'}
                  </p>
                  <textarea
                    value={quoteMessage}
                    onChange={(e) => setQuoteMessage(e.target.value)}
                    placeholder={language === 'tr' ? 'Örn: 500 metre kadife perde kumaşı, bütçe $5000, 30 gün teslimat...' : 'E.g.: 500 meters velvet curtain fabric, budget $5000, 30 days delivery...'}
                    rows={5}
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm p-4 text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A5F] focus:outline-none resize-none text-sm"
                  />
                  <Button
                    onClick={handleSendQuote}
                    className="w-full btn-navy font-bold py-4 rounded-sm shadow-sm"
                  >
                    <Sparkles className="mr-2 w-5 h-5" />
                    {language === 'tr' ? 'AI Teklif Gönder' : 'Send AI Quote Request'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <TRTexBanner />
      <Footer />
    </div>
  );
}
