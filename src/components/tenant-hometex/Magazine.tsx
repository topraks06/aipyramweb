'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Clock, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';
// import { db } from '../lib/firebase';
// import { collection, onSnapshot, query } from 'firebase/firestore';

export default function Magazine() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock Firebase data
    setTimeout(() => {
      setArticles([
        { id: '1', title: 'Global Tekstil Raporu 2026', isFeatured: true, category: 'Trend Raporu', timeToRead: '8 dk', image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80', description: 'Ev tekstilinde yapay zeka devrimi.', author: 'Aipyram Intelligence' },
        { id: '2', title: 'Avrupa Pazarında Yeni Tedarik Zincirleri', category: 'Analiz', timeToRead: '5 dk', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80' },
        { id: '3', title: 'Akıllı Kumaşlarda Patent Yarışı', category: 'Makale', timeToRead: '4 dk', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80' },
        { id: '4', title: 'Yapay Zeka Tasarım Araçlarının Evrimi', category: 'Araştırma', timeToRead: '6 dk', image: 'https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80' }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const featuredArticle = articles.find(a => a.isFeatured) || articles[0];
  const sideArticles = articles.filter(a => a.id !== featuredArticle?.id).slice(0, 3);
  const editorialPicks = articles.filter(a => a.id !== featuredArticle?.id).slice(3, 7);

  return (
    <div className="flex flex-col w-full bg-black text-white overflow-hidden min-h-screen">
      {/* Editorial Header */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 px-6 lg:px-12 max-w-[1400px] mx-auto w-full border-b border-white/10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-10"
        >
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-white/10 text-[9px] uppercase tracking-[0.3em] mb-10 font-medium text-zinc-500">
              Sovereign Dergi
            </div>
            <h1 className="text-6xl sm:text-7xl md:text-9xl lg:text-[11rem] font-serif font-medium tracking-tighter leading-[0.9] text-white uppercase">
              Editoryal <br/>
              <span className="italic text-zinc-500 font-light lowercase">İstihbarat.</span>
            </h1>
          </div>
          <div className="max-w-md lg:pb-6">
            <p className="text-xl sm:text-2xl text-zinc-400 font-light leading-relaxed">
              Pazar öngörüleri, mimari tekstil trendleri ve derinlemesine analizler. 
              Okuduğunuz her makale, sizi doğrudan doğru üreticiye bağlar.
            </p>
          </div>
        </motion.div>
      </section>

      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Ajan Verileri Yükleniyor</span>
          </div>
        </div>
      ) : articles.length === 0 ? (
        <div className="flex justify-center items-center min-h-[50vh] border-b border-white/10 bg-zinc-950">
          <p className="text-zinc-500 text-sm uppercase tracking-widest font-bold">Henüz makale bulunmuyor.</p>
        </div>
      ) : (
        <>
          {/* Hero Featured Article */}
          {featuredArticle && (
            <section className="py-16 lg:py-24 px-6 lg:px-12 max-w-[1400px] mx-auto w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="lg:col-span-8 group cursor-pointer"
                >
                  <Link href={`./magazine/${featuredArticle.id || 'cover'}`}>
                    <div className="aspect-[4/3] lg:aspect-[16/10] bg-zinc-900 border border-white/10 relative overflow-hidden mb-10">
                      <img 
                        src={featuredArticle.image} 
                        alt={featuredArticle.title} 
                        className="w-full h-full object-cover transition-transform duration-[3s] ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                      />
                      <div className="absolute top-8 left-8 bg-black/90 backdrop-blur-md px-5 py-2.5 text-[9px] uppercase tracking-[0.3em] font-medium text-white border border-white/10">
                        Kapak Konusu
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-5 mb-8 text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">
                    <span className="text-white">{featuredArticle.category}</span>
                    <span className="w-12 h-px bg-white/20" />
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 stroke-[1.5]" /> {featuredArticle.timeToRead} Okuma</span>
                  </div>
                  <h2 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-medium text-white mb-8 tracking-tight leading-[1.1] group-hover:text-zinc-400 transition-colors uppercase">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-2xl text-zinc-400 font-light leading-relaxed max-w-4xl mb-12">
                    {featuredArticle.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 pt-10 border-t border-white/10">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-zinc-900 overflow-hidden border border-white/20">
                        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop" alt="Author" className="w-full h-full object-cover grayscale" />
                      </div>
                      <div>
                        <span className="block text-sm font-medium uppercase tracking-[0.2em]">{featuredArticle.author}</span>
                        <span className="block text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-1 font-bold">Baş Analist</span>
                      </div>
                    </div>
                    
                    <Link href={`./magazine/${featuredArticle.id || 'cover'}`} className="group/btn relative inline-flex items-center gap-4 bg-white text-black px-10 py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-zinc-200 transition-all">
                      <Sparkles className="w-4 h-4" />
                      <span>Raporu Oku</span>
                    </Link>
                  </div>
                </motion.div>

                {/* Side Articles */}
                <div className="lg:col-span-4 flex flex-col gap-16 lg:pt-16">
                  <div className="flex items-center gap-5 mb-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">Öne Çıkanlar</h3>
                    <div className="flex-1 h-px bg-white/20" />
                  </div>
                  
                  {sideArticles.map((article, i) => (
                    <motion.div 
                      key={article.id} 
                      initial={{ opacity: 0, y: 20 }} 
                      whileInView={{ opacity: 1, y: 0 }} 
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="group cursor-pointer flex flex-col gap-6"
                    >
                      <div className="aspect-[16/9] bg-zinc-900 border border-white/10 relative overflow-hidden">
                        <img 
                          src={article.image} 
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-4 mb-4 text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">
                          <span className="text-white">{article.category}</span>
                          <span className="w-6 h-px bg-white/20" />
                          <span>{article.timeToRead}</span>
                        </div>
                        <h4 className="text-3xl font-serif font-medium leading-snug group-hover:text-zinc-400 transition-colors mb-5 tracking-tight uppercase">
                          {article.title}
                        </h4>
                        <Link href={`./magazine/${article.id || i}`} className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-white group-hover:text-zinc-400 transition-colors">
                          <BookOpen className="w-4 h-4 stroke-[1.5]" /> Makaleyi Oku
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
