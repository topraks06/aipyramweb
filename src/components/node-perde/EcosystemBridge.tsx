'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Newspaper, PackageSearch, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function EcosystemBridge() {
    const [latestNews, setLatestNews] = useState<any>(null);

    useEffect(() => {
        // Gerçek TRTEX İstihbarat Sinyali
        const fetchTrtex = async () => {
            try {
                const res = await fetch('/api/v1/master/trtex/news-list?limit=1');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data && data.data.length > 0) {
                        setLatestNews(data.data[0]);
                    }
                }
            } catch (e) {
                // Sessiz hata (Sinyal alınamadıysa UI boş kalır)
            }
        };
        fetchTrtex();
    }, []);
    return (
        <section className="py-24 px-6 md:px-12 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col items-center mb-16">
                    <h2 className="font-serif text-3xl md:text-5xl text-center text-zinc-900 tracking-tight max-w-2xl">
                        AIPyram Trinity Ekosistemi
                    </h2>
                    <p className="text-zinc-500 font-light text-center max-w-xl mt-6">
                        Perde.ai tek başına çalışmaz. <strong>TRTEX</strong> ve <strong>Hometex.ai</strong> ile tam entegre çalışarak kesintisiz bir B2B deneyimi sunar.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* TRTEX Bridge */}
                    <div className="relative overflow-hidden rounded-2xl bg-zinc-900 text-white p-8 md:p-12 group hover:shadow-2xl transition-all duration-500">
                        <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1590086782957-93c06ef21604?q=80&w=1000')] bg-cover bg-center opacity-20 mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-transparent"></div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                    <Newspaper className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-serif text-2xl tracking-wide">TRTEX<span className="text-zinc-500 text-sm ml-1">.COM</span></span>
                            </div>
                            
                            <h3 className="text-xl md:text-2xl font-light mb-4">Pazar İstihbaratı ve <br/>Canlı Fırsat Radarı</h3>
                            <p className="text-zinc-400 font-light text-sm mb-6 max-w-xs">
                                Perde.ai üzerinden TRTEX otonom haber hattına bağlanın. Sektör haberleri, hammadde fiyatları ve uluslararası talepler anında ekranınızda.
                            </p>

                            {latestNews && (
                                <div className="mb-6 p-4 bg-black/40 border border-white/10 rounded-md max-w-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                        <span className="text-[10px] uppercase tracking-widest text-zinc-500">Son İstihbarat Sinyali</span>
                                    </div>
                                    <p className="text-sm font-medium text-white line-clamp-2">{latestNews.title}</p>
                                </div>
                            )}
                            
                            <div className="mt-auto">
                                <Link href="https://trtex.com" target="_blank">
                                    <button className="px-6 py-3 bg-white text-zinc-900 font-semibold text-[10px] uppercase tracking-widest rounded flex items-center gap-2 hover:bg-zinc-200 transition-colors">
                                        Ziyaret Et
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* HOMETEX Bridge */}
                    <div className="relative overflow-hidden rounded-2xl bg-[#F4F1ED] text-zinc-900 p-8 md:p-12 group hover:shadow-2xl transition-all duration-500 border border-zinc-200">
                        <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1558211583-d26f610c1eb1?q=80&w=1000')] bg-cover bg-center opacity-30 mix-blend-multiply group-hover:scale-105 transition-transform duration-1000"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#F4F1ED] via-[#F4F1ED]/90 to-transparent"></div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center">
                                    <PackageSearch className="w-5 h-5 text-[#D4C3A3]" />
                                </div>
                                <span className="font-serif text-2xl tracking-wide">HOMETEX<span className="text-zinc-400 text-sm ml-1">.AI</span></span>
                            </div>
                            
                            <h3 className="text-xl md:text-2xl font-light mb-4">Fuar Teknolojisi ve <br/>Dijital Stand Katalogları</h3>
                            <p className="text-zinc-500 font-light text-sm mb-6 max-w-xs">
                                Perde.ai ile dönüştürdüğünüz kumaşlar, Hometex.ai üzerinden otomatik olarak fuar ziyaretçilerine sunulur. Sanal fuarınızı cebinizde taşıyın.
                            </p>

                            <div className="mb-8 p-4 bg-white/60 border border-zinc-200 rounded-md max-w-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-3 h-3 text-[#D4C3A3]" />
                                    <span className="text-[10px] uppercase tracking-widest text-zinc-600">Yaklaşan Etkinlik</span>
                                </div>
                                <p className="text-sm font-bold text-zinc-900">HOMETEX 2026 - İSTANBUL</p>
                                <p className="text-xs text-zinc-500 mt-1">Sanal Standınızı Oluşturun</p>
                            </div>
                            
                            <div className="mt-auto">
                                <Link href="#" onClick={(e) => e.preventDefault()}>
                                    <button className="px-6 py-3 bg-zinc-900 text-white font-semibold text-[10px] uppercase tracking-widest rounded flex items-center gap-2 hover:bg-zinc-800 transition-colors">
                                        Pek Yakında
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
