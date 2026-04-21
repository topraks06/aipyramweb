
'use client';

import { useState, useRef, useEffect } from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { languages } from '@/lib/i18n';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentLang = languages.find(l => l.code === language) || languages[1];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 border border-[#C9A84C]/20 hover:border-[#C9A84C]/50 rounded-sm text-[#8A9BB0] hover:text-[#F2EDE4] transition-all text-xs font-medium"
      >
        <span className="text-base leading-none">{currentLang?.flag}</span>
        <span className="hidden sm:inline uppercase tracking-wide">{currentLang?.code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#0A1520] border border-[#C9A84C]/20 rounded-sm shadow-2xl shadow-black/50 z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code); setOpen(false); }}
              className={`w-full px-4 py-2.5 text-left flex items-center gap-3 text-xs font-medium transition-colors ${
                language === lang.code
                  ? 'bg-[#C9A84C]/10 text-[#C9A84C]'
                  : 'text-[#8A9BB0] hover:text-[#F2EDE4] hover:bg-white/5'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.name}</span>
              {language === lang.code && <span className="ml-auto text-[#C9A84C] text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
