'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AipyramAuthProvider';
import { Loader2, Mail, Lock, Eye, EyeOff, Shield, Zap, Globe } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

/**
 * AIPYRAM SOVEREIGN ADMIN LOGIN
 * 
 * Master Node'un kendi bağımsız admin login sayfası.
 * Artık /sites/perde/login'e redirect YAPMIYOR.
 * Firebase Auth + AipyramAuthProvider kullanır.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading, isAdmin, loginWithGoogle, loginWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Zaten giriş yapılmışsa admin paneline yönlendir
  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.replace('/admin');
    }
  }, [user, loading, isAdmin, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsProcessing(true);
    setError(null);

    try {
      await loginWithEmail(email, password);
      // Auth state change will trigger the useEffect redirect
    } catch (err: any) {
      const code = err.code;
      let message = 'Giriş başarısız.';
      if (code === 'auth/user-not-found') message = 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.';
      if (code === 'auth/wrong-password') message = 'Şifre hatalı.';
      if (code === 'auth/invalid-credential') message = 'E-posta veya şifre hatalı.';
      if (code === 'auth/too-many-requests') message = 'Çok fazla deneme. Lütfen bekleyin.';
      setError(message);
      setIsProcessing(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await loginWithGoogle();
      // Auth state change will trigger the useEffect redirect
    } catch (err) {
      setError('Google ile giriş yapılamadı.');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Giriş yapılmış ama admin değilse
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center text-white font-mono">
        <Shield className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-2xl font-bold uppercase tracking-widest text-red-500 mb-2">ERİŞİM REDDEDİLDİ</h1>
        <p className="text-zinc-400 text-sm mb-8">Bu panele sadece Sovereign Admin erişebilir.</p>
        <button
          onClick={() => router.push('/')}
          className="px-8 py-3 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center px-4">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 mb-6 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-[0.15em] text-white mb-2">
            AIPYRAM
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-blue-400/80 font-bold">
            Sovereign Command Center
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0A0A0F] border border-white/[0.06] rounded-2xl p-8 shadow-2xl">
          {/* Error */}
          {error && (
            <div className="mb-6 p-4 border border-red-500/20 bg-red-500/5 text-red-400 text-sm text-center rounded-xl font-mono">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Google Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleGoogleLogin}
              className="w-full bg-white text-black py-4 rounded-xl font-semibold text-sm hover:bg-zinc-100 hover:shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google ile Giriş Yap
            </button>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-[0.2em]">
                <span className="bg-[#0A0A0F] px-4 text-zinc-600">veya</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta"
                  required
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-zinc-600 text-sm font-mono"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifre"
                  required
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 pl-12 pr-12 text-white outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-zinc-600 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot Password */}
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
                  className="text-[11px] text-blue-400/70 hover:text-blue-400 font-medium transition-colors"
                >
                  Şifremi Unuttum
                </button>
              </div>

              {/* Submit */}
              <button
                disabled={isProcessing}
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-sm tracking-wide hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-60"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Shield className="w-4 h-4" />
                    Sovereign Giriş
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-700 font-mono uppercase tracking-widest">
            <Globe className="w-3 h-3" />
            <span>5 Node · 10 Bölge · 50+ Ajan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
