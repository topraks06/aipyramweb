'use client';

import React from 'react';
import { CreditCard, Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export default function FinancePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white mb-2">Finans & <span className="font-bold text-emerald-500">Tahsilat</span></h1>
          <p className="text-zinc-400">Müşterilerden beklenen tahsilatlar ve sistem kredileriniz.</p>
        </div>
        <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2">
          <CreditCard className="w-5 h-5" /> Kredi Yükle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
         <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
               <ArrowDownToLine className="w-5 h-5" />
               <h3 className="font-medium">ALINAN KAPORALAR (BU AY)</h3>
            </div>
            <p className="text-4xl font-light text-white">125.000 <span className="text-sm text-zinc-500">TL</span></p>
         </div>
         <div className="bg-amber-950/30 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-amber-400">
               <ArrowUpFromLine className="w-5 h-5" />
               <h3 className="font-medium">BEKLEYEN TAHSİLAT</h3>
            </div>
            <p className="text-4xl font-light text-white">45.000 <span className="text-sm text-zinc-500">TL</span></p>
         </div>
      </div>

      <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
         <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/10">
               <Wallet className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
               <h2 className="text-xl font-medium text-white">ALOHA Tasarım Kredisi</h2>
               <p className="text-sm text-zinc-400">Mevcut Bakiye: <span className="text-emerald-400 font-bold">1,250 Kredi</span></p>
            </div>
         </div>
         <p className="text-zinc-500 text-sm">
            Tasarım motorunu kullanarak yaptığınız her yüksek çözünürlüklü render işlemi için kredinizden düşülür. 
            Kumaş arşivi (Memory) kullanıldığında %50 kredi iadesi sağlanır.
         </p>
      </div>
    </div>
  );
}
