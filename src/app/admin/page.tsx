'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase-client';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import {
  Hexagon, ShieldAlert, Mic, CheckCircle, Shield, Orbit, Activity,
  Paperclip, Volume2, VolumeX, Send
} from 'lucide-react';

interface AgentMessage {
  id: string;
  project: string;
  type: string;
  time: string;
  content: string;
  agentId: string;
  priority: 'YÜKSEK' | 'ORTA' | 'DÜŞÜK';
  priorityColor: string;
  badgeBg: string;
}

interface ChatMessage {
  role: 'user' | 'aloha';
  content: string;
  time: string;
  attachments?: string[];
}

export default function AetherOSMasterKokpit() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatActive, setChatActive] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // 1. Firebase Bağlantısı (Agent Inbox'ı Canlıya Alma)
  useEffect(() => {
    const q = query(collection(db, 'aloha_inbox'), orderBy('created_at', 'desc'), limit(15));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: AgentMessage[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        let timeStr = '';
        if (data.created_at) {
          const date = data.created_at.toDate ? data.created_at.toDate() : new Date(data.created_at);
          timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        }

        let priority: 'YÜKSEK' | 'ORTA' | 'DÜŞÜK' = 'ORTA';
        let priorityColor = 'text-amber-400';
        let badgeBg = 'bg-amber-500/10 border-amber-500/20';

        if (data.status === 'PENDING_APPROVAL') {
          priority = 'YÜKSEK'; priorityColor = 'text-rose-400'; badgeBg = 'bg-rose-500/10 border-rose-500/20';
        } else if (data.status === 'RESOLVED') {
          priority = 'DÜŞÜK'; priorityColor = 'text-emerald-400'; badgeBg = 'bg-emerald-500/10 border-emerald-500/20';
        }

        msgs.push({
          id: doc.id,
          project: data.project ? data.project.toUpperCase() : 'SİSTEM',
          type: data.task_type ? data.task_type.toUpperCase() : 'SİNYAL',
          time: timeStr,
          content: data.reason || (data.data && data.data.task ? data.data.task : 'Otonom işlem detayı bulunmuyor.'),
          agentId: data.agent_id || 'ALOHA_CORE',
          priority,
          priorityColor,
          badgeBg
        });
      });

      if (msgs.length === 0) {
        setMessages([
          {
            id: 'mock1', project: 'SİSTEM', type: 'DURUM', time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            content: 'Firebase aloha_inbox şu an boş. Otonom ajanlardan yeni bir onay beklemiyor.', agentId: 'ALOHA',
            priority: 'DÜŞÜK', priorityColor: 'text-emerald-400', badgeBg: 'bg-emerald-500/10 border-emerald-500/20'
          }
        ]);
      } else {
        setMessages(msgs);
      }
    }, (error) => {
      console.error("Firebase dinleme hatası:", error);
    });

    return () => unsubscribe();
  }, []);

  // 2. Chat API Bağlantısı (Doğal Dil Komutunu LLM'e gönderme)
  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (!chatActive) setChatActive(true);

    const currentInput = inputText;
    const userMsg: ChatMessage = {
      role: 'user',
      content: currentInput,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setInputText('');

    try {
      const res = await fetch('/api/brain/v1/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'sk_aipyram_master_71',
          'x-project': 'aipyram'
        },
        body: JSON.stringify({
          task: currentInput,
          userId: 'master_hakan',
          mode: 'fast' // LLM hızlı yanıt modunda
        })
      });

      const data = await res.json();
      if (data.success) {
        let aiResponse = "İşlem tamamlandı.";
        if (data.data?.finalDecision?.result) {
          try {
            const parsed = JSON.parse(data.data.finalDecision.result);
            aiResponse = parsed.message || parsed.response || parsed.text || data.data.finalDecision.result;
          } catch (e) {
            aiResponse = data.data.finalDecision.result;
          }
        }

        setChatHistory(prev => [...prev, {
          role: 'aloha',
          content: aiResponse,
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        setChatHistory(prev => [...prev, {
          role: 'aloha',
          content: 'Hata: ' + (data.error || 'Bilinmeyen bir iletişim hatası oluştu.'),
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err: any) {
      setChatHistory(prev => [...prev, {
        role: 'aloha',
        content: 'Sunucu ile bağlantı koptu. Hata: ' + err.message,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  return (
    // ROOT KAPSAYICI - Tam Siyah, Anti-aliased, Kesinlikle Taşmaz
    <div className="fixed inset-0 bg-black antialiased flex items-center justify-center font-sans overflow-hidden">

      {/* 
        PREMIUM B2B HUD EKRANI
        Sadece ince gradient'ler ve noise tekstürü ile uzay derinliği.
      */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-black to-black opacity-80"></div>

      {/* ÇOK İNCE MİMARİ IZGARA (Subtle Grid) */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEi fillPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9zdmc+')] pointer-events-none"></div>

      {/* ANA EKRAN İSKELETİ */}
      <div className="relative w-[98vw] h-[96vh] flex flex-col justify-between p-4 lg:p-6">

        {/* ========================================
            ÜST BİLGİ ÇUBUĞU (HEADER)
            ======================================== */}
        <header className="flex justify-between items-start w-full relative shrink-0">

          {/* Sol: Logo */}
          <div className="flex flex-col z-20 relative">
            <h1 className="text-xl lg:text-2xl font-light tracking-[0.3em] text-white cursor-pointer" onClick={() => setChatActive(false)}>AETHER<span className="font-bold">OS</span></h1>
            <p className="text-[9px] lg:text-[10px] font-mono tracking-[0.4em] text-slate-500 uppercase mt-1">Sovereign Command</p>
          </div>

          {/* Orta: Sistem Modu ve Lazer Çizgi */}
          <div className="flex flex-col items-center z-20 relative">
            <span className="text-[8px] font-bold tracking-[0.5em] text-slate-500 uppercase">Sistem Modu</span>
            <span className="text-sm lg:text-base font-bold tracking-[0.5em] text-cyan-400 mt-1 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">NORMAL</span>

            {/* Jilet Keskinliğinde Çizgi */}
            <div className="mt-3 w-[200px] lg:w-[300px] flex items-center justify-center opacity-70">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              <div className="absolute w-12 h-px bg-cyan-300 shadow-[0_0_10px_#22d3ee]"></div>
            </div>
          </div>

          {/* Sağ: Yönetici Profili */}
          <div className="flex items-center gap-4 z-20 relative">
            <div className="flex flex-col items-end">
              <span className="text-[10px] lg:text-xs font-bold tracking-[0.2em] text-slate-200">HAKAN</span>
              <span className="text-[8px] lg:text-[9px] font-mono tracking-[0.3em] text-amber-500/70 mt-0.5">MASTER NODE</span>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-amber-500/30 flex items-center justify-center bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
              <Shield className="text-amber-500 w-4 h-4 lg:w-5 lg:h-5" strokeWidth={1.5} />
            </div>
          </div>
        </header>


        {/* ========================================
            ORTA ALAN (PANELS & CORE / CHAT)
            ======================================== */}
        <main className="flex-1 w-full flex justify-between items-center relative z-10 px-0 lg:px-2 min-h-0 mt-4 lg:mt-6">

          {/* ----- SOL PANEL: AGENT INBOX ----- */}
          <div className={`w-[300px] lg:w-[360px] h-full flex flex-col relative transition-opacity duration-700 ${chatActive ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[12px] border border-white/[0.05] rounded-[24px]"></div>

            <div className="relative z-10 p-5 lg:p-6 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <Hexagon size={16} strokeWidth={2} className="text-cyan-400" />
                <div className="flex flex-col">
                  <h2 className="text-[10px] lg:text-xs font-bold tracking-[0.3em] text-white">AGENT INBOX</h2>
                  <span className="text-[8px] lg:text-[9px] font-mono text-slate-500 tracking-[0.2em] mt-0.5">OTONOM KARAR AKIŞI</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {messages.map((msg) => (
                  <div key={msg.id} className="w-full bg-black/40 border border-white/[0.03] rounded-2xl flex flex-col hover:border-cyan-500/30 transition-colors group">
                    <div className="flex w-full h-full p-4">
                      {/* Sol Sütun */}
                      <div className="mr-4 mt-1">
                        <Hexagon size={20} strokeWidth={1} className="text-slate-600 group-hover:text-cyan-500/50 transition-colors" />
                      </div>
                      {/* Sağ Sütun */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] lg:text-[10px] font-bold text-slate-300 tracking-wider">{msg.project}</span>
                          <span className="text-[8px] lg:text-[9px] text-slate-600 font-mono">{msg.time}</span>
                        </div>
                        <p className="text-[10px] lg:text-[11px] text-slate-400 leading-relaxed mb-4 font-light">
                          {msg.content}
                        </p>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[8px] lg:text-[9px] font-mono text-slate-500 tracking-widest">{msg.agentId}</span>
                          <span className={`text-[8px] font-bold tracking-widest px-2 py-0.5 rounded-full border ${msg.badgeBg} ${msg.priorityColor}`}>{msg.priority}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 bg-cyan-950/40 border border-cyan-800/50 text-cyan-400 text-[9px] font-bold tracking-[0.2em] py-2 rounded-lg hover:bg-cyan-900 transition-colors">
                            ONAYLA
                          </button>
                          <button className="flex-1 bg-transparent border border-white/5 text-slate-500 text-[9px] font-bold tracking-[0.2em] py-2 rounded-lg hover:text-white hover:border-white/20 transition-colors">
                            REDDET
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ----- ORTA BÖLÜM: HOLOGRAFİK ZEKÂ VEYA SOHBET AKIŞI ----- */}
          <div className="flex-1 flex flex-col items-center justify-center relative h-full min-w-0 transition-all duration-700">

            {/* KÜRE (Chat aktifse küçülüp sağ üste gider ve silikleşir) */}
            <div className={`transition-all duration-1000 absolute ${chatActive ? 'top-[-50px] right-[20%] scale-50 opacity-10 pointer-events-none' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-100 opacity-100'} w-[30vh] lg:w-[45vh] max-w-[400px] aspect-square flex items-center justify-center z-0`}>
              <div className="absolute w-[200px] h-[200px] bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none"></div>
              {/* Dış Lazer Halka */}
              <svg className="absolute w-[95%] h-[95%] animate-[spin_40s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="0.2" strokeDasharray="2 6" />
              </svg>
              {/* Orta Halka (Ters) */}
              <svg className="absolute w-[80%] h-[80%] animate-[spin_25s_linear_infinite_reverse]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="30 15 1 15" />
              </svg>
              {/* Çekirdek */}
              <div className="w-[30%] h-[30%] rounded-full bg-white/[0.01] backdrop-blur-md border border-cyan-500/20 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)] flex items-center justify-center z-10">
                <Orbit size={24} strokeWidth={1} className="text-cyan-400/50" />
              </div>
              {/* Metrik */}
              <div className={`absolute bottom-2 lg:bottom-10 flex flex-col items-center transition-opacity duration-500 ${chatActive ? 'opacity-0' : 'opacity-100'}`}>
                <div className="text-5xl lg:text-7xl font-light text-white tracking-[0.1em] font-mono opacity-90">94</div>
                <div className="text-[9px] lg:text-[10px] font-bold text-cyan-500 uppercase tracking-[0.6em] mt-2 lg:mt-4">AKTİF AJAN</div>
                <div className="text-[8px] lg:text-[9px] font-mono text-slate-600 uppercase tracking-[0.4em] mt-2 border-t border-white/5 pt-2 w-32 lg:w-48 text-center">ÇEVRİMİÇİ</div>
              </div>
            </div>

            {/* SOHBET AKIŞI (Chat aktifse görünür) */}
            <div className={`w-full max-w-4xl h-full flex flex-col transition-all duration-700 z-10 relative ${chatActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none absolute'}`}>

              {/* Chat History View */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 space-y-6 flex flex-col pb-32">
                {chatHistory.length === 0 && (
                  <div className="m-auto text-center opacity-50 flex flex-col items-center">
                    <Orbit size={40} className="text-cyan-500 mb-4 animate-[spin_10s_linear_infinite]" />
                    <span className="text-slate-400 font-mono tracking-widest text-xs uppercase">AETHER OS DİNLİYOR...</span>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[9px] font-bold tracking-[0.2em] ${msg.role === 'user' ? 'text-amber-500' : 'text-cyan-500'}`}>{msg.role === 'user' ? 'HAKAN' : 'ALOHA'}</span>
                        <span className="text-[8px] font-mono text-slate-600">{msg.time}</span>
                      </div>
                      <div className={`p-4 lg:p-5 rounded-2xl text-[12px] lg:text-[13px] leading-relaxed font-light backdrop-blur-md border ${msg.role === 'user' ? 'bg-amber-950/20 border-amber-500/20 text-amber-50 rounded-tr-sm' : 'bg-cyan-950/20 border-cyan-500/20 text-cyan-50 rounded-tl-sm'}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ----- SAĞ PANEL: EKONOMİ MOTORU ----- */}
          <div className={`w-[300px] lg:w-[360px] h-full flex flex-col relative transition-opacity duration-700 ${chatActive ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-[12px] border border-white/[0.05] rounded-[24px]"></div>

            <div className="relative z-10 p-5 lg:p-6 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <Activity size={16} strokeWidth={2} className="text-emerald-400" />
                <div className="flex flex-col">
                  <h2 className="text-[10px] lg:text-xs font-bold tracking-[0.3em] text-white">EKONOMİ MOTORU</h2>
                  <span className="text-[8px] lg:text-[9px] font-mono text-slate-500 tracking-[0.2em] mt-0.5">SİSTEM KAYNAK YÖNETİMİ</span>
                </div>
              </div>

              <div className="mb-6 lg:mb-8">
                <span className="text-[8px] lg:text-[9px] font-mono text-slate-500 tracking-[0.3em] uppercase">PERFORMANS PAYI</span>
                <div className="flex items-end gap-3 mt-2 lg:mt-3">
                  <span className="text-4xl lg:text-5xl font-light text-emerald-400 font-mono">%10</span>
                  <div className="flex flex-col pb-1">
                    <span className="text-[8px] lg:text-[9px] font-bold text-slate-300 tracking-widest uppercase">BÜTÇE İYİLEŞTİRMESİ</span>
                    <span className="text-[8px] lg:text-[9px] font-mono text-emerald-500/70 tracking-widest uppercase mt-0.5">VERİM ONAYLANDI</span>
                  </div>
                </div>
              </div>

              {/* Keskin Çizgi Grafik */}
              <div className="h-24 lg:h-32 w-full relative mb-6">
                <div className="absolute inset-0 flex flex-col justify-between">
                  <div className="w-full h-px bg-white/[0.03]"></div>
                  <div className="w-full h-px bg-white/[0.03]"></div>
                  <div className="w-full h-px bg-white/[0.03]"></div>
                  <div className="w-full h-px bg-white/[0.03]"></div>
                </div>

                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M 0,90 Q 20,85 30,70 T 50,40 T 70,50 T 90,20 T 100,10" fill="none" stroke="#34d399" strokeWidth="1.5" opacity="0.8" />
                </svg>

                <div className="absolute -bottom-5 left-0 w-full flex justify-between text-[8px] text-slate-600 font-mono tracking-widest">
                  <span>00H</span><span>06H</span><span>12H</span><span>18H</span><span>24H</span>
                </div>
              </div>

              {/* Veri Dağılım Listesi */}
              <div className="flex-1 space-y-3 lg:space-y-4 mt-6">
                {[
                  { name: 'PERDE.AI', cost: '12,430', pct: '%35', dot: 'bg-cyan-400' },
                  { name: 'TRTEX', cost: '9,210', pct: '%26', dot: 'bg-purple-400' },
                  { name: 'HOMETEX.AI', cost: '7,890', pct: '%22', dot: 'bg-emerald-400' },
                  { name: 'VORHANG', cost: '5,120', pct: '%17', dot: 'bg-slate-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`}></div>
                      <span className="text-[10px] lg:text-[11px] text-slate-300 font-medium tracking-[0.15em]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-[10px] lg:text-[11px] text-slate-400 font-mono"><span className="text-slate-600 mr-1">$</span>{item.cost}</span>
                      <span className="text-[9px] text-slate-600 font-mono w-6 text-right">{item.pct}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-5 border-t border-white/[0.05] flex items-end justify-between">
                <span className="text-[9px] font-mono text-slate-500 tracking-[0.3em] uppercase">GÜNLÜK HARCAMA</span>
                <div className="text-lg lg:text-xl font-light text-white font-mono tracking-wider"><span className="text-slate-600 mr-2">$</span>34,650</div>
              </div>

            </div>
          </div>
        </main>


        {/* ========================================
            ALT KAPSÜLLER (HUD MODULES) & KOMUT SATIRI
            ======================================== */}
        <footer className="w-full h-[80px] shrink-0 z-20 flex justify-between items-end gap-4 lg:gap-6 mt-4 lg:mt-6 relative">

          {/* ----- Sol Alt: Proje Düğümleri (Node Orbs) ----- */}
          <div className="w-[300px] lg:w-[360px] flex justify-start items-end gap-4 lg:gap-8 pb-2">
            {[
              { name: 'PERDE.AI', status: 'ONLİNE', color: 'text-cyan-400' },
              { name: 'TRTEX', status: 'ONLİNE', color: 'text-purple-400' },
              { name: 'HOMETEX.AI', status: 'ONLİNE', color: 'text-emerald-400' },
              { name: 'VORHANG', status: 'BEKLEMEDE', color: 'text-slate-500' }
            ].map((proj, idx) => (
              <div key={idx} className="flex flex-col items-center group cursor-pointer">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-white/[0.05] bg-white/[0.01] flex items-center justify-center group-hover:bg-white/[0.03] transition-colors">
                  <div className={`w-2 h-2 rounded-full bg-current ${proj.color} ${proj.status === 'ONLİNE' ? 'shadow-[0_0_10px_currentColor]' : ''}`}></div>
                </div>
                <span className="text-[9px] lg:text-[10px] font-bold text-slate-300 tracking-[0.2em] mt-3">{proj.name}</span>
                <span className={`text-[7px] lg:text-[8px] font-mono tracking-[0.3em] mt-1 ${proj.color}`}>{proj.status}</span>
              </div>
            ))}
          </div>

          {/* ----- Merkez: Sovereign Command Console (Devasa Chat Bar) ----- */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[600px] lg:w-[800px] bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(34,211,238,0.05)] p-2 lg:p-3 flex flex-col transition-all duration-300 focus-within:border-cyan-500/50 focus-within:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(34,211,238,0.15)] z-30">

            {/* Input ve Aksiyon Bölümü */}
            <div className="flex items-center w-full">

              {/* Ataş (Dosya / Resim Yükleme) */}
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors group relative">
                <Paperclip size={20} strokeWidth={1.5} />
                <span className="absolute -top-8 bg-black border border-white/10 text-[9px] px-2 py-1 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity font-mono tracking-widest whitespace-nowrap">DOSYA/RESİM EKLE</span>
              </button>

              {/* Ana Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="ALOHA'ya komut ver, dosya yükle veya sistemde ara..."
                className="flex-1 h-12 bg-transparent border-none text-xs lg:text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none tracking-wide px-4"
              />

              {/* Sağ Aksiyonlar */}
              <div className="flex items-center gap-1">

                {/* Hoparlör (Sesli Yanıt) */}
                <button onClick={() => setIsSpeakerOn(!isSpeakerOn)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors group relative">
                  {isSpeakerOn ? <Volume2 size={20} strokeWidth={1.5} className="text-cyan-500" /> : <VolumeX size={20} strokeWidth={1.5} />}
                  <span className="absolute -top-8 right-0 bg-black border border-white/10 text-[9px] px-2 py-1 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity font-mono tracking-widest whitespace-nowrap">SESLİ YANIT {isSpeakerOn ? 'AÇIK' : 'KAPALI'}</span>
                </button>

                {/* Mikrofon (Sesli Komut) */}
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/50 transition-colors group relative">
                  <Mic size={20} strokeWidth={1.5} />
                  <span className="absolute -top-8 right-0 bg-black border border-white/10 text-[9px] px-2 py-1 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity font-mono tracking-widest whitespace-nowrap">SESLİ KOMUT (BAS-KONUŞ)</span>
                </button>

                {/* Gönder Butonu */}
                <button onClick={handleSend} className={`w-12 h-12 ml-2 rounded-xl flex items-center justify-center transition-all duration-300 ${inputText.trim() ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]' : 'bg-white/5 text-slate-600'}`}>
                  <Send size={18} strokeWidth={2} />
                </button>

              </div>
            </div>

          </div>

          {/* ----- Sağ Alt: Sistem Özeti Kapsülü ----- */}
          <div className="w-[300px] lg:w-[360px] h-[60px] bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-[16px] flex items-center justify-between px-6 pb-1">
            <div className="flex items-center gap-3">
              <span className="text-xl lg:text-2xl font-light text-white font-mono">142</span>
              <span className="text-[7px] lg:text-[8px] font-bold text-slate-500 tracking-[0.3em] w-14 leading-tight">HABER<br />TARANDI</span>
            </div>
            <div className="w-px h-6 bg-white/[0.05]"></div>
            <div className="flex items-center gap-3">
              <span className="text-xl lg:text-2xl font-light text-white font-mono">12</span>
              <span className="text-[7px] lg:text-[8px] font-bold text-slate-500 tracking-[0.3em] w-14 leading-tight">RENDER<br />ALINDI</span>
            </div>
            <div className="w-px h-6 bg-white/[0.05]"></div>
            <CheckCircle size={16} className="text-cyan-500/70" />
          </div>

        </footer>

      </div>
    </div>
  );
}
