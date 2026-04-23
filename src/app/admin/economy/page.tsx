"use client";

import React from "react";
import EconomyEngineGraph from "@/components/admin/EconomyEngineGraph";
import { Zap, Activity, Coins, Wallet } from "lucide-react";

export default function EconomyPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-widest text-zinc-100 flex items-center gap-3">
          <Zap className="text-emerald-500" />
          Ekonomi Motoru (Sovereign Economy)
        </h1>
        <p className="text-xs text-zinc-500 mt-2 font-mono uppercase tracking-widest">
          Sistem Geneli Kredi Tüketim ve Bakiye Yönetimi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-black/50 border border-white/5 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4 text-zinc-400">
            <Coins size={16} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Toplam Kredi Havuzu</span>
          </div>
          <div className="text-3xl font-mono text-white font-black">
            $12,450.00
          </div>
        </div>

        <div className="bg-black/50 border border-white/5 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4 text-emerald-500">
            <Activity size={16} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Aktif Burn Rate (Saatlik)</span>
          </div>
          <div className="text-3xl font-mono text-emerald-500 font-black">
            $4.20 / sa
          </div>
        </div>

        <div className="bg-black/50 border border-white/5 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4 text-blue-500">
            <Wallet size={16} />
            <span className="text-[10px] uppercase tracking-widest font-bold">En Yüksek Tüketim (Node)</span>
          </div>
          <div className="text-3xl font-mono text-blue-500 font-black">
            TRTEX (42%)
          </div>
        </div>
      </div>

      <EconomyEngineGraph />
    </div>
  );
}
