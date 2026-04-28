"use client";
import HeimtexNavbar from "./HeimtexNavbar";
import HeimtexFooter from "./HeimtexFooter";
import { t } from "./heimtex-dictionary";
import { useState } from "react";

export default function HeimtexTrends({ 
  lang = 'en', 
  trends = [],
  basePath = '/sites/heimtex.ai'
}: { 
  lang?: string, 
  trends?: any[],
  basePath?: string
}) {
  const [activeSeason, setActiveSeason] = useState<string>('All');
  const seasons = ['All', 'Spring', 'Summer', 'Fall', 'Winter'];

  const filteredTrends = activeSeason === 'All' 
    ? trends 
    : trends.filter(t => t.season === activeSeason);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-500 selection:text-white">
      <HeimtexNavbar lang={lang} basePath={basePath} />
      
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-8">
        <header className="mb-16 border-b border-zinc-900 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="text-red-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block">Color & Texture</span>
            <h1 className="text-5xl md:text-7xl font-serif uppercase tracking-tighter mb-6 leading-none">
              {t('trends', lang) || 'Trends'}
            </h1>
            <p className="text-zinc-400 max-w-xl text-lg font-light">
              Pantone forecasts and material analysis for the upcoming collections.
            </p>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {seasons.map(season => (
              <button 
                key={season}
                onClick={() => setActiveSeason(season)}
                className={`px-4 py-2 text-xs tracking-widest uppercase font-mono transition-colors whitespace-nowrap ${
                  activeSeason === season 
                    ? 'bg-white text-black font-bold' 
                    : 'border border-zinc-800 text-zinc-500 hover:text-white'
                }`}
              >
                {season}
              </button>
            ))}
          </div>
        </header>

        {filteredTrends.length === 0 ? (
           <div className="text-zinc-600 font-mono text-center py-32 text-sm uppercase tracking-widest border border-zinc-900">
             No trends available for {activeSeason}.
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {filteredTrends.map((trend: any, i: number) => (
               <div key={trend.id || i} className="group cursor-pointer">
                  <div className="aspect-[3/4] overflow-hidden bg-zinc-900 relative mb-6">
                    {trend.imageUrl ? (
                      <img src={trend.imageUrl} alt={trend.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800" />
                    )}
                    <div className="absolute top-4 left-4 w-12 h-12 rounded-full border border-white/20" style={{ backgroundColor: trend.colorCode || '#8B7355' }} />
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 text-[8px] uppercase tracking-widest font-bold border border-white/10 text-white">
                      {trend.season || 'Upcoming'}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 tracking-widest mb-2 font-mono flex items-center justify-between">
                    <span>{trend.pantone || trend.colorCode || 'PANTONE 18-1033'}</span>
                  </div>
                  <h3 className="text-xl font-serif uppercase tracking-wide group-hover:text-red-500 transition-colors mb-2">{trend.title || 'Trend Report'}</h3>
                  <p className="text-zinc-400 text-sm font-light leading-relaxed line-clamp-2">
                    {trend.description || 'Color and texture analysis for home textiles.'}
                  </p>
               </div>
             ))}
          </div>
        )}
      </main>

      <HeimtexFooter basePath={basePath} />
    </div>
  );
}
