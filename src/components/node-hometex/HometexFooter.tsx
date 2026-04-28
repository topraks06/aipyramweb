import React from 'react';
import Link from 'next/link';

interface HometexFooterProps {
  basePath?: string;
  lang?: string;
}

export default function HometexFooter({ basePath = '', lang = 'tr' }: HometexFooterProps) {
  return (
    <footer className="bg-black py-20 mt-auto relative z-10 border-t border-white/10 text-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-20">
          <div>
            <span className="font-serif font-medium text-4xl tracking-tight text-white block mb-6 uppercase">
              HOMETEX<span className="text-zinc-500 font-light">.AI</span>
            </span>
            <p className="text-zinc-400 font-light max-w-sm leading-relaxed">
              Küresel ev tekstili endüstrisi için yeni nesil sanal fuar ve editoryal ticaret platformu.
            </p>
          </div>
          
          <div className="flex gap-16">
            <div className="flex flex-col gap-5">
              <Link href={`${basePath}/expo`} className="text-xs uppercase tracking-[0.1em] text-zinc-500 hover:text-white transition-colors">Sanal Fuar</Link>
              <Link href={`${basePath}/magazine`} className="text-xs uppercase tracking-[0.1em] text-zinc-500 hover:text-white transition-colors">Sovereign Dergi</Link>
              <Link href={`${basePath}/trends`} className="text-xs uppercase tracking-[0.1em] text-zinc-500 hover:text-white transition-colors">Trend Alanı</Link>
            </div>
            <div className="flex flex-col gap-5">
              <Link href={`${basePath}/exhibitors`} className="text-xs uppercase tracking-[0.1em] text-zinc-500 hover:text-white transition-colors">İndeks</Link>
              <Link href={`${basePath}/about`} className="text-xs uppercase tracking-[0.1em] text-zinc-500 hover:text-white transition-colors">Hakkımızda</Link>
              <Link href={`${basePath}/contact`} className="text-xs uppercase tracking-[0.1em] text-zinc-500 hover:text-white transition-colors">İletişim</Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-medium">
            &copy; {new Date().getFullYear()} Hometex.ai. Tüm hakları saklıdır.
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-medium flex items-center gap-2">
            aipyram Ekosistemi
          </p>
        </div>
      </div>
    </footer>
  );
}
