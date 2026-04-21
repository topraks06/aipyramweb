
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    MISSION_DEADLINE,
    MISSION_TARGETS,
    MISSION_PHASES,
    type MissionTarget,
} from "@/lib/neural-protocol-config";
import {
    Timer, Rocket, Globe, CheckCircle2,
    Clock, Hammer, Target, Zap
} from "lucide-react";

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    live: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "CANLI" },
    building: { icon: Hammer, color: "text-amber-500", bg: "bg-amber-500/10", label: "YAPIM" },
    planned: { icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", label: "PLAN" },
};

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalDays: number;
}

function calculateTimeLeft(): TimeLeft {
    const diff = new Date(MISSION_DEADLINE).getTime() - Date.now();

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 };
    }

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        totalDays: Math.ceil(diff / (1000 * 60 * 60 * 24)),
    };
}

function getPhaseProgress(phaseIndex: number, totalDaysLeft: number): number {
    // Toplam süre 90 gün olarak varsay
    const elapsed = 90 - totalDaysLeft;
    const phaseEnd = MISSION_PHASES[phaseIndex].durationDays;
    const phaseStart = phaseIndex === 0 ? 0 : MISSION_PHASES[phaseIndex - 1].durationDays;
    const phaseLength = phaseEnd - phaseStart;

    if (elapsed < phaseStart) return 0;
    if (elapsed >= phaseEnd) return 100;
    return Math.round(((elapsed - phaseStart) / phaseLength) * 100);
}

export default function MissionCountdown() {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const urgencyColor =
        timeLeft.totalDays <= 14 ? "text-red-500 border-red-500" :
            timeLeft.totalDays <= 30 ? "text-amber-500 border-amber-500" :
                "text-primary border-primary";

    const urgencyBg =
        timeLeft.totalDays <= 14 ? "bg-red-500/5" :
            timeLeft.totalDays <= 30 ? "bg-amber-500/5" :
                "bg-primary/5";

    return (
        <div className="space-y-6">
            {/* Main Countdown */}
            <div className={`relative border-4 ${urgencyColor} ${urgencyBg} p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-colors duration-500`}>
                <div className={`absolute -top-4 -left-4 ${timeLeft.totalDays <= 14 ? "bg-red-500" : timeLeft.totalDays <= 30 ? "bg-amber-500" : "bg-primary"} text-white px-4 py-1 font-black uppercase text-xs tracking-widest transition-colors duration-500`}>
                    19 MAYIS HOMETEX FUARI
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-none border-2 ${urgencyColor} ${urgencyBg}`}>
                            <Timer className={`h-8 w-8 ${urgencyColor.split(" ")[0]}`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">LANSMAN GERİ SAYIMI</h2>
                            <p className="text-xs text-muted-foreground">
                                Hedef: {new Date(MISSION_DEADLINE).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                        </div>
                    </div>

                    {/* Countdown Digits */}
                    <div className="flex items-center gap-3">
                        {[
                            { value: timeLeft.days, label: "GÜN" },
                            { value: timeLeft.hours, label: "SAAT" },
                            { value: timeLeft.minutes, label: "DAK" },
                            { value: timeLeft.seconds, label: "SAN" },
                        ].map((unit, i) => (
                            <div key={unit.label} className="text-center">
                                <div className={`text-3xl md:text-4xl font-black tracking-tighter tabular-nums ${urgencyColor.split(" ")[0]} transition-colors`}>
                                    {String(unit.value).padStart(2, "0")}
                                </div>
                                <div className="text-[8px] font-black text-muted-foreground tracking-widest mt-0.5">{unit.label}</div>
                                {i < 3 && <span className="hidden md:inline text-muted-foreground/40 text-xl font-thin absolute mt-[-28px] ml-[46px]">:</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mission Targets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {MISSION_TARGETS.map((target: MissionTarget) => {
                    const status = STATUS_CONFIG[target.status] || STATUS_CONFIG.planned;
                    const StatusIcon = status.icon;

                    return (
                        <Card key={target.site} className="rounded-none border-2 border-foreground/10 hover:border-primary transition-all group overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <Globe className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <div className={`flex items-center gap-1 ${status.color}`}>
                                        <StatusIcon className="h-3 w-3" />
                                        <span className="text-[8px] font-black tracking-widest">{status.label}</span>
                                    </div>
                                </div>
                                <div className="text-sm font-black uppercase tracking-tight truncate">{target.site}</div>
                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{target.roleTR}</div>
                                <div className="mt-3">
                                    <Progress value={target.progress} className="h-2 rounded-none" />
                                    <div className="text-right text-[9px] font-black text-muted-foreground mt-0.5">{target.progress}%</div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Mission Phases */}
            <Card className="rounded-none border-2 border-foreground/10">
                <CardContent className="p-0">
                    <div className="divide-y divide-foreground/5">
                        {MISSION_PHASES.map((phase, index) => {
                            const progress = getPhaseProgress(index, timeLeft.totalDays);
                            const isActive = progress > 0 && progress < 100;
                            const isCompleted = progress >= 100;
                            const PhaseIcon = isCompleted ? CheckCircle2 : isActive ? Zap : Target;

                            return (
                                <div key={phase.id} className={`p-5 ${isActive ? "bg-primary/5" : ""} transition-colors`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-none border-2 ${isCompleted ? "border-emerald-500 bg-emerald-500/10" :
                                                isActive ? "border-primary bg-primary/10" :
                                                    "border-foreground/10 bg-muted/30"
                                            }`}>
                                            <PhaseIcon className={`h-5 w-5 ${isCompleted ? "text-emerald-500" :
                                                    isActive ? "text-primary animate-pulse" :
                                                        "text-muted-foreground"
                                                }`} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black text-muted-foreground">FAZ {phase.id}</span>
                                                <span className="text-sm font-black uppercase tracking-tight">{phase.nameTR}</span>
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-none text-[8px] font-bold tracking-widest"
                                                >
                                                    {phase.durationDays} GÜN
                                                </Badge>
                                                {isActive && (
                                                    <Badge className="rounded-none text-[8px] font-black tracking-widest bg-primary animate-pulse">
                                                        AKTİF
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">{phase.description}</p>

                                            <div className="mt-2 flex items-center gap-2">
                                                <Progress value={progress} className="h-2 rounded-none flex-1" />
                                                <span className="text-[9px] font-black text-muted-foreground w-8 text-right">{progress}%</span>
                                            </div>

                                            <div className="flex gap-1 mt-2 flex-wrap">
                                                {phase.targets.map(target => (
                                                    <span
                                                        key={target}
                                                        className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 bg-muted rounded-none border border-foreground/10 text-muted-foreground"
                                                    >
                                                        {target}
                                                    </span>
                                                ))}
                                            </div>
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
