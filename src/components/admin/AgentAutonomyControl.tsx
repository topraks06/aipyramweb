
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CrudOperations } from "@/lib/crud-operations";
import {
    AGENT_AUTHORITY_MAP,
    AUTHORITY_COLORS,
    type AgentAuthorityConfig,
    type AuthorityLevel,
} from "@/lib/neural-protocol-config";
import {
    Shield, ShieldAlert, Users, Lock,
    Unlock, Activity, CircleDot, AlertTriangle
} from "lucide-react";

interface AgentWithAuthority extends AgentAuthorityConfig {
    currentTasks: number;
    isOverLimit: boolean;
    dbAgentId?: string;
    isActive: boolean;
}

export default function AgentAutonomyControl() {
    const [agents, setAgents] = useState<AgentWithAuthority[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAgentData();
    }, []);

    const loadAgentData = async () => {
        try {
            const agentsCrud = new CrudOperations("ai_agents");
            const tasksCrud = new CrudOperations("agent_tasks");

            const [dbAgents, dbTasks] = await Promise.all([
                agentsCrud.findMany(),
                tasksCrud.findMany({ status: "running" }),
            ]);

            const enriched: AgentWithAuthority[] = AGENT_AUTHORITY_MAP.map(config => {
                const dbAgent = dbAgents.find((a: any) =>
                    a.agent_name?.toLowerCase().includes(config.agentName.toLowerCase())
                );
                const currentTasks = dbAgent
                    ? dbTasks.filter((t: any) => t.agent_id === dbAgent.id).length
                    : 0;

                return {
                    ...config,
                    currentTasks,
                    isOverLimit: currentTasks > config.maxParallelTasks,
                    dbAgentId: dbAgent?.id,
                    isActive: dbAgent?.is_active ?? true,
                };
            });

            setAgents(enriched);
        } catch (error) {
            console.error("Ajan otorite verileri yüklenirken hata:", error);

            // Fallback
            setAgents(AGENT_AUTHORITY_MAP.map(config => ({
                ...config,
                currentTasks: 0,
                isOverLimit: false,
                isActive: true,
            })));
        } finally {
            setIsLoading(false);
        }
    };

    const strategicCount = agents.filter(a => a.authorityLevel === "strategic").length;
    const sectoralCount = agents.filter(a => a.authorityLevel === "sectoral").length;
    const operationalCount = agents.filter(a => a.authorityLevel === "operational").length;
    const overLimitCount = agents.filter(a => a.isOverLimit).length;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="relative border-4 border-foreground bg-background p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="absolute -top-4 -left-4 bg-primary text-primary-foreground px-4 py-1 font-black uppercase text-xs tracking-widest">
                    OTORİTE KONTROL
                </div>
                <div className="flex items-center gap-6">
                    <div className="bg-primary/10 p-4 rounded-none border-2 border-primary">
                        <Shield className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">AJAN OTONOMİ KONTROLÜ</h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1">
                            Yetki Seviyeleri & Paralel Görev Limitleri
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "STRATEJİK", value: strategicCount, color: AUTHORITY_COLORS.strategic.text },
                    { label: "SEKTÖREL", value: sectoralCount, color: AUTHORITY_COLORS.sectoral.text },
                    { label: "OPERASYONEL", value: operationalCount, color: AUTHORITY_COLORS.operational.text },
                    { label: "LİMİT AŞIMI", value: overLimitCount, color: overLimitCount > 0 ? "text-red-500" : "text-emerald-500" },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-none border-2 border-foreground/10 hover:border-primary transition-all group">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                                {i === 3 ? <AlertTriangle className="h-4 w-4 text-foreground/30 group-hover:text-primary transition-colors" /> :
                                    <Users className="h-4 w-4 text-foreground/30 group-hover:text-primary transition-colors" />
                                }
                            </div>
                            <div className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Authority Legend */}
            <div className="grid grid-cols-3 gap-4">
                {(["strategic", "sectoral", "operational"] as AuthorityLevel[]).map(level => {
                    const config = AUTHORITY_COLORS[level];
                    return (
                        <div key={level} className={`flex items-center gap-3 p-3 rounded-none border-2 ${config.border} ${config.bg}`}>
                            <div className={`h-3 w-3 rounded-full ${config.text === "text-amber-500" ? "bg-amber-500" : config.text === "text-blue-500" ? "bg-blue-500" : "bg-emerald-500"}`} />
                            <div>
                                <span className={`text-xs font-black uppercase tracking-widest ${config.text}`}>{config.label}</span>
                                <p className="text-[9px] text-muted-foreground">
                                    {level === "strategic" ? "Tam yetki, dağıtım & yapılandırma" : level === "sectoral" ? "Sektörel görevler, onay gerekli" : "Operasyonel görevler, sınırlı yetki"}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Agent Cards */}
            <Card className="rounded-none border-2 border-foreground/10">
                <CardHeader className="border-b-2 border-foreground/5">
                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Ajan Yetki Haritası
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
                        Her Ajanın Otorite Seviyesi ve Görev Kapasitesi
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-foreground/5">
                        {agents.map((agent) => {
                            const auth = AUTHORITY_COLORS[agent.authorityLevel];
                            const usagePercent = Math.round((agent.currentTasks / agent.maxParallelTasks) * 100);

                            return (
                                <div
                                    key={agent.agentName}
                                    className={`p-5 hover:bg-muted/20 transition-colors ${agent.isOverLimit ? "bg-red-500/5" : ""}`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 flex items-center justify-center rounded-none border-2 ${auth.border} ${auth.bg}`}>
                                                <Shield className={`h-5 w-5 ${auth.text}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black uppercase tracking-tight">{agent.agentName}</span>
                                                    <Badge variant="outline" className={`rounded-none text-[8px] font-black tracking-widest ${auth.text} ${auth.border}`}>
                                                        {auth.label}
                                                    </Badge>
                                                    <CircleDot className={`h-3 w-3 ${agent.isActive ? "text-green-500 animate-pulse" : "text-muted-foreground"}`} />
                                                    {agent.isOverLimit && (
                                                        <Badge variant="destructive" className="rounded-none text-[8px] font-black tracking-widest animate-pulse">
                                                            LİMİT AŞILDI
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        {agent.requireCoreApproval ? (
                                                            <><Lock className="h-3 w-3" /> Çekirdek Onayı Gerekli</>
                                                        ) : (
                                                            <><Unlock className="h-3 w-3" /> Otonom Çalışabilir</>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Task Capacity Bar */}
                                    <div className="ml-[52px] space-y-2">
                                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                            <span>GÖREV KAPASİTESİ</span>
                                            <span className={agent.isOverLimit ? "text-red-500" : ""}>
                                                {agent.currentTasks} / {agent.maxParallelTasks}
                                            </span>
                                        </div>
                                        <Progress
                                            value={Math.min(usagePercent, 100)}
                                            className={`h-3 rounded-none ${agent.isOverLimit ? "[&>div]:bg-red-500" : ""}`}
                                        />

                                        {/* Allowed Actions */}
                                        <div className="flex gap-1 flex-wrap mt-2">
                                            {agent.allowedActions.map(action => (
                                                <span
                                                    key={action}
                                                    className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 bg-muted rounded-none border border-foreground/10 text-muted-foreground"
                                                >
                                                    {action}
                                                </span>
                                            ))}
                                        </div>
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
