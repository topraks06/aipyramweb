'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AipyramAuthProvider';
import { ShieldAlert, Fingerprint, Palette } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, isAdmin, loginWithGoogle, loginWithEmail, logout } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [radarData, setRadarData] = useState<any>(null);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchRadar = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const json = await res.json();
        if (json.success) setRadarData(json.data);
      } catch (err) {
        console.error('Radar data fetch failed', err);
      }
    };

    fetchRadar();
    const interval = setInterval(fetchRadar, 15000);
    return () => clearInterval(interval);
  }, [user, isAdmin]);

  const [targetNode, setTargetNode] = useState('master');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aloha_target_node');
      if (saved) setTargetNode(saved);
    }
  }, []);

  const handleNodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setTargetNode(val);
    if (typeof window !== 'undefined') localStorage.setItem('aloha_target_node', val);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMsg('');
    try {
      await loginWithEmail(email, password);
      router.push('/sites/perde/visualizer');
    } catch (err: any) {
      setErrorMsg(err.message || 'Giriş Başarısız');
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 animate-spin rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center">
          <Fingerprint className="w-12 h-12 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-2">MAĞAZA YÖNETİM PANELİ</h1>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Perde.ai işletme hesabınıza giriş yapın.
          </p>
          
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <input 
              type="email" 
              placeholder="Admin Email" 
              className="w-full bg-slate-50 border border-slate-200 p-3 text-sm text-slate-900 rounded-md focus:outline-none focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Şifre" 
              className="w-full bg-slate-50 border border-slate-200 p-3 text-sm text-slate-900 rounded-md focus:outline-none focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errorMsg && <div className="text-red-500 text-xs">{errorMsg}</div>}
            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-indigo-600 text-slate-900 py-3 text-sm font-semibold rounded-md hover:bg-indigo-700 transition-colors"
            >
              {isLoggingIn ? "BAĞLANILIYOR..." : "E-POSTA İLE BAĞLAN"}
            </button>
          </form>

          <div className="relative border-b border-slate-200 mb-6">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-slate-400">VEYA</span>
          </div>

          <button 
            onClick={async () => {
              await loginWithGoogle();
              router.push('/sites/perde/visualizer');
            }}
            className="w-full bg-slate-100 text-slate-700 py-3 text-sm font-semibold rounded-md hover:bg-slate-200 transition-colors"
          >
            GOOGLE İLE BAĞLAN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-white overflow-hidden font-sans selection:bg-emerald-500/30">
      
      {/* SIDEBAR (Minimalist 4 Menü) */}
      <aside className="w-64 bg-black/50 border-r border-white/10 flex flex-col justify-between backdrop-blur-xl shrink-0 z-20">
         <div className="p-6">
            <div className="flex items-center gap-3 mb-10 text-emerald-500">
               <Fingerprint className="w-8 h-8" />
               <span className="text-xl font-bold tracking-widest uppercase">Perde.ai</span>
            </div>
            
            <nav className="space-y-2">
               <Link href="/sites/perde/visualizer" className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl text-sm font-bold text-black bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
                  <Palette className="w-5 h-5" />
                  TASARIM STÜDYOSU
               </Link>
               <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  ANA KOMUTA
               </Link>
               <Link href="/admin/projects" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                  PROJELER & SİPARİŞ
               </Link>
               <Link href="/admin/inventory" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  KUMAŞ DEPOSU
               </Link>
               <Link href="/admin/finance" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  FİNANS & TAHSİLAT
               </Link>
            </nav>
         </div>
         
         <div className="p-6 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center border border-emerald-500/30">
                  <span className="text-emerald-400 font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                  <p className="text-xs text-zinc-500">Mağaza Yöneticisi</p>
               </div>
            </div>
            <button onClick={logout} className="w-full py-2 text-xs font-semibold text-zinc-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors uppercase tracking-widest">
               Çıkış Yap
            </button>
         </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.05)_0%,transparent_50%)]">
        {children}
      </main>

    </div>
  );
}
