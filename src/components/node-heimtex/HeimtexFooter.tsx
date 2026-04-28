"use client";
import Link from 'next/link';
import { Globe } from 'lucide-react';

export default function HeimtexFooter({ basePath = '/sites/heimtex.ai' }: { basePath?: string }) {
  return (
    <footer className="bg-zinc-950 text-zinc-500 py-16 px-6 md:px-12 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div>
          <h3 className="text-white font-serif text-xl tracking-widest uppercase mb-4 flex flex-col leading-none">
            <span>Heimtex<span className="text-red-500">.ai</span></span>
          </h3>
          <p className="text-sm font-light leading-relaxed mt-2 text-zinc-400">
            The Digital Vogue for Home Textiles. Trend forecasting, Pantone color analysis, and global design magazine.
          </p>
        </div>

        {/* Navigate */}
        <div>
          <h4 className="text-white text-[10px] uppercase tracking-[0.3em] font-bold mb-6">Navigate</h4>
          <div className="space-y-3 text-sm">
            <Link href={`${basePath}/trends`} className="block hover:text-red-500 transition-colors">Trends & Forecasting</Link>
            <Link href={`${basePath}/magazine`} className="block hover:text-red-500 transition-colors">Editorial Magazine</Link>
            <Link href={`${basePath}/pantone`} className="block hover:text-red-500 transition-colors">Pantone Colors</Link>
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white text-[10px] uppercase tracking-[0.3em] font-bold mb-6">Legal</h4>
          <div className="space-y-3 text-sm">
            <Link href={`${basePath}/about`} className="block hover:text-white transition-colors">About Us</Link>
            <Link href={`${basePath}/privacy`} className="block hover:text-white transition-colors">Privacy Policy</Link>
            <Link href={`${basePath}/terms`} className="block hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>

        {/* Connect */}
        <div>
          <h4 className="text-white text-[10px] uppercase tracking-[0.3em] font-bold mb-6">Connect</h4>
          <div className="flex items-start gap-3 text-sm mt-2">
            <Globe className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span className="font-light leading-relaxed text-zinc-400">
              Part of the AIPyram Sovereign Ecosystem. Connected globally.
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono tracking-widest">
        <span>© {new Date().getFullYear()} HEIMTEX.AI — DIGITAL VOGUE.</span>
        <span className="text-zinc-600">POWERED BY SOVEREIGN OS</span>
      </div>
    </footer>
  );
}
