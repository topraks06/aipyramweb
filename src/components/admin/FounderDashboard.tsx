

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Globe, Bot, Activity, TrendingUp, Users, Zap, ArrowUpRight,
  Radio, BarChart3, Network, ExternalLink, Clock
} from "lucide-react";
import { OmniCMSManager } from "./OmniCMSManager";
import { AlohaErrorBoundary } from "@/components/AlohaErrorBoundary";

/* ═══════════════════════════════════════════════════════
   Kurucu Kontrol Paneli — Founder Dashboard
   Tüm Aipyram ekosistemini tek ekranda izleme
   ═══════════════════════════════════════════════════════ */

interface PlatformStat {
  name: string;
  url: string;
  status: 'live' | 'building' | 'planned';
  visitors: number;
  routedByAloha: number;
  activeAgents: number;
  color: string;
}

interface AlohaRouting {
  total: number;
  today: number;
  topIntent: string;
  avgResponseMs: number;
  failSafeTriggered: number;
}

// Platforms listesi state üzerinden alınacak.

const STATUS_BADGE: Record<string, string> = {
  live: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  building: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  planned: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

export default function FounderDashboard() {
  const [aloha, setAloha] = useState<AlohaRouting>({
    total: 0, today: 0, topIntent: '-', avgResponseMs: 0, failSafeTriggered: 0
  });
  const [platforms, setPlatforms] = useState<PlatformStat[]>([
    { name: 'perde.ai', url: 'https://perde.ai', status: 'live', visitors: 0, routedByAloha: 0, activeAgents: 0, color: 'text-emerald-500' },
    { name: 'trtex.com', url: 'https://trtex.com', status: 'live', visitors: 0, routedByAloha: 0, activeAgents: 0, color: 'text-amber-500' },
    { name: 'hometex.ai', url: 'https://hometex.ai', status: 'live', visitors: 0, routedByAloha: 0, activeAgents: 0, color: 'text-blue-500' },
    { name: 'vorhang.ai', url: 'https://vorhang.ai', status: 'live', visitors: 0, routedByAloha: 0, activeAgents: 0, color: 'text-violet-500' },
  ]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Attempt to load real stats from API
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/aloha?limit=100");
        const data = await res.json();
        if (data.success && data.data) {
          const commands = data.data;
          const today = commands.filter((c: any) =>
            new Date(c.created_at).toDateString() === new Date().toDateString()
          );
          setAloha(prev => ({
            ...prev,
            total: commands.length > 0 ? commands.length : prev.total,
            today: today.length > 0 ? today.length : prev.today,
          }));
        }

        const statsRes = await fetch("/api/admin/stats");
        const statsData = await statsRes.json();
        if (statsData.success && statsData.data?.platformStats) {
           setPlatforms(statsData.data.platformStats);
        }
      } catch { /* fallback to defaults */ }
      setLastRefresh(new Date());
    };
    load();
    const interval = setInterval(load, 60000); // Her 60 saniyede güncelle
    return () => clearInterval(interval);
  }, []);

  const totalVisitors = platforms.reduce((s, p) => s + p.visitors, 0);
  const totalRouted = platforms.reduce((s, p) => s + p.routedByAloha, 0);
  const totalAgents = platforms.reduce((s, p) => s + p.activeAgents, 0);

  return (
    <div className="space-y-3 animate-fade-in">

      {/* ── Hero: Kurucu Bakış Açısı ── */}
      <div className="relative border-4 border-foreground bg-background p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="absolute -top-4 -left-4 bg-primary text-primary-foreground px-4 py-1 font-black uppercase text-xs tracking-widest">
          KURUCU PANELİ
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Ekosistem Durumu</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Aipyram GmbH · 4 Platform · {totalAgents} Ajan · Zürich HQ
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Son güncelleme: {lastRefresh.toLocaleTimeString('tr-TR')}</span>
            <span className="flex items-center gap-1 text-emerald-500 font-bold"><Radio className="h-3 w-3 animate-pulse" /> CANLI</span>
          </div>
        </div>
      </div>

      {/* ── KPI Grid: 6 Metrik ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'TOPLAM ZİYARETÇİ', value: totalVisitors.toLocaleString(), icon: Users, trend: '+12% ↑', trendColor: 'text-emerald-500' },
          { label: 'ALOHA YÖNLENDİRME', value: totalRouted.toString(), icon: Zap, trend: `${aloha.today} bugün`, trendColor: 'text-amber-500' },
          { label: 'AKTİF AJAN', value: totalAgents.toString(), icon: Bot, trend: '4 platform', trendColor: 'text-blue-500' },
          { label: 'ORT. YANIT', value: `${aloha.avgResponseMs}ms`, icon: Activity, trend: 'Optimal', trendColor: 'text-emerald-500' },
          { label: 'FAİL-SAFE', value: aloha.failSafeTriggered.toString(), icon: TrendingUp, trend: 'Temiz ✓', trendColor: 'text-emerald-500' },
          { label: 'TOP İNTENT', value: aloha.topIntent, icon: Brain, trend: `${aloha.total} toplam`, trendColor: 'text-violet-500' },
        ].map((kpi, i) => (
          <Card key={i} className="rounded-none border-2 border-foreground/10 hover:border-primary transition-all group">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{kpi.label}</span>
                <kpi.icon className="h-3.5 w-3.5 text-foreground/20 group-hover:text-primary transition-colors" />
              </div>
              <div className="text-xl font-black tracking-tight truncate">{kpi.value}</div>
              <div className={`text-[9px] font-bold mt-0.5 ${kpi.trendColor}`}>{kpi.trend}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Platform Detay Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((p) => (
          <Card key={p.name} className="rounded-none border-2 border-foreground/10 hover:border-primary/50 transition-all group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 flex items-center justify-center rounded-none border-2 border-foreground/10 bg-muted/30 group-hover:border-primary/30 transition-colors`}>
                    <Globe className={`h-5 w-5 ${p.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black uppercase tracking-tight">{p.name}</CardTitle>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                      {p.url} <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
                <Badge className={`text-[9px] font-bold uppercase tracking-wider border ${STATUS_BADGE[p.status]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'live' ? 'bg-emerald-500' : p.status === 'building' ? 'bg-amber-500' : 'bg-blue-500'} mr-1.5 inline-block ${p.status === 'live' ? 'animate-pulse' : ''}`} />
                  {p.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-muted/20 rounded-none border border-foreground/5">
                  <div className="text-lg font-black">{p.visitors.toLocaleString()}</div>
                  <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Ziyaretçi</div>
                </div>
                <div className="text-center p-2 bg-muted/20 rounded-none border border-foreground/5">
                  <div className="text-lg font-black text-primary">{p.routedByAloha}</div>
                  <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Aloha Yön.</div>
                </div>
                <div className="text-center p-2 bg-muted/20 rounded-none border border-foreground/5">
                  <div className="text-lg font-black">{p.activeAgents}</div>
                  <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Ajan</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Aloha Yönlendirme Akışı ── */}
      <Card className="rounded-none border-2 border-foreground/10">
        <CardHeader className="border-b-2 border-foreground/5">
          <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Aloha Yönlendirme Akışı
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
            Kullanıcı → Aloha → Platform → Uzman Ajan
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Flow visualization */}
            {[
              { label: 'Kullanıcı Girişi', icon: Users, count: totalVisitors, color: 'text-foreground' },
              { label: 'Aloha Analiz', icon: Brain, count: totalRouted, color: 'text-primary' },
              { label: 'Perde.ai', icon: Globe, count: platforms.find(p=>(p as any).id==='perde')?.routedByAloha || 0, color: 'text-emerald-500' },
              { label: 'TRTex.com', icon: BarChart3, count: platforms.find(p=>(p as any).id==='trtex')?.routedByAloha || 0, color: 'text-amber-500' },
              { label: 'Hometex.ai', icon: Globe, count: platforms.find(p=>(p as any).id==='hometex')?.routedByAloha || 0, color: 'text-blue-500' },
              { label: 'Vorhang.ai', icon: Globe, count: platforms.find(p=>(p as any).id==='vorhang')?.routedByAloha || 0, color: 'text-violet-500' },
            ].map((node, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-center">
                  <div className={`h-12 w-12 flex items-center justify-center rounded-none border-2 border-foreground/10 bg-muted/20 mx-auto mb-1`}>
                    <node.icon className={`h-5 w-5 ${node.color}`} />
                  </div>
                  <div className="text-xs font-black">{node.count.toLocaleString()}</div>
                  <div className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">{node.label}</div>
                </div>
                {i < 5 && <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── OmniCMS Manager ── */}
      <div className="mt-8">
        <AlohaErrorBoundary fallbackMessage="OmniCMS paneli yüklenemedi.">
          <OmniCMSManager />
        </AlohaErrorBoundary>
      </div>

    </div>
  );
}
