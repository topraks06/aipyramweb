"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Building2, MapPin, Mail, Globe, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export default function ImpressumPage() {
  const t = useTranslations("Impressum");

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Badge variant="outline" className="mb-4 text-xs font-medium">
                <Scale className="h-3 w-3 mr-1.5" />
                {t("badge")}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{t("title")}</h1>
              <p className="text-sm text-muted-foreground mb-10">
                {t("badge")}
              </p>

              <div className="space-y-5">
                {/* Company Info */}
                <div className="corporate-card rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-bold">{t("company_info")}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{t("company_name")}</div>
                      <div className="font-medium">Aipyram GmbH</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{t("company_type")}</div>
                      <div className="font-medium">{t("company_type_value")}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{t("registration")}</div>
                      <div className="font-medium">{t("registration_value")}</div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="corporate-card rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-bold">{t("hq_address")}</h2>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Aipyram GmbH</p>
                    <p>Heimstrasse 10</p>
                    <p>CH-8953 Dietikon</p>
                    <p>Zürich, Switzerland 🇨🇭</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="corporate-card rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-bold">{t("email")}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{t("email")}</div>
                      <a href="mailto:info@aipyram.com" className="text-primary hover:underline">info@aipyram.com</a>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Web</div>
                      <a href="https://aipyram.com" className="text-primary hover:underline">aipyram.com</a>
                    </div>
                  </div>
                </div>

                {/* Management */}
                <div className="corporate-card rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-bold">{t("representative")}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p>AI Technologies, Digital Transformation</p>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="corporate-card rounded-xl p-6">
                  <h2 className="text-sm font-bold mb-3">{t("disclaimer_title")}</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {t("disclaimer_text")}
                  </p>
                  <h2 className="text-sm font-bold mb-3 mt-4">{t("copyright_title")}</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("copyright_text")}
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
