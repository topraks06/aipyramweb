"use client";

import { TrendingUp, TrendingDown, Minus, Database, Clock, Shield, type LucideIcon } from "lucide-react";

/* ─── Data Credibility Footer ─── */
interface DataCredibilityProps {
    source?: string;
    updated?: string;
    confidence?: number;
    className?: string;
}

export function DataCredibility({ source = "Internal Registry", updated = "2026 Q1", confidence = 91, className = "" }: DataCredibilityProps) {
    const confColor = confidence >= 80 ? "text-emerald-600" : confidence >= 60 ? "text-amber-600" : "text-red-500";

    return (
        <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground/60 ${className}`}>
            <span className="inline-flex items-center gap-1">
                <Database className="h-2.5 w-2.5" />
                {source}
            </span>
            <span className="inline-flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {updated}
            </span>
            <span className={`inline-flex items-center gap-1 font-semibold ${confColor}`}>
                <Shield className="h-2.5 w-2.5" />
                {confidence}%
            </span>
        </div>
    );
}

/* ─── KPI Card with Trend ─── */
interface KPICardProps {
    icon: LucideIcon;
    value: string;
    label: string;
    desc?: string;
    trend?: { value: string; direction: "up" | "down" | "flat"; period?: string };
    className?: string;
}

export function KPICard({ icon: Icon, value, label, desc, trend, className = "" }: KPICardProps) {
    const TrendIcon = trend?.direction === "up" ? TrendingUp : trend?.direction === "down" ? TrendingDown : Minus;
    const trendColor = trend?.direction === "up" ? "text-emerald-600" : trend?.direction === "down" ? "text-red-500" : "text-muted-foreground";

    return (
        <div className={`corporate-card rounded-xl p-6 text-center group hover:shadow-lg hover:shadow-primary/5 transition-all ${className}`}>
            <Icon className="h-6 w-6 text-primary mx-auto mb-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="text-3xl font-bold text-primary mb-1">{value}</div>
            <div className="text-sm font-semibold text-foreground">{label}</div>
            {desc && <div className="text-xs text-muted-foreground mt-1">{desc}</div>}
            {trend && (
                <div className={`inline-flex items-center gap-1 mt-2 text-[10px] font-bold ${trendColor}`}>
                    <TrendIcon className="h-3 w-3" />
                    {trend.value}
                    {trend.period && <span className="font-normal text-muted-foreground/60 ml-0.5">{trend.period}</span>}
                </div>
            )}
        </div>
    );
}

/* ─── Pie Chart (Pure CSS) ─── */
interface PieSlice {
    label: string;
    value: number;
    color: string;
}

export function PieChart({ data, size = 180, className = "", centerLabel = "Total" }: { data: PieSlice[]; size?: number; className?: string; centerLabel?: string }) {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let cumulative = 0;

    const gradientParts = data.map((d) => {
        const start = (cumulative / total) * 360;
        cumulative += d.value;
        const end = (cumulative / total) * 360;
        return `${d.color} ${start}deg ${end}deg`;
    });

    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            <div
                className="rounded-full shadow-inner relative"
                style={{
                    width: size,
                    height: size,
                    background: `conic-gradient(${gradientParts.join(", ")})`,
                }}
            >
                <div className="absolute inset-4 rounded-full bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-lg font-bold text-primary">{total}</div>
                        <div className="text-[9px] text-muted-foreground">{centerLabel}</div>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                {data.map((d) => (
                    <div key={d.label} className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        {d.label} ({d.value})
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Mini Bar Chart (CSS) ─── */
interface BarItem {
    label: string;
    value: number;
    color?: string;
}

export function MiniBarChart({ data, maxValue, className = "" }: { data: BarItem[]; maxValue?: number; className?: string }) {
    const max = maxValue || Math.max(...data.map(d => d.value));

    return (
        <div className={`space-y-2 ${className}`}>
            {data.map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground w-20 truncate text-right">{d.label}</span>
                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${(d.value / max) * 100}%`,
                                backgroundColor: d.color || "oklch(0.55 0.22 25)",
                            }}
                        />
                    </div>
                    <span className="text-xs font-bold tabular-nums w-8 text-right">{d.value}</span>
                </div>
            ))}
        </div>
    );
}

/* ─── Simple Line Sparkline (SVG) ─── */
export function Sparkline({ data, width = 200, height = 50, color = "oklch(0.55 0.22 25)", className = "" }: { data: number[]; width?: number; height?: number; color?: string; className?: string }) {
    if (data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);

    const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 8) - 4}`).join(" ");
    const fillPoints = `0,${height} ${points} ${width},${height}`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={className}>
            <polyline points={fillPoints} fill={`${color}`} opacity={0.08} />
            <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
