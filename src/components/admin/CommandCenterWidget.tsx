"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Bot, User, Terminal, FileSearch, Zap, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AipyramAuthProvider';

type CommandMode = 'chat' | 'analysis' | 'action';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: string[];
  mode?: CommandMode;
}

export default function CommandCenterWidget() {
  const { isAdmin, user } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<CommandMode>('chat');
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system-init',
      role: 'system',
      content: `SOVEREIGN OS INITIALIZED. WELCOME, ${user?.email?.split('@')[0].toUpperCase() || 'COMMANDER'}. AWAITING INSTRUCTIONS.`
    }
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Widget sadece Admin'e görünür
  if (!isAdmin) return null;

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full shadow-2xl flex items-center justify-center border border-white/20 transition-all hover:scale-105 group"
      >
        <div className="absolute inset-0 rounded-full bg-blue-500 blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
        <Terminal className="text-slate-900 relative z-10" size={24} />
      </button>
    );
  }

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

      let finalContent = data.alohaResponse || "Anlaşılamadı.";

      // Eğer widget verisi varsa detay ekle
      if (data.type === 'widget' && data.data) {
        finalContent += `\n\n[VERİ ONAYLANDI: ${JSON.stringify(data.data, null, 2)}]`;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: finalContent,
        mode
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `SİSTEM HATASI: ${err.message}`,
        mode
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] bg-slate-50 border border-slate-200 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col font-sans transition-all duration-300 ease-in-out ${isExpanded ? 'w-[800px] h-[80vh]' : 'w-[400px] h-[600px]'}`}>
      
      {/* HEADER */}
      <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 cursor-move">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-slate-900">SOVEREIGN COMMAND CENTER</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-500 hover:text-slate-900 transition-colors">
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-red-500 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* MODE SELECTOR */}
      <div className="flex bg-white border-b border-slate-100 shrink-0">
        <button 
          onClick={() => setMode('chat')}
          className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-widest border-b-2 transition-all flex items-center justify-center gap-2 ${mode === 'chat' ? 'border-blue-500 text-blue-600 bg-blue-500/5' : 'border-transparent text-zinc-600 hover:text-slate-600'}`}
        >
          <Terminal size={12} /> CHAT
        </button>
        <button 
          onClick={() => setMode('analysis')}
          className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-widest border-b-2 transition-all flex items-center justify-center gap-2 ${mode === 'analysis' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-zinc-600 hover:text-slate-600'}`}
        >
          <FileSearch size={12} /> ANALYSIS
        </button>
        <button 
          onClick={() => setMode('action')}
          className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-widest border-b-2 transition-all flex items-center justify-center gap-2 ${mode === 'action' ? 'border-red-500 text-red-600 bg-red-500/5' : 'border-transparent text-zinc-600 hover:text-slate-600'}`}
        >
          <Zap size={12} /> ACTION
        </button>
      </div>

      {/* MESSAGE AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'system' ? (
              <div className="w-full text-center py-2 border-y border-slate-100 bg-slate-100 text-[9px] font-mono text-slate-500 tracking-widest mb-4">
                {msg.content}
              </div>
            ) : (
              <div className={`max-w-[85%] border text-xs tracking-wide p-3 ${
                msg.role === 'user' 
                  ? 'bg-slate-50 border-slate-200 text-slate-800 rounded-l-lg rounded-tr-lg' 
                  : `rounded-r-lg rounded-tl-lg bg-white ${msg.mode === 'action' ? 'border-red-500/30 text-red-100' : msg.mode === 'analysis' ? 'border-amber-500/30 text-amber-100' : 'border-blue-500/30 text-blue-100'}`
              }`}>
                <div className="flex items-center gap-2 mb-1 border-b border-slate-200 pb-1">
                  {msg.role === 'user' ? <User size={10} className="text-slate-500"/> : <Bot size={10} className={msg.mode === 'action' ? 'text-red-500' : msg.mode === 'analysis' ? 'text-amber-500' : 'text-blue-500'}/>}
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-500">
                    {msg.role === 'user' ? 'ADMIN' : `SYSTEM / ${msg.mode?.toUpperCase()}`}
                  </span>
                </div>
                <div className="leading-relaxed font-mono whitespace-pre-wrap">
                  {msg.content}
                </div>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
                    {msg.attachments.map((file, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-[9px] text-slate-600 font-sans">
                        <Paperclip size={10} />
                        <span className="truncate max-w-[120px]">{file}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
        ))}
        {isTyping && (
          <div className="flex flex-col items-start">
             <div className="max-w-[85%] border text-xs tracking-wide p-3 rounded-r-lg rounded-tl-lg bg-white border-blue-500/30">
                <div className="flex items-center gap-2 mb-1 border-b border-slate-200 pb-1">
                  <Bot size={10} className="text-blue-500" />
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-500">
                    SYSTEM / PROCESSING
                  </span>
                </div>
                <div className="leading-relaxed font-mono whitespace-pre-wrap text-slate-500 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
             </div>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] text-slate-700">
                <span className="truncate max-w-[100px]">{file.name}</span>
                <button onClick={() => removeFile(index)} className="text-slate-500 hover:text-red-600"><X size={12} /></button>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={executeCommand} className="relative flex items-center">
          <label className="absolute left-3 p-1 text-slate-500 hover:text-slate-700 cursor-pointer">
            <Paperclip size={16} />
            <input type="file" multiple className="hidden" onChange={handleFileChange} />
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'chat' ? "Sistemle iletişim kurun..." : mode === 'analysis' ? "İncelenecek dosyayı seçin ve sorunuzu sorun..." : "Sistemi değiştirecek aksiyonu girin (Örn: Fix TRTEX)"}
            className="w-full bg-white border border-slate-200 rounded py-3 pl-10 pr-10 text-xs text-slate-900 placeholder:text-zinc-600 focus:outline-none focus:border-slate-300 font-mono"
          />
          <button type="submit" disabled={!input.trim() && files.length === 0} className={`absolute right-2 p-1.5 rounded transition-colors ${!input.trim() && files.length === 0 ? 'text-zinc-700' : 'bg-white text-black hover:bg-zinc-200'}`}>
            <Send size={14} />
          </button>
        </form>
      </div>

    </div>
  );
}
