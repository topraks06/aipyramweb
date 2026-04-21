'use client';

import React from 'react';
import Link from 'next/link';

export default function PerdeFooter() {
    return (
      <footer className="py-24 bg-[#F9F9F6] border-t border-[#111111]/10 px-6 md:px-12 text-[#111111] font-sans">
        <div className="max-w-[1400px] mx-auto">
          
          {/* TOP LINKS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-24">
            
            {/* Col 1 */}
            <div>
              <h4 className="text-[#111] font-bold uppercase tracking-[0.2em] text-[9px] mb-8">Perde Türleri</h4>
              <ul className="space-y-4 text-[10px] font-medium text-zinc-500 tracking-[0.1em] uppercase">
                <li><Link href="/" className="hover:text-black transition-colors">Fon Perde</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Tül Perde</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Stor Perde</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Zebra Perde</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Blackout</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Jaluzi</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Panel Perde</Link></li>
              </ul>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-[#111] font-bold uppercase tracking-[0.2em] text-[9px] mb-8">Kumaşlar</h4>
              <ul className="space-y-4 text-[10px] font-medium text-zinc-500 tracking-[0.1em] uppercase">
                <li><Link href="/" className="hover:text-black transition-colors">Kadife</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Keten</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Şifon</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Jakar</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Brode</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Voile</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Organik</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-[#111] font-bold uppercase tracking-[0.2em] text-[9px] mb-8">Tasarım Stilleri</h4>
              <ul className="space-y-4 text-[10px] font-medium text-zinc-500 tracking-[0.1em] uppercase">
                <li><Link href="/" className="hover:text-black transition-colors">Modern</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Klasik</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Minimalist</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Rustik</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Bohem</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Art Deco</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">İskandinav</Link></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="text-[#111] font-bold uppercase tracking-[0.2em] text-[9px] mb-8">Mekanlar</h4>
              <ul className="space-y-4 text-[10px] font-medium text-zinc-500 tracking-[0.1em] uppercase">
                <li><Link href="/" className="hover:text-black transition-colors">Salon</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Yatak Odası</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Mutfak</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Çocuk Odası</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Ofis</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Otel / Restoran</Link></li>
                <li><Link href="/" className="hover:text-black transition-colors">Balkon</Link></li>
              </ul>
            </div>

            {/* Col 5 */}
            <div>
              <h4 className="text-[#111] font-bold uppercase tracking-[0.2em] text-[9px] mb-8">Platform</h4>
              <ul className="space-y-4 text-[10px] font-medium text-zinc-500 tracking-[0.1em] uppercase">
                <li><Link href="/sites/perde/visualizer" className="hover:text-[#8B7355] transition-colors">Nasıl Çalışır?</Link></li>
                <li><Link href="/sites/perde/pricing" className="hover:text-[#8B7355] transition-colors">Fiyatlandırma</Link></li>
                <li><Link href="/sites/perde/about" className="hover:text-[#8B7355] transition-colors">Kurumsal</Link></li>
                <li><Link href="/sites/perde/contact" className="hover:text-[#8B7355] transition-colors">İletişim</Link></li>
                <li><Link href="/sites/perde/privacy" className="hover:text-[#8B7355] transition-colors">Gizlilik</Link></li>
                <li><Link href="/sites/perde/terms" className="hover:text-[#8B7355] transition-colors">Kullanım Koşulları</Link></li>
              </ul>
            </div>

          </div>
          
          {/* MIDDLE BRANDING BLOCK */}
          <div className="flex flex-col md:flex-row justify-between items-start pt-16 border-t border-[#111111]/10 mb-16 gap-12">
            <div className="max-w-md">
               <span className="font-serif text-3xl text-[#111111] mb-2 block tracking-tight">PERDE.AI</span>
               <p className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 mb-8 leading-relaxed">Yapay zeka ile mekanınızı yeniden tanımlıyoruz.</p>
               
               <div className="text-[11px] font-medium text-zinc-500 space-y-3 uppercase tracking-wider">
                  <p className="font-bold text-[#111]">Aipyram GmbH</p>
                  <p>Heimstrasse 10, CH-8953 Dietikon, İsviçre 🇨🇭</p>
                  <p className="flex items-center gap-4 py-2">
                     <span className="text-[#111] font-bold">📞 +41 44 500 82 80</span>
                     <span className="text-[#111] font-bold">📞 +90 555 333 05 11</span>
                  </p>
                  <p className="hover:text-black cursor-pointer transition-colors">📧 INFO@AIPYRAM.COM</p>
                  <p className="hover:text-black cursor-pointer transition-colors">🌐 AIPYRAM.COM</p>
               </div>
            </div>
            
            <div className="max-w-sm text-left md:text-right">
               <p className="font-serif text-3xl md:text-4xl text-zinc-300 italic leading-snug">&quot;Geleceği tahmin etmiyoruz; onu yapay zeka ile bugünden inşa ediyoruz.&quot;</p>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-[#111111]/10">
            <div className="text-[9px] text-zinc-400 uppercase tracking-[0.3em] font-bold text-center md:text-left leading-relaxed">
              © {new Date().getFullYear()} AIPYRAM GMBH — TÜM HAKLARI SAKLIDIR.
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
