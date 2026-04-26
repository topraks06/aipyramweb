'use client';

import React, { useState } from 'react';
import AuthWrapper from './AuthWrapper';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';
import { Loader2, Building2, User, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function Register({ basePath = '/sites/perde.ai' }: { basePath?: string }) {
  const { registerDealer, loginWithGoogle } = usePerdeAuth();
  const [formData, setFormData] = useState({ name: '', company: '', email: '', password: '', profession: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PROFESSIONS = [
    { value: 'perdeci', label: 'Perde Mağazası / Atölye' },
    { value: 'ic_mimar', label: 'İç Mimar / Mimar' },
    { value: 'perakendeci', label: 'Perakendeci / Esnaf' },
    { value: 'mobilyaci', label: 'Mobilyacı' },
    { value: 'toptanci', label: 'Toptancı / Distribütör' },
    { value: 'uretici', label: 'Üretici / Fabrika' },
    { value: 'diger', label: 'Diğer' },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company || !formData.email || !formData.password) return;
    setIsProcessing(true);
    setError(null);

    const result = await registerDealer({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      company: formData.company,
      profession: formData.profession || 'diger',
    });

    if (result.success) {
      setIsSubmitted(true);
    } else {
      setError(result.error || 'Kayıt işlemi başarısız oldu.');
    }
    setIsProcessing(false);
  };

  const handleGoogleRegister = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await loginWithGoogle();
      setIsSubmitted(true);
    } catch (err) {
      setError('Google ile kayıt yapılamadı. Lütfen tekrar deneyin.');
    }
    setIsProcessing(false);
  };

  if (isSubmitted) {
    return (
      <AuthWrapper title="Başvurunuz Alındı" basePath={basePath}>
        <div className="text-center space-y-6 py-4">
          <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-serif text-zinc-900">Kurumsal Üyelik Başvurunuz İşleme Alındı</h3>
            <p className="text-sm text-zinc-500 font-light leading-relaxed max-w-sm mx-auto">
              VIP Bayi lisans başvurunuz sisteme kaydedilmiştir. İnceleme sürecinin ardından müşteri temsilcilerimiz sizinle iletişime geçecektir.
            </p>
          </div>
          <div className="pt-4 space-y-3">
            <a 
              href={basePath} 
              className="block w-full bg-zinc-900 text-white py-4 rounded-xl font-semibold text-sm text-center hover:bg-black transition-all"
            >
              Ana Sayfaya Dön
            </a>
            <a 
              href={`${basePath}/login`} 
              className="block text-[#8B7355] text-sm font-medium hover:text-[#725e45] transition-colors"
            >
              Giriş Sayfasına Git →
            </a>
          </div>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper title="Kurumsal Başvuru" subtitle="B2B üyelik başvurusunu tamamlayarak tüm platform özelliklerine erişin." basePath={basePath}>
      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-600 text-sm text-center rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Firma Adı */}
        <div className="relative">
          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            required
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Firma / İşletme Adı"
            className="w-full bg-[#F9F9F6] border border-zinc-200 rounded-xl py-4 pl-12 pr-4 text-zinc-900 outline-none focus:border-[#8B7355] focus:ring-2 focus:ring-[#8B7355]/10 transition-all placeholder:text-zinc-400 text-sm"
          />
        </div>

        {/* Yetkili Adı */}
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Yetkili Ad Soyad"
            className="w-full bg-[#F9F9F6] border border-zinc-200 rounded-xl py-4 pl-12 pr-4 text-zinc-900 outline-none focus:border-[#8B7355] focus:ring-2 focus:ring-[#8B7355]/10 transition-all placeholder:text-zinc-400 text-sm"
          />
        </div>

        {/* Meslek Grubu Seçimi */}
        <div className="relative">
          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <select
            value={formData.profession}
            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
            className="w-full bg-[#F9F9F6] border border-zinc-200 rounded-xl py-4 pl-12 pr-4 text-zinc-900 outline-none focus:border-[#8B7355] focus:ring-2 focus:ring-[#8B7355]/10 transition-all text-sm appearance-none cursor-pointer"
          >
            <option value="" disabled>Meslek Grubunuzu Seçin</option>
            {PROFESSIONS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* E-posta */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            required
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Kurumsal E-posta"
            className="w-full bg-[#F9F9F6] border border-zinc-200 rounded-xl py-4 pl-12 pr-4 text-zinc-900 outline-none focus:border-[#8B7355] focus:ring-2 focus:ring-[#8B7355]/10 transition-all placeholder:text-zinc-400 text-sm"
          />
        </div>

        {/* Şifre */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            required
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Şifre (min. 6 karakter)"
            minLength={6}
            className="w-full bg-[#F9F9F6] border border-zinc-200 rounded-xl py-4 pl-12 pr-12 text-zinc-900 outline-none focus:border-[#8B7355] focus:ring-2 focus:ring-[#8B7355]/10 transition-all placeholder:text-zinc-400 text-sm"
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Bilgilendirme */}
        <div className="bg-[#F9F9F6] border border-zinc-100 rounded-xl p-4">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Başvurunuz onaylandıktan sonra aşağıdaki özelliklere erişim sağlayabilirsiniz:
          </p>
          <ul className="mt-2 space-y-1">
            {['AI Tasarım Stüdyosu', 'B2B Sipariş Yönetimi', 'Kumaş Stok Takibi', 'Otonom Teklif Motoru'].map((item) => (
              <li key={item} className="flex items-center gap-2 text-[11px] text-zinc-600">
                <CheckCircle2 className="w-3 h-3 text-[#8B7355] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Başvuru Butonu */}
        <button 
          disabled={isProcessing}
          type="submit" 
          className="w-full bg-[#8B7355] text-white py-4 rounded-xl font-semibold text-sm tracking-wide hover:bg-[#725e45] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-[#8B7355]/20 disabled:opacity-60"
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Başvuruyu Tamamla'}
        </button>

        {/* Ayırıcı */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-semibold tracking-[0.15em]">
            <span className="bg-white px-4 text-zinc-400">veya</span>
          </div>
        </div>

        {/* Google Butonu */}
        <button 
          type="button" 
          disabled={isProcessing}
          onClick={handleGoogleRegister}
          className="w-full border border-zinc-200 text-zinc-700 py-4 rounded-xl font-semibold text-sm hover:bg-zinc-50 hover:border-zinc-300 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google ile Hızlı Kayıt
        </button>

        {/* Giriş Linki */}
        <div className="text-center pt-4 border-t border-zinc-100">
          <p className="text-zinc-500 text-sm">
            Zaten üye misiniz?{' '}
            <a href={`${basePath}/login`} className="text-[#8B7355] font-semibold hover:text-[#725e45] transition-colors">
              Giriş Yapın
            </a>
          </p>
        </div>
      </form>
    </AuthWrapper>
  );
}
