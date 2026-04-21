
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/i18n';
import { useAuth } from '@/components/auth/AuthProvider';
import { Menu, X, Sparkles, ExternalLink, Bot, Grid3x3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = (key: string) => getTranslation(language, key);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/fair', label: t('nav.fair') },
    {
      href: '/collections',
      label:
        language === 'tr' ? 'Koleksiyonlar' :
        language === 'de' ? 'Kollektionen' :
        language === 'fr' ? 'Collections' :
        language === 'ar' ? 'المجموعات' :
        language === 'ru' ? 'Коллекции' :
        language === 'zh' ? '系列' : 'Collections',
    },
    { href: '/suppliers', label: t('nav.suppliers') },
    { href: '/showrooms', label: t('nav.showrooms') },
    {
      href: '/categories',
      label:
        language === 'tr' ? 'Kategoriler' :
        language === 'ar' ? 'الفئات' :
        language === 'ru' ? 'Категории' :
        'Categories',
      icon: Grid3x3,
    },
    { href: '/requests', label: t('nav.requests') },
    { href: '/agents', label: t('nav.agents'), icon: Bot },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm shadow-slate-100'
          : 'bg-white border-b border-slate-100'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 border border-[#1E3A5F]/30 rounded-sm flex items-center justify-center group-hover:border-[#1E3A5F] transition-colors bg-[#1E3A5F]/5">
                <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-playfair)', color: '#1E3A5F' }}>H</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#B8922A] rounded-full opacity-90" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[#1E3A5F]" style={{ fontFamily: 'var(--font-playfair)' }}>
                Hometex<span className="text-[#B8922A]">.ai</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-[0.15em] uppercase hidden sm:block">
                Global Textile Fair
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-sm font-medium tracking-wide transition-all duration-200 flex items-center gap-1.5 rounded-sm ${
                  isActive(link.href)
                    ? 'text-[#1E3A5F] bg-[#1E3A5F]/5'
                    : 'text-slate-500 hover:text-[#1E3A5F] hover:bg-slate-50'
                }`}
              >
                {link.icon && <link.icon className="w-3.5 h-3.5" />}
                {link.label}
                {isActive(link.href) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#B8922A] rounded-full"
                  />
                )}
              </Link>
            ))}
            <div className="w-px h-5 bg-slate-200 mx-2" />
            <a
              href="https://perde.ai?utm_source=hometex&utm_medium=navbar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#B8922A]/70 hover:text-[#B8922A] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              perde.ai
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            {user ? (
              <Button
                size="sm"
                className="btn-navy text-xs px-5 py-2 rounded-sm hidden sm:flex"
                onClick={() => router.push('/dashboard')}
              >
                {t('nav.dashboard')}
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-[#1E3A5F] text-sm font-medium hidden sm:flex"
                  onClick={() => router.push('/login')}
                >
                  {t('nav.login')}
                </Button>
                <Button
                  size="sm"
                  className="btn-navy text-xs px-5 py-2 rounded-sm hidden sm:flex"
                  onClick={() => router.push('/login')}
                >
                  {t('nav.register')}
                </Button>
              </>
            )}
            <button
              className="lg:hidden p-2 text-slate-500 hover:text-[#1E3A5F] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pb-4 border-t border-slate-100 pt-4 space-y-1 overflow-hidden"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-sm ${
                    isActive(link.href)
                      ? 'text-[#1E3A5F] bg-[#1E3A5F]/5'
                      : 'text-slate-500 hover:text-[#1E3A5F] hover:bg-slate-50'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.icon && <link.icon className="w-3.5 h-3.5" />}
                  {link.label}
                </Link>
              ))}
              <a
                href="https://perde.ai?utm_source=hometex&utm_medium=mobile_navbar"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[#B8922A]/70"
              >
                <Sparkles className="w-3.5 h-3.5" /> perde.ai
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
              <div className="pt-3 px-4">
                <Button
                  size="sm"
                  className="btn-navy w-full rounded-sm"
                  onClick={() => {
                    router.push(user ? '/dashboard' : '/login');
                    setMobileOpen(false);
                  }}
                >
                  {user ? t('nav.dashboard') : t('nav.login')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
