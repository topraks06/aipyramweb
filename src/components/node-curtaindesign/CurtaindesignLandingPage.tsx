'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Truck, Palette, Sparkles } from 'lucide-react';
import CurtaindesignNavbar from './CurtaindesignNavbar';
import CurtaindesignFooter from './CurtaindesignFooter';

export default function CurtaindesignLandingPage({ products = [], basePath = '/sites/curtaindesign.ai' }: { products?: any[]; basePath?: string }) {
  const displayProducts = products;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-zinc-900 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <CurtaindesignNavbar basePath={basePath} />

      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-emerald-50/30 to-amber-50/20" />
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs uppercase tracking-[0.2em] font-semibold mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Design
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight leading-[0.9] mb-6">
            Premium Curtains
            <br />
            <span className="text-emerald-600">Designed by AI</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            From Turkey's finest textile manufacturers to your home. 
            AI-curated collections, precision-crafted with decades of artisan expertise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href={`${basePath}/collections`}
              className="bg-zinc-900 text-white px-10 py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-black transition-all flex items-center gap-3 justify-center group"
            >
              Browse Collections
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href={`${basePath}/how-it-works`}
              className="border-2 border-zinc-900 text-zinc-900 px-10 py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-zinc-900 hover:text-white transition-all text-center"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-16 px-6 border-y border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: 'Quality Guarantee', desc: 'Every fabric sourced from certified Turkish manufacturers with 30+ years of expertise.' },
            { icon: Truck, title: 'Worldwide Shipping', desc: 'Free shipping on orders over $200. Tracked delivery to 40+ countries.' },
            { icon: Palette, title: 'AI Customization', desc: 'Preview your curtains in your room before ordering with our AI visualization engine.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="p-3 bg-emerald-50 border border-emerald-100">
                <item.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Curated Collections</h2>
            <p className="text-zinc-500 max-w-lg mx-auto">Handpicked by our AI from Turkey's premium textile heritage.</p>
          </div>

          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayProducts.slice(0, 8).map((product: any, i: number) => (
                <div key={product.id || i} className="group bg-white border border-zinc-100 hover:border-zinc-300 hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[3/4] bg-zinc-100 relative overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name || 'Product'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300 text-sm">Image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-sm mb-1 truncate">{product.name || 'Premium Curtain'}</h3>
                    <p className="text-emerald-600 font-bold text-sm">{product.price ? `$${product.price}` : 'Contact for Price'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-zinc-100">
              <p className="text-zinc-400 text-sm mb-4">Collections are being curated by our AI engine.</p>
              <Link href={`${basePath}/contact`} className="text-emerald-600 text-sm font-semibold hover:underline">Contact us for early access →</Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-zinc-900 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Ready to Transform Your Space?</h2>
          <p className="text-zinc-400 mb-8">Join thousands of homeowners who trust AI-powered curtain design.</p>
          <Link 
            href={`${basePath}/login`}
            className="inline-flex items-center gap-3 bg-white text-zinc-900 px-10 py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-zinc-100 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Get Started Free
          </Link>
        </div>
      </section>

      <CurtaindesignFooter basePath={basePath} />
    </div>
  );
}
