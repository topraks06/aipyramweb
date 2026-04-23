"use client";

import HometexNavbar from "./HometexNavbar";
import HometexFooter from "./HometexFooter";

export default function HometexAbout() {
  return (
    <div className="min-h-screen bg-black text-white">
      <HometexNavbar />
      <main className="pt-32 pb-24 max-w-4xl mx-auto px-6">
        <h1 className="text-5xl font-serif mb-8 uppercase tracking-tighter">Hakkımızda</h1>
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-xl text-zinc-400 font-light leading-relaxed mb-8">
            Hometex.ai, ev tekstili dünyasını dijitalleştiren yeni nesil bir B2B istihbarat ve fuar platformudur. 
            AIPyram ekosisteminin bir parçası olarak, global üreticileri ve perakendecileri yapay zeka destekli araçlarla bir araya getiriyoruz.
          </p>
          <p className="text-zinc-400 font-light leading-relaxed mb-6">
            Geleneksel fuar deneyimini 365 güne yayarak, dijital showroom'lar, yapay zeka trend analizleri ve 
            otonom matchmaking algoritmaları ile ticareti hızlandırıyoruz.
          </p>
        </div>
      </main>
      <HometexFooter />
    </div>
  );
}
