"use client";
import HeimtexNavbar from "./HeimtexNavbar";
import HeimtexFooter from "./HeimtexFooter";
import { t } from "./heimtex-dictionary";

export default function HeimtexTrends({ lang = 'en' }: { lang?: string }) {
  const pantoneColors = [
    { code: 'PANTONE 18-1033', name: 'Earthy Textures', hex: '#8B7355', category: 'Spring/Summer 2026' },
    { code: 'PANTONE 19-3920', name: 'Midnight Velvet', hex: '#191970', category: 'Spring/Summer 2026' },
    { code: 'PANTONE 19-1664', name: 'Crimson Silk', hex: '#DC143C', category: 'Autumn/Winter 2026' },
    { code: 'PANTONE 14-0848', name: 'Mimosa Sheer', hex: '#F0C05A', category: 'Autumn/Winter 2026' },
    { code: 'PANTONE 16-1546', name: 'Living Coral', hex: '#FF6F61', category: 'Global Trend' },
    { code: 'PANTONE 19-4052', name: 'Classic Blue', hex: '#0F4C81', category: 'Global Trend' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <HeimtexNavbar lang={lang} />
      
      <main className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-6xl font-serif uppercase tracking-wider mb-6">
          {t('trends', lang)}
        </h1>
        <p className="text-zinc-400 text-lg mb-16 max-w-3xl leading-relaxed">
          The definitive guide to upcoming textile trends, seasonal palettes, and Pantone forecasts. Driven by global data and aesthetic intelligence.
        </p>

        <section className="mb-24">
           <h2 className="text-2xl font-serif uppercase border-b border-zinc-800 pb-4 mb-8">Pantone Forecast 2026</h2>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {pantoneColors.map((color, idx) => (
                <div key={idx} className="group">
                  <div className="aspect-square rounded-lg mb-4 shadow-xl transition-transform duration-500 group-hover:-translate-y-2" style={{ backgroundColor: color.hex }} />
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{color.category}</div>
                  <div className="text-sm font-bold tracking-wider mb-1">{color.code}</div>
                  <div className="text-sm text-zinc-400 font-serif">{color.name}</div>
                </div>
              ))}
           </div>
        </section>

        <section>
           <h2 className="text-2xl font-serif uppercase border-b border-zinc-800 pb-4 mb-8">Texture & Material Innovation</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-zinc-900 p-8 rounded-xl">
                 <div className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4">Macro Trend</div>
                 <h3 className="text-3xl font-serif mb-4">Sustainable Luxury</h3>
                 <p className="text-zinc-400 leading-relaxed">
                   The intersection of opulence and environmental consciousness. Expect to see heavy use of recycled synthetics that mimic the drape and hand-feel of natural silks, alongside organic linens treated with eco-friendly performance finishes.
                 </p>
              </div>
              <div className="bg-zinc-900 p-8 rounded-xl">
                 <div className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4">Micro Trend</div>
                 <h3 className="text-3xl font-serif mb-4">Tactile Maximalism</h3>
                 <p className="text-zinc-400 leading-relaxed">
                   Moving away from flat, minimalist weaves, 2026 embraces highly textured fabrics. Bouclé, heavy corduroy, and 3D jacquards will dominate the premium upholstery and heavy drapery segments.
                 </p>
              </div>
           </div>
        </section>

      </main>

      <HeimtexFooter />
    </div>
  );
}
