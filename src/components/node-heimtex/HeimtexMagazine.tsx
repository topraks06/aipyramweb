"use client";
import { useState, useEffect } from "react";
import HeimtexNavbar from "./HeimtexNavbar";
import HeimtexFooter from "./HeimtexFooter";
import { t } from "./heimtex-dictionary";

export default function HeimtexMagazine({ lang = 'en' }: { lang?: string }) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch only news with category 'trend' or 'fashion' from TRTEX/AIPyram brain
    fetch(`/api/brain/v1/memory?collection=heimtex_news`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setArticles(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <HeimtexNavbar lang={lang} />
      
      <main className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-6xl font-serif uppercase tracking-wider mb-16 pb-6 border-b border-zinc-800">
          {t('magazine', lang)}
        </h1>

        {loading ? (
          <div className="text-zinc-500 font-mono text-center py-20">Loading editorial content...</div>
        ) : articles.length === 0 ? (
           <div className="text-zinc-500 font-mono text-center py-20">No articles available at this time.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
             {articles.map((article: any, i: number) => (
               <article key={article.id || i} className="group cursor-pointer">
                  <div className="aspect-[4/3] bg-zinc-900 overflow-hidden mb-6">
                    {(article.image_url || article.images?.[0]) && (
                      <img src={article.image_url || article.images[0]} alt={article.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
                    )}
                  </div>
                  <div className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3">
                    {article.category || 'Editorial'}
                  </div>
                  <h2 className="text-2xl font-serif leading-snug group-hover:text-red-400 transition-colors mb-4">
                    {article.title}
                  </h2>
                  <p className="text-zinc-400 text-sm line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
               </article>
             ))}
          </div>
        )}
      </main>

      <HeimtexFooter />
    </div>
  );
}
