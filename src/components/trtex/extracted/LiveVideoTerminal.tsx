import React from 'react';
import { unstable_cache } from 'next/cache';
import { getTranslations } from 'next-intl/server';

const getSiteBrainData = unstable_cache(
  async () => {
    try {
      // Local TRTEX endpoint'ini zorla ki .env.local'daki derme çatma proxy ile list fetch atmasın
      const brainUrl = process.env.AIPYRAM_SITE_BRAIN_URL || 'https://aipyram-web-675060322886.europe-west1.run.app/api/site-brain';
      const res = await fetch(brainUrl, {
        headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET || 'TRTEX_WEBHOOK_SECRET'}` },
        next: { tags: ['aipyram_brain'] }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.data || data;
    } catch (err) {
      console.error('LIVE VIDEO TERMINAL SERVER CACHE FETCH ERROR:', err);
      return null;
    }
  },
  ['site_brain_cache_v6'],
  { tags: ['aipyram_brain'], revalidate: 60 }
);

export async function LiveVideoTerminal() {
  const t = await getTranslations('insight');
  const masterData = await getSiteBrainData();
  
  if (!masterData) return null;

  const briefing = masterData.daily_insight || {
    headline: "Yükleniyor...",
    summary: "AIPYRAM sunucularına bağlanılıyor, lütfen bekleyin.",
  };

  // Fallback for right side cards
  let rightCards = [];
  if (masterData.market_insights?.cards) {
    rightCards = masterData.market_insights.cards.slice(0, 3);
  } else if (masterData.cause_engine?.correlations) {
    rightCards = masterData.cause_engine.correlations.slice(0, 3).map((c: any) => ({
      category: "İÇGÖRÜ",
      headline: c.cause,
      summary: c.reason || c.effect
    }));
  }

  return (
    <section className="bg-[#EAE7E0] text-black border-b-2 border-black font-sans">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1600px] py-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-black divide-y lg:divide-y-0 lg:divide-x divide-black bg-white">
          
          {/* Main Reading Area (AI Prompter) */}
          <div className="lg:col-span-8 p-1">
            <div className="relative h-full min-h-[380px] w-full bg-white border border-black p-6 md:p-10 flex flex-col justify-end overflow-hidden group">
              {/* Background Terminal Effect (Light Mode) */}
              <div className="absolute inset-0 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-700" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
              
              {/* Live Text Badge */}
              <div className="absolute top-6 left-6 text-red-600 text-sm md:text-sm font-bold uppercase tracking-widest flex items-center gap-2 z-20">
                <span className="flex items-center justify-center w-2 h-2">
                  <span className="absolute w-2 h-2 bg-red-600 animate-ping opacity-75"></span>
                  <span className="relative w-1.5 h-1.5 bg-red-500"></span>
                </span>
                {t('daily_briefing')}
              </div>
              
              {/* Briefing Content */}
              <div className="relative z-10 mt-12">
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-black leading-[1.1] mb-6 tracking-tight">
                  {briefing.headline}
                </h3>
                <p className="text-base md:text-lg lg:text-xl font-mono text-neutral-800 max-w-4xl leading-relaxed font-semibold">
                  {briefing.summary}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-8 font-mono text-sm md:text-sm text-neutral-600 uppercase tracking-widest border-t border-black pt-4">
                  <span className="flex items-center gap-2"><span className="w-1 h-1 bg-black"></span> {t('source_nexus')}</span>
                  <span className="hidden md:inline">|</span>
                  <span className="flex items-center gap-2"><span className="w-1 h-1 bg-black"></span> Etki: {briefing.opportunity_level || 'Yüksek'}</span>
                  <span className="hidden md:inline">|</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-2"><span className="w-1 h-1 bg-emerald-600"></span> {t('est_read_time')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action/Decision Feed */}
          <div className="lg:col-span-4 flex flex-col bg-white">
            <div className="p-4 bg-[#FDFBF7] border-b border-black flex items-center justify-between">
              <span className="text-sm md:text-sm font-bold tracking-widest uppercase text-black">{t('executive_summary')}</span>
              <span className="text-sm md:text-sm font-mono text-neutral-500">Reuters / Veri</span>
            </div>
            
            <div className="flex flex-col h-full divide-y divide-[#EAE7E0]">
              {rightCards.map((card: any, idx: number) => {
                const colors = [
                  { text: 'text-blue-600', bg: 'bg-blue-600', label: t('major_event') },
                  { text: 'text-amber-600', bg: 'bg-amber-600', label: t('one_risk') },
                  { text: 'text-emerald-600', bg: 'bg-emerald-600', label: t('one_opportunity') }
                ];
                const theme = colors[idx] || colors[0];

                return (
                  <div key={idx} className="p-5 flex-1 flex flex-col justify-center hover:bg-neutral-50 transition-colors">
                    <span className={`text-sm md:text-sm font-mono uppercase tracking-widest mb-2 flex items-center gap-2 ${theme.text}`}>
                      <span className={`w-1 h-1 ${theme.bg}`}></span> {theme.label}
                    </span>
                    <h4 className="text-sm font-bold text-black leading-snug">
                      {card.headline}
                    </h4>
                  </div>
                );
              })}
              
              {/* Fallback padding if less than 3 cards */}
              {rightCards.length === 0 && (
                <div className="p-5 flex-1 flex items-center justify-center">
                  <span className="text-sm md:text-sm font-mono text-neutral-400">{t('scan_continuing')}</span>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
