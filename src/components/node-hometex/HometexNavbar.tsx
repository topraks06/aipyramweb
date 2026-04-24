'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSovereignAuth } from '@/hooks/useSovereignAuth';
import { Menu, X, Globe, Search, Sun, Moon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HometexNavbarProps {
  theme?: 'light' | 'dark';
}

const navItems = [
  { name: 'Sanal Fuar', path: '/expo' },
  { name: 'Sovereign Dergi', path: '/magazine' },
  { name: 'Trend Alanı', path: '/trends' },
  { name: 'İndeks', path: '/exhibitors' },
];

const languages = [
  { code: 'TR', name: 'Türkçe' },
  { code: 'EN', name: 'English' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'FR', name: 'Français' },
  { code: 'RU', name: 'Русский' },
  { code: 'AR', name: 'العربية' },
  { code: 'ES', name: 'Español' },
  { code: 'ZH', name: '中文' },
];

const roles = [
  { value: 'manufacturer', label: 'Üretici Modu' },
  { value: 'retailer', label: 'Perakendeci Modu' },
  { value: 'consumer', label: 'Bireysel Müşteri' },
];

export default function HometexNavbar({ theme = 'dark' }: HometexNavbarProps) {
  const pathname = usePathname() || '';
  const domainPath = pathname.startsWith('/sites/') ? `/${pathname.split('/')[1]}/${pathname.split('/')[2]}` : '';
  const { user, isLicensed, loading, logout } = useSovereignAuth('hometex');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('TR');
  const [currentRole, setCurrentRole] = useState('retailer');
  const [isDarkMode, setIsDarkMode] = useState(true); // default dark
  const [isHidden, setIsHidden] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  const currentRoleLabel = roles.find(r => r.value === currentRole)?.label;

  return (
    <>
      {/* Full Screen Smart Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-2xl flex flex-col pt-24 md:pt-32 px-4 sm:px-6 lg:px-8 overflow-y-auto text-white"
          >
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-8 right-8 text-zinc-400 hover:text-white transition-colors p-2"
            >
              <X className="w-8 h-8 stroke-[1]" />
            </button>
            
            <div className="max-w-5xl mx-auto w-full pb-24">
              <div className="flex items-center gap-6 border-b border-white/20 pb-6 mb-16">
                <Search className="w-8 h-8 md:w-10 md:h-10 text-white shrink-0 stroke-[1]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Arama yapın..."
                  className="w-full bg-transparent text-4xl md:text-6xl font-serif font-medium text-white placeholder:text-zinc-600 focus:outline-none tracking-tight"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-400 mb-8">Popüler Aramalar</h3>
                  <div className="flex flex-wrap gap-3">
                    {['Yanmaz Otel Perdesi', 'Organik Keten', 'Akıllı Karartma', 'İtalyan Kadifesi', 'Geri Dönüştürülmüş İplik'].map(term => (
                      <button 
                        key={term} 
                        onClick={() => setIsSearchOpen(false)}
                        className="px-5 py-2.5 border border-white/20 text-xs font-medium hover:bg-white hover:text-black transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-400 mb-8">Yapay Zeka Önerileri</h3>
                  <ul className="space-y-8">
                    <li 
                      className="group cursor-pointer flex items-start gap-4"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <Sparkles className="w-5 h-5 text-white shrink-0 mt-1 stroke-[1]" />
                      <div>
                        <span className="block text-xl font-light group-hover:text-zinc-400 transition-colors leading-snug">2027 Kış trendlerine uygun ağır gramajlı kumaşlar</span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-3 block">34 üretici bulundu</span>
                      </div>
                    </li>
                    <li 
                      className="group cursor-pointer flex items-start gap-4"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      <Sparkles className="w-5 h-5 text-white shrink-0 mt-1 stroke-[1]" />
                      <div>
                        <span className="block text-xl font-light group-hover:text-zinc-400 transition-colors leading-snug">Akustik yalıtım sağlayan duvar kaplamaları</span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-3 block">12 üretici bulundu</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header 
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" }
        }}
        animate={isHidden && !isMobileMenuOpen ? "hidden" : "visible"}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-white/10 text-white",
          isMobileMenuOpen ? "z-[120]" : "z-50"
        )}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href={`${domainPath}/`} className="flex items-center gap-3 group">
                <span className="font-serif font-medium text-2xl tracking-tight text-white uppercase">
                  HOMETEX<span className="text-zinc-500 font-light">.AI</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-10">
              {navItems.map((item) => {
                const isActive = pathname === `${domainPath}${item.path}`;
                return (
                  <Link
                    key={item.name}
                    href={`${domainPath}${item.path}`}
                    className={cn(
                      "relative text-[9px] font-medium transition-colors py-2 uppercase tracking-[0.25em]",
                      isActive ? "text-white" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {item.name}
                    {isActive && (
                      <motion.div 
                        layoutId="headerActive"
                        className="absolute -bottom-[26px] left-0 right-0 h-px bg-white"
                      />
                    )}
                  </Link>
                );
              })}
              {user ? (
                <Link
                  href={`${domainPath}/expo`}
                  className={cn(
                    "relative text-[9px] font-medium transition-colors py-2 uppercase tracking-[0.25em]",
                    pathname === `${domainPath}/expo` ? "text-white" : "text-zinc-400 hover:text-white"
                  )}
                >
                  Aipyram ID
                </Link>
              ) : (
                <Link
                  href={`${domainPath}/login`}
                  className={cn(
                    "relative text-[9px] font-medium transition-colors py-2 uppercase tracking-[0.25em]",
                    pathname === `${domainPath}/login` ? "text-white" : "text-zinc-400 hover:text-white"
                  )}
                >
                  Giriş Yap
                </Link>
              )}
            </nav>

            <div className="hidden lg:flex items-center space-x-6">
              {/* Language Selector */}
              <div className="relative" ref={langMenuRef}>
                <button 
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center gap-2 text-[9px] font-medium text-zinc-400 hover:text-white transition-colors uppercase tracking-[0.25em]"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {currentLang}
                </button>
                
                <AnimatePresence>
                  {isLangMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-6 w-40 bg-zinc-950 border border-white/10 shadow-2xl py-2 z-50"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setCurrentLang(lang.code);
                            setIsLangMenuOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-6 py-2.5 text-[9px] font-medium uppercase tracking-[0.2em] transition-colors hover:bg-white/10",
                            currentLang === lang.code ? "text-white bg-white/5" : "text-zinc-400"
                          )}
                        >
                          {lang.code} <span className="font-light normal-case tracking-normal ml-2">{lang.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Role Switcher */}
              <div className="relative" ref={roleMenuRef}>
                <button 
                  onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                  className="flex items-center gap-2 text-[9px] font-medium text-white uppercase tracking-[0.25em] hover:text-zinc-400 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {currentRoleLabel}
                </button>
                
                <AnimatePresence>
                  {isRoleMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-6 w-56 bg-zinc-950 border border-white/10 shadow-2xl py-2 z-50"
                    >
                      {roles.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => {
                            setCurrentRole(r.value);
                            setIsRoleMenuOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-6 py-3 text-[9px] font-medium uppercase tracking-[0.2em] transition-colors hover:bg-white/10 flex items-center gap-3",
                            currentRole === r.value ? "text-white bg-white/5" : "text-zinc-400"
                          )}
                        >
                          {currentRole === r.value && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                          <span className={currentRole !== r.value ? "ml-4.5" : ""}>{r.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                {/* Search Button */}
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="text-zinc-400 hover:text-white transition-colors p-1.5"
                  aria-label="Arama"
                >
                  <Search className="w-4 h-4 stroke-[1.5]" />
                </button>

                {/* Dark Mode Toggle */}
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="text-zinc-400 hover:text-white transition-colors p-1.5"
                  aria-label="Gece Modu"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 stroke-[1.5]" /> : <Moon className="w-4 h-4 stroke-[1.5]" />}
                </button>
                
                {user && (
                   <button onClick={() => logout()} className="text-zinc-400 hover:text-white ml-2 text-[10px] uppercase tracking-[0.2em]">Çıkış</button>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden gap-6">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="Arama"
              >
                <Search className="w-5 h-5 stroke-[1.5]" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white z-[120] relative"
                aria-label="Open Mobile Menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6 stroke-[1.5]" /> : <Menu className="w-6 h-6 stroke-[1.5]" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation - Full Screen Editorial */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[110] bg-black flex flex-col justify-center px-8 sm:px-12 text-white"
          >
            <div className="flex flex-col gap-8">
              {navItems.map((item, i) => {
                const isActive = pathname === `${domainPath}${item.path}`;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1), duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={`${domainPath}${item.path}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "text-3xl sm:text-4xl font-serif tracking-tight transition-colors flex items-center justify-between group",
                        isActive ? "text-white" : "text-zinc-500 hover:text-white"
                      )}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}
              
              <div className="h-px bg-white/10 my-4" />
              
              {user ? (
                 <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-4"
                 >
                    <Link href={`${domainPath}/expo`} className="text-white text-xl font-serif" onClick={() => setIsMobileMenuOpen(false)}>Aipyram ID</Link>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-zinc-500 text-left text-xl font-serif">Çıkış Yap</button>
                 </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={`${domainPath}/login`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-3xl sm:text-4xl font-serif tracking-tight transition-colors flex items-center justify-between text-white"
                  >
                    Giriş Yap
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
