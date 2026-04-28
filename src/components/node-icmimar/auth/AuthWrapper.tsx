'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthWrapper({ children, title, subtitle, basePath = '/sites/icmimar.ai' }: { children: React.ReactNode, title: string, subtitle?: string, basePath?: string }) {
  return (
    <div className="min-h-screen bg-[#F9F9F6] flex font-sans selection:bg-[#8B7355]/30 relative overflow-hidden">
      
      {/* SOL — Görsel Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center overflow-hidden">
        <img 
          src="/assets/icmimar.ai/icmimar.ai (13).jpg" 
          alt="İcmimar.ai Premium Interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        <div className="relative z-10 p-16 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-[1px] w-12 bg-white/40" />
            <span className="text-white/60 uppercase tracking-[0.4em] text-[9px] font-semibold">Tekstil İşletim Sistemi</span>
          </div>
          <h2 className="font-serif text-5xl text-white leading-[1.1] tracking-tight mb-6">
            Yapay Zeka ile <span className="italic text-white/80">Tasarımın</span> Geleceği
          </h2>
          <p className="text-white/50 text-sm font-light leading-relaxed">
            Oda fotoğrafınızı yükleyin, saniyeler içinde fotorealistik icmimar tasarımları alın. 
            B2B tedarik zinciri, kumaş stok yönetimi ve otonom sipariş takibi — tek platformda.
          </p>
        </div>
      </div>

      {/* SAĞ — Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        
        {/* Üst Logo */}
        <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
          <Link href={basePath} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">Ana Sayfa</span>
          </Link>
          <span className="font-serif text-lg tracking-tight text-zinc-900 font-medium">icmimar.ai</span>
        </div>

        <div className="w-full max-w-[420px] space-y-8">
          {/* Başlık */}
          <div className="text-center space-y-3">
            <h1 className="font-serif text-3xl md:text-4xl text-zinc-900 tracking-tight">{title}</h1>
            {subtitle && <p className="text-zinc-500 text-sm font-light">{subtitle}</p>}
          </div>
          
          {/* Form Alanı */}
          <div className="bg-white border border-zinc-200/80 p-8 md:p-10 rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.06)]">
            {children}
          </div>

          {/* Alt Bilgi */}
          <div className="text-center space-y-3">
            <p className="text-[10px] text-zinc-400 uppercase tracking-[0.15em]">
              İcmimar.ai — aipyram GmbH Ekosistemi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
