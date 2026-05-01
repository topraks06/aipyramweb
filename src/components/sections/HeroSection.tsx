"use client";

import { useEffect, useState } from "react";
import { Globe2, ArrowRight, Zap, Activity } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const ECOSYSTEM_NODES = [
  { name: "TRTex.com", role: "B2B Intelligence", status: "live", color: "#DC2626" },
  { name: "icmimar.ai", role: "Design Engine", status: "live", color: "#8B7355" },
  { name: "Perde.ai", role: "TR Marketplace", status: "live", color: "#059669" },
  { name: "Hometex.ai", role: "Virtual Fair", status: "live", color: "#7C3AED" },
  { name: "Vorhang.ai", role: "DACH Market", status: "live", color: "#2563EB" },
  { name: "Heimtex.ai", role: "Trend Hub", status: "live", color: "#D97706" },
];

export default function HeroSection() {
  const t = useTranslations("Hero");
  const [activeNode, setActiveNode] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % ECOSYSTEM_NODES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[100vh] bg-neutral-950 text-white overflow-hidden">
      
      {/* Animated Grid Background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-red-600/5 blur-[120px] z-0" />

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center pt-32 pb-20">
        
        {/* Top Badge */}
        <div
          className="inline-flex items-center gap-3 px-5 py-2 mb-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-semibold tracking-widest uppercase"
          style={{ opacity: mounted ? 1 : 0, transition: "opacity 1s ease 0.2s" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-neutral-400">{t("badge")}</span>
        </div>

        {/* Massive Headline */}
        <h1
          className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-center max-w-5xl leading-[1.05] mb-4"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(30px)", transition: "all 1s ease 0.4s" }}
        >
          <span className="bg-gradient-to-r from-white via-white to-neutral-400 bg-clip-text text-transparent">
            {t("title_1")}
          </span>
          <br />
          <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">
            {t("title_2")}
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="mt-4 text-lg md:text-xl text-neutral-400 max-w-2xl text-center font-normal leading-relaxed"
          style={{ opacity: mounted ? 1 : 0, transition: "opacity 1s ease 0.7s" }}
        >
          {t("description")}
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center gap-4 mt-10"
          style={{ opacity: mounted ? 1 : 0, transition: "opacity 1s ease 0.9s" }}
        >
          <Link href="/ecosystem">
            <button className="group h-14 px-8 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all duration-300 flex items-center gap-3 shadow-lg shadow-red-900/30 hover:shadow-red-600/40">
              <Globe2 className="w-5 h-5" />
              Ekosistemi Keşfet
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/contact">
            <button className="h-14 px-8 border border-white/20 hover:border-white/40 text-white font-semibold rounded-lg transition-all duration-300 backdrop-blur-sm hover:bg-white/5">
              İletişim
            </button>
          </Link>
        </div>

        {/* ──── LIVE ECOSYSTEM NODES TICKER ──── */}
        <div
          className="mt-20 w-full max-w-4xl"
          style={{ opacity: mounted ? 1 : 0, transition: "opacity 1s ease 1.2s" }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold tracking-widest uppercase text-neutral-500">
              Sovereign Ecosystem — Live Nodes
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {ECOSYSTEM_NODES.map((node, i) => {
              const isActive = i === activeNode;
              return (
                <div
                  key={node.name}
                  className="relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-700 cursor-default"
                  style={{
                    borderColor: isActive ? node.color + "60" : "rgba(255,255,255,0.06)",
                    backgroundColor: isActive ? node.color + "08" : "rgba(255,255,255,0.02)",
                    boxShadow: isActive ? `0 0 30px ${node.color}15` : "none",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span
                        className="absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: node.color, animation: isActive ? "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" : "none" }}
                      />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: node.color }} />
                    </span>
                    <span className="text-[11px] font-bold text-white tracking-tight">{node.name}</span>
                  </div>
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500">
                    {node.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div
          className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16"
          style={{ opacity: mounted ? 1 : 0, transition: "opacity 1s ease 1.5s" }}
        >
          {[
            { value: "11", label: "Sovereign Nodes" },
            { value: "156+", label: "AI Domains" },
            { value: "7", label: "Continents" },
            { value: "25+", label: "AI Agents" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="text-3xl md:text-4xl font-black tracking-tighter text-white">{stat.value}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{stat.label}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent z-20 pointer-events-none" />
    </section>
  );
}
