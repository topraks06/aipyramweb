"use client";

import HometexNavbar from "./HometexNavbar";
import HometexFooter from "./HometexFooter";

export default function HometexPrivacy() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <HometexNavbar />
      <main className="flex-grow pt-32 pb-24 max-w-4xl mx-auto px-6 w-full">
        <h1 className="text-5xl font-serif mb-12 uppercase tracking-tighter">Gizlilik Politikası</h1>
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-zinc-400 font-light leading-relaxed mb-6">
            Hometex.ai olarak kişisel ve kurumsal verilerinizin güvenliğine önem veriyoruz. Bu gizlilik politikası, 
            aipyram platformu üzerinden toplanan verilerin nasıl işlendiğini açıklar.
          </p>
          <h2 className="text-2xl font-serif text-white mt-10 mb-4 uppercase tracking-widest text-sm">Veri Toplama</h2>
          <p className="text-zinc-400 font-light leading-relaxed mb-6">
            Platformumuza kayıt olduğunuzda, B2B eşleştirme algoritmalarımızı optimize etmek amacıyla şirket bilgilerinizi, 
            ürün tercihlerinizi ve fuar ziyaret verilerinizi topluyoruz.
          </p>
          <h2 className="text-2xl font-serif text-white mt-10 mb-4 uppercase tracking-widest text-sm">Veri Kullanımı ve Paylaşım</h2>
          <p className="text-zinc-400 font-light leading-relaxed mb-6">
            Toplanan veriler yalnızca platform içi deneyiminizi geliştirmek için kullanılır ve üçüncü taraf satıcılara satılmaz. 
            Yalnızca onayınız dahilinde fuar katılımcılarıyla (Exhibitors) iletişim bilgilerinizi paylaşabiliriz.
          </p>
        </div>
      </main>
      <HometexFooter />
    </div>
  );
}
