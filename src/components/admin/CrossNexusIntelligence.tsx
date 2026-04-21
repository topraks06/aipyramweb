
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NEXUS_SIGNALS, NEXUS_MAP, type NexusSignal } from "@/lib/neural-protocol-config";
import {
    Network, AlertTriangle, CheckCircle2, CircleDot,
    ArrowRight, Zap, Shield, Activity
} from "lucide-react";

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
    low: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "DÜŞÜK" },
    medium: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30", label: "ORTA" },
    high: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "YÜKSEK" },
    critical: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", label: "KRİTİK" },
};

function getNexusName(nexusId: string): string {
    const nexus = NEXUS_MAP.find(n => n.id === nexusId);
    return nexus?.nameTR || nexusId;
}

function getNexusColor(nexusId: string): string {
    const nexus = NEXUS_MAP.find(n => n.id === nexusId);
    return nexus?.color || "oklch(0.5 0 0)";
}

export default function CrossNexusIntelligence() {
    const [signals] = useState<NexusSignal[]>(NEXUS_SIGNALS);

    const activeSignals = signals.filter(s => s.isActive).length;
    const criticalSignals = signals.filter(s => s.severity === "critical" && s.isActive).length;
    const triggeredRecently = signals.filter(s => s.lastTriggered !== null).length;

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "TOPLAM SİNYAL", value: signals.length, icon: Network },
                    { label: "AKTİF", value: activeSignals, icon: Activity },
                    { label: "KRİTİK", value: criticalSignals, icon: AlertTriangle },
                    { label: "TETİKLENDİ", value: triggeredRecently, icon: Zap },
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

            {/* Network Visualization Header */}
            <div className="relative border-4 border-foreground bg-background p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="absolute -top-4 -left-4 bg-primary text-primary-foreground px-4 py-1 font-black uppercase text-xs tracking-widest">
                    CROSS-NEXUS AĞI
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-none border-2 border-primary">
                        <Network className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Sektörler Arası Sinyal Ağı</h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            Bir nexustaki değişiklik, ilgili diğer nexusları otomatik olarak etkiler
                        </p>
                    </div>
                </div>

                {/* Mini Nexus Map */}
                <div className="mt-6 flex flex-wrap gap-2">
                    {NEXUS_MAP.filter(n => n.domains.length > 0).map(nexus => {
                        const affectedBy = signals.filter(s => s.affects.includes(nexus.id) && s.isActive);
                        return (
                            <div
                                key={nexus.id}
                                className="px-3 py-1.5 rounded-none border-2 text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 cursor-default"
                                style={{
                                    borderColor: nexus.color,
                                    color: nexus.color,
                                    backgroundColor: `color-mix(in oklch, ${nexus.color} 10%, transparent)`,
                                }}
                            >
                                {nexus.nameTR}
                                {affectedBy.length > 0 && (
                                    <span className="ml-1 text-[8px] opacity-70">({affectedBy.length} sinyal)</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Signals List */}
            <Card className="rounded-none border-2 border-foreground/10">
                <CardHeader className="border-b-2 border-foreground/5">
                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Sinyal Matrisi
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
                        Sektörler Arası Etki Zinciri Tanımları
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-foreground/5">
                        {signals.map((signal) => {
                            const severity = SEVERITY_CONFIG[signal.severity] || SEVERITY_CONFIG.low;
                            return (
                                <div
                                    key={signal.id}
                                    className={`p-5 hover:bg-muted/20 transition-colors ${!signal.isActive ? "opacity-50" : ""}`}
                                >
                                    {/* Signal Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 flex items-center justify-center rounded-none border-2 ${severity.border} ${severity.bg}`}>
                                                <Zap className={`h-4 w-4 ${severity.color}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black uppercase tracking-tight">{signal.signalNameTR}</span>
                                                    <Badge variant="outline" className={`rounded-none text-[8px] font-black tracking-widest ${severity.color} ${severity.border}`}>
                                                        {severity.label}
                                                    </Badge>
                                                    <CircleDot className={`h-3 w-3 ${signal.isActive ? "text-green-500 animate-pulse" : "text-muted-foreground"}`} />
                                                </div>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">{signal.description}</p>
                                            </div>
                                        </div>
                                        {signal.lastTriggered && (
                                            <span className="text-[9px] font-mono text-muted-foreground">
                                                Son: {new Date(signal.lastTriggered).toLocaleDateString("tr-TR")}
                                            </span>
                                        )}
                                    </div>

                                    {/* Affected Nexuses */}
                                    <div className="flex items-center gap-2 flex-wrap ml-11">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mr-1">
                                            ETKİLER:
                                        </span>
                                        {signal.affects.map((nexusId) => (
                                            <div
                                                key={nexusId}
                                                className="flex items-center gap-1 px-2 py-0.5 rounded-none border text-[9px] font-bold uppercase tracking-wider"
                                                style={{
                                                    borderColor: getNexusColor(nexusId),
                                                    color: getNexusColor(nexusId),
                                                }}
                                            >
                                                {getNexusName(nexusId)}
                                            </div>
                                        ))}
                                        <ArrowRight className="h-3 w-3 text-muted-foreground mx-1" />
                                        <span className="text-[10px] font-bold text-primary">
                                            {signal.actionTR}
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
