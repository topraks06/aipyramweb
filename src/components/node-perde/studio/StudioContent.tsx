'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import MyProjects from '@/components/node-perde/MyProjects';
import Link from 'next/link';
import { Box, Scissors, LayoutDashboard } from 'lucide-react';

interface StudioContentProps {
  basePath: string;
}

export default function StudioContent({ basePath }: StudioContentProps) {
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab') || 'dashboard';

  React.useEffect(() => {
     if (searchParams?.get('payment') === 'success') {
         // Yönlendirme sonrasında ufak şık bildirim (alert yerine)
         const { toast } = require('react-hot-toast');
         toast.success('Ödeme başarıyla tamamlandı! Kredileriniz yüklendi.', {
             style: {
                 border: '1px solid #713200',
                 padding: '16px',
                 color: '#713200',
             },
             iconTheme: {
                 primary: '#713200',
                 secondary: '#FFFAEE',
             },
         });
     }
  }, [searchParams]);

  if (tab === 'inventory') {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-white border border-[#111]/10 flex items-center justify-center"><Box className="w-5 h-5 text-[#8B7355]"/></div>
           <h2 className="text-3xl font-serif text-[#111]">Kumaş Stoğu</h2>
        </div>
        <div className="bg-white p-12 border border-[#111]/10 shadow-sm flex flex-col items-center justify-center text-center h-[60dvh]">
           <Box className="w-16 h-16 text-zinc-200 mb-6" />
           <h3 className="text-xl font-serif text-[#111] mb-2">Kayıtlı Kumaş Bulunamadı</h3>
           <p className="text-zinc-500 font-light max-w-sm mb-8">Mağazanızdaki fiziksel kumaşların fotoğraflarını yapay zekaya tanıtın. Öğretilen kumaşlar Akıllı Çizim Ekranında kullanılabilir olacak.</p>
           <button className="px-6 py-3 bg-[#111] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-black rounded-sm">
             Yeni Kumaş Öğret
           </button>
        </div>
      </div>
    );
  }

  if (tab === 'orders') {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-white border border-[#111]/10 flex items-center justify-center"><Scissors className="w-5 h-5 text-[#8B7355]"/></div>
           <h2 className="text-3xl font-serif text-[#111]">Siparişler ve Teklifler</h2>
        </div>
        <div className="bg-white p-12 border border-[#111]/10 shadow-sm flex flex-col items-center justify-center text-center h-[60dvh]">
           <Scissors className="w-16 h-16 text-zinc-200 mb-6" />
           <h3 className="text-xl font-serif text-[#111] mb-2">Aktif Sipariş Yok</h3>
           <p className="text-zinc-500 font-light max-w-sm mb-8">Yapay zeka asistanı üzerinden müşterilerinize oluşturduğunuz teklifler onaylandığında burada listelenir.</p>
        </div>
      </div>
    );
  }

  // DEFAULT DASHBOARD
  return (
    <div className="max-w-7xl mx-auto space-y-12 p-8">
      <div className="bg-white p-8 border border-[#111111]/10 shadow-sm flex items-start justify-between gap-8 h-48">
          <div className="flex-1 flex flex-col justify-center h-full">
              <h2 className="text-2xl font-serif text-[#111] mb-2">Yapay Zeka İç Mimar</h2>
              <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold mb-8">Görsel Çizim ve Render Motoru</p>
              <Link href={`${basePath.replace('/studio', '/visualizer')}`} className="px-6 py-3 bg-[#111] text-white text-[10px] uppercase tracking-widest font-bold self-start hover:bg-black rounded-sm block text-center">
                  Çizim Ekranını Aç
              </Link>
          </div>
          <div className="w-1/3 h-full bg-zinc-100 flex items-center justify-center border border-dashed border-zinc-300">
              <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest text-center px-4">Son Çizim<br/>Önizlemesi</span>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="?tab=inventory" className="bg-white p-6 border border-[#111111]/10 shadow-sm h-40 flex flex-col justify-between hover:border-[#8B7355] transition-colors group cursor-pointer">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 group-hover:text-[#8B7355] transition-colors">Kumaş Stoğu</h3>
              <div className="text-3xl font-serif text-[#111]">0 <span className="text-sm font-sans text-zinc-400">Ürün</span></div>
              <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Henüz Kumaş Eklenmedi</p>
          </Link>
          <Link href="?tab=orders" className="bg-white p-6 border border-[#111111]/10 shadow-sm h-40 flex flex-col justify-between hover:border-[#8B7355] transition-colors group cursor-pointer">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 group-hover:text-[#8B7355] transition-colors">Aktif Siparişler</h3>
              <div className="text-3xl font-serif text-[#111]">0</div>
              <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Henüz Sipariş Yok</p>
          </Link>
          <div className="bg-white p-6 border border-[#111111]/10 shadow-sm h-40 flex flex-col justify-between">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Bekleyen Teklifler (Bakiye)</h3>
              <div className="text-3xl font-serif text-[#111]">₺0</div>
              <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Proforma Aşaması</p>
          </div>
      </div>
      
      <div className="pt-8">
            <h3 className="text-[14px] uppercase tracking-[0.2em] font-bold text-[#111] mb-8 pb-4 border-b border-[#111]/10">Son Kaydedilen Çizimler</h3>
            <div className="scale-95 origin-top-left -ml-[2.5%] w-[105%]">
              <MyProjects />
            </div>
      </div>
    </div>
  );
}
