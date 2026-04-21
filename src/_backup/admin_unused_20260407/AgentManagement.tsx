"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, BarChart4, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AgentMetrics {
  role: string;
  totalCost: number;
  tasksRun: number;
  activeDeals: number;
  commissionGenerated: number;
  closedDeals: number;
  avgTimeToCloseHours: number;
  conversionRate: number;
}

export default function AgentManagement() {
  const [metrics, setMetrics] = useState<AgentMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    // Real-time borsa efekti için 15 saniyede bir güncelle
    const interval = setInterval(loadMetrics, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      const res = await fetch("/api/agents/metrics");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.data);
      }
    } catch (error) {
      console.error("Ajan metrikleri yüklenirken hata:", error);
      toast.error("Borsa verileri yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateROI = (cost: number, revenue: number) => {
    if (cost === 0) return revenue > 0 ? "∞" : "0";
    return (((revenue - cost) / cost) * 100).toFixed(2);
  };

  const getSystemTotalCost = () => metrics.reduce((sum, m) => sum + m.totalCost, 0);
  const getSystemTotalRevenue = () => metrics.reduce((sum, m) => sum + m.commissionGenerated, 0);

  return (
    <div className="space-y-6">
      <Card className="glass-strong border-emerald-900 border-2">
        <CardHeader className="bg-emerald-950/30 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center text-emerald-400">
                <BarChart4 className="h-6 w-6 mr-2" />
                Ajan Borsa Ekranı (Otonom ROI)
              </CardTitle>
              <CardDescription className="text-emerald-300/60">
                Ajanların token harcamaları ve yarattıkları ticari hacmin anlık takibi.
              </CardDescription>
            </div>
            <div className="text-right">
                <h3 className="text-xs uppercase font-bold text-emerald-600">Net Profit (AIPYRAM)</h3>
                <p className="text-3xl font-black text-emerald-400">
                    ${(getSystemTotalRevenue() - getSystemTotalCost()).toFixed(2)}
                </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center p-8 text-emerald-500/50">Veriler taranıyor...</div>
              ) : metrics.map((agent) => {
                const roiStr = calculateROI(agent.totalCost, agent.commissionGenerated);
                const roiNum = parseFloat(roiStr);
                const isProfitable = roiStr === "∞" || roiNum >= 0;

                return (
                <Card key={agent.role} className="p-4 bg-black/40 border-slate-800 hover:border-emerald-500/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Bot className="h-5 w-5 text-emerald-500" />
                        <span className="font-bold text-lg text-slate-200">{agent.role}</span>
                        <Badge variant="outline" className="border-emerald-700 text-emerald-400 bg-emerald-950/50">
                          {agent.tasksRun} Operasyon
                        </Badge>
                      </div>
                      <div className="grid grid-cols-5 gap-4 mt-4 text-center divide-x divide-slate-800">
                          <div>
                              <p className="text-[10px] text-slate-500 uppercase font-semibold">Yakilan Bütçe</p>
                              <p className="text-lg font-mono text-red-500">-${agent.totalCost.toFixed(3)}</p>
                          </div>
                          <div>
                              <p className="text-[10px] text-slate-500 uppercase font-semibold">Üretilen Komisyon</p>
                              <p className="text-lg font-mono text-emerald-400">+${agent.commissionGenerated.toFixed(2)}</p>
                          </div>
                          <div>
                              <p className="text-[10px] text-slate-500 uppercase font-semibold">Net ROI</p>
                              <div className="flex items-center justify-center">
                                  {isProfitable ? (
                                      <TrendingUp className="h-3 w-3 text-emerald-400 mr-1" />
                                  ) : (
                                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                                  )}
                                  <p className={`text-lg font-bold ${isProfitable ? 'text-emerald-400' : 'text-red-500'}`}>
                                      {roiStr}%
                                  </p>
                              </div>
                          </div>
                          <div>
                              <p className="text-[10px] text-slate-500 uppercase font-semibold">Conversion</p>
                              <p className="text-lg font-mono text-blue-400">%{(agent.conversionRate || 0).toFixed(1)}</p>
                          </div>
                          <div>
                              <p className="text-[10px] text-slate-500 uppercase font-semibold">Avg Time</p>
                              <p className="text-lg font-mono text-yellow-400">{(agent.avgTimeToCloseHours || 0).toFixed(1)}h</p>
                          </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )})}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
