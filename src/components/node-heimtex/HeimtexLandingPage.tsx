"use client";
import HeimtexNavbar from "./HeimtexNavbar";
import HeimtexFooter from "./HeimtexFooter";
import { t } from "./heimtex-dictionary";
import Link from 'next/link';
import { ArrowRight, ChevronRight, Play } from 'lucide-react';

export default function HeimtexLandingPage({ 
  lang = 'en', 
  trends = [], 
  articles = [],
  basePath = '/sites/heimtex.ai'
}: { 
  lang?: string, 
  trends?: any[], 
  articles?: any[],
  basePath?: string
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-500 selection:text-white">
      <HeimtexNavbar lang={lang} basePath={basePath} />
      
      <main className="pt-20">
        {/* HERO SECTION */}
        <section className="relative h-[85vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden border-b border-zinc-900">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950 z-10" />
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2000')] bg-cover bg-center" />
          
          <div className="relative z-20 max-w-5xl mx-auto">
            <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-xs mb-8 block">
              Global Trend & Fashion Hub
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black uppercase tracking-tighter leading-none mb-8">
              {t('the_future', lang) || "THE FUTURE OF TEXTILE DESIGN"}
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed mb-10">
              Discover the upcoming season's Pantone colors, texture trends, and the avant-garde of global home textiles.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href={`${basePath}/magazine`} className="bg-red-600 text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-red-500 transition-colors flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" /> Read Editorial
              </Link>
            </div>
          </div>
        </section>

        {/* TREND CARDS SECTION */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16 border-b border-zinc-900 pb-6">
            <h2 className="text-3xl font-serif uppercase tracking-wider">Pantone & Trends</h2>
            <Link href={`${basePath}/trends`} className="text-red-500 uppercase tracking-widest text-xs font-bold hover:text-white transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          {trends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {trends.slice(0, 3).map((trend, i) => (
                 <Link href={`${basePath}/trends/${trend.id || i}`} key={trend.id || i} className="group cursor-pointer block">
                   <div className="aspect-[3/4] overflow-hidden bg-zinc-900 relative mb-6">
                      {trend.imageUrl ? (
                        <img src={trend.imageUrl} alt={trend.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-zinc-800" />
                      )}
                      <div className="absolute top-4 left-4 w-12 h-12 rounded-full border border-white/20" style={{ backgroundColor: trend.colorCode || '#8B7355' }} />
                   </div>
                   <div className="text-xs text-zinc-500 tracking-widest mb-2 font-mono">{trend.pantone || trend.colorCode || 'PANTONE 18-1033'}</div>
                   <h3 className="text-xl font-serif uppercase tracking-wide group-hover:text-red-500 transition-colors">{trend.title || 'Trend Report'}</h3>
                 </Link>
               ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-zinc-900">
              <span className="text-zinc-600 text-sm tracking-widest uppercase font-mono">Future Trends Are Being Processed...</span>
            </div>
          )}
        </section>

        {/* MAGAZINE LATEST */}
        <section className="py-24 px-6 max-w-7xl mx-auto border-t border-zinc-900">
          <div className="flex justify-between items-end mb-16 pb-6 border-b border-zinc-900">
            <h2 className="text-3xl font-serif uppercase tracking-wider">Latest Editorials</h2>
            <Link href={`${basePath}/magazine`} className="text-zinc-500 uppercase tracking-widest text-xs font-bold hover:text-white transition-colors flex items-center gap-1">
              All Editorials <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {articles.slice(0, 4).map((article, i) => (
                 <Link href={`${basePath}/magazine/${article.id || article.slug || i}`} key={article.id || i} className="group flex flex-col sm:flex-row gap-6 items-start">
                   <div className="w-full sm:w-48 aspect-square overflow-hidden bg-zinc-900 shrink-0">
                      {article.image || article.imageUrl ? (
                        <img src={article.image || article.imageUrl} alt={article.title} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-zinc-800" />
                      )}
                   </div>
                   <div className="flex-1 py-2">
                     <span className="text-[10px] text-red-500 tracking-[0.2em] uppercase font-bold mb-3 block">{article.category || 'Editorial'}</span>
                     <h3 className="text-2xl font-serif uppercase tracking-tight group-hover:text-red-500 transition-colors mb-4 leading-tight">{article.title || 'Textile Article'}</h3>
                     <p className="text-zinc-500 text-sm font-light leading-relaxed line-clamp-2 mb-4">{article.lead || article.summary || 'Read the full editorial to discover more.'}</p>
                     <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-600">{article.date || 'Recently'}</span>
                   </div>
                 </Link>
               ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-zinc-900">
              <span className="text-zinc-600 text-sm tracking-widest uppercase font-mono">Editorial Content Loading...</span>
            </div>
          )}
        </section>

      </main>

      <HeimtexFooter basePath={basePath} />
    </div>
  );
}
