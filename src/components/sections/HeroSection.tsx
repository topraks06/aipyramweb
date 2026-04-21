"use client";

import { useState } from "react";
import { Search, BrainCircuit, Globe2, Activity } from "lucide-react";
import { useTranslations } from "next-intl";

export default function HeroSection() {
  const t = useTranslations("Hero");
  const [alohaQuery, setAlohaQuery] = useState("");
  const [alohaResponse, setAlohaResponse] = useState<string | null>(null);

  const handleAlohaSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alohaQuery.trim()) return;
    
    setAlohaResponse("Sistem şu an 60+ ajan ile kovan zihninde değerlendiriyor...");
    
    try {
      const res = await fetch("/api/aloha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: alohaQuery })
      });
      
      const data = await res.json();
      if (data.response) {
         setAlohaResponse(data.response);
      } else {
         setAlohaResponse("Tamamlandı: İstek Master Brain'e iletildi.");
      }
    } catch (error) {
      setAlohaResponse("Bağlantı koptu. Cross-Nexus ağı ulaşılamıyor.");
    }
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[85vh] bg-white text-neutral-900 overflow-hidden pt-20">
      {/* Absolute clean layout. No messy gradients. Just pure white corporate feel. */}
      
      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
        
        {/* Subtle Corporate Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-500 tracking-wide">
          <Globe2 className="w-4 h-4 text-red-600" />
          {t("badge")}
        </div>

        {/* Massive Corporate Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-center max-w-5xl leading-[1.1]">
          {t("title_1")} <br />
          {t("title_2")}
        </h1>

        <p className="mt-6 text-xl text-neutral-500 max-w-2xl text-center font-normal">
          {t("description")}
        </p>

        {/* Central GPT/Google Style Command Bar */}
        <div className="w-full max-w-3xl mt-12 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-neutral-200 p-2 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <form onSubmit={handleAlohaSearch} className="flex items-center gap-3">
            <div className="pl-4">
              <BrainCircuit className="w-6 h-6 text-red-600" />
            </div>
            <input
              type="text"
              value={alohaQuery}
              onChange={(e) => setAlohaQuery(e.target.value)}
              placeholder="AIPyram Master Agent'a stratejik bir görev verin..."
              className="flex-1 bg-transparent border-none outline-none text-lg py-4 px-2 text-neutral-800 placeholder:text-neutral-400"
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>

        {/* Dynamic Response Area */}
        {alohaResponse && (
          <div className="mt-6 p-4 bg-neutral-50 border border-neutral-100 rounded-lg text-sm text-neutral-600 animate-fade-in w-full max-w-3xl text-center">
            <Activity className="w-4 h-4 inline-block mr-2 text-red-600 animate-pulse" />
            {alohaResponse}
          </div>
        )}

      </div>
    </section>
  );
}
