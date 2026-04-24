'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AipyramAuthProvider';
import { ShieldAlert, Fingerprint } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 animate-spin rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center">
          <Fingerprint className="w-12 h-12 text-slate-300 mx-auto mb-6" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-2">AIPYRAM MASTER KOKPİT</h1>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Bu alana sadece sistem yöneticileri (Aipyram CEO) erişebilir. Sovereign Ağ Yönetimine geçmek için yetkinizi doğrulayın.
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
            onClick={loginWithGoogle}
            className="w-full bg-slate-100 text-slate-700 py-3 text-sm font-semibold rounded-md hover:bg-slate-200 transition-colors"
          >
            GOOGLE İLE BAĞLAN
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 shadow-sm rounded-lg p-8 text-center max-w-sm">
          <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-red-600 font-bold text-lg mb-2">ERİŞİM REDDEDİLDİ</h2>
          <p className="text-sm text-slate-500">Bu terminal sadece Kurucu Onaylı hesaplara açıktır.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-600">
      
      {/* MERKEZ: Ana Arayüz */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        
        {/* Global Üst Bar */}
        <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white z-10 shrink-0 shadow-sm">
          
          {/* Ağ Seçici (Sovereign Node Switcher) */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hedef Ağ:</span>
            <select className="bg-white border border-slate-200 text-sm font-medium text-slate-700 py-1 px-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm cursor-pointer">
              <option value="master">GLOBAL MERKEZ</option>
              <option value="perde">PERDE DÜĞÜMÜ</option>
              <option value="trtex">TRTEX DÜĞÜMÜ</option>
              <option value="hometex">HOMETEX DÜĞÜMÜ</option>
              <option value="vorhang">VORHANG DÜĞÜMÜ</option>
            </select>
          </div>

          {/* Sistem Durum Göstergeleri */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
              <div className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${radarData?.apiLatency > 400 ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${radarData?.apiLatency > 400 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </div>
              <span className={`text-xs font-mono font-medium ${radarData?.apiLatency > 400 ? 'text-amber-600' : 'text-emerald-600'}`}>{radarData?.apiLatency || 12}ms</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ŞİFRELİ AĞ</span>
          </div>

        </header>

        {/* Ana İçerik Alanı (Buraya Sınırsız Chat Arayüzü Gelecek) */}
        <div className="flex-1 flex overflow-hidden">
          
          <main className="flex-1 relative overflow-hidden flex flex-col border-r border-slate-200 bg-white">
            {/* Subtle grid background for tech feel */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
            
            <div className="relative z-10 flex-1 h-full">
              {children}
            </div>
          </main>

          {/* SAĞ MENÜ: Sovereign HUD (Canlı Metrik Radarı) */}
          <aside className="w-[280px] bg-slate-50 flex flex-col shrink-0 z-20 overflow-y-auto custom-scrollbar border-l border-slate-200">
            
            {/* HUD Başlık */}
            <div className="px-5 py-3 border-b border-slate-200 bg-white">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">SİSTEM RADARI</span>
            </div>

            <div className="p-5 space-y-8">
              
              {/* Sistem Yükü */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bellek Yükü</span>
                  <span className={`text-xs font-bold ${radarData?.cpu > 300 ? 'text-amber-600' : 'text-emerald-600'}`}>{radarData?.cpu > 300 ? 'Yoğun' : 'Normal'}</span>
                </div>
                <div className="flex gap-1 h-10 items-end">
                  {[30, 45, 60, 35, 50, 65, 40, 55, 70, 45, 50, 38].map((val, i) => {
                    const h = val;
                    return (
                      <div key={i} className="flex-1 bg-slate-200 rounded-t-sm overflow-hidden flex items-end">
                        <div className={`w-full ${radarData?.cpu > 300 ? 'bg-amber-400' : 'bg-emerald-400'} transition-all duration-1000`} style={{ height: `${Math.min(100, h)}%` }} />
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between text-xs font-mono font-medium text-slate-500">
                  <span>Ping: {radarData?.apiLatency || 12}ms</span>
                  <span>RAM: {radarData?.cpu || 140} MB</span>
                </div>
              </div>

              {/* Ajan Sağlığı */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">Ajan Ekosistemi</span>
                
                {radarData?.agentHealth ? radarData.agentHealth.map((agent: any) => (
                  <div key={agent.id} className="bg-white border border-slate-200 p-3 rounded-md shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-${agent.color}-500 ${agent.status === 'AKTİF' || agent.status === 'İŞLİYOR' || agent.status === 'HATA YAKALANDI' ? 'animate-pulse' : ''}`} />
                      <span className="text-xs font-bold text-slate-700">{agent.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wide text-${agent.color}-600`}>{agent.status}</span>
                  </div>
                )) : (
                  <div className="text-xs font-medium text-slate-400">Veri Bekleniyor...</div>
                )}
              </div>

              {/* Canlı Kredi Burn */}
              <div className="space-y-2 bg-white border border-slate-200 p-4 rounded-md shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Kredi Tüketimi</span>
                <div className="text-2xl font-mono font-bold text-slate-900">${(radarData?.totalCreditsSpent || 0).toLocaleString('en-US')}<span className="text-sm text-slate-400">.00</span></div>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 mt-1">
                  <span>↑</span>
                  <span>Aktif API Havuzu</span>
                </div>
              </div>

              {/* Aktif Görevler (Mini Log) */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Kuyruktaki Görevler</span>
                <div className="space-y-2 text-xs font-medium text-slate-600">
                  {radarData?.activeTasks && radarData.activeTasks.length > 0 ? radarData.activeTasks.map((task: any, i: number) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className={`text-${task.color}-500 text-sm leading-none mt-0.5`}>{task.status === 'completed' ? '✔' : '●'}</span> 
                      <span>{task.task}</span>
                    </div>
                  )) : (
                     <div className="flex gap-2 items-center text-slate-400 italic"><span className="text-slate-300">-</span> <span>Sistem Boşta</span></div>
                  )}
                </div>
              </div>

            </div>

          </aside>
        </div>
      </div>

    </div>
  );
}
