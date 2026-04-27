"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PerdeOrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    let unsubscribe: () => void;
    
    const setupRealtime = async () => {
      try {
        const { collection, query, orderBy, limit, onSnapshot } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase-client');
        const q = query(collection(db, "perde_projects"), orderBy("createdAt", "desc"), limit(50));
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => {
            const raw = doc.data();
            return {
              docId: doc.id,
              id: doc.id.substring(0, 8),
              customer: raw.customerEmail || raw.email || "AIPyram User",
              amount: raw.amount || raw.total || 0,
              status: raw.status || "s1",
              date: raw.createdAt ? new Date(raw.createdAt).toISOString().split('T')[0] : "N/A"
            };
          });
          setOrders(data);
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

  const handleStatusChange = async (docId: string, newStatus: string) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase-client');
      await updateDoc(doc(db, "perde_projects", docId), { status: newStatus, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.error(e);
      alert("Durum güncellenemedi");
    }
  };

  const filteredOrders = filterDate ? orders.filter(o => o.date === filterDate) : orders;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.amount), 0);

  return (
    <Card className="rounded-none border-2 border-foreground/10 bg-white/80 mt-8 relative overflow-hidden">
      {orders.length > 0 && orders[0].status === 's1' && (new Date().getTime() - new Date(orders[0].date).getTime() < 86400000) && !filterDate && (
        <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 animate-pulse flex items-center gap-1 shadow-md z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> 
          YENİ TALEP GELDİ
        </div>
      )}
      <CardHeader className="border-b-2 border-foreground/5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-black uppercase tracking-tight text-slate-900">Perde.ai Canlı Sipariş Akışı</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Sovereign Collection: perde_projects
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Tarih Filtresi</span>
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-slate-200 px-2 py-1 text-xs font-mono text-slate-700 bg-slate-50 rounded"
            />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Toplam Gelir</span>
            <span className="text-lg font-black text-emerald-600">${totalRevenue.toLocaleString()}</span>
          </div>
        </div>
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
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-xs tracking-widest uppercase">
                    Sipariş bulunamadı
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">{order.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{order.customer}</td>
                    <td className="px-6 py-4 font-mono text-emerald-600">${Number(order.amount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.docId, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border-2 transition-colors outline-none cursor-pointer ${
                          order.status === 's1' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                          order.status === 's2' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          order.status === 's3' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                          order.status === 's4' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        <option value="s1">Teklif Bekliyor</option>
                        <option value="s2">Üretimde</option>
                        <option value="s3">Kargoda</option>
                        <option value="s4">Tamamlandı</option>
                      </select>
                    </td>
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
