
"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/routing";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const t = useTranslations("Nav");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkSovereignAuth = () => {
      const isAuth = document.cookie.includes("aipyram_auth=sovereign_pass");
      setIsAuthenticated(isAuth);
    };
    checkSovereignAuth();
  }, []);

  const navLinks = [
    { href: "/sectors", label: t("sectors") },
    { href: "/projects", label: t("projects") },
    { href: "/ecosystem", label: t("ecosystem") },
    { href: "/domains", label: t("domains") },
    { href: "/investor", label: t("investor") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "textile-glass shadow-lg"
        : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href={"/" as any} className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary via-[oklch(0.55_0.22_25)] to-accent bg-clip-text text-transparent">
              Aipyram
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-accent/50"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (router as any).push("/admin")}
                className="hidden md:inline-flex"
              >
                <Shield className="mr-2 h-4 w-4" />
                {t("admin")}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (router as any).push("/admin/login")}
                className="hidden md:inline-flex"
              >
                <Shield className="mr-2 h-4 w-4" />
                {t("adminLogin")}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href as any}
                  className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-accent/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    (router as any).push("/admin");
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {t("admin")}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    (router as any).push("/admin/login");
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {t("adminLogin")}
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
