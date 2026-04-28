"use client";
import HeimtexNavbar from "./HeimtexNavbar";
import HeimtexFooter from "./HeimtexFooter";
import { t } from "./heimtex-dictionary";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function HeimtexMagazine({ 
  lang = 'en', 
  articles = [],
  basePath = '/sites/heimtex.ai'
}: { 
  lang?: string, 
  articles?: any[],
  basePath?: string
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-500 selection:text-white">
      <HeimtexNavbar lang={lang} basePath={basePath} />
      
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-8">
        <header className="mb-16 border-b border-zinc-900 pb-8">
          <span className="text-red-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block">Heimtex Editorial</span>
          <h1 className="text-5xl md:text-7xl font-serif uppercase tracking-tighter mb-6 leading-none">
            {t('magazine', lang) || 'Magazine'}
          </h1>
          <p className="text-zinc-400 max-w-2xl text-lg font-light">
            In-depth analysis, interviews, and features from the global home textile industry.
          </p>
        </header>

        {articles.length === 0 ? (
           <div className="text-zinc-600 font-mono text-center py-32 text-sm uppercase tracking-widest border border-zinc-900">
             No articles published yet.
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
             {articles.map((article: any, i: number) => (
               <Link href={`${basePath}/magazine/${article.id || article.slug || i}`} key={article.id || i} className="group cursor-pointer flex flex-col">
                  <div className="aspect-[4/3] bg-zinc-900 overflow-hidden mb-6 relative">
                    {(article.image || article.imageUrl || article.images?.[0]) ? (
                      <img src={article.image || article.imageUrl || article.images?.[0]} alt={article.title} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                      {article.category || 'Editorial'}
                    </span>
                    <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">
                      {article.date || 'Recently'}
                    </span>
                  </div>
                  <h2 className="text-3xl font-serif leading-tight group-hover:text-red-500 transition-colors mb-4 uppercase tracking-tight">
                    {article.title || 'Untitled Article'}
                  </h2>
                  <p className="text-zinc-400 text-sm line-clamp-3 leading-relaxed font-light flex-1">
                    {article.lead || article.summary || 'Read the full editorial.'}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                    Read Story <ChevronRight className="w-4 h-4" />
                  </div>
               </Link>
             ))}
          </div>
        )}
      </main>

      <HeimtexFooter basePath={basePath} />
    </div>
  );
}
