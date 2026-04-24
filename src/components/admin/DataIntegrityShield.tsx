
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
    TRUSTED_SOURCES,
    DATA_INTEGRITY_RULES,
    type TrustedSource,
} from "@/lib/neural-protocol-config";
import {
    Shield, ShieldCheck, ShieldAlert, ShieldOff,
    FileText, Globe, Database, Plug,
    CheckCircle2, Clock, XCircle,
    Lock, Unlock, Eye
} from "lucide-react";

const TYPE_ICONS: Record<string, any> = {
    document: FileText,
    live_domain: Globe,
    api: Plug,
    database: Database,
};

const TYPE_LABELS: Record<string, string> = {
    document: "DOKÜMAN",
    live_domain: "CANLI DOMAIN",
    api: "API",
    database: "VERİTABANI",
};

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    verified: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "DOĞRULANDI" },
    pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "BEKLEMEDE" },
    rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "REDDEDİLDİ" },
};

export default function DataIntegrityShield() {
    const [sources] = useState<TrustedSource[]>(TRUSTED_SOURCES);
    const [shieldActive, setShieldActive] = useState(DATA_INTEGRITY_RULES.blockUnlisted);
    const [stats, setStats] = useState<any>(null);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/data-integrity');
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (e) {}
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const verifiedCount = sources.filter(s => s.status === "verified").length;
    const avgTrustScore = Math.round(sources.reduce((sum, s) => sum + s.trustScore, 0) / sources.length);
    const pendingCount = sources.filter(s => s.status === "pending").length;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Shield Status Hero */}
            <div className={`relative border-4 ${shieldActive ? "border-emerald-500/50" : "border-red-500/50"} bg-background p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-colors duration-500`}>
                <div className={`absolute -top-4 -left-4 ${shieldActive ? "bg-emerald-500" : "bg-red-500"} text-slate-900 px-4 py-1 font-black uppercase text-xs tracking-widest transition-colors duration-500`}>
                    HALÜSINASYON KALKANI
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className={`relative p-4 rounded-none border-2 ${shieldActive ? "border-emerald-500 bg-emerald-500/10" : "border-red-500 bg-red-500/10"} transition-colors duration-500`}>
                            {shieldActive ? (
                                <ShieldCheck className="h-12 w-12 text-emerald-500" />
                            ) : (
                                <ShieldOff className="h-12 w-12 text-red-500" />
                            )}
                            <div className={`absolute -bottom-1 -right-1 h-4 w-4 ${shieldActive ? "bg-emerald-500" : "bg-red-500"} rounded-full border-2 border-background ${shieldActive ? "animate-pulse" : ""}`} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">
                                VERİ BÜTÜNLÜK KALKANI
                            </h1>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1">
                                Data Integrity Shield v2.0
                            </p>
                            <p className="text-sm text-muted-foreground mt-2 max-w-md">
                                {DATA_INTEGRITY_RULES.ruleTR}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right mr-2">
                            <span className={`text-sm font-black uppercase ${shieldActive ? "text-emerald-500" : "text-red-500"}`}>
                                {shieldActive ? "AKTİF" : "PASİF"}
                            </span>
                        </div>
                        <Switch
                            checked={shieldActive}
                            onCheckedChange={setShieldActive}
                            className="data-[state=checked]:bg-emerald-500"
                        />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "KAYNAK SAYISI", value: sources.length, icon: Database, color: "text-foreground" },
                    { label: "DOĞRULANDI", value: verifiedCount, icon: CheckCircle2, color: "text-emerald-500" },
                    { label: "ORT. GÜVEN", value: `${avgTrustScore}%`, icon: Shield, color: avgTrustScore >= 80 ? "text-emerald-500" : "text-amber-500" },
                    { label: "BEKLEMEDE", value: pendingCount, icon: Clock, color: pendingCount > 0 ? "text-amber-500" : "text-emerald-500" },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-none border-2 border-foreground/10 hover:border-primary transition-all group">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                                <stat.icon className="h-4 w-4 text-foreground/30 group-hover:text-primary transition-colors" />
                            </div>
                            <div className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Live Scan Results */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card className="border-red-500/20 bg-red-500/5">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Kayıp / Orphan Referans</span>
                                <div className="text-2xl font-black text-red-500">{stats.orphans}</div>
                            </div>
                            <ShieldAlert className="h-6 w-6 text-red-500/50" />
                        </CardContent>
                    </Card>
                    <Card className="border-amber-500/20 bg-amber-500/5">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Eksik Required Fields</span>
                                <div className="text-2xl font-black text-amber-500">{stats.missingFields}</div>
                            </div>
                            <ShieldAlert className="h-6 w-6 text-amber-500/50" />
                        </CardContent>
                    </Card>
                    <Card className="border-blue-500/20 bg-blue-500/5">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Duplike Slug (Çakışma)</span>
                                <div className="text-2xl font-black text-blue-500">{stats.duplicates}</div>
                            </div>
                            <Database className="h-6 w-6 text-blue-500/50" />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Blocking Rule */}
            <Card className={`rounded-none border-2 ${shieldActive ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"} transition-colors duration-500`}>
                <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                        {shieldActive ? (
                            <Lock className="h-6 w-6 text-emerald-500" />
                        ) : (
                            <Unlock className="h-6 w-6 text-red-500" />
                        )}
                        <div className="flex-1">
                            <p className="text-sm font-black uppercase tracking-wide">
                                Engelleme Kuralı
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {DATA_INTEGRITY_RULES.ruleTR} · Minimum güven skoru: <span className="font-bold text-foreground">{DATA_INTEGRITY_RULES.minTrustScore}%</span>
                            </p>
                        </div>
                        <Badge
                            variant="outline"
                            className={`rounded-none font-black text-[9px] tracking-widest ${shieldActive ? "border-emerald-500 text-emerald-500" : "border-red-500 text-red-500"}`}
                        >
                            {shieldActive ? "ZORUNLU" : "DEVRE DIŞI"}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Trusted Sources List */}
            <Card className="rounded-none border-2 border-foreground/10">
                <CardHeader className="border-b-2 border-foreground/5">
                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        Güvenilir Kaynak Listesi
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
                        Veri Üretimi İçin Onaylı Kaynaklar
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-foreground/5">
                        {sources.map((source) => {
                            const TypeIcon = TYPE_ICONS[source.type] || FileText;
                            const status = STATUS_CONFIG[source.status] || STATUS_CONFIG.pending;
                            const StatusIcon = status.icon;

                            return (
                                <div key={source.id} className="p-5 hover:bg-muted/20 transition-colors group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 flex items-center justify-center rounded-none border-2 border-foreground/10 ${status.bg} group-hover:border-primary transition-colors`}>
                                                <TypeIcon className="h-5 w-5 text-foreground/70" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black uppercase tracking-tight">{source.name}</span>
                                                    <Badge variant="outline" className="rounded-none text-[8px] font-bold tracking-widest">
                                                        {TYPE_LABELS[source.type]}
                                                    </Badge>
                                                    <div className={`flex items-center gap-1 ${status.color}`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{status.label}</span>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{source.path}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trust Score Bar */}
                                    <div className="ml-[52px] flex items-center gap-3">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest w-20">
                                            GÜVEN: {source.trustScore}%
                                        </span>
                                        <div className="flex-1">
                                            <Progress
                                                value={source.trustScore}
                                                className="h-2 rounded-none"
                                            />
                                        </div>
                                        <span className="text-[9px] font-mono text-muted-foreground">
                                            {new Date(source.lastVerified).toLocaleDateString("tr-TR")}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
