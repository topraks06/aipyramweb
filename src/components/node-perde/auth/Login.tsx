'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthWrapper from './AuthWrapper';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

export default function Login({ basePath = '/sites/perde.ai' }: { basePath?: string }) {
  const router = useRouter();
  const { loginWithGoogle, loginWithEmail } = usePerdeAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsProcessing(true);
    setError(null);

    const result = await loginWithEmail(email, password);
    if (result.success) {
      router.push(`${basePath}/studio`);
    } else {
      setError(result.error || 'Giriş başarısız.');
      setIsProcessing(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await loginWithGoogle();
      router.push(`${basePath}/studio`);
    } catch (err) {
      setError('Google ile giriş yapılamadı. Lütfen tekrar deneyin.');
      setIsProcessing(false);
    }
  };

  return (
    <AuthWrapper title="Giriş Yap" subtitle="Hesabınıza giriş yaparak tasarım stüdyosuna erişin." basePath={basePath}>
      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-600 text-sm text-center rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-5">
        {/* E-posta */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta adresiniz"
            required
            className="w-full bg-[#F9F9F6] border border-zinc-200 rounded-xl py-4 pl-12 pr-4 text-zinc-900 outline-none focus:border-[#8B7355] focus:ring-2 focus:ring-[#8B7355]/10 transition-all placeholder:text-zinc-400 text-sm"
          />
        </div>

        {/* Şifre */}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifreniz"
            required
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

        {/* Şifremi Unuttum */}
        <div className="flex justify-end">
          <button 
            type="button" 
            onClick={async () => {
              if (!email) { setError('Lütfen önce e-posta adresinizi girin.'); return; }
              try {
                await sendPasswordResetEmail(auth, email);
                setError(null);
                alert('Şifre sıfırlama linki e-postanıza gönderildi.');
              } catch { setError('Şifre sıfırlama başarısız.'); }
            }}
            className="text-[11px] text-[#8B7355] hover:text-[#725e45] font-medium transition-colors"
          >
            Şifremi Unuttum
          </button>
        </div>

        {/* Giriş Butonu */}
        <button 
          disabled={isProcessing}
          type="submit" 
          className="w-full bg-zinc-900 text-white py-4 rounded-xl font-semibold text-sm tracking-wide hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/20 disabled:opacity-60"
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Giriş Yap'}
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
          onClick={handleGoogleLogin}
          className="w-full border border-zinc-200 text-zinc-700 py-4 rounded-xl font-semibold text-sm hover:bg-zinc-50 hover:border-zinc-300 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google ile Devam Et
        </button>

        {/* Kayıt Linki */}
        <div className="text-center pt-4 border-t border-zinc-100">
          <p className="text-zinc-500 text-sm">
            Henüz üye değil misiniz?{' '}
            <a href={`${basePath}/register`} className="text-[#8B7355] font-semibold hover:text-[#725e45] transition-colors">
              Kurumsal Başvuru Yapın
            </a>
          </p>
        </div>
      </form>
    </AuthWrapper>
  );
}
