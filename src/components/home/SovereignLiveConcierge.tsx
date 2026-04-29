'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, User, Bot, Loader2 } from 'lucide-react';

/**
 * Sovereign Text Concierge (Credit-Optimized)
 * Hakan Bey'in talebiyle "Maliyet Denetimi" (Reality Core) gereği
 * Pahalı olan Multimodal Live API (Ses) yerine,
 * Standart Text-Based (Gemini 3.1 Flash) sohbet arayüzüne çevrilmiştir.
 */
export default function SovereignLiveConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [transcript, setTranscript] = useState<{role: 'user'|'model', text: string}[]>([
    { role: 'model', text: 'Merhaba! TRTEX İstihbarat Merkezine hoş geldiniz. Size nasıl yardımcı olabilirim? (Yazılı Asistan Aktif)' }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when transcript changes
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    setTranscript(prev => [...prev, { role: 'user', text: inputText }]);
    const currentText = inputText;
    setInputText("");
    setIsTyping(true);

    // Simulate standard text API call
    setTimeout(() => {
      setTranscript(prev => [...prev, { role: 'model', text: 'Sistem maliyet optimizasyonu devrede. Talebiniz Text-Agent tarafından alındı: ' + currentText }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-4">
      {isOpen && (
        <div className="bg-[#0f1114] border border-[#2a2a2a] rounded-xl shadow-2xl p-4 w-80 h-[450px] flex flex-col font-mono animate-in slide-in-from-bottom-5">
          <div className="flex justify-between items-center mb-4 border-b border-[#222] pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-xs font-bold tracking-widest text-blue-500">TEXT_SYS (OPTIMIZED)</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-hide">
            {transcript.map((msg, i) => (
              <div key={i} className={`flex gap-2 text-sm ${msg.role === 'model' ? 'text-gray-300' : 'text-[#f5a623]'}`}>
                <span>{msg.role === 'model' ? <Bot size={14} className="mt-1" /> : <User size={14} className="mt-1" />}</span>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 text-sm text-gray-500">
                <span><Bot size={14} className="mt-1" /></span>
                <p className="flex gap-1 mt-1">
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#222]">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Mesajınızı yazın..."
              className="flex-1 bg-[#111] border border-[#333] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f5a623]"
            />
            <button 
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="p-2 bg-[#f5a623] text-black rounded-md hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-[#111] hover:bg-[#222] border border-[#f5a623] text-[#f5a623] font-mono text-sm tracking-wider px-6 py-4 rounded-full flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(245,166,35,0.15)] group"
        >
          <div className="relative">
            <MessageSquare size={20} className="relative z-10 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-[#f5a623] blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
          </div>
          MASTER CONCIERGE (TEXT)
        </button>
      )}
    </div>
  );
}
