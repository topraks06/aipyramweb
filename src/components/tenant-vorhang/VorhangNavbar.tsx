"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Globe, User, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CartSidebar } from "./CartSidebar";

export default function VorhangNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-white font-serif text-2xl tracking-widest uppercase">
              Vorhang
              <span className="text-[#D4AF37] text-xs align-top ml-1 font-sans">.AI</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Produkte
            </Link>
            <Link href="/seller" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm font-medium">
              Für Händler
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Über Uns
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">
              Kontakt
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4" />
              <span>DE</span>
            </button>
            <button onClick={() => setIsCartOpen(true)} className="text-gray-300 hover:text-white transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
            </button>
            <button className="bg-white text-black px-5 py-2 rounded-sm text-sm font-medium hover:bg-[#D4AF37] hover:text-white transition-all">
              Anmelden
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsCartOpen(true)} className="text-gray-300 hover:text-white relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 left-0 w-full bg-black/95 border-b border-white/10"
          >
            <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col">
              <Link href="/products" className="text-gray-300 hover:text-white text-lg font-medium p-2" onClick={() => setIsOpen(false)}>Produkte</Link>
              <Link href="/seller" className="text-[#D4AF37] text-lg font-medium p-2" onClick={() => setIsOpen(false)}>Für Händler</Link>
              <Link href="/about" className="text-gray-300 hover:text-white text-lg font-medium p-2" onClick={() => setIsOpen(false)}>Über Uns</Link>
              <Link href="/contact" className="text-gray-300 hover:text-white text-lg font-medium p-2" onClick={() => setIsOpen(false)}>Kontakt</Link>
              
              <div className="h-px bg-white/10 my-4" />
              
              <button className="flex items-center gap-3 text-gray-300 p-2">
                <Globe className="w-5 h-5" />
                <span>Sprache: Deutsch</span>
              </button>
              <button className="flex items-center gap-3 text-gray-300 p-2">
                <User className="w-5 h-5" />
                <span>Anmelden</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
}
