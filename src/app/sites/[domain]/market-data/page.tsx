import React from 'react';
import type { Metadata } from 'next';
import { generateHreflang } from '@/lib/utils';

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const brandName = exactDomain.split('.')[0].toUpperCase();
  
  return {
    title: `${brandName} — Piyasa Verileri & Emtia Fiyatları`,
    description: `Gerçek zamanlı pamuk, iplik fiyatları ve global navlun endeksleri. B2B üretici ve toptancılar için tedarik zinciri istihbaratı.`,
    alternates: generateHreflang(exactDomain, '/market-data')
  };
}

export default async function MarketDataPage({ params, searchParams }: { params: Promise<{ domain: string }>, searchParams: Promise<{ lang?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const exactDomain = decodeURIComponent(resolvedParams.domain).split(":")[0];
  const lang = resolvedSearch?.lang || "tr";

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 
        Bu sayfa TRTex terminal vizyonuna göre Brutalist B2B stilinde inşa edilecektir.
        Faz 3'te crawler ajanların getirdiği ITMF, ICAC ve Drewry verileri buradaki
        grafiklere ve tablolara bağlanacaktır. 
      */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-24">
        
        {/* HEADER */}
        <div className="border-b border-white/10 pb-8 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            CANLI TERMİNAL
          </div>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight text-white mb-4">
            Piyasa <span className="text-emerald-400 font-bold">Verileri</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl">
            Hammadde maliyetleri, navlun endeksleri ve tedarik zinciri sinyalleri. Üretim ve ithalat kararlarınızı verilere dayandırın.
          </p>
        </div>

        {/* BENTO GRID SKELETON */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* HAMMADDE PANELİ */}
          <div className="col-span-1 md:col-span-2 bg-[#0A0A0A] border border-white/5 p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            <h2 className="text-xs font-bold text-white/40 tracking-widest uppercase mb-8">Hammadde (ICAC & ITMF)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <div className="text-white/40 text-sm mb-1">Global Pamuk Endeksi</div>
                <div className="text-4xl font-light text-white mb-2">94.20 <span className="text-sm text-emerald-400">¢/lb</span></div>
                <div className="text-emerald-400 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  +1.2% (Aylık)
                </div>
              </div>
              <div>
                <div className="text-white/40 text-sm mb-1">Polyester (Çin Spot)</div>
                <div className="text-4xl font-light text-white mb-2">$1,020 <span className="text-sm text-white/40">/ton</span></div>
                <div className="text-rose-400 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                  -0.8% (Haftalık)
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="h-32 w-full flex items-end gap-2 opacity-50">
                {/* Dummy Chart */}
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="flex-1 bg-white/10 hover:bg-emerald-500/30 transition-colors" style={{ height: `${30 + Math.random() * 70}%` }}></div>
                ))}
              </div>
            </div>
          </div>

          {/* LOJİSTİK PANELİ */}
          <div className="col-span-1 bg-[#0A0A0A] border border-white/5 p-8 relative overflow-hidden group">
            <h2 className="text-xs font-bold text-white/40 tracking-widest uppercase mb-8">Navlun (Drewry WCI)</h2>
            <div className="text-white/40 text-sm mb-1">Shanghai - Rotterdam (40ft)</div>
            <div className="text-5xl font-light text-white mb-4">$3,450</div>
            <div className="text-amber-400 text-sm flex items-center gap-1 mb-8">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Sıkışıklık Sinyali (Kızıldeniz)
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Yıllık Ortalama:</span>
                <span className="text-white">$2,800</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Avrupa İthalat Avantajı:</span>
                <span className="text-emerald-400">TÜRKİYE (+%15)</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
