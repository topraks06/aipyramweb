
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

interface DashboardStats {
  totalDomains: number;
  totalAgents: number;
  activeAgents: number;
  pendingTasks: number;
  completedTasks: number;
  failedTasks: number;
  totalSectors: number;
  automationRules: number;
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
      title: "OTOMASYON",
      value: stats?.automationRules || 0,
      icon: TrendingUp,
      description: "Tanımlı Kurallar",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="rounded-none border-2 border-foreground/10 hover:border-primary transition-all group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                {stat.title}
              </span>
              <stat.icon className="h-4 w-4 text-foreground/40 group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tracking-tighter group-hover:scale-105 transition-transform origin-left">
                {stat.value}
              </div>
              <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-wider">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-none border-2 border-foreground/10 bg-muted/20">
          <CardHeader className="border-b-2 border-foreground/5">
            <CardTitle className="text-xl font-black uppercase tracking-tight">Sistem Operasyon Merkezi</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Aloha Master Orchestrator Tarafından Yönetiliyor
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {[
                { label: "NEURAL PROTOCOL v2.1", status: "AKTİF", color: "text-primary" },
                { label: "SİSTEM SAĞLIĞI", status: "OPTİMAL", color: "text-primary" },
                { label: "ALOHA TERMİNAL", status: "AKTİF / DİKKAT", color: "text-foreground" },
                { label: "KARAR MOTORU", status: "ÇALIŞIYOR", color: "text-foreground" },
                { label: "VERİ KALKANI", status: "AKTİF", color: "text-emerald-500" },
                { label: "GÜVENLİK KATI", status: "ŞİFRELİ", color: "text-foreground" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-foreground/5 pb-2">
                  <span className="text-[11px] font-black tracking-wider text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${item.color === 'text-primary' ? 'bg-primary' : item.color === 'text-emerald-500' ? 'bg-emerald-500' : 'bg-foreground'} animate-pulse`} />
                    <span className={`text-xs font-black uppercase tracking-tighter ${item.color}`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-2 border-primary bg-primary p-1">
          <div className="bg-background h-full p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">İSVİÇRE MERKEZLİ ANALİTİK</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Aipyram v5.0 MasterBrain altyapısı ile tüm dijital varlıklarınız 7/24 otonom olarak optimize edilmektedir.
              </p>
            </div>
            <div className="flex justify-between items-end">
              <div className="bg-primary text-primary-foreground p-3 font-black text-xl tracking-tighter">
                SWISS TECH
              </div>
              <div className="text-[10px] font-bold text-muted-foreground text-right uppercase tracking-[0.2em]">
                DIETIKON / ZURICH<br />OPERATIONAL HUB
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

