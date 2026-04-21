
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  FileText, Package, Store, User, MessageSquare, Heart,
  TrendingUp, Users, CheckCircle2, Clock, Plus, ArrowRight,
  BarChart3, Settings, LogOut, Shield, Star, Eye, Sparkles, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

type DashboardRole = 'buyer' | 'supplier' | 'admin';

const RECENT_REQUESTS = [
  { id: 1, title: 'Otel Projesi İçin Perde', status: 'open', date: '2024-12-01', offers: 5 },
  { id: 2, title: 'Döşemelik Kumaş Toplu Alım', status: 'in_progress', date: '2024-11-28', offers: 8 },
  { id: 3, title: 'Halı Koleksiyonu', status: 'closed', date: '2024-11-20', offers: 12 },
];

const FAVORITE_SHOWROOMS = [
  { name: 'Taç', slug: 'premium-tekstil', logo: 'T', color: '#1E3A5F', country: '🇹🇷' },
  { name: 'Luolai Lifestyle', slug: 'orient-carpet', logo: 'L', color: '#E05A4E', country: '🇨🇳' },
  { name: 'Nitori', slug: 'euro-textiles', logo: 'N', color: '#7B68EE', country: '🇯🇵' },
];

const SUPPLIER_PRODUCTS = [
  { name: 'Lüks Kadife Perde', status: 'active', views: 342 },
  { name: 'Modern Tül Perde', status: 'active', views: 218 },
  { name: 'Karartma Fon Perde', status: 'active', views: 189 },
];

const PENDING_APPROVALS = [
  { label: 'Premium Tekstil A.Ş. — Stand Onayı', type: 'stand' },
  { label: 'Global Fabrics Ltd. — Ürün Onayı', type: 'product' },
  { label: 'Anatolia Home — Sertifika Onayı', type: 'cert' },
];

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  closed: 'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUS_LABELS: Record<string, Record<string, string>> = {
  open: { tr: 'Açık', en: 'Open' },
  in_progress: { tr: 'Devam Ediyor', en: 'In Progress' },
  closed: { tr: 'Kapalı', en: 'Closed' },
};

export default function DashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const [activeRole, setActiveRole] = useState<DashboardRole>('buyer');

  if (!user) {
    router.push('/login?redirect=/dashboard');
    return null;
  }

  const isAdmin = user?.isAdmin;

  const buyerStats = [
    { label: language === 'tr' ? 'Aktif Talepler' : 'Active Requests', value: '3', icon: FileText, color: 'text-[#1E3A5F]', bg: 'bg-[#1E3A5F]/8 border-[#1E3A5F]/20' },
    { label: language === 'tr' ? 'Gelen Teklifler' : 'Incoming Offers', value: '12', icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: language === 'tr' ? 'Favoriler' : 'Favorites', value: '8', icon: Heart, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
    { label: language === 'tr' ? 'Tamamlanan' : 'Completed', value: '5', icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  ];

  const supplierStats = [
    { label: language === 'tr' ? 'Ürünlerim' : 'My Products', value: '45', icon: Package, color: 'text-[#1E3A5F]', bg: 'bg-[#1E3A5F]/8 border-[#1E3A5F]/20' },
    { label: language === 'tr' ? 'Gelen Talepler' : 'Incoming Requests', value: '18', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: language === 'tr' ? 'Stand Görüntülenme' : 'Stand Views', value: '1.2K', icon: TrendingUp, color: 'text-[#B8922A]', bg: 'bg-[#B8922A]/8 border-[#B8922A]/20' },
    { label: language === 'tr' ? 'Aktif Teklifler' : 'Active Offers', value: '7', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  ];

  const adminStats = [
    { label: language === 'tr' ? 'Toplam Kullanıcı' : 'Total Users', value: '2,450', icon: Users, color: 'text-[#1E3A5F]', bg: 'bg-[#1E3A5F]/8 border-[#1E3A5F]/20' },
    { label: language === 'tr' ? 'Aktif Standlar' : 'Active Stands', value: '380', icon: Store, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: language === 'tr' ? 'Bekleyen Onay' : 'Pending Approval', value: '23', icon: Clock, color: 'text-[#B8922A]', bg: 'bg-[#B8922A]/8 border-[#B8922A]/20' },
    { label: language === 'tr' ? 'Toplam Talepler' : 'Total Requests', value: '1,890', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  ];

  const roles: { key: DashboardRole; label: string; icon: any }[] = [
    { key: 'buyer', label: language === 'tr' ? 'Alıcı Paneli' : 'Buyer Panel', icon: User },
    { key: 'supplier', label: language === 'tr' ? 'Tedarikçi Paneli' : 'Supplier Panel', icon: Store },
    ...(isAdmin ? [{ key: 'admin' as DashboardRole, label: language === 'tr' ? 'Admin Paneli' : 'Admin Panel', icon: Shield }] : []),
  ];

  const currentStats = activeRole === 'buyer' ? buyerStats : activeRole === 'supplier' ? supplierStats : adminStats;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1E3A5F]" style={{ fontFamily: 'var(--font-playfair)' }}>
              {language === 'tr' ? 'Hoş Geldiniz' : 'Welcome'}, {user?.email?.split('@')[0]} 👋
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Hometex.ai Panel</p>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 font-semibold rounded-sm"
          >
            <LogOut className="mr-2 w-4 h-4" />
            {language === 'tr' ? 'Çıkış Yap' : 'Logout'}
          </Button>
        </div>

        {/* Role Tabs */}
        <div className="flex gap-2 mb-8 bg-white border border-slate-200 rounded-sm p-1.5 w-fit shadow-sm">
          {roles.map((role) => (
            <button
              key={role.key}
              onClick={() => setActiveRole(role.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-semibold transition-all ${
                activeRole === role.key
                  ? 'bg-[#1E3A5F] text-white shadow-sm'
                  : 'text-slate-500 hover:text-[#1E3A5F] hover:bg-slate-50'
              }`}
            >
              <role.icon className="w-4 h-4" />
              {role.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {currentStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm"
            >
              <div className={`w-10 h-10 ${stat.bg} border rounded-sm flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-[#1E3A5F] mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>{stat.value}</div>
              <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Buyer: Requests */}
            {activeRole === 'buyer' && (
              <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <h3 className="text-[#1E3A5F] font-bold text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {language === 'tr' ? 'Taleplerim' : 'My Requests'}
                  </h3>
                  <Link href="/requests/create">
                    <Button size="sm" className="btn-navy font-semibold rounded-sm">
                      <Plus className="mr-1 w-4 h-4" /> {language === 'tr' ? 'Yeni' : 'New'}
                    </Button>
                  </Link>
                </div>
                <div className="p-4 space-y-3">
                  {RECENT_REQUESTS.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-sm">
                      <div className="flex-1">
                        <div className="font-semibold text-[#1E3A5F] text-sm mb-1">{req.title}</div>
                        <div className="text-xs text-slate-400">{req.date}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${STATUS_STYLES[req.status]} text-xs font-semibold border`}>
                          {STATUS_LABELS[req.status]?.[language] || STATUS_LABELS[req.status]?.en}
                        </Badge>
                        <span className="text-xs text-slate-400">{req.offers} {language === 'tr' ? 'teklif' : 'offers'}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-slate-100">
                  <Link href="/requests">
                    <Button variant="outline" className="w-full border-slate-200 text-slate-500 hover:text-[#1E3A5F] hover:border-[#1E3A5F]/30 font-semibold text-sm rounded-sm">
                      {language === 'tr' ? 'Tüm Talepler' : 'All Requests'} <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Buyer: Favorites */}
            {activeRole === 'buyer' && (
              <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <h3 className="text-[#1E3A5F] font-bold text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {language === 'tr' ? 'Favori Standlar' : 'Favorite Stands'}
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {FAVORITE_SHOWROOMS.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-sm">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-sm flex items-center justify-center font-bold text-white text-base"
                          style={{ backgroundColor: s.color }}
                        >
                          {s.logo}
                        </div>
                        <div>
                          <div className="font-semibold text-[#1E3A5F] text-sm">{s.name}</div>
                          <div className="text-xs text-slate-400">{s.country}</div>
                        </div>
                      </div>
                      <Link href={`/showrooms/${s.slug}`}>
                        <Button size="sm" variant="outline" className="border-slate-200 text-slate-500 hover:text-[#1E3A5F] text-xs rounded-sm">
                          <Eye className="w-3 h-3 mr-1" /> {language === 'tr' ? 'Gez' : 'Visit'}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Supplier: Products */}
            {activeRole === 'supplier' && (
              <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <h3 className="text-[#1E3A5F] font-bold text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {language === 'tr' ? 'Ürün Yönetimi' : 'Product Management'}
                  </h3>
                  <Button size="sm" className="btn-navy font-semibold rounded-sm">
                    <Plus className="mr-1 w-4 h-4" /> {language === 'tr' ? 'Ürün Ekle' : 'Add Product'}
                  </Button>
                </div>
                <div className="p-4 space-y-3">
                  {SUPPLIER_PRODUCTS.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#B8922A]/10 border border-[#B8922A]/20 rounded-sm flex items-center justify-center">
                          <Package className="w-5 h-5 text-[#B8922A]" />
                        </div>
                        <div>
                          <div className="font-semibold text-[#1E3A5F] text-sm">{p.name}</div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <Eye className="w-3 h-3" /> {p.views} {language === 'tr' ? 'görüntülenme' : 'views'}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="border-slate-200 text-slate-500 hover:text-[#1E3A5F] text-xs rounded-sm">
                        <Settings className="w-3 h-3 mr-1" /> {language === 'tr' ? 'Düzenle' : 'Edit'}
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-slate-100">
                  <Link href="/showrooms/premium-tekstil">
                    <Button variant="outline" className="w-full border-slate-200 text-slate-500 hover:text-[#1E3A5F] hover:border-[#1E3A5F]/30 font-semibold text-sm rounded-sm">
                      {language === 'tr' ? 'Standımı Düzenle' : 'Edit My Stand'} <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Admin: Approvals */}
            {activeRole === 'admin' && (
              <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-[#1E3A5F] font-bold text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {language === 'tr' ? 'Bekleyen Onaylar' : 'Pending Approvals'}
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {PENDING_APPROVALS.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-[#B8922A] rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-[#1E3A5F]">{item.label}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs px-3 rounded-sm">
                          {language === 'tr' ? 'Onayla' : 'Approve'}
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-200 text-red-500 hover:bg-red-50 text-xs px-3 rounded-sm">
                          {language === 'tr' ? 'Reddet' : 'Reject'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Profile */}
            <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-[#1E3A5F] rounded-sm flex items-center justify-center shadow-sm">
                  <span className="text-white font-black text-2xl">
                    {user?.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-[#1E3A5F]">{user?.email?.split('@')[0]}</div>
                  <div className="text-xs text-slate-400">{user?.email}</div>
                  {isAdmin && (
                    <Badge className="mt-1 bg-[#B8922A]/10 text-[#B8922A] border-[#B8922A]/20 text-xs">Admin</Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" className="w-full border-slate-200 text-slate-500 hover:text-[#1E3A5F] hover:border-[#1E3A5F]/30 font-semibold text-sm rounded-sm">
                <User className="mr-2 w-4 h-4" /> {language === 'tr' ? 'Profil Düzenle' : 'Edit Profile'}
              </Button>
            </div>

            {/* Quick Links */}
            <div className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm">
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
                {language === 'tr' ? 'Hızlı Erişim' : 'Quick Access'}
              </h4>
              <div className="space-y-1">
                {[
                  { href: '/requests/create', label: language === 'tr' ? 'Talep Oluştur' : 'Create Request', icon: Plus },
                  { href: '/showrooms', label: language === 'tr' ? 'Standları Keşfet' : 'Explore Stands', icon: Store },
                  { href: '/categories', label: language === 'tr' ? 'Kategoriler' : 'Categories', icon: BarChart3 },
                  { href: '/fair', label: language === 'tr' ? 'Sanal Fuar' : 'Virtual Fair', icon: TrendingUp },
                  { href: '/collections', label: language === 'tr' ? 'Koleksiyonlar' : 'Collections', icon: Star },
                  { href: '/agents', label: language === 'tr' ? 'AI Ajanlar' : 'AI Agents', icon: Sparkles },
                ].map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div className="flex items-center gap-3 p-3 rounded-sm hover:bg-[#1E3A5F]/5 transition-colors cursor-pointer group">
                      <div className="w-8 h-8 bg-slate-50 border border-slate-200 group-hover:bg-[#1E3A5F]/10 group-hover:border-[#1E3A5F]/20 rounded-sm flex items-center justify-center transition-all">
                        <link.icon className="w-4 h-4 text-slate-400 group-hover:text-[#1E3A5F] transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-slate-500 group-hover:text-[#1E3A5F] transition-colors">{link.label}</span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#B8922A] ml-auto transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* perde.ai CTA */}
            <a href="https://perde.ai?utm_source=hometex&utm_medium=dashboard" target="_blank" rel="noopener noreferrer">
              <div className="group bg-[#B8922A]/5 border border-[#B8922A]/20 hover:border-[#B8922A]/50 rounded-sm p-5 transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#B8922A]/15 rounded-sm flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#B8922A]" />
                  </div>
                  <div>
                    <p className="text-[#1E3A5F] font-bold text-sm">perde.ai</p>
                    <p className="text-slate-400 text-xs">{language === 'tr' ? 'AI Tasarım Programı' : 'AI Design Tool'}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#B8922A]/40 group-hover:text-[#B8922A] ml-auto transition-colors" />
                </div>
                <p className="text-slate-400 text-xs">
                  {language === 'tr' ? 'Koleksiyonları odanızda sanal olarak deneyin' : 'Try collections virtually in your room'}
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
