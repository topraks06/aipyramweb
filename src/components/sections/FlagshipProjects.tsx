"use client";

import { ExternalLink, Database, Network, Building2, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function FlagshipProjects() {
  const t = useTranslations("FlagshipProjects");
  const tCommon = useTranslations("Common");

  const nodes = [
    {
      id: "fp1",
      title: "Perde.ai",
      slug: "perde-ai",
      description: t("p1_desc"),
      website_url: "https://perde.ai",
      status: tCommon("live"),
      type: t("p1_tagline"),
      color: "group-hover:text-red-600",
      bg: "group-hover:bg-red-50",
      icon: Database
    },
    {
      id: "fp2",
      title: "TRTex Master Feed",
      slug: "trtex",
      description: t("p2_desc"),
      website_url: "https://trtex.com",
      status: tCommon("live"),
      type: t("p2_tagline"),
      color: "group-hover:text-red-600",
      bg: "group-hover:bg-red-50",
      icon: Network
    },
    {
      id: "fp3",
      title: "Hometex AI Sentinel",
      slug: "hometex-ai",
      description: t("p3_desc"),
      website_url: "https://hometex.ai",
      status: tCommon("live"),
      type: t("p3_tagline"),
      color: "group-hover:text-red-600",
      bg: "group-hover:bg-red-50",
      icon: ShieldCheck
    },
    {
      id: "fp4",
      title: "DidimEmlak Oracle",
      slug: "didim-emlak",
      description: t("p4_desc"),
      website_url: "https://didimemlak.ai",
      status: tCommon("live"),
      type: t("p4_tagline"),
      color: "group-hover:text-red-600",
      bg: "group-hover:bg-red-50",
      icon: Building2
    },
  ];

  return (
    <section id="flagship" className="py-24 bg-white relative overflow-hidden border-t border-neutral-100">
      
      {/* Background Subtle Microsoft-style grid */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" 
        style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Crisp Header */}
        <div className="mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 mb-6">
            {t("title_1")} {t("title_2")}
          </h2>
          <div className="w-20 h-1 bg-red-600 rounded-full mb-6"></div>
          <p className="text-xl text-neutral-500 max-w-2xl font-medium">
            {t("description")}
          </p>
        </div>

        {/* Global Directory Grid (B2B Terminal Look) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-full">
          {nodes.map((project) => {
            const Icon = project.icon;
            return (
              <div 
                key={project.id} 
                className="group flex flex-col justify-between bg-white border border-neutral-200 rounded-2xl p-8 transition-all hover:border-red-600/30 hover:shadow-[0_10px_40px_rgb(220,38,38,0.06)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-xl bg-neutral-50 border border-neutral-100 transition-colors ${project.bg}`}>
                      <Icon className={`w-6 h-6 text-neutral-600 transition-colors ${project.color}`} />
                    </div>
                    <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200 uppercase tracking-widest flex items-center gap-2 cursor-default">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      {project.status}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-neutral-900 mb-3 group-hover:text-red-600 transition-colors">
                    {project.title}
                  </h3>
                  
                  <div className="text-xs font-bold tracking-widest text-neutral-400 uppercase mb-4">
                    {project.type}
                  </div>

                  <p className="text-neutral-500 leading-relaxed mb-8">
                    {project.description}
                  </p>
                </div>

                {project.website_url && (
                  <div className="pt-6 border-t border-neutral-100">
                    <a 
                      href={project.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 hover:text-red-600 transition-colors group/link"
                    >
                      {t("visit")}
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
