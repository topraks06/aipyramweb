'use client';

import React from 'react';
import { Package, Plus } from 'lucide-react';

export default function InventoryPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white mb-2">Kumaş <span className="font-bold text-emerald-500">Deposu</span></h1>
          <p className="text-zinc-400">Yüklediğiniz kendi kumaşlarınız ve sanal kartelanız.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" /> Yeni Kumaş Yükle
        </button>
      </div>

      <div className="flex-1 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center p-12 bg-black/20">
        <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 text-zinc-500">
          <Package className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Sanal Deponuz Şu An Boş</h3>
        <p className="text-zinc-400 max-w-md">Perde.ai stüdyosunda kullanmak üzere kendi kumaşlarınızı yükleyebilir, onlara fizik (sık pile, dökümlü vb.) atayabilirsiniz.</p>
      </div>
    </div>
  );
}
