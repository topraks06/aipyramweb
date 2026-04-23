"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PerdeOrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;
    
    const setupRealtime = async () => {
      try {
        const { collection, query, orderBy, limit, onSnapshot } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase-client');
        const q = query(collection(db, "perde_orders"), orderBy("createdAt", "desc"), limit(10));
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => {
            const raw = doc.data();
            return {
              id: doc.id.substring(0, 8),
              customer: raw.customerEmail || raw.email || "AIPyram User",
              amount: raw.amount || raw.total || 0,
              status: raw.status || "s1",
              date: raw.createdAt ? new Date(raw.createdAt).toISOString().split('T')[0] : "N/A"
            };
          });
          setOrders(data.length > 0 ? data : []);
          setIsLoading(false);
        }, (err) => {
          console.error("Order snapshot error", err);
          setIsLoading(false);
        });
      } catch (err) {
        console.error("Firebase setup error", err);
        setIsLoading(false);
      }
    };

    setupRealtime();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "s1": return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">Teklif Bekliyor</Badge>;
      case "s2": return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30">Üretimde</Badge>;
      case "s3": return <Badge className="bg-purple-500/20 text-purple-500 hover:bg-purple-500/30">Kargoda</Badge>;
      case "s4": return <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30">Tamamlandı</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="rounded-none border-2 border-foreground/10 bg-white/80 mt-8 relative overflow-hidden">
      {orders.length > 0 && orders[0].status === 's1' && (new Date().getTime() - new Date(orders[0].date).getTime() < 86400000) && (
        <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 animate-pulse flex items-center gap-1 shadow-md z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> 
          YENİ TALEP GELDİ
        </div>
      )}
      <CardHeader className="border-b-2 border-foreground/5">
        <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-900">Perde.ai Canlı Sipariş Akışı</CardTitle>
        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Sovereign Collection: perde_orders
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-slate-600 uppercase tracking-widest bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-black">Sipariş ID</th>
                <th className="px-6 py-4 font-black">Müşteri</th>
                <th className="px-6 py-4 font-black">Tutar ($)</th>
                <th className="px-6 py-4 font-black">Durum</th>
                <th className="px-6 py-4 font-black">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-xs tracking-widest uppercase">
                    Yükleniyor...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-xs tracking-widest uppercase">
                    Sipariş bulunamadı
                  </td>
                </tr>
              ) : (
                orders.map((order, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">{order.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{order.customer}</td>
                    <td className="px-6 py-4 font-mono text-emerald-600">${order.amount}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-mono">{order.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
