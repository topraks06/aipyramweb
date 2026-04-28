"use client";
import HeimtexNavbar from "./HeimtexNavbar";
import HeimtexFooter from "./HeimtexFooter";
import { t } from "./heimtex-dictionary";

export default function HeimtexLandingPage({ lang = 'en' }: { lang?: string }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-500 selection:text-white">
      <HeimtexNavbar lang={lang} />
      
      <main>
        {/* HERO SECTION */}
        <section className="relative h-[85vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950 z-10" />
          {/* A dark background pattern or image would go here */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2000')] bg-cover bg-center" />
          
          <div className="relative z-20 max-w-5xl mx-auto">
            <span className="text-red-600 font-bold tracking-[0.3em] uppercase text-xs mb-8 block">
              Global Trend & Fashion Hub
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black uppercase tracking-tighter leading-none mb-8">
              {t('the_future', lang)}
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
              Discover the upcoming season's Pantone colors, texture trends, and the avant-garde of global home textiles.
            </p>
          </div>
        </section>

        {/* TREND CARDS SECTION */}
        <section className="py-24 px-6 max-w-7xl mx-auto border-t border-zinc-900">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-3xl font-serif uppercase tracking-wider">Pantone & Trends</h2>
            <a href="/trends" className="text-red-500 uppercase tracking-widest text-xs font-bold hover:text-white transition-colors">
              View All Trends →
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {/* Mock trend cards for landing */}
             {[
               { title: "Earthy Textures", color: "#8B7355", hex: "PANTONE 18-1033", image: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=800" },
               { title: "Midnight Velvet", color: "#191970", hex: "PANTONE 19-3920", image: "https://images.unsplash.com/photo-1533504153096-3c58c2f1f211?w=800" },
               { title: "Crimson Silk", color: "#DC143C", hex: "PANTONE 19-1664", image: "https://images.unsplash.com/photo-1563820241088-bd27b87c714c?w=800" }
             ].map((trend, i) => (
               <div key={i} className="group cursor-pointer">
                 <div className="aspect-[3/4] overflow-hidden bg-zinc-900 relative mb-6">
                    <img src={trend.image} alt={trend.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-105" />
                    <div className="absolute top-4 left-4 w-12 h-12 rounded-full border border-white/20" style={{ backgroundColor: trend.color }} />
                 </div>
                 <div className="text-xs text-zinc-500 tracking-widest mb-2 font-mono">{trend.hex}</div>
                 <h3 className="text-xl font-serif uppercase tracking-wide group-hover:text-red-500 transition-colors">{trend.title}</h3>
               </div>
             ))}
          </div>
        </section>
      </main>

      <HeimtexFooter />
    </div>
  );
}
