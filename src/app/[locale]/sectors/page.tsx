"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
    Briefcase, Building2, Stethoscope, Scale, Landmark, Plane, Zap,
    Truck, Globe, Car, Tv, ShoppingCart, PawPrint, MapPin, Building,
    ArrowRight, BarChart3
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { DataCredibility } from "@/components/ui/visual-intelligence";
import { useTranslations } from "next-intl";

const SECTOR_KEYS = [
    { key: "textile", icon: Briefcase, domains: 35, agents: 26, status: "active" as const, highlight: true },
    { key: "construction", icon: Building2, domains: 32, agents: 8, status: "active" as const },
    { key: "automotive", icon: Car, domains: 27, agents: 3, status: "planned" as const },
    { key: "rental", icon: Globe, domains: 14, agents: 2, status: "planned" as const },
    { key: "aviation", icon: Plane, domains: 15, agents: 2, status: "planned" as const },
    { key: "energy", icon: Zap, domains: 12, agents: 1, status: "planned" as const },
    { key: "fintech", icon: Landmark, domains: 23, agents: 2, status: "building" as const },
    { key: "health", icon: Stethoscope, domains: 23, agents: 2, status: "building" as const },
    { key: "media", icon: Tv, domains: 10, agents: 1, status: "planned" as const },
    { key: "lottery", icon: Landmark, domains: 7, agents: 1, status: "planned" as const },
    { key: "law", icon: Scale, domains: 7, agents: 1, status: "planned" as const },
    { key: "ecommerce", icon: ShoppingCart, domains: 35, agents: 2, status: "planned" as const },
    { key: "pets", icon: PawPrint, domains: 3, agents: 1, status: "planned" as const },
    { key: "cities", icon: MapPin, domains: 7, agents: 1, status: "planned" as const },
    { key: "corporate", icon: Building, domains: 1, agents: 4, status: "active" as const },
];

const totalDomains = SECTOR_KEYS.reduce((s, sec) => s + sec.domains, 0);
const totalAgents = SECTOR_KEYS.reduce((s, sec) => s + sec.agents, 0);
const activeSectors = SECTOR_KEYS.filter(s => s.status === "active").length;

export default function SectorsPage() {
    const t = useTranslations("Sectors");
    const tc = useTranslations("Common");

    const STATUS_MAP = {
        active: { label: tc("live"), color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
        building: { label: tc("developing"), color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
        planned: { label: tc("planned"), color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    };

    return (
        <>
            <Header />
            <main className="min-h-screen pt-20">
                <section className="py-24 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-background to-primary/[0.02]" />
                    <div className="container mx-auto px-4 relative z-10">
                        {/* Hero */}
                        <div className="max-w-3xl mb-16">
                            <Badge variant="outline" className="mb-4 text-xs font-medium">
                                <BarChart3 className="h-3 w-3 mr-1.5" />
                                {t("badge")}
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                                {t("title")}
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {t("description")}
                            </p>
                        </div>

                        {/* Sector Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                            {SECTOR_KEYS.map((sector) => {
                                const Icon = sector.icon;
                                const status = STATUS_MAP[sector.status];
                                const name = t(`sectors.${sector.key}`);
                                const desc = t(`sectors.${sector.key}_desc`);
                                return (
                                    <div
                                        key={sector.key}
                                        className={`corporate-card rounded-xl p-6 group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 ${sector.highlight ? "ring-1 ring-primary/20 bg-primary/[0.02]" : ""
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-2.5 bg-primary/8 rounded-lg group-hover:bg-primary/12 transition-colors">
                                                <Icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <Badge variant="outline" className={`text-[9px] font-bold border ${status.color}`}>
                                                {status.label}
                                            </Badge>
                                        </div>
                                        <h3 className="text-base font-bold mb-2 group-hover:text-primary transition-colors">{name}</h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{desc}</p>
                                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground border-t pt-3">
                                            <span><strong className="text-foreground tabular-nums">{sector.domains}</strong> {t("domain")}</span>
                                            <span><strong className="text-foreground tabular-nums">{sector.agents}</strong> {t("agent")}</span>
                                            {sector.highlight && (
                                                <Link href="/domains" className="ml-auto text-primary text-[10px] font-semibold hover:underline flex items-center gap-1">
                                                    {t("detail")} <ArrowRight className="h-3 w-3" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Portfolio Summary */}
                        <div className="corporate-card rounded-xl p-8">
                            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto text-center">
                                <div>
                                    <div className="text-3xl font-bold text-primary mb-1 tabular-nums">{totalDomains}+</div>
                                    <div className="text-xs text-muted-foreground">{t("strategic_domain")}</div>
                                    <div className="text-[9px] font-bold text-emerald-600 mt-1">↑ %38 YoY</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary mb-1 tabular-nums">{totalAgents}+</div>
                                    <div className="text-xs text-muted-foreground">{t("agent")}</div>
                                    <div className="text-[9px] font-bold text-emerald-600 mt-1">↑ %120 YoY</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary mb-1 tabular-nums">{SECTOR_KEYS.length}</div>
                                    <div className="text-xs text-muted-foreground">{t("sector_vertical")}</div>
                                    <div className="text-[9px] text-muted-foreground/60 mt-1">{activeSectors} {t("active")}</div>
                                </div>
                            </div>
                            <DataCredibility source="İç Veri Ağı" updated="2026 Q1" confidence={96} className="mt-6 justify-center" />
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
