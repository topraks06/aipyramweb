"use client";

import { Globe2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function HeroSection() {
  const t = useTranslations("Hero");

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[85vh] bg-white text-neutral-900 overflow-hidden pt-20">
      
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

      </div>
    </section>
  );
}
