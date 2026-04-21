
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { FileText, Send, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CreateRequestPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    quantity: '',
    unit_of_measure: 'metre',
    budget_min: '',
    budget_max: '',
    currency: 'USD',
    target_country: '',
    delivery_timeline: '',
    quality_requirements: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=/requests/create');
      return;
    }
    try {
      setLoading(true);
      await api.post('/buyer-requests', {
        ...formData,
        category_id: parseInt(formData.category_id),
        quantity: parseInt(formData.quantity),
        budget_min: parseFloat(formData.budget_min),
        budget_max: parseFloat(formData.budget_max),
        status: 'open',
      });
      setSuccess(true);
      toast.success(language === 'tr' ? 'Talep başarıyla oluşturuldu!' : 'Request created successfully!');
    } catch {
      toast.error(language === 'tr' ? 'Talep oluşturulurken bir hata oluştu' : 'Error creating request');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) return null;

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="w-24 h-24 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
              {language === 'tr' ? 'Talep Oluşturuldu!' : 'Request Created!'}
            </h2>
            <p className="text-slate-500 mb-8 font-light">
              {language === 'tr'
                ? 'Talebiniz başarıyla sisteme kaydedildi. En uygun tedarikçiler sizinle iletişime geçecektir.'
                : 'Your request has been saved. The most suitable suppliers will contact you.'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.push('/requests')}
                className="btn-navy font-bold rounded-sm"
              >
                {language === 'tr' ? 'Taleplerime Git' : 'Go to My Requests'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(false);
                  setFormData({
                    category_id: '', title: '', description: '', quantity: '',
                    unit_of_measure: 'metre', budget_min: '', budget_max: '',
                    currency: 'USD', target_country: '', delivery_timeline: '', quality_requirements: '',
                  });
                }}
                className="border-slate-200 text-slate-500 hover:text-[#1E3A5F] hover:border-[#1E3A5F]/30 rounded-sm"
              >
                {language === 'tr' ? 'Yeni Talep' : 'New Request'}
              </Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      <div className="relative py-16 bg-gradient-to-br from-[#1E3A5F] to-[#2C4F7C]">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#D4AF5A]/60" />
            <span className="section-label text-[#D4AF5A] flex items-center gap-1.5">
              <FileText className="w-3 h-3" />
              {language === 'tr' ? 'B2B Talep Sistemi' : 'B2B Request System'}
            </span>
            <div className="w-8 h-px bg-[#D4AF5A]/60" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
            {language === 'tr' ? 'Yeni Talep Oluştur' : 'Create New Request'}
          </h1>
          <p className="text-white/60 text-sm font-light">
            {language === 'tr' ? 'Tedarikçilerden teklif almak için talebinizi oluşturun' : 'Create your request to receive quotes from suppliers'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/requests" className="text-slate-400 hover:text-[#1E3A5F] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <p className="text-slate-400 text-sm">
                {language === 'tr' ? 'Tüm alanları eksiksiz doldurun' : 'Fill in all fields completely'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
            <div className="bg-[#1E3A5F]/3 border-b border-slate-100 p-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1E3A5F]/10 border border-[#1E3A5F]/20 rounded-sm flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#1E3A5F]" />
              </div>
              <div>
                <h2 className="text-[#1E3A5F] font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {language === 'tr' ? 'Talep Formu' : 'Request Form'}
                </h2>
                <p className="text-slate-400 text-xs">{language === 'tr' ? 'Tüm alanları eksiksiz doldurun' : 'Fill in all fields completely'}</p>
              </div>
              <div className="ml-auto flex items-center gap-2 bg-[#B8922A]/8 border border-[#B8922A]/20 rounded-sm px-3 py-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B8922A]" />
                <span className="text-[#B8922A] text-xs font-semibold">AI {language === 'tr' ? 'Destekli' : 'Powered'}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-sm">
                  {language === 'tr' ? 'Ürün Türü' : 'Product Type'} *
                </Label>
                <Select value={formData.category_id} onValueChange={(v) => handleChange('category_id', v)}>
                  <SelectTrigger className="bg-white border-slate-200 text-slate-700 focus:border-[#1E3A5F]">
                    <SelectValue placeholder={language === 'tr' ? 'Kategori seçin' : 'Select category'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{language === 'tr' ? 'Perdeler' : 'Curtains'}</SelectItem>
                    <SelectItem value="2">{language === 'tr' ? 'Döşemelik Kumaşlar' : 'Upholstery Fabrics'}</SelectItem>
                    <SelectItem value="3">{language === 'tr' ? 'Halılar' : 'Carpets'}</SelectItem>
                    <SelectItem value="4">{language === 'tr' ? 'Ev Aksesuarları' : 'Home Accessories'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-sm">
                  {language === 'tr' ? 'Talep Başlığı' : 'Request Title'} *
                </Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder={language === 'tr' ? 'Örn: Otel Projesi İçin Perde Talebi' : 'E.g.: Curtain Request for Hotel Project'}
                  required
                  className="bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A5F]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-sm">
                  {language === 'tr' ? 'Açıklama' : 'Description'} *
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder={language === 'tr' ? 'Ürün detayları, özel gereksinimler ve beklentilerinizi açıklayın' : 'Describe product details, special requirements and expectations'}
                  required
                  rows={4}
                  className="bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A5F] resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold text-sm">
                    {language === 'tr' ? 'Miktar' : 'Quantity'} *
                  </Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                    placeholder="1000"
                    required
                    className="bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A5F]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold text-sm">{language === 'tr' ? 'Birim' : 'Unit'}</Label>
                  <Select value={formData.unit_of_measure} onValueChange={(v) => handleChange('unit_of_measure', v)}>
                    <SelectTrigger className="bg-white border-slate-200 text-slate-700 focus:border-[#1E3A5F]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metre">{language === 'tr' ? 'Metre' : 'Meter'}</SelectItem>
                      <SelectItem value="adet">{language === 'tr' ? 'Adet' : 'Piece'}</SelectItem>
                      <SelectItem value="m2">m²</SelectItem>
                      <SelectItem value="kg">Kilogram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold text-sm">
                    {language === 'tr' ? 'Min. Bütçe (USD)' : 'Min. Budget (USD)'} *
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.budget_min}
                    onChange={(e) => handleChange('budget_min', e.target.value)}
                    placeholder="25.00"
                    required
                    className="bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A5F]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold text-sm">
                    {language === 'tr' ? 'Max. Bütçe (USD)' : 'Max. Budget (USD)'} *
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.budget_max}
                    onChange={(e) => handleChange('budget_max', e.target.value)}
                    placeholder="45.00"
                    required
                    className="bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A5F]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold text-sm">
                    {language === 'tr' ? 'Hedef Ülke' : 'Target Country'} *
                  </Label>
                  <Input
                    value={formData.target_country}
                    onChange={(e) => handleChange('target_country', e.target.value)}
                    placeholder={language === 'tr' ? 'Türkiye' : 'Turkey'}
                    required
                    className="bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A5F]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold text-sm">
                    {language === 'tr' ? 'Teslim Süresi' : 'Delivery Timeline'} *
                  </Label>
                  <Input
                    value={formData.delivery_timeline}
                    onChange={(e) => handleChange('delivery_timeline', e.target.value)}
                    placeholder={language === 'tr' ? '60 gün' : '60 days'}
                    required
                    className="bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A5F]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold text-sm">
                  {language === 'tr' ? 'Kalite Gereksinimleri' : 'Quality Requirements'}
                </Label>
                <Textarea
                  value={formData.quality_requirements}
                  onChange={(e) => handleChange('quality_requirements', e.target.value)}
                  placeholder={language === 'tr' ? 'Sertifikalar, kalite standartları ve özel gereksinimler' : 'Certifications, quality standards and special requirements'}
                  rows={3}
                  className="bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A5F] resize-none"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/requests')}
                  className="flex-1 border-slate-200 text-slate-500 hover:text-[#1E3A5F] hover:border-[#1E3A5F]/30 font-semibold rounded-sm"
                >
                  {language === 'tr' ? 'İptal' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-navy font-bold py-4 rounded-sm shadow-sm"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <><Send className="mr-2 w-5 h-5" /> {language === 'tr' ? 'Talep Gönder' : 'Submit Request'}</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
