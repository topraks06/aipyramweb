import React, { useEffect, useRef } from 'react';
import { ShieldAlert, Zap, Network, Terminal, CheckCircle } from 'lucide-react';

export interface LogEntry {
  id: string;
  agent: string;
  message: string;
  status: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

interface AgentTerminalProps {
  logs: LogEntry[];
  title?: string;
  isActive: boolean;
}

export const AgentTerminal: React.FC<AgentTerminalProps> = ({ logs, title = "AGENTIC_STREAM_PROCESSOR", isActive }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getColor = (agent: string, status: string) => {
    if (status === 'error') return 'text-red-500';
    if (status === 'success') return 'text-emerald-500';
    
    // Semantic Highlighting
    const uAgent = agent.toUpperCase();
    if (uAgent.includes('NETWORK') || uAgent.includes('DB') || uAgent.includes('API')) return 'text-blue-400';
    if (uAgent.includes('STRATEGIST') || uAgent.includes('LOGIC') || uAgent.includes('MATCH')) return 'text-yellow-400';
    if (uAgent.includes('GUARD') || uAgent.includes('AUDITOR')) return 'text-amber-500';
    
    return 'text-green-500'; // Default Brutalist Green
  };

  // İşlem bittiyse (isActive === false) ve log varsa -> Sadece özet göster (son 3)
  if (!isActive && logs.length > 0) {
    const lastLogs = logs.slice(-3);
    return (
      <div className="bg-black/50 border border-green-900/50 p-3 mt-2 rounded-sm custom-scrollbar relative">
        <div className="absolute top-0 right-0 bg-green-900/50 text-green-400 text-[8px] font-black uppercase px-2 py-0.5">İŞLEM ÖZETİ</div>
        {lastLogs.map(log => (
          <div key={log.id} className="text-[10px] font-mono leading-tight flex items-start gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
            <span className="text-zinc-400">[{log.agent}]</span>
            <span className="text-zinc-200">{log.message}</span>
          </div>
        ))}
      </div>
    );
  }

  // Active Terminal
  if (!isActive) return null;

  return (
    <div className="bg-black text-green-500 font-mono text-[10px] p-3 border-2 border-green-900 rounded-none w-full shadow-[0_0_15px_rgba(0,255,0,0.1)] flex flex-col max-h-48 custom-scrollbar overflow-y-auto mt-2 z-10 relative">
      {/* Brutalist Header */}
      <div className="mb-2 border-b border-green-900 pb-1 flex justify-between items-center tracking-widest sticky top-0 bg-black/90 z-20">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-green-400" />
          <span className="font-bold uppercase text-green-500">{'> '}{title}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-green-950/50 px-2 py-0.5 border border-green-900">
           <Zap size={10} className="text-green-400" />
           <span className="animate-pulse text-[9px] font-black text-green-400">LIVE</span>
        </div>
      </div>
      
      {/* Logs Node */}
      <div className="space-y-1.5 flex-1 relative">
        {logs.map((log) => (
          <div key={log.id} className="leading-tight flex items-start gap-1.5 animate-in fade-in slide-in-from-bottom-1">
            <span className="text-zinc-600 shrink-0 select-none">[{log.timestamp}]</span>
            <span className={`font-bold shrink-0 ${getColor(log.agent, log.status)}`}>[{log.agent}]</span>
            <span className={log.status === 'error' ? 'text-red-400 bg-red-950/30 px-1 border-l-2 border-red-500' : 'text-zinc-300 break-words'}>
              {log.message}
            </span>
          </div>
        ))}
        {/* Blinking Cursor */}
        <div className="text-green-500 animate-pulse mt-1">_</div>
        <div ref={bottomRef} />
      </div>
      
      {/* Human-in-the-Loop Mock Button */}
      {logs.length > 0 && logs[logs.length-1].status === 'warning' && (
         <button className="sticky bottom-0 mt-2 bg-red-950 hover:bg-red-900 border border-red-500 text-red-500 text-[10px] font-bold uppercase py-1 px-3 w-full transition-colors flex items-center justify-center gap-2">
           <ShieldAlert size={12} /> [DURDUR / DÜZELT] KRİTİĞE MÜDAHALE ET
         </button>
      )}
    </div>
  );
};
