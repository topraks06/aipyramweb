
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TRTexBanner } from '@/components/TRTexBanner';
import { AIQuoteModal } from '@/components/AIQuoteModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Package, DollarSign, Clock, ArrowLeft, Sparkles, ExternalLink, Star } from 'lucide-react';
import Link from 'next/link';

interface DemoProduct {
  id: number;
  name: string;
  description: string;
  image: string;
  price: string;
  moq: string;
  material: string;
  leadTime: string;
  supplier: string;
  supplierSlug: string;
  featured: boolean;
  rating: number;
  perdeAiPrompt: string;
}

const CATEGORY_PRODUCTS: Record<string, DemoProduct[]> = {
  curtains: [
    { id: 1, name: 'Lüks Kadife Perde', description: 'Premium kalite kadife perde kumaşı. Işık geçirmez özellik. Otel ve konut projelerinde tercih edilen.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80', price: '$45/m', moq: '50m', material: 'Kadife', leadTime: '15 gün', supplier: 'Taç', supplierSlug: 'premium-tekstil', featured: true, rating: 4.9, perdeAiPrompt: 'luxury velvet curtains dark premium hotel interior' },
    { id: 2, name: 'Modern Tül Perde', description: 'Hafif ve şık tül perde. Gün ışığını yumuşak geçirir. Minimalist tasarım için ideal.', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80', price: '$18/m', moq: '100m', material: 'Polyester Tül', leadTime: '10 gün', supplier: 'Taç', supplierSlug: 'premium-tekstil', featured: false, rating: 4.7, perdeAiPrompt: 'modern tulle sheer curtains light minimal interior' },
    { id: 3, name: 'Karartma Fon Perde', description: 'Tam karartma özellikli blackout perde kumaşı. Uyku odaları ve sinema odaları için.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', price: '$35/m', moq: '50m', material: 'Blackout', leadTime: '12 gün', supplier: 'Menderes Tekstil', supplierSlug: 'global-fabrics', featured: true, rating: 4.8, perdeAiPrompt: 'blackout curtains dark bedroom cinema room' },
    { id: 4, name: 'Doğal Keten Perde', description: 'Organik keten perde kumaşı. Nefes alabilir yapı. Sürdürülebilir üretim.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80', price: '$28/m', moq: '100m', material: 'Keten', leadTime: '20 gün', supplier: 'Menderes Tekstil', supplierSlug: 'global-fabrics', featured: false, rating: 4.6, perdeAiPrompt: 'natural linen curtains organic sustainable interior' },
    { id: 5, name: 'Jakarlı Perde', description: 'Özel jakar dokuma desenli lüks perde kumaşı. Klasik ve modern iç mekanlara uygun.', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80', price: '$65/m', moq: '30m', material: 'Jakar', leadTime: '25 gün', supplier: 'Euro Textiles GmbH', supplierSlug: 'euro-textiles', featured: false, rating: 4.9, perdeAiPrompt: 'jacquard curtains luxury classic modern interior' },
    { id: 6, name: 'Şifon Perde', description: 'İnce ve zarif şifon perde. Romantik atmosfer yaratır. Düğün ve özel mekanlar için.', image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80', price: '$22/m', moq: '80m', material: 'Şifon', leadTime: '10 gün', supplier: 'Taç', supplierSlug: 'premium-tekstil', featured: false, rating: 4.5, perdeAiPrompt: 'chiffon curtains romantic elegant wedding venue' },
  ],
  upholstery: [
    { id: 1, name: 'Kadife Döşemelik', description: 'Yüksek dayanıklılıklı kadife döşemelik kumaş. Mobilya ve koltuk için ideal.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', price: '$22/m', moq: '200m', material: 'Kadife', leadTime: '14 gün', supplier: 'Menderes Tekstil', supplierSlug: 'global-fabrics', featured: true, rating: 4.8, perdeAiPrompt: 'velvet upholstery fabric furniture sofa interior' },
    { id: 2, name: 'Keten Döşemelik', description: 'Doğal keten döşemelik. Çevre dostu üretim. GOTS sertifikalı.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80', price: '$18/m', moq: '100m', material: 'Keten', leadTime: '18 gün', supplier: 'Menderes Tekstil', supplierSlug: 'global-fabrics', featured: false, rating: 4.6, perdeAiPrompt: 'linen upholstery fabric natural organic furniture' },
    { id: 3, name: 'Jakarlı Döşemelik', description: 'Özel jakar desen döşemelik kumaş. Lüks mobilya projeleri için.', image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80', price: '$35/m', moq: '100m', material: 'Jakar', leadTime: '20 gün', supplier: 'Menderes Tekstil', supplierSlug: 'global-fabrics', featured: true, rating: 4.9, perdeAiPrompt: 'jacquard upholstery luxury furniture interior' },
    { id: 4, name: 'Premium Suni Deri', description: 'Yüksek kalite suni deri döşemelik. Kolay temizlenir. Restoran ve ofis için.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80', price: '$55/m', moq: '50m', material: 'Suni Deri', leadTime: '10 gün', supplier: 'Menderes Tekstil', supplierSlug: 'global-fabrics', featured: false, rating: 4.7, perdeAiPrompt: 'faux leather upholstery modern restaurant office' },
  ],
  carpets: [
    { id: 1, name: 'El Dokuma Yün Halı', description: 'Geleneksel el dokuma yün halı. Benzersiz desenler. Her biri özel üretim.', image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80', price: '$120/m²', moq: '20m²', material: 'Yün', leadTime: '30 gün', supplier: 'Euro Textiles GmbH', supplierSlug: 'euro-textiles', featured: true, rating: 4.9, perdeAiPrompt: 'handmade wool carpet traditional pattern interior' },
    { id: 2, name: 'Modern Makine Halısı', description: 'Çağdaş tasarım makine halısı. Yüksek dayanıklılık. Ticari kullanım için.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80', price: '$45/m²', moq: '50m²', material: 'Polyester', leadTime: '15 gün', supplier: 'Euro Textiles GmbH', supplierSlug: 'euro-textiles', featured: false, rating: 4.6, perdeAiPrompt: 'modern machine carpet contemporary interior design' },
    { id: 3, name: 'Bambu Halı', description: 'Doğal bambu halı. Sürdürülebilir üretim. Spa ve wellness mekanları için.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', price: '$85/m²', moq: '30m²', material: 'Bambu', leadTime: '25 gün', supplier: 'Anatolia Home', supplierSlug: 'anatolia-home', featured: false, rating: 4.7, perdeAiPrompt: 'bamboo carpet natural sustainable spa wellness' },
    { id: 4, name: 'Sisal Halı', description: 'Doğal sisal lifi halı. Dayanıklı ve şık. Doğal dekorasyon için.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80', price: '$65/m²', moq: '40m²', material: 'Sisal', leadTime: '20 gün', supplier: 'Euro Textiles GmbH', supplierSlug: 'euro-textiles', featured: false, rating: 4.5, perdeAiPrompt: 'sisal carpet natural fiber interior design' },
  ],
  accessories: [
    { id: 1, name: 'Dekoratif Yastık', description: 'El yapımı dekoratif yastık. Çeşitli desenler. Anadolu motifleri.', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80', price: '$12/adet', moq: '100 adet', material: 'Pamuk', leadTime: '10 gün', supplier: 'Anatolia Home', supplierSlug: 'anatolia-home', featured: true, rating: 4.8, perdeAiPrompt: 'decorative pillow handmade anatolian pattern interior' },
    { id: 2, name: 'Runner Halı', description: 'Koridor ve mutfak için runner halı. El dokuması. Çeşitli boyutlar.', image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80', price: '$25/adet', moq: '50 adet', material: 'Yün', leadTime: '15 gün', supplier: 'Anatolia Home', supplierSlug: 'anatolia-home', featured: false, rating: 4.7, perdeAiPrompt: 'runner rug handmade wool corridor kitchen' },
    { id: 3, name: 'Lüks Masa Örtüsü', description: 'Lüks masa örtüsü. Çeşitli boyutlar. Restoran ve ev kullanımı.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80', price: '$18/adet', moq: '50 adet', material: 'Keten', leadTime: '12 gün', supplier: 'Anatolia Home', supplierSlug: 'anatolia-home', featured: false, rating: 4.6, perdeAiPrompt: 'luxury tablecloth linen restaurant home dining' },
    { id: 4, name: 'Dekoratif Battaniye', description: 'Yumuşak ve şık dekoratif battaniye. Kanepe ve yatak için.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', price: '$35/adet', moq: '30 adet', material: 'Pamuk', leadTime: '14 gün', supplier: 'Anatolia Home', supplierSlug: 'anatolia-home', featured: true, rating: 4.9, perdeAiPrompt: 'decorative blanket throw soft cozy interior' },
  ],
};

const CATEGORY_META: Record<string, { name: Record<string, string>; image: string }> = {
  curtains: { name: { tr: 'Perdeler', en: 'Curtains', ar: 'الستائر', ru: 'Шторы' }, image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80' },
  upholstery: { name: { tr: 'Döşemelik Kumaşlar', en: 'Upholstery Fabrics', ar: 'أقمشة التنجيد', ru: 'Обивочные ткани' }, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=80' },
  carpets: { name: { tr: 'Halılar', en: 'Carpets & Rugs', ar: 'السجاد', ru: 'Ковры' }, image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=1920&q=80' },
  accessories: { name: { tr: 'Ev Aksesuarları', en: 'Home Accessories', ar: 'إكسسوارات المنزل', ru: 'Домашние аксессуары' }, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1920&q=80' },
};

export default function CategoryDetailPage() {
  const params = useParams();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');

  const slug = params?.slug as string;
  const products = CATEGORY_PRODUCTS[slug] || [];
  const meta = CATEGORY_META[slug];
  const categoryName = meta?.name[language] || meta?.name['en'] || slug;

  const filtered = products.filter(p =>
    !searchQuery ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGetQuote = (productName: string) => {
    setSelectedProduct(productName);
    setAiModalOpen(true);
  };

  if (!products.length) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            {language === 'tr' ? 'Kategori Bulunamadı' : 'Category Not Found'}
          </h1>
          <Link href="/categories">
            <Button className="btn-navy font-bold rounded-sm">
              <ArrowLeft className="mr-2 w-4 h-4" />
              {language === 'tr' ? 'Kategorilere Dön' : 'Back to Categories'}
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      <div className="relative py-20 overflow-hidden bg-gradient-to-br from-[#1E3A5F] to-[#2C4F7C]">
        <div className="absolute inset-0 opacity-10">
          <img src={meta?.image} alt={categoryName} className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center gap-2 mb-4 text-white/60 text-sm">
            <Link href="/categories" className="hover:text-[#D4AF5A] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              {language === 'tr' ? 'Kategoriler' : 'Categories'}
            </Link>
            <span>/</span>
            <span className="text-white">{categoryName}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            {categoryName}
          </h1>
          <p className="text-white/60 text-base mb-8 font-light">
            {language === 'tr' ? 'Kaliteli ürünler ve rekabetçi fiyatlar' : 'Quality products and competitive prices'}
          </p>
          <div className="max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder={language === 'tr' ? 'Ürün ara...' : 'Search products...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/60 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-20 pt-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>{language === 'tr' ? 'Ürün bulunamadı' : 'No products found'}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="group bg-white border border-slate-100 hover:border-[#B8922A]/30 rounded-sm overflow-hidden transition-all hover:shadow-lg hover:shadow-slate-200"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
                  {product.featured && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-[#B8922A] text-white border-0 text-xs font-bold">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {language === 'tr' ? 'Öne Çıkan' : 'Featured'}
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-white/90 text-slate-600 border-slate-200 text-xs backdrop-blur-sm shadow-sm">
                      {product.material}
                    </Badge>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-[#1E3A5F] font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {product.name}
                  </h3>
                  <p className="text-slate-500 text-sm mb-3 line-clamp-2 font-light">{product.description}</p>

                  <div className="flex items-center gap-2 mb-3 text-xs text-slate-400">
                    <Link href={`/showrooms/${product.supplierSlug}`} className="hover:text-[#1E3A5F] transition-colors font-medium">
                      {product.supplier}
                    </Link>
                    <span>·</span>
                    <div className="flex items-center gap-1 text-[#B8922A]">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="font-bold">{product.rating}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { icon: DollarSign, value: product.price },
                      { icon: Package, value: product.moq },
                      { icon: Clock, value: product.leadTime },
                    ].map((item, j) => (
                      <div key={j} className="bg-slate-50 border border-slate-200 rounded-sm p-2 text-center">
                        <item.icon className="w-3 h-3 text-[#B8922A] mx-auto mb-1" />
                        <div className="text-xs font-bold text-[#1E3A5F]">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => handleGetQuote(product.name)}
                      className="w-full btn-navy font-bold text-sm py-3 rounded-sm shadow-sm"
                    >
                      <Sparkles className="mr-2 w-4 h-4" />
                      {language === 'tr' ? 'AI Teklif Al' : 'Get AI Quote'}
                    </Button>
                    <a
                      href={`https://perde.ai?style=${encodeURIComponent(product.perdeAiPrompt)}&utm_source=hometex&utm_medium=product`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="ghost"
                        className="w-full text-[#B8922A]/60 hover:text-[#B8922A] hover:bg-[#B8922A]/5 text-xs py-2 rounded-sm"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {language === 'tr' ? "Bu tarzı perde.ai'de dene" : 'Try this style in perde.ai'}
                        <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
                      </Button>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AIQuoteModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} showroomName={selectedProduct} />
      <TRTexBanner />
      <Footer />
    </div>
  );
}
