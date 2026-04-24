"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Globe, TrendingUp, BarChart3, Network, ArrowRight, Minimize2, Maximize2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEcosystemActions } from "@/hooks/useEcosystemActions";
import { DataCard } from "@/core/aloha/orchestrationLayer";
import LeadCaptureModal from "@/components/trtex/LeadCaptureModal";

/* ═══════════════════════════════════════════════════════════
   AIPyram Master Concierge — v3 Visual Intelligence Widget
   ═══════════════════════════════════════════════════════════ */

/* ─── Intent Classification ─── */
type IntentType = "PORTFOLIO" | "TREND" | "PERFORMANCE" | "GENERAL" | "NAVIGATION" | "CONTACT";
type ChartType = "pie" | "bar" | "sparkline" | "kpi" | "none";
type Language = "tr" | "en" | "de";

interface VisualData {
    chartType: ChartType;
    title: string;
    data: { label: string; value: number; color: string }[];
    source: string;
    confidence: number;
}

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    text: string;
    visual?: VisualData;
    dataCards?: DataCard[];
    links?: { label: string; href: string }[];
    timestamp: Date;
}

/* ─── Language Detection ─── */
function detectLanguage(text: string, fallback: Language = "de"): Language {
    const de = /\b(wie|was|wo|können|bitte|danke|guten|hallo|domain|möchte|über|unternehmen)\b/i;
    const en = /\b(what|how|where|please|thank|hello|about|company|invest|portfolio|domain)\b/i;
    const tr = /\b(merhaba|nasıl|nedir|hakkında|yatırım|portföy|sektör|proje|domain|bilgi)\b/i;
    if (de.test(text)) return "de";
    if (en.test(text)) return "en";
    if (tr.test(text)) return "tr";
    return fallback;
}

/* ─── Intent Classifier ─── */
function classifyIntent(text: string): { intent: IntentType; entities: string[] } {
    const lower = text.toLowerCase();
    const entities: string[] = [];

    if (/yatırım|invest|portf|anlage|kapital|fonlama|değer/i.test(lower)) {
        return { intent: "PORTFOLIO", entities: ["investment"] };
    }
    if (/trend|büyü|growth|wachstum|artış|yüksel/i.test(lower)) {
        return { intent: "TREND", entities: ["growth"] };
    }
    if (/domain|alan adı|portföy|.ai|.com/i.test(lower)) {
        entities.push("domains");
        return { intent: "PORTFOLIO", entities };
    }
    if (/perde|tekstil|curtain|vorhang|textile|kumaş/i.test(lower)) {
        entities.push("textile");
        return { intent: "NAVIGATION", entities };
    }
    if (/emlak|gayrimenkul|real estate|immobil/i.test(lower)) {
        entities.push("realestate");
        return { intent: "NAVIGATION", entities };
    }
    if (/ekosistem|ecosystem|ökosystem|mimari|architect/i.test(lower)) {
        entities.push("ecosystem");
        return { intent: "PERFORMANCE", entities };
    }
    if (/iletişim|contact|kontakt|email|telefon|phone/i.test(lower)) {
        return { intent: "CONTACT", entities: ["contact"] };
    }
    if (/nedir|ne yapıyor|what is|was ist|kim|who/i.test(lower)) {
        return { intent: "GENERAL", entities: ["about"] };
    }
    if (/sektör|sector|branche|dikey/i.test(lower)) {
        return { intent: "PERFORMANCE", entities: ["sectors"] };
    }
    if (/proje|project|projekt/i.test(lower)) {
        return { intent: "PERFORMANCE", entities: ["projects"] };
    }
    if (/ajan|agent /i.test(lower)) {
        return { intent: "PERFORMANCE", entities: ["agents"] };
    }

    return { intent: "GENERAL", entities: [] };
}

/* ─── Visual Data Generator ─── */
function generateVisual(intent: IntentType, entities: string[]): VisualData | undefined {
    if (intent === "PORTFOLIO" && entities.includes("domains")) {
        return {
            chartType: "pie",
            title: "Sector Domain Distribution",
            data: [
                { label: "Textile", value: 35, color: "#DC2626" },
                { label: "Real Estate", value: 32, color: "#EA580C" },
                { label: "Automotive", value: 27, color: "#7C3AED" },
                { label: "Health", value: 23, color: "#059669" },
                { label: "Fintech", value: 23, color: "#2563EB" },
                { label: "Other", value: 112, color: "#94A3B8" },
            ],
            source: "Domain Registry",
            confidence: 98,
        };
    }
    if (intent === "PORTFOLIO" && entities.includes("investment")) {
        return {
            chartType: "kpi",
            title: "Portfolio Summary",
            data: [
                { label: "Domains", value: 270, color: "#DC2626" },
                { label: "Sectors", value: 15, color: "#2563EB" },
                { label: "AI Agents", value: 50, color: "#7C3AED" },
                { label: "Projects", value: 4, color: "#059669" },
            ],
            source: "Internal Registry",
            confidence: 98,
        };
    }
    if (intent === "TREND") {
        return {
            chartType: "bar",
            title: "Growth Metrics",
            data: [
                { label: "Domains ↑", value: 38, color: "#059669" },
                { label: "AI Agents ↑", value: 120, color: "#2563EB" },
                { label: ".ai Ratio ↑", value: 15, color: "#7C3AED" },
                { label: "Projects ↑", value: 100, color: "#DC2626" },
            ],
            source: "Internal Registry",
            confidence: 96,
        };
    }
    if (intent === "PERFORMANCE" && entities.includes("sectors")) {
        return {
            chartType: "bar",
            title: "Sector Resource Distribution",
            data: [
                { label: "Textile", value: 35, color: "#DC2626" },
                { label: "Real Estate", value: 32, color: "#EA580C" },
                { label: "Automotive", value: 27, color: "#7C3AED" },
                { label: "E-Commerce", value: 35, color: "#2563EB" },
                { label: "Health", value: 23, color: "#059669" },
            ],
            source: "Internal Registry",
            confidence: 96,
        };
    }
    return undefined;
}

/* ─── Response Generator ─── */
function generateResponse(text: string, siteLocale: Language = "de", platform: string = "aipyram"): ChatMessage {
    const lang = detectLanguage(text, siteLocale);
    
    // PERDE.AI ÖZEL YANITLARI
    if (platform === "perde") {
         let response = "";
         if (lang === "de") response = "Willkommen bei Perde.ai! Ich bin der KI-Assistent für unser virtuelles Studio. Ich kann Ihnen bei der B2B-Bestellung, Visualisierung und ERP-Integration helfen.";
         else if (lang === "en") response = "Welcome to Perde.ai! I'm the AI Assistant for our virtual studio. I can help you with B2B ordering, visualization, and ERP integration. How can I assist your design process?";
         else response = "Perde.ai'ye hoş geldiniz! Ben sanal stüdyomuzun akıllı asistanıyım. Otonom rölöve, B2B sipariş yönetimi ve sanal görselleştirme (WebGL) konularında size yardımcı olabilirim.";
         
         return {
            id: `assist-${Date.now()}`,
            role: "assistant",
            text: response,
            timestamp: new Date()
         }
    }

    // AIPYRAM DEFAULT YANITLARI
    const { intent, entities } = classifyIntent(text);
    const visual = generateVisual(intent, entities);
    const links: { label: string; href: string }[] = [];

    let response = "";

    if (lang === "de") {
        switch (intent) {
            case "PORTFOLIO":
                response = entities.includes("domains")
                    ? "Unser Portfolio umfasst über 270 strategische Domains in 15 Branchen. Die .ai-Domains machen den größten Anteil aus und gewinnen weltweit an Wert."
                    : "Aipyram GmbH bietet verschiedene Investitionsmodelle: Domain-Erwerb, Projektpartnerschaft und Technologielizenzierung. Unser Portfolio wächst jährlich um 38%.";
                links.push({ label: "Portfolio →", href: "/domains" }, { label: "Investor Relations →", href: "/investor" });
                break;
            case "CONTACT":
                response = "Sie erreichen uns unter info@aipyram.com oder telefonisch unter +41 44 500 82 80. Unser Büro befindet sich in Dietikon, Zürich.";
                links.push({ label: "Kontakt →", href: "/contact" });
                break;
            default:
                response = "Aipyram GmbH ist ein Schweizer AI-Technologieunternehmen mit Sitz in Dietikon. Wir entwickeln KI-native Plattformen in 15 Branchen mit einem Portfolio von über 270 strategischen Domains.";
                links.push({ label: "Über uns →", href: "/about" });
        }
    } else if (lang === "en") {
        switch (intent) {
            case "PORTFOLIO":
                response = entities.includes("domains")
                    ? "Our portfolio comprises 271+ strategic domains across 15 sectors. The .ai extension is the fastest-growing TLD globally, and our collection positions us at the forefront of sectoral AI."
                    : "Aipyram GmbH offers flexible investment models: direct domain acquisition, project partnerships, and technology licensing. Our portfolio grows 38% year-over-year.";
                links.push({ label: "Portfolio →", href: "/domains" }, { label: "Investor Relations →", href: "/investor" });
                break;
            case "CONTACT":
                response = "You can reach us at info@aipyram.com or +41 44 500 82 80. Our office is located in Dietikon, Zürich, Switzerland.";
                links.push({ label: "Contact →", href: "/contact" });
                break;
            case "NAVIGATION":
                if (entities.includes("textile")) {
                    response = "Our textile vertical is our strongest: perde.ai (live AI curtain platform), trtex.com (B2B textile marketplace, in development), and hometex.ai (trade fair intelligence, planned).";
                    links.push({ label: "Perde.ai →", href: "https://perde.ai" }, { label: "TrTex.com →", href: "https://trtex.com" });
                } else {
                    response = "Aipyram operates across 15 verticals including textile, real estate, aviation, fintech, health, and energy.";
                    links.push({ label: "Ecosystem →", href: "/ecosystem" });
                }
                break;
            default:
                response = "Aipyram GmbH is a Swiss AI technology company headquartered in Dietikon. We build AI-native platforms across 15 sectors with 271+ strategic domains and 50+ autonomous AI agents.";
                links.push({ label: "About →", href: "/about" }, { label: "Ecosystem →", href: "/ecosystem" });
        }
    } else {
        // Turkish
        switch (intent) {
            case "PORTFOLIO":
                response = entities.includes("domains")
                    ? "Portföyümüz 15 sektörde 271+ stratejik domainden oluşmaktadır. .ai uzantısı küresel olarak en hızlı büyüyen TLD'dir ve koleksiyonumuz sektörel AI'da bizi ön plana çıkarmaktadır."
                    : "Aipyram GmbH esnek yatırım modelleri sunmaktadır: doğrudan domain edinimi, proje ortaklığı ve teknoloji lisansı. Portföyümüz yıllık %38 büyümektedir.";
                links.push({ label: "Portföy →", href: "/domains" }, { label: "Yatırımcı İlişkileri →", href: "/investor" });
                break;
            case "TREND":
                response = "Portföyümüz güçlü bir büyüme trendinde: Domain sayısı %38 YoY artış, AI ajan sayısı %120 büyüme ve .ai oranı %15 artış gösterdi. 2026 Q1 itibarıyla 4 aktif proje canlı geliştirmede.";
                links.push({ label: "Yatırımcı Detay →", href: "/investor" });
                break;
            case "PERFORMANCE":
                if (entities.includes("ecosystem")) {
                    response = "Aipyram ekosistemi 4 katmanlı bir mimaride çalışır: Neural Protocol (v2.1), Cross-Nexus Sinyalleri (12 aktif kanal), AI Ajan Ordusu (50+) ve Domain Altyapısı (271+). Tüm projeler merkezi istihbarat katmanına bağlıdır.";
                    links.push({ label: "Ekosistem Haritası →", href: "/ecosystem" });
                } else if (entities.includes("agents")) {
                    response = "50+ otonom AI ajan, 15 sektörel dikeyde görev yapmaktadır. Her proje kendi ajan grubuna sahiptir: Perde.ai (12 ajan), TrTex.com (8 ajan), DidimEmlak.ai (8 ajan), Hometex.ai (4 ajan).";
                    links.push({ label: "Ekosistem →", href: "/ecosystem" });
                } else {
                    response = "15 sektörel dikeyde faaliyet gösteriyoruz: Tekstil, Gayrimenkul, Otomotiv, Havacılık, Fintek, Sağlık, Enerji, Medya, E-Ticaret, Kiralama ve daha fazlası. Her sektörde domain ve AI ajan kapasitemiz mevcuttur.";
                    links.push({ label: "Sektörler →", href: "/sectors" });
                }
                break;
            case "NAVIGATION":
                if (entities.includes("textile")) {
                    response = "Tekstil dikeyimiz en güçlü alanımız: perde.ai (canlı AI perde platformu), trtex.com (B2B tekstil pazar yeri, geliştirmede) ve hometex.ai (fuar istihbaratı, planlanıyor). Bu üç proje Cross-Nexus ile birbirine bağlıdır.";
                    links.push({ label: "Perde.ai →", href: "https://perde.ai" }, { label: "TrTex.com →", href: "https://trtex.com" });
                } else if (entities.includes("realestate")) {
                    response = "Gayrimenkul dikeyimizde 32 domain bulunmaktadır. DidimEmlak.ai canlı yayındadır — Ege kıyısında AI destekli akıllı emlak çözümleri sunmaktadır.";
                    links.push({ label: "DidimEmlak.ai →", href: "https://didimemlak.ai" }, { label: "Domain Portföyü →", href: "/domains" });
                } else {
                    response = "Aipyram 15 sektörel dikeyde faaliyet göstermektedir. Sizi doğru sayfaya yönlendirebilirim — ne ile ilgileniyorsunuz?";
                    links.push({ label: "Ekosistem →", href: "/ecosystem" }, { label: "Portföy →", href: "/domains" });
                }
                break;
            case "CONTACT":
                response = "Bize info@aipyram.com adresinden veya +41 44 500 82 80 numarasından ulaşabilirsiniz. Ofisimiz Dietikon, Zürih, İsviçre'de bulunmaktadır.";
                links.push({ label: "İletişim →", href: "/contact" });
                break;
            default:
                response = "Aipyram GmbH, İsviçre'nin Dietikon şehrinde kurulu bir AI teknoloji şirketidir. 15 sektörel dikeyde AI-native platformlar geliştiriyoruz. 271+ stratejik domain ve 50+ otonom AI ajan ile dijital dönüşüm çözümleri sunuyoruz. Size nasıl yardımcı olabilirim?";
                links.push({ label: "Hakkımızda →", href: "/about" }, { label: "Ekosistem →", href: "/ecosystem" });
        }
    }

    return {
        id: Date.now().toString(),
        role: "assistant",
        text: response,
        visual,
        links,
        timestamp: new Date(),
    };
}

/* ─── Mini Pie Chart (inline) ─── */
function MiniPie({ data, size = 100 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    let cum = 0;
    const r = size / 2 - 4;
    const cx = size / 2;
    const cy = size / 2;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {data.map((d, i) => {
                const angle = (d.value / total) * 360;
                const startAngle = cum;
                cum += angle;
                const endAngle = cum;
                const startRad = ((startAngle - 90) * Math.PI) / 180;
                const endRad = ((endAngle - 90) * Math.PI) / 180;
                const x1 = cx + r * Math.cos(startRad);
                const y1 = cy + r * Math.sin(startRad);
                const x2 = cx + r * Math.cos(endRad);
                const y2 = cy + r * Math.sin(endRad);
                const large = angle > 180 ? 1 : 0;
                return (
                    <path
                        key={i}
                        d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
                        fill={d.color}
                        opacity={0.85}
                    />
                );
            })}
        </svg>
    );
}

/* ─── Mini Bar Chart (inline) ─── */
function MiniBars({ data }: { data: { label: string; value: number; color: string }[] }) {
    const max = Math.max(...data.map(d => d.value));
    return (
        <div className="space-y-1.5">
            {data.map(d => (
                <div key={d.label} className="flex items-center gap-2">
                    <span className="text-[9px] w-16 text-right shrink-0 text-slate-400">{d.label}</span>
                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color }}
                        />
                    </div>
                    <span className="text-[9px] w-8 text-slate-400 tabular-nums">%{d.value}</span>
                </div>
            ))}
        </div>
    );
}

/* ─── KPI Grid (inline) ─── */
function KPIGrid({ data }: { data: { label: string; value: number; color: string }[] }) {
    return (
        <div className="grid grid-cols-2 gap-2">
            {data.map(d => (
                <div key={d.label} className="text-center p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="text-lg font-bold" style={{ color: d.color }}>{d.value}{d.label === "AI Agents" ? "+" : ""}</div>
                    <div className="text-[8px] text-slate-400 uppercase tracking-wider">{d.label}</div>
                </div>
            ))}
        </div>
    );
}

/* ─── Visual Deck Panel ─── */
function VisualDeck({ visual }: { visual: VisualData }) {
    return (
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-700/50 mt-2">
            <div className="text-[10px] font-bold text-slate-300 mb-2 uppercase tracking-wider">{visual.title}</div>
            {visual.chartType === "pie" && <MiniPie data={visual.data} size={110} />}
            {visual.chartType === "bar" && <MiniBars data={visual.data} />}
            {visual.chartType === "kpi" && <KPIGrid data={visual.data} />}
            {visual.chartType === "sparkline" && <MiniBars data={visual.data} />}
            <div className="flex items-center gap-2 mt-2 text-[8px] text-slate-500">
                <span>📊 {visual.source}</span>
                <span>·</span>
                <span className="text-emerald-500/80">✓ %{visual.confidence}</span>
            </div>
        </div>
    );
}

/* ─── Data Card View (from Orchestrator) ─── */
function DataCardView({ cards }: { cards: DataCard[] }) {
    if (!cards || cards.length === 0) return null;
    return (
        <div className="flex flex-col gap-2 mt-2">
            {cards.map((card, idx) => (
                <div key={idx} className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-1">
                        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{card.title}</div>
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">{card.source_node.toUpperCase()}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{card.content}</p>
                </div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   MAIN WIDGET
   ═══════════════════════════════════════════════════════ */
export default function ConciergeWidget() {
    const pathname = usePathname();
    
    // AIPYRAM ALOHA & NODES: Hide Concierge on master AI dashboard and Node sites
    if (pathname.includes('/aloha') || pathname.includes('/admin') || pathname.startsWith('/sites/')) {
        return null;
    }

    const siteLocale: Language = pathname.startsWith("/en") ? "en" : pathname.startsWith("/de") ? "de" : "tr";
    const [isOpen, setIsOpen] = useState(false);
    
    // Lead Capture State
    const [leadModalOpen, setLeadModalOpen] = useState(false);
    const [leadContext, setLeadContext] = useState<any>({ type: 'GENERAL' });
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

// Format based on node
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const host = mounted && typeof window !== 'undefined' ? window.location.hostname : '';
    const platform = (pathname.includes('perde') || host.includes('perde')) ? 'perde' : (pathname.includes('trtex') || host.includes('trtex')) ? 'trtex' : 'aipyram';
    
    // Perde.ai specific config
    const isPerde = platform === 'perde';
    const widgetBaseColor = isPerde ? "bg-gradient-to-br from-[#8B7355] to-[#6b5841]" : "bg-gradient-to-br from-red-600 to-red-700";
    const widgetHoverColor = isPerde ? "hover:shadow-[#8B7355]/30" : "hover:shadow-red-500/30";
    const headerTitle = isPerde ? "Perde.ai Assistant" : "AIPyram Concierge";
    const accentColor = isPerde ? "text-[#8B7355]" : "text-emerald-500";

    const { processQuery, isOrchestrating } = useEcosystemActions();
    const [sessionId, setSessionId] = useState<string>('');

    useEffect(() => {
        let id = localStorage.getItem('concierge_session_id');
        if (!id) {
            id = `sess_${Math.random().toString(36).substring(2, 15)}`;
            localStorage.setItem('concierge_session_id', id);
        }
        setSessionId(id);
    }, []);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Welcome message on first open — locale-aware and NODE-AWARE
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            let welcomeTexts: any;
            
            // CROSS-NODE IDENTITY STITCHING
            let visitorContext = "";
            try {
               const profileStr = localStorage.getItem('aloha_visitor_profiles');
               if (profileStr) {
                  const profiles = JSON.parse(profileStr);
                  if (profiles.trtex && profiles.trtex.lastVisit) {
                     visitorContext = "TRTEX B2B ağındaki toptan kumaş talepleriniz için burada modelleme yapabiliriz.";
                  }
               }
            } catch(e) {}
            
            if (isPerde) {
               // Perde.ai Welcome
               welcomeTexts = {
                   de: { text: visitorContext ? `Willkommen zurück! ${visitorContext}` : "Willkommen im Perde.ai B2B Studio! Ich bin Ihr intelligenter Assistent. Wie kann ich Ihnen bei Ihren Textilprojekten helfen?", links: [] },
                   en: { text: visitorContext ? `Welcome back! ${visitorContext} How can I help you frame your projects today?` : "Welcome to Perde.ai B2B Studio! I'm your smart visualizer assistant. How can I help you frame your projects today?", links: [] },
                   tr: { text: visitorContext ? `Hoş geldiniz! ${visitorContext} Ayrıca odalara perde uygulamak için fotoğraf yükleyebilirsiniz.` : "Perde.ai Sanal Stüdyo'ya hoş geldiniz! AI destekli kumaş analizleriniz ve B2B siparişleriniz için buradayım. Odalara perde uygulamak için fotoğraf yükleyebilirsiniz.", links: [] }
               };
            } else {
               // AIPyram Global Welcome
               welcomeTexts = {
                   de: { text: visitorContext ? `Willkommen! ${visitorContext}` : "Willkommen! Ich bin der AIPyram Concierge. Ich kann Ihnen Informationen über unser Portfolio, unsere Projekte und Investitionsmöglichkeiten geben.", links: [{ label: "Portfolio →", href: "/domains" }, { label: "Ökosystem →", href: "/ecosystem" }] },
                   en: { text: visitorContext ? `Welcome! ${visitorContext}` : "Welcome! I'm the AIPyram Concierge. I can provide information about our portfolio, projects, and investment opportunities.", links: [{ label: "Portfolio →", href: "/domains" }, { label: "Ecosystem →", href: "/ecosystem" }] },
                   tr: { text: visitorContext ? `Merhaba! Sizi tanıyorum, ${visitorContext} Size özel asistanınız olarak nasıl yardımcı olabilirim?` : "Merhaba! Ben AIPyram Concierge. Size portföyümüz, projelerimiz ve yatırım fırsatlarımız hakkında bilgi verebilirim.", links: [{ label: "Portföy →", href: "/domains" }, { label: "Ekosistem →", href: "/ecosystem" }] },
               };
            }

            const w = welcomeTexts[siteLocale as Language] || welcomeTexts.en;
            setMessages([{
                id: "welcome",
                role: "assistant",
                text: w.text,
                links: w.links,
                timestamp: new Date(),
            }]);
        }
    }, [isOpen, messages.length, siteLocale, isPerde]);

    const sendMessage = useCallback(async (text: string) => {
        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            text,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            // Call live Gemini API
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    locale: siteLocale,
                    sessionId: sessionId,
                    history: messages.filter(m => m.id !== "welcome").map(m => ({ role: m.role, text: m.text })),
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const { intent, entities } = classifyIntent(text);
                const visual = generateVisual(intent, entities);

                let finalLinks = data.links && data.links.length > 0
                    ? data.links.map((l: { href: string; label: string }) => ({ label: `${l.label} →`, href: l.href }))
                    : [];

                let crossNodeDataCards: any[] = [];

                // Eğer cross-node veya sektör analizi gerektiren bir niyet varsa Orchestrator'a başvur
                if (intent === 'TREND' || intent === 'PERFORMANCE' || intent === 'PORTFOLIO' || entities.length > 0) {
                     const orchRes = await processQuery(text, intent, siteLocale, platform);
                     if (orchRes) {
                         crossNodeDataCards = orchRes.data_cards || [];
                         if (orchRes.executive_brief) {
                             data.text += "\n\n💡 " + orchRes.executive_brief;
                         }
                         if (orchRes.suggested_actions && orchRes.suggested_actions.length > 0) {
                             const actionLinks = orchRes.suggested_actions.map(act => {
                               if (act.includes('VORHANG')) {
                                 return { label: `⚡ ${act}`, href: '#vorhang' };
                               }
                               return { label: `⚡ ${act}`, href: '#lead' };
                             });
                             finalLinks = [...finalLinks, ...actionLinks];
                         }
                     }
                }

                const assistantMsg: ChatMessage = {
                    id: `ai-${Date.now()}`,
                    role: "assistant",
                    text: data.text,
                    visual,
                    dataCards: crossNodeDataCards,
                    links: finalLinks.length > 0 ? finalLinks : undefined,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, assistantMsg]);
            } else {
                // Fallback to local
                const response = generateResponse(text, siteLocale);
                setMessages(prev => [...prev, response]);
            }
        } catch {
            // Fallback to local on network error
            const response = generateResponse(text, siteLocale as Language, platform);
            setMessages(prev => [...prev, response]);
        } finally {
            setIsTyping(false);
        }
    }, [messages, siteLocale, platform]);

    const handleSend = useCallback(() => {
        if (!input.trim()) return;
        sendMessage(input.trim());
    }, [input, sendMessage]);

    // Global Event Listener for external triggers
    useEffect(() => {
        const handleOpenConcierge = (e: Event) => {
            const customEvent = e as CustomEvent;
            setIsOpen(true);
            if (customEvent.detail?.action === 'upload') {
                // Feature handled after chat API update in FAZ 2. For now, open and set context.
                if (messages.length <= 1) {
                    setInput("Mekanımın fotoğrafını yüklemek istiyorum.");
                }
            } else if (customEvent.detail?.action === 'chat' && customEvent.detail?.message) {
                sendMessage(customEvent.detail.message);
            }
        };

        window.addEventListener('open-concierge', handleOpenConcierge);
        return () => window.removeEventListener('open-concierge', handleOpenConcierge);
    }, [messages.length, sendMessage]);

    // Dynamic Quick Actions based on site
    let quickActions = [];
    if (isPerde) {
       quickActions = [
          { label: "📸 Render Al", query: "Bir mekan fotoğrafı yükleyip render almak istiyorum." },
          { label: "🗂 Kumaşlar", query: "Kumaş envanterini görebilir miyim?" },
          { label: "📦 Sipariş İşlemleri", query: "B2B sipariş süreci nasıl işliyor?" }
       ];
    } else {
        quickActions = siteLocale === "de"
            ? [
                { label: "📊 Portfolio", query: "Informationen über Ihr Domain-Portfolio" },
                { label: "📈 Wachstum", query: "Wachstumstrends" },
                { label: "🏗 Projekte", query: "Aktive Projekte" },
                { label: "💼 Investition", query: "Investitionsmöglichkeiten" },
            ]
            : siteLocale === "en"
                ? [
                    { label: "📊 Portfolio", query: "Tell me about your domain portfolio" },
                    { label: "📈 Growth", query: "Growth trends" },
                    { label: "🏗 Projects", query: "Active projects" },
                    { label: "💼 Invest", query: "Investment opportunities" },
                ]
                : [
                    { label: "📊 Portföy", query: "Domain portföyünüz hakkında bilgi" },
                    { label: "📈 Büyüme", query: "Büyüme trendleri neler" },
                    { label: "🏗 Projeler", query: "Aktif projeleriniz neler" },
                    { label: "💼 Yatırım", query: "Yatırım fırsatları" },
                ];
    }

    // Do not render generic Concierge for Perde (it has its own PerdeAIAssistant)
    if (isPerde) return null;

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-[120] h-14 w-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${isOpen
                    ? "bg-slate-800 text-white rotate-0 scale-90"
                    : `${widgetBaseColor} text-white hover:scale-110 ${widgetHoverColor}`
                    }`}
                aria-label={headerTitle}
            >
                {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse border-2 border-white" />
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div
                    className={`fixed z-[120] bg-slate-950 border border-slate-800 shadow-2xl shadow-black/50 flex flex-col transition-all duration-300 ${isExpanded
                        ? "bottom-0 right-0 w-full h-full md:w-[700px] md:h-[600px] md:bottom-6 md:right-6 md:rounded-2xl"
                        : "bottom-24 right-6 w-[380px] h-[520px] rounded-2xl"
                        }`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className={`w-8 h-8 rounded-full ${widgetBaseColor} flex items-center justify-center`}>
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
                            </div>
                            <div>
                                <div className="text-white text-sm font-semibold">{headerTitle}</div>
                                <div className={`text-[9px] ${accentColor} font-medium`}>{siteLocale === "de" ? "Online · DE / EN / TR" : siteLocale === "en" ? "Online · EN / DE / TR" : "Çevrimiçi · AI Devrede"}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
                            >
                                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                {msg.role === "assistant" && (
                                    <div className="w-6 h-6 rounded-full bg-red-600/20 flex items-center justify-center shrink-0 mt-1">
                                        <Bot className="h-3 w-3 text-red-400" />
                                    </div>
                                )}
                                <div className={`max-w-[85%] ${msg.role === "user" ? "order-first" : ""}`}>
                                    <div className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${msg.role === "user"
                                        ? "bg-red-600 text-white ml-auto rounded-br-sm"
                                        : "bg-slate-800/80 text-slate-200 rounded-bl-sm"
                                        }`}>
                                        {msg.text}
                                    </div>

                                    {/* Visual Deck */}
                                    {msg.visual && <VisualDeck visual={msg.visual} />}

                                    {/* Data Cards from Orchestrator */}
                                    {msg.dataCards && msg.dataCards.length > 0 && <DataCardView cards={msg.dataCards} />}

                                    {/* Navigation Links */}
                                    {msg.links && msg.links.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {msg.links.map(link => {
                                                const isAction = link.href === '#lead';
                                                const isVorhang = link.href === '#vorhang';
                                                const isSpecial = isAction || isVorhang;
                                                
                                                return (
                                                <Link
                                                    key={link.href + link.label}
                                                    href={isVorhang ? "http://vorhang.localhost:3000/products" : link.href}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-lg border transition-all ${isSpecial ? 'bg-red-600/90 hover:bg-red-500 border-red-500 text-white shadow-sm shadow-red-900/50' : 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white border-slate-700/50'}`}
                                                    onClick={(e) => {
                                                        if (isAction) {
                                                            e.preventDefault();
                                                            setLeadContext({ type: 'GENERAL', title: msg.text.substring(0, 100) });
                                                            setLeadModalOpen(true);
                                                        } else if (isVorhang) {
                                                            // For Vorhang we actually want to navigate to the href, so we just close the chat
                                                            setIsOpen(false);
                                                        } else {
                                                            setIsOpen(false);
                                                        }
                                                    }}
                                                >
                                                    {link.label}
                                                </Link>
                                            )})}
                                        </div>
                                    )}
                                </div>
                                {msg.role === "user" && (
                                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                                        <User className="h-3 w-3 text-slate-400" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {(isTyping || isOrchestrating) && (
                            <div className="flex gap-2.5">
                                <div className="w-6 h-6 rounded-full bg-red-600/20 flex items-center justify-center shrink-0">
                                    <Bot className="h-3 w-3 text-red-400" />
                                </div>
                                <div className="bg-slate-800/80 rounded-2xl rounded-bl-sm px-4 py-3 flex flex-col gap-2">
                                    <div className="flex gap-1 items-center">
                                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                    {isOrchestrating && <span className="text-[9px] text-emerald-500 animate-pulse">Ecosystem orchestrating...</span>}
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions (shown when few messages) */}
                    {messages.length <= 1 && (
                        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                            {quickActions.map(qa => (
                                <button
                                    key={qa.label}
                                    onClick={() => sendMessage(qa.query)}
                                    className="px-2.5 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-[10px] font-medium text-slate-400 hover:text-white rounded-lg border border-slate-700/50 transition-all"
                                >
                                    {qa.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="px-4 py-3 border-t border-slate-800 shrink-0">
                        <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl border border-slate-700/50 px-3 py-1.5 focus-within:border-red-600/50 transition-colors">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder={siteLocale === "de" ? "Stellen Sie eine Frage..." : siteLocale === "en" ? "Ask a question..." : "Bir soru sorun..."}
                                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="p-1.5 text-slate-400 hover:text-red-400 disabled:opacity-30 transition-colors"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="text-center mt-2 text-[8px] text-slate-600">
                            AIPyram Concierge · Powered by Neural Protocol v2.1
                        </div>
                    </div>
                </div>
            )}
            
            <LeadCaptureModal 
                isOpen={leadModalOpen} 
                onClose={() => setLeadModalOpen(false)} 
                context={{ type: "TENDER" }} 
                brandName="AIPyram Concierge" 
            />
        </>
    );
}
