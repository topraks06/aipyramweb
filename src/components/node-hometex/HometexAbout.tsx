"use client";
import HometexNavbar from "./HometexNavbar";
import HometexFooter from "./HometexFooter";
import { Globe, Target, Layers, Users } from 'lucide-react';
import Link from 'next/link';

export default function HometexAbout() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <HometexNavbar />

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 lg:px-8 mb-24 text-center">
          <span className="text-zinc-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block">Hakkımızda</span>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-8 leading-tight">
            365 Gün Kesintisiz <br/><span className="text-zinc-400 italic">Sanal Fuar Deneyimi</span>
          </h1>
          <p className="text-zinc-400 text-lg font-light max-w-2xl mx-auto leading-relaxed">
            Hometex.ai, ev tekstili dünyasını dijitalleştiren yeni nesil bir B2B istihbarat ve fuar platformudur. Geleneksel fuar deneyimini 365 güne yayarak, global üreticileri ve perakendecileri yapay zeka destekli araçlarla bir araya getiriyoruz.
          </p>
        </section>

        {/* Stats */}
        <section className="max-w-6xl mx-auto px-6 lg:px-8 mb-24 border-y border-white/10 py-16 bg-zinc-950">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-serif font-bold text-white mb-2">0+</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Onaylı Katılımcı</div>
            </div>
            <div>
              <div className="text-4xl font-serif font-bold text-white mb-2">0+</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Sergilenen Ürün</div>
            </div>
            <div>
              <div className="text-4xl font-serif font-bold text-white mb-2">0</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Aktif Ülke</div>
            </div>
            <div>
              <div className="text-4xl font-serif font-bold text-white mb-2">365</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Gün Açık Fuar</div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="max-w-6xl mx-auto px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="bg-zinc-950 p-10 border border-white/5">
              <Globe className="w-8 h-8 text-zinc-400 mb-6" />
              <h3 className="text-2xl font-serif mb-4">Küresel Erişim</h3>
              <p className="text-zinc-500 font-light leading-relaxed">
                Fiziksel sınırları ortadan kaldırarak, dünyanın dört bir yanındaki alıcı ve satıcıları aynı dijital salonda buluşturuyoruz. Gelişmiş dil desteği ve lokalizasyon araçlarıyla kesintisiz ticaret sağlıyoruz.
              </p>
            </div>
            <div className="bg-zinc-950 p-10 border border-white/5">
              <Target className="w-8 h-8 text-zinc-400 mb-6" />
              <h3 className="text-2xl font-serif mb-4">Otonom Eşleştirme</h3>
              <p className="text-zinc-500 font-light leading-relaxed">
                Yapay zeka tabanlı matchmaking algoritmalarımız sayesinde, alıcıların aradıkları ürün gruplarına ve kapasite ihtiyaçlarına en uygun üreticileri anında bularak nokta atışı bağlantılar kurmalarını sağlıyoruz.
              </p>
            </div>
            <div className="bg-zinc-950 p-10 border border-white/5">
              <Layers className="w-8 h-8 text-zinc-400 mb-6" />
              <h3 className="text-2xl font-serif mb-4">Dijital Showroom'lar</h3>
              <p className="text-zinc-500 font-light leading-relaxed">
                Her katılımcı, ürünlerini 4K çözünürlüklü sanal stantlarda sergileyebilir. Ziyaretçiler, kumaş dokularını detaylıca inceleyebilir ve B2B toptan fiyat teklifi isteyebilir.
              </p>
            </div>
            <div className="bg-zinc-950 p-10 border border-white/5">
              <Users className="w-8 h-8 text-zinc-400 mb-6" />
              <h3 className="text-2xl font-serif mb-4">AIPyram Ekosistemi</h3>
              <p className="text-zinc-500 font-light leading-relaxed">
                Hometex.ai, AIPyram Sovereign OS'in kalbinde yer alır. Perde.ai, Heimtex.ai ve TRTex platformlarıyla tam entegre çalışarak uçtan uca tekstil çözümü sunar.
              </p>
            </div>
          </div>
        </section>

        {/* Ecosystem Interlinks */}
        <section className="max-w-4xl mx-auto px-6 lg:px-8 mb-16 text-center">
          <h2 className="text-3xl font-serif mb-6">Ekosistemi Keşfedin</h2>
          <p className="text-zinc-400 font-light mb-10 max-w-xl mx-auto">
            Hometex.ai, dünyanın en kapsamlı otonom tekstil ağı olan AIPyram Sovereign OS'in fuar ayağıdır.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="https://perde.ai" className="px-6 py-3 border border-white/20 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
              Perde.ai (Türkiye)
            </Link>
            <Link href="https://vorhang.ai" className="px-6 py-3 border border-white/20 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
              Vorhang.ai (DACH)
            </Link>
            <Link href="https://heimtex.ai" className="px-6 py-3 border border-white/20 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
              Heimtex.ai (Trend)
            </Link>
          </div>
        </section>
      </main>

      <HometexFooter />
    </div>
  );
}
