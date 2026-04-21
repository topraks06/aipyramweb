"use client";

import { useState, useEffect } from "react";
import { Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇨🇭" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ar", label: "العربية", flag: "🇦🇪" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

export default function TrtexHeader({ domain, lang = "tr" }: { domain: string, lang?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "?lang=" + lang + "&page=news", label: lang === 'tr' ? "Haber Motoru" : "News Engine" },
    { href: "?lang=" + lang + "&page=markets", label: lang === 'tr' ? "Canlı Piyasalar" : "Live Markets" },
    { href: "?lang=" + lang + "&page=radar", label: lang === 'tr' ? "Fırsat Radarı" : "Opportunity Radar" },
    { href: "?lang=" + lang + "&page=reports", label: lang === 'tr' ? "AI Raporları" : "AI Reports" },
  ];

  const handleLanguageChange = (code: string) => {
    // Tenant domains don't use next-intl middleware directly in URL path, we pass it as a query param.
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", code);
      window.location.href = url.toString();
    }
  };

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/10 ${
        isScrolled ? "bg-black/90 backdrop-blur-xl shadow-lg" : "bg-black"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href={"?lang=" + lang} className="flex items-center space-x-2">
            <div className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-white">
              {domain.split(".")[0]}
              <span className="text-emerald-400">.</span>
              <span className="text-base text-white/50">{domain.split(".")[1]}</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-emerald-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-white hover:text-emerald-400 hover:bg-white/5">
                  <Globe className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wider">{currentLang.code}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 bg-black border border-white/20 text-white">
                {LANGUAGES.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => handleLanguageChange(l.code)}
                    className={`text-xs cursor-pointer hover:bg-emerald-900/50 hover:text-emerald-400 ${
                      l.code === lang ? "font-bold text-emerald-400 bg-white/5" : ""
                    }`}
                  >
                    <span className="mr-2">{l.flag}</span>
                    {l.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 bg-black">
            <nav className="flex flex-col space-y-4 px-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-emerald-400 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
