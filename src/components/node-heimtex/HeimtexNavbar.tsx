"use client";
import Link from 'next/link';
import { t } from './heimtex-dictionary';

export default function HeimtexNavbar({ lang = 'en' }: { lang?: string }) {
  return (
    <nav className="flex items-center justify-between p-6 bg-zinc-950 text-white border-b border-zinc-800">
      <Link href="/" className="text-2xl font-serif font-bold tracking-widest uppercase">
        Heimtex<span className="text-zinc-500">.ai</span>
      </Link>
      <div className="flex gap-8 text-sm font-medium tracking-wide uppercase">
        <Link href="/trends" className="hover:text-red-500 transition-colors">{t('trends', lang)}</Link>
        <Link href="/magazine" className="hover:text-red-500 transition-colors">{t('magazine', lang)}</Link>
      </div>
      <div>
         <Link href="/login" className="px-4 py-2 border border-zinc-700 hover:bg-white hover:text-black transition-colors uppercase text-xs tracking-wider">
           Login
         </Link>
      </div>
    </nav>
  );
}
