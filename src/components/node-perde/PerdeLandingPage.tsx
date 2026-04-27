'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, Upload } from 'lucide-react';
import PerdeNavbar from './PerdeNavbar';
import WowDemoSection from './WowDemoSection';
import UseCasesSection from './UseCasesSection';
import EcosystemBridge from './EcosystemBridge';
import PerdeFooter from './PerdeFooter';
import { PERDE_DICT } from './perde-dictionary';

export default function PerdeLandingPage({ cmsData }: { cmsData?: any }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const basePath = pathname.startsWith('/sites/') ? pathname : '';
  const langKey = searchParams?.get('lang')?.toUpperCase() || 'TR';
  const T = PERDE_DICT[langKey] || PERDE_DICT['EN'];

  const HERO_SLIDES = [
    {
      image: cmsData?.hero_image?.mediaUrl || "/assets/perde.ai/perde.ai (10).jpg",
      title: cmsData?.hero_text?.title || T.hero.title,
      subtitle: cmsData?.hero_text?.content || T.hero.subtitle
    },
    {
      image: "/assets/perde.ai/perde.ai (13).jpg",
      title: T.gallery.c1_title,
      subtitle: T.gallery.c1_desc
    },
    {
      image: "/assets/perde.ai/perde.ai 204.jpg",
      title: T.gallery.c2_title,
      subtitle: T.gallery.c2_desc
    },
    {
      image: "/assets/perde.ai/perde.ai (18).jpg",
      title: T.gallery.c3_title,
      subtitle: T.gallery.c3_desc
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000); 
    return () => clearInterval(timer);
  }, [HERO_SLIDES.length]);

  return (
    <div className="flex flex-col bg-[#F9F9F6] text-zinc-900 font-sans selection:bg-[#8B7355] selection:text-white">
      
      {/* HEADER / NAVIGATION BAR */}
      <PerdeNavbar theme="light" />

      {/* 1. LUXURY EDITORIAL HERO */}
      <section className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden p-4 md:p-8 pt-20">
        <div className="w-full h-full relative grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-5 h-full flex flex-col justify-center px-4 md:px-12 z-10 relative bg-[#F9F9F6]/85 backdrop-blur-md md:bg-transparent md:backdrop-blur-none py-12 md:py-0 rounded-2xl md:rounded-none">
               <motion.div
                  key={`text-${currentSlide}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
               >
                 <div className="flex items-center gap-4 mb-10">
                   <div className="h-[1px] w-12 bg-[#8B7355]"></div>
                   <span className="text-[#8B7355] uppercase tracking-[0.4em] text-[9px] font-semibold">
                     {cmsData?.slogan?.title || T.howItWorks.tag}
                   </span>
                 </div>

                 <h1 className="font-serif text-5xl md:text-[5.5rem] mb-8 leading-[1.05] tracking-tight text-zinc-900">
                    {HERO_SLIDES[currentSlide].title.split(' ').map((word: string, i: number) => (
                      <span key={i} className={i % 2 !== 0 ? "italic text-zinc-600" : ""}>{word} </span>
                    ))}
                 </h1>

                 <p className="text-base md:text-xl text-zinc-500 max-w-md mb-12 md:mb-16 font-light leading-relaxed">
                    {HERO_SLIDES[currentSlide].subtitle}
                 </p>
                 
                 <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                   <Link href={`${basePath}/visualizer`}>
                     <button className="h-14 px-8 md:px-10 border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all duration-500 uppercase tracking-[0.2em] text-[10px] font-medium flex items-center gap-4 group">
                       {T.hero.start}
                       <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
                     </button>
                   </Link>
                   
                   <button 
                     onClick={() => window.dispatchEvent(new CustomEvent('open_perde_ai_assistant', { detail: { action: 'upload' } }))}
                     className="h-14 px-8 flex items-center gap-3 text-zinc-600 hover:text-[#8B7355] transition-colors"
                   >
                     <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                       <Upload className="w-4 h-4" />
                     </div>
                     <span className="text-[11px] font-medium max-w-[120px] leading-tight">{T.hero.upload_hint}</span>
                   </button>
                 </div>
               </motion.div>
            </div>

            <div className="absolute md:relative md:col-span-7 h-full w-full inset-0 md:inset-auto z-0 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <img 
                      src={HERO_SLIDES[currentSlide].image} 
                      alt="Luxury Interior" 
                      className="w-full h-full object-cover rounded-none md:rounded-l-3xl shadow-none md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-white/20 mix-blend-overlay md:hidden"></div>
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-8 right-6 md:bottom-12 md:right-12 flex gap-4 z-20">
                  {HERO_SLIDES.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentSlide(i)} 
                      className="group relative flex items-center justify-center p-2"
                    >
                      <div className={`transition-all duration-700 ease-in-out h-[1px] ${currentSlide === i ? 'w-12 bg-white' : 'w-4 bg-white/40 group-hover:w-8 group-hover:bg-white/80'}`} />
                    </button>
                  ))}
                </div>
            </div>

        </div>
      </section>

      {/* 2. WOW DEMO BLOĞU (NEW) */}
      <WowDemoSection />

      {/* 3. NASIL ÇALIŞIR (GÜNCELLENMİŞ İŞ AKIŞI) */}
      <section className="py-24 px-6 md:px-12 bg-white border-y border-[#EBEBE6]">
         <div className="max-w-7xl mx-auto flex flex-col items-center">
            <div className="mb-6 flex items-center justify-center gap-4">
              <span className="w-8 h-[1px] bg-zinc-300"></span>
              <span className="uppercase tracking-[0.2em] text-[10px] text-zinc-500 font-semibold">{T.howItWorks.tag}</span>
              <span className="w-8 h-[1px] bg-zinc-300"></span>
            </div>
            <h3 className="font-serif text-4xl md:text-6xl text-zinc-900 mb-10 leading-[1.1] tracking-tight text-center max-w-4xl" dangerouslySetInnerHTML={{__html: T.howItWorks.title.replace(',', ',<br/><span class="text-[#8B7355] italic">').replace('.', '.</span>')}}>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8 w-full mt-12">
               <div className="flex flex-col gap-4 group p-8 rounded-2xl bg-[#F9F9F6] border border-[#EBEBE6] hover:border-[#8B7355] transition-colors relative overflow-hidden">
                  <div className="text-8xl font-serif text-zinc-200 absolute top-4 right-4 opacity-50 select-none group-hover:text-[#8B7355]/10 transition-colors">1</div>
                  <h4 className="font-serif text-2xl text-zinc-900 relative z-10">{T.howItWorks.s1_title}</h4>
                  <p className="text-zinc-500 font-light text-sm leading-relaxed relative z-10">
                     {T.howItWorks.s1_desc}
                  </p>
               </div>

               <div className="flex flex-col gap-4 group p-8 rounded-2xl bg-[#F9F9F6] border border-[#EBEBE6] hover:border-[#8B7355] transition-colors relative overflow-hidden">
                  <div className="text-8xl font-serif text-zinc-200 absolute top-4 right-4 opacity-50 select-none group-hover:text-[#8B7355]/10 transition-colors">2</div>
                  <h4 className="font-serif text-2xl text-zinc-900 relative z-10">{T.howItWorks.s2_title}</h4>
                  <p className="text-zinc-500 font-light text-sm leading-relaxed relative z-10">
                     {T.howItWorks.s2_desc}
                  </p>
               </div>

               <div className="flex flex-col gap-4 group p-8 rounded-2xl bg-[#F9F9F6] border border-[#EBEBE6] hover:border-[#8B7355] transition-colors relative overflow-hidden">
                  <div className="text-8xl font-serif text-zinc-200 absolute top-4 right-4 opacity-50 select-none group-hover:text-[#8B7355]/10 transition-colors">3</div>
                  <h4 className="font-serif text-2xl text-zinc-900 relative z-10">{T.howItWorks.s3_title}</h4>
                  <p className="text-zinc-500 font-light text-sm leading-relaxed relative z-10">
                     {T.howItWorks.s3_desc}
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* 4. KULLANIM ALANLARI / PERSONA KARTLARI (NEW) */}
      <UseCasesSection />

      {/* 5. THE GALLERY COMPONENT (Grid Layout) */}
      <section className="py-32 px-6 md:px-12 bg-[#F9F9F6]">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
               <div>
                  <h3 className="uppercase tracking-[0.3em] text-[10px] text-[#8B7355] font-semibold mb-4">{T.gallery.tag}</h3>
                  <h2 className="font-serif text-4xl md:text-5xl text-zinc-900 tracking-tight">{T.gallery.title}</h2>
               </div>
               <p className="text-zinc-500 font-light max-w-sm text-sm">
                  {T.gallery.desc}
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="flex flex-col gap-6 group cursor-pointer">
                  <div className="relative overflow-hidden aspect-[3/4] bg-zinc-200 rounded-lg">
                     <img src="/assets/perde.ai/perde.ai (8).jpg" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Grid View" />
                     <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <div className="bg-white/20 backdrop-blur-sm rounded-sm"></div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-sm"></div>
                        <div className="border-2 border-[#8B7355] bg-white/10 backdrop-blur-sm rounded-sm flex items-center justify-center"><Sparkles className="text-[#8B7355] w-6 h-6"/></div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-sm"></div>
                     </div>
                  </div>
                  <div>
                     <span className="text-[9px] uppercase tracking-[0.2em] text-[#8B7355] mb-2 block font-medium">BİRDEN FAZLA ALTERNATİF</span>
                     <h4 className="font-serif text-xl text-zinc-900 mb-2">4 Seçenekli Varyasyon Ağı</h4>
                     <p className="text-zinc-500 text-sm font-light">Mekanı ve rengi verdiğinizde sistem size aynı odanın 4 farklı tasarımını yan yana çizer. Geliştirmek istediğinizi seçip yola devam edin.</p>
                  </div>
               </div>
               <div className="flex flex-col gap-6 md:translate-y-12 group cursor-pointer mt-8 md:mt-0">
                  <div className="overflow-hidden aspect-[3/4] bg-zinc-200 rounded-lg border border-zinc-200 relative">
                     <img src="/assets/perde.ai/perde.ai (9).jpg" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Compare Slider" />
                     <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] -translate-x-1/2 flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg"><span className="text-[8px] tracking-tighter text-zinc-900 font-bold">&lt;&gt;</span></div>
                     </div>
                  </div>
                  <div>
                     <span className="text-[9px] uppercase tracking-[0.2em] text-[#8B7355] mb-2 block font-medium">Görsel Kanıt</span>
                     <h4 className="font-serif text-xl text-zinc-900 mb-2">{T.gallery.c1_title}</h4>
                     <p className="text-zinc-500 text-sm font-light">{T.gallery.c1_desc}</p>
                  </div>
               </div>
               <div className="flex flex-col gap-6 group cursor-pointer mt-8 md:mt-0">
                  <div className="overflow-hidden aspect-[3/4] bg-zinc-200 rounded-lg">
                     <img src="/assets/perde.ai/perde.ai (20).jpg" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Fabric Detail" />
                  </div>
                  <div>
                     <span className="text-[9px] uppercase tracking-[0.2em] text-[#8B7355] mb-2 block font-medium">Kusursuz Simülasyon</span>
                     <h4 className="font-serif text-xl text-zinc-900 mb-2">{T.gallery.c2_title}</h4>
                     <p className="text-zinc-500 text-sm font-light">{T.gallery.c2_desc}</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 6. ECOSYSTEM BRIDGE (NEW) */}
      <EcosystemBridge />

      {/* 7. CALL TO ACTION */}
      <section className="py-40 relative px-6 text-center flex flex-col items-center bg-zinc-900">
         <div className="absolute inset-0 z-0">
             <img src="/assets/perde.ai/perde.ai (1).jpg" className="w-full h-full object-cover opacity-30 mix-blend-luminosity filter blur-sm" alt="Background Texture" />
             <div className="absolute inset-0 bg-zinc-900/80"></div>
         </div>
         <div className="relative z-10 max-w-3xl">
             <h2 className="font-serif text-4xl md:text-7xl text-white mb-8 tracking-tight font-light leading-tight" dangerouslySetInnerHTML={{__html: T.cta.title.replace(',', ',<br/><span class="text-[#D4C3A3] italic">').replace('.', '.</span>')}}>
             </h2>
             <p className="text-zinc-400 font-light text-base md:text-lg mb-12 max-w-xl mx-auto">
                {T.cta.desc}
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Link href={`${basePath}/register`}>
                    <button className="h-16 px-8 md:px-12 bg-[#8B7355] text-white hover:bg-[#725e45] transition-colors duration-500 uppercase tracking-[0.25em] text-[10px] md:text-[11px] font-semibold tracking-wider">
                       5 ÜCRETSİZ TASARIM DENE
                    </button>
                 </Link>
                 <Link href={`${basePath}/contact`}>
                    <button className="h-16 px-8 md:px-12 bg-transparent border border-white/20 text-white hover:bg-white/10 transition-colors duration-500 uppercase tracking-[0.25em] text-[10px] md:text-[11px] font-semibold tracking-wider">
                       {T.cta.button}
                    </button>
                 </Link>
             </div>
         </div>
      </section>

      {/* 8. FOOTER - EDITORIAL */}
      <PerdeFooter />
    </div>
  );
}
