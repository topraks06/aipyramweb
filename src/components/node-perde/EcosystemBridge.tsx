'use client';

import React from 'react';
import { ArrowRight, Paintbrush, Tv, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function EcosystemBridge() {
    return (
        <section className="py-24 px-6 md:px-12 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col items-center mb-16">
                    <h2 className="font-serif text-3xl md:text-5xl text-center text-zinc-900 tracking-tight max-w-2xl">
                        Tasarım Gücünü Paylaşan Ekosistem
                    </h2>
                    <p className="text-zinc-500 font-light text-center max-w-xl mt-6">
                        Perde.ai&apos;nin güçlü yapay zeka tasarım motoru, ekosistem genelinde görsel üretim altyapısı sağlar. <strong>TRTEX</strong>, <strong>Hometex.ai</strong> ve <strong>Vorhang.ai</strong> bu motordan beslenir.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* TRTEX — Görsel Üretim */}
                    <div className="relative overflow-hidden rounded-2xl bg-zinc-900 text-white p-8 group hover:shadow-2xl transition-all duration-500 border border-white/5">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                    <Paintbrush className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="font-serif text-2xl tracking-wide">TRTEX<span className="text-zinc-500 text-sm ml-1">.COM</span></span>
                            </div>
                            
                            <h3 className="text-xl font-light mb-4">Haber &amp; İçerik <br/>Görselleri</h3>
                            <p className="text-zinc-400 font-light text-sm mb-6">
                                TRTEX sektör haberleri ve içerikleri için Perde.ai&apos;nin üstün görsel motorunu kullanır. Kusursuz, profesyonel görseller tek tıkla üretilir.
                            </p>
                            
                            <div className="mt-auto">
                                <Link href="https://trtex.com" target="_blank">
                                    <button className="px-6 py-3 bg-white text-zinc-900 font-semibold text-[10px] uppercase tracking-widest rounded flex items-center gap-2 hover:bg-zinc-200 transition-colors">
                                        TRTEX&apos;e Git
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* HOMETEX — Fuar Görselleri */}
                    <div className="relative overflow-hidden rounded-2xl bg-[#F4F1ED] text-zinc-900 p-8 group hover:shadow-2xl transition-all duration-500 border border-zinc-200">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center">
                                    <Tv className="w-5 h-5 text-[#D4C3A3]" />
                                </div>
                                <span className="font-serif text-2xl tracking-wide">HOMETEX<span className="text-zinc-400 text-sm ml-1">.AI</span></span>
                            </div>
                            
                            <h3 className="text-xl font-light mb-4">Sanal Fuar <br/>Görselleri</h3>
                            <p className="text-zinc-500 font-light text-sm mb-6">
                                Hometex.ai dijital fuar standlarında kullanılan ürün görselleri, Perde.ai tasarım motoruyla otomatik oluşturulur.
                            </p>
                            
                            <div className="mt-auto">
                                <span className="px-6 py-3 bg-zinc-900 text-white font-semibold text-[10px] uppercase tracking-widest rounded inline-flex items-center gap-2">
                                    Pek Yakında
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* VORHANG — Online Satış Tasarımları */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950 to-zinc-900 text-white p-8 group hover:shadow-2xl transition-all duration-500 border border-purple-500/20">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center">
                                    <ShoppingBag className="w-5 h-5 text-purple-300" />
                                </div>
                                <span className="font-serif text-2xl tracking-wide">VORHANG<span className="text-purple-400 text-sm ml-1">.AI</span></span>
                            </div>
                            
                            <h3 className="text-xl font-light mb-4">Online Satış<br/>Ürün Görselleri</h3>
                            <p className="text-zinc-400 font-light text-sm mb-6">
                                Vorhang.ai&apos;da satılan dikilmiş ürünlerin profesyonel görselleri bu motorla tasarlanır. DACH pazarına hazır, kusursuz ürün fotoğrafçılığı.
                            </p>
                            
                            <div className="mt-auto">
                                <span className="px-6 py-3 bg-purple-600 text-white font-semibold text-[10px] uppercase tracking-widest rounded inline-flex items-center gap-2">
                                    Pek Yakında
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
