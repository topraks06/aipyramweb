'use client';

import React, { useState } from 'react';
import { Sparkles, Terminal } from 'lucide-react';

export default function AlohaInput({ onExecute }: { onExecute: (response: any) => void }) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    
    setIsProcessing(true);

    try {
      // API call to our new Command/Intent Route
      const res = await fetch('/api/aloha/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: input })
      });
      
      const data = await res.json();
      
      onExecute({
        id: Date.now().toString(),
        command: input,
        response: data,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
      });

    } catch (error) {
      onExecute({
        id: Date.now().toString(),
        command: input,
        response: { type: 'error', error: 'ALOHA Core ile bağlantı kesildi.' },
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
      });
    } finally {
      setIsProcessing(false);
      setInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative group">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-6 text-zinc-600">
          <Terminal className="w-6 h-6" />
        </div>
        
        <input 
          autoFocus
          disabled={isProcessing}
          className="w-full bg-zinc-900/50 backdrop-blur-xl border border-white/10 py-6 pl-16 pr-32 text-xl font-light text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600 disabled:opacity-50 shadow-2xl"
          placeholder="Sovereign, emrinizi bekliyorum..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        
        <div className="absolute right-6 flex items-center gap-4">
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-[10px] text-zinc-600 font-mono tracking-widest hidden sm:inline-block">
              ENTER TO EXECUTE
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
