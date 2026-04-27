'use client';

import React from 'react';
import { Building2, Paintbrush, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function UseCasesSection() {
    return (
        <section className="py-24 px-6 md:px-12 bg-[#F9F9F6] border-y border-[#EBEBE6]">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col items-center mb-16">
                    <div className="mb-6 flex items-center justify-center gap-4">
                        <span className="w-8 h-[1px] bg-zinc-300"></span>
                        <span className="uppercase tracking-[0.2em] text-[10px] text-zinc-500 font-semibold">Tüm Ekosistem İçin</span>
                        <span className="w-8 h-[1px] bg-zinc-300"></span>
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl text-center text-zinc-900 tracking-tight max-w-2xl">
                        İşletmeniz İçin Tasarlanmış <br />
                        <span className="text-[#8B7355] italic">Otonom Yetenekler.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Firma Sahibi */}
                    <div className="bg-white p-8 rounded-2xl border border-[#EBEBE6] shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col group">
                        <div className="w-14 h-14 bg-zinc-950 text-[#D4C3A3] flex items-center justify-center rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <h3 className="font-serif text-2xl text-zinc-900 mb-4">Firma Sahibi</h3>
                        <p className="text-zinc-500 text-sm font-light mb-8 flex-1">
                            Operasyonlarınızı dijitalleştirin, bayi ağınızı genişletin ve pazar sinyallerini anında alın.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-2 text-sm text-zinc-600 font-light">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#8B7355] mt-1.5 shrink-0" />
                                <span>Tüm kumaş serilerini saniyeler içinde <strong>Dijital Katalog'a</strong> dönüştürün.</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-zinc-600 font-light">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#8B7355] mt-1.5 shrink-0" />
                                <span>Chat tabanlı ERP ajanıyla atölye süreçlerini yönetin.</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-zinc-600 font-light">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#8B7355] mt-1.5 shrink-0" />
                                <span>Rakiplerden önce <strong>Pazar İstihbaratına</strong> ulaşın.</span>
                            </li>
                        </ul>
                        <Link href="/sites/perde.ai/pricing" className="text-[10px] uppercase tracking-widest font-semibold flex items-center gap-2 text-zinc-900 group-hover:text-[#8B7355] transition-colors">
                            Detayları İncele
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* İç Mimar */}
                    <div className="bg-white p-8 rounded-2xl border border-[#EBEBE6] shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#8B7355]/10 to-transparent rounded-bl-full pointer-events-none" />
                        <div className="w-14 h-14 bg-[#8B7355] text-white flex items-center justify-center rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Paintbrush className="w-6 h-6" />
                        </div>
                        <h3 className="font-serif text-2xl text-zinc-900 mb-4">İç Mimar & Tasarımcı</h3>
                        <p className="text-zinc-500 text-sm font-light mb-8 flex-1">
                            Sınırları aşın. Müşterilerinize anında 4 farklı tasarım varyasyonu sunarak satışları kapatın.
                        </p>
                        <ul className="space-y-3 mb-8 relative z-10">
                            <li className="flex items-start gap-2 text-sm text-zinc-600 font-light">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1.5 shrink-0" />
                                <span>Oda fotoğrafı çekin, <strong>10 saniyede perde render'ı</strong> alın.</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-zinc-600 font-light">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1.5 shrink-0" />
                                <span>"Daha sıcak tonlar kullan" diyerek anında <strong>4'lü varyasyon</strong> üretin.</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-zinc-600 font-light">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1.5 shrink-0" />
                                <span>Beğendiğiniz kumaş için üreticiden tek tıkla <strong>numune talep edin</strong>.</span>
                            </li>
                        </ul>
                        <Link href="/sites/perde.ai/visualizer" className="text-[10px] uppercase tracking-widest font-semibold flex items-center gap-2 text-zinc-900 group-hover:text-[#8B7355] transition-colors mt-auto">
                            Stüdyoyu Aç
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Toptancı */}
                    <div className="bg-white p-8 rounded-2xl border border-[#EBEBE6] shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col group">
                        <div className="w-14 h-14 bg-zinc-100 text-zinc-600 flex items-center justify-center rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300 border border-zinc-200">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h3 className="font-serif text-2xl text-zinc-900 mb-4">Toptancı & İhracatçı</h3>
                        <p className="text-zinc-500 text-sm font-light mb-8 flex-1">
                            Global pazara açılın. Dünya genelindeki talepleri radarla tespit edin ve hızlı reaksiyon alın.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-2 text-sm text-zinc-600 font-light">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#8B7355] mt-1.5 shrink-0" />
                                <span>Dünya Radarı ile uluslararası <strong>B2B Fırsatlarını</strong> yakalayın.</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-zinc-600 font-light">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#8B7355] mt-1.5 shrink-0" />
                                <span>Yabancı müşterilerle sektörel dilde <strong>8 Dilde Chat</strong> yapın.</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-zinc-600 font-light">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#8B7355] mt-1.5 shrink-0" />
                                <span>Chatten anında çoklu dil destekli <strong>Proforma Fatura</strong> üretin.</span>
                            </li>
                        </ul>
                        <a href="https://trtex.com" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-widest font-semibold flex items-center gap-2 text-zinc-900 group-hover:text-[#8B7355] transition-colors">
                            Radara Bağlan
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>

                </div>
            </div>
        </section>
    );
}
