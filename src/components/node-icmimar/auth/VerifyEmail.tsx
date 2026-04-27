'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import AuthWrapper from './AuthWrapper';

export default function VerifyEmail() {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const currentUser = auth.currentUser;

  useEffect(() => {
    // If no user, send back to login
    if (!currentUser) {
      router.push('/sites/icmimar.ai/login');
      return;
    }

    // Polling to check if email is verified
    const checkVerification = setInterval(async () => {
      try {
        await currentUser.reload();
        if (currentUser.emailVerified) {
          clearInterval(checkVerification);
          router.push('/sites/icmimar.ai/studio'); // Auto-redirect when verified
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000);

    return () => clearInterval(checkVerification);
  }, [currentUser, router]);

  // Handle cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (!currentUser || cooldown > 0) return;
    
    try {
      setIsResending(true);
      setError(null);
      await sendEmailVerification(currentUser);
      setSuccessMsg("Doğrulama linki yeniden gönderildi.");
      setCooldown(60); // 60 seconds cooldown
    } catch (err: any) {
      setError(err.message || "Gönderim başarısız oldu. Lütfen bekleyip tekrar deneyin.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthWrapper
      title="E-POSTANIZI DOĞRULAYIN"
      subtitle="Güvenliğiniz için kayıtlı e-posta adresinizi onaylamanız gerekmektedir."
      
      
      
    >
      <div className="flex flex-col items-center justify-center space-y-8 py-8 text-center">
        
        {/* Animated Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#8B7355]/20 animate-ping rounded-full"></div>
          <div className="relative bg-zinc-900 border border-zinc-800 w-24 h-24 rounded-full flex items-center justify-center">
            <Mail className="w-10 h-10 text-[#8B7355]" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-serif text-white">Lütfen Gelen Kutusunu Kontrol Edin</h3>
          <p className="text-sm font-light text-zinc-400 max-w-md mx-auto leading-relaxed">
            <strong className="text-white font-mono">{currentUser?.email}</strong> adresine bir doğrulama bağlantısı gönderdik. 
            Devam etmek için e-postadaki <span className="text-[#8B7355]">linke tıklamanız</span> yeterlidir.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-950/50 border-l-4 border-l-red-500 p-4 flex items-start gap-3 w-full">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs font-mono text-red-200 text-left">{error}</p>
          </div>
        )}
        
        {successMsg && (
          <div className="bg-emerald-950/50 border-l-4 border-l-emerald-500 p-4 flex items-start gap-3 w-full">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-xs font-mono text-emerald-200 text-left">{successMsg}</p>
          </div>
        )}

        {/* Warning Alert */}
        <div className="w-full bg-zinc-900/50 border border-zinc-800 p-4 rounded-sm flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">E-Posta Ulaşmadı mı?</p>
            <p className="text-[11px] font-light text-zinc-500">Spam (Gereksiz) klasörünü kontrol etmeyi unutmayın.</p>
          </div>
        </div>

        {/* Resend Button */}
        <button
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
          className="w-full bg-white text-black font-bold uppercase tracking-widest text-[10px] py-4 px-6 flex items-center justify-center gap-3 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : cooldown > 0 ? (
            `TEKRAR GÖNDER (${cooldown}SN)`
          ) : (
            'DOĞRULAMA LİNKİNİ TEKRAR GÖNDER'
          )}
        </button>

      </div>
    </AuthWrapper>
  );
}
