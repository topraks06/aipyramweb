"use client";

import React, { useState } from 'react';
import { db } from '@/lib/firebase-client';
import { collection, addDoc } from 'firebase/firestore';
import { useSovereignAuth } from '@/hooks/useSovereignAuth';
import toast from 'react-hot-toast';
import { Building2, Mail, Globe, Sparkles, Loader2, Info } from 'lucide-react';

export default function ExhibitorOnboarding() {
  const { user, loading } = useSovereignAuth('hometex');
  
  const [formData, setFormData] = useState({
    companyName: '',
    country: '',
    categories: [] as string[],
    description: '',
    contactEmail: '',
    website: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategoryToggle = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) 
        ? prev.categories.filter(c => c !== cat) 
        : [...prev.categories, cat]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Lütfen önce giriş yapın.');
      return;
    }

    if (!formData.companyName || !formData.contactEmail) {
      toast.error('Firma Adı ve E-posta zorunludur.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'hometex_exhibitors'), {
        ...formData,
        userId: user.uid,
        verified: false, // Admin onayı gerekecek
        createdAt: new Date().toISOString(),
        boothNumber: `HALL-${Date.now().toString(36).slice(-3).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}` // Otonom tahsis (deterministik)
      });
      
      toast.success('Fuar başvurunuz alındı. Otonom motor standınızı oluşturuyor.');
      setFormData({ companyName: '', country: '', categories: [], description: '', contactEmail: '', website: '' });
    } catch (error: any) {
      toast.error('Başvuru sırasında hata oluştu: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>;

  if (!user) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center max-w-lg mx-auto">
        <Info className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Giriş Yapmanız Gerekiyor</h3>
        <p className="text-slate-600 mb-6">Hometex.ai 365 Gün Sanal Fuarı'na katılımcı olmak için Sovereign Passport ile giriş yapmalısınız.</p>
        <button onClick={() => window.location.href='/sites/hometex.ai/login'} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
          Giriş Yap / Kayıt Ol
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 text-white">
        <Sparkles className="w-8 h-8 text-blue-300 mb-4" />
        <h2 className="text-3xl font-black tracking-tight mb-2">Hometex.ai Katılımcı Başvurusu</h2>
        <p className="text-blue-100 font-light">365 Gün Açık Sanal Fuar'da markanızın otonom standını (3D Showroom) oluşturun.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" /> Firma Adı
            </label>
            <input 
              type="text" 
              value={formData.companyName}
              onChange={e => setFormData({...formData, companyName: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Markanızın resmi adı"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" /> Ülke
            </label>
            <input 
              type="text" 
              value={formData.country}
              onChange={e => setFormData({...formData, country: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Örn: Türkiye"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" /> İletişim E-posta
            </label>
            <input 
              type="email" 
              value={formData.contactEmail}
              onChange={e => setFormData({...formData, contactEmail: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Sipariş ve talepler için"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" /> Web Sitesi
            </label>
            <input 
              type="url" 
              value={formData.website}
              onChange={e => setFormData({...formData, website: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Kategori (Birden fazla seçebilirsiniz)</label>
          <div className="flex flex-wrap gap-2">
            {['Perde', 'Döşemelik', 'Yatak', 'Aksesuar', 'Mekanizma', 'İplik'].map(cat => (
              <button
                type="button"
                key={cat}
                onClick={() => handleCategoryToggle(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${
                  formData.categories.includes(cat)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Firma Tanıtımı</label>
          <textarea 
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 h-32 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Kısaca firmanızı ve ürünlerinizi anlatın..."
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Standımı Oluştur
          </button>
        </div>
      </form>
    </div>
  );
}
