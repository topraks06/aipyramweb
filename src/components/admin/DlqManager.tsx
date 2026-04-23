"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, Trash2, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DlqManager() {
  const [dlqItems, setDlqItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDlq = async () => {
      try {
        const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase-client');
        const q = query(collection(db, "aloha_dlq"), orderBy("createdAt", "desc"), limit(20));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), resolved: false }));
        setDlqItems(data);
        setIsLoading(false);
      } catch (err) {
        console.error("DLQ fetch error", err);
        setIsLoading(false);
      }
    };
    fetchDlq();
  }, []);

  const handleRetry = (id: string) => {
    setDlqItems(prev => prev.map(item => item.id === id ? { ...item, resolved: true } : item));
    // Here we would call an API to re-invoke the agent with the DLQ payload
  };

  if (isLoading) {
    return <Skeleton className="w-full h-64 rounded-xl" />;
  }

  return (
    <Card className="border-red-900/20 bg-white/80">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <CardTitle>Dead Letter Queue (Hata Masası)</CardTitle>
        </div>
        <CardDescription>Sovereign ağında başarısız olan otonom görevler</CardDescription>
      </CardHeader>
      <CardContent>
        {dlqItems.filter(i => !i.resolved).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <CheckCircle2 className="w-12 h-12 mb-2 text-green-500/50" />
            <p>Tüm otonom sistemler kusursuz çalışıyor. Bekleyen hata yok.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dlqItems.filter(i => !i.resolved).map(item => (
              <div key={item.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">{item.node.toUpperCase()}</Badge>
                    <span className="text-xs font-mono text-slate-500">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="font-mono text-sm text-red-600 mb-1">{item.action}</p>
                  <p className="text-sm text-slate-600">{item.error}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleRetry(item.id)} className="p-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded transition" title="Tekrar Dene">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded transition" title="Kuyruktan Sil">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
