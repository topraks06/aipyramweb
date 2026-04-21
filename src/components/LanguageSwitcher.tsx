"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
    { code: "tr", label: "Türkçe", flag: "🇹🇷" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "de", label: "Deutsch", flag: "🇨🇭" },
    { code: "zh", label: "中文", flag: "🇨🇳" },
    { code: "ar", label: "العربية", flag: "🇦🇪" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
] as const;

type LocaleCodes = typeof LANGUAGES[number]["code"];

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleLocaleChange = (newLocale: LocaleCodes) => {
        router.replace(pathname, { locale: newLocale });
    };

    const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2">
                    <Globe className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{currentLang.flag}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
                {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLocaleChange(lang.code)}
                        className={`text-xs cursor-pointer ${lang.code === locale ? "font-bold bg-muted" : ""}`}
                    >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

