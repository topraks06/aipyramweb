'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, MapPin, Phone, Globe, Terminal } from 'lucide-react';
import { PERDE_DICT } from './perde-dictionary';

export default function Contact() {
  const searchParams = useSearchParams();
  const langKey = searchParams?.get('lang')?.toUpperCase() || 'TR';
  const T = PERDE_DICT[langKey] || PERDE_DICT['EN'];

  return (
    <div className="flex flex-col bg-[#F9F9F6] text-[#111111] font-sans pt-32 pb-24 min-h-[calc(100vh-100px)]">
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-20">
         <div>
            <h1 className="font-serif text-5xl text-[#111] mb-6 tracking-tight whitespace-pre-line">{T.contact.title}</h1>
            <p className="text-zinc-500 font-medium text-[11px] uppercase tracking-[0.1em] mb-16 leading-relaxed max-w-md">
               {T.contact.desc}
            </p>
            
            <div className="space-y-12">
               <div className="flex flex-col gap-4">
                  <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B7355] flex items-center gap-2"><MapPin className="w-3 h-3"/> Aipyram GmbH HQ</h3>
                  <div className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">
                     Heimstrasse 10<br/> CH-8953 Dietikon, Switzerland 🇨🇭
                  </div>
                  <div className="text-[10px] font-bold">+41 44 500 82 80</div>
                  <div className="text-[10px] font-bold text-zinc-400">INFO@AIPYRAM.COM</div>
               </div>

               <div className="flex flex-col gap-4">
                  <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400 flex items-center gap-2"><Phone className="w-3 h-3"/> Contact Numbers</h3>
                  <div className="flex flex-col gap-1 text-[11px] font-medium text-zinc-600 uppercase tracking-wider">
                     <span>TR Office: <span className="font-bold text-[#111]">+90 555 333 05 11</span></span>
                     <span>WhatsApp: <span className="font-bold text-[#111]">+41 79 565 17 43</span></span>
                  </div>
               </div>

               <div className="flex flex-col gap-4">
                  <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400 flex items-center gap-2"><Globe className="w-3 h-3"/> Operating Hours (CET)</h3>
                  <div className="flex flex-col gap-1 text-[11px] font-medium text-zinc-600 uppercase tracking-wider">
                     <span>Mon - Fri: 09:00 - 18:00</span>
                     <span>Saturday: 10:00 - 14:00</span>
                     <span>Sunday: Closed</span>
                  </div>
               </div>
            </div>
         </div>
         
         <div className="bg-white p-8 md:p-12 border border-[#111]/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#111]"></div>
            <h3 className="font-serif text-3xl mb-2 text-[#111]">{T.nav.contact}</h3>
            <p className="text-[10px] uppercase tracking-[0.1em] text-zinc-400 font-bold mb-10">{T.contact.select_type}</p>
            
            <form className="space-y-8 flex flex-col">
               <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 text-[10px] uppercase font-bold cursor-pointer">
                    <input type="radio" name="req_type" defaultChecked className="accent-[#111]" /> {T.contact.erp_setup}
                  </label>
                  <label className="flex items-center gap-2 text-[10px] uppercase font-bold cursor-pointer text-zinc-500">
                    <input type="radio" name="req_type" className="accent-[#111]" /> {T.contact.api_white}
                  </label>
               </div>

               <div>
                  <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">{T.contact.company}</label>
                  <input type="text" className="w-full border-b border-[#111]/20 py-2 focus:outline-none focus:border-[#111] bg-transparent text-sm transition-colors font-medium" />
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                     <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">{T.contact.fullname}</label>
                     <input type="text" className="w-full border-b border-[#111]/20 py-2 focus:outline-none focus:border-[#111] bg-transparent text-sm transition-colors font-medium" />
                  </div>
                  <div>
                     <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">{T.contact.email}</label>
                     <input type="email" className="w-full border-b border-[#111]/20 py-2 focus:outline-none focus:border-[#111] bg-transparent text-sm transition-colors font-medium" />
                  </div>
               </div>
               <div>
                  <label className="block text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">{T.contact.context}</label>
                  <textarea rows={4} className="w-full border-b border-[#111]/20 py-2 focus:outline-none focus:border-[#111] bg-transparent text-sm transition-colors resize-none font-medium"></textarea>
               </div>
               <button type="button" className="mt-8 w-full py-4 bg-[#111] text-white hover:bg-black transition-colors uppercase tracking-[0.2em] text-[10px] font-bold flex items-center justify-center gap-2">
                  <Terminal className="w-4 h-4" /> {T.contact.submit}
               </button>
            </form>
         </div>
      </section>
    </div>
  );
}
