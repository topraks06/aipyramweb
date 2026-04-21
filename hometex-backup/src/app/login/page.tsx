
"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import Link from "next/link";

enum ModeEnum {
  LOGIN = "LOGIN",
  REGISTER = "REGISTER",
  RESET = "RESET",
}

function LoginPageContent() {
  const [mode, setMode] = useState<ModeEnum>(ModeEnum.LOGIN);
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSuccess = () => {
    const redirectTo = searchParams.get("redirect") || "/";
    router.replace(redirectTo);
  };

  const handleRegisterSuccess = () => {
    setMode(ModeEnum.LOGIN);
  };

  const switchMode = (newMode: ModeEnum) => {
    setMode(newMode);
  };

  const handleForgotPassword = () => {
    setMode(ModeEnum.RESET);
  };

  const handleResetSuccess = () => {
    setMode(ModeEnum.LOGIN);
  };

  const handleBackToForgot = () => {
    setMode(ModeEnum.LOGIN);
  };

  return (
    <div className="relative flex justify-center items-center min-h-[100vh] overflow-hidden bg-[#FAFAF8]">
      {/* Subtle background pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(rgba(30,58,95,0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Soft color blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(30,58,95,0.06), rgba(30,58,95,0))" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(184,146,42,0.08), rgba(184,146,42,0))" }}
      />

      {/* Back to home link */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-400 hover:text-[#1E3A5F] text-sm font-medium transition-colors"
        >
          <div className="w-7 h-7 border border-[#1E3A5F]/20 rounded-sm flex items-center justify-center bg-white">
            <span className="font-bold text-xs text-[#1E3A5F]" style={{ fontFamily: 'var(--font-playfair)' }}>H</span>
          </div>
          Hometex.ai
        </Link>
      </div>

      {mode === ModeEnum.LOGIN && (
        <LoginForm
          onSuccess={handleSuccess}
          onSwitchToRegister={() => switchMode(ModeEnum.REGISTER)}
          onForgotPassword={handleForgotPassword}
        />
      )}

      {mode === ModeEnum.REGISTER && (
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => switchMode(ModeEnum.LOGIN)}
        />
      )}

      {mode === ModeEnum.RESET && (
        <ResetPasswordForm
          onBack={handleBackToForgot}
          onSuccess={handleResetSuccess}
        />
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
