"use client";

import { useState } from "react";
import { Search, Filter, Image as ImageIcon, CheckCircle2, Cloud, Database } from "lucide-react";
import { MediaAsset, MediaDetailModal } from "./MediaDetailModal";

// Mock Data
const MOCK_ASSETS: MediaAsset[] = [
  {
    id: "img_001",
    title: "Otel Odası Perde Render (V2)",
    url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=60",
    tenant: "perde",
    type: "render",
    resolution: "4K",
    status: "published",
    createdAt: "2026-04-22T08:00:00Z",
    tags: ["otel", "blackout", "modern", "v2"]
  },
  {
    id: "img_002",
    title: "TRTEX İplik Pazarı Kapak",
    url: "https://images.unsplash.com/photo-1605280263929-1c42c624165b?w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1605280263929-1c42c624165b?w=400&q=60",
    tenant: "trtex",
    type: "news",
    resolution: "2K",
    status: "published",
    createdAt: "2026-04-21T14:30:00Z",
    tags: ["iplik", "pazar", "ekonomi"]
  },
  {
    id: "img_003",
    title: "Hometex Sanal Fuar Standı",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=60",
    tenant: "hometex",
    type: "fair",
    resolution: "4K",
    status: "draft",
    createdAt: "2026-04-20T10:15:00Z",
    tags: ["fuar", "stand", "b2b"]
  },
  {
    id: "img_004",
    title: "Lüks İtalyan Kadife",
    url: "https://images.unsplash.com/photo-1543169720-6d306b9b3e1a?w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1543169720-6d306b9b3e1a?w=400&q=60",
    tenant: "vorhang",
    type: "product",
    resolution: "4K",
    status: "published",
    createdAt: "2026-04-22T09:45:00Z",
    tags: ["kadife", "lacivert", "premium"]
  },
  {
    id: "img_005",
    title: "Minimalist Ofis Stor Perde",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=60",
    tenant: "perde",
    type: "render",
    resolution: "2K",
    status: "archived",
    createdAt: "2026-04-18T16:20:00Z",
    tags: ["ofis", "stor", "minimal"]
  }
];

export function MediaLibrary() {
  const [activeTenant, setActiveTenant] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  const filtered = MOCK_ASSETS.filter(a => {
    if (activeTenant !== "all" && a.tenant !== activeTenant) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.tags.join(" ").includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-serif">Master Media Library</h2>
          <p className="text-sm text-zinc-400 font-mono">GCS / Firestore Synced Archive</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text" 
              placeholder="Tag veya başlık ara..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-sm text-white px-10 py-2 rounded-md focus:outline-none focus:border-zinc-500 font-mono"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          </div>
          <button className="bg-zinc-900 border border-zinc-800 p-2 rounded-md hover:bg-zinc-800 transition-colors">
            <Filter className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Tenant Tabs */}
      <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-px">
        {["all", "perde", "trtex", "hometex", "vorhang"].map(tenant => (
          <button
            key={tenant}
            onClick={() => setActiveTenant(tenant)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTenant === tenant 
                ? "text-white border-b-2 border-white" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tenant === "all" ? "TÜMÜ" : tenant}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(asset => (
            <div 
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className="group relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden cursor-pointer hover:border-zinc-500 transition-colors aspect-square flex flex-col"
            >
              <div className="flex-1 relative overflow-hidden bg-black">
                <img 
                  src={asset.thumbnailUrl} 
                  alt={asset.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500"
                />
                {/* Resolution Badge */}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur text-[10px] font-mono px-2 py-0.5 rounded text-zinc-300 border border-zinc-700">
                  {asset.resolution}
                </div>
                {/* Tenant Badge */}
                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur text-[10px] font-bold tracking-wider px-2 py-0.5 rounded text-white border border-zinc-700 uppercase">
                  {asset.tenant}
                </div>
              </div>
              <div className="p-3 border-t border-zinc-800 bg-zinc-900/95">
                <p className="text-xs text-white font-medium truncate mb-1">{asset.title}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                    <Database className="w-3 h-3" /> {new Date(asset.createdAt).toLocaleDateString()}
                  </span>
                  {asset.status === 'published' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MediaDetailModal 
        isOpen={!!selectedAsset} 
        onClose={() => setSelectedAsset(null)} 
        asset={selectedAsset} 
      />
    </div>
  );
}
