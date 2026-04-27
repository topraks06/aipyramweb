'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Building2, Store, Newspaper, LayoutDashboard, Share2, Rss, BrainCircuit, Cpu, Link as LinkIcon, Database, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Ecosystem() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-black min-h-screen text-white mt-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 border-b border-white/10 pb-12 pt-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
             <LinkIcon className="w-4 h-4 text-green-500" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">Harici Sistem API BaÄŸlantÄ±larÄ± Aktif</span>
          </div>
          <h1 className="font-bold text-4xl md:text-6xl mb-4 text-white uppercase tracking-tighter">
            AIPYRAM <span className="text-zinc-600">&</span> ALOHA<br/>ENTEGRASYONU
          </h1>
          <h2 className="text-xl md:text-2xl text-zinc-400 font-light mb-6 flex items-center gap-3">
             <Cpu className="w-6 h-6 text-blue-500" />
             İcmimar.ai "GÃ¶rsel Hizmet AjanÄ±" Durumu
          </h2>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest leading-loose">
            AIPYRAM (ANA MERKEZ BEYÄ°N) VE ALOHA (GENEL MÃœDÃœR) ÅU ANDA YAYINDA VE AKTÄ°FTÄ°R. TRTEX VE HOMETEX KENDÄ° OTONOM SÄ°STEMLERÄ°NDE Ã‡ALIÅIR. 
            ICMIMAR.AI Ä°SE BU DEVASA EKOSÄ°STEMÄ°N "GÃ–RSEL ÃœRETÄ°M AJANI"DIR. DIÅ SÄ°STEMLER, Ä°HTÄ°YAÃ‡ DUYDUKLARINDA ICMIMAR.AI API'SÄ°NE BAÄLANIR, GÃ–RSELLERÄ°NÄ° ÃœRETÄ°R VE Ã‡EKERLER.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* EXTERNAL NODE 1: TRTEX */}
        <Card className="bg-zinc-950 border-white/5 overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="h-1.5 bg-blue-600 w-full" />
          <CardHeader>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Newspaper className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 bg-green-500/10 text-green-400 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest border border-green-500/20">
                <CheckCircle2 className="w-3 h-3" /> YayÄ±nda
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight uppercase text-white">TRTEX</CardTitle>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mt-1 mb-4">Harici Haber PortalÄ±</p>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              TRTEX haber portalÄ± kendi otonom altyapÄ±sÄ±nda Ã§alÄ±ÅŸÄ±r. Bir haber kapaÄŸÄ±na veya editoryal gÃ¶rsele ihtiyaÃ§ duyduÄŸunda, İcmimar.ai ajanÄ±yla iletiÅŸime geÃ§ip gÃ¶rseli anÄ±nda teslim alÄ±r.
            </p>
          </CardHeader>
          <CardContent>
            <div className="w-full mt-4 bg-black border border-white/5 text-zinc-500 font-mono text-[10px] p-3 rounded-lg flex items-center justify-between">
               <span>API_ENDPOINT: /api/trtex-generate</span>
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        {/* EXTERNAL NODE 2: HOMETEX */}
        <Card className="bg-zinc-950 border-white/5 overflow-hidden group hover:border-purple-500/50 transition-colors">
          <div className="h-1.5 bg-purple-600 w-full" />
          <CardHeader>
             <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 bg-green-500/10 text-green-400 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest border border-green-500/20">
                <CheckCircle2 className="w-3 h-3" /> YayÄ±nda
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight uppercase text-white">HOMETEX</CardTitle>
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-500 mt-1 mb-4">Harici Sanal Fuar</p>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Sanal fuar stantlarÄ± ve sergi alanlarÄ±. Hometex sistemi yeni bir 3D stant render'Ä±na ihtiyaÃ§ duyduÄŸunda, İcmimar.ai ajanÄ±nÄ± tetikleyerek veriyi kendi platformuna Ã§eker.
            </p>
          </CardHeader>
          <CardContent>
             <div className="w-full mt-4 bg-black border border-white/5 text-zinc-500 font-mono text-[10px] p-3 rounded-lg flex items-center justify-between">
               <span>API_ENDPOINT: /api/hometex-render</span>
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        {/* LOCAL NODE: ICMIMAR.AI */}
        <Card className="bg-zinc-950 border-white/5 overflow-hidden group hover:border-[#8B7355]/50 transition-colors relative">
          <div className="absolute top-4 right-4 animate-pulse">
             <span className="flex h-3 w-3 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B7355] opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-[#8B7355]"></span>
             </span>
          </div>
          <div className="h-1.5 bg-[#8B7355] w-full" />
          <CardHeader>
            <div className="w-12 h-12 bg-[#8B7355]/10 rounded-2xl flex items-center justify-center mb-6 text-[#8B7355] group-hover:scale-110 transition-transform">
              <Store className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight uppercase text-white">ICMIMAR.AI</CardTitle>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B7355] mt-1 mb-4">GÃ¶rsel Ä°ÅŸleme AjanÄ± (API)</p>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              GeÃ§erli sistem. Hem bayilerin kendi perdelerini simÃ¼le etmesini saÄŸlar (Room Visualizer), hem de arka planda TRTEX ve HOMETEX'in tÃ¼m gÃ¶rsel API sorgularÄ±na yanÄ±t Ã¼retir.
            </p>
          </CardHeader>
          <CardContent>
             <button 
               onClick={() => router.push('/visualizer')}
               className="w-full mt-4 bg-[#8B7355]/10 hover:bg-[#8B7355]/20 text-[#8B7355] border border-[#8B7355]/30 font-bold uppercase tracking-widest text-[10px] py-3 rounded-lg transition-colors"
            >
               TASARIM MOTORUNU TEST ET
            </button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
