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
    <div className="w-full h-full">
      {children}
    </div>
  );
}
