"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Activity, BrainCircuit, ShieldCheck, Download, BarChart2, PieChart } from "lucide-react";
import { useTranslations } from "next-intl";

interface VisualData {
  chart_type: string;
  labels: string[];
  series: any[];
}

interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
  visualData?: VisualData;
}

export default function MasterConcierge() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "agent",
      text: "AIPyram Sovereign Ağı'na hoş geldiniz. Ben Master Concierge. Yatırım portföyümüz, tekstil ekosistemi veya otonom sistemlerimiz hakkında detaylı analitik rapor isteyebilirsiniz.",
      visualData: {
        chart_type: "pie",
        labels: ["TRTEX.com", "Perde.ai", "Hometex.ai", "Vorhang.ai"],
        series: [{ name: "Ecosystem Share", data: [40, 30, 20, 10], color: "#00FFA3" }]
      }
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeVisual, setActiveVisual] = useState<VisualData | null>(messages[0].visualData || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Mocking the agent response for UI demonstration of the Visual Deck
      setTimeout(() => {
        let responseText = "Gelişmiş Sovereign veri ağı üzerinden talebiniz incelendi.";
        let vData: VisualData | undefined;

        if (userMsg.text.toLowerCase().includes("yatırım") || userMsg.text.toLowerCase().includes("portföy")) {
          responseText = "Tekstil portföyümüz 2026 projeksiyonunda %40 pazar payı hedeflemektedir. Güncel büyüme trendimiz ektedir.";
          vData = {
            chart_type: "line",
            labels: ["Q1", "Q2", "Q3", "Q4"],
            series: [{ name: "Growth", data: [12, 18, 25, 40], color: "#00FFA3" }]
          };
        } else if (userMsg.text.toLowerCase().includes("perde") || userMsg.text.toLowerCase().includes("hometex")) {
          responseText = "Perde.ai B2B sipariş motorumuz son çeyrekte 1500+ yetkili satıcıya ulaşmıştır. Kategori bazlı dağılımı sağda görebilirsiniz.";
          vData = {
            chart_type: "bar",
            labels: ["Blackout", "Zebra", "Fon", "Motorlu"],
            series: [{ name: "Sipariş (Adet)", data: [450, 320, 280, 150], color: "#3B82F6" }]
          };
        }

        const agentMsg: Message = {
          id: Date.now().toString() + "-agent",
          role: "agent",
          text: responseText,
          visualData: vData
        };

        setMessages((prev) => [...prev, agentMsg]);
        if (vData) setActiveVisual(vData);
        setIsTyping(false);
      }, 1500);

    } catch (error) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "agent", text: "Ağa bağlanılamadı." }]);
      setIsTyping(false);
    }
  };

  const renderVisual = () => {
    if (!activeVisual) return <div className="text-zinc-600 flex items-center justify-center h-full">Görsel Veri Bekleniyor...</div>;

    return (
      <div className="flex flex-col h-full bg-black border border-white/10 p-6 relative rounded-lg">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="text-[#00FFA3] w-5 h-5" />
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-300">Live Telemetry</span>
          </div>
          <Badge text="AIPyram Verified" />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Simple CSS-based Mock Charts for brutalist effect */}
          {activeVisual.chart_type === "pie" && (
            <div className="relative w-48 h-48 rounded-full border-4 border-zinc-800 flex items-center justify-center" style={{ background: 'conic-gradient(#00FFA3 0% 40%, #3B82F6 40% 70%, #F59E0B 70% 90%, #6366F1 90% 100%)' }}>
               <div className="w-32 h-32 bg-black rounded-full flex items-center justify-center font-mono text-xl text-white">40%</div>
            </div>
          )}
          
          {activeVisual.chart_type === "line" && (
            <div className="w-full h-48 flex items-end justify-between px-4 gap-2">
               {activeVisual.series[0].data.map((val: number, i: number) => (
                 <div key={i} className="w-16 bg-[#00FFA3]/20 relative group transition-all" style={{ height: `${val * 2}%` }}>
                    <div className="absolute top-0 w-full h-1 bg-[#00FFA3]"></div>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">{val}%</span>
                 </div>
               ))}
            </div>
          )}

          {activeVisual.chart_type === "bar" && (
            <div className="w-full h-48 flex items-end justify-between px-4 gap-4">
               {activeVisual.series[0].data.map((val: number, i: number) => (
                 <div key={i} className="flex-1 bg-[#3B82F6] hover:bg-[#60A5FA] transition-colors relative" style={{ height: `${val / 5}%` }}>
                    <span className="absolute -bottom-6 w-full text-center text-[10px] font-mono text-zinc-500">{activeVisual.labels[i]}</span>
                 </div>
               ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-between items-center text-[10px] font-mono text-zinc-500 border-t border-white/10 pt-4">
          <span>Data Trust Score: 0.98</span>
          <button className="hover:text-white transition flex items-center gap-1"><Download className="w-3 h-3" /> EXPORT CSV</button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-[600px] flex flex-col md:flex-row bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
      
      {/* LEFT: CHAT PANEL */}
      <div className="w-full md:w-1/2 flex flex-col border-r border-white/5">
        <div className="p-4 bg-black border-b border-white/5 flex items-center gap-3">
          <BrainCircuit className="text-blue-500 w-5 h-5" />
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white">Master Concierge</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-4 text-sm font-sans leading-relaxed ${m.role === "user" ? "bg-white text-black rounded-l-2xl rounded-tr-2xl font-medium" : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-r-2xl rounded-tl-2xl"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 p-4 rounded-r-2xl rounded-tl-2xl flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse text-blue-500" /> Analiz ediliyor...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-black border-t border-white/5">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Yatırım portföyü veya pazar analizi isteyin..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full px-6 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 font-mono transition"
            />
            <button type="submit" disabled={isTyping || !input.trim()} className="absolute right-2 p-2 bg-white text-black rounded-full hover:bg-zinc-200 transition disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT: VISUAL DECK */}
      <div className="w-full md:w-1/2 bg-[#050505] p-6 hidden md:block">
        {renderVisual()}
      </div>
      
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[9px] font-mono uppercase tracking-widest text-green-400">
      <ShieldCheck className="w-3 h-3" />
      {text}
    </div>
  );
}
