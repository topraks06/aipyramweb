"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, Send, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function ContactPage() {
    const t = useTranslations("Contact");
    const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            const response = await fetch('/api/brain/v1/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: 'leads',
                    name: form.name,
                    email: form.email,
                    company: form.company || null,
                    source: "contact_form",
                    message: form.message,
                })
            });

            if (!response.ok) throw new Error("API Hatası");

            toast.success(t("form_send") + " ✓");
            setSent(true);
            setForm({ name: "", email: "", company: "", message: "" });
        } catch {
            const subject = encodeURIComponent(`${form.name} contact form — ${form.company}`);
            const body = encodeURIComponent(`${form.name}\n${form.company}\n${form.email}\n\n${form.message}`);
            window.location.href = `mailto:info@aipyram.com?subject=${subject}&body=${body}`;
            toast.success("Email client opened.");
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <Header />
            <main className="min-h-screen pt-20">
                <section className="py-24 relative">
                    <div className="absolute inset-0 swiss-cross-pattern opacity-[0.02]" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-3xl mb-16">
                            <p className="text-sm text-primary font-medium mb-2 flex items-center gap-2">
                                <Mail className="h-4 w-4" /> {t("badge")}
                            </p>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                                {t("title")}
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                {t("description")}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                            {/* Form */}
                            <div className="lg:col-span-3">
                                <form onSubmit={handleSubmit} className="corporate-card rounded-lg p-8 space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium">{t("form_name")}</Label>
                                            <Input placeholder="John Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium">{t("form_company")}</Label>
                                            <Input placeholder="Company Ltd." value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium">{t("form_email")}</Label>
                                        <Input type="email" placeholder="john@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium">{t("form_message")}</Label>
                                        <textarea
                                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={form.message}
                                            onChange={e => setForm({ ...form, message: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-11" disabled={sending}>
                                        <Send className="mr-2 h-4 w-4" />
                                        {sending ? t("form_sending") : t("form_send")}
                                    </Button>
                                </form>
                            </div>

                            {/* Info */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="corporate-card rounded-lg p-6">
                                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4">{t("hq_title")}</h3>
                                    <div className="space-y-3 text-sm text-muted-foreground">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-foreground font-medium">Aipyram GmbH</p>
                                                <p>Heimstrasse 10, CH-8953</p>
                                                <p>Dietikon, Zürich</p>
                                                <p>🇨🇭</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-primary shrink-0" />
                                            <a href="mailto:info@aipyram.com" className="hover:text-foreground transition-colors">info@aipyram.com</a>
                                        </div>
                                    </div>
                                </div>

                                <div className="corporate-card rounded-lg p-6">
                                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4">{t("turkey_title")}</h3>
                                    <div className="space-y-3">
                                        <Button variant="outline" className="w-full justify-start" asChild>
                                            <a href="tel:+41445008280">
                                                <Phone className="mr-2 h-4 w-4 text-primary" />
                                                +41 44 500 82 80
                                            </a>
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start" asChild>
                                            <a href="tel:+905553330511">
                                                <Phone className="mr-2 h-4 w-4 text-primary" />
                                                +90 555 333 05 11
                                            </a>
                                        </Button>
                                    </div>
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
