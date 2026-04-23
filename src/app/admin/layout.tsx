'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AipyramAuthProvider';
import { ShieldAlert, Fingerprint } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, loginWithGoogle, loginWithEmail } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMsg('');
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Giriş Başarısız');
      setIsLoggingIn(false);
    }
  };

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
            Bu alana sadece sistem yöneticileri (Aipyram CEO) erişebilir. Sovereign Ağ Yönetimine geçmek için yetkinizi doğrulayın.
          </p>
          
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <input 
              type="email" 
              placeholder="Admin Email" 
              className="w-full bg-black border border-white/10 p-3 text-xs text-white uppercase tracking-widest"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Şifre" 
              className="w-full bg-black border border-white/10 p-3 text-xs text-white tracking-widest"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errorMsg && <div className="text-red-500 text-[10px]">{errorMsg}</div>}
            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-blue-500 transition-colors"
            >
              {isLoggingIn ? "BAĞLANILIYOR..." : "E-POSTA İLE BAĞLAN"}
            </button>
          </form>

          <div className="relative border-b border-white/10 mb-6">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-950 px-2 text-[10px] text-zinc-600">VEYA</span>
          </div>

          <button 
            onClick={loginWithGoogle}
            className="w-full bg-white text-black py-4 text-xs font-bold uppercase tracking-[0.2em] rounded hover:bg-zinc-200 transition-colors"
          >
            GOOGLE İLE BAĞLAN
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
    <div className="min-h-screen bg-[#050505] flex overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR: Navigasyon Menüsü */}
      <aside className="w-64 border-r border-white/5 bg-black/80 hidden md:flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white flex items-center justify-center text-black font-bold text-[10px]">P</div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-white">MASTER OS</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold mb-4 px-2">Kokpit Ağları</div>
          {[
            { name: 'Sistem Durumu', path: '/admin' },
            { name: 'Sovereign Nodes', path: '/admin/tenants' },
            { name: 'Ekonomi Motoru', path: '/admin/economy' },
            { name: 'Kullanıcılar', path: '/admin/users' },
            { name: 'Medya Arşivi', path: '/admin/media' },
          ].map((item) => (
            <Link 
              key={item.name}
              href={item.path} 
              className="flex items-center gap-3 px-3 py-2 text-[11px] uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest text-zinc-500">Node Sağlam</span>
          </div>
        </div>
      </aside>

      {/* CENTER: Main Content & Header */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#050505]">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/50 backdrop-blur z-10 shrink-0">
          <h2 className="text-xs font-mono tracking-widest text-zinc-300">Terminal &gt; Genel Bakış</h2>
          <div className="text-[10px] uppercase font-mono text-blue-500/70 tracking-widest">ENCRYPTED : ACTIVE</div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
