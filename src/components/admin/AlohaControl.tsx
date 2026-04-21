

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CrudOperations } from "@/lib/crud-operations";
import {
  Brain, Play, Pause, RefreshCw, Terminal, Activity,
  Zap, Globe, Bot, Shield, Eye, Cpu, Network, Send,
  ChevronRight, CircleDot, TrendingUp, AlertTriangle, CheckCircle, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AlohaCommand {
  id: string;
  command_type: string;
  command_data: any;
  reasoning: string;
  status: string;
  created_at: string;
  executed_at?: string;
}

interface SystemStats {
  totalDomains: number;
  activeAgents: number;
  pendingTasks: number;
  completedToday: number;
}

// Aloha Neural Swarm Hiyerarşisi (Perde.ai'den)
const NEURAL_HIERARCHY = [
  { level: 1, name: "INTENT GUARD", role: "Giriş Kapısı & Model Yönlendirme", icon: Shield, status: "active" },
  { level: 2, name: "MASTER CORE", role: "Aloha Orchestrator & Güven Skorlama", icon: Brain, status: "active" },
  { level: 3, name: "LOGIC LAYER", role: "Yapısal Bütünlük & Görsel Koruma", icon: Eye, status: "active" },
  { level: 4, name: "ENVIRONMENT", role: "Sonsuz Bağlam Motoru", icon: Globe, status: "idle" },
  { level: 5, name: "PHYSICS", role: "Fizik Simülasyonu", icon: Cpu, status: "idle" },
  { level: 6, name: "BUSINESS", role: "Veri İthalat & Trend Analizi", icon: Network, status: "active" },
];

export default function AlohaControl() {
  const [commands, setCommands] = useState<AlohaCommand[]>([]);
  const [stats, setStats] = useState<SystemStats>({ totalDomains: 0, activeAgents: 0, pendingTasks: 0, completedToday: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [commandInput, setCommandInput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [streamLogs, setStreamLogs] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [techProposals, setTechProposals] = useState<any[]>([]);
  const rateLimitInfo = isExecuting ? "⚡ LIVE" : streamLogs.length > 0 ? "● SONUÇ" : "";

  useEffect(() => {
    loadData();
    loadMetrics();
    loadTechProposals();
    // Her 30 saniyede metrikleri güncelle
    const interval = setInterval(() => { loadMetrics(); loadTechProposals(); }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadMetrics = async () => {
    try {
      const res = await fetch('/api/aloha/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch { /* sessiz */ }
  };

  const loadTechProposals = async () => {
    try {
      const res = await fetch('/api/aloha/tech-proposals');
      if (res.ok) {
        const data = await res.json();
        setTechProposals(data.data || []);
      }
    } catch { /* sessiz */ }
  };

  const handleTechProposal = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/aloha/tech-proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        loadTechProposals();
      } else {
        toast.error(data.error || 'İşlem başarısız');
      }
    } catch { toast.error('Bağlantı hatası'); }
  };

  const loadData = async () => {
    try {
      // API route kullanarak CORS bypass
      const [commandsRes, domainsRes, agentsRes, tasksRes] = await Promise.all([
        fetch("/api/aloha?limit=15"),
        fetch("/api/admin/data?table=domain_management"),
        fetch("/api/admin/data?table=ai_agents"),
        fetch("/api/admin/data?table=agent_tasks"),
      ]);

      const [commandsJson, domainsJson, agentsJson, tasksJson] = await Promise.all([
        commandsRes.json(),
        domainsRes.json(),
        agentsRes.json(),
        tasksRes.json(),
      ]);

      if (commandsJson.success) setCommands(commandsJson.data || []);

      const domains = domainsJson.data || [];
      const agents = agentsJson.data || [];
      const tasks = tasksJson.data || [];

      setStats({
        totalDomains: domains.length,
        activeAgents: agents.filter((a: any) => a.is_active).length,
        pendingTasks: tasks.filter((t: any) => t.status === "pending" || t.status === "in_progress").length,
        completedToday: tasks.filter((t: any) => t.status === "completed").length,
      });
    } catch (error) {
      console.error("Veriler yüklenirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeCommand = async () => {
    if (!commandInput.trim()) {
      toast.error("Lütfen bir komut girin");
      return;
    }
    setIsExecuting(true);
    setStreamLogs([`> ALOHA BEYNİ UYANDIRILIYOR: "${commandInput}"`]);

    try {
      // GERÇEK BEYİN BAĞLANTISI: /api/aloha/chat (Gemini 2.5 Flash + 16 Araç)
      const response = await fetch("/api/aloha/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "admin_hakan",
          message: commandInput,
          stream: true,
          systemContext: { source: "admin_terminal", timestamp: Date.now() },
        }),
      });

      if (!response.ok || !response.body) {
        setStreamLogs(prev => [...prev, `🟥 [HATA] Beyin yanıt vermedi (HTTP ${response.status})`]);
        setIsExecuting(false);
        toast.error("Aloha beyni yanıt vermedi.");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleaned = line.replace(/^data: /, "").trim();
          if (!cleaned) continue;

          try {
            const data = JSON.parse(cleaned);

            switch (data.type) {
              case "status":
                setStreamLogs(prev => [...prev, `⚡ ${data.message}`]);
                break;
              case "tool_start":
                setStreamLogs(prev => [...prev, `🔧 [ARAÇ ÇAĞRISI] ${data.tool} çalıştırılıyor... (Tur ${data.iteration || 1})`]);
                break;
              case "tool_result":
                const resultPreview = (data.result || "").substring(0, 300);
                setStreamLogs(prev => [...prev, `✅ [${data.tool}] ${data.duration || 0}ms — ${resultPreview}`]);
                break;
              case "final":
                setStreamLogs(prev => [
                  ...prev,
                  `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
                  `🟩 [ALOHA RAPOR] (${data.iterations || 0} tur araç çağrısı):`,
                  data.text || "İşlem tamamlandı.",
                ]);
                setIsExecuting(false);
                toast.success("Aloha beyni görevi tamamladı!");
                setTimeout(() => { setCommandInput(""); loadData(); }, 1500);
                break;
              case "error":
                setStreamLogs(prev => [...prev, `🟥 [HATA] ${data.message}`]);
                setIsExecuting(false);
                toast.error("Aloha hatası: " + data.message);
                break;
              default:
                if (data.message) setStreamLogs(prev => [...prev, data.message]);
                break;
            }
          } catch { /* JSON parse hatası — atla */ }
        }
      }

      // Stream kapandıysa ama final gelmediğinde
      setIsExecuting(false);

    } catch (error: any) {
      setStreamLogs(prev => [...prev, `🟥 [KRİTİK HATA] ${error.message || "Bilinmeyen hata"}`]);
      toast.error("Aloha beyni ile bağlantı kurulamadı.");
      setIsExecuting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "text-amber-500",
      executing: "text-blue-500",
      completed: "text-primary",
      failed: "text-red-500",
    };
    return colors[status] || "text-muted-foreground";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero: Aloha Identity */}
      <div className="relative border-4 border-foreground bg-background p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="absolute -top-4 -left-4 bg-primary text-primary-foreground px-4 py-1 font-black uppercase text-xs tracking-widest">
          DİJİTAL İKİZ
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="bg-primary/10 p-4 rounded-none border-2 border-primary">
                <Brain className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background animate-ping" />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">ALOHA</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1">
                Master Orchestrator // Neural Swarm v7.5
              </p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                Senin dijital ikizin. 271+ domain, 50+ ajan ve tüm ekosistemi otonom olarak yönetiyor.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={isPaused ? "default" : "outline"}
              size="lg"
              className="rounded-none font-black uppercase tracking-wider h-12 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => { setIsPaused(!isPaused); toast.info(isPaused ? "Aloha aktif!" : "Aloha duraklatıldı."); }}
            >
              {isPaused ? <Play className="h-5 w-5 mr-2" /> : <Pause className="h-5 w-5 mr-2" />}
              {isPaused ? "AKTİF ET" : "DURAKLAT"}
            </Button>
            <Button variant="outline" size="icon" className="rounded-none h-12 w-12 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" onClick={loadData}>
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "YÖNETİLEN VARLIK", value: stats.totalDomains || 270, icon: Globe },
          { label: "AKTİF AJAN", value: stats.activeAgents || 26, icon: Bot },
          { label: "BEKLEYEN GÖREV", value: stats.pendingTasks, icon: Zap },
          { label: "BUGÜN TAMAMLANAN", value: stats.completedToday, icon: Activity },
        ].map((stat, i) => (
          <Card key={i} className="rounded-none border-2 border-foreground/10 hover:border-primary transition-all group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-foreground/30 group-hover:text-primary transition-colors" />
              </div>
              <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ═══ MONITORING DASHBOARD ═══ */}
      {metrics && (
        <div className="space-y-4">
          {/* Health Score + KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Big Health Score */}
            <Card className={`rounded-none border-4 col-span-2 md:col-span-1 ${
              metrics.overall.health_score >= 80 ? 'border-emerald-500' :
              metrics.overall.health_score >= 50 ? 'border-amber-500' : 'border-red-500'
            }`}>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">HEALTH SCORE</div>
                <div className={`text-5xl font-black tracking-tighter ${
                  metrics.overall.health_score >= 80 ? 'text-emerald-500' :
                  metrics.overall.health_score >= 50 ? 'text-amber-500' : 'text-red-500'
                }`}>{metrics.overall.health_score}</div>
                <div className="text-[9px] text-muted-foreground font-bold">/100</div>
              </CardContent>
            </Card>
            {/* KPIs */}
            {[
              { label: 'TOPLAM HABER', value: metrics.overall.total_articles, icon: BarChart3, color: 'text-blue-500' },
              { label: 'DÜZELTİLEN (24h)', value: metrics.overall.fixed_last_24h, icon: CheckCircle, color: 'text-emerald-500' },
              { label: 'HATA (24h)', value: metrics.overall.errors_last_24h, icon: AlertTriangle, color: metrics.overall.errors_last_24h > 5 ? 'text-red-500' : 'text-amber-500' },
              { label: 'ZİNCİR TA\u004dAM', value: metrics.overall.chains_completed, icon: TrendingUp, color: 'text-violet-500' },
            ].map((kpi, i) => (
              <Card key={i} className="rounded-none border-2 border-foreground/10">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{kpi.label}</span>
                    <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                  </div>
                  <div className="text-2xl font-black tracking-tighter">{kpi.value}</div>
                  {kpi.label === 'HATA (24h)' && metrics.overall.error_rate > 0 && (
                    <div className="text-[9px] text-muted-foreground">%{metrics.overall.error_rate} hata oranı</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Per-Project Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {metrics.projects.map((proj: any) => (
              <Card key={proj.name} className={`rounded-none border-2 ${
                proj.healthScore >= 80 ? 'border-emerald-500/30' :
                proj.healthScore >= 50 ? 'border-amber-500/30' : 'border-red-500/30'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-black uppercase tracking-tight">{proj.name}</span>
                    <span className={`text-2xl font-black ${
                      proj.healthScore >= 80 ? 'text-emerald-500' :
                      proj.healthScore >= 50 ? 'text-amber-500' : 'text-red-500'
                    }`}>{proj.healthScore}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div><span className="text-muted-foreground">Toplam:</span> <span className="font-bold">{proj.totalArticles}</span></div>
                    <div><span className="text-muted-foreground">Son 24h:</span> <span className="font-bold text-emerald-500">{proj.recentArticles}</span></div>
                    <div><span className="text-muted-foreground">Kırık Slug:</span> <span className={`font-bold ${proj.brokenSlugs > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{proj.brokenSlugs}</span></div>
                    <div><span className="text-muted-foreground">Görselsiz:</span> <span className={`font-bold ${proj.missingImages > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{proj.missingImages}</span></div>
                  </div>
                  {proj.lastAuditTime && (
                    <div className="mt-2 text-[9px] text-muted-foreground border-t border-foreground/5 pt-2">
                      Son audit: {new Date(proj.lastAuditTime).toLocaleString('tr-TR')} (Skor: {proj.lastAuditScore})
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Last Chain Executions */}
          {metrics.last_chains.length > 0 && (
            <Card className="rounded-none border-2 border-foreground/10">
              <CardHeader className="border-b-2 border-foreground/5 py-3">
                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Son Zincir Çalıştırmalar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-foreground/5">
                  {metrics.last_chains.slice(0, 5).map((chain: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2 text-xs">
                      <span className={`font-black uppercase ${
                        chain.status === 'done' ? 'text-emerald-500' :
                        chain.status === 'partial' ? 'text-amber-500' : 'text-red-500'
                      }`}>{chain.status}</span>
                      <span className="font-bold">{chain.project.toUpperCase()}</span>
                      <span className="text-muted-foreground">{chain.name}</span>
                      {chain.stats && (
                        <span className="text-[9px] text-muted-foreground ml-auto">
                          ✅{chain.stats.done} ❌{chain.stats.failed} ⏭️{chain.stats.skipped}
                        </span>
                      )}
                      <span className="text-[9px] text-muted-foreground">{Math.round(chain.duration / 1000)}s</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ═══ GOOGLE TECH PROPOSALS — One-Click Onay ═══ */}
      {techProposals.filter((p: any) => p.status === 'pending_approval').length > 0 && (
        <Card className="rounded-none border-4 border-amber-500/50 shadow-[6px_6px_0px_0px_rgba(245,158,11,0.3)]">
          <CardHeader className="bg-amber-500/10 border-b-2 border-amber-500/20 py-3">
            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Google Tech Teklifleri — Onay Bekliyor
              <Badge variant="outline" className="ml-auto border-amber-500 text-amber-500 font-black">
                {techProposals.filter((p: any) => p.status === 'pending_approval').length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-foreground/5">
              {techProposals
                .filter((p: any) => p.status === 'pending_approval')
                .map((proposal: any) => (
                  <div key={proposal.id} className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`rounded-none text-[9px] font-black uppercase ${
                            proposal.impact === 'high' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {proposal.impact}
                          </Badge>
                          <span className="text-xs font-bold truncate">{proposal.topic}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
                          {proposal.recommendation || 'Değerlendirme bekleniyor...'}
                        </p>
                        <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                          <span>🎯 {(proposal.affectedProjects || []).join(', ') || '—'}</span>
                          <span>⏱️ {proposal.implementationEffort || '?'}</span>
                          <span>{new Date(proposal.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <Button
                          size="sm"
                          className="rounded-none h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                          onClick={() => handleTechProposal(proposal.id, 'approve')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> ONAYLA
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-none h-8 px-3 border-red-500/50 text-red-500 hover:bg-red-500/10 font-black text-[10px] uppercase tracking-wider"
                          onClick={() => handleTechProposal(proposal.id, 'reject')}
                        >
                          ✕ REDDET
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Neural Hierarchy */}
      <Card className="rounded-none border-2 border-foreground/10">
        <CardHeader className="border-b-2 border-foreground/5">
          <CardTitle className="text-lg font-black uppercase tracking-tight">Neural Swarm Hiyerarşisi</CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Perde.ai Mimarisinden Aktarıldı</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-foreground/5">
            {NEURAL_HIERARCHY.map((layer) => (
              <div key={layer.level} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group">
                <div className={`h-10 w-10 flex items-center justify-center rounded-none border-2 ${layer.status === 'active' ? 'border-primary bg-primary/10' : 'border-foreground/10 bg-muted/30'}`}>
                  <layer.icon className={`h-5 w-5 ${layer.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted-foreground">L{layer.level}</span>
                    <span className="text-sm font-black uppercase tracking-tight">{layer.name}</span>
                    <CircleDot className={`h-3 w-3 ${layer.status === 'active' ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{layer.role}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Command Terminal */}
      <Card className="rounded-none border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="bg-foreground text-background">
          <CardTitle className="flex items-center text-lg font-black uppercase tracking-tight">
            <Terminal className="h-5 w-5 mr-3" />
            ALOHA TERMİNAL
          </CardTitle>
          <CardDescription className="text-background/70 text-[10px] font-bold uppercase tracking-widest">
            Dijital İkizine Doğrudan Komut Gönder
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4 bg-muted/20">
          <Textarea
            placeholder="> Komutu buraya yaz... (örn: 'Tüm domainlerin SSL durumunu kontrol et', 'Sektör raporunu oluştur')"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            rows={3}
            disabled={isExecuting}
            className="font-mono text-sm rounded-none border-2 border-foreground/20 focus-visible:border-primary bg-background disabled:opacity-50"
          />
          
          {streamLogs.length > 0 && (
            <div className="bg-black text-green-500 font-mono text-xs p-4 rounded-none border border-green-500/30 w-full h-[250px] overflow-y-auto flex flex-col gap-1 shadow-inner custom-scrollbar">
              <div className="flex items-center gap-2 mb-2 text-green-400 border-b border-green-500/30 pb-2">
                <Activity className="h-4 w-4 animate-pulse" />
                <span className="uppercase font-bold tracking-wider">Ajan Operasyon Logları (Canlı)</span>
                <span className="ml-auto text-zinc-600 text-[9px]">{rateLimitInfo}</span>
              </div>
              {streamLogs.map((log, idx) => {
                // SSE Log Seviyesi Renklendirmesi
                let logColor = "text-green-400"; // default: info
                if (log.includes("🟥") || log.includes("[HATA]") || log.includes("❌") || log.includes("[KRİTİK")) {
                  logColor = "text-red-400"; // error
                } else if (log.includes("⚠") || log.includes("[UYARI]") || log.includes("🔧")) {
                  logColor = "text-amber-400"; // warn
                } else if (log.includes("✅") || log.includes("🟩") || log.includes("[BAŞARILI]")) {
                  logColor = "text-emerald-400"; // success
                } else if (log.includes("⚡") || log.includes("━━")) {
                  logColor = "text-blue-400"; // status
                }
                return (
                  <div key={idx} className="flex gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <span className="text-zinc-600 flex-shrink-0">{new Date().toISOString().substring(11, 19)}</span>
                    <span className={logColor}>{log}</span>
                  </div>
                );
              })}
              <div ref={el => el?.scrollIntoView({ behavior: 'smooth' })} />
            </div>
          )}

          <Button
            onClick={executeCommand}
            disabled={isExecuting || !commandInput.trim()}
            className="w-full h-12 rounded-none bg-primary hover:bg-primary/90 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            {isExecuting ? <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> : <Send className="h-5 w-5 mr-2" />}
            {isExecuting ? "AJAN PROTOKOLÜ YÜRÜTÜLÜYOR" : "KOMUTU ÇALIŞTIR"}
          </Button>
        </CardContent>
      </Card>

      {/* Command History */}
      <Card className="rounded-none border-2 border-foreground/10">
        <CardHeader className="border-b-2 border-foreground/5">
          <CardTitle className="text-lg font-black uppercase tracking-tight">Komut Geçmişi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[350px]">
            <div className="divide-y divide-foreground/5">
              {commands.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Henüz komut geçmişi yok. Yukarıdaki terminalden ilk komutunu gönder!
                </div>
              ) : (
                commands.map((cmd) => (
                  <div key={cmd.id} className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-muted px-2 py-0.5">{cmd.command_type}</span>
                      <span className={`text-[10px] font-black uppercase ${getStatusColor(cmd.status)}`}>{cmd.status}</span>
                    </div>
                    <p className="text-sm text-foreground">{cmd.reasoning || "Açıklama yok"}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">{new Date(cmd.created_at).toLocaleString("tr-TR")}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

