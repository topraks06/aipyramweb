'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Filter, Search } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import HometexFooter from './HometexFooter';

export default function Expo({ exhibitors = [], halls = [] }: { exhibitors?: any[], halls?: any[] }) {
  const [activeFilter, setActiveFilter] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = ['Tümü', 'Döşemelik', 'Perdelik', 'Yatak & Banyo', 'Akıllı', 'Sürdürülebilir'];

  const allHalls = halls;

  const filteredHalls = allHalls.filter(hall => {
    const matchesFilter = activeFilter === 'Tümü' || 
      hall.name.toLowerCase().includes(activeFilter.toLowerCase()) || 
      hall.desc.toLowerCase().includes(activeFilter.toLowerCase());
      
    const matchesSearch = searchQuery === '' || 
      hall.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      hall.desc.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full bg-black text-white overflow-hidden min-h-screen">
      {/* Search Header Space */}

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-white/10 text-[9px] uppercase tracking-[0.3em] mb-10 lg:mb-12 text-zinc-500">
              Sanal Holler
            </div>
            <h1 className="text-6xl sm:text-7xl md:text-9xl lg:text-[10rem] font-serif font-medium tracking-tighter mb-8 lg:mb-12 leading-[0.9] text-white uppercase">
              Sektörün Kalbine <br/>
              <span className="italic text-zinc-500 font-light normal-case">Dijital Yolculuk</span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-zinc-400 font-light leading-relaxed max-w-3xl">
              Dünyanın en büyük tekstil üreticilerinin 3D dijital ikiz showroomları. 
              Yapay zeka destekli eşleştirme ile doğru tedarikçiyi saniyeler içinde bulun.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <div className="sticky top-20 z-40 bg-black/90 backdrop-blur-xl py-6 mb-16 border-y border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-10 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
              <div className="flex items-center gap-3 text-zinc-400 shrink-0">
                <Filter className="w-4 h-4 stroke-[1.5]" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Filtrele</span>
              </div>
              <div className="w-px h-4 bg-white/10 shrink-0" />
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "text-[10px] uppercase tracking-[0.2em] font-bold whitespace-nowrap transition-all duration-500 relative py-2",
                    activeFilter === filter ? "text-white" : "text-zinc-500 hover:text-white"
                  )}
                >
                  {filter}
                  {activeFilter === filter && (
                    <motion.div 
                      layoutId="activeFilter"
                      className="absolute bottom-0 left-0 right-0 h-px bg-white"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
            
            <div className="hidden lg:flex items-center gap-4 text-zinc-500">
              <Search className="w-4 h-4 stroke-[1.5]" />
              <input 
                type="text" 
                placeholder="Hol veya firma ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-[10px] uppercase tracking-[0.2em] placeholder:text-zinc-600 w-64 text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Asymmetric Editorial Grid - Halls */}
      <section className="pb-24 lg:pb-40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          {filteredHalls.length === 0 ? (
            <div className="w-full py-20 text-center border border-white/10 bg-zinc-950">
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-medium">Bu kriterlere uygun hol bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-x-12 gap-y-24 lg:gap-y-32">
              {filteredHalls.map((hall, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: (i % 2) * 0.2 }}
                  className={cn("group cursor-pointer flex flex-col", hall.span)}
                >
                <Link href={`./exhibitors`} className="block w-full">
                  <div className={cn("relative overflow-hidden mb-8 lg:mb-10 bg-zinc-900 w-full", hall.aspect)}>
                    <img 
                      src={hall.image} 
                      alt={hall.name}
                      className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[3s] ease-out group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-black/90 backdrop-blur-md flex items-center justify-center transform translate-y-8 group-hover:translate-y-0 transition-all duration-700 ease-[0.16,1,0.3,1] border border-white/10">
                        <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-white">Hole Gir</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-8">
                    <div className="max-w-2xl">
                      <h3 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium text-white mb-4 lg:mb-6 tracking-tight leading-tight group-hover:text-zinc-400 transition-colors uppercase">
                        {hall.name}
                      </h3>
                      <p className="text-zinc-500 text-lg lg:text-xl font-light leading-relaxed">
                        {hall.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0 mt-4 md:mt-0">
                      <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-white">{hall.count}</span>
                      <div className="w-16 h-px bg-white/10 group-hover:w-32 group-hover:bg-white transition-all duration-700 ease-out" />
                      <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-white transform group-hover:translate-x-4 transition-all duration-700 stroke-[1]" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Exhibitors - Dynamic from Firestore */}
      <section className="py-24 lg:py-40 bg-zinc-950 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 lg:mb-32 gap-10"
          >
            <div className="max-w-3xl">
              <h2 className="text-5xl sm:text-6xl md:text-8xl font-serif font-medium mb-8 tracking-tighter uppercase">Öne Çıkan Stantlar</h2>
              <p className="text-zinc-500 text-xl sm:text-2xl font-light leading-relaxed">Aipyram tarafından seçilen, haftanın en inovatif dijital ikiz showroomları.</p>
            </div>
            <Link href="./exhibitors" className="group relative inline-flex items-center gap-6 text-xs uppercase tracking-[0.3em] font-medium text-white">
              <span className="relative z-10">Tüm Katılımcıları Gör</span>
              <span className="w-16 h-px bg-white/20 group-hover:w-32 group-hover:bg-white transition-all duration-700 ease-out" />
            </Link>
          </motion.div>

          {exhibitors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {exhibitors.map((exhibitor, i) => (
                <Link href={`./exhibitors/${exhibitor.id}`} key={exhibitor.id} className="block">
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[3/4] bg-zinc-900 border border-white/10 relative overflow-hidden mb-8">
                      <img 
                        src={exhibitor.coverImageUrl || "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80"} 
                        alt={exhibitor.name || 'Firma'}
                        className="w-full h-full object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-6 left-6 bg-black/90 backdrop-blur-md px-4 py-2 text-[9px] uppercase tracking-[0.3em] font-medium text-white border border-white/10">
                        {exhibitor.category || 'Premium'}
                      </div>
                    </div>
                    <h3 className="text-2xl font-serif font-medium text-white mb-3 group-hover:text-[#8B7355] transition-colors uppercase tracking-tight">{exhibitor.name}</h3>
                    <p className="text-zinc-500 text-base font-light line-clamp-2 leading-relaxed">{exhibitor.desc}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="w-full h-[40vh] border border-white/10 flex items-center justify-center bg-zinc-950">
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold">Ajan verileri bekleniyor...</p>
            </div>
          )}
        </div>
      </section>
      <HometexFooter />
    </div>
  );
}
