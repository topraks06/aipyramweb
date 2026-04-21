"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Newspaper, Loader2, RefreshCw, Activity, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function TrtexCommandCenter() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastFeedLog, setLastFeedLog] = useState<any>(null);
  
  const generateNews = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/v1/master/trtex/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signal: "manual-news-refresh" })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("TRTEX haber üretimi başarıyla tamamlandı!");
        setLastFeedLog(data.result);
      } else {
        toast.error("Haber üretimi başarısız: " + data.error);
      }
    } catch (error: any) {
      toast.error("Ağ hatası: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="border-zinc-800 bg-black">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Veri Boru Hattı Kontrolü
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Aipyram Master Node üzerinden TRTEX için otonom Intelligence haberi üretin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generateNews} 
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-none"
            >
              {isGenerating ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> OTONOM ÜRETİM DEVAM EDİYOR...</>
              ) : (
                <><Newspaper className="mr-2 h-5 w-5" /> YENİ HABER ÜRET VE YAYINLA (Zero-Mock)</>
              )}
            </Button>
            
            {lastFeedLog && (
              <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 text-xs text-green-400 font-mono overflow-auto h-40">
                <p>--- İŞLEM BAŞARILI ---</p>
                <pre>{JSON.stringify(lastFeedLog, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-black">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-amber-500" />
              Otomatik Yayın Durumu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 border border-zinc-800 bg-zinc-900/50">
              <div className="flex flex-col">
                <span className="text-zinc-300 font-bold text-sm">Düzenli Cron Worker</span>
                <span className="text-zinc-500 text-xs">Her 15 dakikada bir otomatik içerik</span>
              </div>
              <div className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold uppercase">
                Aktif
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="h-full">
        <Card className="border-zinc-800 bg-black h-full flex flex-col">
          <CardHeader className="flex flex-row space-y-0 justify-between items-center py-4 border-b border-zinc-800">
            <CardTitle className="text-white flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-blue-500" />
              Canlı TRTEX Önizleme
            </CardTitle>
            <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 flex items-center gap-1 text-xs font-bold">
              YENİ SEKMEDE AÇ <ExternalLink className="h-3 w-3" />
            </a>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden min-h-[500px]">
            <iframe 
              src="http://localhost:3001" 
              className="w-full h-full border-none object-contain"
              title="TRTEX Preview"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
