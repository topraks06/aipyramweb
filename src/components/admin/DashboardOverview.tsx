
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
        // Fallback data if API fails or is empty
        setStats({
          totalDomains: 4,
          totalAgents: 33,
          activeAgents: 33,
          pendingTasks: 0,
          completedTasks: 0,
          failedTasks: 0,
          totalSectors: 3,
          automationRules: 15,
          totalCreditsSpent: 0,
        });
      }
    } catch (error) {
      console.error("İstatistikler yüklenirken hata:", error);
      // Fallback
      setStats({
          totalDomains: 4,
          totalAgents: 33,
          activeAgents: 33,
          pendingTasks: 0,
          completedTasks: 0,
          failedTasks: 0,
          totalSectors: 3,
          automationRules: 15,
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
    <div className="space-y-8 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-black/40 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-mono tracking-widest text-zinc-500">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-blue-500/50" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-zinc-100">{stat.value}</div>
              <p className="text-xs text-zinc-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <DlqManager />
        <KnowledgeTrainer />
      </div>

      <div className="mb-8">
        <EconomyEngineGraph />
      </div>

      <PerdeOrdersTable />
    </div>
  );
}

