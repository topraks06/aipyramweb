"use client";

import HometexNavbar from "./HometexNavbar";
import HometexFooter from "./HometexFooter";
import { Mail, MapPin, Phone } from "lucide-react";

export default function HometexContact() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <HometexNavbar />
      <main className="flex-grow pt-32 pb-24 max-w-7xl mx-auto px-6 w-full">
        <h1 className="text-5xl font-serif mb-12 uppercase tracking-tighter">İletişim</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <p className="text-xl text-zinc-400 font-light leading-relaxed mb-8">
              Sorularınız, işbirlikleri ve sistem entegrasyon talepleriniz için bize ulaşın.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-zinc-500 shrink-0" />
                <div>
                  <h3 className="font-bold uppercase tracking-widest text-xs mb-1">Merkez Ofis</h3>
                  <p className="text-zinc-400 text-sm">Maslak, Büyükdere Cd. No:255 Nurol Plaza<br/>Sarıyer, İstanbul, Türkiye</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-zinc-500 shrink-0" />
                <div>
                  <h3 className="font-bold uppercase tracking-widest text-xs mb-1">E-Posta</h3>
                  <p className="text-zinc-400 text-sm">contact@hometex.ai</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-zinc-500 shrink-0" />
                <div>
                  <h3 className="font-bold uppercase tracking-widest text-xs mb-1">Telefon</h3>
                  <p className="text-zinc-400 text-sm">+90 850 123 45 67</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-950 p-8 border border-white/10">
            <form className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Ad Soyad</label>
                <input type="text" className="w-full bg-black border border-white/20 p-3 outline-none focus:border-white transition-colors text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">E-Posta</label>
                <input type="email" className="w-full bg-black border border-white/20 p-3 outline-none focus:border-white transition-colors text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Mesajınız</label>
                <textarea rows={4} className="w-full bg-black border border-white/20 p-3 outline-none focus:border-white transition-colors text-white"></textarea>
              </div>
              <button type="button" className="w-full bg-white text-black py-4 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                Gönder
              </button>
            </form>
          </div>
        </div>
      </main>
      <HometexFooter />
    </div>
  );
}
