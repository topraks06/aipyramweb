'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Terminal, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SovereignNodeId } from '@/lib/sovereign-config';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface Props {
  nodeId: SovereignNodeId;
  nodeName: string;
}

export default function TenantAlohaWidget({ nodeId, nodeName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: `Merhaba, ben ALOHA. ${nodeName} operasyonlarınızı otonom olarak yönetmek için buradayım. (Örn: "Bu ürünü tüm platformlarda yayınla" veya "Rapor ver")`,
    }
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const executeCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setIsTyping(true);

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
    }]);

    try {
      const res = await fetch('/api/aloha/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: userText, targetNode: nodeId })
      });

      const data = await res.json();
      setIsTyping(false);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: data.type === 'error' ? 'system' : 'assistant',
        content: data.alohaResponse || "Anlaşılamadı.",
      }]);
    } catch (err: any) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: `SİSTEM HATASI: ${err.message}`,
      }]);
    }
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-[100] font-sans"
          >
            {/* Header */}
            <div className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-950/50 border border-emerald-900/50 flex items-center justify-center">
                  <Bot size={16} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    ALOHA
                    <span className="bg-emerald-500/10 text-emerald-500 text-[9px] px-1.5 py-0.5 rounded font-mono">ONLINE</span>
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-widest">{nodeName} NODE</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 w-full ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center border ${
                    msg.role === 'user' ? 'bg-zinc-800 border-zinc-700' : 
                    msg.role === 'system' ? 'bg-red-950/30 border-red-900/50' : 
                    'bg-emerald-950/30 border-emerald-900/50'
                  }`}>
                    {msg.role === 'user' ? <User size={14} className="text-zinc-400" /> : 
                     msg.role === 'system' ? <Terminal size={14} className="text-red-500" /> : 
                     <Bot size={14} className="text-emerald-500" />}
                  </div>
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                    <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">
                      {msg.role === 'user' ? 'SİZ' : msg.role === 'system' ? 'SİSTEM' : 'ALOHA'}
                    </div>
                    <div className={`text-sm p-3 rounded-xl border ${
                      msg.role === 'user' ? 'bg-zinc-800/80 border-zinc-700 text-zinc-200 rounded-tr-sm' : 
                      msg.role === 'system' ? 'bg-red-950/30 border-red-900/50 text-red-200 rounded-tl-sm' : 
                      'bg-zinc-900 border-zinc-800 text-zinc-300 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 w-full">
                  <div className="w-8 h-8 rounded-full flex shrink-0 items-center justify-center border bg-emerald-950/30 border-emerald-900/50">
                    <Bot size={14} className="text-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex flex-col items-start max-w-[80%]">
                    <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">ALOHA</div>
                    <div className="text-sm p-3 rounded-xl border bg-zinc-900 border-zinc-800 text-zinc-400 rounded-tl-sm flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> İşleniyor...
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="p-3 bg-zinc-900 border-t border-zinc-800 shrink-0">
              <form onSubmit={executeCommand} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Bir komut girin..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-4 pr-12 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim() || isTyping}
                  className={`absolute right-2 p-1.5 rounded-lg transition-colors ${
                    !input.trim() || isTyping ? 'text-zinc-600 bg-transparent' : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-lg'
                  }`}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-zinc-900 border-2 border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 shadow-2xl hover:bg-emerald-950 hover:text-emerald-400 hover:border-emerald-500/50 hover:scale-105 transition-all duration-300 z-[90] group"
      >
        {isOpen ? <X size={24} className="group-hover:rotate-90 transition-transform duration-300" /> : (
          <div className="relative">
            <Sparkles size={24} />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
          </div>
        )}
      </button>
    </>
  );
}
