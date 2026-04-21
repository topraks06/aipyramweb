"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ExternalLink, Globe, Sparkles, ArrowRight, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataCredibility } from "@/components/ui/visual-intelligence";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function ProjectsPage() {
    const t = useTranslations("FlagshipProjects");
    const tc = useTranslations("Common");

    const PROJECTS = [
        {
            name: "Perde.ai",
            status: tc("live"),
            statusColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
            url: "https://perde.ai",
            tagline: t("p1_tagline"),
            description: t("p1_desc"),
            agents: 26,
            domains: 8,
            features: [t("p1_f1"), t("p1_f2"), t("p1_f3"), t("p1_f4")],
            tech: ["Gemini AI", "Computer Vision", "Next.js", "Firebase"],
        },
        {
            name: "TrTex.com",
            status: tc("developing"),
            statusColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
            url: "https://trtex.com",
            tagline: t("p2_tagline"),
            description: t("p2_desc"),
            agents: 8,
            domains: 5,
            features: [t("p2_f1"), t("p2_f2"), t("p2_f3"), t("p2_f4")],
            tech: ["Marketplace AI", "NLP", "Supply Chain"],
        },
        {
            name: "Hometex.ai",
            status: tc("planned"),
            statusColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
            url: "https://hometex.ai",
            tagline: t("p3_tagline"),
            description: t("p3_desc"),
            agents: 4,
            domains: 3,
            features: [t("p3_f1"), t("p3_f2"), t("p3_f3"), t("p3_f4")],
            tech: ["Trend Analysis", "NLP", "Data Mining"],
        },
        {
            name: "DidimEmlak.ai",
            status: tc("live"),
            statusColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
            url: "https://didimemlak.ai",
            tagline: t("p4_tagline"),
            description: t("p4_desc"),
            agents: 8,
            domains: 6,
            features: [t("p4_f1"), t("p4_f2"), t("p4_f3"), t("p4_f4")],
            tech: ["Predictive Analytics", "GIS", "Market Intelligence"],
        },
    ];

    const totalAgents = PROJECTS.reduce((s, p) => s + p.agents, 0);

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
                                <Sparkles className="h-3 w-3 mr-1.5" />
                                {t("badge")}
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                                {t("title_1")} <span className="text-primary">{t("title_2")}</span>
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {t("page_desc")}
                            </p>
                        </div>

                        {/* KPI Strip */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            <div className="text-center p-4 corporate-card rounded-xl">
                                <div className="text-2xl font-bold text-primary">{PROJECTS.length}</div>
                                <div className="text-[10px] font-semibold">{t("kpi_projects")}</div>
                            </div>
                            <div className="text-center p-4 corporate-card rounded-xl">
                                <div className="text-2xl font-bold text-primary">{totalAgents}+</div>
                                <div className="text-[10px] font-semibold">AI {t("agent")}</div>
                            </div>
                            <div className="text-center p-4 corporate-card rounded-xl">
                                <div className="text-2xl font-bold text-primary">{PROJECTS.filter(p => p.status === tc("live")).length}</div>
                                <div className="text-[10px] font-semibold">{t("kpi_live")}</div>
                            </div>
                            <div className="text-center p-4 corporate-card rounded-xl">
                                <div className="text-2xl font-bold text-primary">3</div>
                                <div className="text-[10px] font-semibold">{t("kpi_sectors")}</div>
                                <div className="text-[9px] text-muted-foreground">{t("kpi_sectors_list")}</div>
                            </div>
                        </div>

                        {/* Project Cards */}
                        <div className="space-y-6 mb-12">
                            {PROJECTS.map((project) => (
                                <div
                                    key={project.name}
                                    className="corporate-card rounded-xl overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                                >
                                    <div className="p-6 md:p-8">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h2 className="text-xl font-bold font-mono group-hover:text-primary transition-colors">
                                                        {project.name}
                                                    </h2>
                                                    <Badge variant="outline" className={`text-[9px] font-bold border ${project.statusColor}`}>
                                                        {project.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-medium text-primary/80">{project.tagline}</p>
                                            </div>
                                            <Button variant="outline" size="sm" className="shrink-0 text-xs" asChild>
                                                <a href={project.url} target="_blank" rel="noopener noreferrer">
                                                    {project.url.replace("https://", "")} <ExternalLink className="ml-1.5 h-3 w-3" />
                                                </a>
                                            </Button>
                                        </div>

                                        <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-3xl">
                                            {project.description}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Features */}
                                            <div>
                                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{t("features_label")}</h3>
                                                <div className="space-y-1.5">
                                                    {project.features.map(f => (
                                                        <div key={f} className="text-xs text-foreground flex items-center gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-primary" />
                                                            {f}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Tech Stack */}
                                            <div>
                                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{t("tech_label")}</h3>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {project.tech.map(tech => (
                                                        <Badge key={tech} variant="secondary" className="text-[9px] font-medium">
                                                            {tech}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* KPIs */}
                                            <div>
                                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">{t("capacity_label")}</h3>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                                                        <Cpu className="h-3 w-3 text-primary mx-auto mb-1" />
                                                        <div className="text-sm font-bold">{project.agents}</div>
                                                        <div className="text-[8px] text-muted-foreground">AI Agent</div>
                                                    </div>
                                                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                                                        <Globe className="h-3 w-3 text-primary mx-auto mb-1" />
                                                        <div className="text-sm font-bold">{project.domains}</div>
                                                        <div className="text-[8px] text-muted-foreground">Domain</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <DataCredibility source="İç Veri Ağı" updated="2026 Q1" confidence={98} className="mb-8" />

                        {/* CTA */}
                        <div className="corporate-card rounded-xl p-8 text-center">
                            <h2 className="text-xl font-bold mb-3">{t("cta_title")}</h2>
                            <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
                                {t("cta_desc")}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Button asChild>
                                    <a href="mailto:info@aipyram.com">info@aipyram.com</a>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/investor">{t("cta_investor")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
