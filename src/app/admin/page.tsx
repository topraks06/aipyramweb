'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User, FileSearch, Zap, Terminal } from 'lucide-react';
import DashboardOverview from '@/components/admin/DashboardOverview';
import EconomyEngineGraph from '@/components/admin/EconomyEngineGraph';
import DlqManager from '@/components/admin/DlqManager';

type CommandMode = 'chat' | 'analysis' | 'action';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: string[];
  mode?: CommandMode;
  widgetType?: string; // e.g. 'dashboard', 'economy', 'dlq'
}

export default function MasterKokpit() {
  const [mode, setMode] = useState<CommandMode>('chat');
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system-init',
      role: 'system',
      content: `ALOHA SOVEREIGN AĞI BAŞLATILDI. HOŞ GELDİNİZ. SİSTEM EMİRLERİNİZİ BEKLİYOR.`
    }
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles].slice(0, 3));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const executeCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && files.length === 0) return;

    const attachments = files.map(f => f.name);
    const userText = input;

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      attachments: attachments.length > 0 ? attachments : undefined,
      mode
    }]);

    setInput('');
    setFiles([]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/aloha/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: userText })
      });

      const data = await res.json();
      setIsTyping(false);

      let finalContent = data.alohaResponse || "Anlaşılamadı.";
      let widgetType = undefined;

      // Özel komut algılama (Generative UI simülasyonu)
      const lowercaseText = userText.toLowerCase();
      if (lowercaseText.includes('sistem') || lowercaseText.includes('durum')) {
        widgetType = 'dashboard';
      } else if (lowercaseText.includes('ekonomi') || lowercaseText.includes('kredi')) {
        widgetType = 'economy';
      } else if (lowercaseText.includes('hata') || lowercaseText.includes('dlq')) {
        widgetType = 'dlq';
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: finalContent,
        mode,
        widgetType
      }]);
    } catch (err: any) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `SİSTEM HATASI: ${err.message}`,
        mode
      }]);
    }
  };

  // Dinamik Widget Render Fonksiyonu
  const renderWidget = (type?: string) => {
    if (type === 'dashboard') return <div className="mt-4"><DashboardOverview /></div>;
    if (type === 'economy') return <div className="mt-4"><EconomyEngineGraph /></div>;
    if (type === 'dlq') return <div className="mt-4"><DlqManager /></div>;
    return null;
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto">
      
      {/* SOHBET GEÇMİŞİ (CHAT AREA) */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'system' ? (
              <div className="w-full text-center py-4 text-xs font-mono text-zinc-500 tracking-widest uppercase">
                --- {msg.content} ---
              </div>
            ) : (
              <div className={`max-w-[90%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded ${msg.role === 'user' ? 'bg-zinc-800' : 'bg-blue-600'}`}>
                  {msg.role === 'user' ? <User size={16} className="text-zinc-300"/> : <Bot size={16} className="text-white"/>}
                </div>
                
                {/* Mesaj İçeriği */}
                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="text-[10px] font-mono text-zinc-500 mb-1 tracking-widest uppercase">
                    {msg.role === 'user' ? 'YÖNETİCİ' : 'ALOHA SİSTEMİ'}
                  </div>
                  
                  <div className="text-sm text-zinc-200 font-mono leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-md border border-white/10 w-full">
                    {msg.content}
                    
                    {/* Generative UI (Dinamik Bileşenler) */}
                    {msg.widgetType && renderWidget(msg.widgetType)}
                  </div>

                  {/* Dosya Ekleri */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {msg.attachments.map((file, i) => (
                        <div key={i} className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-zinc-400">
                          <Paperclip size={12} />
                          <span>{file}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex flex-col items-start">
             <div className="max-w-[90%] flex gap-4">
                <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded bg-blue-600">
                  <Bot size={16} className="text-white animate-pulse"/>
                </div>
                <div className="flex flex-col items-start">
                  <div className="text-[10px] font-mono text-zinc-500 mb-1 tracking-widest uppercase">ALOHA SİSTEMİ</div>
                  <div className="text-sm text-zinc-400 font-mono bg-white/5 p-4 rounded-md border border-white/10 flex items-center gap-2">
                    <span>Sistem işliyor</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-150"></span>
                    </span>
                  </div>
                </div>
              </div>
          </div>
        )}
      </div>

      {/* GİRDİ ALANI (INPUT BAR) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent pointer-events-none flex justify-center">
        <div className="w-full max-w-4xl bg-[#0A0A0A] border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-2 pointer-events-auto rounded">
          
          {/* Mod Seçici */}
          <div className="flex gap-2 mb-2 px-2">
            <button onClick={() => setMode('chat')} className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2 ${mode === 'chat' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <Terminal size={12} /> Sohbet
            </button>
            <button onClick={() => setMode('analysis')} className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2 ${mode === 'analysis' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <FileSearch size={12} /> Analiz
            </button>
            <button onClick={() => setMode('action')} className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2 ${mode === 'action' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <Zap size={12} /> Sistem Emri
            </button>
          </div>

          {/* Dosya Önizleme */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 px-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-zinc-300">
                  <span>{file.name}</span>
                  <button type="button" onClick={() => removeFile(index)} className="text-zinc-500 hover:text-red-400">×</button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={executeCommand} className="relative flex items-center">
            <label className="absolute left-3 p-2 text-zinc-500 hover:text-white cursor-pointer transition-colors">
              <Paperclip size={18} />
              <input type="file" multiple className="hidden" onChange={handleFileChange} />
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Sisteme bir talimat verin veya veri isteyin... (Örn: Sistem durumunu göster)"
              className="w-full bg-transparent border-none py-4 pl-12 pr-14 text-sm text-white placeholder:text-zinc-600 focus:outline-none font-mono"
            />
            <button 
              type="submit" 
              disabled={!input.trim() && files.length === 0} 
              className={`absolute right-2 p-2 rounded transition-colors ${!input.trim() && files.length === 0 ? 'text-zinc-700 bg-transparent' : 'bg-white text-black hover:bg-zinc-200'}`}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
