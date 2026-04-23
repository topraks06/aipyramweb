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
    <div className="min-h-screen bg-[#000000] flex overflow-hidden font-sans text-zinc-300">
      
      {/* LEFT SIDEBAR: High-Density Navigation */}
      <aside className="w-[280px] border-r border-white/10 bg-[#030303] flex flex-col shrink-0 z-20">
        
        {/* Brand / Logo Area */}
        <div className="h-14 border-b border-white/10 flex items-center px-5 shrink-0 bg-black">
          <div className="flex items-center gap-3 w-full">
            <div className="w-6 h-6 bg-white text-black font-black flex items-center justify-center text-[10px] tracking-tighter">OS</div>
            <div className="flex-1">
              <div className="text-[11px] font-black tracking-widest text-white leading-none">AIPYRAM</div>
              <div className="text-[8px] tracking-[0.2em] text-blue-500 font-mono mt-1">SOVEREIGN CORE</div>
            </div>
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 px-3 py-6 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* CATEGORY 1 */}
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold mb-3 px-3">Core OS</div>
            {[
              { name: 'Data Plane', path: '/admin', icon: '◱' },
              { name: 'Topology Map', path: '/admin/tenants', icon: '⚄' },
            ].map((item) => (
              <Link 
                key={item.name}
                href={item.path} 
                className="group flex items-center gap-3 px-3 py-2 text-[11px] uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all border-l-2 border-transparent hover:border-blue-500"
              >
                <span className="text-zinc-600 group-hover:text-blue-500 font-mono text-[14px] leading-none">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          {/* CATEGORY 2 */}
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold mb-3 px-3">Swarm Intelligence</div>
            {[
              { name: 'Agent Registry', path: '#', icon: '⚙' },
              { name: 'Knowledge Base', path: '#', icon: '⌬' },
              { name: 'Dead Letters', path: '#', icon: '⚠' },
            ].map((item) => (
              <Link 
                key={item.name}
                href={item.path} 
                className="group flex items-center gap-3 px-3 py-2 text-[11px] uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all border-l-2 border-transparent hover:border-emerald-500"
              >
                <span className="text-zinc-600 group-hover:text-emerald-500 font-mono text-[14px] leading-none">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          {/* CATEGORY 3 */}
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold mb-3 px-3">Finance & Security</div>
            {[
              { name: 'Economy Engine', path: '/admin/economy', icon: '⚡' },
              { name: 'Identity & Auth', path: '/admin/users', icon: '⚿' },
              { name: 'Media Archive', path: '/admin/media', icon: '◧' },
            ].map((item) => (
              <Link 
                key={item.name}
                href={item.path} 
                className="group flex items-center gap-3 px-3 py-2 text-[11px] uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all border-l-2 border-transparent hover:border-amber-500"
              >
                <span className="text-zinc-600 group-hover:text-amber-500 font-mono text-[14px] leading-none">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

        </nav>
        
        {/* User / Session Area */}
        <div className="p-4 border-t border-white/10 bg-black/50">
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest">Active Session</span>
              <span className="text-xs text-white truncate max-w-[150px]">{user.email}</span>
            </div>
            <button onClick={logout} className="text-[10px] uppercase text-red-500 hover:text-red-400 font-bold tracking-widest px-2 py-1 bg-red-500/10 rounded-sm">
              ÇIKIŞ
            </button>
          </div>
        </div>
      </aside>

      {/* CENTER: Data Plane & Topbar */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#000000]">
        
        {/* Global Command Bar (Header) */}
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#030303] z-10 shrink-0">
          
          {/* Node Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase text-zinc-600 tracking-widest">TARGET NODE:</span>
            <select className="bg-transparent border border-white/10 text-[11px] text-white uppercase tracking-widest p-1 focus:outline-none focus:border-blue-500">
              <option value="master">GLOBAL MASTER</option>
              <option value="perde">PERDE.AI</option>
              <option value="trtex">TRTEX.COM</option>
              <option value="hometex">HOMETEX.AI</option>
            </select>
          </div>

          {/* Omnibar / Command Palette */}
          <div className="flex-1 max-w-lg mx-8 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500">
              ⌘
            </div>
            <input 
              type="text" 
              placeholder="Komut veya veri ara (CMD+K)..." 
              className="w-full bg-[#0A0A0A] border border-white/10 hover:border-white/20 focus:border-blue-500/50 text-xs text-white px-8 py-1.5 focus:outline-none transition-colors placeholder:text-zinc-600 tracking-wide font-mono rounded-none"
            />
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <span className="bg-white/10 text-zinc-400 text-[9px] px-1.5 py-0.5 rounded-sm">CTRL+K</span>
            </div>
          </div>

          {/* System Status Indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-[10px] font-mono text-emerald-500 tracking-widest">12ms</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">ENCRYPTED</span>
          </div>

        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative p-6">
          {/* Subtle grid background for tech feel */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
