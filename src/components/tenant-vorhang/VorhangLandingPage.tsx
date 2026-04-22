"use client";

import VorhangNavbar from "./VorhangNavbar";
import { ArrowRight, ShieldCheck, Camera, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function VorhangLandingPage() {
  return (
    <div className="min-h-screen bg-white text-black selection:bg-[#D4AF37] selection:text-white">
      <VorhangNavbar />

      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black text-white">
        {/* Background Image Placeholder or Gradient */}
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
           <Image 
             src="/images/trtex-hero-3.jpg" // Geçiçi bir B2B görseli kullanıyoruz
             alt="Vorhang Hero"
             fill
             className="object-cover"
             priority
           />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-serif leading-tight mb-6">
              Die Zukunft des <br/>
              <span className="text-[#D4AF37]">Vorhangs</span> beginnt hier.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl font-light">
              Entdecken Sie den weltweit ersten KI-gesteuerten B2B-Marktplatz für Vorhänge. 
              Visualisieren Sie in Echtzeit, kaufen Sie direkt beim Hersteller.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/try-at-home" className="group bg-white text-black px-8 py-4 rounded-sm font-medium flex items-center justify-center gap-2 hover:bg-[#D4AF37] hover:text-white transition-all">
                <Camera className="w-5 h-5" />
                In Ihrem Raum ansehen
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/products" className="group border border-white/30 px-8 py-4 rounded-sm font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                Kollektion entdecken
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif mb-2">Trendprodukte</h2>
              <p className="text-gray-500">Die beliebtesten B2B-Stoffe der Woche</p>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-2 text-sm font-medium hover:text-[#D4AF37] transition-colors">
              Alle ansehen <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Mock Products */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white p-4 border border-gray-100 shadow-sm group cursor-pointer hover:shadow-xl transition-all">
                <div className="relative aspect-[4/5] bg-gray-100 mb-4 overflow-hidden">
                   {/* Product Image Placeholder */}
                   <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                     <Sparkles className="w-8 h-8 opacity-20" />
                   </div>
                   <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-green-600" />
                      Geprüft
                   </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">Premium Blackout {item}</h3>
                    <p className="text-sm text-gray-500 mb-2">Weber Textil GmbH</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">€12.50</p>
                    <p className="text-[10px] text-gray-400 uppercase">Pro Meter</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SELLER CALL TO ACTION */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#D4AF37]/10 skew-x-12 translate-x-32" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-serif mb-6 leading-tight">
                Ihre Produkte auf der größten AI-Plattform.
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Erreichen Sie Tausende von Einzelhändlern weltweit. 
                Mit unserer KI-Visualisierung verkaufen sich Ihre Stoffe von selbst. 
                Keine Listing-Gebühren, nur Erfolgsbeteiligung.
              </p>
              <ul className="space-y-4 mb-10">
                {['Direkter B2B Zugang', 'Echtzeit-KI-Rendering', 'Garantierte Zahlungsabwicklung'].map((text, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                      <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                    </div>
                    <span className="font-medium">{text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/seller/register" className="inline-flex bg-[#D4AF37] text-black px-8 py-4 rounded-sm font-bold items-center gap-2 hover:bg-white transition-all">
                Händler werden <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="hidden md:block">
               {/* Abstract seller dashboard visual */}
               <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                     <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-red-500" />
                       <div className="w-3 h-3 rounded-full bg-yellow-500" />
                       <div className="w-3 h-3 rounded-full bg-green-500" />
                     </div>
                     <span className="text-xs text-gray-500 font-mono">Seller Dashboard v2.0</span>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                        <span className="text-sm">Umsatz (Dieser Monat)</span>
                        <span className="text-emerald-400 font-mono flex items-center gap-2">
                          <TrendingUp className="w-3 h-3" /> €42,500
                        </span>
                     </div>
                     <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                        <span className="text-sm">KI-Renderings Ihrer Stoffe</span>
                        <span className="text-[#D4AF37] font-mono">1,204</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black py-12 border-t border-white/10 text-center">
         <p className="text-gray-500 text-sm">
           &copy; {new Date().getFullYear()} Vorhang.ai Marketplace. Ein Teil des AIPyram Ökosystems.
         </p>
      </footer>
    </div>
  );
}
