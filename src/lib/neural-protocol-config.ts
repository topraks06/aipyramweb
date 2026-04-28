// ═══════════════════════════════════════════════════════════════
// aipyram NEURAL PROTOCOL v2.1 — MERKEZ KONFİGÜRASYON
// Tüm "Üst Akıl" katmanı bu dosyadan beslenir.
// ═══════════════════════════════════════════════════════════════

// ─── 1. DECISION ENGINE ────────────────────────────────────────

export interface PriorityWeight {
    key: string;
    label: string;
    labelTR: string;
    weight: number;
    color: string;
    icon: string;       // lucide icon name
}

export const DECISION_WEIGHTS: PriorityWeight[] = [
    { key: "revenue", label: "Revenue Impact", labelTR: "Gelir Etkisi", weight: 0.35, color: "oklch(0.65 0.25 145)", icon: "TrendingUp" },
    { key: "strategic_visibility", label: "Strategic Visibility", labelTR: "Stratejik Görünürlük", weight: 0.25, color: "oklch(0.60 0.20 250)", icon: "Eye" },
    { key: "launch_deadline", label: "Launch Deadline", labelTR: "Lansman Tarihi", weight: 0.20, color: "oklch(0.60 0.25 25)", icon: "Timer" },
    { key: "data_dependency", label: "Data Dependency", labelTR: "Veri Bağımlılığı", weight: 0.20, color: "oklch(0.55 0.20 300)", icon: "Database" },
];

export const AUTO_REALLOCATE_RULE = {
    condition: "deadline < 30 days",
    conditionTR: "Lansmana 30 günden az kaldığında",
    action: "allocate_all_agents_to_priority_cluster",
    actionTR: "Tüm ajanları öncelik kümesine ata",
    isActive: true,
};


// ─── 2. CROSS-NEXUS INTELLIGENCE ──────────────────────────────

export interface NexusSignal {
    id: string;
    signalName: string;
    signalNameTR: string;
    description: string;
    affects: string[];        // nexus ID'leri
    action: string;
    actionTR: string;
    severity: "low" | "medium" | "high" | "critical";
    lastTriggered: string | null;
    isActive: boolean;
}

export const NEXUS_SIGNALS: NexusSignal[] = [
    {
        id: "sig_textile_price",
        signalName: "Textile Price Spike",
        signalNameTR: "Tekstil Fiyat Artışı",
        description: "Hammadde veya işlenmiş tekstil fiyatlarında ani artış",
        affects: ["real_estate_nexus", "interior_design"],
        action: "update_cost_models",
        actionTR: "Maliyet modellerini güncelle",
        severity: "high",
        lastTriggered: null,
        isActive: true,
    },
    {
        id: "sig_property_demand",
        signalName: "Property Demand Surge",
        signalNameTR: "Gayrimenkul Talep Artışı",
        description: "Belirli bölgelerde gayrimenkul talebinde ani yükseliş",
        affects: ["textile_nexus", "fintech_nexus"],
        action: "trigger_bundle_offers",
        actionTR: "Çapraz paket teklifleri tetikle",
        severity: "medium",
        lastTriggered: null,
        isActive: true,
    },
    {
        id: "sig_fair_proximity",
        signalName: "Trade Fair Approaching",
        signalNameTR: "Fuar Yaklaşıyor",
        description: "Hometex veya Heimtextil fuarına 30 günden az kaldı",
        affects: ["textile_nexus", "logistics_nexus", "marketing_nexus"],
        action: "activate_fair_protocol",
        actionTR: "Fuar protokolünü aktif et",
        severity: "critical",
        lastTriggered: "2026-02-15",
        isActive: true,
    },
    {
        id: "sig_currency_shift",
        signalName: "Currency Fluctuation",
        signalNameTR: "Döviz Dalgalanması",
        description: "TRY/EUR veya TRY/CHF kurunda %3+ günlük değişim",
        affects: ["fintech_nexus", "real_estate_nexus", "textile_nexus"],
        action: "adjust_pricing_engine",
        actionTR: "Fiyatlama motorunu kalibre et",
        severity: "high",
        lastTriggered: null,
        isActive: true,
    },
    {
        id: "sig_legal_update",
        signalName: "Regulatory Change",
        signalNameTR: "Mevzuat Değişikliği",
        description: "E-ticaret, KVKK veya gümrük mevzuatında değişiklik",
        affects: ["law_nexus", "fintech_nexus", "textile_nexus"],
        action: "compliance_review",
        actionTR: "Uyumluluk taraması başlat",
        severity: "medium",
        lastTriggered: null,
        isActive: false,
    },
];


// ─── 3. NEXUS (SEKTÖR) TANIMLARı ─────────────────────────────

export interface NexusDefinition {
    id: string;
    name: string;
    nameTR: string;
    domains: string[];
    color: string;
    icon: string;     // lucide icon name
}

export const NEXUS_MAP: NexusDefinition[] = [
    { id: "textile_nexus", name: "Textile Nexus", nameTR: "Tekstil Nexus", domains: ["trtex.com", "hometex.ai", "perde.ai", "heimtextil.ai"], color: "oklch(0.65 0.25 145)", icon: "Scissors" },
    { id: "real_estate_nexus", name: "Real Estate Nexus", nameTR: "Emlak Nexus", domains: ["didimemlak.ai", "immobilien.ai", "fethiye.ai"], color: "oklch(0.60 0.20 250)", icon: "Building2" },
    { id: "law_nexus", name: "Law & Public Nexus", nameTR: "Hukuk & Kamu Nexus", domains: ["adalet24.ai", "tbmm.ai"], color: "oklch(0.55 0.15 50)", icon: "Scale" },
    { id: "health_nexus", name: "Health Nexus", nameTR: "Sağlık Nexus", domains: ["spitex.ai", "health24.ai"], color: "oklch(0.60 0.20 170)", icon: "HeartPulse" },
    { id: "fintech_nexus", name: "Fintech Nexus", nameTR: "Fintech Nexus", domains: ["trpay.ai"], color: "oklch(0.55 0.22 280)", icon: "Banknote" },
    { id: "interior_design", name: "Interior Design", nameTR: "İç Mimarlık", domains: ["perde.ai"], color: "oklch(0.60 0.18 330)", icon: "Palette" },
    { id: "logistics_nexus", name: "Logistics Nexus", nameTR: "Lojistik Nexus", domains: [], color: "oklch(0.55 0.15 80)", icon: "Truck" },
    { id: "marketing_nexus", name: "Marketing Nexus", nameTR: "Pazarlama Nexus", domains: [], color: "oklch(0.60 0.22 30)", icon: "Megaphone" },
    { id: "tourism_nexus", name: "Tourism Nexus", nameTR: "Turizm Nexus", domains: ["fethiye.ai"], color: "oklch(0.60 0.20 200)", icon: "Plane" },
    { id: "education_nexus", name: "Education Nexus", nameTR: "Eğitim Nexus", domains: [], color: "oklch(0.55 0.18 120)", icon: "GraduationCap" },
    { id: "media_nexus", name: "Media Nexus", nameTR: "Medya Nexus", domains: [], color: "oklch(0.60 0.20 310)", icon: "Tv" },
    { id: "tech_nexus", name: "Technology Nexus", nameTR: "Teknoloji Nexus", domains: ["aipyram.com"], color: "oklch(0.55 0.25 25)", icon: "Cpu" },
];


// ─── 4. DATA INTEGRITY SHIELD ─────────────────────────────────

export interface TrustedSource {
    id: string;
    name: string;
    path: string;
    type: "document" | "live_domain" | "api" | "database";
    trustScore: number;          // 0-100
    lastVerified: string;
    status: "verified" | "pending" | "rejected";
}

export const TRUSTED_SOURCES: TrustedSource[] = [
    { id: "src_domains_doc", name: "270 Domain Master List", path: "/mnt/data/270_domain_2026_ocak.docx", type: "document", trustScore: 100, lastVerified: "2026-01-15", status: "verified" },
    { id: "src_live_domains", name: "Verified Live Domains", path: "verified_live_domains", type: "live_domain", trustScore: 95, lastVerified: "2026-02-27", status: "verified" },
    { id: "src_sovereign", name: "Sovereign Google-Native DB", path: "memory://aipyram-core", type: "database", trustScore: 100, lastVerified: "2026-04-01", status: "verified" },
    { id: "src_trtex_api", name: "TrTex Data API", path: "https://api.trtex.com/v1", type: "api", trustScore: 70, lastVerified: "2026-02-20", status: "pending" },
    { id: "src_perde_api", name: "Perde.ai Render API", path: "https://perde.ai/api", type: "api", trustScore: 85, lastVerified: "2026-02-25", status: "verified" },
];

export const DATA_INTEGRITY_RULES = {
    blockUnlisted: true,
    ruleTR: "Listede olmayan kaynak → üretim engellendi",
    minTrustScore: 60,
    autoVerifyInterval: "24h",
};


// ─── 5. AGENT AUTONOMY CONTROL ────────────────────────────────

export type AuthorityLevel = "strategic" | "sectoral" | "operational";

export interface AgentAuthorityConfig {
    agentName: string;
    authorityLevel: AuthorityLevel;
    maxParallelTasks: number;
    requireCoreApproval: boolean;
    allowedActions: string[];
}

export const AGENT_AUTHORITY_MAP: AgentAuthorityConfig[] = [
    {
        agentName: "Aloha",
        authorityLevel: "strategic",
        maxParallelTasks: 10,
        requireCoreApproval: false,
        allowedActions: ["deploy", "reallocate", "configure", "monitor", "report"],
    },
    {
        agentName: "Nexus-TX",
        authorityLevel: "sectoral",
        maxParallelTasks: 5,
        requireCoreApproval: true,
        allowedActions: ["translate", "analyze", "report", "scrape"],
    },
    {
        agentName: "Perde-Agent",
        authorityLevel: "sectoral",
        maxParallelTasks: 3,
        requireCoreApproval: true,
        allowedActions: ["render", "calculate", "recommend"],
    },
    {
        agentName: "Emlak-Agent",
        authorityLevel: "operational",
        maxParallelTasks: 3,
        requireCoreApproval: true,
        allowedActions: ["list", "analyze", "recommend"],
    },
    {
        agentName: "Hukuk-Agent",
        authorityLevel: "operational",
        maxParallelTasks: 2,
        requireCoreApproval: true,
        allowedActions: ["review", "flag", "report"],
    },
];

export const AUTHORITY_COLORS: Record<AuthorityLevel, { bg: string; text: string; border: string; label: string }> = {
    strategic: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30", label: "STRATEJİK" },
    sectoral: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30", label: "SEKTÖREL" },
    operational: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30", label: "OPERASYONEL" },
};


// ─── 6. DEPLOYMENT PRIORITY / MISSION TARGETS ─────────────────

export interface MissionTarget {
    site: string;
    role: string;
    roleTR: string;
    status: "live" | "building" | "planned";
    progress: number;    // 0-100
}

export const MISSION_DEADLINE = "2026-05-19T09:00:00+03:00";

export const MISSION_TARGETS: MissionTarget[] = [
    { site: "aipyram.com", role: "Commander", roleTR: "Komutan", status: "building", progress: 45 },
    { site: "trtex.com", role: "Data Provider", roleTR: "Veri Sağlayıcı", status: "planned", progress: 10 },
    { site: "hometex.ai", role: "Showcase", roleTR: "Vitrin", status: "planned", progress: 5 },
    { site: "perde.ai", role: "Sales Engine", roleTR: "Satış Motoru", status: "live", progress: 80 },
];

export interface MissionPhase {
    id: number;
    name: string;
    nameTR: string;
    durationDays: number;
    description: string;
    targets: string[];
}

export const MISSION_PHASES: MissionPhase[] = [
    {
        id: 1,
        name: "\"We're Coming\" Impact",
        nameTR: "\"Geliyoruz\" Etkisi",
        durationDays: 30,
        description: "Aipyram vitrin, 12 sektör, 270 domain, 19 Mayıs geri sayım, 3 aktif proje",
        targets: ["aipyram.com", "trtex.com", "perde.ai"],
    },
    {
        id: 2,
        name: "Sales Engine",
        nameTR: "Satış Motoru",
        durationDays: 60,
        description: "Perde.ai HD render + WhatsApp satış, TrTex tedarikçi listeleme + sponsor paket",
        targets: ["perde.ai", "trtex.com"],
    },
    {
        id: 3,
        name: "Investor Readiness",
        nameTR: "Yatırımcı Hazırlığı",
        durationDays: 90,
        description: "270 domain hazır, 3 dikey aktif, gelir başlamış, cross-nexus veri çalışıyor",
        targets: ["aipyram.com", "trtex.com", "hometex.ai", "perde.ai"],
    },
];
