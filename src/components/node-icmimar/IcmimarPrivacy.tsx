'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield, Lock, Eye, CheckCircle } from 'lucide-react';

export default function IcmimarPrivacy() {
  const searchParams = useSearchParams();
  const langKey = searchParams?.get('lang')?.toUpperCase() || 'TR';

  return (
    <div className="flex flex-col bg-[#F9F9F6] text-[#111111] font-sans pt-32 pb-24 min-h-[calc(100vh-100px)]">
      <section className="max-w-[1000px] mx-auto px-6 md:px-12">
         <div className="flex items-center gap-4 mb-10">
           <div className="h-[1px] w-12 bg-[#8B7355]"></div>
           <span className="text-[#8B7355] uppercase tracking-[0.4em] text-[10px] font-bold">
             aipyram GMBH
           </span>
         </div>
         
         <h1 className="font-serif text-4xl md:text-5xl text-[#111] mb-12 tracking-tight">
            Gizlilik ve K.V.K.K. Politikası
         </h1>

         <div className="bg-white p-8 md:p-12 border border-[#111]/10 shadow-sm mb-12">
            <p className="text-zinc-500 font-medium leading-relaxed mb-6">
               Aipyram GmbH (CH-8953 Dietikon, İsviçre) olarak, icmimar.ai B2B ERP ve Studio altyapısı üzerinde işlenen tüm görsel, teknik ve kişisel verilerinizin gizliliğine endüstriyel standartlarda önem veriyoruz. İsviçre Veri Koruma Yasası (FADP) ve Avrupa Birliği Genel Veri Koruma Yönetmeliği (GDPR) normlarına tam uyumlu çalışmaktayız.
            </p>
         </div>

         <div className="space-y-12">
            {/* ITEM 1 */}
            <div className="flex gap-6">
               <div className="mt-1"><Shield className="w-6 h-6 text-[#8B7355]" /></div>
               <div>
                  <h3 className="font-serif text-2xl text-[#111] mb-3">1. Toplanan Veriler ve Amacı</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed mb-4">
                     Platformumuza yüklediğiniz fiziki alan fotoğrafları (&quot;Mekan Taramaları&quot;), yalnızca yapay zeka render motorumuzun görselleştirme işlemini gerçekleştirmesi amacıyla işlenir. Bu görseller, aksi açıkça belirtilmedikçe genel makine öğrenimi modellerimizin eğitiminde (training data) kullanılmaz.
                  </p>
                  <p className="text-zinc-500 font-medium leading-relaxed">
                     B2B entegrasyon süreçlerinde sağlanan kurumsal kimlik, bayi bilgileri, fiyatlandırma stratejileri ve fatura/proforma dataları uçtan uca şifrelenir ve izole node (kiracı) mimarisinde tutulur.
                  </p>
               </div>
            </div>

            {/* ITEM 2 */}
            <div className="flex gap-6">
               <div className="mt-1"><Lock className="w-6 h-6 text-[#111]" /></div>
               <div>
                  <h3 className="font-serif text-2xl text-[#111] mb-3">2. Veri Güvenliği ve Altyapı</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed">
                     Sistem mimarimiz, yetkisiz erişimi engellemek için askeri sınıf AES-256 şifreleme ve Role-Based Access Control (RBAC) kullanmaktadır. Ana sunucularımız Avrupa bölgesinde barındırılmakta olup, Türkiye lokasyonundaki bayi verileri lokal KVKK yasalarına uygun olarak yedeklenmektedir.
                  </p>
               </div>
            </div>

            {/* ITEM 3 */}
            <div className="flex gap-6">
               <div className="mt-1"><Eye className="w-6 h-6 text-[#8B7355]" /></div>
               <div>
                  <h3 className="font-serif text-2xl text-[#111] mb-3">3. Üçüncü Taraflarla Paylaşım</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed">
                     icmimar.ai, kurumsal verilerinizi veri komisyoncularına veya reklam ağlarına ASLA satmaz. Verileriniz yalnızca Stripe (Ödeme altyapısı), Google Cloud (Sunucu altyapısı) gibi zorunlu uluslararası hizmet sağlayıcılarımızla güvenli protokoller çerçevesinde paylaşılır.
                  </p>
               </div>
            </div>
         </div>

         <div className="mt-16 pt-12 border-t border-[#111]/10">
            <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#111] mb-4">İletişim & Veri Sorumlusu</h4>
            <p className="text-zinc-500 text-sm font-medium">Bu politika ile ilgili silme, değiştirme veya dışa aktarma talepleriniz için <a href="mailto:privacy@aipyram.com" className="text-[#8B7355] font-bold hover:underline">privacy@aipyram.com</a> adresi üzerinden İsviçre merkez ofisimize ulaşabilirsiniz.</p>
            <p className="text-zinc-400 text-xs mt-4">Son Güncelleme: Nisan 2026</p>
         </div>
      </section>
    </div>
  );
}
