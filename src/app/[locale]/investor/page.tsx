"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { TrendingUp, Globe, Building2, Cpu, Layers, Handshake, ArrowRight, Mail, Phone, ChevronRight, Target, Shield, BarChart3, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, MiniBarChart, Sparkline, DataCredibility, KPICard } from "@/components/ui/visual-intelligence";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const GROWTH_DATA = [42, 78, 105, 142, 168, 196, 221, 248, 271];

const PROJECT_MATURITY = [
    { label: "Perde.ai", value: 95, color: "#059669" },
    { label: "TrTex.com", value: 45, color: "#EA580C" },
    { label: "DidimEmlak.ai", value: 35, color: "#2563EB" },
    { label: "Hometex.ai", value: 15, color: "#7C3AED" },
];

export default function InvestorPage() {
    const t = useTranslations("Investor");
    const tc = useTranslations("Common");

    const PORTFOLIO_STATS = [
        { icon: Globe, value: "252+", label: t("strategic_domain"), desc: t("premium_domains"), trend: { value: "↑ 38%", direction: "up" as const, period: "YoY" } },
        { icon: Building2, value: "15", label: t("sector_vertical"), desc: t("deep_expertise"), trend: { value: "↑ 3", direction: "up" as const, period: "2025" } },
        { icon: Cpu, value: "50+", label: "AI Agent", desc: t("autonomous_agents"), trend: { value: "↑ 120%", direction: "up" as const, period: "YoY" } },
        { icon: Layers, value: "4", label: t("active_platform"), desc: t("projects_in_dev"), trend: { value: "↑ 2", direction: "up" as const, period: "2025" } },
    ];

    const INVESTMENT_MODELS = [
        {
            title: t("model_domain_title"),
            desc: t("model_domain_desc"),
            features: [t("model_domain_f1"), t("model_domain_f2"), t("model_domain_f3"), t("model_domain_f4")],
            badge: t("model_domain_badge"),
            badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        },
        {
            title: t("model_partner_title"),
            desc: t("model_partner_desc"),
            features: [t("model_partner_f1"), t("model_partner_f2"), t("model_partner_f3"), t("model_partner_f4")],
            badge: t("model_partner_badge"),
            badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        },
        {
            title: t("model_tech_title"),
            desc: t("model_tech_desc"),
            features: [t("model_tech_f1"), t("model_tech_f2"), t("model_tech_f3"), t("model_tech_f4")],
            badge: t("model_tech_badge"),
            badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        },
    ];

    const ACTIVE_PROJECTS = [
        { name: "Perde.ai", sector: t("sector_textile"), status: tc("live"), url: "https://perde.ai" },
        { name: "TrTex.com", sector: "Textile B2B", status: tc("developing"), url: "https://trtex.com" },
        { name: "Hometex.ai", sector: t("sector_trade"), status: tc("planned"), url: "https://hometex.ai" },
        { name: "DidimEmlak.ai", sector: t("sector_realestate"), status: tc("live"), url: "https://didimemlak.ai" },
    ];

    const SECTOR_PIE_DATA = [
        { label: "Textile", value: 34, color: "#DC2626" },
        { label: "Real Estate", value: 28, color: "#EA580C" },
        { label: "Aviation", value: 18, color: "#2563EB" },
        { label: "Fintech", value: 17, color: "#7C3AED" },
        { label: "Health", value: 15, color: "#059669" },
        { label: "Logistics", value: 14, color: "#CA8A04" },
        { label: "Rental", value: 12, color: "#0891B2" },
        { label: "Energy", value: 10, color: "#65A30D" },
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
                                <TrendingUp className="h-3 w-3 mr-1.5" />
                                {t("badge")}
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                                {t("title_1")}{" "}
                                <span className="text-primary">{t("title_2")}</span>
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-8">
                                {t("description")}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" className="group" asChild>
                                    <Link href="/contact">
                                        <Mail className="mr-2 h-4 w-4" />
                                        {t("cta_meeting")}
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/domains">
                                        <Globe className="mr-2 h-4 w-4" />
                                        {t("cta_portfolio")}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Portfolio KPI Stats */}
                <section className="py-16 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {PORTFOLIO_STATS.map((stat) => (
                                <KPICard key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} desc={stat.desc} trend={stat.trend} />
                            ))}
                        </div>
                        <div className="mt-4">
                            <DataCredibility source="İç Veri Ağı" updated="2026 Q1" confidence={98} className="justify-center" />
                        </div>
                    </div>
                </section>

                {/* Analytical Dashboard */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div>
                            <div className="text-center mb-12">
                                <Badge variant="outline" className="mb-4 text-xs font-medium">
                                    <BarChart3 className="h-3 w-3 mr-1.5" />
                                    {t("analytics_badge")}
                                </Badge>
                                <h2 className="text-3xl font-bold mb-4">
                                    {t("analytics_title_1")} <span className="text-primary">{t("analytics_title_2")}</span>
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="corporate-card">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">{t("chart_sector")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <PieChart data={SECTOR_PIE_DATA} size={160} />
                                        <DataCredibility source="Domain Registry" updated="2026 Q1" confidence={96} className="mt-4 justify-center" />
                                    </CardContent>
                                </Card>

                                <Card className="corporate-card">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">{t("chart_growth")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0 flex flex-col items-center">
                                        <div className="text-center mb-3">
                                            <div className="text-3xl font-bold text-primary">252+</div>
                                            <div className="text-[10px] text-muted-foreground">{t("cumulative_domain")}</div>
                                            <div className="text-[9px] font-bold text-emerald-600 mt-1">↑ 38% YoY</div>
                                        </div>
                                        <Sparkline data={GROWTH_DATA} width={220} height={60} />
                                        <div className="flex justify-between w-full text-[9px] text-muted-foreground/50 mt-1 px-1">
                                            <span>2018</span>
                                            <span>2022</span>
                                            <span>2026</span>
                                        </div>
                                        <DataCredibility source="Domain Registry" updated="2026 Q1" confidence={94} className="mt-4 justify-center" />
                                    </CardContent>
                                </Card>

                                <Card className="corporate-card">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">{t("chart_maturity")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="text-[10px] text-muted-foreground mb-3 text-center">%</div>
                                        <MiniBarChart data={PROJECT_MATURITY} maxValue={100} />
                                        <DataCredibility source="Project Tracker" updated="2026 Q1" confidence={91} className="mt-4 justify-center" />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Company Vision */}
                <section className="py-20 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            <div>
                                <Badge variant="outline" className="mb-4 text-xs font-medium">
                                    <Target className="h-3 w-3 mr-1.5" />
                                    {t("vision_badge")}
                                </Badge>
                                <h2 className="text-3xl font-bold mb-6">
                                    {t("vision_title_1")} <span className="text-primary">{t("vision_title_2")}</span>
                                </h2>
                                <div className="space-y-4 text-muted-foreground leading-relaxed">
                                    <p>{t("vision_p1")}</p>
                                    <p>{t("vision_p2")}</p>
                                    <p>{t("vision_p3")}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Card className="corporate-card">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/8"><Shield className="h-5 w-5 text-primary" /></div>
                                            <CardTitle className="text-base">{t("card_structure")}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{t("card_structure_text")}</p>
                                    </CardContent>
                                </Card>
                                <Card className="corporate-card">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/8"><BarChart3 className="h-5 w-5 text-primary" /></div>
                                            <CardTitle className="text-base">{t("card_growth")}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{t("card_growth_text")}</p>
                                    </CardContent>
                                </Card>
                                <Card className="corporate-card">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/8"><Users className="h-5 w-5 text-primary" /></div>
                                            <CardTitle className="text-base">{t("card_experience")}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{t("card_experience_text")}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Investment Models */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <Badge variant="outline" className="mb-4 text-xs font-medium">
                                <Handshake className="h-3 w-3 mr-1.5" />
                                {t("models_badge")}
                            </Badge>
                            <h2 className="text-3xl font-bold mb-4">
                                {t("models_title_1")} <span className="text-primary">{t("models_title_2")}</span>
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                {t("models_desc")}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {INVESTMENT_MODELS.map((model, i) => (
                                <Card key={i} className="group corporate-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                                    <CardHeader>
                                        <Badge variant="outline" className={`w-fit text-[10px] font-bold mb-3 ${model.badgeColor}`}>
                                            {model.badge}
                                        </Badge>
                                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                            {model.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-muted-foreground leading-relaxed">{model.desc}</p>
                                        <ul className="space-y-2">
                                            {model.features.map((f) => (
                                                <li key={f} className="flex items-center gap-2 text-sm">
                                                    <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                                                    <span className="text-muted-foreground">{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Active Projects */}
                <section className="py-20 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div>
                            <div className="text-center mb-12">
                                <Badge variant="outline" className="mb-4 text-xs font-medium">
                                    <Building2 className="h-3 w-3 mr-1.5" />
                                    {t("projects_badge")}
                                </Badge>
                                <h2 className="text-3xl font-bold mb-4">
                                    {t("projects_title_1")} <span className="text-primary">{t("projects_title_2")}</span>
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {ACTIVE_PROJECTS.map((project) => (
                                    <div key={project.name} className="corporate-card rounded-xl p-5 flex items-center justify-between group hover:shadow-lg hover:shadow-primary/5 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-lg bg-primary/8 group-hover:bg-primary/12 transition-colors">
                                                <Globe className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-semibold group-hover:text-primary transition-colors">{project.name}</div>
                                                <div className="text-xs text-muted-foreground">{project.sector}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="text-[10px]">{project.status}</Badge>
                                            <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                                                <ArrowRight className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold mb-4">
                                {t("cta_title_1")} <span className="text-primary">{t("cta_title_2")}</span>
                            </h2>
                            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                                {t("cta_desc")}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                                <Button size="lg" className="group" asChild>
                                    <a href="mailto:info@aipyram.com">
                                        <Mail className="mr-2 h-4 w-4" />
                                        info@aipyram.com
                                    </a>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <a href="tel:+41445008280">
                                        <Phone className="mr-2 h-4 w-4" />
                                        +41 44 500 82 80
                                    </a>
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Aipyram GmbH · Heimstrasse 10, CH-8953 Dietikon
                            </p>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </>
    );
}
