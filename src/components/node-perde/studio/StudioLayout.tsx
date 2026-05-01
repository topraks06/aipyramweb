'use client';

import React, { useState } from 'react';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';
import { useRouter } from 'next/navigation';
import { Layers, Image as ImageIcon, Box, Compass, Sparkles, LogOut, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const { user, isLicensed, loading, logout } = usePerdeAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('img2img');

  // Auth Guard
  if (!loading && !user) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="w-full h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <Sparkles className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <span className="text-zinc-400 font-medium tracking-widest text-sm uppercase">Sovereign Auth Doğrulanıyor...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            Sıfır Menü <span className="font-light">Studio</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Otonom Tasarım Merkezi</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('img2img')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'img2img' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
          >
            <div className="flex items-center gap-3">
              <ImageIcon className="w-4 h-4" />
              <span>Img2Img Motoru</span>
            </div>
            {activeTab === 'img2img' && <ChevronRight className="w-4 h-4" />}
          </button>
          
          <button 
            onClick={() => setActiveTab('room')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'room' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
          >
            <div className="flex items-center gap-3">
              <Box className="w-4 h-4" />
              <span>Mekan Tasarımı</span>
            </div>
            {activeTab === 'room' && <ChevronRight className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => setActiveTab('discover')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'discover' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
          >
            <div className="flex items-center gap-3">
              <Compass className="w-4 h-4" />
              <span>Stil Keşfi</span>
            </div>
            {activeTab === 'discover' && <ChevronRight className="w-4 h-4" />}
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="bg-black/50 border border-white/5 rounded-xl p-3 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.displayName || 'Kullanıcı'}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
            <button 
              onClick={async () => {
                await logout();
                toast.success('Çıkış yapıldı');
                router.push('/');
              }}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-black relative flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center px-6 bg-zinc-900/50 backdrop-blur-md z-10">
          <h2 className="text-lg font-medium text-white tracking-tight">
            {activeTab === 'img2img' && 'Kumaş Giydirme (Img2Img)'}
            {activeTab === 'room' && 'Otonom Mekan Tasarımı'}
            {activeTab === 'discover' && 'Trendler ve İlham'}
          </h2>
          
          <div className="ml-auto flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${isLicensed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {isLicensed ? 'LİSANS AKTİF' : 'DEMO MODU'}
            </span>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* We use React Context or cloneElement to pass activeTab to children if needed, 
              but since we wrap children, the children component itself will decide what to render based on URL or state.
              For simplicity, we inject the state down. */}
          {React.isValidElement(children) ? React.cloneElement(children as React.ReactElement, { activeTab }) : children}
        </div>
      </main>

    </div>
  );
}
