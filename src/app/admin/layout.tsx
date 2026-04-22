'use client';

import React from 'react';
import { useAuth } from '@/components/auth/AipyramAuthProvider';
import { ShieldAlert, Fingerprint } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, loginWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-white animate-spin rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-950 border border-white/10 p-8 rounded-2xl shadow-2xl text-center">
          <Fingerprint className="w-12 h-12 text-white/50 mx-auto mb-6" />
          <h1 className="text-xl font-display uppercase tracking-widest text-white mb-2">AIPYRAM MASTER KOKPİT</h1>
          <p className="text-xs text-zinc-500 mb-8 leading-relaxed">
            Bu alana sadece sistem yöneticileri (Aipyram CEO) erişebilir. Global ERP ve Tenant yönetim ağına geçmek için yetkinizi doğrulayın.
          </p>
          <button 
            onClick={loginWithGoogle}
            className="w-full bg-white text-black py-4 text-xs font-bold uppercase tracking-[0.2em] rounded hover:bg-zinc-200 transition-colors"
          >
            SİSTEME BAĞLAN
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 p-8 text-center max-w-sm">
          <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-red-500 font-bold uppercase tracking-widest mb-2">ERİŞİM REDDEDİLDİ</h2>
          <p className="text-xs text-red-400/70">Bu terminal sadece Kurucu Onaylı hesaplara açıktır.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar for Cockpit */}
      <nav className="border-b border-border/10 bg-black/50 backdrop-blur top-0 sticky z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-white flex items-center justify-center text-black font-bold font-display text-xs">P</div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-white/90">AIPYRAM GLOBAL ERP</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/admin/media" className="text-[10px] uppercase font-mono text-zinc-400 hover:text-white transition-colors tracking-widest flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              Görsel Arşiv
            </a>
            <div className="text-[10px] uppercase font-mono text-white/50 tracking-widest border-l border-zinc-800 pl-6">TENANT KONTROL AĞI</div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 md:p-12">
        {children}
      </main>
    </div>
  );
}
