"use client";

import { useTranslations } from "next-intl";
import { Building2, Globe, Stethoscope, Landmark, Plane, Zap, Target, Cpu, Briefcase } from "lucide-react";

export default function DigitalAssets() {
  const t = useTranslations("DigitalAssets");

  const BENTO_SECTORS = [
    { id: "textile", name: "Textile & Design Core", domains: 34, icon: Briefcase, featured: "perde.ai, trtex.com", color: "text-red-600" },
    { id: "realestate", name: "Real Estate Analytics", domains: 28, icon: Building2, featured: "didimemlak.ai", color: "text-neutral-800" },
    { id: "rental", name: "Global Rentals", domains: 12, icon: Globe, featured: "rentworld.ai", color: "text-red-500" },
    { id: "health", name: "Healthcare AI", domains: 15, icon: Stethoscope, featured: "spital.ai", color: "text-neutral-800" },
    { id: "fintech", name: "Financial Networks", domains: 17, icon: Landmark, featured: "autopayment.ai", color: "text-red-600" },
    { id: "aviation", name: "Aviation Systems", domains: 18, icon: Plane, featured: "ajet.ai", color: "text-neutral-800" },
    { id: "energy", name: "Renewable Energy", domains: 10, icon: Zap, featured: "onlyenergy.ai", color: "text-red-500" },
    { id: "defense", name: "Cyber & Defense", domains: 8, icon: Target, featured: "onlyaudit.ai", color: "text-neutral-900" },
    { id: "logistics", name: "Supply Chain", domains: 14, icon: Cpu, featured: "onlycargo.ai", color: "text-red-600" },
  ];

  return (
    <section id="assets" className="py-24 bg-neutral-50 border-t border-neutral-100">
      <div className="container mx-auto px-4">
        
        {/* Crisp Header - Microsoft Azure Style */}
        <div className="max-w-4xl mb-20">
          <h2 className="text-sm font-semibold text-red-600 tracking-wider uppercase mb-3">
            {t("badge")}
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight mb-6 tracking-tight">
            {t("title_1")} <br className="hidden md:block"/> {t("title_2")}
          </h3>
          <p className="text-xl text-neutral-500 font-medium leading-relaxed max-w-2xl">
            {t("description")}
          </p>
        </div>

        {/* Global Enterprise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENTO_SECTORS.map((sector) => {
            const Icon = sector.icon;
            // DYNAMIC FALLBACK TO SECTOR KEYS IF NEEDED, BUT WE'LL USE THE EXACT TEXT FROM I18N
            return (
              <div 
                key={sector.id} 
                className="group relative bg-white p-8 rounded-xl border border-neutral-200 transition-all duration-300 hover:shadow-xl hover:shadow-red-900/5 hover:-translate-y-1 overflow-hidden"
              >
                {/* Top Subtle Line Indicator */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between mb-8">
                  <div className={`p-3 rounded-lg bg-neutral-50 border border-neutral-100 group-hover:bg-red-50 transition-colors ${sector.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="px-3 py-1 bg-neutral-100 text-neutral-600 text-xs font-bold rounded-full group-hover:bg-red-100 group-hover:text-red-600 transition-colors cursor-default">
                    {sector.domains} DOMAIN
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-red-600 transition-colors">
                    {sector.name}
                  </h4>
                  <p className="text-sm font-medium text-neutral-400">
                    Flagship: <span className="text-neutral-700 group-hover:text-neutral-900">{sector.featured}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
