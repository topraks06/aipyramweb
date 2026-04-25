'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';
import { Globe, Sparkles, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PERDE_DICT } from './perde-dictionary';
import { getNode } from '@/lib/sovereign-config';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

interface PerdeNavbarProps {
  theme?: 'light' | 'dark';
}

export default function PerdeNavbar({ theme = 'light' }: PerdeNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const domainPath = pathname.startsWith('/sites/') ? `/${pathname.split('/')[1]}/${pathname.split('/')[2]}` : '';
  const langKey = searchParams?.get('lang')?.toUpperCase() || 'TR';
  
  // Safe fallback to EN if language key doesn't exist
  const T = PERDE_DICT[langKey] || PERDE_DICT['EN'];

  const { user, isLicensed, logout, SovereignNodeId } = usePerdeAuth();
  const [credits, setCredits] = React.useState<number>(0);

  React.useEffect(() => {
    if (!user || !SovereignNodeId) return;
    const config = getNode(SovereignNodeId);
    
    // Yalnızca Sovereign Cüzdan Koleksiyonunu dinle
    const unsub = onSnapshot(doc(db, config.walletCollection, user.uid), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Hem yeni agentCredits hem eski renderCredits desteği
            setCredits(data?.agentCredits !== undefined ? data.agentCredits : (data?.renderCredits || 0));
        }
    });

    return () => unsub();
  }, [user, SovereignNodeId]);

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-[#111111] border-white/10' : 'bg-[#F9F9F6] border-[#111111]/10';
  const textClass = isDark ? 'text-white' : 'text-[#111111]';
  const textMuted = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const hoverClass = isDark ? 'hover:text-white' : 'hover:text-black';
  const borderClass = isDark ? 'border-white/10' : 'border-[#111111]/10';

  const switchLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('lang', e.target.value);
    window.location.href = url.toString();
  };

  const curLang = langKey.toLowerCase();
  const langs = [
    { code: 'tr', label: 'TR' },
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
    { code: 'ru', label: 'RU' },
    { code: 'zh', label: 'ZH' },
    { code: 'ar', label: 'AR' },
    { code: 'es', label: 'ES' },
    { code: 'fr', label: 'FR' }
  ];

  return (
    <>
      {/* MAIN NAVBAR - Clean Brutalism */}
      <header className={`fixed top-0 left-0 w-full z-50 px-6 md:px-12 h-20 flex justify-between items-center transition-colors border-b ${bgClass} ${borderClass} ${textClass}`}>
        <div className="flex items-center gap-6">
          <Link href={`${domainPath}/`} className="font-serif text-2xl tracking-tight font-medium hover:opacity-80 transition-opacity whitespace-nowrap">
            PERDE.AI
          </Link>
          {isLicensed && (
            <span className="hidden md:flex items-center gap-1 bg-[#8B7355]/10 text-[#8B7355] text-[9px] px-2 py-0.5 font-bold uppercase tracking-[0.2em] border border-[#8B7355]/20">
              <Sparkles className="w-3 h-3"/> PRO LICENSE
            </span>
          )}
        </div>
        
        <nav className="hidden lg:flex gap-10 text-[10px] uppercase tracking-[0.2em] font-semibold">
            <Link href={`${domainPath}/about`} className={`transition-colors py-1 ${textMuted} ${hoverClass}`}>
              {T.nav.about}
            </Link>
            <Link href={`${domainPath}/visualizer`} className={`transition-colors py-1 ${textMuted} ${hoverClass}`}>
              {T.nav.studio}
            </Link>
            <Link href={user ? `${domainPath}/studio` : `${domainPath}/login`} className={`transition-colors py-1 ${textMuted} ${hoverClass}`}>
              {T.nav.erp}
            </Link>
            <Link href={`${domainPath}/contact`} className={`transition-colors py-1 ${textMuted} ${hoverClass}`}>
              {T.nav.contact}
            </Link>
        </nav>
        
        <div className="flex items-center gap-4 md:gap-6">
           <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open_perde_ai_assistant', { detail: { action: 'upload' } }))}
              className={`hidden md:block transition-colors py-2 text-[10px] uppercase tracking-[0.2em] font-bold ${textClass}`}
           >
              {T.nav.open_assistant}
           </button>

           <div className={`h-6 w-[1px] ${borderClass} hidden md:block`}></div>

           <div className="flex items-center gap-1 relative text-[10px] font-bold text-zinc-500 uppercase tracking-widest cursor-pointer group">
             <Globe className="w-3.5 h-3.5 mr-1" />
             <select 
               value={curLang} 
               onChange={switchLang}
               className="bg-transparent appearance-none cursor-pointer hover:text-black transition-colors focus:outline-none"
             >
               {langs.map((l) => (
                 <option key={l.code} value={l.code} className="text-[#111] bg-white">{l.label}</option>
               ))}
             </select>
           </div>

           <div className={`h-6 w-[1px] ${borderClass} hidden md:block`}></div>

           {user ? (
             <div className="flex items-center gap-4">
               {/* ALOHA UZAYI: CÜZDAN */}
               <div className="flex items-center bg-accent/10 border border-accent/20 rounded-full px-3 py-1.5 cursor-help" title="Sovereign Agent Kredisi">
                   <Sparkles className="w-3.5 h-3.5 text-accent mr-1.5" />
                   <span className="text-[11px] font-mono text-accent font-bold tracking-widest">{credits}</span>
               </div>
               
               <Link href={`${domainPath}/studio`} className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${textClass}`}>
                 {T.nav.studio_panel}
               </Link>
               <button 
                 onClick={() => logout()}
                 className={`text-[10px] uppercase tracking-[0.2em] font-semibold transition-colors ${textMuted} ${hoverClass}`}
               >
                 {T.nav.logout}
               </button>
             </div>
           ) : (
             <Link 
               href={`${domainPath}/login`} 
               className={`hidden md:block px-6 py-3 border text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-[#111] text-white hover:bg-black rounded-sm'}`}
             >
               {T.nav.studio_login}
             </Link>
           )}
            
            {/* Hamburger (Mobile) */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center p-2 text-zinc-900 border border-zinc-200 rounded-sm bg-white hover:bg-zinc-100"
              aria-label="Open Mobile Menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[100] lg:hidden backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-[100] lg:hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-zinc-100">
                <span className="font-serif text-xl tracking-tight text-zinc-900">PERDE.AI</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 bg-zinc-100 text-zinc-600 hover:text-black rounded-full transition-colors"
                  aria-label="Close Mobile Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col p-6 gap-6 text-[11px] uppercase tracking-[0.2em] font-bold">
                <Link href={`${domainPath}/about`} onClick={() => setMobileMenuOpen(false)} className="text-zinc-600 hover:text-black hover:translate-x-2 transition-all">
                  {T.nav.about}
                </Link>
                <Link href={`${domainPath}/visualizer`} onClick={() => setMobileMenuOpen(false)} className="text-zinc-600 hover:text-black hover:translate-x-2 transition-all">
                  {T.nav.studio}
                </Link>
                <Link href={`${domainPath}/studio`} onClick={() => setMobileMenuOpen(false)} className="text-zinc-600 hover:text-black hover:translate-x-2 transition-all">
                  {T.nav.erp}
                </Link>
                <Link href={`${domainPath}/contact`} onClick={() => setMobileMenuOpen(false)} className="text-zinc-600 hover:text-black hover:translate-x-2 transition-all">
                  {T.nav.contact}
                </Link>

                <div className="h-[1px] w-full bg-zinc-100 my-2"></div>

                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('open_perde_ai_assistant', { detail: { action: 'upload' } }));
                  }}
                  className="text-[#8B7355] text-left hover:text-[#5c4a34] transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {T.nav.open_assistant}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
