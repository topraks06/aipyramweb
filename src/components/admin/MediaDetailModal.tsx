"use client";

import { X, Download, Tag, Maximize, FileImage, ShieldCheck } from "lucide-react";

export interface MediaAsset {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  node: "trtex" | "perde" | "hometex" | "vorhang";
  type: "render" | "news" | "fair" | "product";
  resolution: "4K" | "2K" | "1K";
  status: "published" | "draft" | "archived";
  createdAt: string;
  tags: string[];
}

interface MediaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: MediaAsset | null;
}

export function MediaDetailModal({ isOpen, onClose, asset }: MediaDetailModalProps) {
  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-white/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-slate-50 border border-slate-200 w-full max-w-5xl rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        
        {/* Left: Image Preview */}
        <div className="flex-1 bg-white p-4 flex flex-col relative group">
          <button 
            className="absolute top-4 right-4 bg-slate-100/80 hover:bg-zinc-700 text-slate-900 p-2 rounded-md transition-colors z-10"
            onClick={() => alert('Full screen view not implemented in demo')}
          >
            <Maximize className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative flex items-center justify-center min-h-[300px]">
             {/* Using standard img for mock data to avoid Next.js Image domain configs */}
            <img 
              src={asset.url} 
              alt={asset.title}
              className="max-w-full max-h-full object-contain rounded-md"
            />
          </div>
          
          <div className="mt-4 flex gap-2">
            <span className="px-3 py-1 bg-slate-100 border border-slate-300 text-xs font-mono text-slate-700 rounded-sm">
              {asset.resolution}
            </span>
            <span className="px-3 py-1 bg-slate-100 border border-slate-300 text-xs font-mono text-slate-700 rounded-sm uppercase">
              NODE: {asset.node}
            </span>
          </div>
        </div>

        {/* Right: Metadata & Actions */}
        <div className="w-full md:w-96 bg-zinc-950 p-6 flex flex-col border-l border-slate-200 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-slate-900 leading-tight font-serif">{asset.title}</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between text-sm border-b border-slate-200 pb-2">
              <span className="text-slate-500">Oluşturulma</span>
              <span className="text-slate-700">{new Date(asset.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-b border-slate-200 pb-2">
              <span className="text-slate-500">Tipi</span>
              <span className="text-slate-700 capitalize">{asset.type}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-b border-slate-200 pb-2">
              <span className="text-slate-500">Durum</span>
              <span className="text-emerald-600 capitalize flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> {asset.status}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Etiketler
            </h3>
            <div className="flex flex-wrap gap-2">
              {asset.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-slate-100 text-xs text-slate-700 rounded-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions - Multi Resolution */}
          <div className="mt-auto space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <FileImage className="w-4 h-4" /> Dışa Aktar
            </h3>
            
            <button className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 hover:bg-blue-500 text-slate-900 rounded-md text-sm font-medium transition-colors">
              <span className="flex items-center gap-2"><Download className="w-4 h-4" /> 4K Orijinal İndir</span>
              <span className="opacity-75 text-xs font-mono">~12 MB</span>
            </button>
            
            <button className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 hover:bg-zinc-700 text-slate-900 rounded-md text-sm font-medium transition-colors">
              <span className="flex items-center gap-2"><Download className="w-4 h-4" /> 2K Web Optimize</span>
              <span className="opacity-75 text-xs font-mono">~1.2 MB</span>
            </button>
            
            <button className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 hover:bg-zinc-700 text-slate-900 border border-slate-300 rounded-md text-sm font-medium transition-colors">
              <span className="flex items-center gap-2"><Download className="w-4 h-4" /> Thumbnail</span>
              <span className="opacity-75 text-xs font-mono">~150 KB</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
