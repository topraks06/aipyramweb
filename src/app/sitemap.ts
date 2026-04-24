import { MetadataRoute } from "next";
import { adminDb } from "@/lib/firebase-admin";

const BASE_URL = "https://aipyram.com";
const LOCALES = ["de", "en", "tr"] as const;
const TRTEX_URL = "https://trtex.com"; // Primary domain for trtex
const TRTEX_LANGS = ["tr", "en", "de", "ru", "zh", "ar", "es", "fr"] as const;

// All public pages with their priorities and change frequencies
const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"] }[] = [
    { path: "", priority: 1.0, changeFrequency: "weekly" },
    { path: "/sectors", priority: 0.9, changeFrequency: "weekly" },
    { path: "/projects", priority: 0.9, changeFrequency: "weekly" },
    { path: "/ecosystem", priority: 0.8, changeFrequency: "weekly" },
    { path: "/domains", priority: 0.9, changeFrequency: "weekly" },
    { path: "/investor", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
    { path: "/sponsor", priority: 0.8, changeFrequency: "monthly" },
    { path: "/impressum", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const entries: MetadataRoute.Sitemap = [];

    // 1. AIPyram Main Corporate Pages
    for (const page of PAGES) {
        for (const locale of LOCALES) {
            const url = `${BASE_URL}/${locale}${page.path}`;
            entries.push({
                url,
                lastModified: new Date(),
                changeFrequency: page.changeFrequency,
                priority: page.priority,
                alternates: {
                    languages: {
                        de: `${BASE_URL}/de${page.path}`,
                        en: `${BASE_URL}/en${page.path}`,
                        tr: `${BASE_URL}/tr${page.path}`,
                        "x-default": `${BASE_URL}/de${page.path}`,
                    },
                },
            });
        }
    }

    // 1.5. TRTEX Main Subpages (Static with Lang Params)
    const TRTEX_SUBPAGES = ["", "news", "tenders", "academy", "supply", "fairs", "opportunities", "login", "register"];
    for (const subpage of TRTEX_SUBPAGES) {
        const basePath = subpage ? `/${subpage}` : "";
        const alternatesMap: Record<string, string> = {
            "x-default": `${TRTEX_URL}${basePath}?lang=tr`
        };
        for (const l of TRTEX_LANGS) {
            alternatesMap[l] = `${TRTEX_URL}${basePath}?lang=${l}`;
        }

        for (const lang of TRTEX_LANGS) {
            entries.push({
                url: `${TRTEX_URL}${basePath}?lang=${lang}`,
                lastModified: new Date(),
                changeFrequency: "daily",
                priority: subpage === "" ? 1.0 : 0.8,
                alternates: {
                    languages: alternatesMap
                }
            });
        }
    }

    // 2. TRTEX News Articles
    try {
        if (adminDb) {
            const newsSnap = await adminDb.collection("trtex_news").where("status", "==", "published").get();
            for (const doc of newsSnap.docs) {
                const data = doc.data();
                if (!data.slug) continue;
                
                const publishedAt = data.updatedAt || data.publishedAt || data.createdAt || new Date().toISOString();
                const lastModDate = new Date(publishedAt);

                const alternatesMap: Record<string, string> = {
                    "x-default": `${TRTEX_URL}/news/${data.slug}?lang=tr`
                };
                for (const l of TRTEX_LANGS) {
                    alternatesMap[l] = `${TRTEX_URL}/news/${data.slug}?lang=${l}`;
                }

                for (const lang of TRTEX_LANGS) {
                    entries.push({
                        url: `${TRTEX_URL}/news/${data.slug}?lang=${lang}`,
                        lastModified: lastModDate,
                        changeFrequency: "daily",
                        priority: 0.8,
                        alternates: {
                            languages: alternatesMap
                        }
                    });
                }
            }
        }
    } catch (e) {
        console.error("Sitemap generation error for TRTEX:", e);
    }

    return entries;
}
