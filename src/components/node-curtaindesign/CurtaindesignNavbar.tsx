"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CurtaindesignNavbarProps {
  basePath?: string;
}

export default function CurtaindesignNavbar({ basePath = '/sites/curtaindesign.ai' }: CurtaindesignNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href={basePath} className="text-zinc-900 font-serif text-2xl tracking-widest uppercase">
              Curtain
              <span className="text-emerald-600 text-xs align-top ml-1 font-sans">.AI</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href={`${basePath}/collections`} className="text-zinc-600 hover:text-zinc-900 transition-colors text-sm font-medium">
              Collections
            </Link>
            <Link href={`${basePath}/how-it-works`} className="text-zinc-600 hover:text-zinc-900 transition-colors text-sm font-medium">
              How It Works
            </Link>
            <Link href={`${basePath}/contact`} className="text-zinc-600 hover:text-zinc-900 transition-colors text-sm font-medium">
              Contact
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href={`${basePath}/login`} className="text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-2 text-sm">
              <User className="w-4 h-4" />
              Account
            </Link>
            <Link 
              href={`${basePath}/login`}
              className="bg-zinc-900 text-white px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-black transition-colors"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-zinc-600"
            aria-label="Toggle menu"
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
            className="md:hidden bg-white border-t border-zinc-100"
          >
            <div className="px-4 py-6 space-y-4">
              <Link href={`${basePath}/collections`} onClick={() => setIsOpen(false)} className="block text-zinc-600 hover:text-zinc-900 text-sm font-medium">Collections</Link>
              <Link href={`${basePath}/how-it-works`} onClick={() => setIsOpen(false)} className="block text-zinc-600 hover:text-zinc-900 text-sm font-medium">How It Works</Link>
              <Link href={`${basePath}/contact`} onClick={() => setIsOpen(false)} className="block text-zinc-600 hover:text-zinc-900 text-sm font-medium">Contact</Link>
              <Link href={`${basePath}/login`} onClick={() => setIsOpen(false)} className="block bg-zinc-900 text-white text-center py-3 text-xs uppercase tracking-widest mt-4">
                Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
