"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Shield, Lock, Eye, Database, Cookie } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations("Privacy");

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Badge variant="outline" className="mb-4 text-xs font-medium">
                <Shield className="h-3 w-3 mr-1.5" />
                {t("badge")}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{t("title")}</h1>
              <p className="text-sm text-muted-foreground mb-10">
                {t("intro")}
              </p>

              <div className="space-y-5">
                {/* Data Collection */}
                <div className="corporate-card rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-bold">{t("data_collection")}</h2>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("data_collection_text")}
                  </p>
                </div>

                {/* AI Chatbot */}
                <div className="corporate-card rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-bold">{t("ai_chatbot")}</h2>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("ai_chatbot_text")}
                  </p>
                </div>

                {/* Cookies */}
                <div className="corporate-card rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Cookie className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-bold">{t("cookies")}</h2>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("cookies_text")}
                  </p>
                </div>

                {/* Security */}
                <div className="corporate-card rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-bold">SSL/TLS</h2>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    SSL/TLS encryption · Secure server infrastructure · Access control · Data backup
                  </p>
                </div>

                {/* Rights */}
                <div className="corporate-card rounded-xl p-6">
                  <h2 className="text-sm font-bold mb-3">{t("rights")}</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("rights_text")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {t("contact")}: <a href="mailto:info@aipyram.com" className="text-primary hover:underline">info@aipyram.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
