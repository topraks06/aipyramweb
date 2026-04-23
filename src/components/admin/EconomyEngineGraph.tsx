"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function EconomyEngineGraph() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchEconomyData = async () => {
      try {
        const res = await fetch('/api/admin/economy/history');
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Economy verisi çekilemedi", err);
      }
    };
    
    fetchEconomyData();
  }, []);

  return (
    <Card className="rounded-none border-2 border-foreground/10 bg-black/40">
      <CardHeader className="border-b-2 border-foreground/5 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-black uppercase tracking-tight text-zinc-100">
              ECONOMY ENGINE: Wallet Burn Radar
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Gerçek Zamanlı Kredi Tüketim Grafiği (Sovereign Node Bazlı)
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Aylık Toplam</div>
            <div className="text-xl font-mono text-emerald-500 font-bold">$124.50</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="time" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px' }}
                itemStyle={{ fontSize: '12px' }}
                labelStyle={{ color: '#888', fontSize: '10px', marginBottom: '5px' }}
              />
              <Line type="monotone" dataKey="trtex" name="TRTEX ($)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="perde" name="Perde.ai ($)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="hometex" name="Hometex ($)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6 border-t border-white/5 pt-4">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">NODE: TRTEX Burn Rate</div>
            <div className="text-sm font-mono text-blue-500 font-bold">YÜKSEK (42%)</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">NODE: Perde.ai Burn Rate</div>
            <div className="text-sm font-mono text-emerald-500 font-bold">OPTİMAL (31%)</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">NODE: Hometex Burn Rate</div>
            <div className="text-sm font-mono text-amber-500 font-bold">DÜŞÜK (18%)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
