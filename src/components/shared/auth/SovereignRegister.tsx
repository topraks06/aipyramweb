'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SovereignAuthWrapper, { getNodeTheme } from './SovereignAuthWrapper';
import { useSovereignAuth } from '@/hooks/useSovereignAuth';
import type { SovereignNodeId } from '@/lib/sovereign-config';
import { Loader2, Mail, Lock, Eye, EyeOff, User, Building2, Briefcase } from 'lucide-react';

/**
 * ═══════════════════════════════════════════════════════════════
 *  SOVEREIGN REGISTER — Tek Tip Kayıt Bileşeni
 *  
 *  Kullanım: <SovereignRegister nodeId="perde" />
 *  Tüm node'lar aynı formu kullanır. Renk/logo otomatik.
 * ═══════════════════════════════════════════════════════════════
 */

const PROFESSION_OPTIONS = [
  { value: 'perdeci', label: 'Perdeci / Perde Mağazası' },
  { value: 'ic_mimar', label: 'İç Mimar / Dekoratör' },
  { value: 'mobilyaci', label: 'Mobilyacı' },
  { value: 'uretici', label: 'Üretici / Fabrika' },
  { value: 'toptanci', label: 'Toptancı / İthalatçı' },
  { value: 'perakendeci', label: 'Perakendeci' },
  { value: 'otel_proje', label: 'Otel / Proje' },
  { value: 'diger', label: 'Diğer' },
];

interface SovereignRegisterProps {
  nodeId: SovereignNodeId;
  basePath?: string;
  redirectPath?: string;
}

export default function SovereignRegister({ nodeId, basePath, redirectPath }: SovereignRegisterProps) {
  const router = useRouter();
  const theme = getNodeTheme(nodeId);
  const { loginWithGoogle, registerMember } = useSovereignAuth(nodeId);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    profession: 'diger',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'verify'>('form');

  const base = basePath || `/sites/${theme.name.toLowerCase()}`;
  const redirect = redirectPath || `${base}/yonetim`;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return;
    setIsProcessing(true);
    setError(null);

    const result = await registerMember(formData);
    if (result.success) {
      setStep('verify');
    } else {
      setError(result.error || 'Kayıt başarısız.');
    }
    setIsProcessing(false);
  };

  const handleGoogleRegister = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await loginWithGoogle();
      router.push(redirect);
    } catch {
      setError('Google ile kayıt yapılamadı. Lütfen tekrar deneyin.');
      setIsProcessing(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Verify Email Step
  if (step === 'verify') {
    return (
      <SovereignAuthWrapper nodeId={nodeId} title="E-postanızı Doğrulayın" subtitle="Kayıt başarılı! Doğrulama linki gönderildi.">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center" style={{ background: `${theme.accent}15` }}>
            <Mail className="w-10 h-10" style={{ color: theme.accent }} />
          </div>
          <div>
            <p className="text-zinc-700 text-sm leading-relaxed">
              <strong>{formData.email}</strong> adresine doğrulama linki gönderdik.
            </p>
            <p className="text-zinc-500 text-xs mt-2">
              E-postanızdaki linke tıklayarak hesabınızı aktifleştirin ve <strong>5 ücretsiz tasarım hakkı</strong> kazanın!
            </p>
          </div>
          <button
            onClick={() => router.push(`${base}/login`)}
            className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all"
            style={{ background: theme.accent }}
          >
            Giriş Yap
          </button>
        </div>
      </SovereignAuthWrapper>
    );
  }

  return (
    <SovereignAuthWrapper nodeId={nodeId} title="Ücretsiz Kayıt" subtitle={`${theme.name} ailesine katılın. Tek hesap, tüm AIPyram ekosistemi.`}>
      
      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-600 text-sm text-center rounded-xl">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Google — BİRİNCİL */}
        <button 
          type="button" 
          disabled={isProcessing}
          onClick={handleGoogleRegister}
          className="w-full py-4 rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-3 active:scale-[0.98] hover:shadow-lg disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})` }}
        >
          <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity="0.8"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" opacity="0.6"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity="0.9"/>
            </svg>
          </div>
          Google İle Anında Kayıt Ol
        </button>

        {/* Divider */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200" /></div>
          <div className="relative flex justify-center text-[10px] uppercase font-semibold tracking-[0.15em]">
            <span className="bg-white px-4 text-zinc-400">veya e-posta ile</span>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-3.5">
          {/* Name */}
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Adınız Soyadınız" required
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-12 pr-4 text-zinc-900 outline-none transition-all placeholder:text-zinc-400 text-sm"
              onFocus={(e) => { e.target.style.borderColor = theme.accent; e.target.style.boxShadow = `0 0 0 3px ${theme.accentRing}`; }}
              onBlur={(e) => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Email */}
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="email" value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="E-posta adresiniz" required
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-12 pr-4 text-zinc-900 outline-none transition-all placeholder:text-zinc-400 text-sm"
              onFocus={(e) => { e.target.style.borderColor = theme.accent; e.target.style.boxShadow = `0 0 0 3px ${theme.accentRing}`; }}
              onBlur={(e) => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type={showPassword ? 'text' : 'password'} value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="Şifre (en az 6 karakter)" required minLength={6}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-12 pr-12 text-zinc-900 outline-none transition-all placeholder:text-zinc-400 text-sm"
              onFocus={(e) => { e.target.style.borderColor = theme.accent; e.target.style.boxShadow = `0 0 0 3px ${theme.accentRing}`; }}
              onBlur={(e) => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Company */}
          <div className="relative group">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" value={formData.company}
              onChange={(e) => updateField('company', e.target.value)}
              placeholder="Firma adı (opsiyonel)"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-12 pr-4 text-zinc-900 outline-none transition-all placeholder:text-zinc-400 text-sm"
              onFocus={(e) => { e.target.style.borderColor = theme.accent; e.target.style.boxShadow = `0 0 0 3px ${theme.accentRing}`; }}
              onBlur={(e) => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Profession */}
          <div className="relative group">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <select
              value={formData.profession}
              onChange={(e) => updateField('profession', e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-12 pr-4 text-zinc-900 outline-none transition-all text-sm appearance-none cursor-pointer"
              onFocus={(e) => { e.target.style.borderColor = theme.accent; e.target.style.boxShadow = `0 0 0 3px ${theme.accentRing}`; }}
              onBlur={(e) => { e.target.style.borderColor = '#e4e4e7'; e.target.style.boxShadow = 'none'; }}
            >
              {PROFESSION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button 
            disabled={isProcessing}
            type="submit" 
            className="w-full text-white py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 mt-2"
            style={{ background: theme.accent, boxShadow: `0 10px 25px ${theme.accentRing}` }}
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Hesap Oluştur'}
          </button>

          {/* Login Link */}
          <div className="text-center pt-3 border-t border-zinc-100">
            <p className="text-zinc-500 text-sm">
              Zaten üye misiniz?{' '}
              <a href={`${base}/login`} className="font-semibold transition-colors" style={{ color: theme.accent }}>
                Giriş Yapın
              </a>
            </p>
          </div>
        </form>
      </div>
    </SovereignAuthWrapper>
  );
}
