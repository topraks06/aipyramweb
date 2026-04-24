"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle, CheckCircle2, XCircle, Clock, Zap,
  RefreshCw, ShieldAlert, FileWarning, ImageOff, Bug,
  FlaskConical, Play, Gauge
} from "lucide-react";
import { toast } from "sonner";

interface Proposal {
  id: string;
  project: string;
  issueType: string;
  severity: "critical" | "warning" | "info";
  confidence: number;
  title: string;
  description: string;
  proposedAction: string;
  status: string;
  mode: string;
  detectedAt: number;
  dryRunResult?: string;
}

const SEVERITY_CONFIG = {
  critical: { color: "bg-red-500/10 text-red-500 border-red-500/30", icon: ShieldAlert, label: "KRİTİK" },
  warning:  { color: "bg-amber-500/10 text-amber-500 border-amber-500/30", icon: AlertTriangle, label: "UYARI" },
  info:     { color: "bg-blue-500/10 text-blue-500 border-blue-500/30", icon: Zap, label: "BİLGİ" },
};

const ISSUE_ICONS: Record<string, any> = {
  stale_content: Clock,
  broken_image: ImageOff,
  build_error: Bug,
  missing_file: FileWarning,
  seo_issue: AlertTriangle,
  general: Zap,
};

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-1.5">
      <Gauge className="h-3 w-3 text-muted-foreground" />
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[9px] font-mono text-muted-foreground">{pct}%</span>
    </div>
  );
}

export default function ProposalPanel() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadProposals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/aloha/proposals");
      const json = await res.json();
      if (json.success) setProposals(json.data || []);
    } catch (err) {
      console.error("Teklifler yüklenemedi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
    const interval = setInterval(loadProposals, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject", mode: "dry-run" | "execute" = "dry-run") => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/aloha/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, mode }),
      });
      const json = await res.json();
      if (json.success) {
        if (action === "approve" && mode === "dry-run") {
          toast.success("🧪 Dry-run başlatıldı. Sonuç birkaç dakika içinde görünecek.");
        } else if (action === "approve" && mode === "execute") {
          toast.success("✅ Gerçek yürütme onaylandı. Aloha çalışıyor...");
        } else {
          toast.info("🚫 Teklif reddedildi.");
        }
        loadProposals();
      } else {
        toast.error("İşlem başarısız: " + json.message);
      }
    } catch (err) {
      toast.error("API hatası");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action: "approve" | "reject", mode: "dry-run" | "execute" = "dry-run") => {
    if (!confirm(`Tüm bekleyen ${proposals.length} teklifi ${action === 'approve' ? 'onaylamak' : 'reddetmek'} istediğinize emin misiniz?`)) return;
    
    setActionLoading("bulk");
    try {
      // In a real scenario, you'd have a bulk endpoint. Here we map over existing items.
      const promises = proposals.map(p => 
        fetch("/api/aloha/proposals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: p.id, action, mode }),
        })
      );
      await Promise.all(promises);
      toast.success(`Toplu işlem (${action}) tamamlandı.`);
      loadProposals();
    } catch (err) {
      toast.error("Toplu işlem sırasında hata oluştu.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Card className="rounded-none border-2 border-foreground/10">
      <CardHeader className="border-b-2 border-foreground/5 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Otonom Öneriler
          </CardTitle>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
            Aloha&apos;nın tespit ettiği sorunlar — Onayınızı bekliyor
          </p>
        </div>
        <div className="flex items-center gap-2">
          {proposals.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="rounded-none h-8 px-2 text-[10px] uppercase font-black border-red-500/50 text-red-500 hover:bg-red-500/10"
                onClick={() => handleBulkAction("reject")}
                disabled={actionLoading !== null}
              >
                Toplu Red
              </Button>
              <Button
                size="sm"
                className="rounded-none h-8 px-2 text-[10px] uppercase font-black bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleBulkAction("approve", "dry-run")}
                disabled={actionLoading !== null}
              >
                <FlaskConical className="w-3 h-3 mr-1" />
                Toplu Dry-Run
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="icon"
            className="rounded-none h-9 w-9 ml-2"
            onClick={loadProposals}
            disabled={isLoading || actionLoading !== null}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {proposals.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground font-medium">
                {isLoading ? "Taranıyor..." : "Tüm sistemler sağlıklı. Bekleyen öneri yok."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-foreground/5">
              {proposals.map((p) => {
                const sev = SEVERITY_CONFIG[p.severity] || SEVERITY_CONFIG.info;
                const IssueIcon = ISSUE_ICONS[p.issueType] || Zap;
                const isDryRunDone = p.status === 'dry-run-done';

                return (
                  <div key={p.id} className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-none border ${sev.color}`}>
                        <IssueIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="outline" className="rounded-none text-[9px] font-black uppercase tracking-wider">
                            {p.project}
                          </Badge>
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-none border ${sev.color}`}>
                            {sev.label}
                          </span>
                          <ConfidenceBar value={p.confidence || 0} />
                          <span className="text-[9px] text-muted-foreground font-mono">
                            {new Date(p.detectedAt).toLocaleString("tr-TR")}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold leading-tight">{p.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                        <p className="text-[10px] text-primary/80 mt-1 font-mono">
                          → {p.proposedAction}
                        </p>

                        {/* DRY-RUN SONUCU */}
                        {isDryRunDone && p.dryRunResult && (
                          <div className="mt-2 bg-muted/40 border border-foreground/10 p-2 rounded-none">
                            <p className="text-[9px] font-black uppercase text-amber-500 mb-1">🧪 DRY-RUN SONUCU:</p>
                            <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap font-mono">
                              {p.dryRunResult}
                            </pre>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        {isDryRunDone ? (
                          /* Dry-run tamamlandı — Artık gerçek execute sunulur */
                          <Button
                            size="sm"
                            className="rounded-none h-7 px-3 text-[10px] font-black uppercase bg-green-600 hover:bg-green-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                            onClick={() => handleAction(p.id, "approve", "execute")}
                            disabled={actionLoading === p.id}
                          >
                            {actionLoading === p.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 mr-1" />}
                            EXECUTE
                          </Button>
                        ) : (
                          /* İlk aşama — Dry-run sun */
                          <Button
                            size="sm"
                            className="rounded-none h-7 px-3 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                            onClick={() => handleAction(p.id, "approve", "dry-run")}
                            disabled={actionLoading === p.id}
                          >
                            {actionLoading === p.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <FlaskConical className="h-3 w-3 mr-1" />}
                            DRY-RUN
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-none h-7 px-3 text-[10px] font-black uppercase border-foreground/20"
                          onClick={() => handleAction(p.id, "reject")}
                          disabled={actionLoading === p.id}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          REDDET
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
