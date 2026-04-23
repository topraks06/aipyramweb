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
    // Mocking the fetch for now. In production, this hits /api/admin/dlq
    setTimeout(() => {
      setDlqItems([
        {
          id: "dlq-1",
          tenant: "perde",
          action: "generate_pricing",
          error: "Timeout: Wallet API response exceeded 5000ms",
          createdAt: new Date().toISOString(),
          resolved: false
        },
        {
          id: "dlq-2",
          tenant: "trtex",
          action: "scrape_news",
          error: "SyntaxError: Unexpected end of JSON input",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          resolved: false
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleRetry = (id: string) => {
    setDlqItems(prev => prev.map(item => item.id === id ? { ...item, resolved: true } : item));
    // Here we would call an API to re-invoke the agent with the DLQ payload
  };

  if (isLoading) {
    return <Skeleton className="w-full h-64 rounded-xl" />;
  }

  return (
    <Card className="border-red-900/20 bg-black/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <CardTitle>Dead Letter Queue (Hata Masası)</CardTitle>
        </div>
        <CardDescription>Sovereign ağında başarısız olan otonom görevler</CardDescription>
      </CardHeader>
      <CardContent>
        {dlqItems.filter(i => !i.resolved).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
            <CheckCircle2 className="w-12 h-12 mb-2 text-green-500/50" />
            <p>Tüm otonom sistemler kusursuz çalışıyor. Bekleyen hata yok.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dlqItems.filter(i => !i.resolved).map(item => (
              <div key={item.id} className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700">{item.tenant.toUpperCase()}</Badge>
                    <span className="text-xs font-mono text-zinc-500">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="font-mono text-sm text-red-400 mb-1">{item.action}</p>
                  <p className="text-sm text-zinc-400">{item.error}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleRetry(item.id)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded transition" title="Tekrar Dene">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition" title="Kuyruktan Sil">
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
