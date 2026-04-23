import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Globe } from 'lucide-react';

interface VorhangFooterProps {
  basePath?: string;
  lang?: string;
}

export default function VorhangFooter({ basePath = '', lang = 'de' }: VorhangFooterProps) {
  return (
    <footer className="bg-black py-20 mt-auto border-t border-white/10 text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <span className="font-serif text-3xl text-white block mb-6">
              Vorhang<span className="text-[#D4AF37]">.ai</span>
            </span>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Der KI-gesteuerte B2B-Marktplatz für die Textilindustrie. 
              Wir verbinden Hersteller direkt mit dem europäischen Einzelhandel.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
                <Globe className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
                <Lock className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-[#D4AF37] font-bold uppercase tracking-wider text-xs mb-6">Marktplatz</h4>
            <ul className="space-y-4">
              <li><Link href={`${basePath}/products`} className="text-gray-400 hover:text-white text-sm transition-colors">Alle Produkte</Link></li>
              <li><Link href={`${basePath}/try-at-home`} className="text-gray-400 hover:text-white text-sm transition-colors">KI-Visualisierung</Link></li>
              <li><Link href={`${basePath}/seller/register`} className="text-gray-400 hover:text-white text-sm transition-colors">Händler werden</Link></li>
              <li><Link href={`${basePath}/seller`} className="text-gray-400 hover:text-white text-sm transition-colors">Seller Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#D4AF37] font-bold uppercase tracking-wider text-xs mb-6">Rechtliches</h4>
            <ul className="space-y-4">
              <li><Link href={`${basePath}/impressum`} className="text-gray-400 hover:text-white text-sm transition-colors">Impressum</Link></li>
              <li><Link href={`${basePath}/datenschutz`} className="text-gray-400 hover:text-white text-sm transition-colors">Datenschutzerklärung</Link></li>
              <li><Link href={`${basePath}/agb`} className="text-gray-400 hover:text-white text-sm transition-colors">AGB</Link></li>
              <li><Link href={`${basePath}/widerruf`} className="text-gray-400 hover:text-white text-sm transition-colors">Widerrufsrecht</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#D4AF37] font-bold uppercase tracking-wider text-xs mb-6">Sichere Zahlung</h4>
            <div className="flex gap-2 mb-4">
               {/* Stripe, Visa, MC etc mock icons */}
               <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center text-[8px] font-bold">VISA</div>
               <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center text-[8px] font-bold">MC</div>
               <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center text-[8px] font-bold">SEPA</div>
            </div>
            <p className="text-xs text-gray-500">Zahlungen werden sicher durch Stripe verarbeitet. Treuhandservice für B2B-Transaktionen.</p>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Vorhang.ai Marketplace. Alle Rechte vorbehalten.
          </p>
          <p className="text-xs text-gray-500">
            Ein Teil des AIPyram Ökosystems.
          </p>
        </div>
      </div>
    </footer>
  );
}
