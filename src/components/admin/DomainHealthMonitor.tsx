"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MISSION_TARGETS } from "@/lib/neural-protocol-config";
import { Globe, CheckCircle2, XCircle, Loader2, Activity, Clock } from "lucide-react";

interface DomainStatus {
    domain: string;
    label: string;
    role: string;
    status: "online" | "offline" | "checking";
    responseTime: number | null;
    lastChecked: Date | null;
}

export default function DomainHealthMonitor() {
    const [domains, setDomains] = useState<DomainStatus[]>(
        MISSION_TARGETS.map(t => ({
            domain: t.site,
            label: t.site.toUpperCase(),
            role: t.role,
            status: "checking" as const,
            responseTime: null,
            lastChecked: null,
        }))
    );
    const [isChecking, setIsChecking] = useState(false);

    const checkDomain = async (domain: string): Promise<{ online: boolean; ms: number }> => {
        const start = performance.now();
        try {
            // Try to reach the domain via a HEAD request (will fail for CORS but that's OK — we detect "reachable")
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            await fetch(`https://${domain}`, {
                method: "HEAD",
                mode: "no-cors",
                signal: controller.signal,
            });

            clearTimeout(timeout);
            const ms = Math.round(performance.now() - start);
            return { online: true, ms };
        } catch {
            const ms = Math.round(performance.now() - start);
            // "no-cors" mode often throws on redirect but domain is still reachable
            if (ms < 4500) return { online: true, ms };
            return { online: false, ms };
        }
    };

    const runHealthCheck = async () => {
        setIsChecking(true);
        const updated = [...domains];

        for (let i = 0; i < updated.length; i++) {
            updated[i] = { ...updated[i], status: "checking" };
            setDomains([...updated]);

            const result = await checkDomain(updated[i].domain);
            updated[i] = {
                ...updated[i],
                status: result.online ? "online" : "offline",
                responseTime: result.ms,
                lastChecked: new Date(),
            };
            setDomains([...updated]);
        }

        setIsChecking(false);
    };

    useEffect(() => {
        runHealthCheck();
        const interval = setInterval(runHealthCheck, 120000); // her 2 dk
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onlineCount = domains.filter(d => d.status === "online").length;
    const avgResponse = domains.filter(d => d.responseTime).reduce((sum, d) => sum + (d.responseTime || 0), 0) / (onlineCount || 1);

    return (
        <Card className="corporate-card">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-md">
                            <Activity className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-semibold tracking-tight">Domain Health Monitor</CardTitle>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                Fleet status · {onlineCount}/{domains.length} active · Avg {Math.round(avgResponse)}ms
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={runHealthCheck}
                        disabled={isChecking}
                        className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                    >
                        {isChecking ? <Loader2 className="h-3 w-3 animate-spin" /> : "Refresh"}
                    </button>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-2">
                    {domains.map((d) => (
                        <div
                            key={d.domain}
                            className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    {d.status === "checking" ? (
                                        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                                    ) : d.status === "online" ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-destructive" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs font-semibold">{d.domain}</span>
                                    </div>
                                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{d.role}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-right">
                                {d.responseTime !== null && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        <span className={`text-[10px] font-mono font-bold ${d.responseTime < 1000 ? 'text-emerald-600 dark:text-emerald-600' :
                                            d.responseTime < 3000 ? 'text-amber-600 dark:text-amber-400' :
                                                'text-destructive'
                                            }`}>
                                            {d.responseTime}ms
                                        </span>
                                    </div>
                                )}
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${d.status === "online"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-600"
                                    : d.status === "offline"
                                        ? "bg-destructive/10 text-destructive"
                                        : "bg-muted text-muted-foreground"
                                    }`}>
                                    {d.status === "online" ? "Live" : d.status === "offline" ? "Down" : "..."}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
