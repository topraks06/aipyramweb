import React from 'react';
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

function getFallbackMarketData() {
  try {
    const fs = require('fs');
    const path = require('path');
    const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'site-brain.json'), 'utf-8');
    const fallbackBrain = JSON.parse(raw);
    return fallbackBrain.market || {};
  } catch {
    return {
      "cotton_a_index": { price: 70.42, change_30d: "+9.03%", trend: "up" },
      "usd_try": { price: 34.00, change_30d: "FLAT", trend: "flat" }
    };
  }
}

export async function CommodityHeatmap() {
  const masterData = await getSiteBrainData();
  let marketData = masterData?.market || null;

  if (!marketData) {
    marketData = getFallbackMarketData();
  }

  // Convert market object into an array for the ticker
  const commodities = Object.keys(marketData)
    .filter(key => key !== 'ek_aciklama' && key !== 'textile_ex' && key !== 'note' && marketData[key]?.price !== undefined)
    .map(key => {
    const item = marketData[key];
    return {
      symbol: (item.name || key).substring(0, 10).toUpperCase().replace('_', '.'),
      price: item.price ? (typeof item.price === 'number' ? item.price.toFixed(2) : item.price) : 'N/A',
      change: item.change_30d || item.change || '0%',
      direction: item.trend === 'up' || item.trend === 'increasing' ? 'up' : 
                 item.trend === 'down' || item.trend === 'decreasing' ? 'down' : 'flat'
    };
  });

  // Duplicate for smooth seamless scrolling
  const tickerItems = [...commodities, ...commodities, ...commodities];

  if (commodities.length === 0) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          display: flex;
          animation: ticker 30s linear infinite;
        }
        .ticker-hover-pause:hover .animate-ticker {
          animation-play-state: paused;
        }
      `}} />
      
      <section className="bg-black text-white font-sans border-b border-neutral-800 break-inside-avoid overflow-hidden ticker-hover-pause">
        <div className="flex items-center w-full min-w-max">
          
          {/* Siyah Bant - Sabit Başlık */}
          <div className="bg-[#CC0000] text-white text-sm font-black uppercase tracking-widest px-4 py-2 shrink-0 z-10 flex items-center shadow-md">
             TRTEX INTEL //
          </div>

          {/* Kayan Yazı */}
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-ticker flex items-center shrink-0 w-max">
              {tickerItems.map((item, idx) => {
                const isUp = item.direction === 'up';
                const isDown = item.direction === 'down';
                const color = isUp ? 'text-green-500' : isDown ? 'text-red-500' : 'text-neutral-400';
                const arrow = isUp ? 'â–²' : isDown ? 'â–¼' : 'â–¬';
                
                return (
                  <div key={idx} className="flex items-center gap-3 px-6 border-r border-neutral-800 shrink-0">
                    <span className="text-sm font-bold text-white tracking-widest">{item.symbol}</span>
                    <span className="text-sm font-bold text-white">{item.price}</span>
                    <span className={`text-sm font-black tracking-tighter ${color}`}>
                      {arrow} {item.change}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
