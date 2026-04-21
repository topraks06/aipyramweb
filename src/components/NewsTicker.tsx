"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from 'next/navigation';
import { Activity, ShieldAlert } from "lucide-react";

type IntelMsg = {
    id: string;
    project: string;
    text: string;
};

export default function NewsTicker() {
    const locale = useLocale();
    const pathname = usePathname();
    const [news, setNews] = useState<IntelMsg[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIntel = async () => {
            try {
                const res = await fetch(`/api/agents/news-intel?lang=${locale}`);
                const data = await res.json();
                if (data.status === "success") {
                    setNews(data.data);
                }
            } catch (error) {
                console.error("Failed to load intel", error);
            } finally {
                setLoading(false);
            }
        };
        fetchIntel();
        
        // Refresh every 5 minutes
        const interval = setInterval(fetchIntel, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [locale]);

    if (loading || news.length === 0) return null;
    
    // Hide the News Ticker completely on the /aloha God-Mode terminal
    if (pathname?.includes('/aloha')) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-primary/20 bg-background/90 backdrop-blur-xl h-9 flex items-center overflow-hidden">
            <div className="flex items-center h-full px-4 bg-primary/10 border-r border-primary/30 z-10 shadow-[10px_0_20px_rgba(0,0,0,0.8)] shrink-0 max-w-[150px] md:max-w-none">
                <ShieldAlert className="h-3.5 w-3.5 text-primary mr-2 animate-pulse" />
                <span className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase hidden sm:inline">
                    ECOSYSTEM INTEL
                </span>
                <span className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase sm:hidden">
                    INTEL
                </span>
            </div>
            
            <div className="flex-1 relative overflow-hidden flex items-center h-full mask-edges">
                <div className="animate-marquee whitespace-nowrap flex items-center gap-10 hover:[animation-play-state:paused] cursor-default">
                    {/* Double the array to create an infinite loop effect */}
                    {[...news, ...news, ...news].map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="flex items-center gap-2 group">
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 font-mono text-muted-foreground uppercase group-hover:text-white transition-colors">
                                {item.project}
                            </span>
                            <span className="text-xs text-white/80 font-mono group-hover:text-primary transition-colors tracking-tight">
                                {item.text}
                            </span>
                            <Activity className="h-3 w-3 text-muted-foreground/30 ml-4 group-hover:text-primary/50" />
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
                .mask-edges {
                    mask-image: linear-gradient(90deg, transparent, black 15%, black 85%, transparent);
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                @media (max-width: 640px) {
                    .animate-marquee {
                        animation-duration: 30s;
                    }
                }
            `}</style>
        </div>
    );
}
