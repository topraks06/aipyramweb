import { MetadataRoute } from "next";
// Not: "headers" Next.js App Router context'inden import edilemezse statik string mecbur, robots() dinamik olmalı
// Next 10+ robots() bir request objesi almaz ancak host header'dan domain alabiliyorsak onu kullanır
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
    let domain = "aipyram.com";
    try {
        const headersList = await headers();
        const host = headersList.get("host");
        if (host && host.includes("trtex.com")) domain = "trtex.com";
        else if (host && host.includes("hometex")) domain = "hometex.com";
    } catch (e) {
        // Build sırasında headers() çağrısı patlarsa fallback
    }

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/admin/", "/api/", "/_next/"],
            },
            {
                userAgent: "GPTBot",
                allow: "/",
                disallow: ["/admin", "/api/"],
            },
            {
                userAgent: "Google-Extended",
                allow: "/",
            },
        ],
        sitemap: `https://${domain}/api/sitemap/${domain.split('.')[0]}`,
    };
}
