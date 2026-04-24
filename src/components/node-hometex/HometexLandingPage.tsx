'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, ChevronRight, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import HometexNavbar from './HometexNavbar';
import HometexFooter from './HometexFooter';
import { HOMETEX_HALLS } from '@/lib/hometex-demoData';

export default function HometexLandingPage({ articles = [], exhibitors = [] }: { articles?: any[], exhibitors?: any[] }) {

  const featuredArticle = articles.find(a => a.isFeatured) || articles[0];
  const sidebarArticles = articles.filter(a => a.id !== featuredArticle?.id).slice(0, 3);

  return (
    <div className="flex flex-col w-full bg-black text-white overflow-hidden min-h-screen">
      {/* Merkezi Navbar — artık hardcoded değil */}
      <HometexNavbar />

      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex flex-col lg:flex-row justify-center lg:items-center pt-32 pb-16 lg:pt-20 lg:pb-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full relative z-10 flex flex-col lg:block">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl order-2 lg:order-1 mt-16 lg:mt-0"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-white/10 text-[9px] uppercase tracking-[0.3em] mb-10 lg:mb-16 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Yapay Zeka Aktif
            </div>
            <h1 className="text-6xl sm:text-7xl md:text-9xl lg:text-[11rem] font-serif font-medium tracking-tighter mb-8 lg:mb-12 leading-[0.9] text-white uppercase">
               Ticaret <br/>
              <span className="italic text-zinc-500 font-light normal-case">Zekayı</span> Takip Eder.
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-zinc-400 mb-16 lg:mb-20 font-light leading-relaxed max-w-3xl">
              Küresel ev tekstili endüstrisi için yılın 365 günü açık sanal fuar ve sektörel vizyon dergisi. 
            </p>
            
            <div className="flex flex-col sm:flex-row gap-10 items-start sm:items-center">
              <Link href="/sites/hometex.ai/expo" className="group relative inline-flex items-center gap-6 text-xs uppercase tracking-[0.3em] font-medium text-white">
                <span className="relative z-10">Sanal Fuara Giriş</span>
                <span className="w-16 h-px bg-white group-hover:w-32 transition-all duration-700 ease-out" />
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-4 transition-transform duration-700 stroke-[1]" />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative lg:absolute lg:right-12 lg:top-[15%] w-full lg:w-[45%] h-[50vh] sm:h-[60vh] lg:h-[75vh] z-0 order-1 lg:order-2"
          >
            <img 
              src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2800&auto=format&fit=crop" 
              alt="Modern luxury hotel suite, presidential suite wide angle view" 
              className="w-full h-full object-cover grayscale opacity-80"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </section>

      {/* Elegant Marquee */}
      <div className="bg-white text-black overflow-hidden py-6 flex items-center">
        <motion.div 
          animate={{ x: [0, -1035] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
          className="flex whitespace-nowrap text-xs font-bold uppercase tracking-[0.3em]"
        >
          <span className="mx-8">DÖŞEMELİK KUMAŞ</span> <span className="mx-8 opacity-30">•</span>
          <span className="mx-8">PERDELİK & TÜL</span> <span className="mx-8 opacity-30">•</span>
          <span className="mx-8">YATAK TEKSTİLİ</span> <span className="mx-8 opacity-30">•</span>
          <span className="mx-8">BANYO & HAVLULUK</span> <span className="mx-8 opacity-30">•</span>
          <span className="mx-8">HALI & ZEMİN</span> <span className="mx-8 opacity-30">•</span>
          <span className="mx-8">DUVAR KAĞIDI</span> <span className="mx-8 opacity-30">•</span>
          <span className="mx-8">TEKNİK TEKSTİL</span> <span className="mx-8 opacity-30">•</span>
          {/* Duplicate for seamless loop */}
          <span className="mx-8">DÖŞEMELİK KUMAŞ</span> <span className="mx-8 opacity-30">•</span>
          <span className="mx-8">PERDELİK & TÜL</span> <span className="mx-8 opacity-30">•</span>
          <span className="mx-8">YATAK TEKSTİLİ</span> <span className="mx-8 opacity-30">•</span>
        </motion.div>
      </div>

      {/* Triggered by HOMETEX Section */}
      <section className="py-24 lg:py-40 relative border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-20 lg:mb-32 max-w-4xl"
          >
            <div className="inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] font-medium mb-8 lg:mb-10 text-zinc-500 border border-white/10 px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              HOMETEX İstihbarat
            </div>
            <h2 className="text-5xl sm:text-6xl md:text-8xl font-serif font-medium mb-8 lg:mb-10 tracking-tighter leading-[0.9] uppercase text-white">
              Yeni Gelenler <br/> <span className="italic text-zinc-500 normal-case">& Trendler</span>
            </h2>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-20 items-start">
            {exhibitors.length > 0 ? (
              <Link href={`/sites/hometex.ai/exhibitors/${exhibitors[0].id}`} className="w-full lg:w-7/12 group cursor-pointer block">
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden mb-10 bg-zinc-900 border border-white/10">
                    <img 
                      src={exhibitors[0].coverImageUrl || "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=2800"} 
                      alt={exhibitors[0].name}
                      className="w-full h-full object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-8 left-8 bg-black/90 backdrop-blur-md text-white px-5 py-2.5 text-[9px] uppercase tracking-[0.3em] font-medium border border-white/10">
                      Yeni Koleksiyon
                    </div>
                  </div>
                  <h3 className="text-5xl font-serif font-medium text-white mb-5 tracking-tight uppercase">{exhibitors[0].name}</h3>
                  <p className="text-zinc-400 text-xl font-light leading-relaxed max-w-lg">{exhibitors[0].desc}</p>
                </motion.div>
              </Link>
            ) : null}

            <div className="w-full lg:w-5/12 flex flex-col gap-20 lg:mt-40">
              {exhibitors.slice(1, 3).map((item, i) => (
                <Link href={`/sites/hometex.ai/exhibitors/${item.id}`} key={item.id} className="group cursor-pointer block">
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: i * 0.2 }}
                  >
                    <div className="relative aspect-square overflow-hidden mb-8 bg-zinc-900 border border-white/10">
                      <img 
                        src={item.coverImageUrl || "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2800"} 
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-[3s] ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                      />
                    </div>
                    <h3 className="text-3xl font-serif font-medium text-white mb-4 tracking-tight uppercase">{item.name}</h3>
                    <p className="text-zinc-500 text-lg font-light leading-relaxed line-clamp-2">{item.desc}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Magazine Section */}
      <section className="py-24 lg:py-40 bg-zinc-950 relative border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 lg:mb-32 gap-10"
          >
            <div className="max-w-3xl">
              <h2 className="text-5xl sm:text-6xl md:text-8xl font-serif font-medium mb-8 tracking-tighter uppercase text-white">Sovereign Dergi</h2>
              <p className="text-zinc-500 text-xl sm:text-2xl font-light leading-relaxed">Derinlemesine istihbarat, pazar öngörüleri ve mimari tekstil trendleri.</p>
            </div>
            <Link href="/sites/hometex.ai/magazine" className="group relative inline-flex items-center gap-6 text-xs uppercase tracking-[0.3em] font-medium text-white">
              <span className="relative z-10">Tüm Arşivi Keşfet</span>
              <span className="w-16 h-px bg-white group-hover:w-32 transition-all duration-700 ease-out" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            {/* Featured Article */}
            {featuredArticle ? (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7 group flex flex-col"
              >
                <Link href={`/sites/hometex.ai/magazine/${featuredArticle.id}`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden mb-10 lg:mb-12 bg-zinc-900">
                    <img 
                      src={featuredArticle.coverImage || featuredArticle.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2800&auto=format&fit=crop"} 
                      alt={featuredArticle.title} 
                      className="w-full h-full object-cover transition-transform duration-[3s] ease-out group-hover:scale-105 opacity-80"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex items-center gap-5 mb-8 text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                    <span className="text-white font-medium">{featuredArticle.category || 'Özel Rapor'}</span>
                    <span className="w-12 h-px bg-white/20" />
                    <span>{featuredArticle.timeToRead || '5 dk'} Okuma</span>
                  </div>
                  <h3 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium text-white mb-8 group-hover:text-zinc-400 transition-colors leading-[1.1] tracking-tight">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-zinc-400 text-xl lg:text-2xl mb-16 font-light leading-relaxed">
                    {featuredArticle.excerpt || featuredArticle.desc}
                  </p>
                </Link>
                
                {/* Magazine Insight Block */}
                <div className="mt-auto bg-black p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10 relative border border-white/10">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
                  <div className="flex items-start gap-8">
                    <BarChart2 className="w-8 h-8 text-white shrink-0 mt-1 stroke-[1]" />
                    <div>
                      <h4 className="font-sans font-medium text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-4">Ticari İçgörü</h4>
                      <p className="text-xl text-white font-medium leading-snug">Uzman Görüşü: 2026'da Akıllı Döşemeliklerin Pazar Payı %18 Artacak.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="lg:col-span-7 h-[70vh] bg-black border border-white/10 flex items-center justify-center">
                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em]">Ajan verileri bekleniyor...</p>
              </div>
            )}

            {/* Sidebar Articles */}
            <div className="lg:col-span-5 flex flex-col gap-20 lg:pt-40">
              {sidebarArticles.map((article: any, i: number) => (
                <Link href={`/sites/hometex.ai/magazine/${article.id}`} key={article.id} className="block">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.15 }}
                    className="group cursor-pointer flex flex-col gap-8"
                  >
                    <div className="w-full aspect-[16/10] overflow-hidden bg-zinc-900 border border-white/10">
                      <img 
                        src={article.coverImage || article.image || "https://images.unsplash.com/photo-1616137466211-f939a420be84?q=80&w=2800&auto=format&fit=crop"} 
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-[3s] ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.3em] mb-4">{article.category || 'Trend Radarı'}</span>
                      <h4 className="font-serif font-medium text-3xl sm:text-4xl text-white group-hover:text-zinc-400 transition-colors leading-tight tracking-tight">
                        {article.title}
                      </h4>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Virtual Halls & Exhibitor Hub - Minimalist Gallery */}
      <section className="py-24 lg:py-40 bg-black border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-5xl mx-auto mb-20 lg:mb-32"
          >
            <h2 className="text-5xl sm:text-6xl md:text-8xl font-serif font-medium mb-8 lg:mb-10 tracking-tighter uppercase text-white">Dijital İkiz Showroomlar</h2>
            <p className="text-zinc-400 text-xl sm:text-2xl font-light leading-relaxed">
              Üst düzey galerileri keşfedin ve en iyi üreticilerle doğrudan bağlantı kurun. 
              Görsel hikaye anlatımı toptan ticaretle buluşuyor.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-24">
            {HOMETEX_HALLS.map((hall, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: (i % 3) * 0.15 }}
                className="group cursor-pointer block"
              >
                <div className="relative aspect-[3/4] overflow-hidden mb-10 bg-zinc-900 border border-white/10">
                  <img 
                    src={hall.image} 
                    alt={hall.name}
                    className="w-full h-full object-cover transition-transform duration-[3s] ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-black/95 backdrop-blur-md flex items-center justify-center transform translate-y-8 group-hover:translate-y-0 transition-all duration-700 ease-[0.16,1,0.3,1] border border-white/10">
                      <Play className="w-8 h-8 text-white ml-1 stroke-[1]" />
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-4xl font-serif font-medium text-white mb-4 tracking-tight uppercase">{hall.name}</h3>
                  <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-[0.3em]">{hall.count}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-32 text-center"
          >
            <Link href="/sites/hometex.ai/expo" className="group relative inline-flex items-center gap-6 text-xs uppercase tracking-[0.3em] font-medium text-white">
              <span className="relative z-10">Tüm Holleri Görüntüle</span>
              <span className="w-16 h-px bg-white group-hover:w-32 transition-all duration-700 ease-out" />
            </Link>
          </motion.div>
        </div>
      </section>

      <HometexFooter />
    </div>
  );
}
