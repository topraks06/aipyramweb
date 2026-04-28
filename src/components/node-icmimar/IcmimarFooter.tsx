'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function IcmimarFooter() {
    const pathname = usePathname() || '';
    const domainPath = pathname.startsWith('/sites/') ? `/${pathname.split('/')[1]}/${pathname.split('/')[2]}` : '';

    return (
      <footer className="py-24 bg-[#F9F9F6] border-t border-[#111111]/10 px-6 md:px-12 text-[#111111] font-sans">
        <div className="max-w-[1400px] mx-auto">
          
          {/* TOP LINKS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-24">
            
            {/* Col 1 */}
            <div>
              <h4 className="text-[#111] font-bold uppercase tracking-[0.2em] text-[9px] mb-8">Platform</h4>
              <ul className="space-y-4 text-[10px] font-medium text-zinc-500 tracking-[0.1em] uppercase">
                <li><Link href={`${domainPath}/visualizer`} className="hover:text-[#8B7355] transition-colors">Nasıl Çalışır?</Link></li>
                <li><Link href={`${domainPath}/pricing`} className="hover:text-[#8B7355] transition-colors">Fiyatlandırma</Link></li>
                <li><Link href={`${domainPath}/contact`} className="hover:text-[#8B7355] transition-colors">İletişim</Link></li>
                <li><Link href={`${domainPath}/privacy`} className="hover:text-[#8B7355] transition-colors">Gizlilik</Link></li>
                <li><Link href={`${domainPath}/terms`} className="hover:text-[#8B7355] transition-colors">Kullanım Koşulları</Link></li>
              </ul>
            </div>

          </div>
          
          {/* MIDDLE BRANDING BLOCK */}
          <div className="flex flex-col md:flex-row justify-between items-start pt-16 border-t border-[#111111]/10 mb-16 gap-12">
            <div className="max-w-md">
               <span className="font-serif text-3xl text-[#111111] mb-2 block tracking-tight">icmimar.ai</span>
               <p className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 mb-8 leading-relaxed">Yapay zeka ile mekanınızı yeniden tanımlıyoruz.</p>
               
               <div className="text-[11px] font-medium text-zinc-500 space-y-3 uppercase tracking-wider">
                  <p className="font-bold text-[#111]">Aipyram GmbH</p>
                  <p>Heimstrasse 10, CH-8953 Dietikon, İsviçre 🇨🇭</p>
                  <p className="flex items-center gap-4 py-2">
                     <span className="text-[#111] font-bold">📞 +41 44 500 82 80</span>
                     <span className="text-[#111] font-bold">📞 +90 555 333 05 11</span>
                  </p>
                  <p className="hover:text-black cursor-pointer transition-colors">📧 INFO@aipyram.COM</p>
                  <p className="hover:text-black cursor-pointer transition-colors">🌐 aipyram.COM</p>
               </div>
            </div>
            
            <div className="max-w-sm text-left md:text-right">
               <p className="font-serif text-3xl md:text-4xl text-zinc-300 italic leading-snug">&quot;Geleceği tahmin etmiyoruz; onu yapay zeka ile bugünden inşa ediyoruz.&quot;</p>
            </div>
          </div>

          {/* GLOBAL DOMAIN PORTFOLIO */}
          <div className="pt-16 pb-12 border-t border-[#111111]/10 mb-8">
             <div className="flex items-center gap-3 mb-6">
               <span className="text-[14px]">🌍</span>
               <h4 className="text-[#111] font-bold uppercase tracking-[0.2em] text-[10px]">aipyram GmbH GLOBAL DOMAİN PORTFÖYÜ</h4>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-y-4 gap-x-8 text-[10px] font-medium text-zinc-500 tracking-[0.1em] uppercase">
                <p>icmimar.ai</p>
                <p>vorhang.ai</p>
                <p>shtory.ai</p>
                <p>parda.ai</p>
                <p>kurtina.ai</p>
                <p>curtaindesign.ai</p>
                <p>heimtextil.ai</p>
                <p>hometex.ai</p>
                <p>evtekstili.ai</p>
                <p>icmimar.ai</p>
                <p>evdekor.ai</p>
                <p>mobilya.ai</p>
                <p>mobel.ai</p>
                <p>perabot.ai</p>
                <p>donoithat.ai</p>
                <p>krowat.ai</p>
                <p>bezak.ai</p>
                <p>trtex.com</p>
             </div>
             <div className="mt-8 text-[9px] text-[#8B7355] font-bold uppercase tracking-[0.2em]">
               250+ stratejik domain ile dijital dönüşüme liderlik ediyoruz
             </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-[#111111]/10">
            <div className="text-[9px] text-zinc-400 uppercase tracking-[0.3em] font-bold text-center md:text-left leading-relaxed">
              © {new Date().getFullYear()} aipyram GMBH — TÜM HAKLARI SAKLIDIR.
            </div>
            <div className="flex gap-10">
               <Link href="https://linkedin.com/company/aipyram" target="_blank" className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-[#111] cursor-pointer transition-colors font-bold">LINKEDIN</Link>
               <Link href="https://instagram.com/aipyram" target="_blank" className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-[#111] cursor-pointer transition-colors font-bold">INSTAGRAM</Link>
               <Link href="https://twitter.com/aipyram" target="_blank" className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-[#111] cursor-pointer transition-colors font-bold">TWITTER</Link>
            </div>
          </div>

        </div>
      </footer>
    );
}
