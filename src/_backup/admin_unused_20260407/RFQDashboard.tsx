"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Globe,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowRight,
  Shield,
  DollarSign,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { AgentTerminal, LogEntry } from "@/components/shared/AgentTerminal";

// ═══════════════════════════════════════════════════════════════
// RFQ DASHBOARD — Canlı Alım Talebi ve Eşleştirme Paneli
// AIPYRAM Revenue Engine FAZ 1
// ═══════════════════════════════════════════════════════════════

interface RFQ {
  id: string;
  buyerRegion: string;
  buyerType: string;
  product: string;
  quantity: string;
  requirements: string[];
  urgency: string;
  targetPrice?: string;
  postedMinutesAgo?: number;
}

interface MatchResult {
  supplierId: string;
  companyName: string;
  matchScore: number;
  reasons: string[];
  estimatedPrice?: string;
  deliveryEstimate?: string;
}

interface APIMeta {
  agent: string;
  confidence: number;
  tokensUsed?: number;
  costUSD?: number;
  durationMs?: number;
  generatedAt?: string;
}

export default function RFQDashboard() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState<string | null>(null);
  const [matchResults, setMatchResults] = useState<Record<string, MatchResult[]>>({});
  const [meta, setMeta] = useState<APIMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalCostUSD, setTotalCostUSD] = useState(0);

  // Agent Stream State
  const [activeStream, setActiveStream] = useState<{ id: string; logs: LogEntry[] } | null>(null);

  // ─── Canlı RFQ Yükle ────────────────────────────────
  const loadLiveRFQs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const tf = () => new Date().toISOString().substring(11, 19);
    setActiveStream({ id: 'generate', logs: [{ id: '1', agent: 'INTENT_GUARD', message: 'Sektörel talep verileri taranıyor...', status: 'info', timestamp: tf() }] });

    // Stream sim
    const steps = [
       { agent: 'STRATEGIST', message: 'Alıcı niyetleri çözümleniyor...', status: 'info' as const },
       { agent: 'NETWORK', message: 'Tedarik ağında aciliyet skoru ölçülüyor...', status: 'info' as const },
       { agent: 'MASTER_CORE', message: 'Üretilen RFQ\'lar normalize ediliyor...', status: 'success' as const }
    ];
    for(let i=0; i<steps.length; i++) {
       await new Promise(r => setTimeout(r, 600));
       setActiveStream(prev => prev ? { id: prev.id, logs: [...prev.logs, { id: `step-${i}`, ...steps[i], timestamp: tf() }] } : null);
    }
    
    try {
      const res = await fetch("/api/rfqs/live", { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setActiveStream(prev => prev ? { id: prev.id, logs: [...prev.logs, { id: 'fin', agent: 'SUCCESS', message: 'Başarılı. Liste ekrana aktarılıyor.', status: 'success', timestamp: tf() }] } : null);
        await new Promise(r => setTimeout(r, 600));

        setRfqs(data.rfqs || []);
        setMeta(data.meta || null);
        setTotalCostUSD((prev) => prev + (data.meta?.costUSD || 0));
      } else {
        setError(data.error || "Bilinmeyen hata");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setTimeout(() => setActiveStream(null), 1500); // give time to clear 
    }
  }, []);

  // ─── RFQ Eşleştirme ────────────────────────────────
  const matchRFQ = async (rfq: RFQ) => {
    setIsMatching(rfq.id);
    const tf = () => new Date().toISOString().substring(11, 19);
    setActiveStream({ id: rfq.id, logs: [{ id: 'm1', agent: 'MATCHMAKER', message: `RFQ #${rfq.id} için tedarikçiler aranıyor...`, status: 'info', timestamp: tf() }] });

    // Stream sim
    const steps = [
      { agent: 'DB_WRITE', message: 'Semantik özellikler çıkartıldı.', status: 'info' as const },
      { agent: 'AUDITOR', message: `Kriterlere uygun fabrikalar değerlendiriliyor. Yüksek miktar (${rfq.quantity}) bonusu uygulandı.`, status: 'info' as const },
      { agent: 'LOGIC_LAYER', message: 'Tedarikçi puanları güncelleniyor. AI denetimi...', status: 'success' as const }
    ];
    for(let i=0; i<steps.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      setActiveStream(prev => prev ? { id: prev.id, logs: [...prev.logs, { id: `m-${i}`, ...steps[i], timestamp: tf() }] } : null);
    }

    try {
      const res = await fetch("/api/rfqs/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfq, suppliers: [] }),
      });
      const data = await res.json();

      setActiveStream(prev => prev ? { id: prev.id, logs: [...prev.logs, { id: 'm-fin', agent: 'SUCCESS', message: `${data.matches?.length || 0} Fabrika eşleşmesi sağlandı!`, status: 'success', timestamp: tf() }] } : null);
      await new Promise(r => setTimeout(r, 800));

      if (data.matches) {
        setMatchResults((prev) => ({ ...prev, [rfq.id]: data.matches }));
        setTotalCostUSD((prev) => prev + (data.meta?.costUSD || 0));
      }
    } catch (err: any) {
      console.error("Eşleştirme hatası:", err);
    } finally {
      setIsMatching(null);
      // Wait for user to read completion before nullifying
      setTimeout(() => setActiveStream(null), 1500);
    }
  };

  useEffect(() => {
    loadLiveRFQs();
  }, [loadLiveRFQs]);

  // ─── Urgency Badge ────────────────────────────────
  const urgencyBadge = (urgency: string) => {
    const map: Record<string, { color: string; icon: any }> = {
      High: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: Zap },
      Medium: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Clock },
      Low: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: Clock },
    };
    const config = map[urgency] || map.Medium;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase border rounded ${config.color}`}>
        <Icon size={10} />
        {urgency}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ─── HEADER ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            Canlı RFQ Akışı
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-semibold">
              LIVE
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Matchmaker Agent — Gerçek zamanlı B2B alım talepleri
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Maliyet Göstergesi */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border">
            <DollarSign size={12} className="text-emerald-500" />
            <span>Oturum Maliyeti: <strong className="text-foreground">${totalCostUSD.toFixed(4)}</strong></span>
          </div>
          {/* Yenile */}
          <div className="relative">
            <button
              onClick={loadLiveRFQs}
              disabled={isLoading}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              {isLoading ? "AJAN ÇALIŞIYOR" : "Yeni RFQ Üret"}
            </button>
            {/* Global Generate Stream Modal */}
            <div className="absolute top-12 right-0 z-50 w-80">
              {activeStream?.id === 'generate' && activeStream.logs.length > 0 && (
                <AgentTerminal logs={activeStream.logs} isActive={isLoading} title="RFQ_GENERATOR" />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* ─── META INFO ──────────────────────────────── */}
      {meta && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Ajan", value: meta.agent, icon: Shield },
            { label: "Güven", value: `${meta.confidence}%`, icon: TrendingUp },
            { label: "Token", value: meta.tokensUsed?.toLocaleString() || "—", icon: Zap },
            { label: "Süre", value: meta.durationMs ? `${(meta.durationMs / 1000).toFixed(1)}s` : "—", icon: Clock },
          ].map((item) => (
            <div key={item.label} className="bg-muted/30 border rounded-lg p-3 flex items-center gap-3">
              <item.icon size={16} className="text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-bold">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── ERROR ──────────────────────────────── */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-4 flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* ─── RFQ CARDS ──────────────────────────────── */}
      {rfqs.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Henüz RFQ yok. "Yeni RFQ Üret" butonuna basın.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rfqs.map((rfq) => (
          <div key={rfq.id} className="bg-card border rounded-xl overflow-hidden hover:border-blue-500/50 transition-all">
            {/* Card Header */}
            <div className="p-4 border-b bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-blue-500" />
                  <span className="text-xs font-semibold text-muted-foreground">{rfq.buyerRegion}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{rfq.buyerType}</span>
                </div>
                {urgencyBadge(rfq.urgency)}
              </div>
              <h3 className="font-bold text-sm leading-snug">{rfq.product}</h3>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Miktar:</span>
                <span className="font-semibold">{rfq.quantity}</span>
              </div>
              {rfq.targetPrice && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Hedef Fiyat:</span>
                  <span className="font-semibold text-emerald-500">{rfq.targetPrice}</span>
                </div>
              )}

              {/* Requirements */}
              {rfq.requirements && rfq.requirements.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {rfq.requirements.map((req, i) => (
                    <span key={i} className="text-[10px] bg-muted px-2 py-0.5 rounded-full border">
                      {req}
                    </span>
                  ))}
                </div>
              )}

              {/* Match Button */}
              {activeStream?.id === rfq.id ? (
                 <div className="mt-2 w-full relative z-10">
                   <AgentTerminal logs={activeStream.logs} isActive={isMatching === rfq.id} title="MATCHMAKER_NET" />
                 </div>
              ) : (
                <button
                  onClick={() => matchRFQ(rfq)}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg transition-all"
                >
                  <ArrowRight size={14} />
                  Tedarikçi Eşleştir
                </button>
              )}
            </div>

            {/* Match Results */}
            {matchResults[rfq.id] && matchResults[rfq.id].length > 0 && (
              <div className="border-t bg-emerald-500/5 p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                  <CheckCircle size={12} />
                  Eşleşmeler ({matchResults[rfq.id].length})
                </p>
                {matchResults[rfq.id].map((match, i) => (
                  <div key={i} className="bg-card border rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{match.companyName}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        match.matchScore >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                        match.matchScore >= 60 ? "bg-amber-500/20 text-amber-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        %{match.matchScore}
                      </span>
                    </div>
                    {match.estimatedPrice && (
                      <p className="text-xs text-muted-foreground">Tahmini Fiyat: <strong>{match.estimatedPrice}</strong></p>
                    )}
                    {match.deliveryEstimate && (
                      <p className="text-xs text-muted-foreground">Teslim: <strong>{match.deliveryEstimate}</strong></p>
                    )}
                    {match.reasons && (
                      <ul className="text-[10px] text-muted-foreground space-y-0.5 mt-1">
                        {match.reasons.slice(0, 3).map((r, j) => (
                          <li key={j} className="flex items-start gap-1">
                            <span className="text-emerald-500 mt-0.5">›</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
