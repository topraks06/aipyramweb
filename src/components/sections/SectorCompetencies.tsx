"use client";

import { useTranslations } from "next-intl";
import { LineChart, BarChart3, PieChart, Activity, Cpu, Network } from "lucide-react";

export default function SectorCompetencies() {
  const t = useTranslations("SectorComp");

  const metrics = [
    { label: t("metric_1_label"), value: "60+", icon: Network },
    { label: t("metric_2_label"), value: "15", icon: BarChart3 },
    { label: t("metric_3_label"), value: "12M+", icon: Activity },
    { label: t("metric_4_label"), value: "85%", icon: PieChart }
  ];

  return (
    <section className="py-24 bg-white border-t border-neutral-100 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Crisp Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 mb-6">
              {t("title_1")} <br />
              <span className="text-red-600">{t("title_2")}</span>
            </h2>
            <p className="text-xl text-neutral-500 font-medium">
              {t("description")}
            </p>
          </div>
          
          {/* Action CTA */}
          <div className="shrink-0">
            <button className="px-6 py-3 border border-neutral-200 text-neutral-700 font-semibold rounded-lg hover:border-red-600 hover:text-red-600 transition-colors">
              {t("cta")}
            </button>
          </div>
        </div>

        {/* Executive Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <div key={i} className="group p-8 bg-neutral-50 rounded-2xl border border-neutral-100 hover:bg-white hover:border-red-100 hover:shadow-lg hover:shadow-red-900/5 transition-all">
                <Icon className="w-8 h-8 text-neutral-400 mb-6 group-hover:text-red-600 transition-colors" />
                <div className="text-4xl font-black text-neutral-900 mb-2 tracking-tighter">
                  {metric.value}
                </div>
                <div className="text-sm font-semibold text-neutral-500 uppercase tracking-widest">
                  {metric.label}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
