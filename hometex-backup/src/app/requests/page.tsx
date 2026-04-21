
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { api } from '@/lib/api-client';
import { BuyerRequest } from '@/types/hometex';
import { FileText, Plus, Clock, DollarSign, Globe, Package, MessageSquare, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';

const DEMO_REQUESTS: BuyerRequest[] = [
  { id: 1, user_id: 1, category_id: 1, title: 'Otel Projesi İçin Perde Talebi', description: '5 yıldızlı otel projesi için lüks perde kumaşı arayışındayız. ISO sertifikalı üreticiler tercih edilir.', quantity: 5000, unit_of_measure: 'metre', budget_min: 25, budget_max: 45, currency: 'USD', target_country: 'Türkiye', delivery_timeline: '60 gün', status: 'open', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 2, user_id: 1, category_id: 2, title: 'Döşemelik Kumaş Toplu Alım', description: 'Mobilya üretimi için dayanıklı döşemelik kumaş. GOTS sertifikalı tercih edilir.', quantity: 3000, unit_of_measure: 'metre', budget_min: 15, budget_max: 30, currency: 'USD', target_country: 'Almanya', delivery_timeline: '45 gün', status: 'in_progress', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 3, user_id: 1, category_id: 3, title: 'El Dokuma Halı Koleksiyonu', description: 'Butik otel için el dokuma yün halı. Özel desen ve renk seçenekleri.', quantity: 200, unit_of_measure: 'm²', budget_min: 80, budget_max: 150, currency: 'USD', target_country: 'İtalya', delivery_timeline: '90 gün', status: 'open', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  closed: 'bg-slate-100 text-slate-500 border-slate-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

const STATUS_LABELS: Record<string, Record<string, string>> = {
  open: { tr: 'Açık', en: 'Open', ar: 'مفتوح', ru: 'Открыт' },
  in_progress: { tr: 'Devam Ediyor', en: 'In Progress', ar: 'قيد التنفيذ', ru: 'В процессе' },
  closed: { tr: 'Kapalı', en: 'Closed', ar: 'مغلق', ru: 'Закрыт' },
  cancelled: { tr: 'İptal', en: 'Cancelled', ar: 'ملغى', ru: 'Отменён' },
};

const OFFER_COUNTS: Record<number, number> = { 1: 5, 2: 8, 3: 2 };

export default function RequestsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [requests, setRequests] = useState<BuyerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login?redirect=/requests'); return; }
    const load = async () => {
      try {
        const data = await api.get<BuyerRequest[]>('/buyer-requests');
        setRequests(data?.length ? data : DEMO_REQUESTS);
      } catch { setRequests(DEMO_REQUESTS); }
      finally { setLoading(false); }
    };
    load();
  }, [user, router]);

  if (!user) return null;

  const title =
    language === 'tr' ? 'Alım Talepleri' :
    language === 'ar' ? 'طلبات الشراء' :
    language === 'ru' ? 'Запросы на покупку' :
    'Purchase Requests';

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      <div className="relative py-20 overflow-hidden bg-gradient-to-br from-[#1E3A5F] to-[#2C4F7C]">
        <div className="container mx-auto px-6 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#D4AF5A]/60" />
            <span className="section-label text-[#D4AF5A] flex items-center gap-1.5">
              <FileText className="w-3 h-3" />
              {language === 'tr' ? 'B2B Talep Sistemi' : 'B2B Request System'}
            </span>
            <div className="w-8 h-px bg-[#D4AF5A]/60" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            {title}
          </h1>
          <p className="text-white/60 text-base max-w-2xl mx-auto mb-8 font-light">
            {language === 'tr' ? 'İhtiyaçlarınızı belirtin, en uygun tedarikçilerle eşleşin' : 'Specify your needs, match with the most suitable suppliers'}
          </p>
          <Link href="/requests/create">
            <Button className="btn-gold text-white font-bold px-8 py-3 rounded-sm shadow-lg">
              <Plus className="mr-2 w-4 h-4" />
              {language === 'tr' ? 'Yeni Talep Oluştur' : 'Create New Request'}
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-20 pt-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3A5F] mx-auto" />
            <p className="mt-4 text-slate-400 text-sm">{language === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-14 h-14 text-slate-300 mx-auto mb-4" />
            <p className="text-lg text-slate-400 mb-6">
              {language === 'tr' ? 'Henüz talep oluşturmadınız' : "You haven't created any requests yet"}
            </p>
            <Link href="/requests/create">
              <Button className="btn-navy font-bold rounded-sm">
                <Plus className="mr-2 w-4 h-4" />
                {language === 'tr' ? 'İlk Talebinizi Oluşturun' : 'Create Your First Request'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {requests.map((request, i) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white border border-slate-200 hover:border-[#B8922A]/30 rounded-sm p-6 transition-all hover:shadow-md hover:shadow-slate-200"
              >
                <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-[#1E3A5F]" style={{ fontFamily: 'var(--font-playfair)' }}>
                        {request.title}
                      </h3>
                      <Badge className={`${STATUS_STYLES[request.status]} font-semibold text-xs border`}>
                        {STATUS_LABELS[request.status]?.[language] || STATUS_LABELS[request.status]?.en}
                      </Badge>
                    </div>
                    <p className="text-slate-500 text-sm font-light">{request.description}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-[#B8922A]/5 border border-[#B8922A]/20 rounded-sm px-3 py-2">
                    <MessageSquare className="w-4 h-4 text-[#B8922A]" />
                    <span className="text-[#B8922A] font-bold text-sm">{OFFER_COUNTS[request.id] || 0}</span>
                    <span className="text-slate-400 text-xs">{language === 'tr' ? 'teklif' : 'offers'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {[
                    { icon: Package, label: language === 'tr' ? 'Miktar' : 'Quantity', value: `${request.quantity} ${request.unit_of_measure}` },
                    { icon: DollarSign, label: language === 'tr' ? 'Bütçe' : 'Budget', value: `$${request.budget_min}-$${request.budget_max}` },
                    { icon: Globe, label: language === 'tr' ? 'Hedef Ülke' : 'Target Country', value: request.target_country || '-' },
                    { icon: Clock, label: language === 'tr' ? 'Teslimat' : 'Delivery', value: request.delivery_timeline || '-' },
                  ].map((item, j) => (
                    <div key={j} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-sm p-3">
                      <item.icon className="w-4 h-4 text-[#B8922A] flex-shrink-0" />
                      <div>
                        <div className="text-xs text-slate-400">{item.label}</div>
                        <div className="text-sm font-semibold text-[#1E3A5F]">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 flex-wrap">
                  <Button className="btn-navy font-semibold text-sm rounded-sm">
                    <Eye className="mr-2 w-4 h-4" />
                    {language === 'tr' ? 'Teklifleri İncele' : 'View Offers'}
                  </Button>
                  <Button variant="outline" className="border-slate-200 text-slate-500 hover:text-[#1E3A5F] hover:border-[#1E3A5F]/30 font-semibold text-sm rounded-sm">
                    {language === 'tr' ? 'Detayları Gör' : 'View Details'}
                  </Button>
                  <Button variant="ghost" className="text-red-400/60 hover:text-red-500 text-sm ml-auto rounded-sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
