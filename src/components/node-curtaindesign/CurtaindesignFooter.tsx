'use client';

import Link from 'next/link';
import { Globe } from 'lucide-react';

export default function CurtaindesignFooter({ basePath = '/sites/curtaindesign.ai' }: { basePath?: string }) {
  return (
    <footer className="bg-zinc-900 text-zinc-400 py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div>
          <h3 className="text-white font-serif text-xl tracking-widest uppercase mb-4">
            Curtain<span className="text-emerald-500">.AI</span>
          </h3>
          <p className="text-sm leading-relaxed">
            Premium curtain designs powered by AI. From Turkey's finest textile manufacturers to your home.
          </p>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-white text-xs uppercase tracking-[0.2em] font-bold mb-4">Shop</h4>
          <div className="space-y-2 text-sm">
            <Link href={`${basePath}/collections`} className="block hover:text-white transition-colors">Collections</Link>
            <Link href={`${basePath}/how-it-works`} className="block hover:text-white transition-colors">How It Works</Link>
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white text-xs uppercase tracking-[0.2em] font-bold mb-4">Company</h4>
          <div className="space-y-2 text-sm">
            <Link href={`${basePath}/about`} className="block hover:text-white transition-colors">About Us</Link>
            <Link href={`${basePath}/contact`} className="block hover:text-white transition-colors">Contact</Link>
            <Link href={`${basePath}/privacy`} className="block hover:text-white transition-colors">Privacy Policy</Link>
            <Link href={`${basePath}/terms`} className="block hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>

        {/* Connect */}
        <div>
          <h4 className="text-white text-xs uppercase tracking-[0.2em] font-bold mb-4">Connect</h4>
          <div className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4" />
            <span>Part of the AIPyram Sovereign Ecosystem</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <span>© {new Date().getFullYear()} CurtainDesign.AI — All rights reserved.</span>
        <span className="text-zinc-500">Powered by AIPyram Sovereign OS</span>
      </div>
    </footer>
  );
}
