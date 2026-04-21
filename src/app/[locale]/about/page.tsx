"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Shield, Globe, MapPin, Target, Cpu, TrendingUp, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataCredibility } from "@/components/ui/visual-intelligence";
import { useTranslations } from "next-intl";

export default function AboutPage() {
    const t = useTranslations("About");
    const tc = useTranslations("Common");
    const th = useTranslations("Hero");

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
                                <Shield className="h-3 w-3 mr-1.5" />
                                {t("badge")}
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                                {t("subtitle")}
                                <br />
                                <span className="text-primary">{t("registered")}</span>
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {t("description")}
                            </p>
                        </div>

                        {/* Key Facts */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                            {[
                                { icon: MapPin, label: t("hq"), value: "Dietikon, CH", sub: t("hq_value") },
                                { icon: Globe, label: t("domains_label"), value: "252+", sub: th("stat_sectors_sub") },
                                { icon: Cpu, label: th("stat_agents"), value: "50+", sub: t("autonomous") },
                                { icon: Calendar, label: t("projects_title"), value: "4", sub: t("active_dev") },
                            ].map((fact) => (
                                <div key={fact.label} className="corporate-card rounded-xl p-5 text-center group hover:shadow-lg hover:shadow-primary/5 transition-all">
                                    <fact.icon className="h-5 w-5 text-primary mx-auto mb-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                                    <div className="text-2xl font-bold mb-0.5">{fact.value}</div>
                                    <div className="text-xs font-semibold text-foreground">{fact.label}</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">{fact.sub}</div>
                                </div>
                            ))}
                        </div>

                        {/* Vision & Mission */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                            <div className="corporate-card rounded-xl p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-primary/8 rounded-lg">
                                        <Target className="h-4 w-4 text-primary" />
                                    </div>
                                    <h2 className="text-lg font-bold">{t("vision")}</h2>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {t("vision_text")}
                                </p>
                            </div>
                            <div className="corporate-card rounded-xl p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-primary/8 rounded-lg">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                    </div>
                                    <h2 className="text-lg font-bold">{t("mission")}</h2>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {t("mission_text")}
                                </p>
                            </div>
                        </div>

                        {/* Active Projects */}
                        <div className="corporate-card rounded-xl p-8 mb-16">
                            <h2 className="text-lg font-bold mb-6">{t("projects_title")}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { name: "perde.ai", desc: "Yapay Zeka Destekli Perde Tasarımı", status: tc("live"), agents: 26, color: "text-emerald-600" },
                                    { name: "trtex.com", desc: "B2B Tekstil Pazaryeri", status: tc("live"), agents: 8, color: "text-emerald-600" },
                                    { name: "didimemlak.ai", desc: "Akıllı Gayrimenkul", status: tc("live"), agents: 8, color: "text-emerald-600" },
                                    { name: "hometex.ai", desc: "Fuar ve Veri Zekası", status: tc("planned"), agents: 4, color: "text-blue-600" },
                                ].map((proj) => (
                                    <div key={proj.name} className="p-4 bg-muted/30 rounded-lg border">
                                        <div className="font-mono text-sm font-bold mb-1">{proj.name}</div>
                                        <div className="text-xs text-muted-foreground mb-2">{proj.desc}</div>
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className={`font-bold ${proj.color}`}>{proj.status}</span>
                                            <span className="text-muted-foreground">{proj.agents} {t("agent_label")}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <DataCredibility source="İç Veri Ağı" updated="2026 Q1" confidence={98} className="mt-4" />
                        </div>

                        {/* Contact Points */}
                        <div className="corporate-card rounded-xl p-8">
                            <h2 className="text-lg font-bold mb-6">{t("contact_points")}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{t("hq_office")}</h3>
                                    <p className="text-sm text-muted-foreground">Heimstrasse 10</p>
                                    <p className="text-sm text-muted-foreground">CH-8953 Dietikon, Zürich</p>
                                    <p className="text-sm text-muted-foreground mt-1">+41 44 500 82 80</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{t("turkey_ops")}</h3>
                                    <p className="text-sm text-muted-foreground">İstanbul</p>
                                    <p className="text-sm text-muted-foreground">{t("textile_ops")}</p>
                                    <p className="text-sm text-muted-foreground mt-1">+90 555 333 05 11</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{t("email_label")}</h3>
                                    <p className="text-sm text-muted-foreground">info@aipyram.com</p>
                                    <p className="text-sm text-muted-foreground mt-2 text-[10px]">
                                        {t("trade_reg")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
