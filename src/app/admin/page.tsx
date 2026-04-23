'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User, FileSearch, Zap, Terminal } from 'lucide-react';
import DashboardOverview from '@/components/admin/DashboardOverview';
import EconomyEngineGraph from '@/components/admin/EconomyEngineGraph';
import DlqManager from '@/components/admin/DlqManager';
import DomainHealthMonitor from '@/components/admin/DomainHealthMonitor';
import LeadIntelligencePanel from '@/components/admin/LeadIntelligencePanel';
import { MediaLibrary } from '@/components/admin/MediaLibrary';
import KnowledgeTrainer from '@/components/admin/KnowledgeTrainer';
import HometexDashboard from '@/components/node-hometex/HometexDashboard';
import MarketplaceEngine from '@/components/node-vorhang/MarketplaceEngine';

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

  const executeCommand = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    
    const userText = customText || input;
    if (!userText.trim() && files.length === 0) return;

    const attachments = files.map(f => f.name);

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
      let widgetType = data.widgetType || undefined;

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
    if (type === 'network') return <div className="mt-4"><DomainHealthMonitor /></div>;
    if (type === 'leads') return <div className="mt-4 w-full h-[600px] overflow-y-auto"><LeadIntelligencePanel /></div>;
    if (type === 'media') return <div className="mt-4 w-full h-[600px] overflow-y-auto"><MediaLibrary initialAssets={[]} /></div>;
    if (type === 'trainer') return <div className="mt-4"><KnowledgeTrainer /></div>;
    if (type === 'hometex') return <div className="mt-4"><HometexDashboard /></div>;
    if (type === 'vorhang') return <div className="mt-4"><MarketplaceEngine /></div>;
    return null;
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto">
      
      {/* SOHBET GEÇMİŞİ (CHAT AREA) */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 pb-32 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'system' ? (
              <div className="w-full text-center py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                --- {msg.content} ---
              </div>
            ) : (
              <div className={`max-w-[90%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-md ${msg.role === 'user' ? 'bg-slate-100 border border-slate-200' : 'bg-indigo-600 shadow-sm'}`}>
                  {msg.role === 'user' ? <User size={16} className="text-slate-500"/> : <Bot size={16} className="text-slate-900"/>}
                </div>
                
                {/* Mesaj İçeriği */}
                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="text-xs font-semibold text-slate-400 mb-1 tracking-wider uppercase">
                    {msg.role === 'user' ? 'YÖNETİCİ' : 'ALOHA SİSTEMİ'}
                  </div>
                  
                  <div className="text-sm text-slate-700 font-sans leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-lg border border-slate-200 shadow-sm w-full">
                    {msg.content}
                    
                    {/* Generative UI (Dinamik Bileşenler) */}
                    {msg.widgetType && renderWidget(msg.widgetType)}
                  </div>

                  {/* Dosya Ekleri */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {msg.attachments.map((file, i) => (
                        <div key={i} className="flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-500">
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
                <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-md bg-indigo-600 shadow-sm">
                  <Bot size={16} className="text-slate-900 animate-pulse"/>
                </div>
                <div className="flex flex-col items-start">
                  <div className="text-xs font-semibold text-slate-400 mb-1 tracking-wider uppercase">ALOHA SİSTEMİ</div>
                  <div className="text-sm text-slate-500 font-medium bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                    <span>Sistem işliyor</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                    </span>
                  </div>
                </div>
              </div>
          </div>
        )}
      </div>

      {/* GİRDİ ALANI (INPUT BAR) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pointer-events-none flex justify-center">
        <div className="w-full max-w-4xl bg-white border border-slate-200 shadow-xl p-2 pointer-events-auto rounded-xl">
          
          {/* Mod Seçici ve Hızlı Komutlar */}
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="flex gap-2">
              <button onClick={() => setMode('chat')} className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors flex items-center gap-2 ${mode === 'chat' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent'}`}>
                <Terminal size={14} /> Sohbet
              </button>
              <button onClick={() => setMode('analysis')} className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors flex items-center gap-2 ${mode === 'analysis' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent'}`}>
                <FileSearch size={14} /> Analiz
              </button>
              <button onClick={() => setMode('action')} className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors flex items-center gap-2 ${mode === 'action' ? 'bg-red-50 text-red-700 border border-red-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent'}`}>
                <Zap size={14} /> Sistem Emri
              </button>
            </div>
            
            {/* Hızlı Emir Çipleri (Prompt Starters) */}
            <div className="flex gap-2">
              <button 
                onClick={(e) => executeCommand(e, 'Canlı ekonomiyi çiz')}
                className="text-xs font-semibold tracking-wider text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 transition-colors"
              >
                [⚡ EKONOMİ]
              </button>
              <button 
                onClick={(e) => executeCommand(e, 'Hata analizi yap')}
                className="text-xs font-semibold tracking-wider text-red-600 hover:bg-red-50 px-2 py-1 rounded-md border border-red-200 transition-colors"
              >
                [⚠ HATALAR]
              </button>
              <button 
                onClick={(e) => executeCommand(e, 'Sistem durumunu göster')}
                className="text-xs font-semibold tracking-wider text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200 transition-colors"
              >
                [◱ SİSTEM]
              </button>
            </div>
          </div>

          {/* Dosya Önizleme */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 px-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-600">
                  <span>{file.name}</span>
                  <button type="button" onClick={() => removeFile(index)} className="text-slate-400 hover:text-red-500">×</button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={executeCommand} className="relative flex items-center">
            <label className="absolute left-3 p-2 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors">
              <Paperclip size={18} />
              <input type="file" multiple className="hidden" onChange={handleFileChange} />
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Sisteme bir talimat verin veya veri isteyin... (Örn: Sistem durumunu göster)"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-4 pl-12 pr-14 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
            />
            <button 
              type="submit" 
              disabled={!input.trim() && files.length === 0} 
              className={`absolute right-2 p-2 rounded-md transition-colors ${!input.trim() && files.length === 0 ? 'text-slate-300 bg-transparent' : 'bg-indigo-600 text-slate-900 hover:bg-indigo-700 shadow-sm'}`}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
