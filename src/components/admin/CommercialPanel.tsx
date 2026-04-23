"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// B2BSimulator arşive taşındı (admin_unused_20260407)
import { toast } from "sonner";
import {
    DollarSign, Users, FileText, TrendingUp,
    Clock, CheckCircle2, XCircle, Mail, Phone,
    ArrowUpRight, MessageCircle, RefreshCw, AlertTriangle, type LucideIcon
} from "lucide-react";

// ── Types ─────────────────────────────────────────────
interface SponsorApplication {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    phone?: string;
    package: string;
    amount: number;
    status: string;
    source: string;
    created_at: string;
}

interface Lead {
    id: string;
    name: string;
    company: string;
    email: string;
    source: string;
    status: string;
    score: number;
    created_at: string;
}

// ── Style Maps ────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: "bg-amber-500/10", text: "text-amber-600", label: "Pending" },
    approved: { bg: "bg-emerald-500/10", text: "text-emerald-600", label: "Approved" },
    rejected: { bg: "bg-red-500/10", text: "text-red-600", label: "Rejected" },
    new: { bg: "bg-blue-500/10", text: "text-blue-600", label: "New" },
    contacted: { bg: "bg-amber-500/10", text: "text-amber-600", label: "Contacted" },
    qualified: { bg: "bg-purple-500/10", text: "text-purple-600", label: "Qualified" },
    converted: { bg: "bg-emerald-500/10", text: "text-emerald-600", label: "Converted" },
};

const PACKAGE_LABELS: Record<string, string> = {
    exhibitor: "Exhibitor €2,500",
    strategic_partner: "Strategic €5,000",
    enterprise: "Enterprise €10,000",
};

const SOURCE_ICONS: Record<string, LucideIcon> = {
    whatsapp: MessageCircle,
    email: Mail,
    form: FileText,
    contact_form: FileText,
    sponsor_page: ArrowUpRight,
    direct: Phone,
    trtex: ArrowUpRight,
};

export default function CommercialPanel() {
    const searchParams = useSearchParams();
    const [sponsors, setSponsors] = useState<SponsorApplication[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [dbConnected, setDbConnected] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    useEffect(() => {
        if (searchParams.get("payment") === "success") {
           toast.success("Ödeme Başarılı! Jetonlar (Lead Tokens) hesaba yüklendi.", { duration: 5000 });
        } else if (searchParams.get("payment") === "cancelled") {
           toast.error("Ödeme İptal Edildi.", { duration: 5000 });
        }
    }, [searchParams]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch sponsors from Local Sovereign Node
            const spRes = await fetch("/api/admin/data?table=sponsor_applications");
            const spData = await spRes.json();
            
            // Fetch leads from Local Sovereign Node
            const ldRes = await fetch("/api/admin/data?table=leads");
            const ldData = await ldRes.json();

            if (spData.success && ldData.success) {
                setSponsors(spData.data || []);
                setLeads(ldData.data || []);
                setDbConnected(true);
            } else {
                setSponsors([]);
                setLeads([]);
                setDbConnected(false);
            }
        } catch (err) {
            console.error("Failed to fetch commercial data:", err);
            setDbConnected(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Actions ───────────────────────────────────────
    const updateSponsorStatus = async (id: string, status: "approved" | "rejected") => {
        try {
           const res = await fetch("/api/admin/data", {
               method: "PUT",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ table: "sponsor_applications", id, data: { status } })
           });
           const data = await res.json();
           if(data.success) {
               toast.success(`Sponsor ${status} (Gerçek Veri Güncellendi)`);
               fetchData();
           } else {
               toast.error(`Hata: ${data.error}`);
           }
        } catch (err: any) {
           toast.error("Bağlantı Hatası: Failed to update.");
        }
    };

    const updateLeadStatus = async (id: string, status: string) => {
        try {
           const res = await fetch("/api/admin/data", {
               method: "PUT",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ table: "leads", id, data: { status } })
           });
           const data = await res.json();
           if(data.success) {
               toast.success(`Lead updated to ${status} (Gerçek Veri)`);
               fetchData();
           } else {
               toast.error(`Hata: ${data.error}`);
           }
        } catch (err: any) {
           toast.error("Bağlantı Hatası: Failed to update.");
        }
    };

    // ── KPIs ──────────────────────────────────────────
    const totalRevenue = sponsors.filter(s => s.status === "approved").reduce((sum, s) => sum + Number(s.amount), 0);
    const pendingRevenue = sponsors.filter(s => s.status === "pending").reduce((sum, s) => sum + Number(s.amount), 0);
    const newLeads = leads.filter(l => l.status === "new").length;
    const conversionRate = leads.length > 0
        ? Math.round((leads.filter(l => l.status === "converted").length / leads.length) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* ── DB Status ─────────────────────────────── */}
            {!dbConnected && !loading && (
                <div className="flex items-center gap-3 p-4 rounded-md bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800">Database tables not found</p>
                        <p className="text-xs text-amber-600">
                            Check <code className="bg-amber-500/10 px-1 rounded">Sovereign Local Data Nodes</code> to enable live data.
                        </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={fetchData} className="shrink-0">
                        <RefreshCw className="h-3 w-3 mr-1" /> Retry
                    </Button>
                </div>
            )}

            {/* ── Core 1: Revenue Engine (Stripe Test Modülü) ── */}
            <Card className="corporate-card bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-primary">Ticari Sicil Paneli (Buy Lead Tokens)</h3>
                        <p className="text-xs text-muted-foreground mt-1">Stripe Checkout Otonom Fatura Tahsilat Testi</p>
                    </div>
                    <Button 
                        size="sm" 
                        disabled={checkoutLoading}
                        onClick={async () => {
                            setCheckoutLoading(true);
                            try {
                                const res = await fetch("/api/stripe/checkout", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        supplierId: "DEV_TEST_SUPPLIER_001",
                                        node_id: "aipyram-core",
                                        packageId: "starter"
                                    })
                                });
                                const data = await res.json();
                                if (data.url) {
                                    window.location.href = data.url;
                                } else {
                                    toast.error("Stripe Session Hatası: " + data.error);
                                }
                            } catch (err) {
                                toast.error("Bağlantı Hatası");
                            } finally {
                                setCheckoutLoading(false);
                            }
                        }}
                    >
                        {checkoutLoading ? "Yönlendiriliyor..." : "$49.00 (10 Tokens) Satın Al"}
                    </Button>
                </CardContent>
            </Card>

            {/* ── Revenue KPI Bar ─────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="corporate-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total Revenue</p>
                                <p className="text-2xl font-bold text-emerald-600">€{totalRevenue.toLocaleString()}</p>
                            </div>
                            <div className="p-2 bg-emerald-500/10 rounded-md">
                                <DollarSign className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="corporate-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Pending</p>
                                <p className="text-2xl font-bold text-amber-600">€{pendingRevenue.toLocaleString()}</p>
                            </div>
                            <div className="p-2 bg-amber-500/10 rounded-md">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="corporate-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">New Leads</p>
                                <p className="text-2xl font-bold">{newLeads}</p>
                            </div>
                            <div className="p-2 bg-blue-500/10 rounded-md">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="corporate-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Conversion</p>
                                <p className="text-2xl font-bold">{conversionRate}%</p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-md">
                                <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* B2BSimulator arşivlendi */}

            {/* ── Sponsor Applications ────────────────────── */}
            <Card className="corporate-card mt-6">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-md">
                                <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-semibold">Sponsor Applications</CardTitle>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {sponsors.length} total · {sponsors.filter(s => s.status === "pending").length} pending
                                </p>
                            </div>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs" onClick={fetchData}>
                            <RefreshCw className="h-3 w-3 mr-1" /> Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {sponsors.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            No sponsor applications yet.
                            <br />
                            <span className="text-xs">Applications from /sponsor will appear here.</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {sponsors.map((sp) => {
                                const SourceIcon = SOURCE_ICONS[sp.source] || Mail;
                                const status = STATUS_STYLES[sp.status] || STATUS_STYLES.pending;
                                return (
                                    <div key={sp.id} className="flex items-center justify-between py-3 px-4 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <SourceIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold">{sp.company_name}</span>
                                                    <Badge variant="outline" className="text-[9px] font-bold">
                                                        {PACKAGE_LABELS[sp.package] || sp.package}
                                                    </Badge>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {sp.contact_name} · {sp.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold">€{Number(sp.amount).toLocaleString()}</span>
                                            <Badge className={`text-[9px] ${status.bg} ${status.text} border-0`}>
                                                {status.label}
                                            </Badge>
                                            {sp.status === "pending" && (
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-500/10"
                                                        onClick={() => updateSponsorStatus(sp.id, "approved")}>
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:bg-red-500/10"
                                                        onClick={() => updateSponsorStatus(sp.id, "rejected")}>
                                                        <XCircle className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Lead Pipeline ───────────────────────────── */}
            <Card className="corporate-card">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-md">
                                <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-semibold">Lead Pipeline</CardTitle>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {leads.length} leads · {newLeads} new
                                </p>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {leads.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            No leads yet.
                            <br />
                            <span className="text-xs">Contact form submissions will appear here.</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {leads.map((lead) => {
                                const SourceIcon = SOURCE_ICONS[lead.source] || Mail;
                                const status = STATUS_STYLES[lead.status] || STATUS_STYLES.new;
                                return (
                                    <div key={lead.id} className="flex items-center justify-between py-3 px-4 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <SourceIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold">{lead.name}</span>
                                                    {lead.score > 0 && (
                                                        <Badge variant="outline" className="text-[9px]">Score: {lead.score}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {lead.company ? `${lead.company} · ` : ""}{lead.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(lead.created_at).toLocaleDateString()}
                                            </span>
                                            <select
                                                value={lead.status}
                                                onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                                className="text-[10px] bg-transparent border rounded px-2 py-1 cursor-pointer"
                                            >
                                                <option value="new">New</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="qualified">Qualified</option>
                                                <option value="converted">Converted</option>
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
