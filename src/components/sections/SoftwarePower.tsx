"use client";

import { useTranslations } from "next-intl";
import { Server, Database, Layers, ShieldCheck, Cpu, Globe } from "lucide-react";

export default function SoftwarePower() {
  const t = useTranslations("SoftwarePower");

  const components = [
    { name: t("cap1_title"), role: t("cap1_desc"), label: t("cap1_label"), icon: Globe },
    { name: t("cap2_title"), role: t("cap2_desc"), label: t("cap2_label"), icon: Cpu },
    { name: t("cap3_title"), role: t("cap3_desc"), label: t("cap3_label"), icon: Server },
    { name: t("cap4_title"), role: t("cap4_desc"), label: t("cap4_label"), icon: Layers },
    { name: t("cap5_title"), role: t("cap5_desc"), label: t("cap5_label"), icon: ShieldCheck },
    { name: t("cap6_title"), role: t("cap6_desc"), label: t("cap6_label"), icon: Database },
  ];

  return (
    <section className="py-24 bg-neutral-900 border-t border-neutral-800 relative overflow-hidden text-white">
      {/* Dark Micro-B2B Section for Tech Stack - MS Azure/Google Cloud Style Contrast */}
      
      <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row gap-12 items-center">
        
        {/* Left Typography */}
        <div className="md:w-1/2">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-8 leading-tight">
            {t("title_1")} <br />
            <span className="text-red-500">{t("title_2")}</span>
          </h2>
          <p className="text-xl text-neutral-400 font-medium mb-10 leading-relaxed max-w-lg">
            {t("description")}
          </p>
          <div className="inline-flex gap-4">
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgb(220,38,38,0.3)]">
              API Docs
            </button>
          </div>
        </div>

        {/* Right Architecture Grid */}
        <div className="md:w-1/2 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          {components.map((comp, i) => {
            const Icon = comp.icon;
            return (
              <div key={i} className="p-6 bg-neutral-800/50 border border-neutral-700/50 rounded-2xl hover:border-red-500/50 hover:bg-neutral-800 transition-colors">
                <Icon className="w-8 h-8 text-neutral-400 mb-4 group-hover:text-red-500 transition-colors" />
                <div className="text-lg font-bold text-white mb-1">
                  {comp.name}
                </div>
                <div className="text-sm font-medium text-neutral-500">
                  {comp.label}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
