'use client';

import React from 'react';

export default function AuthWrapper({ children, title, basePath = '/sites/perde.ai' }: { children: React.ReactNode, title: string, basePath?: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 selection:bg-blue-500/30 font-sans relative">
      <div className="w-full max-w-[380px] space-y-8 relative z-10">
        {/* Marka Odak NoktasÄ± */}
        <div className="text-center space-y-2">
          <h1 className="text-white text-xs font-black tracking-[0.6em] uppercase opacity-40 font-serif">PERDE.AI</h1>
          <h2 className="text-white text-2xl font-light tracking-tighter italic">{title}</h2>
        </div>
        
        {/* Form AlanÄ± */}
        <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl backdrop-blur-xl">
          {children}
        </div>

        {/* Minimalist Geri DÃ¶nÃ¼ÅŸ */}
        <div className="text-center">
          <a href={`${basePath}`} className="text-[10px] text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition font-bold">
            â† SÄ°STEME GERÄ° DÃ–N
          </a>
        </div>
      </div>
    </div>
  );
}
