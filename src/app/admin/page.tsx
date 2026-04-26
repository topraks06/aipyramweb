'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AipyramAuthProvider';
import { Send, Bot, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Merhaba ${user?.email || 'Yönetici'}, ben Mağaza Asistanınız. Bugün teslim edilecek 2 projeniz ve tahsil edilmesi gereken 15.000 TL bakiye var. Nasıl yardımcı olabilirim?` }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'Bu özellik şu an demo modundadır. Yakında tüm kayıtlı projeleriniz ve finans verileriniz üzerinden sorularınızı yanıtlayabileceğim.' 
      }]);
    }, 1000);
    
    setChatInput('');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col gap-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white mb-2">Mağaza <span className="font-bold text-emerald-500">Komuta Merkezi</span></h1>
          <p className="text-zinc-400">İşletmenizin genel durumu ve asistan iletişimi.</p>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><Clock className="w-6 h-6" /></div>
            <h3 className="text-zinc-400 font-medium tracking-wide">BEKLEYEN İŞLER</h3>
          </div>
          <p className="text-4xl font-light text-white">12 <span className="text-sm text-zinc-500">proje</span></p>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><CheckCircle2 className="w-6 h-6" /></div>
            <h3 className="text-zinc-400 font-medium tracking-wide">TAMAMLANAN (BU AY)</h3>
          </div>
          <p className="text-4xl font-light text-white">28 <span className="text-sm text-zinc-500">proje</span></p>
        </div>
        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><AlertCircle className="w-6 h-6" /></div>
            <h3 className="text-zinc-400 font-medium tracking-wide">BEKLEYEN TAHSİLAT</h3>
          </div>
          <p className="text-4xl font-light text-white">45.000 <span className="text-sm text-zinc-500">TL</span></p>
        </div>
      </div>

      {/* MAĞAZA ASİSTANI (DIGITAL TWIN) */}
      <div className="flex-1 min-h-[400px] bg-black/60 border border-white/10 rounded-3xl flex flex-col overflow-hidden backdrop-blur-xl relative">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
            <Bot className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-white font-medium">Mağaza Asistanı</h2>
            <p className="text-xs text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Aktif ve dinliyor
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-50 rounded-br-none' : 'bg-white/5 border border-white/10 text-zinc-300 rounded-bl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-black/50">
          <form onSubmit={handleSendMessage} className="relative">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Asistana bir komut ver veya soru sor... (Örn: Ahmet'in kaporası yattı mı?)" 
              className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-16 text-white outline-none focus:border-emerald-500/50 transition-colors"
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      </div>
      
    </div>
  );
}
