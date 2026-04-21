'use client';

import React, { useState } from 'react';
import AuthWrapper from './AuthWrapper';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';
import { Loader2 } from 'lucide-react';

export default function Register({ basePath = '/sites/perde.ai' }: { basePath?: string }) {
  const { registerDealer, loginWithGoogle } = usePerdeAuth();
  const [formData, setFormData] = useState({ name: '', company: '', email: '', password: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    });

    if (result.success) {
      setIsSubmitted(true);
    } else {
      setError(result.error || 'KayÄ±t baÅŸarÄ±sÄ±z.');
    }
    setIsProcessing(false);
  };

  const handleGoogleRegister = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await loginWithGoogle();
      // Google ile giriÅŸ yapÄ±nca usePerdeAuth otomatik olarak perde_members kaydÄ± oluÅŸturur
      setIsSubmitted(true);
    } catch (err) {
      setError('Google ile kayÄ±t baÅŸarÄ±sÄ±z oldu.');
    }
    setIsProcessing(false);
  };

  if (isSubmitted) {
    return (
      <AuthWrapper title="BAÅVURU ALINDI" basePath={basePath}>
        <div className="text-center space-y-4">
           <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
          <p className="text-sm text-zinc-400 font-light leading-relaxed">
            VIP Bayi lisans baÅŸvurunuz sisteme iÅŸlenmiÅŸtir. Ä°nceleme sonrasÄ± MÃ¼ÅŸteri Temsilcilerimiz sizinle irtibata geÃ§ecektir.
          </p>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper title="BAYÄ° BAÅVURUSU" basePath={basePath}>
      {error && (
        <div className="mb-6 p-3 border border-red-500/20 bg-red-500/5 text-red-400 text-xs text-center font-mono">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <input 
          required
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          placeholder="Firma AdÄ±"
          className="w-full bg-transparent border-b border-white/10 py-3 text-white outline-none focus:border-blue-500 placeholder:text-zinc-700 text-sm font-mono transition-colors"
        />
        <input 
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Yetkili Ad Soyad"
          className="w-full bg-transparent border-b border-white/10 py-3 text-white outline-none focus:border-blue-500 placeholder:text-zinc-700 text-sm font-mono transition-colors"
        />
        <input 
          required
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Kurumsal E-posta"
          className="w-full bg-transparent border-b border-white/10 py-3 text-white outline-none focus:border-blue-500 placeholder:text-zinc-700 text-sm font-mono transition-colors"
        />
        <input 
          required
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Åifre (min. 6 karakter)"
          minLength={6}
          className="w-full bg-transparent border-b border-white/10 py-3 text-white outline-none focus:border-blue-500 placeholder:text-zinc-700 text-sm font-mono transition-colors"
        />
        <div className="pt-4">
          <button 
            disabled={isProcessing}
            type="submit" 
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-sm tracking-widest uppercase hover:bg-blue-700 transition active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'BAÅVURUYU TAMAMLA'}
          </button>
        </div>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-[0.2em]">
            <span className="bg-[#0a0a0a] px-4 text-zinc-600">VEYA</span>
          </div>
        </div>

        <button 
          type="button" 
          disabled={isProcessing}
          onClick={handleGoogleRegister}
          className="w-full border border-white/10 text-white py-4 rounded-lg font-bold text-sm tracking-widest uppercase hover:bg-white/5 transition flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google ile Devam Et
        </button>

        <div className="text-center pt-2">
           <a href={`${basePath}/login`} className="text-[11px] uppercase font-bold tracking-widest text-zinc-500 hover:text-white transition">Zaten Ãœyeyim (GiriÅŸ)</a>
        </div>
      </form>
    </AuthWrapper>
  );
}
