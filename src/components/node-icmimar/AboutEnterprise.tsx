'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Globe, Cpu, Award } from 'lucide-react';
import { ICMIMAR_DICT } from './icmimar-dictionary';

export default function AboutEnterprise() {
  const searchParams = useSearchParams();
  const langKey = searchParams?.get('lang')?.toUpperCase() || 'TR';
  const T = ICMIMAR_DICT[langKey] || ICMIMAR_DICT['EN'];

  return (
    <div className="flex flex-col bg-[#F9F9F6] text-[#111111] font-sans pt-32 pb-24 min-h-[calc(100vh-100px)]">
      <section className="max-w-[1400px] mx-auto px-6 md:px-12">
         <div className="flex items-center gap-4 mb-10">
           <div className="h-[1px] w-12 bg-[#8B7355]"></div>
           <span className="text-[#8B7355] uppercase tracking-[0.4em] text-[9px] font-bold">
             ABOUT ICMIMAR.AI
           </span>
         </div>
         <h1 className="font-serif text-5xl md:text-7xl text-[#111] mb-12 tracking-tight max-w-4xl whitespace-pre-line">
            {T.about.title}
         </h1>
         <p className="text-zinc-500 font-medium text-lg max-w-3xl leading-relaxed mb-24">
            {T.about.desc}
         </p>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-[#111]/10 pt-16">
            <div className="flex flex-col">
               <Globe className="w-8 h-8 text-[#8B7355] mb-6" />
               <h3 className="text-[12px] uppercase tracking-[0.2em] font-bold mb-4">{T.about.c1_title}</h3>
               <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                  {T.about.c1_desc}
               </p>
            </div>
            <div className="flex flex-col">
               <Cpu className="w-8 h-8 text-[#111] mb-6" />
               <h3 className="text-[12px] uppercase tracking-[0.2em] font-bold mb-4">{T.about.c2_title}</h3>
               <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                  {T.about.c2_desc}
               </p>
            </div>
            <div className="flex flex-col">
               <Award className="w-8 h-8 text-[#8B7355] mb-6" />
               <h3 className="text-[12px] uppercase tracking-[0.2em] font-bold mb-4">{T.about.c3_title}</h3>
               <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                  {T.about.c3_desc}
               </p>
            </div>
         </div>
      </section>
    </div>
  );
}
