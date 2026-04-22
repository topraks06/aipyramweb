
"use client";

export const dynamic = 'force-dynamic';


import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Star, Zap, Crown, Send, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const EVENT_DATE = new Date("2026-05-19T09:00:00+03:00");

function calcDaysRemaining() {
    const now = new Date();
    const diff = EVENT_DATE.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function useDaysRemaining() {
    const [days, setDays] = useState(() => calcDaysRemaining());
    useEffect(() => {
        setDays(calcDaysRemaining());
        const timer = setInterval(() => setDays(calcDaysRemaining()), 60_000);
        return () => clearInterval(timer);
    }, []);
    return days;
}

export default function SponsorPage() {
    const t = useTranslations("Sponsor");
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [form, setForm] = useState({ company: "", name: "", email: "", phone: "" });
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const daysRemaining = useDaysRemaining();

    const PACKAGES = [
        {
            id: "exhibitor",
            name: t("pkg1_name"),
            price: "€2,500",
            amount: 2500,
            period: t("one_time"),
            description: t("pkg1_desc"),
            icon: Star,
            color: "border-border",
            features: [t("pkg1_f1"), t("pkg1_f2"), t("pkg1_f3"), t("pkg1_f4"), t("pkg1_f5")],
        },
        {
            id: "strategic_partner",
            name: t("pkg2_name"),
            price: "€5,000",
            amount: 5000,
            period: t("one_time"),
            description: t("pkg2_desc"),
            icon: Zap,
            popular: true,
            color: "border-primary",
            features: [t("pkg2_f1"), t("pkg2_f2"), t("pkg2_f3"), t("pkg2_f4"), t("pkg2_f5"), t("pkg2_f6"), t("pkg2_f7")],
        },
        {
            id: "enterprise",
            name: t("pkg3_name"),
            price: "€10,000",
            amount: 10000,
            period: t("one_time"),
            description: t("pkg3_desc"),
            icon: Crown,
            color: "border-accent",
            features: [t("pkg3_f1"), t("pkg3_f2"), t("pkg3_f3"), t("pkg3_f4"), t("pkg3_f5"), t("pkg3_f6"), t("pkg3_f7"), t("pkg3_f8")],
        },
    ];

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPackage) return;
        setSending(true);

        const pkg = PACKAGES.find(p => p.id === selectedPackage);
        if (!pkg) return;

        try {
            const response = await fetch('/api/brain/v1/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: 'sponsor_applications',
                    company_name: form.company,
                    contact_name: form.name,
                    email: form.email,
                    phone: form.phone || null,
                    package: selectedPackage,
                    amount: pkg.amount,
                    source: "form",
                    status: "pending",
                })
            });

            if (!response.ok) throw new Error("API Hatası");

            toast.success(t("toast_success"));
            setSuccess(true);
        } catch {
            toast.error(t("toast_error"));
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <Header />
            <main className="min-h-screen pt-20">
                {/* Hero */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 swiss-cross-pattern opacity-5" />
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />

                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1.5">
                            {t("event_badge")}
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                            {t("title_1")}
                            <span className="text-primary ml-3">{t("title_2")}</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                            {t("description")}
                        </p>
                        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {daysRemaining} {t("days_left")}</span>
                            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {t("sector_coverage")}</span>
                            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {t("ai_analytics")}</span>
                        </div>
                    </div>
                </section>

                {/* Packages */}
                <section className="py-16 bg-muted/20">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {PACKAGES.map((pkg) => {
                                const IconComponent = pkg.icon;
                                return (
                                    <Card
                                        key={pkg.id}
                                        className={`relative overflow-hidden corporate-card transition-all hover:scale-[1.01] ${pkg.color} ${pkg.popular ? "ring-2 ring-primary shadow-lg" : ""}`}
                                    >
                                        {pkg.popular && (
                                            <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1 text-[10px] font-bold uppercase tracking-widest">
                                                {t("most_popular")}
                                            </div>
                                        )}
                                        <CardHeader className={pkg.popular ? "pt-10" : ""}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-primary/8 rounded-md">
                                                    <IconComponent className="h-5 w-5 text-primary" />
                                                </div>
                                                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                            </div>
                                            <div className="flex items-baseline gap-1 mb-2">
                                                <span className="text-3xl font-bold">{pkg.price}</span>
                                                <span className="text-sm text-muted-foreground">/ {pkg.period}</span>
                                            </div>
                                            <CardDescription className="text-sm">{pkg.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <ul className="space-y-2.5">
                                                {pkg.features.map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm">
                                                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="space-y-2">
                                                <Button
                                                    className="w-full"
                                                    variant={pkg.popular ? "default" : "outline"}
                                                    onClick={() => {
                                                        setSelectedPackage(pkg.id);
                                                        document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
                                                    }}
                                                >
                                                    <Send className="mr-2 h-4 w-4" />
                                                    {t("apply_now")}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Application Form */}
                <section id="apply-form" className="py-20">
                    <div className="container mx-auto px-4 max-w-xl">
                        {success ? (
                            <div className="corporate-card rounded-lg p-12 text-center">
                                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold mb-2">{t("success_title")}</h2>
                                <p className="text-muted-foreground">{t("success_text")}</p>
                            </div>
                        ) : (
                            <div className="corporate-card rounded-lg p-8">
                                <h2 className="text-xl font-bold mb-1">{t("form_title")}</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    {selectedPackage
                                        ? `${t("selected")}: ${PACKAGES.find(p => p.id === selectedPackage)?.name} (${PACKAGES.find(p => p.id === selectedPackage)?.price})`
                                        : t("select_package")}
                                </p>
                                <form onSubmit={handleApply} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium">{t("label_company")} *</Label>
                                            <Input
                                                placeholder="TekstilPro GmbH"
                                                value={form.company}
                                                onChange={e => setForm({ ...form, company: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium">{t("label_contact")} *</Label>
                                            <Input
                                                placeholder="Max Mustermann"
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium">{t("label_email")} *</Label>
                                        <Input
                                            type="email"
                                            placeholder="info@company.com"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium">{t("label_phone")}</Label>
                                        <Input
                                            type="tel"
                                            placeholder="+41 44 500 82 80"
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-11"
                                        disabled={sending || !selectedPackage}
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        {sending ? t("btn_sending") : selectedPackage ? t("btn_submit") : t("btn_select_first")}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
