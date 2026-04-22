import VorhangNavbar from "./VorhangNavbar";
import VorhangFooter from "./VorhangFooter";
import { ArrowRight, ShieldCheck, Camera, Sparkles, TrendingUp, CheckCircle, Smartphone, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function VorhangLandingPage({ products = [] }: { products?: any[] }) {
  // Use mock products if empty for development
  const displayProducts = products.length > 0 ? products : [
    { id: 1, name: "Premium Blackout Berlin", sellerName: "Weber Textil GmbH", price: 12.50 },
    { id: 2, name: "Leinen Natur München", sellerName: "EcoFabrics AG", price: 18.90 },
    { id: 3, name: "Samt Deluxe Wien", sellerName: "Österreich Weberei", price: 24.00 },
    { id: 4, name: "Akustik Pro Frankfurt", sellerName: "TechTex Solutions", price: 21.50 },
    { id: 5, name: "Voile Transparent", sellerName: "Weber Textil GmbH", price: 8.90 },
    { id: 6, name: "Outdoor SunProtect", sellerName: "SonnenSchutz KG", price: 15.00 },
  ];

  return (
    <div className="min-h-screen bg-white text-black selection:bg-[#D4AF37] selection:text-white font-sans">
      <VorhangNavbar />

      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black text-white">
        {/* Background Image Placeholder or Gradient */}
        <div className="absolute inset-0 z-0 opacity-50">
           <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
           <Image 
             src="https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=2800&auto=format&fit=crop"
             alt="Vorhang Hero"
             fill
             className="object-cover grayscale hover:grayscale-0 transition-all duration-[5s]"
             priority
           />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif font-medium leading-[1] mb-8 tracking-tighter">
              Die Zukunft des <br/>
              <span className="text-[#D4AF37] italic font-light">Vorhangs</span> beginnt hier.
            </h1>
            <p className="text-lg md:text-2xl text-gray-300 mb-12 max-w-2xl font-light leading-relaxed">
              Entdecken Sie den weltweit ersten KI-gesteuerten B2B-Marktplatz für Vorhänge. 
              Visualisieren Sie in Echtzeit, kaufen Sie direkt beim Hersteller.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/try-at-home" className="group bg-[#D4AF37] text-black px-10 py-5 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-3 hover:bg-white transition-all">
                <Camera className="w-4 h-4" />
                In Ihrem Raum ansehen
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link href="/products" className="group border border-white/30 bg-black/40 backdrop-blur-sm text-white px-10 py-5 text-xs uppercase tracking-widest font-bold flex items-center justify-center hover:bg-white hover:text-black transition-all">
                Kollektion entdecken
              </Link>
            </div>
          </div>
        </div>
        
        {/* Trust Badge Bar */}
        <div className="absolute bottom-0 left-0 w-full bg-black/80 backdrop-blur-md border-t border-white/10 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" /> Geprüfte Qualität
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <TrendingUp className="w-5 h-5 text-[#D4AF37]" /> Direkter B2B-Zugang
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" /> KI-Visualisierung
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Lock className="w-5 h-5 text-[#D4AF37]" /> Treuhand-Zahlung
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif mb-4">So funktioniert Vorhang.ai</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-16">Drei einfache Schritte zum perfekten B2B-Einkauf.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-px bg-gray-200 -z-10" />
            
            <div className="bg-white px-6">
              <div className="w-16 h-16 mx-auto bg-black text-white rounded-full flex items-center justify-center mb-6 text-xl font-serif relative">
                1
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-black">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 uppercase tracking-wider text-sm">Entdecken</h3>
              <p className="text-gray-500 text-sm">Durchsuchen Sie Tausende von verifizierten Stoffen direkt von globalen Herstellern.</p>
            </div>
            
            <div className="bg-white px-6">
              <div className="w-16 h-16 mx-auto bg-black text-white rounded-full flex items-center justify-center mb-6 text-xl font-serif relative">
                2
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-black">
                  <Smartphone className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 uppercase tracking-wider text-sm">Visualisieren</h3>
              <p className="text-gray-500 text-sm">Sehen Sie den Stoff mittels KI in verschiedenen Raumkonzepten und Lichtverhältnissen.</p>
            </div>
            
            <div className="bg-white px-6">
              <div className="w-16 h-16 mx-auto bg-black text-white rounded-full flex items-center justify-center mb-6 text-xl font-serif relative">
                3
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-black">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 uppercase tracking-wider text-sm">Bestellen</h3>
              <p className="text-gray-500 text-sm">Kaufen Sie sicher über unseren B2B-Treuhandservice zu Herstellerpreisen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="py-32 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-5xl font-serif mb-4 tracking-tight">Trendprodukte</h2>
              <p className="text-gray-500 text-lg">Die beliebtesten B2B-Stoffe der Woche im DACH-Raum</p>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-3 text-xs uppercase tracking-widest font-bold hover:text-[#D4AF37] transition-colors pb-2 border-b border-black hover:border-[#D4AF37]">
              Alle ansehen <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {displayProducts.map((item: any, idx: number) => (
              <Link href={`/products/${item.id}`} key={item.id} className="group cursor-pointer">
                <div className="relative aspect-[4/5] bg-gray-200 mb-6 overflow-hidden">
                   <img 
                     src={item.images?.[0] || `https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop&sig=${idx}`} 
                     alt={item.name}
                     className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105"
                   />
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 flex items-center gap-2 shadow-sm">
                      <ShieldCheck className="w-3 h-3 text-green-600" />
                      Geprüft
                   </div>
                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest">
                        Details ansehen
                      </div>
                   </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-2xl mb-1 group-hover:text-[#D4AF37] transition-colors">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.sellerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl">€{item.price.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Pro Meter</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NUMBERS METRICS */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="pt-8 md:pt-0">
              <div className="text-6xl md:text-8xl font-serif text-[#D4AF37] mb-4">12k+</div>
              <div className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Verfügbare Stoffe</div>
            </div>
            <div className="pt-8 md:pt-0">
              <div className="text-6xl md:text-8xl font-serif text-[#D4AF37] mb-4">500+</div>
              <div className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Geprüfte Händler</div>
            </div>
            <div className="pt-8 md:pt-0">
              <div className="text-6xl md:text-8xl font-serif text-[#D4AF37] mb-4">50+</div>
              <div className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Länder Weltweit</div>
            </div>
          </div>
        </div>
      </section>

      {/* SELLER CALL TO ACTION */}
      <section className="py-32 bg-[#f8f9fa] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[10px] uppercase tracking-[0.2em] mb-8">
                Für Hersteller
              </div>
              <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight tracking-tight">
                Ihre Produkte auf der größten AI-Plattform.
              </h2>
              <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                Erreichen Sie Tausende von Einzelhändlern weltweit. 
                Mit unserer KI-Visualisierung verkaufen sich Ihre Stoffe von selbst. 
                Keine Listing-Gebühren, nur Erfolgsbeteiligung.
              </p>
              <ul className="space-y-6 mb-12">
                {['Direkter B2B Zugang in Europa', 'Echtzeit-KI-Rendering (Perde.ai Engine)', 'Garantierte Zahlungsabwicklung'].map((text, i) => (
                  <li key={i} className="flex items-center gap-4 border-b border-gray-200 pb-4">
                    <div className="w-8 h-8 rounded bg-black flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <span className="font-bold">{text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/seller/register" className="inline-flex bg-black text-white px-10 py-5 text-xs uppercase tracking-widest font-bold items-center gap-3 hover:bg-[#D4AF37] transition-all">
                Händler werden <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="hidden md:block">
               <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-2xl relative">
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#D4AF37] rounded-full blur-3xl opacity-20" />
                  <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8 relative z-10">
                     <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-gray-200" />
                       <div className="w-3 h-3 rounded-full bg-gray-200" />
                       <div className="w-3 h-3 rounded-full bg-gray-200" />
                     </div>
                     <span className="text-xs text-gray-500 font-mono uppercase tracking-widest font-bold">Seller Dashboard v2.0</span>
                  </div>
                  <div className="space-y-6 relative z-10">
                     <div className="flex justify-between items-center p-6 bg-gray-50 rounded border border-gray-100">
                        <span className="text-sm font-bold uppercase tracking-widest">Umsatz (Dieser Monat)</span>
                        <span className="text-emerald-600 font-mono text-xl flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" /> €42,500
                        </span>
                     </div>
                     <div className="flex justify-between items-center p-6 bg-gray-50 rounded border border-gray-100">
                        <span className="text-sm font-bold uppercase tracking-widest">KI-Renderings Ihrer Stoffe</span>
                        <span className="text-[#D4AF37] font-mono text-xl">1,204</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <VorhangFooter />
    </div>
  );
}
