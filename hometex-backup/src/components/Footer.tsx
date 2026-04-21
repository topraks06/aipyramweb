
'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/i18n';
import { ExternalLink, Globe, Newspaper, Palette, Sparkles } from 'lucide-react';

export function Footer() {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);

  return (
    <footer className="bg-[#1E3A5F] text-white border-t border-[#2C4F7C]">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 border border-white/20 rounded-sm flex items-center justify-center bg-white/10">
                <span className="font-bold text-sm text-white" style={{ fontFamily: 'var(--font-playfair)' }}>H</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
                  Hometex<span className="text-[#D4AF5A]">.ai</span>
                </h3>
                <p className="text-[10px] text-white/50 tracking-[0.15em] uppercase">Global Textile Fair</p>
              </div>
            </div>
            <p className="text-white/60 text-xs leading-relaxed mb-4 font-light">
              {language === 'tr'
                ? 'Dünyanın ilk AI destekli, canlı, sürekli değişen dijital tekstil fuarı. Markalar, koleksiyonlar ve alıcıları buluşturuyoruz.'
                : "The world's first AI-powered, living, continuously evolving digital textile fair. Connecting brands, collections and buyers."}
            </p>
            <a
              href="https://perde.ai?utm_source=hometex&utm_medium=footer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#D4AF5A]/30 hover:border-[#D4AF5A]/70 rounded-sm px-3 py-2 text-xs font-medium text-[#D4AF5A] transition-all hover:bg-[#D4AF5A]/10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {language === 'tr' ? "Perde.ai'de Tasarla" : 'Design in Perde.ai'}
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>

          <div>
            <h4 className="section-label text-[#D4AF5A] mb-4">Platform</h4>
            <ul className="space-y-2 text-white/60 text-xs font-light">
              <li><Link href="/fair" className="hover:text-[#D4AF5A] transition-colors">{language === 'tr' ? 'Fuarı Gez' : 'Explore Fair'}</Link></li>
              <li><Link href="/collections" className="hover:text-[#D4AF5A] transition-colors">{language === 'tr' ? 'Koleksiyonlar' : 'Collections'}</Link></li>
              <li><Link href="/suppliers" className="hover:text-[#D4AF5A] transition-colors">{t('nav.suppliers')}</Link></li>
              <li><Link href="/showrooms" className="hover:text-[#D4AF5A] transition-colors">{t('nav.showrooms')}</Link></li>
              <li><Link href="/categories" className="hover:text-[#D4AF5A] transition-colors">{language === 'tr' ? 'Kategoriler' : 'Categories'}</Link></li>
              <li><Link href="/requests" className="hover:text-[#D4AF5A] transition-colors">{t('nav.requests')}</Link></li>
              <li><Link href="/agents" className="hover:text-[#D4AF5A] transition-colors">{t('nav.agents')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="section-label text-[#D4AF5A] mb-4">Panel</h4>
            <ul className="space-y-2 text-white/60 text-xs font-light">
              <li><Link href="/dashboard" className="hover:text-[#D4AF5A] transition-colors">{t('dashboard.buyer')}</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#D4AF5A] transition-colors">{t('dashboard.supplier')}</Link></li>
              <li><Link href="/login" className="hover:text-[#D4AF5A] transition-colors">{t('nav.login')}</Link></li>
              <li><Link href="/login" className="hover:text-[#D4AF5A] transition-colors">{t('nav.register')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="section-label text-[#D4AF5A] mb-4">Ekosistem</h4>
            <ul className="space-y-2 text-white/60 text-xs font-light">
              <li>
                <a href="https://trtex.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF5A] transition-colors flex items-center gap-1.5">
                  <Newspaper className="w-3 h-3" /> TRTex.com <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              </li>
              <li>
                <a href="https://perde.ai" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF5A] transition-colors flex items-center gap-1.5">
                  <Palette className="w-3 h-3" /> Perde.ai <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              </li>
              <li>
                <a href="https://heimtex.ai" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF5A] transition-colors flex items-center gap-1.5">
                  <Globe className="w-3 h-3" /> Heimtex.ai <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs font-light">
            &copy; 2025 Hometex.ai. {language === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
          </p>
          <div className="flex gap-4 text-white/30 text-xs">
            <span>Powered by AI Agents · TRTex · Perde.ai</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
