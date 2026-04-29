'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SovereignAuthWrapper, { getNodeTheme } from './SovereignAuthWrapper';
import { useSovereignAuth } from '@/hooks/useSovereignAuth';
import type { SovereignNodeId } from '@/lib/sovereign-config';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

/**
 * ═══════════════════════════════════════════════════════════════
 *  SOVEREIGN LOGIN — Tek Tip Giriş Bileşeni
 *  
 *  Kullanım:  <SovereignLogin nodeId="perde" />
 *             <SovereignLogin nodeId="icmimar" />
 *             <SovereignLogin nodeId="trtex" />
 *  
 *  Renk, logo, yönlendirme otomatik. Yapı hep aynı.
 * ═══════════════════════════════════════════════════════════════
 */

interface SovereignLoginProps {
  nodeId: SovereignNodeId;
  basePath?: string;
  redirectPath?: string;
}

export default function SovereignLogin({ nodeId, basePath, redirectPath }: SovereignLoginProps) {
  const router = useRouter();
  const theme = getNodeTheme(nodeId);
  const { loginWithGoogle, loginWithEmail } = useSovereignAuth(nodeId);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Auto basePath
  const base = basePath || `/sites/${theme.name.toLowerCase().replace('.ai', '.ai').replace('.com', '.com')}`;
  const redirect = redirectPath || `${base}/yonetim`;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsProcessing(true);
    setError(null);

    const result = await loginWithEmail(email, password);
    if (result.success) {
      router.push(redirect);
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
      router.push(redirect);
    } catch {
      setError('Google ile giriş yapılamadı. Lütfen tekrar deneyin.');
      setIsProcessing(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) { setError('Lütfen önce e-posta adresinizi girin.'); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      setError(null);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch { setError('Şifre sıfırlama başarısız.'); }
  };

  return (
    <SovereignAuthWrapper nodeId={nodeId} title="Sisteme Giriş" subtitle={`${theme.name} hesabınıza giriş yapın. Tüm AIPyram ekosisteminde geçerli.`}>
      
      {/* Error / Success Messages */}
      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-600 text-sm text-center rounded-xl animate-in fade-in">
          {error}
        </div>
      )}
      {resetSent && (
        <div className="mb-6 p-4 border border-green-200 bg-green-50 text-green-600 text-sm text-center rounded-xl animate-in fade-in">
          ✅ Şifre sıfırlama linki e-postanıza gönderildi.
        </div>
      )}

      <div className="space-y-6">
        {/* Google — BİRİNCİL */}
        <button 
          type="button" 
          disabled={isProcessing}
          onClick={handleGoogleLogin}
          className="w-full py-4 rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-3 active:scale-[0.98] hover:shadow-lg disabled:opacity-60"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
          }}
        >
          <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity="0.8"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" opacity="0.6"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity="0.9"/>
            </svg>
          </div>
          Tek Tıkla Google İle Başla
        </button>

        {/* Ayırıcı */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-semibold tracking-[0.15em]">
            <span className="bg-white px-4 text-zinc-400">veya e-posta ile</span>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          {/* Email */}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresiniz"
              required
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-12 pr-4 text-zinc-900 outline-none transition-all placeholder:text-zinc-400 text-sm"
              style={{ ['--tw-ring-color' as string]: theme.accentRing }}
              onFocus={(e) => { e.target.style.borderColor = theme.accent; e.target.style.boxShadow = `0 0 0 3px ${theme.accentRing}`; }}
              onBlur={(e) => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" />
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifreniz"
              required
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-12 pr-12 text-zinc-900 outline-none transition-all placeholder:text-zinc-400 text-sm"
              onFocus={(e) => { e.target.style.borderColor = theme.accent; e.target.style.boxShadow = `0 0 0 3px ${theme.accentRing}`; }}
              onBlur={(e) => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button 
              type="button"
              onClick={handlePasswordReset}
              className="text-[11px] font-medium transition-colors"
              style={{ color: theme.accent }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.color = theme.accentHover}
              onMouseLeave={(e) => (e.target as HTMLElement).style.color = theme.accent}
            >
              Şifremi Unuttum
            </button>
          </div>

          {/* Submit */}
          <button 
            disabled={isProcessing}
            type="submit" 
            className="w-full text-white py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
            style={{ 
              background: theme.accent,
              boxShadow: `0 10px 25px ${theme.accentRing}`,
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.background = theme.accentHover}
            onMouseLeave={(e) => (e.target as HTMLElement).style.background = theme.accent}
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Giriş Yap'}
          </button>

          {/* Register Link */}
          <div className="text-center pt-4 border-t border-zinc-100">
            <p className="text-zinc-500 text-sm">
              Henüz üye değil misiniz?{' '}
              <a 
                href={`${base}/register`} 
                className="font-semibold transition-colors"
                style={{ color: theme.accent }}
              >
                Ücretsiz Kayıt Olun
              </a>
            </p>
          </div>
        </form>
      </div>
    </SovereignAuthWrapper>
  );
}
