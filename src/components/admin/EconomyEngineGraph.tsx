"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function EconomyEngineGraph() {
  const [data, setData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ trtex: 0, perde: 0, hometex: 0, vorhang: 0, sum: 0 });

  useEffect(() => {
    const fetchEconomyData = async () => {
      try {
        const res = await fetch('/api/admin/economy/history');
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          const lastPoint = json.data[json.data.length - 1];
          setData(json.data);
          setTotals({
            trtex: lastPoint.trtex || 0,
            perde: lastPoint.perde || 0,
            hometex: lastPoint.hometex || 0,
            vorhang: lastPoint.vorhang || 0,
            sum: (lastPoint.trtex || 0) + (lastPoint.perde || 0) + (lastPoint.hometex || 0) + (lastPoint.vorhang || 0)
          });
        }
      } catch (err) {
        console.error("Economy verisi çekilemedi", err);
      }
    };
    
    fetchEconomyData();
  }, []);

  return (
    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800">
              EKONOMİ MOTORU: Bütçe Tüketim Radarı
            </CardTitle>
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
              Gerçek Zamanlı API Tüketim Grafiği (Sovereign Node)
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Aylık Toplam (API Harcaması)</div>
            <div className="text-xl font-mono text-slate-900 font-bold">${totals.sum.toFixed(2)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {data && data.length > 0 ? (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '500' }}
                  labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '5px', fontWeight: '600' }}
                />
                <Line type="monotone" dataKey="trtex" name="TRTEX ($)" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="perde" name="Perde.ai ($)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="hometex" name="Hometex ($)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="vorhang" name="Vorhang ($)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] w-full flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100 border-dashed">
             <span className="text-slate-400 font-medium text-sm">Yeterli otonom harcama verisi yok. Sistem bekleniyor...</span>
          </div>
        )}
        
        <div className="grid grid-cols-4 gap-4 mt-6 border-t border-slate-100 pt-4">
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">NODE: TRTEX</div>
            <div className="text-sm font-mono text-indigo-600 font-bold">${totals.trtex.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">NODE: Perde.ai</div>
            <div className="text-sm font-mono text-emerald-600 font-bold">${totals.perde.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">NODE: Hometex</div>
            <div className="text-sm font-mono text-amber-600 font-bold">${totals.hometex.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">NODE: Vorhang</div>
            <div className="text-sm font-mono text-red-600 font-bold">${totals.vorhang.toFixed(2)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
