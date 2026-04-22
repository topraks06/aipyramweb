import React from 'react';
import { Ship, Factory, Droplets } from 'lucide-react';
import { unstable_cache } from 'next/cache';

const getSiteBrainData = unstable_cache(
  async () => {
    try {
      const brainUrl = process.env.AIPYRAM_SITE_BRAIN_URL || 'http://localhost:4000/api/site-brain';
      const res = await fetch(brainUrl, {
        headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET || 'TRTEX_WEBHOOK_SECRET'}` },
        next: { tags: ['aipyram_brain'] }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.data || data;
    } catch (err) {
      return null;
    }
  },
  ['site_brain_cache_v5'],
  { tags: ['aipyram_brain', 'homepage'] }
);

function getFallbackSupplyData() {
  try {
    const fs = require('fs');
    const path = require('path');
    const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'site-brain.json'), 'utf-8');
    const fallbackBrain = JSON.parse(raw);
    return fallbackBrain;
  } catch {
    return null;
  }
}

export async function SupplyChainMonitor() {
  let masterData = await getSiteBrainData();

  if (!masterData || !masterData.market) {
    masterData = getFallbackSupplyData();
  }

  if (!masterData) return null;

  // Çin Üretim Kapasitesi için (Factory) -> factory_load, cn_utilization, vs.
  const cnFactory = masterData.market?.cn_factory || masterData.market?.factory_load || { price: 82.4, change_30d: "-2.1%", trend: "down" };
  // Lojistik Navlun (SCFI)
  const freight = masterData.market?.shanghai_freight || masterData.market?.freight_index || { price: 1942.50, change_30d: "+12.4%", trend: "up" };
  // Hammadde (PTA/MEG)
  const pta = masterData.market?.pta_meg || masterData.market?.pet_ice || { price: 5840, change_30d: "+3.8%", trend: "up" };

  const formatPrice = (val: any) => typeof val === 'number' ? val.toLocaleString() : val;
  const isUp = (trend: string) => trend === 'up' || trend === 'increasing';

  return (
    <section className="bg-white border-b border-neutral-200 py-6 font-sans">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1600px]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black tracking-widest uppercase text-neutral-900">KÜRESEL LOJİSTİK & TEDARİK ZİNCİRİ MOTORU</h2>
          </div>
          <span className="text-sm md:text-sm font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 animate-pulse">
            AİPYRAM CANLI
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-neutral-200 bg-neutral-50/50">
          
          {/* Freight Index */}
          <div className="p-5 md:border-r border-b md:border-b-0 border-neutral-200 relative group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-neutral-600">
                <Ship size={14} />
                <span className="text-sm font-bold tracking-widest uppercase">ÅANGHAY NAVLUN ENDEKSİ (SCFI)</span>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-tx-title font-black text-neutral-900 leading-none">{formatPrice(freight.price)}</span>
              <span className={`text-sm md:text-sm font-bold flex items-center gap-1 ${isUp(freight.trend) ? 'text-red-600' : 'text-emerald-600'}`}>
                {isUp(freight.trend) ? 'â–²' : 'â–¼'} {freight.change_30d || freight.change}
              </span>
            </div>
            <div className="mb-3">
              <span className={`text-[var(--tx-mono)] font-bold tracking-widest uppercase px-2 py-1 flex items-center gap-2 w-max ${
                isUp(freight.trend) ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                ACTION: {isUp(freight.trend) ? 'MALİYET ARTIYOR (BEKLE)' : 'NAVLUN DÜÅÜYOR (YÜKLE)'}
              </span>
            </div>
            <p className="text-sm text-neutral-500 font-mono leading-relaxed group-hover:text-black transition-colors">
              {masterData.cause_engine?.correlations?.find((c: any) => c.cause.toLowerCase().includes('navlun'))?.reason || 
               "Kızıldeniz krizinin uzaması, Çin-Avrupa hattında operasyonel maliyetleri ve navlun artışlarını tetikliyor."}
            </p>
          </div>

          {/* China Production Load */}
          <div className="p-5 md:border-r border-b md:border-b-0 border-neutral-200 relative group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-neutral-600">
                <Factory size={14} />
                <span className="text-sm font-bold tracking-widest uppercase">ÇİN KAPASİTE ENDEKSİ</span>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-tx-title font-black text-neutral-900 leading-none">{formatPrice(cnFactory.price)}%</span>
              <span className={`text-sm md:text-sm font-bold flex items-center gap-1 ${isUp(cnFactory.trend) ? 'text-emerald-600' : 'text-red-600'}`}>
                {isUp(cnFactory.trend) ? 'â–²' : 'â–¼'} {cnFactory.change_30d || cnFactory.change}
              </span>
            </div>
            <div className="mb-3">
              <span className={`text-[var(--tx-mono)] font-bold tracking-widest uppercase px-2 py-1 flex items-center gap-2 w-max ${
                !isUp(cnFactory.trend) ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                ACTION: {!isUp(cnFactory.trend) ? 'ALIMI HIZLANDIR' : 'KAPASİTEYİ KIS'}
              </span>
            </div>
            {/* Progress Bar representation */}
            <div className="w-full bg-neutral-200 h-1.5 mb-2 overflow-hidden rounded-sm">
              <div className={`h-1.5 ${!isUp(cnFactory.trend) ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${parseFloat(cnFactory.price)}%` }}></div>
            </div>
            <p className="text-sm text-neutral-500 font-mono mt-2 group-hover:text-black transition-colors">
              {masterData.cause_engine?.correlations?.find((c: any) => c.cause.toLowerCase().includes('kapasite'))?.reason || 
               "İç pazar durgunluÄŸu sebebiyle Zhejiang bölgesindeki kapasite kullanımı düşük. Yüksek kapasiteye sahip TR dokumacılar boşluÄŸu doldurabilir."}
            </p>
          </div>

          {/* Energy / Chemicals */}
          <div className="p-5 relative group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-neutral-600">
                <Droplets size={14} />
                <span className="text-sm font-bold tracking-widest uppercase">TEMEL HAMMADDE (PES/MEG)</span>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-3">
               <div className="flex items-baseline gap-1">
                <span className="text-tx-title font-black text-neutral-900 leading-none">{formatPrice(pta.price)}</span>
                <span className="text-sm md:text-sm text-neutral-500">/ton</span>
              </div>
              <span className={`text-sm md:text-sm font-bold flex items-center gap-1 ${isUp(pta.trend) ? 'text-red-600' : 'text-emerald-600'}`}>
                {isUp(pta.trend) ? 'â–²' : 'â–¼'} {pta.change_30d || pta.change}
              </span>
            </div>
             <div className="mb-3">
              <span className={`text-[var(--tx-mono)] font-bold tracking-widest uppercase px-2 py-1 flex items-center gap-2 w-max ${
                isUp(pta.trend) ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                ACTION: {isUp(pta.trend) ? 'RİSK - STOKLA' : 'FIRSAT - ALIMI ERTELE'}
              </span>
            </div>
            <p className="text-sm text-neutral-500 font-mono leading-relaxed group-hover:text-black transition-colors">
              {masterData.market_health?.note || "Hammadde fiyatlarındaki dalgalanma sentetik elyaf ve PES tabanlı perde üretim maliyetlerini etkiliyor. Sabit fiyatlı kontratlara dikkat."}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
