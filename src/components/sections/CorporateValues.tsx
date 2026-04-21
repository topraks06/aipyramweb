"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";

export default function CorporateValues() {
  const t = useTranslations("CorporateValues");

  const values = [
    { title: t("val1_title"), desc: t("val1_desc") },
    { title: t("val2_title"), desc: t("val2_desc") },
    { title: t("val3_title"), desc: t("val3_desc") },
    { title: t("val4_title"), desc: t("val4_desc") },
    { title: t("val5_title"), desc: t("val5_desc") },
    { title: t("val6_title"), desc: t("val6_desc") }
  ];

  return (
    <section className="py-24 bg-white border-t border-neutral-100 relative overflow-hidden text-neutral-900">
      
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Crisp Header - Microsoft Azure Style */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-sm font-semibold text-red-600 tracking-wider uppercase mb-3">
            {t("badge")}
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            {t("title_1")} {t("title_2")}
          </h3>
          <p className="text-xl text-neutral-500 font-medium">
            {t("description")}
          </p>
        </div>

        {/* List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl mx-auto">
          {values.map((v, i) => (
            <div key={i} className="flex items-start gap-4">
              <CheckCircle2 className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <div className="text-2xl font-bold text-neutral-900 mb-2">{v.title}</div>
                <div className="text-lg font-medium text-neutral-500 leading-relaxed">{v.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
