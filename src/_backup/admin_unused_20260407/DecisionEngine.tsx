
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CrudOperations } from "@/lib/crud-operations";
import {
    DECISION_WEIGHTS,
    AUTO_REALLOCATE_RULE,
    NEXUS_MAP,
    MISSION_DEADLINE,
} from "@/lib/neural-protocol-config";
import {
    TrendingUp, Eye, Timer, Database,
    AlertTriangle, Zap, ArrowRight, Target,
    Activity
} from "lucide-react";

const ICON_MAP: Record<string, any> = { TrendingUp, Eye, Timer, Database };

interface NexusPriorityScore {
    nexusId: string;
    name: string;
    color: string;
    scores: Record<string, number>;
    total: number;
    agentCount: number;
    taskCount: number;
}

export default function DecisionEngine() {
    const [nexusScores, setNexusScores] = useState<NexusPriorityScore[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [daysToDeadline, setDaysToDeadline] = useState(0);
    const [isReallocateActive, setIsReallocateActive] = useState(false);

    useEffect(() => {
        const deadline = new Date(MISSION_DEADLINE);
        const now = new Date();
        const diff = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setDaysToDeadline(diff);
        setIsReallocateActive(diff < 30);
        loadScores();
    }, []);

    const loadScores = async () => {
        try {
            const agentsCrud = new CrudOperations("ai_agents");
            const tasksCrud = new CrudOperations("agent_tasks");

            const [agents, tasks] = await Promise.all([
                agentsCrud.findMany(),
                tasksCrud.findMany(),
            ]);

            const scores: NexusPriorityScore[] = NEXUS_MAP
                .filter(n => n.domains.length > 0)
                .map((nexus) => {
                    const nexusAgents = agents.filter((a: any) => {
                        const assignedDomains: string[] = a.assigned_domains || [];
                        return assignedDomains.some(d => nexus.domains.includes(d));
                    });

                    const nexusTasks = tasks.filter((t: any) => {
                        return nexusAgents.some((a: any) => a.id === t.agent_id);
                    });

                    // Heuristik puanlama (gerçek veriye göre ölçeklenir)
                    const revenueScore = nexus.domains.length * 20 + nexusAgents.length * 5;
                    const visibilityScore = nexus.id === "textile_nexus" ? 90 : nexus.id === "real_estate_nexus" ? 70 : 50;
                    const deadlineScore = nexus.id === "textile_nexus" ? 95 : 40;
                    const dataScore = nexusTasks.length > 0 ? 80 : 30;

                    const scores: Record<string, number> = {
                        revenue: revenueScore,
                        strategic_visibility: visibilityScore,
                        launch_deadline: deadlineScore,
                        data_dependency: dataScore,
                    };

                    const total = DECISION_WEIGHTS.reduce(
                        (sum, w) => sum + (scores[w.key] || 0) * w.weight,
                        0
                    );

                    return {
                        nexusId: nexus.id,
                        name: nexus.nameTR,
                        color: nexus.color,
                        scores,
                        total: Math.round(total),
                        agentCount: nexusAgents.length,
                        taskCount: nexusTasks.length,
                    };
                })
                .sort((a, b) => b.total - a.total);

            setNexusScores(scores);
        } catch (error) {
            console.error("Decision Engine yüklenirken hata:", error);
            // Sıfır mock asıllı veri aktarımı - Bozuk/boş ise boş gösterilsin.
            setNexusScores([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Auto-Reallocate Alert */}
            {isReallocateActive && (
                <div className="relative border-2 border-amber-500/50 bg-amber-500/5 p-6 rounded-none animate-pulse-slow">
                    <div className="absolute -top-3 left-4 bg-amber-500 text-black px-3 py-0.5 text-[10px] font-black uppercase tracking-widest">
                        OTOMATİK TAHSİS AKTİF
                    </div>
                    <div className="flex items-center gap-4">
                        <AlertTriangle className="h-8 w-8 text-amber-500 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-bold text-amber-500 uppercase tracking-wide">
                                {AUTO_REALLOCATE_RULE.conditionTR}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Lansmana <span className="text-amber-500 font-black">{daysToDeadline} gün</span> kaldı → {AUTO_REALLOCATE_RULE.actionTR}
                            </p>
                        </div>
                        <Zap className="h-6 w-6 text-amber-500 animate-pulse" />
                    </div>
                </div>
            )}

            {/* Priority Weights */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {DECISION_WEIGHTS.map((w) => {
                    const Icon = ICON_MAP[w.icon] || Target;
                    return (
                        <Card key={w.key} className="rounded-none border-2 border-foreground/10 hover:border-primary transition-all group overflow-hidden relative">
                            <div
                                className="absolute bottom-0 left-0 right-0 h-1 transition-all"
                                style={{ backgroundColor: w.color }}
                            />
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                        {w.labelTR}
                                    </span>
                                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black tracking-tighter" style={{ color: w.color }}>
                                    {Math.round(w.weight * 100)}%
                                </div>
                                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${w.weight * 100}%`, backgroundColor: w.color }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Nexus Priority Ranking */}
            <Card className="rounded-none border-2 border-foreground/10">
                <CardHeader className="border-b-2 border-foreground/5">
                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Nexus Öncelik Sıralaması
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
                        Ağırlıklı Karar Matrisi Sonucu
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-foreground/5">
                        {nexusScores.map((nexus, index) => (
                            <div
                                key={nexus.nexusId}
                                className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group"
                            >
                                {/* Rank */}
                                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-none border-2 border-foreground/10 group-hover:border-primary font-black text-lg tracking-tighter transition-colors">
                                    {index + 1}
                                </div>

                                {/* Nexus Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-black uppercase tracking-tight truncate">
                                            {nexus.name}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className="rounded-none text-[9px] font-bold tracking-wider"
                                        >
                                            {nexus.agentCount} AJAN · {nexus.taskCount} GÖREV
                                        </Badge>
                                    </div>

                                    {/* Score Bars */}
                                    <div className="flex gap-1 h-2">
                                        {DECISION_WEIGHTS.map((w) => (
                                            <div
                                                key={w.key}
                                                className="flex-1 bg-muted rounded-sm overflow-hidden"
                                                title={`${w.labelTR}: ${nexus.scores[w.key]}`}
                                            >
                                                <div
                                                    className="h-full rounded-sm transition-all duration-700"
                                                    style={{
                                                        width: `${nexus.scores[w.key]}%`,
                                                        backgroundColor: w.color,
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total Score */}
                                <div className="flex-shrink-0 text-right">
                                    <div className="text-2xl font-black tracking-tighter" style={{ color: nexus.color }}>
                                        {nexus.total}
                                    </div>
                                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                        PUAN
                                    </div>
                                </div>

                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
