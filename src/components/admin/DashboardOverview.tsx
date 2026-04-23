
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Bot,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Layers,
  Zap
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import DlqManager from "./DlqManager";
import KnowledgeTrainer from "./KnowledgeTrainer";
import EconomyEngineGraph from "./EconomyEngineGraph";
import PerdeOrdersTable from "./PerdeOrdersTable";

interface DashboardStats {
  totalDomains: number;
  totalAgents: number;
  activeAgents: number;
  pendingTasks: number;
  completedTasks: number;
  failedTasks: number;
  totalSectors: number;
  automationRules: number;
  totalCreditsSpent?: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);


  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const result = await response.json();

      if (result.success && result.data) {
        setStats(result.data);
      } else {
        // DUMB CLIENT: Asla mock kullanma. Veri yoksa sıfırla.
        setStats({
          totalDomains: 0,
          totalAgents: 0,
          activeAgents: 0,
          pendingTasks: 0,
          completedTasks: 0,
          failedTasks: 0,
          totalSectors: 0,
          automationRules: 0,
          totalCreditsSpent: 0,
        });
      }
    } catch (error) {
      console.error("İstatistikler yüklenirken hata:", error);
      // Fallback 0
      setStats({
          totalDomains: 0,
          totalAgents: 0,
          activeAgents: 0,
          pendingTasks: 0,
          completedTasks: 0,
          failedTasks: 0,
          totalSectors: 0,
          automationRules: 0,
          totalCreditsSpent: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }


  const statCards = [
    {
      title: "TOPLAM VARLIK",
      value: stats?.totalDomains || 0,
      icon: Globe,
      description: "Yönetilen Dijital Mülkler",
    },
    {
      title: "BOT EKOSİSTEMİ",
      value: stats?.totalAgents || 0,
      icon: Bot,
      description: "Tanımlı AI Ajanları",
    },
    {
      title: "AKTİF OPERASYON",
      value: stats?.activeAgents || 0,
      icon: Zap,
      description: "Çalışan Üniteler",
    },
    {
      title: "BEKLEYEN İŞLEM",
      value: stats?.pendingTasks || 0,
      icon: Clock,
      description: "Kuyruktaki Görevler",
    },
    {
      title: "BAŞARI ORANI",
      value: stats && stats.completedTasks + stats.failedTasks > 0
        ? `${Math.round((stats.completedTasks / (stats.completedTasks + stats.failedTasks)) * 100)}%`
        : "100%",
      icon: CheckCircle2,
      description: "Operasyonel Verimlilik",
    },
    {
      title: "KRİTİK HATA",
      value: stats?.failedTasks || 0,
      icon: AlertCircle,
      description: "İnceleme Bekleyen",
      alert: stats?.failedTasks ? true : false,
    },
    {
      title: "STRATEJİK SEKTÖR",
      value: stats?.totalSectors || 0,
      icon: Layers,
      description: "Aktif Pazar Alanı",
    },
    {
      title: "WALLET BURN",
      value: stats?.totalCreditsSpent ? `$${stats.totalCreditsSpent.toFixed(2)}` : "$0",
      icon: TrendingUp,
      description: "Toplam Otonom Maliyet",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* KPI GRID - CORPORATE LIGHT */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white border border-slate-200 shadow-sm rounded-xl hover:shadow-md transition-all p-5 relative group overflow-hidden">
            <div className="flex flex-row items-center justify-between pb-3 border-b border-slate-50 mb-3">
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                {stat.title}
              </span>
              <stat.icon className={`h-4 w-4 ${stat.alert ? 'text-red-500 animate-pulse' : 'text-indigo-500'}`} />
            </div>
            
            <div className="flex items-baseline gap-3">
              <div className={`text-3xl font-bold tracking-tight ${stat.alert ? 'text-red-600' : 'text-slate-900'}`}>
                {stat.value}
              </div>
            </div>
            
            <p className="text-xs font-medium text-slate-400 mt-2">{stat.description}</p>
            
            {/* Bottom active border line on hover */}
            <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-indigo-600 group-hover:w-full transition-all duration-300" />
          </div>
        ))}
      </div>

      {/* TERMINAL STREAM & GRAPHS */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        
        {/* LIVE TERMINAL STREAM (2 cols) */}
        <div className="lg:col-span-2 border border-slate-200 bg-white rounded-xl shadow-sm flex flex-col relative overflow-hidden group">
          <div className="h-12 border-b border-slate-100 bg-slate-50 flex items-center px-5 justify-between cursor-pointer" onClick={() => setShowTerminal(!showTerminal)}>
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${showTerminal ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-300'}`} />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                ALOHA_SOVEREIGN_LOGS {showTerminal ? '(LIVE)' : '(PAUSED)'}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
              {showTerminal ? '[ HIDE ]' : '[ SHOW STREAM ]'}
            </span>
          </div>
          
          {showTerminal && (
            <div className="p-5 h-[300px] overflow-hidden flex flex-col justify-end font-mono text-xs leading-relaxed space-y-2 bg-slate-900 text-slate-300">
               <div className="text-slate-500 italic">Sistem Boşta. ALOHA verisi bekleniyor...</div>
               <div className="text-slate-600 mt-2 flex items-center gap-2"><span className="animate-pulse">_</span></div>
            </div>
          )}
        </div>

        {/* DLQ MANAGER (1 col) */}
        <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
          <DlqManager />
        </div>
      </div>

      {/* ECONOMY & KNOWLEDGE */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <EconomyEngineGraph />
        <KnowledgeTrainer />
      </div>

      {/* ORDERS TABLE */}
      <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
        <PerdeOrdersTable />
      </div>

    </div>
  );
}

