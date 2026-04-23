"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PerdeOrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Firebase istemci SDK'sı üzerinden veya API üzerinden siparişleri çekebiliriz.
    // Şimdilik test amaçlı mock veri veya doğrudan admin apisine bağlanacak şekilde bir yapı kuruyoruz.
    // Bu tablo "Perde.ai Sovereign" siparişlerini gösterir.
    const fetchOrders = async () => {
      try {
        // Gerçek API eklendiğinde buradan çekilebilir: 
        // const res = await fetch('/api/admin/perde-orders');
        // const data = await res.json();
        
        // Şimdilik statik mock gösteriyoruz, S2'de admin tarafında listeleme görmek için.
        setTimeout(() => {
          setOrders([
            { id: "ORD-991", customer: "Ahmet Yılmaz", amount: 1250, status: "s1", date: "2026-04-23" },
            { id: "ORD-992", customer: "Zeynep Kaya", amount: 4500, status: "s2", date: "2026-04-23" },
            { id: "ORD-993", customer: "Mehmet Demir", amount: 850, status: "s4", date: "2026-04-22" },
          ]);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        setIsLoading(false);
      }
    };
    fetchOrders();
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
    <Card className="rounded-none border-2 border-foreground/10 bg-black/40 mt-8">
      <CardHeader className="border-b-2 border-foreground/5">
        <CardTitle className="text-xl font-black uppercase tracking-tight text-white">Perde.ai Canlı Sipariş Akışı</CardTitle>
        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Sovereign Collection: perde_orders
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-zinc-400 uppercase tracking-widest bg-white/5 border-b border-white/10">
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
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 text-xs tracking-widest uppercase">
                    Yükleniyor...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 text-xs tracking-widest uppercase">
                    Sipariş bulunamadı
                  </td>
                </tr>
              ) : (
                orders.map((order, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-300">{order.id}</td>
                    <td className="px-6 py-4 font-medium text-white">{order.customer}</td>
                    <td className="px-6 py-4 font-mono text-emerald-400">${order.amount}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-xs text-zinc-400 font-mono">{order.date}</td>
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
