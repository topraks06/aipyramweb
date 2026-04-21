import React, { useState } from 'react';
import { LayoutPanelTop, Terminal, Lock, Play, Layers, BookOpen, AlertTriangle } from 'lucide-react';

interface PreviewProps {
  content?: string;
  type?: 'diff' | 'json' | 'web';
  title?: string;
  logs?: {id: string, role: string, text: string, widget?: string}[];
}

export function ArtifactPreviewWidget({ content, type = 'json', title = 'Operasyon Alanı', logs = [] }: PreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'strategy' | 'glossary'>('preview');

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-l border-zinc-900 overflow-hidden font-mono text-xs xl:text-sm w-full">
      
      {/* ─── TACTICAL HEADER ─── */}
      <div className="p-3 border-b flex flex-col gap-2 border-zinc-900 bg-black">
         <div className="flex items-center gap-1 border-b border-zinc-800 pb-2 mb-1">
           <button onClick={() => setActiveTab('preview')} className={`flex-1 py-1 text-center rounded transition-colors ${activeTab === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Canlı Önizleme</button>
           <button onClick={() => setActiveTab('strategy')} className={`flex-1 py-1 text-center rounded transition-colors ${activeTab === 'strategy' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}>Strateji</button>
           <button onClick={() => setActiveTab('glossary')} className={`flex-1 py-1 text-center rounded transition-colors ${activeTab === 'glossary' ? 'bg-zinc-800 text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}>Terminal Log</button>
         </div>

        {activeTab === 'preview' && (
          <div className="flex items-center justify-between mt-1">
            <span className="bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded text-[10px] xl:text-xs uppercase tracking-wider border border-blue-900/50">
              {type}
            </span>
            <span className="text-zinc-600 text-[10px] xl:text-xs">{title}</span>
          </div>
        )}
      </div>

      {/* ─── BODY ─── */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar text-zinc-400 bg-[#050505]">
        {activeTab === 'preview' && (
          content ? (
             type === 'diff' ? (
                <pre className="text-xs xl:text-sm text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {content}
                </pre>
             ) : (
               <div className="border border-zinc-800 rounded bg-zinc-950 p-2">
                 <pre className="text-xs xl:text-sm text-zinc-400 overflow-hidden">
                   {content}
                 </pre>
               </div>
             )
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <Layers size={32} className="mb-3 text-zinc-600" />
              <p className="text-zinc-500 max-w-[200px] text-xs">
                Canlı önizleme için hedef dosya veya UI bekleniyor.
              </p>
            </div>
          )
        )}

        {activeTab === 'strategy' && (
           <div className="h-full p-4 border border-zinc-800 rounded bg-zinc-950 font-mono text-zinc-400">
             <div className="text-amber-500 mb-2 font-bold flex items-center gap-2"><AlertTriangle size={14}/> STRATEJİ MOTORU AKTİF</div>
             <p className="text-xs mb-4">Master Node'dan gelen stratejik direktifler burada belirecektir.</p>
             <div className="text-[10px] text-zinc-600 space-y-1">
               <p>&gt; Otonom Ajan Zinciri Beklemede...</p>
               <p>&gt; Nexus Sensörleri Dinleniyor...</p>
               <p>&gt; Zero-Mock Politikası Devrede.</p>
             </div>
           </div>
        )}

        {activeTab === 'glossary' && (
          <div className="h-full flex flex-col font-mono">
            <div className="text-purple-400 font-bold flex items-center gap-2 mb-2 px-2"><Terminal size={14}/> TERMINAL LOG</div>
            <div className="flex-1 overflow-y-auto space-y-2 p-2 custom-scrollbar bg-black border border-zinc-900">
              {logs.length > 0 ? logs.map((log, i) => (
                <div key={i} className={`text-[10px] xl:text-xs ${log.role === 'user' ? 'text-blue-500' : 'text-emerald-500'} break-words whitespace-pre-wrap`}>
                  <span className="opacity-50">[{new Date().toLocaleTimeString('tr-TR')}]</span> {log.role === 'user' ? '>' : '#'} {log.text}
                </div>
              )) : (
                 <p className="text-zinc-600 text-xs">Bekleniyor...</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── PREVIEW FOOTER (ACTION PINS) ─── */}
      <div className="border-t border-zinc-900 bg-zinc-950 p-4 shrink-0 max-h-32 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] z-10">
         <h3 className="text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 text-xs xl:text-sm">
          <Play size={14} className="text-amber-500" />
          Operasyonlar
        </h3>
        {logs.filter(m => m.widget === 'approval').length > 0 ? (
           <div className="mt-2 space-y-1">
             {logs.filter(m => m.widget === 'approval').slice(-2).map((m, i) => (
                <div key={i} className="text-xs text-amber-500 border border-amber-900/50 bg-amber-950/20 px-2 py-1 rounded">
                  ⚠️ Onay Bekliyor: Ops {m.id.substring(0,4)}
                </div>
             ))}
           </div>
        ) : (
           <p className="text-zinc-600 text-xs text-center italic py-2">Bekleyen görev yok.</p>
        )}
      </div>

    
    </div>
  );
}
