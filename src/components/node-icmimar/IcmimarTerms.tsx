'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Scale, CheckCircle, AlertTriangle } from 'lucide-react';

export default function IcmimarTerms() {
  const searchParams = useSearchParams();
  const langKey = searchParams?.get('lang')?.toUpperCase() || 'TR';

  return (
    <div className="flex flex-col bg-[#F9F9F6] text-[#111111] font-sans pt-32 pb-24 min-h-[calc(100vh-100px)]">
      <section className="max-w-[1000px] mx-auto px-6 md:px-12">
         <div className="flex items-center gap-4 mb-10">
           <div className="h-[1px] w-12 bg-[#8B7355]"></div>
           <span className="text-[#8B7355] uppercase tracking-[0.4em] text-[10px] font-bold">
             AIPYRAM GMBH
           </span>
         </div>
         
         <h1 className="font-serif text-4xl md:text-5xl text-[#111] mb-12 tracking-tight">
            Kullanım Koşulları ve API Lisans Sözleşmesi
         </h1>

         <div className="bg-white p-8 md:p-12 border border-[#111]/10 shadow-sm mb-12">
            <p className="text-zinc-500 font-medium leading-relaxed">
               Bu sözleşme, İcmimar.AI tarafından sunulan Bulut ERP, Smart Visualizer (WebGL Render) ve REST API hizmetlerinin B2B ticari kullanımı için geçerli olan sınırlamaları ve yükümlülükleri belirler. Hizmetlerimizi kullanarak bu şartları şirketiniz adına yasal olarak kabul etmiş sayılırsınız.
            </p>
         </div>

         <div className="space-y-12">
            {/* ITEM 1 */}
            <div className="flex gap-6">
               <div className="mt-1"><Scale className="w-6 h-6 text-[#111]" /></div>
               <div>
                  <h3 className="font-serif text-2xl text-[#111] mb-3">1. Lisanslama ve Fikri Mülkiyet</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed">
                     Platform üzerinden oluşturulan 3D Render ve PDF fatura çıktıları, lisans süreniz boyunca firmanızın ticari kullanımına aittir. Ancak &quot;İcmimar.AI&quot; render motoru yapısı, arayüz kodları, yapay zeka ağırlıkları ve &quot;Smart Visualizer&quot; marka hakları tamamen İsviçre merkezli Aipyram GmbH şirketine aittir. Reverse-engineering veya sistemin kopyalanması kesinlikle yasaktır.
                  </p>
               </div>
            </div>

            {/* ITEM 2 */}
            <div className="flex gap-6">
               <div className="mt-1"><AlertTriangle className="w-6 h-6 text-[#8B7355]" /></div>
               <div>
                  <h3 className="font-serif text-2xl text-[#111] mb-3">2. Fair Use Policy (Adil Kullanım Kotası)</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed">
                     &quot;Sınırsız Render&quot; ibaresine sahip Kurumsal üyelik planları, teknik altyapının stabilizasyonunu korumak amacıyla aylık 300 yüksek çözünürlüklü render (yaklaşık 1200 varyasyon) kapasitesine geldiğinde yumuşak bir sınırlandırmaya (soft-limit) tabi tutulur. Bu limiti aşan durumlarda Render hızı düşürülebilir veya ek donanım kullanım bedeli talep edilebilir. API ile otomatik (bot) render talepleri yasaktır.
                  </p>
               </div>
            </div>

            {/* ITEM 3 */}
            <div className="flex gap-6">
               <div className="mt-1"><CheckCircle className="w-6 h-6 text-[#111]" /></div>
               <div>
                  <h3 className="font-serif text-2xl text-[#111] mb-3">3. Uptime, SLA ve Sorumluluk Reddi</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed">
                     Aipyram GmbH, Enterprise paketi kullanıcıları için %99.9 sunucu çalışma süresi (Uptime) hedefler. Ancak Google Cloud altyapısında yaşanabilecek olası kesintiler, 3D çizim hataları veya proforma hesaplamalarındaki ölçü hataları nedeniyle doğabilecek ticari zararlardan dolayı sorumluluk kabul edilmez. Siparişlerin ve teknik çizimlerin üretime sokulmadan önce yetkili personel tarafından incelenmesi firmanızın sorumluluğundadır.
                  </p>
               </div>
            </div>
         </div>

         <div className="mt-16 pt-12 border-t border-[#111]/10">
            <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#111] mb-4">Uyuşmazlıkların Çözümü</h4>
            <p className="text-zinc-500 text-sm font-medium">Bu sözleşmeden doğan itilaflarda İsviçre kanunları uygulanacak olup, Zürih (İsviçre) Mahkemeleri münhasır yetkiye sahiptir.</p>
         </div>
      </section>
    </div>
  );
}
