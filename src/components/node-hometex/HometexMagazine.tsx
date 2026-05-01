'use client';

import React from 'react';
import { BookOpen, ArrowRight, Eye, Calendar, Sparkles } from 'lucide-react';
import HometexNavbar from './HometexNavbar';
import HometexFooter from './HometexFooter';

interface HometexMagazineProps {
  articles?: any[];
  basePath: string;
}

export default function HometexMagazine({ articles = [], basePath }: HometexMagazineProps) {
  // Demo data if no articles provided
  const displayArticles = articles.length > 0 ? articles : [
    {
      id: 'm1',
      title: 'Dijital Dönüşüm: Fuar Alanlarında Yapay Zeka',
      summary: 'Geleneksel fuarcılığın yerini alan dijital showroomlar ve otonom eşleştirme sistemlerinin B2B ticarete etkisi.',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=800',
      category: 'Teknoloji',
      publishedAt: new Date().toISOString(),
      views: 1240
    },
    {
      id: 'm2',
      title: 'Global Ev Tekstili Pazarında 2027 Trendleri',
      summary: 'Avrupa pazarına damga vuracak sürdürülebilir kumaş dokuları ve yeni nesil dokuma teknikleri raporu.',
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800',
      category: 'Trend',
      publishedAt: new Date().toISOString(),
      views: 890
    },
    {
      id: 'm3',
      title: 'Tedarik Zincirinde Sıfır Gecikme Modeli',
      summary: 'Üreticiden son tüketiciye uzanan yolda aracıları ortadan kaldıran yeni tedarik yönetimi stratejileri.',
      imageUrl: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=800',
      category: 'Tedarik',
      publishedAt: new Date().toISOString(),
      views: 2150
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      <HometexNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold tracking-wider uppercase mb-6">
                <Sparkles className="w-4 h-4" /> B2B Dergi & Makaleler
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-zinc-900 tracking-tight leading-tight mb-6">
                Sektörel Zeka ve<br />
                <span className="text-amber-600">Global Trendler.</span>
              </h1>
              <p className="text-lg text-zinc-600 max-w-xl mb-8">
                Hometex B2B Magazine ile fuar dünyasındaki en son gelişmeleri, pazar raporlarını ve üretici hikayelerini keşfedin. Bilgi, ticaretin en güçlü sermayesidir.
              </p>
            </div>
            
            {/* Featured Article */}
            <div className="flex-1 w-full relative group cursor-pointer">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative shadow-2xl">
                <img src={displayArticles[0].imageUrl} alt="Featured" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                  <span className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">{displayArticles[0].category}</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{displayArticles[0].title}</h2>
                  <p className="text-zinc-300 text-sm line-clamp-2 mb-4">{displayArticles[0].summary}</p>
                  <div className="flex items-center text-xs text-zinc-400 gap-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(displayArticles[0].publishedAt).toLocaleDateString('tr-TR')}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {displayArticles[0].views} okuma</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Grid */}
      <section className="py-16 bg-zinc-50 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-600" /> Son Yayınlar
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayArticles.slice(1).map((article) => (
              <article key={article.id} className="bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col">
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-amber-700 shadow-sm">
                    {article.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-amber-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-zinc-600 text-sm mb-6 line-clamp-3 flex-grow">
                    {article.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-zinc-500 mt-auto pt-4 border-t border-zinc-100">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(article.publishedAt).toLocaleDateString('tr-TR')}</span>
                    <span className="flex items-center gap-1 font-medium text-amber-600 group-hover:translate-x-1 transition-transform">
                      Devamını Oku <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <HometexFooter />
    </div>
  );
}
