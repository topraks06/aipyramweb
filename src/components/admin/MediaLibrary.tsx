"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Image as ImageIcon, CheckCircle2, Cloud, Database } from "lucide-react";
import { MediaAsset, MediaDetailModal } from "./MediaDetailModal";

// Mock Data removed

export function MediaLibrary({ initialAssets = [] }: { initialAssets?: any[] }) {
  const [activeNode, setActiveNode] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      if (initialAssets && initialAssets.length > 0) {
         setAssets(mapAssets(initialAssets));
         setLoading(false);
         return;
      }
      try {
        const res = await fetch('/api/admin/media');
        const json = await res.json();
        if (json.success && json.data) {
          setAssets(mapAssets(json.data));
        } else {
          setAssets([]);
        }
      } catch (err) {
        console.error("Media fetch error", err);
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [initialAssets]);

  const mapAssets = (rawAssets: any[]): MediaAsset[] => {
    return rawAssets.map((asset: any) => ({
      id: asset.key || asset.id,
      title: asset.category === "user_render" ? "Kullanıcı Render (Perde.ai)" : (asset.title || "İsimsiz Medya"),
      url: asset.url_2k || asset.url_1k || asset.url,
      thumbnailUrl: asset.url_1k || asset.url_2k || asset.url,
      node: asset.node || "perde",
      type: asset.source === "imagen" ? "render" : asset.source === "trtex_article" ? "news" : "product",
      resolution: asset.url_4k ? "4K" : asset.url_2k ? "2K" : "1K",
      status: "published",
      createdAt: asset.createdAt || new Date().toISOString(),
      tags: asset.tags || []
    }));
  };

  const filtered = assets.filter(a => {
    if (activeNode !== "all" && a.node !== activeNode) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.tags.join(" ").includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-serif">Master Media Library</h2>
          <p className="text-sm text-slate-600 font-mono">GCS / Firestore Synced Archive</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text" 
              placeholder="Tag veya başlık ara..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-sm text-slate-900 px-10 py-2 rounded-md focus:outline-none focus:border-zinc-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
          <button className="bg-slate-50 border border-slate-200 p-2 rounded-md hover:bg-slate-100 transition-colors">
            <Filter className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Node Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-px">
        {["all", "perde", "trtex", "hometex", "vorhang"].map(node => (
          <button
            key={node}
            onClick={() => setActiveNode(node)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
              activeNode === node 
                ? "text-slate-900 border-b-2 border-white" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {node === "all" ? "TÜMÜ" : node}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500 font-mono text-sm">
            Medya yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 font-mono text-sm">
            Henüz medya bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(asset => (
            <div 
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className="group relative bg-slate-50 border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:border-zinc-500 transition-colors aspect-square flex flex-col"
            >
              <div className="flex-1 relative overflow-hidden bg-white">
                <img 
                  src={asset.thumbnailUrl} 
                  alt={asset.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500"
                />
                {/* Resolution Badge */}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-[10px] font-mono px-2 py-0.5 rounded text-slate-700 border border-slate-300">
                  {asset.resolution}
                </div>
                {/* Node Badge */}
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-[10px] font-bold tracking-wider px-2 py-0.5 rounded text-slate-900 border border-slate-300 uppercase">
                  {asset.node}
                </div>
              </div>
              <div className="p-3 border-t border-slate-200 bg-slate-50/95">
                <p className="text-xs text-slate-900 font-medium truncate mb-1">{asset.title}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Database className="w-3 h-3" /> {new Date(asset.createdAt).toLocaleDateString()}
                  </span>
                  {asset.status === 'published' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      <MediaDetailModal 
        isOpen={!!selectedAsset} 
        onClose={() => setSelectedAsset(null)} 
        asset={selectedAsset} 
      />
    </div>
  );
}
