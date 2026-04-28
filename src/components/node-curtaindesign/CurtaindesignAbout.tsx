"use client";
import CurtaindesignNavbar from "./CurtaindesignNavbar";
import CurtaindesignFooter from "./CurtaindesignFooter";
import { Globe, Sparkles, Users, Shield } from 'lucide-react';

export default function CurtaindesignAbout({ basePath = '/sites/curtaindesign.ai' }: { basePath?: string }) {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      <CurtaindesignNavbar basePath={basePath} />

      <main className="pt-32 pb-24">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 lg:px-8 mb-24 text-center">
          <span className="text-amber-600 text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block">Our Story</span>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-8 leading-tight">
            Designing the Future of Home Textiles
          </h1>
          <p className="text-zinc-500 text-lg font-light max-w-2xl mx-auto leading-relaxed">
            CurtainDesign.ai is a global marketplace that connects artisan-crafted curtains and home textiles with discerning customers worldwide — powered by AI-driven design technology.
          </p>
        </section>

        {/* Values Grid */}
        <section className="max-w-6xl mx-auto px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-zinc-50 p-8 rounded-sm border border-zinc-100">
              <Globe className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="font-serif text-xl mb-3">Global Reach</h3>
              <p className="text-zinc-500 text-sm font-light leading-relaxed">
                Connecting Turkey&apos;s finest textile manufacturers with homes across Europe, Asia, and the Americas.
              </p>
            </div>
            <div className="bg-zinc-50 p-8 rounded-sm border border-zinc-100">
              <Sparkles className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="font-serif text-xl mb-3">AI-Powered Design</h3>
              <p className="text-zinc-500 text-sm font-light leading-relaxed">
                Upload your room photo, select a fabric, and see a photorealistic preview before you buy.
              </p>
            </div>
            <div className="bg-zinc-50 p-8 rounded-sm border border-zinc-100">
              <Users className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="font-serif text-xl mb-3">Artisan Network</h3>
              <p className="text-zinc-500 text-sm font-light leading-relaxed">
                We partner with master weavers in Bursa, Denizli, and Gaziantep — ensuring every product is authentic.
              </p>
            </div>
            <div className="bg-zinc-50 p-8 rounded-sm border border-zinc-100">
              <Shield className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="font-serif text-xl mb-3">Quality Guaranteed</h3>
              <p className="text-zinc-500 text-sm font-light leading-relaxed">
                Every textile passes rigorous quality checks. 30-day return policy on all international orders.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="max-w-4xl mx-auto px-6 lg:px-8 mb-24">
          <div className="border-t border-zinc-200 pt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-serif text-3xl tracking-tight mb-6">Part of AIPyram Ecosystem</h2>
                <p className="text-zinc-500 text-sm font-light leading-relaxed mb-4">
                  CurtainDesign.ai is a node within the AIPyram Sovereign Ecosystem — a network of AI-powered platforms spanning trade intelligence, design tools, and virtual showrooms.
                </p>
                <p className="text-zinc-500 text-sm font-light leading-relaxed">
                  Our sister platforms include Perde.ai (Turkey), Vorhang.ai (DACH), Hometex.ai (Virtual Fair), and Heimtex.ai (Trend Magazine). Together, we represent the most comprehensive textile technology network in the world.
                </p>
              </div>
              <div className="bg-zinc-900 text-white p-10 rounded-sm">
                <div className="text-5xl font-serif font-bold text-amber-500 mb-4">6+</div>
                <p className="text-zinc-400 text-sm font-light mb-6">Connected platforms across the Sovereign OS network</p>
                <div className="space-y-3 text-xs tracking-widest uppercase text-zinc-500">
                  <div>Perde.ai — Turkey B2C</div>
                  <div>Vorhang.ai — DACH B2C</div>
                  <div>TRTex.com — B2B Intelligence</div>
                  <div>Hometex.ai — Virtual Fair</div>
                  <div>Heimtex.ai — Trend Magazine</div>
                  <div>icmimar.ai — Design ERP</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CurtaindesignFooter basePath={basePath} />
    </div>
  );
}
