"use client";

import { Link } from "@/i18n/routing";
import { Mail, MapPin, Globe, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");
  const nav = useTranslations("Nav");

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-2">Aipyram GmbH</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md leading-relaxed">
              {t("description")}
            </p>
            <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Heimstrasse 10, CH-8953 Dietikon, Zürich</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:info@aipyram.com" className="hover:text-foreground transition-colors">
                  info@aipyram.com
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">{t("quick_links")}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sectors" className="text-muted-foreground hover:text-foreground transition-colors">{nav("sectors")}</Link></li>
              <li><Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">{nav("projects")}</Link></li>
              <li><Link href="/domains" className="text-muted-foreground hover:text-foreground transition-colors">{nav("domains")}</Link></li>
              <li><Link href="/ecosystem" className="text-muted-foreground hover:text-foreground transition-colors">{nav("ecosystem")}</Link></li>
              <li><Link href="/sponsor" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">Sponsor <ExternalLink className="h-3 w-3" /></Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">{t("legal")}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/impressum" className="text-muted-foreground hover:text-foreground transition-colors">{nav("impressum")}</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">{nav("privacy")}</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">{nav("terms")}</Link></li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">Aipyram GmbH</p>
              <p className="text-[10px] text-muted-foreground/70">Heimstrasse 10, CH-8953 Dietikon</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 uppercase tracking-wider">
            <Globe className="h-3 w-3" />
            <span>{t("swiss_quality")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
