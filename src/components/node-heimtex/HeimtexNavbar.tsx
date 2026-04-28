"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from './heimtex-dictionary';

export default function HeimtexNavbar({ lang = 'en', basePath = '/sites/heimtex.ai' }: { lang?: string, basePath?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-zinc-950/90 backdrop-blur-md text-white border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href={basePath} className="text-2xl font-serif font-bold tracking-widest uppercase flex flex-col leading-none">
              <span>Heimtex<span className="text-red-500">.ai</span></span>
              <span className="text-[9px] tracking-[0.4em] text-zinc-500 font-sans mt-1">Digital Vogue</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            <Link href={`${basePath}/trends`} className="text-xs tracking-[0.2em] uppercase font-medium hover:text-red-500 transition-colors">
              {t('trends', lang) || 'Trends'}
            </Link>
            <Link href={`${basePath}/magazine`} className="text-xs tracking-[0.2em] uppercase font-medium hover:text-red-500 transition-colors">
              {t('magazine', lang) || 'Magazine'}
            </Link>
            <Link href={`${basePath}/pantone`} className="text-xs tracking-[0.2em] uppercase font-medium hover:text-red-500 transition-colors">
              Pantone
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-zinc-400 hover:text-white transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <Link 
              href={`${basePath}/login`}
              className="border border-zinc-700 hover:border-white hover:bg-white hover:text-black px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-bold transition-all flex items-center gap-2"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </Link>
          </div>

          {/* Mobile toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-zinc-400 hover:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-900 border-t border-zinc-800"
          >
            <div className="px-4 py-6 space-y-6 flex flex-col items-center">
              <Link href={`${basePath}/trends`} onClick={() => setIsOpen(false)} className="text-sm tracking-[0.2em] uppercase font-medium hover:text-red-500">Trends</Link>
              <Link href={`${basePath}/magazine`} onClick={() => setIsOpen(false)} className="text-sm tracking-[0.2em] uppercase font-medium hover:text-red-500">Magazine</Link>
              <Link href={`${basePath}/pantone`} onClick={() => setIsOpen(false)} className="text-sm tracking-[0.2em] uppercase font-medium hover:text-red-500">Pantone</Link>
              <div className="w-12 h-px bg-zinc-800 my-4" />
              <Link href={`${basePath}/login`} onClick={() => setIsOpen(false)} className="border border-zinc-700 w-full text-center hover:bg-white hover:text-black px-6 py-3 text-xs uppercase tracking-[0.2em] font-bold">
                Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
