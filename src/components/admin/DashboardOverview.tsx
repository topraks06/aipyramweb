
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
      trend: "+0",
    },
    {
      title: "BOT EKOSİSTEMİ",
      value: stats?.totalAgents || 0,
      icon: Bot,
      description: "Tanımlı AI Ajanları",
      trend: "+0",
    },
    {
      title: "AKTİF OPERASYON",
      value: stats?.activeAgents || 0,
      icon: Zap,
      description: "Çalışan Üniteler",
      trend: "+0",
    },
    {
      title: "BEKLEYEN İŞLEM",
      value: stats?.pendingTasks || 0,
      icon: Clock,
      description: "Kuyruktaki Görevler",
      trend: "+0",
    },
    {
      title: "BAŞARI ORANI",
      value: stats && stats.completedTasks + stats.failedTasks > 0
        ? `${Math.round((stats.completedTasks / (stats.completedTasks + stats.failedTasks)) * 100)}%`
        : "100%",
      icon: CheckCircle2,
      description: "Operasyonel Verimlilik",
      trend: "+0",
    },
    {
      title: "KRİTİK HATA",
      value: stats?.failedTasks || 0,
      icon: AlertCircle,
      description: "İnceleme Bekleyen",
      trend: "-0",
      alert: stats?.failedTasks ? true : false,
    },
    {
      title: "STRATEJİK SEKTÖR",
      value: stats?.totalSectors || 0,
      icon: Layers,
      description: "Aktif Pazar Alanı",
      trend: "+0",
    },
    {
      title: "WALLET BURN",
      value: stats?.totalCreditsSpent ? `$${stats.totalCreditsSpent.toFixed(2)}` : "$0",
      icon: TrendingUp,
      description: "Toplam Otonom Maliyet",
      trend: "+0.00",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* KPI GRID - BRUTALIST */}
      <div className="grid gap-px bg-white/10 border border-white/10 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-[#030303] hover:bg-[#080808] transition-colors p-5 relative group overflow-hidden">
            {/* Subtle hover glow */}
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="flex flex-row items-center justify-between pb-3">
              <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
                {stat.title}
              </span>
              <stat.icon className={`h-4 w-4 ${stat.alert ? 'text-red-500 animate-pulse' : 'text-blue-500/50'}`} />
            </div>
            
            <div className="flex items-baseline gap-3">
              <div className={`text-3xl font-black font-mono tracking-tighter ${stat.alert ? 'text-red-500' : 'text-zinc-100'}`}>
                {stat.value}
              </div>
              <div className={`text-[10px] font-mono ${stat.alert ? 'text-red-500' : 'text-emerald-500'}`}>
                {stat.trend}
              </div>
            </div>
            
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-3">{stat.description}</p>
            
            {/* Bottom active border line on hover */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-500 group-hover:w-full transition-all duration-500" />
          </div>
        ))}
      </div>

      {/* TERMINAL STREAM & GRAPHS */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        
        {/* LIVE TERMINAL STREAM (2 cols) */}
        <div className="lg:col-span-2 border border-white/10 bg-[#030303] flex flex-col relative overflow-hidden group">
          <div className="h-10 border-b border-white/10 bg-black/50 flex items-center px-4 justify-between cursor-pointer" onClick={() => setShowTerminal(!showTerminal)}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${showTerminal ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                ALOHA_SOVEREIGN_LOGS {showTerminal ? '(LIVE)' : '(PAUSED)'}
              </span>
            </div>
            <span className="text-[9px] font-mono text-zinc-500 hover:text-white transition-colors">
              {showTerminal ? '[ HIDE ]' : '[ SHOW STREAM ]'}
            </span>
          </div>
          
          {showTerminal && (
            <>
              <div className="p-4 h-[300px] overflow-hidden flex flex-col justify-end font-mono text-[10px] leading-relaxed space-y-1">
                <div className="text-zinc-500">[{new Date().toISOString()}] SYSTEM BOOT: Swarm orchestrator initialized.</div>
                <div className="text-zinc-500">[{new Date().toISOString()}] INFO: Handshake established with 33 autonomous agents.</div>
                <div className="text-blue-400/80">[{new Date().toISOString()}] EXECUTE: invokeAgent(knowledge-trainer, tenant: master)</div>
                <div className="text-emerald-500/80">[{new Date().toISOString()}] SUCCESS: Knowledge base vector embeddings updated. Latency: 42ms.</div>
                <div className="text-blue-400/80">[{new Date().toISOString()}] EXECUTE: invokeAgent(content-generator, tenant: trtex)</div>
                <div className="text-zinc-400">[{new Date().toISOString()}] AWAITING RESPONSE...</div>
                <div className="text-zinc-600 mt-2 flex items-center gap-2"><span className="animate-pulse">_</span></div>
              </div>
              <div className="absolute top-10 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            </>
          )}
        </div>

        {/* DLQ MANAGER (1 col) */}
        <div className="border border-white/10 bg-[#030303]">
          <DlqManager />
        </div>
      </div>

      {/* ECONOMY & KNOWLEDGE */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <EconomyEngineGraph />
        <KnowledgeTrainer />
      </div>

      {/* ORDERS TABLE */}
      <div className="border border-white/10 bg-[#030303]">
        <PerdeOrdersTable />
      </div>

    </div>
  );
}

