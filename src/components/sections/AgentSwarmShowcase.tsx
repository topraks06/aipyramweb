"use client";

import { Activity, Terminal, Shield, Zap, CircleDashed } from "lucide-react";

const AGENTS = [
  { id: "SYS-01", name: "ALOHA", type: "Otonom Yönlendirici", status: "AKTİF", icon: Terminal, load: "92%" },
  { id: "SYS-02", name: "TRTEX-NET", type: "Protokol Motoru", status: "ÖĞRENİYOR", icon: Activity, load: "45%" },
  { id: "SYS-03", name: "PERDE-CORE", type: "Görsel Render", status: "BEKLİYOR", icon: CircleDashed, load: "2%" },
  { id: "SYS-0X", name: "OVERSEER", type: "Ana Komuta", status: "GÜVENLİ", icon: Shield, load: "8%" },
];

export default function AgentSwarmShowcase() {
  return (
    <section className="relative py-24 bg-[#050505] border-t border-white/5 overflow-hidden" id="agents-showcase">
      {/* Intense Dark Neural Lines */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 animate-fade-in border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-primary/70 mb-4 tracking-[0.2em] uppercase">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              NEXUS AKTİF
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase">
              <span className="text-glow">Otonom</span><br/>Ajan Kümesi
            </h2>
          </div>
          <div className="mt-6 md:mt-0 font-mono text-sm text-right text-muted-foreground">
            <p>AKTİF ÇEKİRDEK: 04</p>
            <p>GECİKME: 12ms</p>
            <p>GÜVENLİK: <span className="text-primary font-bold">ALPHA-RED</span></p>
          </div>
        </div>

        {/* Tactical Status Board */}
        <div className="bg-black/60 bento-card border border-white/10 rounded-2xl p-0 overflow-hidden shadow-2xl backdrop-blur-3xl">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-white/5">
            {/* Header Row (Hidden on mobile) */}
            <div className="hidden md:contents font-mono text-[10px] text-muted-foreground uppercase tracking-widest bg-black/80">
              <div className="p-4 px-6">KİMLİK</div>
              <div className="p-4 px-6 md:col-span-2">GÖREV</div>
              <div className="p-4 px-6">SİSTEM YÜKÜ</div>
              <div className="p-4 px-6 text-right">DURUM</div>
            </div>

            {/* Agent Rows */}
            {AGENTS.map((agent) => (
              <div key={agent.id} className="contents group">
                {/* Mobile View Card Structure inside CSS Grid */}
                <div className="bg-[#0a0a0a] p-6 md:p-4 md:px-6 flex items-center md:hidden border-b border-white/5 relative overflow-hidden">
                  <div className="w-full flex justify-between items-center z-10">
                    <div>
                      <div className="text-[10px] text-primary font-mono mb-1">{agent.id}</div>
                      <div className="text-lg font-bold text-white uppercase">{agent.name}</div>
                      <div className="text-xs text-muted-foreground">{agent.type}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[10px] font-bold px-3 py-1 rounded-sm border inline-block ${agent.status === 'AKTİF' ? 'bg-primary/20 text-primary border-primary/50 text-glow' : 'bg-white/10 text-white/60 border-white/20'}`}>
                        {agent.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop View Table Structure */}
                <div className="hidden md:flex bg-[#0a0a0a] group-hover:bg-[#111] transition-colors p-4 px-6 items-center border-b border-white/5">
                  <span className="font-mono text-xs text-primary/70">{agent.id}</span>
                </div>
                <div className="hidden md:flex bg-[#0a0a0a] md:col-span-2 group-hover:bg-[#111] transition-colors p-4 px-6 items-center gap-4 border-b border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                    <agent.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white tracking-tight text-lg uppercase">{agent.name}</h3>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase">{agent.type}</p>
                  </div>
                </div>
                <div className="hidden md:flex bg-[#0a0a0a] group-hover:bg-[#111] transition-colors p-4 px-6 items-center border-b border-white/5">
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full shadow-[0_0_10px_rgba(255,0,0,0.8)]" style={{ width: agent.load }} />
                  </div>
                  <span className="font-mono text-xs font-bold text-white ml-4 w-10 text-right">{agent.load}</span>
                </div>
                <div className="hidden md:flex bg-[#0a0a0a] group-hover:bg-[#111] transition-colors p-4 px-6 items-center justify-end border-b border-white/5">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border rounded-sm ${
                    agent.status === 'AKTİF' || agent.status === 'GÜVENLİ' 
                      ? 'bg-primary/10 text-primary border-primary/40 shadow-[0_0_15px_rgba(255,0,0,0.2)]'
                      : 'bg-white/5 text-muted-foreground border-white/10'
                  }`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            ))}

            {/* Add Node Button Block */}
            <div className="bg-[#050505] p-6 md:p-4 md:col-span-5 flex justify-center items-center group cursor-pointer hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-3 font-mono text-xs text-primary/60 group-hover:text-primary transition-colors tracking-widest uppercase">
                <span className="text-xl">+</span> YENİ SİNİR AĞI DÜĞÜMÜ BAŞLAT
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
