'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, Clock, Sparkles, ChevronRight, Share2, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import HometexFooter from './HometexFooter';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';

export default function MagazineDetail({ article }: { article: any }) {
  const { user } = usePerdeAuth();
  const role = user ? 'member' : 'consumer';
  const [relatedExhibitor, setRelatedExhibitor] = useState<any>({ 
    id: '1', 
    name: 'SOVEREIGN MILLS', 
    country: 'United Kingdom',
    coverImageUrl: 'https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80' 
  });

  // Parallax setup for Hero Image
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  if (!article) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">İstihbarat Raporu Yükleniyor</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-black overflow-hidden min-h-screen text-white">
      
      {/* Immersive Parallax Hero */}
      <section ref={heroRef} className="relative h-[80vh] lg:h-screen w-full bg-zinc-900 overflow-hidden flex items-end">
        <motion.div 
          style={{ y, opacity }} 
          className="absolute inset-0 w-full h-full"
        >
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-full object-cover grayscale opacity-60"
          />
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/40 to-black z-10" />
        
        <div className="relative z-20 w-full max-w-[1200px] mx-auto px-6 lg:px-12 pb-16 lg:pb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex items-center gap-4 mb-8"
          >
            <Link href="../magazine" className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/20 hover:bg-white hover:text-black transition-colors bg-black/50 backdrop-blur-md">
              <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
            </Link>
            <span className="px-4 py-2 bg-black/80 backdrop-blur-md text-[9px] uppercase tracking-[0.3em] font-bold text-white border border-white/20">
              {article.category}
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-medium text-white tracking-tighter leading-[1] uppercase max-w-5xl"
          >
            {article.title}
          </motion.h1>
        </div>
      </section>

      {/* Article Meta Data */}
      <div className="border-b border-white/10 sticky top-20 z-40 bg-black/90 backdrop-blur-xl">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-12 py-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-900 border border-white/20">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop" alt="Author" className="w-full h-full object-cover grayscale" />
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-[0.3em] text-white font-bold">{article.author}</span>
                <span className="block text-xs font-light text-zinc-500 mt-0.5">{article.date}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500">
              <Clock className="w-3.5 h-3.5 stroke-[1.5]" /> {article.timeToRead}
            </span>
            <div className="h-4 w-px bg-white/20" />
            <button className="text-zinc-500 hover:text-white transition-colors p-2">
              <Share2 className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-[1000px] mx-auto px-6 lg:px-12 py-20 lg:py-32 w-full grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Article Body */}
        <article className="col-span-1 lg:col-span-8">
          {article.lead && (
            <div className="mb-16">
              <p className="text-2xl md:text-3xl font-light leading-snug text-white/90 tracking-tight">
                {article.lead}
              </p>
            </div>
          )}

          <div 
            className="prose prose-lg md:prose-xl prose-invert max-w-none prose-headings:font-serif prose-headings:font-medium prose-headings:uppercase prose-headings:tracking-tighter prose-h3:text-4xl prose-p:font-light prose-p:leading-relaxed prose-blockquote:border-l-white prose-blockquote:bg-white/5 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:font-serif prose-blockquote:text-2xl prose-blockquote:font-light prose-blockquote:italic"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        {/* Sidebar / Editorial Commerce Connection */}
        <aside className="col-span-1 lg:col-span-4 relative">
          <div className="sticky top-48">
            <div className="h-px w-12 bg-white mb-8" />
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500 mb-6">
              Editoryal İstihbarat Sonucu
            </h3>
            <p className="text-sm font-light text-zinc-400 mb-10 leading-relaxed">
              Bu trend analizinde bahsedilen kalite standartlarına ve organik dokulara sahip, onaylanmış tedarikçimiz.
            </p>

            {relatedExhibitor && (
              <div className="group border border-white/20 bg-zinc-950 hover:border-white/50 transition-all overflow-hidden flex flex-col">
                <div className="aspect-[4/3] bg-zinc-900 relative overflow-hidden">
                  <img 
                    src={relatedExhibitor.coverImageUrl} 
                    alt={relatedExhibitor.name}
                    className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[2s] group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-black px-3 py-1 text-[8px] uppercase tracking-widest font-bold border border-white/20 text-white">
                    Önerilen Üretici
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-2xl font-serif font-medium uppercase tracking-tight mb-2 text-white">
                    {relatedExhibitor.name}
                  </h4>
                  <p className="text-xs text-zinc-500 font-light mb-8">
                    {relatedExhibitor.country}
                  </p>
                  
                  <Link 
                    href={`../exhibitors/${relatedExhibitor.id}`} 
                    className="w-full bg-white text-black py-4 text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3"
                  >
                    3D Koleksiyonu Gör <ChevronRight className="w-3 h-3 stroke-[1.5]" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>
      <HometexFooter />
    </div>
  );
}
