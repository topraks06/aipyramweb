import React from 'react';
import { Bot, Shield, Globe, Cpu, Hash, FileCode2, GitCommitHorizontal, Boxes, Clock, CheckCircle2 } from 'lucide-react';

interface TreeWidgetProps {
  logs?: {id?: string, role: string, text: string, widget?: string}[];
}

export function AgentTreeWidget({ logs = [] }: TreeWidgetProps) {
  const [projectNodes, setProjectNodes] = React.useState<{name: string, status: string}[]>([]);
  const [agentNodes, setAgentNodes] = React.useState<{name: string, status: string}[]>([]);
  
  React.useEffect(() => {
    const fetchScan = async () => {
       try {
         const res = await fetch('/api/admin/network-scan');
         const json = await res.json();
         if (json.success) {
            setProjectNodes(json.data.projects);
            setAgentNodes(json.data.agents);
         }
       } catch (e) {
         console.error('Network scan failed');
       }
    };
    fetchScan();
    // 30 saniyede bir otonom ağ taraması
    const interval = setInterval(fetchScan, 30000);
    return () => clearInterval(interval);
  }, []);

  const reversedLogs = [...logs].reverse();
  const fileEvents = reversedLogs.filter(m => m.text.includes('```')).slice(0, 3);
  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-900 overflow-y-auto custom-scrollbar font-mono text-xs xl:text-sm w-full">
      
      {/* ─── DOMAINS / PROJECTS TREE ─── */}
      <div className="p-4 border-b border-zinc-900">
        <h3 className="text-zinc-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-xs xl:text-sm">
          <Boxes size={16} className="text-blue-500" />
          Proje Ağacı (280/4 Aktif)
        </h3>
        <div className="flex flex-col gap-2">
          {projectNodes.length === 0 ? <p className="text-[10px] text-zinc-600 px-1">Tarama yapılıyor...</p> : projectNodes.map((node) => (
            <div key={node.name} className="flex items-center justify-between group hover:bg-zinc-900 p-1.5 -mx-1.5 rounded cursor-pointer transition-colors border border-transparent hover:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${node.status === 'aktif' || node.status === 'online' ? 'bg-blue-500 animate-pulse' : 'bg-red-700'}`} />
                <span className={node.status === 'aktif' || node.status === 'online' ? 'text-blue-400 font-bold tracking-widest' : 'text-zinc-500 font-bold tracking-widest'}>
                  {node.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── NEURAL SWARM TREE ─── */}
      <div className="p-4 border-b border-zinc-900">
        <h3 className="text-zinc-600 font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-xs xl:text-sm">
          <Cpu size={16} className="text-blue-500" />
          Nöral Düğümler (Sürü V4)
        </h3>
        
        <div className="flex flex-col gap-2">
          {agentNodes.length === 0 ? <p className="text-[10px] text-zinc-600 px-1">Sürü taraması sürüyor...</p> : agentNodes.map((node) => (
            <div key={node.name} className="flex items-center gap-2 group hover:bg-zinc-900 p-1 -mx-1 rounded cursor-pointer transition-colors">
                <Bot size={16} className={node.status === 'online' ? 'text-emerald-500' : 'text-zinc-700'} />
                <span className={node.status === 'online' ? 'text-zinc-300 font-bold tracking-wider' : 'text-zinc-600 tracking-wider'}>
                  {node.name}
                </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── ARTIFACT TREE (Dosya Ağacı) ─── */}
      <div className="p-4 flex-1">
        <h3 className="text-zinc-600 font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-xs xl:text-sm">
          <Hash size={16} className="text-amber-500" />
          Aktif Dosyalar
        </h3>

        <div className="flex flex-col border-l border-zinc-800 ml-1.5 pl-3 space-y-3 relative">
          {fileEvents.length === 0 ? <p className="text-[10px] text-zinc-600 px-1">Aktif artifact yok.</p> : fileEvents.map((file, i) => (
            <div key={i} className="flex items-start gap-2 relative mt-2">
              <GitCommitHorizontal size={16} className="absolute -left-6 top-0.5 text-zinc-700" />
              <FileCode2 size={16} className="text-emerald-400 mt-0.5" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-zinc-300 hover:text-blue-400 cursor-pointer text-[10px] line-clamp-1">{file.text.substring(0, 15)}... render edildi</span>
                <span className="text-[9px] text-emerald-500 uppercase border border-emerald-900 px-1 py-0.5 rounded">YENİ</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── TIME TRAVEL / HISTORY ─── */}
      <div className="p-4 border-t border-zinc-900 mt-auto bg-black flex-1 max-h-[200px] overflow-y-auto custom-scrollbar">
         <h3 className="text-zinc-600 font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-xs xl:text-sm">
          <Clock size={16} className="text-purple-500" />
          Zaman Çizelgesi
        </h3>
        <div className="border-l border-zinc-800 ml-1.5 pl-3 space-y-3 relative">
           {reversedLogs.slice(0, 5).map((item, i) => (
            <div key={i} className="flex flex-col relative group cursor-pointer mt-2">
              <span className={`absolute -left-[18px] top-1.5 w-2 h-2 rounded-full transition-colors ${item.role === 'aloha' ? 'bg-purple-900 group-hover:bg-purple-500' : 'bg-blue-900 group-hover:bg-blue-500'}`} />
              <div className="flex items-center gap-2">
                 <span className={`font-bold text-[10px] ${item.role === 'aloha' ? 'text-purple-400' : 'text-blue-400'}`}>
                    {item.role === 'aloha' ? 'ALOHA' : 'FOUNDER'}
                 </span>
              </div>
              <span className="text-zinc-400 group-hover:text-white transition-colors mt-0.5 text-[10px] line-clamp-2 leading-relaxed whitespace-pre-wrap">{item.text.substring(0, 60)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
