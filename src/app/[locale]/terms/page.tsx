"use client";

export const dynamic = 'force-dynamic';


import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { FileText, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export default function TermsPage() {
  const t = useTranslations("Terms");

  const sections = [
    { key: "scope" },
    { key: "ip" },
    { key: "domains" },
    { key: "liability" },
    { key: "privacy" },
    { key: "changes" },
    { key: "law" },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Badge variant="outline" className="mb-4 text-xs font-medium">
                <FileText className="h-3 w-3 mr-1.5" />
                {t("badge")}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{t("title")}</h1>

              {/* Alert */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-10">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {t("alert")}
                </p>
              </div>

              <div className="space-y-5">
                {sections.map((section, i) => (
                  <div key={section.key} className="corporate-card rounded-xl p-6">
                    <h2 className="text-sm font-bold mb-3">
                      {i + 1}. {t(`sections.${section.key}`)}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t(`sections.${section.key}_text`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
