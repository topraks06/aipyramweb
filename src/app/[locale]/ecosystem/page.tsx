"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Network, Globe, ArrowRight, Cpu, Layers, Zap, Mail, Building2, Briefcase, Stethoscope, Landmark, Plane, GraduationCap, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataCredibility } from "@/components/ui/visual-intelligence";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

/* Data arrays moved inside component — see EcosystemPage() */

/* ─── Interactive Network Visualization ─── */
function EcosystemNetwork() {
    const [hovered, setHovered] = useState<string | null>(null);

    const nodes = [
        { id: "aipyram", label: "AIPyram", x: 300, y: 150, r: 45, color: "#DC2626", main: true },
        { id: "perde", label: "Perde.ai", x: 120, y: 60, r: 30, color: "#059669", main: false },
        { id: "trtex", label: "TrTex.com", x: 480, y: 60, r: 30, color: "#EA580C", main: false },
        { id: "hometex", label: "Hometex.ai", x: 120, y: 240, r: 25, color: "#2563EB", main: false },
        { id: "didim", label: "DidimEmlak.ai", x: 480, y: 240, r: 28, color: "#7C3AED", main: false },
    ];

    const edges = [
        { from: "aipyram", to: "perde", label: "26 Agent" },
        { from: "aipyram", to: "trtex", label: "8 Agent" },
        { from: "aipyram", to: "hometex", label: "4 Agent" },
        { from: "aipyram", to: "didim", label: "8 Agent" },
        { from: "perde", to: "trtex", label: "Data" },
        { from: "perde", to: "hometex", label: "Signals" },
        { from: "trtex", to: "hometex", label: "Supply" },
    ];

    const getNode = (id: string) => nodes.find(n => n.id === id)!;

    return (
        <svg viewBox="0 0 600 300" className="w-full mx-auto" style={{ maxWidth: "700px", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.08))" }}>
            {/* Edges */}
            {edges.map((edge, i) => {
                const from = getNode(edge.from);
                const to = getNode(edge.to);
                const isHighlighted = hovered === edge.from || hovered === edge.to;
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;
                return (
                    <g key={i}>
                        <line
                            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                            stroke={isHighlighted ? "#DC2626" : "#E2E8F0"}
                            strokeWidth={isHighlighted ? 2 : 1}
                            strokeDasharray={isHighlighted ? "none" : "4 4"}
                            style={{ transition: "all 0.3s" }}
                        />
                        {isHighlighted && (
                            <text x={midX} y={midY - 6} textAnchor="middle" fontSize={8} fill="#64748B" fontWeight="600">
                                {edge.label}
                            </text>
                        )}
                        {/* Animated pulse on highlighted edges */}
                        {isHighlighted && (
                            <circle r={3} fill="#DC2626">
                                <animateMotion dur="2s" repeatCount="indefinite"
                                    path={`M${from.x},${from.y} L${to.x},${to.y}`}
                                />
                            </circle>
                        )}
                    </g>
                );
            })}

            {/* Nodes */}
            {nodes.map(node => {
                const isHovered = hovered === node.id;
                return (
                    <g
                        key={node.id}
                        onMouseEnter={() => setHovered(node.id)}
                        onMouseLeave={() => setHovered(null)}
                        style={{ cursor: "pointer" }}
                    >
                        {/* Glow */}
                        {isHovered && (
                            <circle cx={node.x} cy={node.y} r={node.r + 8}
                                fill={node.color} opacity={0.15}
                                style={{ transition: "all 0.3s" }}
                            />
                        )}
                        {/* Node circle */}
                        <circle
                            cx={node.x} cy={node.y} r={node.r}
                            fill="white"
                            stroke={isHovered ? node.color : "#E2E8F0"}
                            strokeWidth={isHovered ? 3 : 1.5}
                            style={{ transition: "all 0.3s" }}
                        />
                        {/* Pulse for main node */}
                        {node.main && (
                            <circle cx={node.x} cy={node.y} r={node.r}
                                fill="none" stroke={node.color} strokeWidth={1} opacity={0.3}>
                                <animate attributeName="r" from={node.r} to={node.r + 15} dur="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                            </circle>
                        )}
                        {/* Label */}
                        <text
                            x={node.x} y={node.y + (node.main ? 1 : 1)}
                            textAnchor="middle" dominantBaseline="middle"
                            fontSize={node.main ? 13 : 9}
                            fontWeight={node.main ? "800" : "600"}
                            fill={isHovered ? node.color : "#334155"}
                            style={{ transition: "fill 0.3s" }}
                        >
                            {node.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

export default function EcosystemPage() {
    const t = useTranslations("Ecosystem");
    const tc = useTranslations("Common");
    const [hoveredProject, setHoveredProject] = useState<string | null>(null);

    const ECOSYSTEM_LAYERS = [
        { name: t("layer1_name"), desc: t("layer1_desc"), icon: Network, color: "from-red-500/20 to-red-600/5", metric: "v2.1", metricLabel: t("layer1_metric") },
        { name: t("layer2_name"), desc: t("layer2_desc"), icon: Zap, color: "from-amber-500/20 to-amber-600/5", metric: "12", metricLabel: t("layer2_metric") },
        { name: t("layer3_name"), desc: t("layer3_desc"), icon: Cpu, color: "from-blue-500/20 to-blue-600/5", metric: "50+", metricLabel: t("layer3_metric") },
        { name: t("layer4_name"), desc: t("layer4_desc"), icon: Globe, color: "from-emerald-500/20 to-emerald-600/5", metric: "252+", metricLabel: t("layer4_metric") },
    ];

    const PROJECTS = [
        { name: "Perde.ai", sector: t("proj1_sector"), status: tc("live"), statusColor: "bg-emerald-500", desc: t("proj1_desc"), agents: 26, domains: 17, confidence: 95, connections: ["TrTex.com", "Hometex.ai"], dataFlow: [t("proj1_flow1"), t("proj1_flow2")], url: "https://perde.ai" },
        { name: "TrTex.com", sector: t("proj2_sector"), status: tc("developing"), statusColor: "bg-amber-500", desc: t("proj2_desc"), agents: 8, domains: 12, confidence: 88, connections: ["Perde.ai", "Hometex.ai"], dataFlow: [t("proj2_flow1"), t("proj2_flow2")], url: "https://trtex.com" },
        { name: "Hometex.ai", sector: t("proj3_sector"), status: tc("planned"), statusColor: "bg-blue-500", desc: t("proj3_desc"), agents: 4, domains: 8, confidence: 80, connections: ["Perde.ai", "TrTex.com", "Heimtex.ai"], dataFlow: [t("proj3_flow1")], url: "https://hometex.ai" },
        { name: "DidimEmlak.ai", sector: t("proj4_sector"), status: tc("live"), statusColor: "bg-emerald-500", desc: t("proj4_desc"), agents: 8, domains: 11, confidence: 85, connections: [], dataFlow: [t("proj4_flow1")], url: "https://didimemlak.ai" },
    ];

    const SECTORS_OVERVIEW = [
        { name: t("sec_textile"), icon: Briefcase, domains: 34, agents: 26, status: t("sec_active"), growth: "+8" },
        { name: t("sec_realestate"), icon: Building2, domains: 28, agents: 8, status: t("sec_active"), growth: "+5" },
        { name: t("sec_health"), icon: Stethoscope, domains: 15, agents: 4, status: t("sec_planning"), growth: "+3" },
        { name: t("sec_fintech"), icon: Landmark, domains: 17, agents: 3, status: t("sec_planning"), growth: "+4" },
        { name: t("sec_aviation"), icon: Plane, domains: 18, agents: 3, status: t("sec_planning"), growth: "+6" },
        { name: t("sec_education"), icon: GraduationCap, domains: 3, agents: 1, status: t("sec_planning"), growth: "+1" },
        { name: t("sec_logistics"), icon: Truck, domains: 14, agents: 2, status: t("sec_planning"), growth: "+3" },
        { name: t("sec_energy"), icon: Zap, domains: 10, agents: 2, status: t("sec_planning"), growth: "+2" },
    ];

    return (
        <>
            <Header />
            <main className="min-h-screen pt-20">

                {/* Hero */}
                <section className="py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-background to-primary/[0.02]" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div>
                            <Badge variant="outline" className="mb-6 text-xs font-medium">
                                <Network className="h-3 w-3 mr-1.5" />
                                {t("badge")}
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                                {t("title_1")}{" "}
                                <span className="text-primary">{t("title_2")}</span>
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                                {t("description")}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Interactive Network Visualization */}
                <section className="py-16 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">
                                {t("network_title")}
                            </h2>
                            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
                                {t("network_help")}
                            </p>
                        </div>
                        <EcosystemNetwork />
                        <DataCredibility source="Neural Protocol v2.1" updated={tc("live")} confidence={98} className="mt-6 justify-center" />
                    </div>
                </section>

                {/* Architecture Layers */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl font-bold mb-3">
                                {t("layers_title")}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {ECOSYSTEM_LAYERS.map((layer, i) => (
                                <div key={i} className={`corporate-card rounded-xl p-6 relative overflow-hidden group hover:shadow-lg transition-all`}>
                                    <div className={`absolute inset-0 bg-gradient-to-br ${layer.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                    <div className="relative z-10">
                                        <layer.icon className="h-8 w-8 text-primary mb-4" />
                                        <h3 className="font-bold mb-2">{layer.name}</h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{layer.desc}</p>
                                        <div className="pt-2 border-t border-border/50">
                                            <div className="text-lg font-bold text-primary">{layer.metric}</div>
                                            <div className="text-[9px] text-muted-foreground">{layer.metricLabel}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Projects Network with Hover Detail */}
                <section className="py-20 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <Badge variant="outline" className="mb-4 text-xs font-medium">
                                <Layers className="h-3 w-3 mr-1.5" />
                                {t("projects_badge")}
                            </Badge>
                            <h2 className="text-3xl font-bold mb-4">
                                {t("projects_title_1")} <span className="text-primary">{t("projects_title_2")}</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {PROJECTS.map((project) => (
                                <Card
                                    key={project.name}
                                    className="corporate-card group hover:shadow-lg hover:shadow-primary/5 transition-all"
                                    onMouseEnter={() => setHoveredProject(project.name)}
                                    onMouseLeave={() => setHoveredProject(null)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-lg bg-primary/8 group-hover:bg-primary/12 transition-colors">
                                                    <Globe className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                                        {project.name}
                                                    </CardTitle>
                                                    <span className="text-xs text-muted-foreground">{project.sector}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${project.statusColor}`} />
                                                <span className="text-xs font-medium">{project.status}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{project.desc}</p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Mini KPIs */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                                                <div className="text-sm font-bold text-primary">{project.agents}</div>
                                                <div className="text-[8px] text-muted-foreground">AI Agent</div>
                                            </div>
                                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                                                <div className="text-sm font-bold text-primary">{project.domains}</div>
                                                <div className="text-[8px] text-muted-foreground">Domain</div>
                                            </div>
                                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                                                <div className="text-sm font-bold text-emerald-600">%{project.confidence}</div>
                                                <div className="text-[8px] text-muted-foreground">Confidence</div>
                                            </div>
                                        </div>

                                        {/* Data Flow (shown on hover) */}
                                        <div className={`overflow-hidden transition-all duration-300 ${hoveredProject === project.name ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                                            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                                {t("data_flow")}
                                            </div>
                                            <div className="space-y-1">
                                                {project.dataFlow.map(flow => (
                                                    <div key={flow} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                        <Zap className="h-2.5 w-2.5 text-amber-500 shrink-0" />
                                                        {flow}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Connections */}
                                        {project.connections.length > 0 && (
                                            <div>
                                                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                                    {t("neural_connections")}
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {project.connections.map(c => (
                                                        <Badge key={c} variant="outline" className="text-[9px] font-medium bg-primary/5 text-primary border-primary/20">
                                                            <Network className="h-2.5 w-2.5 mr-1" />{c}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                                            <a href={project.url} target="_blank" rel="noopener noreferrer">
                                                {project.status === tc("live") ? t("visit_platform") : t("coming_soon")}
                                                <ArrowRight className="ml-1.5 h-3 w-3" />
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <DataCredibility source="Project Tracker" updated="2026 Q1" confidence={91} className="mt-6 justify-center" />
                    </div>
                </section>

                {/* Sector Overview Table */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div>
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold mb-4">
                                    {t("resources_title_1")} <span className="text-primary">{t("resources_title_2")}</span>
                                </h2>
                            </div>

                            <div className="corporate-card rounded-xl overflow-hidden">
                                <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
                                    <span>{t("sector")}</span>
                                    <span className="text-center">Domain</span>
                                    <span className="text-center">AI Agent</span>
                                    <span className="text-center">{t("growth")}</span>
                                    <span className="text-center">{t("status")}</span>
                                </div>
                                {SECTORS_OVERVIEW.map((sector) => {
                                    const Icon = sector.icon;
                                    return (
                                        <div key={sector.name} className="grid grid-cols-5 gap-4 p-4 items-center border-b last:border-0 hover:bg-muted/20 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <Icon className="h-4 w-4 text-primary shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                                                <span className="text-sm font-medium">{sector.name}</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="text-sm font-bold text-primary">{sector.domains}</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="text-sm font-bold">{sector.agents}</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="text-xs font-bold text-emerald-600">{sector.growth}</span>
                                            </div>
                                            <div className="text-center">
                                                <Badge variant="outline" className={`text-[9px] ${sector.status === t("sec_active") ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"}`}>
                                                    {sector.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <DataCredibility source="Internal Registry" updated="2026 Q1" confidence={96} className="mt-4 justify-center" />
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold mb-4">
                                {t("cta_title_1")} <span className="text-primary">{t("cta_title_2")}</span>
                            </h2>
                            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                                {t("cta_desc")}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button size="lg" className="group" asChild>
                                    <Link href="/investor">
                                        {t("cta_investor")} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <a href="mailto:info@aipyram.com">
                                        <Mail className="mr-2 h-4 w-4" />
                                        info@aipyram.com
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
