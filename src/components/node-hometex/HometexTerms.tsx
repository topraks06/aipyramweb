"use client";

import HometexNavbar from "./HometexNavbar";
import HometexFooter from "./HometexFooter";

export default function HometexTerms() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <HometexNavbar />
      <main className="flex-grow pt-32 pb-24 max-w-4xl mx-auto px-6 w-full">
        <h1 className="text-5xl font-serif mb-12 uppercase tracking-tighter">Kullanım Koşulları</h1>
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-zinc-400 font-light leading-relaxed mb-6">
            aipyram ekosisteminin bir parçası olan Hometex.ai platformunu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
          </p>
          <h2 className="text-2xl font-serif text-white mt-10 mb-4 uppercase tracking-widest text-sm">Hizmet Kullanımı</h2>
          <p className="text-zinc-400 font-light leading-relaxed mb-6">
            Platform üzerinde sunulan B2B eşleştirme, dijital showroom ve yapay zeka analiz araçları yalnızca kurumsal (B2B) kullanıcılar içindir. 
            Bireysel alım satım işlemleri platform dışıdır.
          </p>
          <h2 className="text-2xl font-serif text-white mt-10 mb-4 uppercase tracking-widest text-sm">İçerik Sorumluluğu</h2>
          <p className="text-zinc-400 font-light leading-relaxed mb-6">
            Katılımcı firmalar (Exhibitors) tarafından yüklenen katalog bilgileri, görseller ve ürün açıklamalarının doğruluğundan 
            tamamen ilgili firma sorumludur. Hometex.ai içeriklerin telif haklarından sorumlu tutulamaz.
          </p>
        </div>
      </main>
      <HometexFooter />
    </div>
  );
}
